# Phish Training — Browser Fingerprint Awareness Demo

A **100% client-side** phishing awareness training tool hosted on GitHub Pages. No data ever leaves the user's browser.

## How It Works

### For the Trainer (You)

1. Visit the site **without** a hash → you'll see the **Link Generator**.
2. Enter a target domain (e.g. `asf.edu.mx`), an optional org name, and path.
3. Click **Generate Link** → get a URL like:
   ```
   https://nagusamecs.github.io/phish/#eyJkIjoiYXNmLmVkdS5teCIsIm4iOiJBU0YgUG9ydGFsIn0
   ```
4. Send that link to participants via email, chat, etc.

### For the Participant (Target)

1. They click the link.
2. They see a **convincing login page** branded to look like the target domain.
3. In the background, JavaScript silently collects every piece of data the browser exposes **without asking for any permission** (~50 collectors):
   - IP addresses (WebRTC STUN leak)
   - Full browser/OS fingerprint & UA Client Hints (CPU arch, bitness, platform version)
   - Canvas fingerprint (standard + emoji rendering + composite ops + filters)
   - WebGL / GPU fingerprint (vendor, renderer, shader precision formats)
   - Audio context fingerprint (deep: sample rate, latency, channels)
   - SVG text rendering fingerprint
   - Screen resolution, colour depth, pixel ratio, orientation
   - Timezone, locale, calendar, numbering system, collation order
   - Installed fonts (measurement-based detection)
   - Battery status
   - Hardware specs (CPU cores, RAM, touch points)
   - Network connection info, protocol, secure context
   - Storage/API feature probes (50+ APIs tested)
   - CSS feature support (30+ properties including modern selectors)
   - JS language feature detection (BigInt, WeakRef, SharedArrayBuffer, etc.)
   - Shape Detection APIs (barcode, face, text, EyeDropper)
   - Performance & Web Vitals (FCP, LCP, CLS, paint timing)
   - Math engine fingerprint
   - String collation / Intl fingerprint
   - Text metrics fingerprint
   - Media devices, codecs, DRM, constraints
   - Modern platform APIs (Web Components, View Transitions, Trusted Types, etc.)
   - Color profile & gamut detection
   - App & document state (PWA, standalone, charset, design mode)
   - Mouse movement, clicks, keystrokes, scroll behaviour, typing speed
   - Navigation timing, referrer, resource analysis
   - Ad-blocker detection
   - Automation/bot detection
   - Permissions state
   - Keyboard layout detection
   - Motion sensor availability
   - A combined fingerprint hash
4. After 15 seconds (or when they "submit" the fake form), the disguise drops.
5. They see an **educational reveal page** explaining:
   - What just happened
   - Every piece of data that was collected
   - Practical tips to protect themselves

## URL Format

The hash is a **Base64URL-encoded** payload:

| Format | Example Hash Decodes To |
|--------|------------------------|
| Plain domain | `asf.edu.mx` |
| JSON object | `{"d":"asf.edu.mx","n":"ASF Portal","p":"/login"}` |

## Deployment

This is a static site — just push to GitHub Pages:

```bash
git init
git add .
git commit -m "initial"
git remote add origin git@github.com:nagusamecs/phish.git
git push -u origin main
```

Then enable GitHub Pages on the `main` branch in repo settings.

## Privacy & Ethics

- **All data stays local.** Zero network requests for data exfiltration.
- This tool is for **authorized security awareness training only**.
- Always obtain proper authorization before sending training phishing links.
- The reveal page educates users on how to protect themselves.

## File Structure

```
index.html          ← Entry point
css/
  decoy.css         ← Fake site styles
  reveal.css        ← Educational reveal styles
js/
  config.js         ← URL hash decoding & branding
  collector.js      ← Data collection engine (~50 collectors)
  decoy.js          ← Fake page rendering
  reveal.js         ← Educational reveal rendering
  app.js            ← Main orchestrator
generate.html       ← Standalone link generator subpage (single + batch)
```

## License

MIT — Use responsibly for authorized training only.
