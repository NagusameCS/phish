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

  /* ---- 1. Disguise the URL bar ---- */
  // Use history.replaceState to hide the base64 hash
  // MUST use a relative path (no leading /) so CSS/JS resource paths stay valid
  try {
    const fakePath = (cfg.path || '/login').replace(/^\/+/, '') || 'login';
    history.replaceState(null, '', fakePath);
  } catch (_e) { /* replaceState may fail on some origins */ }

  /* ---- 2. Render branded fake login (always — serves as fallback) ---- */
  Decoy.render(cfg);

  /* ---- 2. Start site load + collection IN PARALLEL for speed ---- */
  const sitePromise = Decoy.loadRealSite(cfg);
  const dataPromise = Collector.collectAll();

  const mode = await sitePromise;
  console.log('[phish-training] decoy mode:', mode);

  /* ---- 4. Reveal trigger ---- */
  let revealed = false;

  const doReveal = async () => {
    if (revealed) return;
    revealed = true;

    // Ensure collection is done
    await dataPromise;

    // Snapshot behavioural data now
    Collector.snapshotBehavioural();

    // Add the mode to collected data so the reveal can mention it
    Collector.getData().decoyMode = mode;

    // Brief spinner
    Decoy.showSpinner(500, async () => {
      Decoy.hide();

      // === PANIC SWARM — alarm the user ===
      await Panic.run(Collector.getData());

      // === Then show the educational reveal ===
      Reveal.render(Collector.getData(), cfg.domain);
      Reveal.show();
    });
  };

  // In fake-login mode, also trigger on form submit
  if (mode === 'fake') {
    Decoy.bindForm(doReveal);
  }

  // Auto-reveal after a delay
  // Longer timeout when showing real site (user needs time to browse)
  const revealDelay = mode === 'fake' ? 12000 : 18000;
  setTimeout(doReveal, revealDelay);

  /* ---- 5. "Run Again" button ---- */
  document.getElementById('btnReset').addEventListener('click', () => {
    location.reload();
  });

})();


/* ============================================================
   Link Generator is now at generate.html
   ============================================================ */
