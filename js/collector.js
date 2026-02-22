/* ============================================================
   collector.js — Silently gathers every piece of information
   the browser exposes WITHOUT requiring any permission prompt.

   ALL DATA STAYS LOCAL.  Nothing is ever transmitted.
   ~50 collectors for maximum fingerprint surface.
   ============================================================ */

const Collector = (() => {
  const data = {};

  /* ====== 1. Navigator / UA basics ====== */
  function basics() {
    const n = navigator;
    data.userAgent         = n.userAgent;
    data.appVersion        = n.appVersion;
    data.platform          = n.platform;
    data.oscpu             = n.oscpu || 'unavailable';
    data.product           = n.product || 'unknown';
    data.productSub        = n.productSub || 'unknown';
    data.buildID           = n.buildID || 'unavailable';
    data.language          = n.language;
    data.languages         = (n.languages || []).join(', ');
    data.cookiesEnabled    = n.cookieEnabled;
    data.doNotTrack        = n.doNotTrack || 'unset';
    data.globalPrivacyControl = n.globalPrivacyControl ?? 'unsupported';
    data.hardwareConcurrency = n.hardwareConcurrency || 'unknown';
    data.deviceMemory      = n.deviceMemory ? n.deviceMemory + ' GB' : 'unknown';
    data.maxTouchPoints    = n.maxTouchPoints || 0;
    data.vendor            = n.vendor || 'unknown';
    data.vendorSub         = n.vendorSub || 'empty';
    data.pdfViewerEnabled  = n.pdfViewerEnabled ?? 'unknown';
    data.webdriver         = n.webdriver ? 'YES (automated!)' : 'no';
    data.javaEnabled       = typeof n.javaEnabled === 'function' ? n.javaEnabled() : 'unknown';

    // UA Client Hints (Chromium)
    if (n.userAgentData) {
      const ua = n.userAgentData;
      data.uaBrands    = ua.brands ? ua.brands.map(b => b.brand + ' v' + b.version).join(', ') : 'n/a';
      data.uaPlatform  = ua.platform || 'n/a';
      data.uaMobile    = ua.mobile;
    }

    // Connection
    const c = n.connection || n.mozConnection || n.webkitConnection;
    if (c) {
      data.connectionType    = c.effectiveType || c.type || 'unknown';
      data.connectionDown    = c.downlink != null ? c.downlink + ' Mbps' : 'unknown';
      data.connectionRtt     = c.rtt != null ? c.rtt + ' ms' : 'unknown';
      data.saveData          = c.saveData ?? 'unknown';
    }
  }

  /* ====== 2. Screen & window ====== */
  function screenInfo() {
    const s = window.screen;
    data.screenResolution  = s.width + ' × ' + s.height;
    data.availResolution   = s.availWidth + ' × ' + s.availHeight;
    data.colorDepth        = s.colorDepth + '-bit';
    data.pixelDepth        = s.pixelDepth + '-bit';
    data.pixelRatio        = window.devicePixelRatio;
    data.windowSize        = window.innerWidth + ' × ' + window.innerHeight;
    data.outerSize         = window.outerWidth + ' × ' + window.outerHeight;
    data.screenOrientation = (s.orientation && s.orientation.type) || 'unknown';
    data.screenLeft        = window.screenLeft ?? window.screenX ?? 'unknown';
    data.screenTop         = window.screenTop ?? window.screenY ?? 'unknown';

    // Multi-monitor hint: if avail != screen, the window is offset
    data.isMultiMonitorHint = (s.availWidth !== s.width || s.availHeight !== s.height) ? 'likely (taskbar/dock detected)' : 'single screen or identical';
  }

  /* ====== 3. Timezone & locale ====== */
  function timezone() {
    const opts = Intl.DateTimeFormat().resolvedOptions();
    data.timezone         = opts.timeZone;
    data.timezoneOffset   = 'UTC' + (new Date().getTimezoneOffset() <= 0 ? '+' : '-') +
                            String(Math.abs(new Date().getTimezoneOffset() / 60)).padStart(2, '0') + ':00';
    data.locale           = opts.locale;
    data.calendar         = opts.calendar || 'unknown';
    data.numberingSystem  = opts.numberingSystem || 'unknown';
    data.localTime        = new Date().toString();
    data.performanceNow   = performance.now().toFixed(3) + ' ms';

    // Date format fingerprint
    try {
      const df = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
      data.dateFormatSample = df.format(new Date(2000, 0, 1));
    } catch { data.dateFormatSample = 'error'; }

    // Number format fingerprint
    try {
      data.numberFormatSample = new Intl.NumberFormat().format(1234567.89);
    } catch { data.numberFormatSample = 'error'; }

    // Currency format fingerprint
    try {
      data.currencyFormatSample = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(1234.56);
    } catch { data.currencyFormatSample = 'error'; }

    // List of supported locales (deduces OS locale list)
    try {
      const testLocales = ['en-US','en-GB','es-MX','es-ES','fr-FR','de-DE','ja-JP','zh-CN','zh-TW','ko-KR','pt-BR','ru-RU','ar-SA','hi-IN','it-IT','nl-NL','sv-SE','pl-PL','tr-TR','th-TH'];
      const supported = testLocales.filter(l => {
        try { return Intl.DisplayNames.supportedLocalesOf(l).length > 0; } catch { return false; }
      });
      data.supportedLocales = supported.join(', ');
    } catch { data.supportedLocales = 'unavailable'; }
  }

  /* ====== 4. Canvas fingerprint ====== */
  function canvasFingerprint() {
    try {
      const c = document.createElement('canvas');
      c.width = 300; c.height = 80;
      const ctx = c.getContext('2d');

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 300, 0);
      grad.addColorStop(0, '#ff6b6b'); grad.addColorStop(1, '#4ecdc4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 300, 80);

      // Draw text with various fonts
      ctx.textBaseline = 'top';
      ctx.font = '14px "Arial"';
      ctx.fillStyle = '#069';
      ctx.fillText('PhishTrainer! 🐟 <canvas> fp', 2, 5);
      ctx.fillStyle = 'rgba(102,204,0,0.7)';
      ctx.font = 'bold 16px "Times New Roman"';
      ctx.fillText('Cwm fjord bank vex quiz 0123', 4, 22);

      // Shapes
      ctx.beginPath();
      ctx.arc(250, 45, 22, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,0,128,0.5)';
      ctx.fill();

      // Bezier curve
      ctx.beginPath();
      ctx.moveTo(10, 60);
      ctx.bezierCurveTo(50, 30, 100, 70, 150, 50);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Emoji rendering (very fingerprint-unique across OS)
      ctx.font = '20px serif';
      ctx.fillText('🏴‍☠️🐱‍💻🇲🇽', 160, 50);

      data.canvasDataUrl = c.toDataURL();
      data.canvasHash    = simpleHash(data.canvasDataUrl);
    } catch (e) {
      data.canvasFingerprint = 'blocked';
    }
  }

  /* ====== 5. WebGL fingerprint (deep) ====== */
  function webgl() {
    try {
      const c   = document.createElement('canvas');
      const gl  = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) { data.webglRenderer = 'unavailable'; return; }

      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      data.webglVendor   = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)   : gl.getParameter(gl.VENDOR);
      data.webglRenderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      data.webglVersion  = gl.getParameter(gl.VERSION);

      // Max capabilities
      data.webglMaxTextureSize     = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      data.webglMaxViewportDims    = gl.getParameter(gl.MAX_VIEWPORT_DIMS)?.join(' × ');
      data.webglShadingLanguage    = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
      data.webglMaxRenderbuffer    = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
      data.webglMaxCubeMapTexture  = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
      data.webglMaxVertexAttribs   = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
      data.webglMaxVaryingVectors  = gl.getParameter(gl.MAX_VARYING_VECTORS);
      data.webglMaxVertexUniforms  = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
      data.webglMaxFragUniforms    = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
      data.webglMaxVertexTextures  = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
      data.webglMaxTexImageUnits   = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      data.webglMaxCombTexUnits    = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
      data.webglAliasedLineRange   = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)?.join(' – ');
      data.webglAliasedPointRange  = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)?.join(' – ');
      data.webglAntialiasing       = gl.getContextAttributes()?.antialias ?? 'unknown';
      data.webglStencilBits        = gl.getParameter(gl.STENCIL_BITS);
      data.webglDepthBits          = gl.getParameter(gl.DEPTH_BITS);

      // Extension list
      const exts = gl.getSupportedExtensions() || [];
      data.webglExtensionCount = exts.length;
      data.webglExtensions     = exts.join(', ');

      // WebGL2 parameters
      try {
        const gl2 = document.createElement('canvas').getContext('webgl2');
        if (gl2) {
          data.webgl2MaxSamples         = gl2.getParameter(gl2.MAX_SAMPLES);
          data.webgl2Max3dTextureSize    = gl2.getParameter(gl2.MAX_3D_TEXTURE_SIZE);
          data.webgl2MaxArrayTexLayers   = gl2.getParameter(gl2.MAX_ARRAY_TEXTURE_LAYERS);
          data.webgl2MaxDrawBuffers      = gl2.getParameter(gl2.MAX_DRAW_BUFFERS);
          data.webgl2MaxColorAttachments = gl2.getParameter(gl2.MAX_COLOR_ATTACHMENTS);
          data.webgl2MaxTransformFBVaryings = gl2.getParameter(gl2.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS);
        }
      } catch {}

      // WebGL image hash (renders a scene & hashes it)
      try {
        c.width = 64; c.height = 64;
        const gl3 = c.getContext('webgl');
        if (gl3) {
          gl3.clearColor(0.2, 0.4, 0.6, 1.0);
          gl3.clear(gl3.COLOR_BUFFER_BIT);
          data.webglImageHash = simpleHash(c.toDataURL());
        }
      } catch {}
    } catch (e) {
      data.webglRenderer = 'error';
    }
  }

  /* ====== 6. AudioContext fingerprint ====== */
  function audioFingerprint() {
    return new Promise(resolve => {
      try {
        const AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!AudioCtx) { data.audioFingerprint = 'unavailable'; return resolve(); }

        // Probe audio parameters
        try {
          const actx = new (window.AudioContext || window.webkitAudioContext)();
          data.audioSampleRate = actx.sampleRate;
          data.audioBaseLatency = actx.baseLatency ?? 'unknown';
          data.audioOutputLatency = actx.outputLatency ?? 'unknown';
          data.audioState = actx.state;
          data.audioMaxChannels = actx.destination.maxChannelCount;
          actx.close().catch(() => {});
        } catch {}

        const ctx  = new AudioCtx(1, 44100, 44100);
        const osc  = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(10000, ctx.currentTime);

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-50, ctx.currentTime);
        comp.knee.setValueAtTime(40, ctx.currentTime);
        comp.ratio.setValueAtTime(12, ctx.currentTime);
        comp.attack.setValueAtTime(0, ctx.currentTime);
        comp.release.setValueAtTime(0.25, ctx.currentTime);

        osc.connect(comp);
        comp.connect(ctx.destination);
        osc.start(0);
        ctx.startRendering();

        ctx.oncomplete = event => {
          const buf = event.renderedBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 4500; i < 5000; i++) sum += Math.abs(buf[i]);
          data.audioFingerprint = sum.toString();
          data.audioHash        = simpleHash(data.audioFingerprint);
          resolve();
        };

        setTimeout(() => {
          if (!data.audioFingerprint) { data.audioFingerprint = 'timeout'; resolve(); }
        }, 800);
      } catch (e) {
        data.audioFingerprint = 'error';
        resolve();
      }
    });
  }

  /* ====== 7. WebRTC local IP leak ====== */
  function webrtcIPs() {
    return new Promise(resolve => {
      data.localIPs = [];
      try {
        const RTC = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        if (!RTC) { data.localIPs = ['unavailable']; return resolve(); }

        const pc = new RTC({ iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]});
        const ips = new Set();
        const candidates = [];

        pc.onicecandidate = e => {
          if (!e || !e.candidate || !e.candidate.candidate) {
            data.localIPs = [...ips].length ? [...ips] : ['hidden / not discovered'];
            data.iceCandidates = candidates.length ? candidates.join('\n') : 'none';
            pc.close();
            return resolve();
          }
          const raw = e.candidate.candidate;
          candidates.push(raw);
          const parts = raw.split(' ');
          const ip = parts[4];
          if (ip && (ip.indexOf('.') > -1 || ip.indexOf(':') > -1)) {
            ips.add(ip);
          }
          // Extract candidate type
          const typeIdx = parts.indexOf('typ');
          if (typeIdx > -1) {
            const ctype = parts[typeIdx + 1]; // host, srflx, relay
            ips.add(ip + ' (' + ctype + ')');
          }
        };

        pc.createDataChannel('');
        pc.createOffer().then(o => pc.setLocalDescription(o)).catch(() => {
          data.localIPs = ['error'];
          resolve();
        });

        setTimeout(() => {
          if (!data.localIPs.length) {
            data.localIPs = [...ips].length ? [...ips] : ['timeout'];
            data.iceCandidates = candidates.length ? candidates.join('\n') : 'timeout';
            try { pc.close(); } catch {}
            resolve();
          }
        }, 1500);
      } catch (e) {
        data.localIPs = ['error'];
        resolve();
      }
    });
  }

  /* ====== 8. Battery status ====== */
  function battery() {
    return new Promise(resolve => {
      if (!navigator.getBattery) { data.battery = 'unavailable'; return resolve(); }
      navigator.getBattery().then(b => {
        data.battery = {
          charging: b.charging,
          level:    Math.round(b.level * 100) + '%',
          chargingTime:    b.chargingTime === Infinity ? '∞' : b.chargingTime + 's',
          dischargingTime: b.dischargingTime === Infinity ? '∞' : b.dischargingTime + 's',
        };
        resolve();
      }).catch(() => { data.battery = 'blocked'; resolve(); });
    });
  }

  /* ====== 9. Installed fonts (expanded list) ====== */
  function detectFonts() {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = [
      // Windows
      'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math',
      'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
      'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'Impact',
      'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode',
      'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei',
      'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif',
      'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB',
      'Mongolian Baiti', 'MS Gothic', 'MS PGothic', 'MV Boli', 'Myanmar Text',
      'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print',
      'Segoe Script', 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Historic',
      'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma',
      'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
      // macOS
      'American Typewriter', 'Andale Mono', 'Apple Braille', 'Apple Chancery',
      'Apple Color Emoji', 'Apple SD Gothic Neo', 'AppleGothic', 'AppleMyungjo',
      'Avenir', 'Avenir Next', 'Baskerville', 'Big Caslon', 'Bodoni 72',
      'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkduster', 'Charter',
      'Cochin', 'Copperplate', 'Corsiva Hebrew', 'Courier', 'DIN Alternate',
      'Futura', 'Geneva', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum',
      'Hiragino Sans', 'Hoefler Text', 'Kailasa', 'Kohinoor Devanagari',
      'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Monaco', 'Noteworthy',
      'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'PingFang SC', 'Plantagenet Cherokee',
      'Rockwell', 'San Francisco', 'Savoye LET', 'Skia', 'Snell Roundhand',
      'STHeiti', 'STSong', 'Sukhumvit Set', 'Superclarendon', 'Thonburi',
      'Trattatello', 'Zapfino',
      // Linux
      'Cantarell', 'DejaVu Sans', 'DejaVu Sans Mono', 'DejaVu Serif', 'Droid Sans',
      'Droid Sans Mono', 'Droid Serif', 'FreeMono', 'FreeSans', 'FreeSerif',
      'Liberation Mono', 'Liberation Sans', 'Liberation Serif', 'Noto Sans',
      'Noto Serif', 'Roboto', 'Ubuntu', 'Ubuntu Mono',
      // Common web fonts that might be installed locally
      'Century Gothic', 'Garamond', 'Book Antiqua', 'Bookman Old Style',
      'Century', 'Copperplate Gothic', 'Eras ITC', 'Freestyle Script',
      'Harlow Solid Italic', 'Haettenschweiler', 'Informal Roman',
      'Lucida Handwriting', 'Magneto', 'Mistral', 'Modern No. 20',
      'Niagara Engraved', 'Old English Text MT', 'Parchment', 'Playbill',
      'Pristina', 'Rage Italic', 'Ravie', 'Script MT Bold', 'Showcard Gothic',
      'Snap ITC', 'Stencil', 'Tempus Sans ITC', 'Viner Hand ITC', 'Vivaldi',
    ];

    const body = document.body;
    const span = document.createElement('span');
    span.textContent = 'mmmmmmmmmmlli';
    span.style.fontSize = '72px';
    span.style.position = 'absolute';
    span.style.left = '-9999px';
    span.style.top = '-9999px';
    span.style.visibility = 'hidden';

    const baseWidths = {};
    body.appendChild(span);
    baseFonts.forEach(f => {
      span.style.fontFamily = f;
      baseWidths[f] = { w: span.offsetWidth, h: span.offsetHeight };
    });

    const detected = [];
    testFonts.forEach(font => {
      for (const base of baseFonts) {
        span.style.fontFamily = `"${font}", ${base}`;
        if (span.offsetWidth !== baseWidths[base].w || span.offsetHeight !== baseWidths[base].h) {
          detected.push(font);
          break;
        }
      }
    });
    body.removeChild(span);

    data.detectedFonts = detected.join(', ') || 'none detected';
    data.fontCount     = detected.length;
    data.fontHash      = simpleHash(data.detectedFonts);
  }

  /* ====== 10. Storage & feature probes (expanded) ====== */
  function storageProbes() {
    data.localStorageAvail  = !!window.localStorage;
    data.sessionStorageAvail = !!window.sessionStorage;
    data.indexedDBAvail     = !!window.indexedDB;
    data.serviceWorkerAvail = !!navigator.serviceWorker;
    data.webWorkersAvail    = !!window.Worker;
    data.sharedWorkerAvail  = !!window.SharedWorker;
    data.webSocketAvail     = !!window.WebSocket;
    data.webAssemblyAvail   = !!window.WebAssembly;
    data.notificationPerm   = ('Notification' in window) ? Notification.permission : 'unavailable';
    data.clipboardAPIAvail  = !!navigator.clipboard;
    data.geolocationAvail   = !!navigator.geolocation;
    data.bluetoothAvail     = !!navigator.bluetooth;
    data.usbAvail           = !!navigator.usb;
    data.serialAvail        = !!navigator.serial;
    data.hidAvail           = !!navigator.hid;
    data.nfcAvail           = !!(window.NDEFReader);
    data.gamepadsAvail      = !!navigator.getGamepads;
    data.mediaDevicesAvail  = !!navigator.mediaDevices;
    data.speechSynthAvail   = !!window.speechSynthesis;
    data.speechRecogAvail   = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    data.webGLAvail         = !!document.createElement('canvas').getContext('webgl');
    data.webGL2Avail        = !!document.createElement('canvas').getContext('webgl2');
    data.webGPUAvail        = !!navigator.gpu;
    data.webXRAvail         = !!navigator.xr;
    data.webMIDIAvail       = !!navigator.requestMIDIAccess;
    data.wakeLockAvail      = !!navigator.wakeLock;
    data.shareAvail         = !!navigator.share;
    data.credentialsAvail   = !!navigator.credentials;
    data.paymentAvail       = !!window.PaymentRequest;
    data.webAuthnAvail      = !!window.PublicKeyCredential;
    data.intersectionObsAvail = !!window.IntersectionObserver;
    data.resizeObsAvail     = !!window.ResizeObserver;
    data.performanceObsAvail = !!window.PerformanceObserver;
    data.broadcastChannelAvail = !!window.BroadcastChannel;
    data.cacheAPIAvail      = !!window.caches;
    data.cryptoSubtleAvail  = !!(window.crypto && window.crypto.subtle);

    // Probe storage quota
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(est => {
        data.storageQuota = Math.round((est.quota || 0) / 1048576) + ' MB';
        data.storageUsage = Math.round((est.usage || 0) / 1048576) + ' MB';
      }).catch(() => {});
    }
  }

  /* ====== 11. Plugins / mimeTypes (legacy) ====== */
  function pluginsProbe() {
    const list = [];
    if (navigator.plugins) {
      for (let i = 0; i < navigator.plugins.length; i++) {
        const p = navigator.plugins[i];
        let entry = p.name;
        if (p.description) entry += ' (' + p.description + ')';
        list.push(entry);
      }
    }
    data.plugins = list.join(', ') || 'none / hidden';

    // MIME types
    const mimes = [];
    if (navigator.mimeTypes) {
      for (let i = 0; i < navigator.mimeTypes.length; i++) {
        mimes.push(navigator.mimeTypes[i].type);
      }
    }
    data.mimeTypes = mimes.join(', ') || 'none / hidden';
  }

  /* ====== 12. Media capabilities (expanded) ====== */
  function mediaCapabilities() {
    const v = document.createElement('video');
    const videoCodecs = {
      'H.264 Baseline':  'video/mp4; codecs="avc1.42E01E"',
      'H.264 High':      'video/mp4; codecs="avc1.64001E"',
      'H.264 High 4:4:4':'video/mp4; codecs="avc1.644033"',
      'H.265/HEVC':      'video/mp4; codecs="hev1.1.6.L93.B0"',
      'H.266/VVC':       'video/mp4; codecs="vvc1.1.L51.CQA.O1"',
      'VP8':             'video/webm; codecs="vp8"',
      'VP9':             'video/webm; codecs="vp9"',
      'VP9 Profile 2':   'video/webm; codecs="vp09.02.10.10"',
      'AV1':             'video/mp4; codecs="av01.0.01M.08"',
      'AV1 HDR':         'video/mp4; codecs="av01.0.09M.10.0.112.09.16.09.0"',
      'Theora':          'video/ogg; codecs="theora"',
    };
    const supported = [];
    for (const [name, mime] of Object.entries(videoCodecs)) {
      const s = v.canPlayType(mime);
      if (s === 'probably' || s === 'maybe') supported.push(name + ' (' + s + ')');
    }
    data.videoCodecs = supported.join(', ') || 'none';

    const a = document.createElement('audio');
    const audioCodecs = {
      'AAC':       'audio/mp4; codecs="mp4a.40.2"',
      'MP3':       'audio/mpeg',
      'Opus':      'audio/ogg; codecs="opus"',
      'Vorbis':    'audio/ogg; codecs="vorbis"',
      'FLAC':      'audio/flac',
      'WAV/PCM':   'audio/wav; codecs="1"',
      'WebM Opus': 'audio/webm; codecs="opus"',
      'AC-3':      'audio/mp4; codecs="ac-3"',
      'E-AC-3':    'audio/mp4; codecs="ec-3"',
    };
    const audioSupported = [];
    for (const [name, mime] of Object.entries(audioCodecs)) {
      const s = a.canPlayType(mime);
      if (s === 'probably' || s === 'maybe') audioSupported.push(name);
    }
    data.audioCodecs = audioSupported.join(', ') || 'none';

    // DRM support
    if (navigator.requestMediaKeySystemAccess) {
      const drmSystems = {
        'Widevine':     'com.widevine.alpha',
        'PlayReady':    'com.microsoft.playready',
        'ClearKey':     'org.w3.clearkey',
        'FairPlay':     'com.apple.fps.1_0',
      };
      const drmChecks = Object.entries(drmSystems).map(([name, keySystem]) => {
        return navigator.requestMediaKeySystemAccess(keySystem, [{
          initDataTypes: ['cenc'],
          videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
        }]).then(() => name).catch(() => null);
      });
      Promise.all(drmChecks).then(results => {
        data.drmSupport = results.filter(Boolean).join(', ') || 'none';
      }).catch(() => { data.drmSupport = 'error'; });
    }

    // MediaSource support
    data.mediaSourceAvail = !!window.MediaSource;
    if (window.MediaSource) {
      data.mediaSourceH264 = MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E"');
      data.mediaSourceVP9 = MediaSource.isTypeSupported('video/webm; codecs="vp9"');
      data.mediaSourceAV1 = MediaSource.isTypeSupported('video/mp4; codecs="av01.0.01M.08"');
    }
  }

  /* ====== 13. Behavioural tracking (enhanced) ====== */
  function behavioural() {
    const tracking = {
      mousePositions: [],
      clicks: [],
      keystrokes: 0,
      keystrokeTimings: [],
      scrollEvents: 0,
      scrollPositions: [],
      touchEvents: 0,
      focusChanges: 0,
      tabHidden: 0,
      resizes: 0,
      startTime: Date.now(),
      lastKeystrokeTime: 0,
      copyEvents: 0,
      pasteEvents: 0,
      rightClicks: 0,
    };

    const sample = (arr, item, limit = 100) => {
      if (arr.length < limit) arr.push(item);
    };

    document.addEventListener('mousemove', e => {
      sample(tracking.mousePositions, { x: e.clientX, y: e.clientY, t: Date.now() - tracking.startTime });
    }, { passive: true });

    document.addEventListener('click', e => {
      sample(tracking.clicks, {
        x: e.clientX, y: e.clientY,
        target: e.target.tagName + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + String(e.target.className).split(' ')[0] : ''),
        t: Date.now() - tracking.startTime,
      });
    }, { passive: true });

    document.addEventListener('contextmenu', () => { tracking.rightClicks++; }, { passive: true });

    document.addEventListener('keydown', () => {
      const now = Date.now();
      if (tracking.lastKeystrokeTime) {
        sample(tracking.keystrokeTimings, now - tracking.lastKeystrokeTime, 50);
      }
      tracking.lastKeystrokeTime = now;
      tracking.keystrokes++;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      tracking.scrollEvents++;
      sample(tracking.scrollPositions, { x: window.scrollX, y: window.scrollY, t: Date.now() - tracking.startTime });
    }, { passive: true });

    document.addEventListener('touchstart', () => { tracking.touchEvents++; }, { passive: true });

    window.addEventListener('focus', () => { tracking.focusChanges++; });
    window.addEventListener('blur', () => { tracking.focusChanges++; });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) tracking.tabHidden++;
    });

    window.addEventListener('resize', () => { tracking.resizes++; });

    document.addEventListener('copy', () => { tracking.copyEvents++; });
    document.addEventListener('paste', () => { tracking.pasteEvents++; });

    data._behaviouralRef = tracking;
  }

  /* ====== 14. Referrer & navigation (expanded) ====== */
  function navigation() {
    data.referrer        = document.referrer || 'none (direct / hidden)';
    data.historyLength   = window.history.length;
    data.documentURL     = document.URL;
    data.documentDomain  = document.domain || 'n/a';
    data.windowName      = window.name || 'empty';
    data.frameDepth      = (function() { let d = 0; let w = window; while (w !== w.parent) { d++; w = w.parent; if (d > 10) break; } return d; })();
    data.isInsideIframe  = window.self !== window.top;
    data.openerExists    = !!window.opener;
    data.ancestorOrigins = (location.ancestorOrigins) ? Array.from(location.ancestorOrigins).join(', ') || 'none' : 'unavailable';

    const perf = performance.getEntriesByType('navigation')[0];
    if (perf) {
      data.navigationType        = perf.type;
      data.pageLoadTime          = Math.round(perf.loadEventEnd - perf.startTime) + ' ms';
      data.dnsLookup             = Math.round(perf.domainLookupEnd - perf.domainLookupStart) + ' ms';
      data.connectionTime        = Math.round(perf.connectEnd - perf.connectStart) + ' ms';
      data.tlsNegotiation        = Math.round((perf.secureConnectionStart > 0 ? perf.connectEnd - perf.secureConnectionStart : 0)) + ' ms';
      data.ttfb                  = Math.round(perf.responseStart - perf.requestStart) + ' ms';
      data.domInteractive        = Math.round(perf.domInteractive - perf.startTime) + ' ms';
      data.domContentLoaded      = Math.round(perf.domContentLoadedEventEnd - perf.startTime) + ' ms';
      data.transferSize          = perf.transferSize ? perf.transferSize + ' bytes' : 'unknown';
      data.encodedBodySize       = perf.encodedBodySize ? perf.encodedBodySize + ' bytes' : 'unknown';
      data.decodedBodySize       = perf.decodedBodySize ? perf.decodedBodySize + ' bytes' : 'unknown';
      data.protocol              = perf.nextHopProtocol || 'unknown';
      data.redirectCount         = perf.redirectCount ?? 'unknown';
    }
  }

  /* ====== 15. Ad-blocker detection ====== */
  function adBlockDetect() {
    return new Promise(resolve => {
      const bait = document.createElement('div');
      bait.className = 'adsbox ad-placement ad-banner textads banner-ads';
      bait.style.cssText = 'position:absolute;top:-1px;left:-1px;width:1px;height:1px;';
      bait.innerHTML = '&nbsp;';
      document.body.appendChild(bait);

      // Also try creating a fake ad script
      const baitScript = document.createElement('div');
      baitScript.id = 'AdContainer';
      baitScript.style.cssText = 'position:absolute;top:-1px;left:-1px;width:1px;height:1px;';
      baitScript.innerHTML = '<div class="ad-wrapper"><div class="ad_unit"></div></div>';
      document.body.appendChild(baitScript);

      requestAnimationFrame(() => {
        const divBlocked = (bait.offsetHeight === 0 || bait.clientHeight === 0);
        const scriptBlocked = (baitScript.offsetHeight === 0 || !baitScript.querySelector('.ad_unit'));
        data.adBlocker = (divBlocked || scriptBlocked) ? 'likely active' : 'not detected';
        bait.remove();
        baitScript.remove();
        resolve();
      });
    });
  }

  /* ====== 16. Permissions API probing (expanded) ====== */
  async function permissionsProbe() {
    if (!navigator.permissions) { data.permissions = 'API unavailable'; return; }
    const names = [
      'geolocation', 'notifications', 'camera', 'microphone',
      'accelerometer', 'gyroscope', 'magnetometer',
      'clipboard-read', 'clipboard-write',
      'push', 'midi', 'background-sync', 'ambient-light-sensor',
      'background-fetch', 'persistent-storage', 'screen-wake-lock',
      'display-capture', 'idle-detection', 'storage-access',
      'window-management', 'local-fonts',
    ];
    const results = {};
    await Promise.all(names.map(name =>
      navigator.permissions.query({ name })
        .then(s => { results[name] = s.state; })
        .catch(() => { results[name] = 'unsupported'; })
    ));
    data.permissions = results;
  }

  /* ====== 17. Dark mode & media prefs (expanded) ====== */
  function mediaPrefs() {
    const mq = (q) => window.matchMedia(q).matches;
    data.prefersColorScheme   = mq('(prefers-color-scheme: dark)') ? 'dark' : (mq('(prefers-color-scheme: light)') ? 'light' : 'no-preference');
    data.prefersReducedMotion = mq('(prefers-reduced-motion: reduce)');
    data.prefersContrast      = mq('(prefers-contrast: more)') ? 'more' : (mq('(prefers-contrast: less)') ? 'less' : 'no-preference');
    data.prefersReducedData   = mq('(prefers-reduced-data: reduce)') ? 'reduce' : 'no-preference';
    data.prefersTransparency  = mq('(prefers-reduced-transparency: reduce)') ? 'reduce' : 'no-preference';
    data.forcedColors         = mq('(forced-colors: active)') ? 'active' : 'none';
    data.invertedColors       = mq('(inverted-colors: inverted)') ? 'yes' : 'no';
    data.hdrScreen            = mq('(dynamic-range: high)') ? 'HDR' : 'SDR';
    data.displayMode          = mq('(display-mode: standalone)') ? 'standalone (PWA)' :
                                mq('(display-mode: fullscreen)') ? 'fullscreen' :
                                mq('(display-mode: minimal-ui)') ? 'minimal-ui' : 'browser tab';
    data.pointerType          = mq('(pointer: fine)') ? 'fine (mouse)' :
                                mq('(pointer: coarse)') ? 'coarse (touch)' : 'none';
    data.hoverCapability      = mq('(hover: hover)') ? 'yes (mouse)' : 'no (touch)';
    data.anyPointer           = mq('(any-pointer: fine)') ? 'has fine pointer' :
                                mq('(any-pointer: coarse)') ? 'coarse only' : 'none';
    data.anyHover             = mq('(any-hover: hover)') ? 'has hover device' : 'no hover';
    data.colorGamut           = mq('(color-gamut: p3)') ? 'P3 (wide)' :
                                mq('(color-gamut: srgb)') ? 'sRGB' : 'unknown';
    data.monochrome           = mq('(monochrome)') ? 'yes' : 'no';
  }

  /* ====== 18. CSS feature detection ====== */
  function cssFeatures() {
    const supports = (prop, val) => CSS.supports ? CSS.supports(prop, val) : 'unknown';
    data.cssGrid         = supports('display', 'grid');
    data.cssSubgrid      = supports('grid-template-columns', 'subgrid');
    data.cssContainerQ   = supports('container-type', 'inline-size');
    data.cssNesting      = supports('selector(&)', '*');
    data.cssHas          = supports('selector(:has(*))');
    data.cssAccentColor  = supports('accent-color', 'auto');
    data.cssBackdropFilter = supports('backdrop-filter', 'blur(1px)');
    data.cssAspectRatio  = supports('aspect-ratio', '1/1');
    data.cssScrollSnap   = supports('scroll-snap-type', 'x mandatory');
    data.cssLayerSupport = supports('@layer', 'base');
  }

  /* ====== 19. Speech synthesis voices ====== */
  function speechVoices() {
    return new Promise(resolve => {
      try {
        if (!window.speechSynthesis) { data.speechVoices = 'unavailable'; return resolve(); }
        const grab = () => {
          const voices = speechSynthesis.getVoices();
          if (voices.length) {
            data.speechVoices = voices.map(v => v.name + ' [' + v.lang + ']' + (v.localService ? ' (local)' : ' (remote)')).join(', ');
            data.speechVoiceCount = voices.length;
            data.speechVoiceHash  = simpleHash(data.speechVoices);
            resolve();
          }
        };
        grab();
        if (!data.speechVoices) {
          speechSynthesis.onvoiceschanged = () => { grab(); resolve(); };
          setTimeout(() => { if (!data.speechVoices) { data.speechVoices = 'none loaded'; resolve(); } }, 600);
        }
      } catch { data.speechVoices = 'error'; resolve(); }
    });
  }

  /* ====== 20. Math & JS engine fingerprint ====== */
  function mathFingerprint() {
    data.mathTan   = Math.tan(-1e300).toString();
    data.mathAcos  = Math.acos(0.123456789).toString();
    data.mathSinh  = Math.sinh(1).toString();
    data.mathExpm1 = Math.expm1(1).toString();
    data.mathLog1p = Math.log1p(0.5).toString();
    data.mathAtan2 = Math.atan2(Math.PI, Math.E).toString();
    data.mathCbrt  = Math.cbrt(100).toString();
    data.mathPow   = Math.pow(Math.PI, -100).toString();
    data.mathHash  = simpleHash([
      data.mathTan, data.mathAcos, data.mathSinh, data.mathExpm1,
      data.mathLog1p, data.mathAtan2, data.mathCbrt, data.mathPow,
    ].join('|'));

    // Error.stack format reveals engine / browser
    try {
      null[0]();
    } catch (e) {
      data.errorStackSignature = e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : 'unavailable';
    }

    // toString behaviour fingerprint
    data.evalToString = eval.toString().length;
    data.fnToString   = (function(){}).toString().length;
  }

  /* ====== 21. Input device enumeration (no permission needed for labels) ====== */
  function inputDevices() {
    return new Promise(resolve => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        data.mediaDevices = 'unavailable';
        return resolve();
      }
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const grouped = { audioinput: 0, audiooutput: 0, videoinput: 0 };
        devices.forEach(d => {
          if (grouped[d.kind] !== undefined) grouped[d.kind]++;
        });
        data.audioInputCount  = grouped.audioinput;
        data.audioOutputCount = grouped.audiooutput;
        data.videoInputCount  = grouped.videoinput;
        data.mediaDeviceIds   = devices.map(d => d.kind + ':' + (d.deviceId ? d.deviceId.slice(0, 12) + '…' : 'none')).join(', ');
        resolve();
      }).catch(() => { data.mediaDevices = 'blocked'; resolve(); });
    });
  }

  /* ====== 22. Crypto & random fingerprint ====== */
  function cryptoFingerprint() {
    try {
      // Random UUID tells us crypto is functioning
      if (crypto.randomUUID) {
        data.cryptoUuid = crypto.randomUUID();
      }
      // Subtle crypto algorithms
      if (crypto.subtle) {
        data.cryptoSubtle = 'available';
      }
    } catch { data.cryptoUuid = 'blocked'; }
  }

  /* ====== 23. Page visibility & focus state ====== */
  function visibilityState() {
    data.documentVisibility = document.visibilityState;
    data.documentHasFocus   = document.hasFocus();
    data.windowFocused      = document.hasFocus();
  }

  /* ====== 24. DOM properties fingerprint ====== */
  function domFingerprint() {
    // Count available properties on key objects
    data.navigatorPropCount = Object.getOwnPropertyNames(navigator.__proto__).length;
    data.windowPropCount    = Object.getOwnPropertyNames(window).length;
    data.documentPropCount  = Object.getOwnPropertyNames(document.__proto__).length;
    data.globalThisKeys     = Object.keys(window).length;

    // Detect headless/automation
    data.chromeObj         = !!window.chrome;
    data.phantomJS         = !!window._phantom || !!window.callPhantom;
    data.seleniumDriver    = !!window.__selenium_evaluate || !!document.__selenium_unwrapped || !!window.__fxdriver_evaluate;
    data.headlessChrome    = /HeadlessChrome/.test(navigator.userAgent);
    data.automationDetected = (navigator.webdriver || data.phantomJS || data.seleniumDriver || data.headlessChrome) ? 'YES — likely automated' : 'no signs detected';

    // iframe / sandbox detection
    data.sandboxed = (function() {
      try { document.domain; return 'no'; } catch { return 'possibly sandboxed'; }
    })();
  }

  /* ====== 25. Touch & pointer details ====== */
  function touchDetails() {
    data.touchSupport   = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    data.touchMaxPoints = navigator.maxTouchPoints || 0;
    data.pointerEvents  = !!window.PointerEvent;
    data.msPointerEvents = !!window.MSPointerEvent;
  }

  /* ====== 26. Installed browser features / protocols ====== */
  function protocolHandlers() {
    // Check which protocol handlers are registered (by attempting navigation detection)
    const protocols = [];
    const testLink = document.createElement('a');

    // We can't actually test protocol handlers without navigation,
    // but we can detect some hints
    data.registerProtocolAvail = !!navigator.registerProtocolHandler;

    // Detect PDF inline support
    const embed = document.createElement('embed');
    embed.type = 'application/pdf';
    data.inlinePdfSupport = embed.type === 'application/pdf' ? 'likely' : 'no';
  }

  /* ====== 27. Performance & timing deep-dive ====== */
  function performanceDeep() {
    // Memory (Chrome only)
    if (performance.memory) {
      data.jsHeapSizeLimit = Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB';
      data.jsHeapUsed      = Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB';
      data.jsHeapTotal     = Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB';
    }

    // Resource timing
    const resources = performance.getEntriesByType('resource');
    data.resourceCount = resources.length;
    data.resourceTypes = [...new Set(resources.map(r => r.initiatorType))].join(', ');

    // Long tasks (if available)
    data.perfTimingAvail = !!performance.getEntriesByType;
    data.perfNowResolution = (() => {
      const times = [];
      let last = performance.now();
      for (let i = 0; i < 100; i++) {
        const now = performance.now();
        if (now !== last) { times.push(now - last); last = now; }
      }
      if (!times.length) return 'unknown';
      return Math.min(...times).toFixed(6) + ' ms (min delta)';
    })();

    // High-res timer availability
    data.performanceTimeOrigin = performance.timeOrigin ? new Date(performance.timeOrigin).toISOString() : 'unknown';
  }

  /* ====== 28. Installed keyboard layouts / input methods ====== */
  function keyboardInfo() {
    if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
      navigator.keyboard.getLayoutMap().then(layoutMap => {
        const entries = [];
        layoutMap.forEach((val, key) => { entries.push(key + '→' + val); });
        data.keyboardLayout = entries.slice(0, 30).join(', ');
        data.keyboardLayoutSize = layoutMap.size;
      }).catch(() => { data.keyboardLayout = 'blocked'; });
    } else {
      data.keyboardLayout = 'API unavailable';
    }
  }

  /* ====== 29. Gyroscope / Accelerometer probe (no permission) ====== */
  function motionSensors() {
    data.deviceMotionAvail       = !!window.DeviceMotionEvent;
    data.deviceOrientationAvail  = !!window.DeviceOrientationEvent;
    data.absoluteOrientationAvail = !!window.AbsoluteOrientationSensor;
    data.linearAccelAvail        = !!window.LinearAccelerationSensor;
    data.gravitySensorAvail      = !!window.GravitySensor;
    data.ambientLightAvail       = !!window.AmbientLightSensor;
    data.proximitySensorAvail    = !!window.ProximitySensor;
  }

  /* ====== 30. Canvas 2D + text metrics fingerprint ====== */
  function textMetricsFingerprint() {
    try {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      ctx.font = '16px Arial';
      const m = ctx.measureText('The quick brown fox jumps over the lazy dog 0123456789');
      data.textMetricsWidth          = m.width;
      data.textMetricsActualAscent   = m.actualBoundingBoxAscent;
      data.textMetricsActualDescent  = m.actualBoundingBoxDescent;
      data.textMetricsAlphaAscent    = m.alphabeticBaseline ?? 'unknown';
      data.textMetricsHash           = simpleHash('' + m.width + m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
    } catch { data.textMetricsHash = 'error'; }
  }

  /* ====== 31. Clipboard / selection state ====== */
  function clipboardState() {
    try {
      data.selectionText = window.getSelection()?.toString() || 'nothing selected';
    } catch { data.selectionText = 'blocked'; }
  }

  /* ====== 32. WebGL render hash (scene fingerprint) ====== */
  function webglRenderHash() {
    try {
      const c = document.createElement('canvas');
      c.width = 128; c.height = 128;
      const gl = c.getContext('webgl');
      if (!gl) return;

      // Create shaders
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');
      gl.compileShader(vs);

      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, 'precision mediump float;void main(){gl_FragColor=vec4(0.86,0.27,0.33,1.0);}');
      gl.compileShader(fs);

      const prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs);
      gl.linkProgram(prog); gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0.8, -0.8, -0.8, 0.8, -0.8]), gl.STATIC_DRAW);

      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      gl.clearColor(0.1, 0.2, 0.3, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      data.webglRenderHash = simpleHash(c.toDataURL());
    } catch { data.webglRenderHash = 'error'; }
  }

  /* ====== 33. Network info deep (public IP via WebRTC, protocol) ====== */
  function networkDeep() {
    data.onLine      = navigator.onLine;
    data.protocol    = location.protocol;
    data.hostname    = location.hostname;
    data.port        = location.port || 'default';
    data.secureContext = window.isSecureContext;
    data.crossOriginIsolated = window.crossOriginIsolated ?? 'unknown';
  }

  /* ====== 34. IndexedDB / storage fingerprint ====== */
  function storageFingerprint() {
    return new Promise(resolve => {
      try {
        const req = indexedDB.open('_fp_test', 1);
        req.onupgradeneeded = e => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('test')) {
            db.createObjectStore('test');
          }
        };
        req.onsuccess = e => {
          const db = e.target.result;
          data.indexedDBVersion = db.version;
          data.indexedDBName    = db.name;
          db.close();
          // Clean up
          indexedDB.deleteDatabase('_fp_test');
          resolve();
        };
        req.onerror = () => { data.indexedDB = 'error'; resolve(); };
      } catch { data.indexedDB = 'blocked'; resolve(); }
    });
  }

  /* ====== 35. High-entropy UA Client Hints (Chromium) ====== */
  function highEntropyHints() {
    return new Promise(resolve => {
      if (!navigator.userAgentData || !navigator.userAgentData.getHighEntropyValues) {
        data.highEntropyHints = 'unavailable';
        return resolve();
      }
      navigator.userAgentData.getHighEntropyValues([
        'architecture', 'bitness', 'model', 'platformVersion',
        'fullVersionList', 'wow64', 'formFactor',
      ]).then(h => {
        data.cpuArchitecture  = h.architecture || 'unknown';
        data.cpuBitness       = h.bitness || 'unknown';
        data.deviceModel      = h.model || 'unknown';
        data.platformVersion  = h.platformVersion || 'unknown';
        data.wow64            = h.wow64 ?? 'unknown';
        data.formFactor       = h.formFactor?.join(', ') || 'unknown';
        data.fullVersionList  = (h.fullVersionList || []).map(b => b.brand + ' v' + b.version).join(', ');
        resolve();
      }).catch(() => { data.highEntropyHints = 'denied'; resolve(); });
    });
  }

  /* ====== 36. Emoji rendering fingerprint ====== */
  function emojiFingerprint() {
    try {
      const c = document.createElement('canvas');
      c.width = 200; c.height = 40;
      const ctx = c.getContext('2d');
      ctx.textBaseline = 'top'; ctx.font = '24px serif';
      // Different OS render these emojis very differently
      ctx.fillText('🏴‍☠️🐱‍💻🫠🧑‍💻🏳️‍🌈🫶🏽', 0, 0);
      data.emojiRenderHash = simpleHash(c.toDataURL());
    } catch { data.emojiRenderHash = 'error'; }
  }

  /* ====== 37. Canvas blend modes & composite fingerprint ====== */
  function canvasAdvanced() {
    try {
      const c = document.createElement('canvas');
      c.width = 60; c.height = 60;
      const ctx = c.getContext('2d');

      // Composite operations fingerprint
      const ops = ['source-over','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity'];
      const supportedOps = ops.filter(op => { ctx.globalCompositeOperation = op; return ctx.globalCompositeOperation === op; });
      data.canvasCompositeOps = supportedOps.length + '/' + ops.length;

      // Canvas filter support
      ctx.filter = 'blur(1px)';
      data.canvasFilterSupport = (ctx.filter === 'blur(1px)');

      // Line dash fingerprint
      ctx.setLineDash([5, 3]);
      data.canvasLineDashSupport = ctx.getLineDash().length > 0;

      // Context attributes
      const settings = ctx.getContextAttributes?.() || {};
      data.canvas2dAlpha        = settings.alpha ?? 'unknown';
      data.canvas2dDesync       = settings.desynchronized ?? 'unknown';
      data.canvas2dWillReadFreq = settings.willReadFrequently ?? 'unknown';

      // OffscreenCanvas support
      data.offscreenCanvasAvail = !!window.OffscreenCanvas;

      // ImageBitmap
      data.imageBitmapAvail = !!window.createImageBitmap;
    } catch { data.canvasAdvanced = 'error'; }
  }

  /* ====== 38. WebGL shader precision format fingerprint ====== */
  function webglPrecision() {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl');
      if (!gl) return;

      const precisions = {};
      const types = [gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT, gl.LOW_INT, gl.MEDIUM_INT, gl.HIGH_INT];
      const names = ['lowFloat', 'medFloat', 'highFloat', 'lowInt', 'medInt', 'highInt'];
      const shaders = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER];
      const shaderNames = ['vertex', 'fragment'];

      shaderNames.forEach((sn, si) => {
        names.forEach((pn, pi) => {
          const p = gl.getShaderPrecisionFormat(shaders[si], types[pi]);
          if (p) precisions[sn + '_' + pn] = `range:[${p.rangeMin},${p.rangeMax}] prec:${p.precision}`;
        });
      });
      data.webglPrecisionFormats = Object.entries(precisions).map(([k,v]) => k + '=' + v).join(' | ');
    } catch { data.webglPrecisionFormats = 'error'; }
  }

  /* ====== 39. Collation / string sorting fingerprint ====== */
  function collationFingerprint() {
    try {
      const testStrings = ['ä', 'a', 'z', 'ö', 'ñ', 'ü', 'é', 'å', 'ø', '0', '9'];
      data.collationOrder = [...testStrings].sort((a, b) => a.localeCompare(b)).join('');
      data.collationHash  = simpleHash(data.collationOrder);

      // Relative time format
      try {
        const rtf = new Intl.RelativeTimeFormat();
        data.relTimeFormat = rtf.format(-1, 'day');
      } catch { data.relTimeFormat = 'unavailable'; }

      // Plural rules
      try {
        const pr = new Intl.PluralRules();
        data.pluralCategories = pr.resolvedOptions().pluralCategories?.join(', ') || 'unknown';
      } catch { data.pluralCategories = 'unavailable'; }

      // List format
      try {
        const lf = new Intl.ListFormat();
        data.listFormatSample = lf.format(['A', 'B', 'C']);
      } catch { data.listFormatSample = 'unavailable'; }
    } catch {}
  }

  /* ====== 40. JS language feature probing ====== */
  function jsFeatures() {
    data.bigIntSupport      = typeof BigInt !== 'undefined';
    data.weakRefSupport     = typeof WeakRef !== 'undefined';
    data.finalizationReg    = typeof FinalizationRegistry !== 'undefined';
    data.structuredCloneAvail = typeof structuredClone === 'function';
    data.atobAvail          = typeof atob === 'function';
    data.proxySupport       = typeof Proxy !== 'undefined';
    data.symbolSupport      = typeof Symbol !== 'undefined';
    data.iteratorSupport    = typeof Symbol !== 'undefined' && typeof Symbol.iterator !== 'undefined';
    data.asyncGenerators    = (function() { try { eval('(async function*(){})'); return true; } catch { return false; } })();
    data.optionalChaining   = (function() { try { eval('null?.x'); return true; } catch { return false; } })();
    data.nullishCoalescing  = (function() { try { eval('null ?? 1'); return true; } catch { return false; } })();
    data.topLevelAwaitHint  = typeof document.currentScript === 'object' ? 'classic script' : 'module';
    data.arrayAtSupport     = typeof Array.prototype.at === 'function';
    data.objectHasOwn       = typeof Object.hasOwn === 'function';
    data.errorCauseSupport  = (function() { try { new Error('', { cause: 'x' }); return true; } catch { return false; } })();
    data.regexpLookbehind   = (function() { try { new RegExp('(?<=x)'); return true; } catch { return false; } })();

    // SharedArrayBuffer (COOP/COEP indicator)
    data.sharedArrayBufferAvail = typeof SharedArrayBuffer !== 'undefined';
    data.atomicsAvail           = typeof Atomics !== 'undefined';

    // Scheduler API
    data.schedulerAvail = !!window.scheduler;

    // Web Locks API
    data.webLocksAvail = !!(navigator.locks);

    // Compression Streams
    data.compressionStreamAvail = !!window.CompressionStream;
    data.decompStreamAvail      = !!window.DecompressionStream;
  }

  /* ====== 41. Shape Detection APIs ====== */
  function shapeDetectionAPIs() {
    data.barcodeDetectorAvail = !!window.BarcodeDetector;
    data.faceDetectorAvail    = !!window.FaceDetector;
    data.textDetectorAvail    = !!window.TextDetector;
    data.eyeDropperAvail      = !!window.EyeDropper;

    // Get supported barcode formats
    if (window.BarcodeDetector && BarcodeDetector.getSupportedFormats) {
      BarcodeDetector.getSupportedFormats().then(f => {
        data.barcodeFormats = f.join(', ');
      }).catch(() => {});
    }
  }

  /* ====== 42. Web Vitals / Paint Timing ====== */
  function paintTiming() {
    try {
      const paints = performance.getEntriesByType('paint');
      paints.forEach(p => {
        if (p.name === 'first-paint') data.firstPaint = Math.round(p.startTime) + ' ms';
        if (p.name === 'first-contentful-paint') data.firstContentfulPaint = Math.round(p.startTime) + ' ms';
      });

      // Long Animation Frames (if available)
      const longFrames = performance.getEntriesByType('long-animation-frame');
      data.longAnimFrameCount = longFrames?.length ?? 'unavailable';

      // LCP observer (already fired by now)
      if (window.PerformanceObserver) {
        try {
          const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
          if (lcpEntries && lcpEntries.length) {
            data.largestContentfulPaint = Math.round(lcpEntries[lcpEntries.length - 1].startTime) + ' ms';
          }
        } catch {}

        // Layout shift
        try {
          const lsEntries = performance.getEntriesByType('layout-shift');
          if (lsEntries && lsEntries.length) {
            const cls = lsEntries.reduce((s, e) => s + (e.hadRecentInput ? 0 : e.value), 0);
            data.cumulativeLayoutShift = cls.toFixed(4);
          }
        } catch {}
      }
    } catch {}
  }

  /* ====== 43. SVG rendering fingerprint ====== */
  function svgFingerprint() {
    try {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100'); svg.setAttribute('height', '50');
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '5'); text.setAttribute('y', '30');
      text.setAttribute('font-size', '16'); text.setAttribute('font-family', 'serif');
      text.textContent = 'Fingerprint';
      svg.appendChild(text);
      document.body.appendChild(svg);

      const bbox = text.getBBox();
      data.svgTextBBox = `${bbox.x.toFixed(2)},${bbox.y.toFixed(2)},${bbox.width.toFixed(2)},${bbox.height.toFixed(2)}`;
      data.svgTextLength = text.getComputedTextLength()?.toFixed(2) || 'unknown';

      document.body.removeChild(svg);
    } catch { data.svgFingerprint = 'error'; }
  }

  /* ====== 44. Audio destinations & supported constraints ====== */
  function audioDeep() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints) {
        const c = navigator.mediaDevices.getSupportedConstraints();
        data.mediaConstraints = Object.keys(c).filter(k => c[k]).join(', ');
        data.mediaConstraintCount = Object.keys(c).filter(k => c[k]).length;
      }
    } catch {}
  }

  /* ====== 45. Window / Document feature detection ====== */
  function windowFeatures() {
    data.visualViewportAvail = !!window.visualViewport;
    if (window.visualViewport) {
      data.visualViewportScale = window.visualViewport.scale;
      data.visualViewportSize  = window.visualViewport.width + ' × ' + window.visualViewport.height;
    }
    data.customElementsAvail = !!window.customElements;
    data.shadowDOMAvail      = !!Element.prototype.attachShadow;
    data.dialogElementAvail  = typeof HTMLDialogElement !== 'undefined';
    data.popoverAvail        = typeof HTMLElement.prototype.showPopover === 'function';
    data.viewTransitionAvail = !!document.startViewTransition;
    data.highlightAvail      = !!CSS.highlights;
    data.trustedTypesAvail   = !!window.TrustedTypes || !!window.trustedTypes;
    data.sanitizerAvail      = !!window.Sanitizer;
    data.adoptedStylesAvail  = !!document.adoptedStyleSheets;
    data.cssTypedOMAvail     = !!window.CSSStyleValue;
    data.registerPropertyAvail = !!(CSS.registerProperty);

    // Presentation API
    data.presentationAvail = !!navigator.presentation;

    // File System Access API
    data.fileSystemAccessAvail = !!window.showOpenFilePicker;

    // Contact Picker API
    data.contactPickerAvail = !!navigator.contacts;

    // Compute Pressure API
    data.computePressureAvail = !!window.PressureObserver;

    // Navigation API
    data.navigationAPIAvail = !!window.navigation;

    // Screen orientation lock
    data.orientationLockAvail = !!(screen.orientation && screen.orientation.lock);

    // Cookie Store API
    data.cookieStoreAvail = !!window.cookieStore;

    // Web Transport
    data.webTransportAvail = !!window.WebTransport;

    // Reporting API
    data.reportingObserverAvail = !!window.ReportingObserver;

    // Content Visibility
    data.contentVisibilityAvail = CSS.supports ? CSS.supports('content-visibility', 'auto') : 'unknown';
  }

  /* ====== 46. Colour profile & HDR capabilities ====== */
  function colorProfile() {
    try {
      // Read a canvas pixel with specific color to detect profile
      const c = document.createElement('canvas');
      c.width = 1; c.height = 1;
      const ctx = c.getContext('2d', { colorSpace: 'display-p3' });
      if (ctx && ctx.getContextAttributes) {
        data.canvasColorSpace = ctx.getContextAttributes().colorSpace || 'srgb';
      } else {
        data.canvasColorSpace = 'srgb (default)';
      }
    } catch { data.canvasColorSpace = 'srgb (fallback)'; }

    // Screen color space hints via media queries
    const gamuts = ['rec2020', 'p3', 'srgb'];
    for (const g of gamuts) {
      if (window.matchMedia(`(color-gamut: ${g})`).matches) {
        data.maxColorGamut = g;
        break;
      }
    }
  }

  /* ====== 47. Installed PWA / app state detection ====== */
  function appState() {
    data.isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    data.isPWA        = data.isStandalone;
    data.beforeInstallPromptAvail = 'onbeforeinstallprompt' in window;

    // Document state
    data.documentReadyState  = document.readyState;
    data.documentCharset     = document.characterSet || document.charset;
    data.documentDir         = document.dir || document.documentElement.dir || 'ltr';
    data.documentContentType = document.contentType || 'unknown';
    data.documentDesignMode  = document.designMode;
    data.documentLastModified = document.lastModified;
    data.documentCompatMode  = document.compatMode;
  }

  /* ====== 48. Resource / fetch timing for cross-site probing ====== */
  function resourceProbing() {
    return new Promise(resolve => {
      // Try to measure timing of loading a well-known resource
      // This can reveal if certain sites are cached (i.e. recently visited)
      const resources = performance.getEntriesByType('resource');
      const summary = {};
      resources.forEach(r => {
        const type = r.initiatorType || 'other';
        summary[type] = (summary[type] || 0) + 1;
      });
      data.resourceBreakdown = Object.entries(summary).map(([k,v]) => k + ':' + v).join(', ');

      // Total bytes transferred
      const totalBytes = resources.reduce((s, r) => s + (r.transferSize || 0), 0);
      data.totalBytesTransferred = totalBytes + ' bytes';

      // Check for cached favicons hint
      const imgTest = new Image();
      const start = performance.now();
      imgTest.onload = imgTest.onerror = () => {
        data.faviconProbeMs = Math.round(performance.now() - start) + ' ms';
        resolve();
      };
      // Load a known 1x1 px — timing reveals cache state
      imgTest.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

      setTimeout(resolve, 500);
    });
  }

  /* ====== 49. CSS.escape / unique selectors ====== */
  function cssAdvanced() {
    data.cssEscapeAvail = typeof CSS.escape === 'function';
    // More CSS feature checks
    if (CSS.supports) {
      data.cssHasSelector     = CSS.supports('selector(:has(*))');
      data.cssIsSelector      = CSS.supports('selector(:is(*))');
      data.cssWhereSelector   = CSS.supports('selector(:where(*))');
      data.cssFocusVisible    = CSS.supports('selector(:focus-visible)');
      data.cssFocusWithin     = CSS.supports('selector(:focus-within)');
      data.cssLogicalProps     = CSS.supports('margin-inline-start', '0px');
      data.cssClamp           = CSS.supports('width', 'clamp(1px, 2px, 3px)');
      data.cssAtProperty      = CSS.supports('animation-timeline', 'scroll()');
      data.cssScrollTimeline  = CSS.supports('animation-timeline', 'scroll()');
      data.cssAnchorPos       = CSS.supports('position-anchor', '--x');
      data.cssPopoverAttr     = CSS.supports('selector(:popover-open)');
      data.cssIndeterminate   = CSS.supports('selector(:indeterminate)');
      data.cssStartingStyle   = CSS.supports('selector(@starting-style)');
      data.cssLightDark       = CSS.supports('color', 'light-dark(black, white)');
      data.cssRelativeColor   = CSS.supports('color', 'rgb(from red r g b)');
      data.cssContainerUnits  = CSS.supports('width', '1cqw');
      data.cssMathFunctions   = CSS.supports('width', 'round(1px, 1px)');
    }
  }

  /* ====== 50. Comprehensive fingerprint hash ====== */
  function computeFingerprint() {
    const signals = [
      data.userAgent, data.platform, data.language, data.timezone,
      data.screenResolution, data.colorDepth, data.pixelRatio,
      data.hardwareConcurrency, data.deviceMemory,
      data.canvasHash, data.audioHash, data.fontHash,
      data.webglRenderer, data.webglVendor, data.webglRenderHash,
      data.textMetricsHash, data.mathHash, data.speechVoiceHash,
      data.detectedFonts, data.errorStackSignature,
      data.pointerType, data.hoverCapability,
      data.prefersColorScheme, data.hdrScreen,
      data.emojiRenderHash, data.collationHash, data.svgTextBBox,
      data.webglPrecisionFormats, data.cpuArchitecture, data.cpuBitness,
      data.canvasColorSpace, data.maxColorGamut,
    ].join('|||');
    data.combinedFingerprint = simpleHash(signals);

    // Also compute an entropy estimate
    let uniqueSignals = 0;
    for (const k in data) {
      if (k.startsWith('_')) continue;
      if (data[k] !== undefined && data[k] !== null && data[k] !== 'unknown' && data[k] !== 'unavailable') uniqueSignals++;
    }
    data.entropySignals = uniqueSignals + ' unique data points collected';
  }

  /* ====== Helper: simple string hash ====== */
  function simpleHash(str) {
    if (!str) return 'fp_00000000';
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return 'fp_' + (h >>> 0).toString(16).padStart(8, '0');
  }

  /* ====== Run all collectors ====== */
  async function collectAll() {
    // Synchronous
    basics();
    screenInfo();
    timezone();
    canvasFingerprint();
    canvasAdvanced();
    emojiFingerprint();
    webgl();
    webglPrecision();
    detectFonts();
    storageProbes();
    pluginsProbe();
    mediaCapabilities();
    navigation();
    mediaPrefs();
    cssFeatures();
    cssAdvanced();
    mathFingerprint();
    collationFingerprint();
    jsFeatures();
    shapeDetectionAPIs();
    touchDetails();
    protocolHandlers();
    performanceDeep();
    paintTiming();
    motionSensors();
    textMetricsFingerprint();
    svgFingerprint();
    clipboardState();
    webglRenderHash();
    networkDeep();
    domFingerprint();
    visibilityState();
    cryptoFingerprint();
    keyboardInfo();
    audioDeep();
    windowFeatures();
    colorProfile();
    appState();
    behavioural();

    // Asynchronous (all in parallel)
    await Promise.all([
      audioFingerprint(),
      webrtcIPs(),
      battery(),
      adBlockDetect(),
      permissionsProbe(),
      speechVoices(),
      inputDevices(),
      storageFingerprint(),
      highEntropyHints(),
      resourceProbing(),
    ]).catch(() => {});

    computeFingerprint();
    return data;
  }

  /* ====== Snapshot behavioural data at reveal time ====== */
  function snapshotBehavioural() {
    const t = data._behaviouralRef;
    if (!t) return;
    data.timeOnDecoy    = ((Date.now() - t.startTime) / 1000).toFixed(1) + ' s';
    data.mousePositions = t.mousePositions.length + ' samples';
    data.clickCount     = t.clicks.length;
    data.rightClickCount = t.rightClicks;
    data.keystrokes     = t.keystrokes;
    data.scrollEvents   = t.scrollEvents;
    data.touchEvents    = t.touchEvents;
    data.focusChanges   = t.focusChanges;
    data.tabHiddenCount = t.tabHidden;
    data.windowResizes  = t.resizes;
    data.copyEvents     = t.copyEvents;
    data.pasteEvents    = t.pasteEvents;

    // Typing speed
    if (t.keystrokeTimings.length > 2) {
      const avg = t.keystrokeTimings.reduce((a, b) => a + b, 0) / t.keystrokeTimings.length;
      data.avgKeystrokeInterval = Math.round(avg) + ' ms';
      data.typingSpeedWPM       = Math.round(60000 / avg / 5) + ' WPM (estimated)';
    }

    // Mouse movement analysis
    if (t.mousePositions.length > 1) {
      const xs = t.mousePositions.map(p => p.x);
      const ys = t.mousePositions.map(p => p.y);
      data.mouseArea = `X: ${Math.min(...xs)}–${Math.max(...xs)}, Y: ${Math.min(...ys)}–${Math.max(...ys)}`;

      // Calculate total distance
      let dist = 0;
      for (let i = 1; i < t.mousePositions.length; i++) {
        const dx = t.mousePositions[i].x - t.mousePositions[i-1].x;
        const dy = t.mousePositions[i].y - t.mousePositions[i-1].y;
        dist += Math.sqrt(dx*dx + dy*dy);
      }
      data.mouseDistancePx = Math.round(dist) + ' px';

      // Average speed
      if (t.mousePositions.length > 1) {
        const totalTime = t.mousePositions[t.mousePositions.length-1].t - t.mousePositions[0].t;
        if (totalTime > 0) data.mouseAvgSpeed = Math.round(dist / totalTime * 1000) + ' px/s';
      }
    }
    delete data._behaviouralRef;
  }

  return { collectAll, snapshotBehavioural, getData: () => data };
})();
