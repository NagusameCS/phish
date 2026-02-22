/* ============================================================
   reveal.js — Builds the educational reveal UI from collected data
   ============================================================ */

const Reveal = (() => {

  const CARD_GROUPS = [
    {
      icon: '🌐',
      title: 'Your IP Addresses (WebRTC Leak)',
      keys: ['localIPs', 'iceCandidates'],
      warningIf: v => v && v.length && v[0] !== 'hidden / not discovered',
    },
    {
      icon: '🖥️',
      title: 'Browser & OS',
      keys: ['userAgent', 'appVersion', 'platform', 'oscpu', 'vendor', 'vendorSub', 'product', 'productSub', 'buildID'],
    },
    {
      icon: '🧬',
      title: 'UA Client Hints',
      keys: ['uaBrands', 'uaPlatform', 'uaMobile'],
    },
    {
      icon: '📐',
      title: 'Screen & Display',
      keys: ['screenResolution', 'availResolution', 'colorDepth', 'pixelDepth', 'pixelRatio', 'windowSize', 'outerSize', 'screenOrientation', 'screenLeft', 'screenTop', 'isMultiMonitorHint'],
    },
    {
      icon: '🕐',
      title: 'Timezone & Locale',
      keys: ['timezone', 'timezoneOffset', 'locale', 'calendar', 'numberingSystem', 'localTime', 'performanceNow', 'dateFormatSample', 'numberFormatSample', 'currencyFormatSample', 'supportedLocales'],
    },
    {
      icon: '🎨',
      title: 'Canvas Fingerprint',
      keys: ['canvasHash'],
      canvas: true,
    },
    {
      icon: '🎮',
      title: 'WebGL / GPU',
      keys: ['webglVendor', 'webglRenderer', 'webglVersion', 'webglMaxTextureSize', 'webglMaxViewportDims', 'webglShadingLanguage', 'webglMaxRenderbuffer', 'webglMaxCubeMapTexture', 'webglMaxVertexAttribs', 'webglMaxVaryingVectors', 'webglMaxVertexUniforms', 'webglMaxFragUniforms', 'webglMaxVertexTextures', 'webglMaxTexImageUnits', 'webglMaxCombTexUnits', 'webglAliasedLineRange', 'webglAliasedPointRange', 'webglAntialiasing', 'webglStencilBits', 'webglDepthBits', 'webglExtensionCount', 'webglImageHash', 'webglRenderHash'],
    },
    {
      icon: '🎮',
      title: 'WebGL2 Parameters',
      keys: ['webgl2MaxSamples', 'webgl2Max3dTextureSize', 'webgl2MaxArrayTexLayers', 'webgl2MaxDrawBuffers', 'webgl2MaxColorAttachments', 'webgl2MaxTransformFBVaryings'],
    },
    {
      icon: '🔊',
      title: 'Audio Fingerprint',
      keys: ['audioHash', 'audioSampleRate', 'audioBaseLatency', 'audioOutputLatency', 'audioState', 'audioMaxChannels'],
    },
    {
      icon: '🔋',
      title: 'Battery Status',
      keys: ['battery'],
    },
    {
      icon: '⚡',
      title: 'Hardware',
      keys: ['hardwareConcurrency', 'deviceMemory', 'maxTouchPoints', 'touchSupport', 'touchMaxPoints', 'pointerEvents', 'msPointerEvents'],
    },
    {
      icon: '📡',
      title: 'Network & Connection',
      keys: ['connectionType', 'connectionDown', 'connectionRtt', 'saveData', 'onLine', 'protocol', 'hostname', 'port', 'secureContext', 'crossOriginIsolated'],
    },
    {
      icon: '🔤',
      title: 'Detected Fonts (' + 'see count)',
      keys: ['fontCount', 'fontHash', 'detectedFonts'],
    },
    {
      icon: '🧩',
      title: 'Browser Plugins & MIME Types',
      keys: ['plugins', 'mimeTypes'],
    },
    {
      icon: '🎬',
      title: 'Video Codecs',
      keys: ['videoCodecs'],
    },
    {
      icon: '🎵',
      title: 'Audio Codecs',
      keys: ['audioCodecs'],
    },
    {
      icon: '📀',
      title: 'DRM & MediaSource',
      keys: ['drmSupport', 'mediaSourceAvail', 'mediaSourceH264', 'mediaSourceVP9', 'mediaSourceAV1'],
    },
    {
      icon: '🗄️',
      title: 'Storage & APIs',
      keys: [
        'localStorageAvail', 'sessionStorageAvail', 'indexedDBAvail',
        'serviceWorkerAvail', 'webWorkersAvail', 'sharedWorkerAvail', 'webSocketAvail',
        'webAssemblyAvail', 'webGLAvail', 'webGL2Avail', 'webGPUAvail',
        'clipboardAPIAvail', 'geolocationAvail', 'bluetoothAvail',
        'usbAvail', 'serialAvail', 'hidAvail', 'nfcAvail',
        'gamepadsAvail', 'mediaDevicesAvail', 'speechSynthAvail', 'speechRecogAvail',
        'webXRAvail', 'webMIDIAvail', 'wakeLockAvail', 'shareAvail',
        'credentialsAvail', 'paymentAvail', 'webAuthnAvail',
        'intersectionObsAvail', 'resizeObsAvail', 'performanceObsAvail',
        'broadcastChannelAvail', 'cacheAPIAvail', 'cryptoSubtleAvail',
        'registerProtocolAvail', 'inlinePdfSupport',
      ],
    },
    {
      icon: '💾',
      title: 'Storage Quota',
      keys: ['storageQuota', 'storageUsage', 'indexedDBVersion'],
    },
    {
      icon: '🔒',
      title: 'Permissions',
      keys: ['permissions', 'notificationPerm'],
    },
    {
      icon: '🎭',
      title: 'Preferences & Display',
      keys: ['prefersColorScheme', 'prefersReducedMotion', 'prefersContrast', 'prefersReducedData', 'prefersTransparency', 'forcedColors', 'invertedColors', 'hdrScreen', 'displayMode', 'pointerType', 'hoverCapability', 'anyPointer', 'anyHover', 'colorGamut', 'monochrome', 'doNotTrack', 'globalPrivacyControl'],
    },
    {
      icon: '🎨',
      title: 'CSS Feature Support',
      keys: ['cssGrid', 'cssSubgrid', 'cssContainerQ', 'cssNesting', 'cssHas', 'cssAccentColor', 'cssBackdropFilter', 'cssAspectRatio', 'cssScrollSnap', 'cssLayerSupport'],
    },
    {
      icon: '🗣️',
      title: 'Speech Synthesis Voices',
      keys: ['speechVoiceCount', 'speechVoiceHash', 'speechVoices'],
    },
    {
      icon: '🔢',
      title: 'Math Engine Fingerprint',
      keys: ['mathHash', 'mathTan', 'mathAcos', 'mathSinh', 'mathExpm1', 'mathLog1p', 'mathAtan2', 'mathCbrt', 'mathPow'],
    },
    {
      icon: '🤖',
      title: 'Automation Detection',
      keys: ['webdriver', 'javaEnabled', 'automationDetected', 'chromeObj', 'phantomJS', 'seleniumDriver', 'headlessChrome', 'sandboxed'],
    },
    {
      icon: '📝',
      title: 'JS Engine Fingerprint',
      keys: ['errorStackSignature', 'evalToString', 'fnToString', 'navigatorPropCount', 'windowPropCount', 'documentPropCount', 'globalThisKeys'],
    },
    {
      icon: '✏️',
      title: 'Text Metrics Fingerprint',
      keys: ['textMetricsHash', 'textMetricsWidth', 'textMetricsActualAscent', 'textMetricsActualDescent', 'textMetricsAlphaAscent'],
    },
    {
      icon: '🎤',
      title: 'Media Devices',
      keys: ['audioInputCount', 'audioOutputCount', 'videoInputCount', 'mediaDeviceIds'],
    },
    {
      icon: '📊',
      title: 'Performance & Memory',
      keys: ['jsHeapSizeLimit', 'jsHeapUsed', 'jsHeapTotal', 'resourceCount', 'resourceTypes', 'perfNowResolution', 'performanceTimeOrigin'],
    },
    {
      icon: '⌨️',
      title: 'Keyboard Layout',
      keys: ['keyboardLayout', 'keyboardLayoutSize'],
    },
    {
      icon: '📱',
      title: 'Motion Sensors',
      keys: ['deviceMotionAvail', 'deviceOrientationAvail', 'absoluteOrientationAvail', 'linearAccelAvail', 'gravitySensorAvail', 'ambientLightAvail', 'proximitySensorAvail'],
    },
    {
      icon: '🔐',
      title: 'Crypto',
      keys: ['cryptoUuid', 'cryptoSubtle'],
    },
    {
      icon: '🚦',
      title: 'Navigation & Referrer',
      keys: ['referrer', 'historyLength', 'documentURL', 'documentDomain', 'windowName', 'frameDepth', 'isInsideIframe', 'openerExists', 'ancestorOrigins', 'navigationType', 'pageLoadTime', 'dnsLookup', 'connectionTime', 'tlsNegotiation', 'ttfb', 'domInteractive', 'domContentLoaded', 'transferSize', 'encodedBodySize', 'decodedBodySize', 'redirectCount'],
    },
    {
      icon: '🛡️',
      title: 'Ad-Blocker',
      keys: ['adBlocker'],
    },
    {
      icon: '🐭',
      title: 'Your Behaviour on This Page',
      keys: ['timeOnDecoy', 'mousePositions', 'mouseArea', 'mouseDistancePx', 'mouseAvgSpeed', 'clickCount', 'rightClickCount', 'keystrokes', 'avgKeystrokeInterval', 'typingSpeedWPM', 'scrollEvents', 'touchEvents', 'focusChanges', 'tabHiddenCount', 'windowResizes', 'copyEvents', 'pasteEvents'],
    },
    {
      icon: '🔑',
      title: 'Combined Fingerprint ID',
      keys: ['combinedFingerprint', 'entropySignals'],
      warningIf: () => true,
    },
  ];

  /** Pretty-print a value */
  function fmt(val) {
    if (val === null || val === undefined) return 'n/a';
    if (Array.isArray(val)) return val.join('\n');
    if (typeof val === 'object') {
      return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join('\n');
    }
    return String(val);
  }

  /** Build all cards into the DOM */
  function render(data, domain) {
    document.getElementById('revealDomain').textContent = domain;

    const container = document.getElementById('dataCards');
    container.innerHTML = '';

    for (const group of CARD_GROUPS) {
      // Skip groups with no data
      const hasData = group.keys.some(k => data[k] !== undefined && data[k] !== null);
      if (!hasData) continue;

      const card = document.createElement('div');
      card.className = 'data-card';

      const title = document.createElement('h3');
      title.innerHTML = `${group.icon} ${group.title}`;
      card.appendChild(title);

      // Aggregate values
      const lines = [];
      for (const k of group.keys) {
        if (data[k] === undefined || data[k] === null) continue;
        const label = camelToLabel(k);
        lines.push(`${label}: ${fmt(data[k])}`);
      }

      const valueEl = document.createElement('div');
      valueEl.className = 'value';
      valueEl.textContent = lines.join('\n');

      // Warning highlight
      if (group.warningIf) {
        const firstVal = data[group.keys[0]];
        if (group.warningIf(firstVal)) valueEl.classList.add('warning');
      }

      card.appendChild(valueEl);

      // Canvas preview
      if (group.canvas && data.canvasDataUrl) {
        const img = new Image();
        img.src = data.canvasDataUrl;
        img.style.cssText = 'width:100%;border-radius:6px;margin-top:8px;background:#fff;';
        card.appendChild(img);
      }

      container.appendChild(card);
    }
  }

  /** camelCase → Title Case label */
  function camelToLabel(str) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase())
      .replace(/_/g, ' ');
  }

  /** Show the reveal layer */
  function show() {
    document.getElementById('decoy-styles').disabled = true;
    document.getElementById('reveal-styles').disabled = false;
    document.getElementById('reveal').style.display = '';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  return { render, show };
})();
