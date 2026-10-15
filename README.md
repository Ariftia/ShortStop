# ShortStop 🛑

**ShortStop** is a lightweight, local-first WebExtension (Manifest V3) for Firefox and Chromium browsers that eliminates impulsive short-video doomscrolling (YouTube Shorts, Instagram Reels, Facebook Reels, and TikTok) while keeping useful browsing, search, long-form viewing, messaging, and text posts fully functional.

---

## ✨ Features

- **Format-Based Suppression (Not Aspect Ratio):**
  - **YouTube:** Blocks the `/shorts/` viewer, reels shelves, and navigation items. Normal watch pages, subscriptions, playlists, and long tutorials are preserved.
  - **Instagram:** Blocks the `/reel/` & `/reels/` viewer and navigation entry points. Direct Messages, photo posts, and user profiles remain accessible.
  - **Facebook:** Blocks Reels carousels, cards, and viewer routes. Text posts, groups, and messages remain accessible.
  - **TikTok:** Blocks all of `tiktok.com` by default.
  - **Custom Domains:** Block any user-specified website completely.
- **Adjustable Grace Time Quota:**
  - Default: **5 minutes per 3 hours**, up to **30 minutes daily ceiling**.
  - **Cumulative across all apps:** Consuming minutes on YouTube drains the same pool as Instagram or TikTok.
  - **Fully Adjustable:** Configure pass duration (1–15 min), cooldown interval (1–8 hours), and daily ceiling (0–120 min, or 0 to disable) in Settings.
  - **30-Second Intentional Delay:** Requires a calm 30-second pause before unlocking a grace pass to prevent unconscious impulsive unblocking.
- **Tamper-Resistant Focus Sessions:**
  - 25, 50, or 90-minute focus timers (or custom duration).
  - During an active focus session, all protection-weakening settings (disabling platforms, loosening grace quotas, and grace pass activation) are strictly locked in the background engine.
  - Persists across browser restarts.
- **Calm, Respectful Block Screen:**
  - Zero shame copy: *"This short video is blocked. What did you come here to do?"*
  - Safe exit options: "Go Back", "Open Safe Tab", or "Use Grace Pass" (if budget allows).
- **Privacy First & Local-Only:**
  - No remote analytics, no telemetry, no tracking, no account required.
  - All state and timestamps stay exclusively inside `browser.storage.local`.

---

## 🚀 Installation Guide

### For Firefox

#### Permanent Installation (Without Debug Mode)
1. Build and package the production `.xpi`:
   ```bash
   npm run pack
   ```
   This generates `shortstop-v0.1.0.xpi` (and `shortstop.xpi`) with all extension files placed strictly at the root of the archive (preventing the "corrupt add-on" error).

2. Choose your permanent installation method:

   - **Method A: Firefox Developer Edition / Nightly / LibreWolf / Zen / Waterfox (Easiest)**:
     1. Open `about:config` in your browser.
     2. Search for `xpinstall.signatures.required` and toggle it to `false`.
     3. Open `about:addons` (or press `Ctrl+Shift+A`).
     4. Click the gear icon (⚙️) in the top-right corner and select **"Install Add-on From File..."**.
     5. Select `shortstop-v0.1.0.xpi` (or `shortstop.xpi`).
     6. Click **Add** to confirm. The extension will stay installed permanently across browser restarts.

   - **Method B: Firefox Enterprise Policy (Linux System-Wide, No Signing Required)**:
     On Linux, create an enterprise policy to force-load the extension without signature checks:
     ```bash
     sudo mkdir -p /etc/firefox/policies
     sudo tee /etc/firefox/policies/policies.json << 'EOF'
     {
       "policies": {
         "ExtensionSettings": {
           "shortstop@stop-scrolling.ext": {
             "installation_mode": "normal_installed",
             "install_url": "file:///path/to/shortstop-v0.1.0.xpi"
           }
         }
       }
     }
     EOF
     ```
     *(Replace `/path/to/shortstop-v0.1.0.xpi` with the absolute path to your `.xpi` file, then restart Firefox).*

   - **Method C: Mozilla Self-Signing (Standard Release Firefox)**:
     Mozilla provides free, automated self-signing for unlisted extensions in seconds:
     1. Get your free API key & secret from [AMO Developer Hub](https://addons.mozilla.org/developers/addon/api/key/).
     2. Run:
        ```bash
        npx web-ext sign --source-dir=dist --api-key="YOUR_KEY" --api-secret="YOUR_SECRET" --channel=unlisted
        ```
     3. Download the signed `.xpi` from `web-ext-artifacts/` and install it permanently via `about:addons` -> **"Install Add-on From File..."**.

#### Temporary Debug Mode
If you only want to test temporarily during active development:
1. Open `about:debugging#/runtime/this-firefox`.
2. Click **"Load Temporary Add-on..."**.
3. Select `dist/manifest.json` (or `shortstop-v0.1.0.xpi`).
*(Note: Temporary add-ons are automatically unloaded when Firefox closes).*

### For Chrome / Brave / Edge
1. Navigate to `chrome://extensions`.
2. Toggle on **"Developer mode"** in the top-right corner.
3. Click **"Load unpacked"** and select the `dist/` directory.

---

## 🛠️ Development & Testing

```bash
# Install dependencies
npm install

# Run unit & integration test suite (Vitest)
npm test

# Build production extension files in dist/
npm run build

# Watch mode for development
npm run watch

# Package production zip for distribution
npm run pack
```

---

## 📂 Project Architecture

```
stop-scrolling-ext/
├── PRD.md                       # Product Requirements Document
├── PLAN.md                      # Implementation & Verification Plan
├── public/
│   ├── manifest.json            # WebExtensions Manifest V3
│   └── icons/                   # Real PNG and SVG icons (16, 32, 48, 128)
├── src/
│   ├── common/
│   │   ├── types.ts             # State schemas & runtime message types
│   │   ├── defaults.ts          # Default settings and date helpers
│   │   ├── quota.ts             # Grace time math, cooldowns & evaluations
│   │   ├── urlMatcher.ts        # URL classification and blocking engine
│   │   └── storage.ts           # State persistence & anti-tamper locks
│   ├── background/
│   │   └── index.ts             # Background worker, alarms & webNavigation
│   ├── content/
│   │   ├── index.ts             # Content script coordinator & SPA hooks
│   │   ├── content.css          # Early injected CSS for instant suppression
│   │   └── adapters/            # Platform-specific DOM handlers
│   │       ├── youtube.ts
│   │       ├── instagram.ts
│   │       ├── facebook.ts
│   │       └── tiktok.ts
│   └── ui/
│       ├── popup/               # Extension toolbar action popup
│       ├── blocked/             # Calm block screen
│       ├── settings/            # Settings & adjustable quota manager
│       └── onboarding/          # First-run welcome page
├── tests/                       # Vitest unit and integration tests
│   ├── quota.test.ts
│   ├── urlMatcher.test.ts
│   └── storage.test.ts
├── build.js                     # Fast ESBuild bundling pipeline
└── scripts/
    ├── generate-icons.js        # Pure Node PNG icon generator
    └── pack.js                  # Production zip packaging script
```
