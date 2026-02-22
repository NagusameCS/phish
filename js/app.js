/* ============================================================
   app.js — Main orchestrator
   ============================================================
   Flow:
   1. Read hash → decode target domain config
   2. If no hash, show the link-generator helper page
   3. Render decoy site with branding
   4. Start silent collection immediately
   5. After collection completes (or user interacts), reveal
   ============================================================ */

(async function main() {

  const cfg = PhishConfig.get();

  /* ---- No hash → show link generator helper ---- */
  if (!cfg) {
    showGenerator();
    return;
  }

  /* ---- 1. Render decoy ---- */
  Decoy.render(cfg);

  /* ---- 2. Start silent collection ---- */
  const dataPromise = Collector.collectAll();

  /* ---- 3. Wait for either: form submit OR a 12-second auto-reveal ---- */
  let revealed = false;

  const doReveal = async () => {
    if (revealed) return;
    revealed = true;

    // Ensure collection is done
    await dataPromise;

    // Snapshot behavioural data now
    Collector.snapshotBehavioural();

    // Brief spinner
    Decoy.showSpinner(800, () => {
      Decoy.hide();
      Reveal.render(Collector.getData(), cfg.domain);
      Reveal.show();
    });
  };

  // Trigger on form submit
  Decoy.bindForm(doReveal);

  // Auto-reveal after 15s in case user just browses but doesn't submit
  setTimeout(doReveal, 15000);

  /* ---- 4. "Run Again" button ---- */
  document.getElementById('btnReset').addEventListener('click', () => {
    location.reload();
  });

})();


/* ============================================================
   Link Generator — shown when no hash is present
   ============================================================ */
function showGenerator() {
  document.title = 'Phish Training — Link Generator';
  document.getElementById('decoy').innerHTML = '';
  document.getElementById('decoy').style.display = 'none';

  const wrap = document.createElement('div');
  wrap.style.cssText = `
    max-width: 640px; margin: 60px auto; padding: 32px;
    font-family: system-ui, sans-serif; color: #222;
  `;

  wrap.innerHTML = `
    <h1 style="margin-bottom:8px;">🎣 Phish Training — Link Generator</h1>
    <p style="color:#666;margin-bottom:24px;">
      Generate a training link that impersonates any domain.<br>
      Send the link to participants — all data stays in their browser.
    </p>

    <label style="font-weight:600;">Target domain</label>
    <input id="genDomain" type="text" placeholder="asf.edu.mx"
           style="width:100%;padding:10px 12px;font-size:15px;border:1px solid #ccc;border-radius:6px;margin:6px 0 16px;" />

    <label style="font-weight:600;">Organization name <small style="color:#999;">(optional)</small></label>
    <input id="genName" type="text" placeholder="ASF Portal"
           style="width:100%;padding:10px 12px;font-size:15px;border:1px solid #ccc;border-radius:6px;margin:6px 0 16px;" />

    <label style="font-weight:600;">Path <small style="color:#999;">(optional)</small></label>
    <input id="genPath" type="text" placeholder="/login" value="/login"
           style="width:100%;padding:10px 12px;font-size:15px;border:1px solid #ccc;border-radius:6px;margin:6px 0 24px;" />

    <button id="genBtn" style="padding:12px 28px;font-size:15px;font-weight:600;
      color:#fff;background:#4a90d9;border:none;border-radius:6px;cursor:pointer;">
      Generate Link
    </button>

    <div id="genResult" style="margin-top:24px;display:none;">
      <label style="font-weight:600;">Your training link:</label>
      <div style="margin-top:6px;padding:14px;background:#f0f4f8;border-radius:8px;
        font-family:monospace;font-size:14px;word-break:break-all;user-select:all;" id="genLink"></div>
      <button id="genCopy" style="margin-top:10px;padding:8px 20px;font-size:13px;
        background:#333;color:#fff;border:none;border-radius:6px;cursor:pointer;">
        Copy to clipboard
      </button>
    </div>
  `;

  document.body.appendChild(wrap);

  document.getElementById('genBtn').addEventListener('click', () => {
    const domain = document.getElementById('genDomain').value.trim();
    if (!domain) { alert('Enter a target domain.'); return; }
    const name = document.getElementById('genName').value.trim() || undefined;
    const path = document.getElementById('genPath').value.trim() || undefined;

    const hash = PhishConfig.generateHash(domain, name, path);
    const base = location.origin + location.pathname;
    const url  = base + '#' + hash;

    document.getElementById('genLink').textContent = url;
    document.getElementById('genResult').style.display = '';
  });

  document.getElementById('genCopy')?.addEventListener('click', () => {
    const text = document.getElementById('genLink').textContent;
    navigator.clipboard.writeText(text).then(() => {
      document.getElementById('genCopy').textContent = 'Copied ✓';
      setTimeout(() => { document.getElementById('genCopy').textContent = 'Copy to clipboard'; }, 2000);
    });
  });
}
