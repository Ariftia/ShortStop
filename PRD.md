# ShortStop — Firefox extension PRD

Version: 0.1 • Draft • 15 October 2026

All product behavior, priorities, and targets below are proposed requirements, not claims about an existing extension. ShortStop is a working name.

## 1. Product purpose

Help me stay focused by preventing impulsive short-video viewing across websites while keeping useful browsing available.

Core job: “When I open a social platform for a useful reason, keep me out of short-video feeds—even if I follow a direct link or encounter one inside another page.”

The product should remove temptations, stop playback, and interrupt access. Merely hiding a navigation button is insufficient.

## 2. Goals and boundaries

**Goals**
- Block known Shorts, Reels, and equivalent short-video surfaces.
- Hide their recommendations and entry points before they attract attention.
- Preserve messaging, text posts, search, and normal long-form viewing where these can be separated reliably.
- Make protection always on by default, with stronger commitment during focus sessions.
- Be local-first, quiet, fast, and easy to understand.

**Boundaries**
- Desktop Firefox is the first release; Android requires a separate compatibility release.
- “Any platform” is the direction, not an absolute launch guarantee: verified adapters cover named platforms, while user rules and optional generic detection extend coverage.
- Native apps, other browsers, and devices are outside this extension’s scope.
- Do not market the product as tamper-proof or as an addiction treatment.
- No account, cloud backend, AI service, or social features in the MVP.

## 3. What counts as a short video?

| Mode | Proposed rule | Default |
|---|---|---|
| Platform format | Block items classified by a supported platform adapter as Shorts, Reels, or equivalent, regardless of duration | On |
| Entire website | Block every page on a user-selected domain | On for TikTok; configurable before a focus session |
| Duration filter | Block accessible HTML video with known duration at or below a chosen threshold; suggested starting value 180 seconds | Optional, later release |
| Generic short-feed detection | Detect repeated vertical-video feed patterns on other permitted websites | Experimental, later release |

A portrait aspect ratio alone must never classify a video as short-form. Unknown duration must not silently count as a short video. Normal brief tutorials remain allowed by default unless classified as a short-form format or covered by a whole-site rule.

## 4. Platform coverage

These are implementation targets. Exact routes, page variants, and selectors must be verified against live sites before each platform is labeled supported.

| Platform | MVP behavior | Preserve where separable |
|---|---|---|
| YouTube | Block Shorts viewers and identified Shorts cards, shelves, links, and embedded items | Normal watch pages, subscriptions, search, playlists, long-form video |
| Instagram | Block Reels viewers, identified Reel posts, recommendations, and navigation entries | Direct messages, photos, profiles, text interactions |
| Facebook | Block identified Reels viewers, cards, and entry points | Messages, groups, text/photo posts |
| TikTok | Block the entire site, including direct video links | Nothing by default; explain that creator/business tools are also blocked |
| Other sites | User-configured whole-domain blocking | Unblocked sites |

Later candidates: Snapchat Spotlight, Pinterest video surfaces, Reddit, and X. Avoid claiming all video on these sites is short-form. Cross-site embeds require access to the relevant origin; missing permission must be visible in coverage status. Content scripts can inspect pages only where access is granted. [1]

## 5. Main user journeys

### First use
1. Explain protection in one sentence: “Keep useful browsing. Remove short-video distractions.”
2. Show default platform choices and TikTok’s whole-site behavior.
3. Request the necessary site access with a plain-language explanation.
4. Show each platform as Protected, Permission needed, Disabled, or Limited coverage.
5. Activate protection immediately; offer a 50-minute focus session as an optional next step.

### Normal browsing
- Remove identified short-video cards and buttons without leaving large blank spaces.
- Pause and suppress an identified short player when dynamically inserted.
- Keep unrelated page interactions usable.
- Do not show repeated notifications or celebrate every blocked card.

### Direct access
- Intercept known short-video navigation and show a calm extension-owned blocked screen.
- Copy: “This short video is blocked. What did you come here to do?”
- Actions: Go back; Open a safe destination; View protection settings.
- A safe destination must not return immediately to the blocked content. If there is no safe previous page, offer a new tab.

