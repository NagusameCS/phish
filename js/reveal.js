/* ============================================================
   reveal.js — Builds the educational reveal UI from collected data
   ============================================================ */

const Reveal = (() => {

  const CARD_GROUPS = [
    {
      title: 'IP Addresses (WebRTC Leak)',
      keys: ['localIPs', 'iceCandidates'],
      warningIf: v => v && v.length && v[0] !== 'hidden / not discovered',
    },
    {
      title: 'Browser & OS',
      keys: ['userAgent', 'appVersion', 'platform', 'oscpu', 'vendor', 'vendorSub', 'product', 'productSub', 'buildID'],
    },
    {
      title: 'UA Client Hints',
      keys: ['uaBrands', 'uaPlatform', 'uaMobile', 'cpuArchitecture', 'cpuBitness', 'deviceModel', 'platformVersion', 'wow64', 'formFactor', 'fullVersionList'],
    },
    {
      title: 'Screen & Display',
      keys: ['screenResolution', 'availResolution', 'colorDepth', 'pixelDepth', 'pixelRatio', 'windowSize', 'outerSize', 'screenOrientation', 'screenLeft', 'screenTop', 'isMultiMonitorHint'],
    },
    {
      title: 'Timezone & Locale',
      keys: ['timezone', 'timezoneOffset', 'locale', 'calendar', 'numberingSystem', 'localTime', 'performanceNow', 'dateFormatSample', 'numberFormatSample', 'currencyFormatSample', 'supportedLocales'],
    },
    {
      title: 'Canvas Fingerprint',
      keys: ['canvasHash', 'emojiRenderHash'],
      canvas: true,
    },
    {
      title: 'Canvas Advanced',
      keys: ['canvasCompositeOps', 'canvasFilterSupport', 'canvasLineDashSupport', 'canvas2dAlpha', 'canvas2dDesync', 'canvas2dWillReadFreq', 'offscreenCanvasAvail', 'imageBitmapAvail', 'canvasColorSpace', 'maxColorGamut'],
    },
    {
      title: 'SVG Fingerprint',
      keys: ['svgTextBBox', 'svgTextLength'],
    },
    {
      title: 'WebGL / GPU',
      keys: ['webglVendor', 'webglRenderer', 'webglVersion', 'webglMaxTextureSize', 'webglMaxViewportDims', 'webglShadingLanguage', 'webglMaxRenderbuffer', 'webglMaxCubeMapTexture', 'webglMaxVertexAttribs', 'webglMaxVaryingVectors', 'webglMaxVertexUniforms', 'webglMaxFragUniforms', 'webglMaxVertexTextures', 'webglMaxTexImageUnits', 'webglMaxCombTexUnits', 'webglAliasedLineRange', 'webglAliasedPointRange', 'webglAntialiasing', 'webglStencilBits', 'webglDepthBits', 'webglExtensionCount', 'webglImageHash', 'webglRenderHash'],
    },
    {
      title: 'WebGL2 Parameters',
      keys: ['webgl2MaxSamples', 'webgl2Max3dTextureSize', 'webgl2MaxArrayTexLayers', 'webgl2MaxDrawBuffers', 'webgl2MaxColorAttachments', 'webgl2MaxTransformFBVaryings'],
    },
    {
      title: 'WebGL Shader Precision',
      keys: ['webglPrecisionFormats'],
    },
    {
      title: 'Audio Fingerprint',
      keys: ['audioHash', 'audioSampleRate', 'audioBaseLatency', 'audioOutputLatency', 'audioState', 'audioMaxChannels'],
    },
    {
      title: 'Battery Status',
      keys: ['battery'],
    },
    {
      title: 'Hardware',
      keys: ['hardwareConcurrency', 'deviceMemory', 'maxTouchPoints', 'touchSupport', 'touchMaxPoints', 'pointerEvents', 'msPointerEvents'],
    },
    {
      title: 'Network & Connection',
      keys: ['connectionType', 'connectionDown', 'connectionRtt', 'saveData', 'onLine', 'protocol', 'hostname', 'port', 'secureContext', 'crossOriginIsolated'],
    },
    {
      title: 'Detected Fonts',
      keys: ['fontCount', 'fontHash', 'detectedFonts'],
    },
    {
      title: 'Browser Plugins & MIME Types',
      keys: ['plugins', 'mimeTypes'],
    },
    {
      title: 'Video Codecs',
      keys: ['videoCodecs'],
    },
    {
      title: 'Audio Codecs',
      keys: ['audioCodecs'],
    },
    {
      title: 'DRM & MediaSource',
      keys: ['drmSupport', 'mediaSourceAvail', 'mediaSourceH264', 'mediaSourceVP9', 'mediaSourceAV1'],
    },
    {
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
      title: 'Storage Quota',
      keys: ['storageQuota', 'storageUsage', 'indexedDBVersion'],
    },
    {
      title: 'Permissions',
      keys: ['permissions', 'notificationPerm'],
    },
    {
      title: 'Preferences & Display',
      keys: ['prefersColorScheme', 'prefersReducedMotion', 'prefersContrast', 'prefersReducedData', 'prefersTransparency', 'forcedColors', 'invertedColors', 'hdrScreen', 'displayMode', 'pointerType', 'hoverCapability', 'anyPointer', 'anyHover', 'colorGamut', 'monochrome', 'doNotTrack', 'globalPrivacyControl'],
    },
    {
      title: 'CSS Feature Support',
      keys: ['cssGrid', 'cssSubgrid', 'cssContainerQ', 'cssNesting', 'cssHas', 'cssAccentColor', 'cssBackdropFilter', 'cssAspectRatio', 'cssScrollSnap', 'cssLayerSupport'],
    },
    {
      title: 'CSS Advanced Selectors & Features',
      keys: ['cssEscapeAvail', 'cssHasSelector', 'cssIsSelector', 'cssWhereSelector', 'cssFocusVisible', 'cssFocusWithin', 'cssLogicalProps', 'cssClamp', 'cssScrollTimeline', 'cssAnchorPos', 'cssPopoverAttr', 'cssIndeterminate', 'cssStartingStyle', 'cssLightDark', 'cssRelativeColor', 'cssContainerUnits', 'cssMathFunctions'],
    },
    {
      title: 'Speech Synthesis Voices',
      keys: ['speechVoiceCount', 'speechVoiceHash', 'speechVoices'],
    },
    {
      title: 'Math Engine Fingerprint',
      keys: ['mathHash', 'mathTan', 'mathAcos', 'mathSinh', 'mathExpm1', 'mathLog1p', 'mathAtan2', 'mathCbrt', 'mathPow'],
    },
    {
      title: 'String & Collation Fingerprint',
      keys: ['collationHash', 'collationOrder', 'relTimeFormat', 'pluralCategories', 'listFormatSample'],
    },
    {
      title: 'JS Language Features',
      keys: ['bigIntSupport', 'weakRefSupport', 'finalizationReg', 'structuredCloneAvail', 'proxySupport', 'symbolSupport', 'asyncGenerators', 'optionalChaining', 'nullishCoalescing', 'arrayAtSupport', 'objectHasOwn', 'errorCauseSupport', 'regexpLookbehind', 'sharedArrayBufferAvail', 'atomicsAvail', 'schedulerAvail', 'webLocksAvail', 'compressionStreamAvail', 'decompStreamAvail'],
    },
    {
      title: 'Shape Detection APIs',
      keys: ['barcodeDetectorAvail', 'faceDetectorAvail', 'textDetectorAvail', 'eyeDropperAvail', 'barcodeFormats'],
    },
    {
      title: 'Automation Detection',
      keys: ['webdriver', 'javaEnabled', 'automationDetected', 'chromeObj', 'phantomJS', 'seleniumDriver', 'headlessChrome', 'sandboxed'],
    },
    {
      title: 'JS Engine Fingerprint',
      keys: ['errorStackSignature', 'evalToString', 'fnToString', 'navigatorPropCount', 'windowPropCount', 'documentPropCount', 'globalThisKeys'],
    },
    {
      title: 'Text Metrics Fingerprint',
      keys: ['textMetricsHash', 'textMetricsWidth', 'textMetricsActualAscent', 'textMetricsActualDescent', 'textMetricsAlphaAscent'],
    },
    {
      title: 'Media Devices',
      keys: ['audioInputCount', 'audioOutputCount', 'videoInputCount', 'mediaDeviceIds'],
    },
    {
      title: 'Performance & Memory',
      keys: ['jsHeapSizeLimit', 'jsHeapUsed', 'jsHeapTotal', 'resourceCount', 'resourceTypes', 'perfNowResolution', 'performanceTimeOrigin'],
    },
    {
      title: 'Paint & Web Vitals',
      keys: ['firstPaint', 'firstContentfulPaint', 'largestContentfulPaint', 'cumulativeLayoutShift', 'longAnimFrameCount', 'resourceBreakdown', 'totalBytesTransferred', 'faviconProbeMs'],
    },
    {
      title: 'Media Constraints',
      keys: ['mediaConstraintCount', 'mediaConstraints'],
    },
    {
      title: 'Modern Web Platform APIs',
      keys: ['visualViewportAvail', 'visualViewportScale', 'visualViewportSize', 'customElementsAvail', 'shadowDOMAvail', 'dialogElementAvail', 'popoverAvail', 'viewTransitionAvail', 'highlightAvail', 'trustedTypesAvail', 'sanitizerAvail', 'adoptedStylesAvail', 'cssTypedOMAvail', 'registerPropertyAvail', 'presentationAvail', 'fileSystemAccessAvail', 'contactPickerAvail', 'computePressureAvail', 'navigationAPIAvail', 'orientationLockAvail', 'cookieStoreAvail', 'webTransportAvail', 'reportingObserverAvail', 'contentVisibilityAvail'],
    },
    {
      title: 'App & Document State',
      keys: ['isStandalone', 'isPWA', 'beforeInstallPromptAvail', 'documentReadyState', 'documentCharset', 'documentDir', 'documentContentType', 'documentDesignMode', 'documentLastModified', 'documentCompatMode'],
    },
    {
      title: 'Keyboard Layout',
      keys: ['keyboardLayout', 'keyboardLayoutSize'],
    },
    {
      title: 'Motion Sensors',
      keys: ['deviceMotionAvail', 'deviceOrientationAvail', 'absoluteOrientationAvail', 'linearAccelAvail', 'gravitySensorAvail', 'ambientLightAvail', 'proximitySensorAvail'],
    },
    {
      title: 'Crypto',
      keys: ['cryptoUuid', 'cryptoSubtle'],
    },
    {
      title: 'Navigation & Referrer',
      keys: ['referrer', 'historyLength', 'documentURL', 'documentDomain', 'windowName', 'frameDepth', 'isInsideIframe', 'openerExists', 'ancestorOrigins', 'navigationType', 'pageLoadTime', 'dnsLookup', 'connectionTime', 'tlsNegotiation', 'ttfb', 'domInteractive', 'domContentLoaded', 'transferSize', 'encodedBodySize', 'decodedBodySize', 'redirectCount'],
    },
    {
      title: 'Ad-Blocker',
      keys: ['adBlocker'],
    },
    {
      title: 'Behaviour on This Page',
      keys: ['timeOnDecoy', 'mousePositions', 'mouseArea', 'mouseDistancePx', 'mouseAvgSpeed', 'clickCount', 'rightClickCount', 'keystrokes', 'avgKeystrokeInterval', 'typingSpeedWPM', 'scrollEvents', 'touchEvents', 'focusChanges', 'tabHiddenCount', 'windowResizes', 'copyEvents', 'pasteEvents'],
    },
    {
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

    // Build stat bar
    const statBar = document.getElementById('statBar');
    if (statBar) {
      const totalKeys = CARD_GROUPS.reduce((n, g) => n + g.keys.length, 0);
      const filledKeys = CARD_GROUPS.reduce((n, g) =>
        n + g.keys.filter(k => data[k] !== undefined && data[k] !== null).length, 0);
      const groupsUsed = CARD_GROUPS.filter(g =>
        g.keys.some(k => data[k] !== undefined && data[k] !== null)).length;
      statBar.innerHTML =
        `<div class="stat-item"><span class="stat-num">${filledKeys}</span><span class="stat-label">Data Points</span></div>` +
        `<div class="stat-item"><span class="stat-num">${groupsUsed}</span><span class="stat-label">Categories</span></div>` +
        `<div class="stat-item"><span class="stat-num">0</span><span class="stat-label">Permissions Asked</span></div>`;
    }

    const container = document.getElementById('dataCards');
    container.innerHTML = '';

    let cardIndex = 0;
    for (const group of CARD_GROUPS) {
      const hasData = group.keys.some(k => data[k] !== undefined && data[k] !== null);
      if (!hasData) continue;

      cardIndex++;
      const card = document.createElement('div');
      card.className = 'data-card';

      const title = document.createElement('h3');
      title.innerHTML = `<span class="card-number">${cardIndex}</span> ${group.title}`;
      card.appendChild(title);

      const lines = [];
      for (const k of group.keys) {
        if (data[k] === undefined || data[k] === null) continue;
        const label = camelToLabel(k);
        lines.push(`${label}: ${fmt(data[k])}`);
      }

      const valueEl = document.createElement('div');
      valueEl.className = 'value';
      valueEl.textContent = lines.join('\n');

      if (group.warningIf) {
        const firstVal = data[group.keys[0]];
        if (group.warningIf(firstVal)) valueEl.classList.add('warning');
      }

      card.appendChild(valueEl);

      if (group.canvas && data.canvasDataUrl) {
        const img = new Image();
        img.src = data.canvasDataUrl;
        img.style.cssText = 'width:100%;height:auto;border-radius:4px;margin-top:8px;border:1px solid #e0e0e0;';
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
