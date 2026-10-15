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

### For Firefox (Recommended)
1. Build the extension if not already built:
   ```bash
   npm run build
   # or npm run pack to generate shortstop-v0.1.0.zip
   ```
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **"Load Temporary Add-on..."**.
4. Select `dist/manifest.json` (or the generated `shortstop-v0.1.0.zip`).
5. ShortStop is now active! The icon will appear in your toolbar.

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