### Focus session
- Choose 25, 50, 90, or a custom number of minutes.
- Show a countdown in the popup, without a distracting floating widget.
- Lock all protection-weakening settings until the session ends: platform disabling, allowlisting, pause, and rule deletion.
- Continue enforcing an active session after Firefox restarts, using a persisted end time.
- At expiry, return to always-on protection; do not automatically unblock short videos.

### Grace time (temporary access)
- Outside focus sessions, allow activating a temporary grace window to view short videos.
- Regulated by a customizable shared quota:
  - Default pass duration: 5 minutes (user-adjustable, e.g., 1–15 minutes).
  - Default cooldown interval: 3 hours between passes (user-adjustable, e.g., 1–8 hours).
  - Default hard daily ceiling: 30 minutes total per calendar day (user-adjustable, e.g., 5–120 minutes, or 0 minutes to disable grace time entirely).
- Cumulative across all apps/platforms: time consumed on YouTube Shorts, Instagram Reels, Facebook Reels, or TikTok drains the same unified balance.
- Require a 30-second intentional delay and confirmation before grace time activates to curb impulsive bypasses.
- Show a persistent countdown in the popup and on previously blocked tabs; when the grace period expires, immediately re-enforce blocking and pause active video playback.
- Quota adjustments are locked against weakening during an active focus session.
- Strictly locked and unavailable during an active focus session.

## 6. Functional requirements

| ID | Priority | Requirement |
|---|---|---|
| FR-01 | P0 | Enforce supported direct URLs entered manually, clicked, opened in new tabs, restored, or reached by redirects. |
| FR-02 | P0 | Re-evaluate in-page navigation, browser back/forward, lazy loading, and modal viewers without requiring reload. |
| FR-03 | P0 | Hide identified short-form entry points and pause/suppress identified players, including newly inserted elements. |
| FR-04 | P0 | Apply protection to already-open permitted tabs when enabled or when a session starts. |
| FR-05 | P0 | Provide per-platform settings and whole-domain custom rules, with hostname validation and explicit subdomain behavior. |
| FR-06 | P0 | Provide always-on protection and persistent focus-session state. |
| FR-07 | P0 | During a session, prevent weakening settings through any extension UI; enforce this in the background state layer. |
| FR-08 | P0 | Clearly expose missing or revoked site access; never show Protected when required permission is absent. |
| FR-09 | P0 | Outside sessions, allow an adjustable grace period after a 30-second intentional delay and confirmation; enforce a shared cumulative budget across all platforms (defaults: 5 minutes per 3 hours, capped at a maximum of 30 minutes per day, with user-configurable duration, cooldown interval, and daily ceiling in Settings), with automatic re-blocking upon expiry. Quota-weakening edits are locked during active sessions. |
| FR-10 | P0 | Offer “Report incorrect block” as an explicit local report/export; no automatic page-content upload. |
| FR-11 | P1 | Offer recurring schedules with explicit local timezone and overnight-window support. |
| FR-12 | P1 | Offer optional local aggregate statistics, disabled by default. |
| FR-13 | P2 | Add optional duration filtering and experimental cross-platform detection. |

Rule precedence: active focus session (strict) → whole-site block → supported short-format block → optional generic rules → allow. An active grace time window temporarily suspends format and whole-site blocking outside focus sessions for its 5-minute duration, but cannot be activated or used during an active focus session. Validate rules before enabling them; reject malformed hostnames and unsafe destinations.

## 7. Screens and interaction design

- **Popup:** protection status, site status, grace time balance (current pass availability, cumulative daily time used / daily ceiling), active countdown, Start focus session, Settings. Avoid a prominent one-click off switch.
- **Settings:** platforms, custom domains, session preferences, adjustable grace time quotas (pass duration, cooldown interval, daily ceiling, and cumulative usage tracker), permission status, privacy, and local diagnostic export.
- **Blocked screen:** concise reason, remaining session time if applicable, safe exit actions, and a "Use grace pass" action (visible only outside sessions when the cooldown interval and daily budget allow, displaying configured pass duration and 30-second confirmation delay).
- **Onboarding:** short explanation, platform selection, permissions, completion.

