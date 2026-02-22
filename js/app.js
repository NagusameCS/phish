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

  /* ---- No hash → redirect to the dedicated link generator page ---- */
  if (!cfg) {
    window.location.replace('generate.html');
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
   Link Generator is now at generate.html
   ============================================================ */
