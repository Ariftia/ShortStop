# ShortStop Implementation Plan

**Objective**: Deliver a complete, end-to-end, ready-to-use Firefox WebExtensions Manifest V3 extension (with cross-browser compatibility) that halts short-video doomscrolling across YouTube, Instagram, Facebook, and TikTok, featuring an adjustable Grace Time quota and tamper-resistant Focus Sessions.

---

## Phase 1: Project Setup & Build Infrastructure
- [x] Initialize `package.json` with TypeScript, bundling setup (esbuild), and testing framework (Vitest).
- [x] Configure `tsconfig.json` for modern ES and WebExtension types.
- [x] Create extension directory structure:
  - `src/background/` (policy engine, alarm handlers, storage management, navigation interception)
  - `src/content/` (shared content script coordinator and platform-specific adapters)
  - `src/content/adapters/` (`youtube.ts`, `instagram.ts`, `facebook.ts`, `tiktok.ts`)
  - `src/ui/popup/` (popup interface with focus timer and grace time tracker)
  - `src/ui/blocked/` (calm blocked page)
  - `src/ui/settings/` (settings and adjustable quota controls)
  - `src/ui/onboarding/` (first-run onboarding screen)
  - `src/common/` (types, storage keys, validation, quota math)
  - `public/` (manifest.json, icons, static HTML/CSS)
- [x] Generate real PNG and SVG icons (16x16, 32x32, 48x48, 128x128).

---

## Phase 2: Core Policy Engine & Data Model (`src/common/` & `src/background/`)
- [x] Define shared state schemas:
  - User preferences (enabled platforms, custom domains, notification preferences).
  - Grace time quota configuration:
    - `passDurationMinutes` (default: 5, user-adjustable)
    - `cooldownHours` (default: 3, user-adjustable)
    - `dailyCeilingMinutes` (default: 30, user-adjustable)
    - `dailyUsageToday` (minutes used today, resets at local midnight)
    - `lastGraceActivationTimestamp`
    - `activeGraceExpiresAt`
  - Focus session state:
    - `isActive`, `startedAt`, `expiresAt`, `durationMinutes`
    - Lockout flags (prevents weakening quota, disabling platforms, or pausing during active sessions).
- [x] Build `PolicyEngine`:
  - Calculate effective block status for any URL or platform.
  - Quota verification algorithm (can activate grace pass? remaining daily quota? cooldown remaining?).
  - State persistence with `browser.storage.local` and synchronization across tabs.
  - Alarm listeners (`browser.alarms`) for focus session expiration, grace time expiration, and daily midnight reset.
- [x] Unit test policy engine, quota calculations, and state persistence with Vitest.

---

## Phase 3: Navigation Enforcement & Background Listeners
- [x] Setup `browser.webNavigation` and declarative redirection:
  - Redirect direct hits to YouTube `/shorts/*`, Instagram `/reel/*`, `/reels/*`, Facebook `/reel/*`, and all of TikTok to `ui/blocked.html` unless an active grace pass is active.
  - Pass destination metadata in query params (for "Go back", "Copy original URL", and "Use Grace Pass").
- [x] Tab communication system:
  - Broadcast policy state changes (focus session started, grace pass activated/expired) to all open tabs immediately.

---

## Phase 4: Platform Adapters (Content Scripts & Early CSS)
- [x] **YouTube Adapter**:
  - Early injected CSS to immediately hide `ytd-reel-shelf-renderer`, `ytd-rich-shelf-renderer[is-shorts]`, shorts navigation buttons, and shorts badges.
  - DOM mutation observer targeting video cards and navigation anchors (`/shorts/`).
  - Client-side SPA navigation interceptor: detect in-page transition to shorts and redirect to blocked screen or replace player before video starts.
  - Suppress/pause HTML5 video player if dynamic insertion is detected.
  - Ensure normal watch pages, playlists, comments, and search remain unaffected.
- [x] **Instagram Adapter**:
  - Hide Reels navigation icon/links in main sidebar and explore grid.
  - Detect `/reels/` or `/reel/` navigation in SPA and pause video / display calm overlay.
  - Preserve Direct Messages, user profiles, feed photo viewing.
- [x] **Facebook Adapter**:
  - Hide Reels cards and video shelves in main feeds and Watch navigation.
  - Intercept `/reel/` viewer.
- [x] **TikTok Adapter**:
  - Whole-site blocking script and redirection fallback if reached directly.
- [x] **Custom Domains Adapter**:
  - Domain-level matching and redirect to blocked screen.

---

## Phase 5: User Interfaces (Popup, Blocked Page, Settings, Onboarding)
- [x] **Blocked Page (`blocked.html`)**:
  - Minimalist, calm styling (dark/light mode support).
  - Display "This short video is blocked. What did you come here to do?"
  - Quick action buttons: "Safe Return", "New Tab", and "Use Grace Pass" (with 30s countdown modal if quota allows).
- [x] **Action Popup (`popup.html`)**:
  - Live status indicator: "Active Protection", "Focus Session", or "Grace Pass Active".
  - Grace time badge: Available pass, daily time used vs quota, "Start Grace Pass" button (triggers 30-second delay).
  - Focus session manager: quick select 25 / 50 / 90 / custom mins, Start / Stop (with confirmation/lock).
  - Platform quick status (YouTube, Instagram, Facebook, TikTok).
  - Link to Settings.
- [x] **Settings Page (`settings.html`)**:
  - Grace time quota sliders/inputs:
    - Duration per pass (1–15 min, default: 5).
    - Interval cooldown (1–8 hours, default: 3).
    - Daily ceiling (0–120 min, default: 30; 0 = disabled).
  - Platform toggles and custom domain manager.
  - Focus session defaults and lock settings.
  - Diagnostic export & reset options.
- [x] **Onboarding Screen (`onboarding.html`)**:
  - Friendly explanation, platform overview, one-click enable.

---

## Phase 6: Automated Testing, Build, & End-to-End Verification
- [x] Write comprehensive Vitest unit tests for:
  - Policy engine rules and precedence.
  - Grace time quota math (cooldown, daily ceiling, multi-app consumption).
  - Focus session persistence and lock validation.
  - Domain and URL matchers.
  - Anti-tamper settings guards.
- [x] Build production extension package (`dist/`).
- [x] Package ready-to-load distribution zip (`shortstop-v0.1.0.zip`).
- [x] Manual end-to-end smoke test script and documentation.

---

## Phase 7: Delivery & Documentation
- [x] Create `README.md` with installation instructions (how to load in Firefox `about:debugging` and Chromium `chrome://extensions`).
- [x] Review all acceptance criteria against [PRD.md](file:///home/arif/repo/stop-scrolling-ext/PRD.md).