Use a restrained neutral palette, readable typography, clear focus states, keyboard navigation, sufficient contrast, reduced-motion support, and light/dark themes. Status must never rely on color alone. No shame-based wording, competitive streaks, or distracting animations.

## 8. Technical approach

Proposed stack: TypeScript, Firefox WebExtensions Manifest V3, a lightweight build tool, plain HTML/CSS for the small UI, and local extension storage. Final minimum Firefox version is an implementation decision after an API compatibility spike.

Use three complementary layers:
1. **Navigation enforcement:** declarative request rules for known routes where suitable; evaluate Firefox’s blocking webRequest API only where necessary. Firefox exposes request interception/blocking APIs with specific permission requirements. [2][3]
2. **Platform adapters:** early CSS and content scripts for cards, players, modals, and SPA navigation; each adapter owns matching, suppression, cleanup, and regression fixtures. Content scripts can interact with page DOM but have access constraints. [1]
3. **Shared policy engine:** one source of truth for permissions, enabled rules, session end time, and adjustable grace time quotas (tracking configured cooldown intervals, cumulative daily usage against the configured daily ceiling across all platforms, and active grace expiration).

Do not depend only on network interception: an already-loaded application may display new content without a document navigation. Do not broadly block shared media delivery domains, because this risks breaking permitted video.

Register enforcement early; recompute effective policy at startup, tab activation, settings changes, and timer expiry. Bound mutation observation to relevant page areas, batch DOM work, and avoid continuous whole-page polling. Use stable semantic markers where available and multiple signals instead of a single brittle CSS selector.

Keep adapter code packaged with extension releases. Treat selector changes as reviewed releases with regression checks. No remotely executed scripts.

## 9. Permissions and privacy

- Request site access for enabled platforms and custom domains; explain why each is needed.
- For future generic detection, offer broader access explicitly rather than silently expanding scope.
- Choose only API permissions actually required by the final implementation; avoid unrelated cookies, clipboard, downloads, or full browsing-history access.
- Store settings, rule definitions, session timestamps, and local grace time quota/usage records locally.
- No collection of messages, video titles, page text, complete browsing URLs, or account identifiers.
- If statistics are enabled, store only daily aggregate counts and session totals, with a clear reset option and 30-day retention.
- Private-window protection must be described as requiring the user’s separate Firefox permission and must be tested before advertised.

Host permissions gate content access; requesting permission and verifying it was granted are separate implementation responsibilities. [1][2]

## 10. Limitations and failure behavior

- Platform redesigns can break detection: show a Limited coverage state when a known adapter failure is detected, and provide local diagnostics. Absence of an error is not proof that every video is covered.
- An unidentified item remains available in standard mode; offer whole-site blocking for users who need stronger protection on that platform.
- For known blocked routes, failure to render the friendly block page must not allow navigation to continue.
- On mixed-content pages, do not destroy the whole page when an adapter fails.
- Focus locks add friction within the extension; they cannot guarantee enforcement against uninstalling/disabling the add-on, removing permissions, using another profile/browser, or changing system time.
- Do not promise zero playback leakage on unrecognized or dynamically changing players. Test known routes for prevention before playback and measure dynamic suppression separately.

## 11. Acceptance criteria and release gates

