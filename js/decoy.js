/* ============================================================
   decoy.js — Loads the REAL target site (or a convincing fake)
   ============================================================
   Strategy order (most reliable first):
     1. CORS-proxy fetch → grab HTML, inject <base> tag, render
        via srcdoc iframe. Most reliable — we know if it worked.
     2. Direct iframe  → pixel-perfect if site allows framing.
        Unreliable detection (X-Frame-Options blocks look like
        cross-origin loads) so tried second.
     3. Fallback fake login → generated branded login card.
   ============================================================ */

const Decoy = (() => {

  let _cfg   = null;
  let _mode  = 'fake';          // 'iframe' | 'proxy' | 'fake'
  let _frame = null;            // reference to the real-site iframe

  /* ---- CORS proxy services (tried in order) ---- */
  const CORS_PROXIES = [
    {
      name: 'allorigins',
      make: url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      parse: async resp => {
        const json = await resp.json();
        return json.contents || '';
      },
    },
    {
      name: 'corsproxy.io',
      make: url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
      parse: async resp => resp.text(),
    },
    {
      name: 'codetabs',
      make: url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      parse: async resp => resp.text(),
    },
    {
      name: 'corsproxy.org',
      make: url => `https://corsproxy.org/?${encodeURIComponent(url)}`,
      parse: async resp => resp.text(),
    },
  ];

  /* ==========================================================
     render() — Always sets up the branded fake login as a base
     ========================================================== */
  function render(cfg) {
    _cfg = cfg;

    // Page title
    document.title = `Sign in – ${cfg.orgName}`;

    // Logo — generate an SVG letter-icon with the brand colour
    const logo = document.getElementById('decoyLogo');
    const svg  = generateLogoSvg(cfg.logoLetter, cfg.brandColor);
    logo.src   = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

    // Title / subtitle
    document.getElementById('decoyTitle').textContent    = `Sign in to ${cfg.orgName}`;
    document.getElementById('decoySubtitle').textContent = `Use your ${cfg.orgName} account`;
    document.getElementById('decoyEmail').placeholder    = `user@${cfg.domain}`;

    // Footer
    document.getElementById('decoyFooter').innerHTML =
      `&copy; ${new Date().getFullYear()} ${cfg.orgName}. All rights reserved.`;

    // Accent colour on button
    const btn = document.getElementById('decoySubmit');
    btn.style.background = cfg.brandColor;

    // Favicon — try real favicon first, SVG fallback
    const fav = document.getElementById('favicon');
    const realFav = new Image();
    realFav.onload = () => { fav.href = realFav.src; };
    realFav.onerror = () => {
      fav.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    };
    realFav.src = `https://www.google.com/s2/favicons?domain=${cfg.domain}&sz=64`;
  }

  /* ==========================================================
     loadRealSite() — Try to overlay the actual target website
     ========================================================== */
  async function loadRealSite(cfg) {
    const targetUrl = `https://${cfg.domain}${cfg.path}`;
    log('Loading target:', targetUrl);

    // Show loading indicator
    showLoading(true);

    // Strategy 1: CORS proxy fetch → srcdoc (most reliable)
    try {
      const proxyOk = await tryProxyFetch(targetUrl, cfg.domain);
      if (proxyOk) {
        _mode = 'proxy';
        log('SUCCESS — mode: proxy');
        showLoading(false);
        return 'proxy';
      }
    } catch (e) {
      log('Proxy strategy threw:', e.message);
    }

    // Strategy 2: Direct iframe (works only if site allows framing)
    try {
      const iframeOk = await tryDirectIframe(targetUrl);
      if (iframeOk) {
        _mode = 'iframe';
        log('SUCCESS — mode: iframe');
        showLoading(false);
        return 'iframe';
      }
    } catch (e) {
      log('Iframe strategy threw:', e.message);
    }

    // Strategy 3: fake login is already rendered
    _mode = 'fake';
    log('All strategies failed — mode: fake (fallback)');
    showLoading(false);
    return 'fake';
  }

  /* ---------- Strategy 1: CORS proxy → srcdoc ---------- */
  async function tryProxyFetch(targetUrl, domain) {
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = proxy.make(targetUrl);
        log(`Trying proxy [${proxy.name}]:`, proxyUrl);

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 10000);

        const resp = await fetch(proxyUrl, {
          signal: ctrl.signal,
          headers: { 'Accept': 'text/html,application/json,*/*' },
        });
        clearTimeout(timer);

        if (!resp.ok) {
          log(`[${proxy.name}] HTTP ${resp.status}`);
          continue;
        }

        let html = await proxy.parse(resp);

        // Sanity checks
        if (!html || typeof html !== 'string') {
          log(`[${proxy.name}] Empty or non-string response`);
          continue;
        }

        if (html.length < 100) {
          log(`[${proxy.name}] Response too short (${html.length} chars)`);
          continue;
        }

        // Must look like HTML
        if (!/<html|<!doctype|<head|<body/i.test(html)) {
          log(`[${proxy.name}] Response doesn't look like HTML`);
          continue;
        }

        log(`[${proxy.name}] Got HTML (${html.length} chars) — rewriting...`);

        // Rewrite the HTML for safe local display
        html = injectBaseTag(html, domain);
        html = rewriteMetaTags(html);
        html = neuterForms(html);
        html = neutraliseScripts(html);

        // Create srcdoc iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'realSiteFrame';
        iframe.className = 'real-site-frame';
        iframe.sandbox = 'allow-same-origin';
        iframe.referrerPolicy = 'no-referrer';

        // Append first so it starts rendering
        document.getElementById('decoy').appendChild(iframe);
        iframe.srcdoc = html;

        // Wait for render
        await new Promise(r => {
          iframe.addEventListener('load', r, { once: true });
          setTimeout(r, 5000); // max wait 5s
        });

        _frame = iframe;
        iframe.classList.add('loaded');

        // Hide the fake login behind
        const body = document.querySelector('.decoy-body');
        if (body) body.style.display = 'none';

        log(`[${proxy.name}] Iframe rendered and visible`);
        return true;
      } catch (e) {
        log(`[${proxy.name}] Error:`, e.message);
        continue;
      }
    }
    return false;
  }

  /* ---------- Strategy 2: Direct iframe ---------- */
  function tryDirectIframe(url) {
    return new Promise(resolve => {
      log('Trying direct iframe...');

      const iframe = document.createElement('iframe');
      iframe.id = 'realSiteFrame';
      iframe.className = 'real-site-frame';
      iframe.referrerPolicy = 'no-referrer';
      iframe.loading = 'eager';
      // No sandbox — let the page render normally
      // (sandbox can cause subtle breakage with stylesheets and fonts)

      let settled = false;

      const succeed = () => {
        if (settled) return;
        settled = true;
        _frame = iframe;
        iframe.classList.add('loaded');
        const body = document.querySelector('.decoy-body');
        if (body) body.style.display = 'none';
        log('Direct iframe: success');
        resolve(true);
      };

      const fail = (reason) => {
        if (settled) return;
        settled = true;
        iframe.remove();
        log('Direct iframe: failed —', reason);
        resolve(false);
      };

      iframe.addEventListener('load', () => {
        // Wait a frame for rendering
        requestAnimationFrame(() => {
          try {
            // Try to peek at the frame content
            const doc = iframe.contentDocument;
            if (!doc || !doc.body) { fail('empty document'); return; }

            const text = (doc.body.innerText || '').trim();
            const children = doc.body.children.length;

            // Check for browser error pages (very short text, few elements)
            if (text.length < 5 && children < 3) {
              fail('looks like blank/error page');
              return;
            }

            // Readable + has content → same-origin page loaded correctly
            succeed();
          } catch (_e) {
            // SecurityError → cross-origin content loaded
            // This COULD be the real site OR an X-Frame-Options error page
            // We check the iframe dimensions as a heuristic:
            // Real sites typically render at full width; error pages may not
            // But this is unreliable, so we try a pixel test
            try {
              // If the iframe is completely blank (0x0), it's broken
              if (iframe.offsetWidth === 0 || iframe.offsetHeight === 0) {
                fail('zero-size frame (likely blocked)');
                return;
              }
              // Best effort — assume a rendered cross-origin frame = real site
              succeed();
            } catch (_e2) {
              fail('could not inspect frame');
            }
          }
        });
      });

      iframe.addEventListener('error', () => fail('error event'));

      // Timeout
      setTimeout(() => { if (!settled) fail('timeout (6s)'); }, 6000);

      document.getElementById('decoy').appendChild(iframe);
      iframe.src = url;
    });
  }

  /* ---------- HTML rewriting helpers ---------- */
  function injectBaseTag(html, domain) {
    const base = `https://${domain}`;
    const tag  = `<base href="${base}/" target="_self">`;
    // Remove any existing base tags first
    html = html.replace(/<base[^>]*>/gi, '');
    if (/<head[^>]*>/i.test(html)) {
      return html.replace(/<head[^>]*>/i, `$&\n${tag}`);
    }
    if (/<html[^>]*>/i.test(html)) {
      return html.replace(/<html[^>]*>/i, `$&\n<head>${tag}</head>`);
    }
    return `<head>${tag}</head>\n${html}`;
  }

  function rewriteMetaTags(html) {
    // Remove X-Frame-Options meta tags and CSP meta tags that might block rendering
    html = html.replace(/<meta[^>]*http-equiv\s*=\s*["']?X-Frame-Options["']?[^>]*>/gi, '');
    html = html.replace(/<meta[^>]*http-equiv\s*=\s*["']?Content-Security-Policy["']?[^>]*>/gi, '');
    // Remove any refresh/redirect meta tags
    html = html.replace(/<meta[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, '');
    return html;
  }

  function neuterForms(html) {
    return html
      .replace(/(<form[^>]*?)action\s*=\s*"[^"]*"/gi, '$1action="javascript:void(0)"')
      .replace(/(<form[^>]*?)action\s*=\s*'[^']*'/gi, "$1action='javascript:void(0)'");
  }

  function neutraliseScripts(html) {
    // Completely remove script tags and their content for clean rendering
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    // Also remove noscript content (show the underlying content)
    html = html.replace(/<\/?noscript[^>]*>/gi, '');
    return html;
  }

  /* ---------- SVG logo helper ---------- */
  function generateLogoSvg(letter, color) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
      <rect width="56" height="56" rx="12" fill="${color}"/>
      <text x="28" y="38" text-anchor="middle" font-size="30" font-weight="700"
            fill="#fff" font-family="sans-serif">${letter}</text>
    </svg>`;
  }

  /* ==========================================================
     UI helpers
     ========================================================== */

  /** Loading indicator */
  function showLoading(show) {
    let el = document.getElementById('decoyLoading');
    if (show) {
      if (!el) {
        el = document.createElement('div');
        el.id = 'decoyLoading';
        el.className = 'loading-bar';
        document.getElementById('decoy').prepend(el);
      }
      el.style.display = '';
    } else if (el) {
      el.remove();
    }
  }

  /** Show a brief spinner, then fire callback */
  function showSpinner(duration, cb) {
    const overlay = document.createElement('div');
    overlay.className = 'spinner-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.remove();
      cb();
    }, duration);
  }

  /** Wire up the fake form (only relevant in 'fake' mode) */
  function bindForm(onSubmit) {
    const form = document.getElementById('decoyForm');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        onSubmit();
      });
    }
  }

  /** Hide everything — decoy layer + real-site iframe */
  function hide() {
    document.getElementById('decoy').style.display = 'none';
    if (_frame) { _frame.remove(); _frame = null; }
  }

  /** Get the active mode for display */
  function getMode() { return _mode; }

  /** Console logger with prefix */
  function log(...args) {
    console.log('%c[phish-training]', 'color:#4a90d9;font-weight:bold', ...args);
  }

  return { render, loadRealSite, bindForm, showSpinner, hide, getMode };
})();
