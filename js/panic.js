/* ============================================================
   panic.js — Spawns chaotic mini "browser windows" that swarm
   across the screen to alarm the user after being phished.
   Purely cosmetic DOM elements — no actual popups.
   ============================================================ */

const Panic = (() => {

  const MINI_COUNT    = 18;      // number of mini-windows
  const SWARM_MS      = 4500;    // how long the chaos lasts
  const SPAWN_STAGGER = 120;     // ms between each spawn

  /* Alarming messages shown in the mini windows */
  const MESSAGES = [
    '⚠️ YOUR DATA WAS COLLECTED',
    '🔓 BROWSER FINGERPRINTED',
    '📍 LOCATION EXPOSED',
    '🖥️ GPU IDENTIFIED',
    '🎤 MIC ACCESS DETECTED',
    '🔑 CREDENTIALS CAPTURED',
    '🕵️ IP ADDRESS LEAKED',
    '📱 DEVICE IDENTIFIED',
    '🧬 UNIQUE FINGERPRINT CREATED',
    '⌨️ KEYSTROKES LOGGED',
    '📡 NETWORK INFO HARVESTED',
    '🎨 CANVAS FINGERPRINT TAKEN',
    '🔊 AUDIO FINGERPRINT TAKEN',
    '📐 SCREEN SIZE RECORDED',
    '🕐 TIMEZONE DETECTED',
    '🔤 FONTS ENUMERATED',
    '🔋 BATTERY STATUS READ',
    '🤖 AUTOMATION CHECK RUN',
    '🗄️ STORAGE PROBED',
    '🐭 MOUSE TRACKED',
    '💾 50+ DATA POINTS STOLEN',
    '⛔ THIS WAS A PHISHING PAGE',
  ];

  /* Colour palette for window title bars */
  const COLOURS = [
    '#ff6b6b', '#e74c3c', '#ff4757', '#ff3838',
    '#ff6348', '#e84118', '#c0392b', '#d63031',
    '#e55039', '#eb2f06', '#b33939', '#cd6133',
  ];

  let _container = null;

  /* ==========================================================
     run(data) — Launch the panic swarm, returns a Promise that
     resolves when the animation is done
     ========================================================== */
  function run(data) {
    return new Promise(resolve => {
      // Create overlay container
      _container = document.createElement('div');
      _container.className = 'panic-overlay';
      document.body.appendChild(_container);

      // Build data snippets for some windows
      const snippets = buildSnippets(data);

      // Spawn windows with stagger
      const windows = [];
      for (let i = 0; i < MINI_COUNT; i++) {
        setTimeout(() => {
          const win = createMiniWindow(i, snippets);
          _container.appendChild(win);
          windows.push(win);

          // Trigger entrance animation on next frame
          requestAnimationFrame(() => {
            win.classList.add('panic-enter');
          });
        }, i * SPAWN_STAGGER);
      }

      // After swarm duration, clean up and resolve
      setTimeout(() => {
        // Fly all windows off-screen
        windows.forEach((win, i) => {
          setTimeout(() => {
            win.classList.add('panic-exit');
          }, i * 40);
        });

        // Remove container after exit animations
        setTimeout(() => {
          if (_container) {
            _container.remove();
            _container = null;
          }
          resolve();
        }, 800);
      }, SWARM_MS);
    });
  }

  /* ---------- Create a single mini window ---------- */
  function createMiniWindow(index, snippets) {
    const win = document.createElement('div');
    win.className = 'panic-window';

    // Random position
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = 220 + Math.random() * 140;   // 220-360px wide
    const h = 80 + Math.random() * 60;     // 80-140px tall
    const x = Math.random() * (vw - w);
    const y = Math.random() * (vh - h);
    const rot = (Math.random() - 0.5) * 20; // -10° to +10°
    const colour = COLOURS[index % COLOURS.length];

    win.style.cssText = `
      width: ${w}px; height: ${h}px;
      left: ${x}px; top: ${y}px;
      --panic-rot: ${rot}deg;
      --panic-colour: ${colour};
      animation-delay: ${Math.random() * 0.3}s;
    `;

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'panic-titlebar';
    titleBar.style.background = colour;

    const dots = document.createElement('div');
    dots.className = 'panic-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';

    const title = document.createElement('span');
    title.className = 'panic-title-text';
    title.textContent = '⚠ Alert';

    titleBar.appendChild(dots);
    titleBar.appendChild(title);
    win.appendChild(titleBar);

    // Body content
    const body = document.createElement('div');
    body.className = 'panic-body';

    // Alternate between alarm messages and real data snippets
    if (index < snippets.length && Math.random() > 0.3) {
      body.innerHTML = `<div class="panic-data">${snippets[index]}</div>`;
    } else {
      const msg = MESSAGES[index % MESSAGES.length];
      body.innerHTML = `<div class="panic-msg">${msg}</div>`;
    }

    win.appendChild(body);

    // Make it bounce around
    animateBounce(win, vw, vh, w, h);

    return win;
  }

  /* ---------- Bounce animation via JS ---------- */
  function animateBounce(el, vw, vh, w, h) {
    let x  = parseFloat(el.style.left);
    let y  = parseFloat(el.style.top);
    let dx = (1.5 + Math.random() * 2.5) * (Math.random() > 0.5 ? 1 : -1);
    let dy = (1.5 + Math.random() * 2.5) * (Math.random() > 0.5 ? 1 : -1);

    function step() {
      if (!_container) return;  // stopped

      x += dx;
      y += dy;

      // Bounce off edges
      if (x < 0)        { x = 0;        dx = Math.abs(dx); }
      if (x + w > vw)   { x = vw - w;   dx = -Math.abs(dx); }
      if (y < 0)        { y = 0;        dy = Math.abs(dy); }
      if (y + h > vh)   { y = vh - h;   dy = -Math.abs(dy); }

      el.style.left = x + 'px';
      el.style.top  = y + 'px';

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Build snippets from real data ---------- */
  function buildSnippets(data) {
    const snippets = [];
    const pick = (key, label) => {
      if (data[key] && data[key] !== 'n/a' && data[key] !== 'unknown') {
        snippets.push(`<strong>${label}:</strong> ${trunc(String(data[key]), 60)}`);
      }
    };

    pick('userAgent', 'Browser');
    pick('screenResolution', 'Screen');
    pick('timezone', 'Timezone');
    pick('hardwareConcurrency', 'CPU Cores');
    pick('deviceMemory', 'RAM');
    pick('webglRenderer', 'GPU');
    pick('canvasHash', 'Canvas FP');
    pick('audioHash', 'Audio FP');
    pick('fontCount', 'Fonts');
    pick('localIPs', 'IP Address');
    pick('connectionType', 'Network');
    pick('battery', 'Battery');
    pick('uaPlatform', 'Platform');
    pick('combinedFingerprint', 'Fingerprint');
    pick('webglVendor', 'GPU Vendor');
    pick('language', 'Language');
    pick('colorDepth', 'Color Depth');
    pick('pixelRatio', 'Pixel Ratio');

    return snippets;
  }

  function trunc(str, max) {
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  return { run };
})();