| Scenario | Required outcome |
|---|---|
| Direct supported short-video URL, including alternate tested URL variants | Navigation is blocked before video playback in the supported-route test matrix |
| In-page navigation to a supported viewer | Viewer is suppressed without a full reload; no redirect loop |
| Infinite-scroll insertion of recognized short cards | Newly inserted cards disappear; other content remains usable |
| Known short player inserted dynamically | Pause/suppress within a target 250 ms of detectable insertion on the reference machine; any observed audio/frame leakage is recorded |
| Normal YouTube tutorial and permitted social functions | All agreed allowed-content regression cases pass |
| Session started with several tabs open | Every permitted supported tab adopts the session rules |
| Firefox restart during focus session | Remaining time and locked settings recover correctly |
| Grace time budget enforcement | Activates temporary access for configured duration after 30s delay; attempts within cooldown interval are rejected; cumulative time across all platforms cannot exceed configured daily ceiling |
| Grace time expiration | When configured pass duration expires, active short-form tabs and players are immediately blocked/paused without a reload loop |
| Grace time configuration & focus session lock | Quota settings can be adjusted in Settings outside sessions; quota weakening and grace pass consumption are strictly locked while a focus session is active |
| Grace time or session expires while browser is closed | Correct effective state and remaining budgets are computed at next startup |
| Permission denied or revoked | Coverage visibly becomes Permission needed; no false protection claim |
| Private window | Correct behavior with permission enabled and a clear limitation when disabled |
| Keyboard-only use | All UI actions and dialogs are operable with visible focus |
| Observer performance | No observer feedback loop; no continuous DOM polling; added main-thread work stays below proposed 100 ms per 10-second scripted feed trace on the reference machine |

Test supported sites signed in and signed out where accessible, at desktop and narrow widths, with refreshed/restored tabs, multiple tabs, embeds, and multiple UI languages. Maintain permitted-content fixtures alongside blocked-content fixtures.

Release gate: 100% pass on the explicitly documented supported-route suite and zero known critical regressions in preserved functions. This is a test-suite target, not a claim of universal internet coverage.

## 12. Success measurement

Primary user outcome: fewer unplanned short-video sessions while completing intended browsing tasks.

For an initial seven-day personal trial, record a brief daily self-report of unwanted viewing episodes and disruption to useful browsing; compare with a short pre-install baseline. Do not infer time saved from blocked-item counts.

Engineering measures: supported-route pass rate, false blocks in the allowed-content suite, permission-state accuracy, session persistence, and adapter performance. If local statistics are enabled, count blocked navigation attempts separately from hidden cards and deduplicate repeated observer events.

## 13. Delivery plan

1. **Feasibility spike:** verify live platform surfaces, Manifest V3 APIs, permissions, route interception, and dynamic playback suppression; publish a coverage matrix.
2. **Core MVP:** YouTube Shorts, whole-site TikTok blocking, policy engine, popup, onboarding, focus session, and custom domains.
3. **MVP completion:** Instagram/Facebook Reels adapters, dynamic navigation, permission recovery, accessibility, and regressions.
4. **Personal beta:** seven-day use, false-positive review, performance checks, and Firefox add-on packaging/review preparation.
5. **Expansion:** schedules, optional statistics, more adapters, duration mode, and experimental generic detection.

Do not announce four-platform MVP completion until all four platform gates pass. If mixed-content filtering proves unreliable, present a platform as limited and offer whole-site blocking explicitly.

## 14. Proposed decisions for version 0.1

- Desktop Firefox first.
- Always-on blocking; 50-minute default focus session.
- Grace time allowed outside sessions: defaults to 5 minutes per 3-hour window with a 30-minute daily ceiling cumulative across all platforms; user-adjustable in Settings (locked against weakening during active focus sessions), requiring a 30-second deliberate delay.
- Block platform-defined short formats regardless of duration.
- Block all of TikTok by default.
- Preserve normal long-form YouTube and useful social functions where verified.
- No bypass during focus sessions through the extension UI.
- Optional duration-based blocking and generic detection follow after reliable platform adapters.

## Technical references

These references support browser capabilities and constraints, not the proposed product requirements.

[1] Mozilla MDN, “Content scripts.” https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts

[2] Mozilla MDN, “webRequest.” https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest

[3] Mozilla MDN, “Intercept HTTP requests.” https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Intercept_HTTP_requests

Sources consulted 15 October 2026. Platform-specific behavior must still be validated during implementation.