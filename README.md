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
3. In the background, JavaScript silently collects every piece of data the browser exposes **without asking for any permission**:
   - IP addresses (WebRTC STUN leak)
   - Full browser/OS fingerprint
   - Canvas & WebGL fingerprints
   - Audio context fingerprint
   - Screen resolution, colour depth, pixel ratio
   - Timezone, locale, language
   - Installed fonts (measurement-based)
   - Battery status
   - Hardware specs (CPU cores, RAM)
   - Network connection info
   - Storage/API feature probes
   - Mouse movement, clicks, keystrokes, scroll behaviour
   - Navigation timing, referrer
   - Ad-blocker detection
   - Permissions state
   - Dark mode and motion preference
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
  collector.js      ← Data collection engine (18 collectors)
  decoy.js          ← Fake page rendering
  reveal.js         ← Educational reveal rendering
  app.js            ← Main orchestrator + link generator
```

## License

MIT — Use responsibly for authorized training only.
