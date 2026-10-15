---
name: ShortStop
description: High-contrast monochrome focus system for intentional browsing
colors:
  bg-canvas: "#09090b"
  bg-card: "#141416"
  bg-subtle: "#1c1c1f"
  border-subtle: "#27272a"
  border-emphasis: "#3f3f46"
  text-primary: "#fafafa"
  text-secondary: "#a1a1aa"
  text-muted: "#71717a"
  accent-white: "#ffffff"
  accent-white-text: "#09090b"
  accent-white-hover: "#e4e4e7"
  status-warn: "#ef4444"
  status-warn-bg: "rgba(239, 68, 68, 0.12)"
  status-warn-border: "rgba(239, 68, 68, 0.35)"
  status-safe: "#22c55e"
  status-safe-bg: "rgba(34, 197, 94, 0.12)"
  status-safe-border: "rgba(34, 197, 94, 0.35)"
typography:
  display-hero:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  display-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  body-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "1rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent-white}"
    textColor: "{colors.accent-white-text}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-white-hover}"
    textColor: "{colors.accent-white-text}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.bg-subtle}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.bg-card}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: ShortStop

## Overview

**Creative North Star: "The Obsidian Instrument"**

ShortStop is engineered as a precision cognitive barrier against algorithmic short-video doomscrolling. Its visual atmosphere is architectural, restrained, and unmistakably quiet. Rather than adopting the playful, pastel, or gamified aesthetics typical of consumer productivity extensions, ShortStop feels like high-grade laboratory equipment: dark obsidian planes, razor-sharp 1px borders, and pure white accents that command respect without shouting.

The interface prioritizes calmness, scanability, and spatial honesty. There are no decorative illustrations, celebratory confetti, or artificial pulsing indicators. Every visual element either clarifies system state or facilitates an intentional decision.

**Key Characteristics:**
- **Zero Decorative Slop:** No gradient text, drop shadows used as halos, or artificial pulsing dots.
- **Monochrome Foundation:** Built entirely from deep black, neutral dark charcoals, and calibrated zinc greys.
- **Strictly Functional Signaling:** Pure white provides focal accentuation; crisp signal red and emerald green exist solely for functional warning/safe state differentiation.
- **Tabular Geometry:** Timers and quotas utilize tabular figures to maintain physical visual stability during countdowns.

## Colors

The palette is strictly divided between an architectural monochrome foundation and two high-contrast functional signals.

### Primary
- **Accent White** (#FFFFFF): Used for primary affirmative action buttons, active pill tabs, slider thumbs, and 2px focus rings. Its high contrast on dark obsidian provides unmistakable focal hierarchy.

### Neutral
- **Obsidian Black Canvas** (#09090B): The deep backdrop grounding every window and card.
- **Surface Charcoal** (#141416): The container fill for primary cards, modals, and popup shells.
- **Inset Subtle Grey** (#1C1C1F): Used for recessed inputs, toggle backgrounds, and secondary buttons.
- **Razor Border** (#27272A): 1px structural boundary establishing crisp component containment.
- **Border Emphasis** (#3F3F46): Border state for hover, active tabs, and secondary outlines.
- **Primary Text** (#FAFAFA): High-legibility crisp white for titles, values, and primary labels.
- **Secondary Text** (#A1A1AA): Neutral zinc grey for descriptions and explanations (contrast ≥7.4:1).
- **Muted Text** (#71717A): Subtle metadata, units, and timestamps (contrast ≥4.6:1).

### Functional Signals
- **Signal Red** (#EF4444 in dark, #991B1B in light): Reserved strictly for active lockouts, warning banners, blocked notifications, and cancel actions.
- **Emerald Safe** (#22C55E in dark, #14532D in light): Reserved strictly for verified active protection and safe destination confirmations.

### Named Rules
**The Monochromatic Dominance Rule.** The interface is ≥95% black, grey, and white. Color is forbidden from decorative accents, backgrounds, or branding flourishes.
**The Binary Signal Rule.** Red and Green are reserved strictly for safety and danger states. Neither may ever be used for decorative chips or non-status typography.

## Typography

**Display & Body Font:** System UI Sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).
**Numerical Character:** Tabular figures (`font-variant-numeric: tabular-nums`) applied to all clocks, timers, and quotas.

### Hierarchy
- **Display** (Bold 700, 1.75rem / 28px, line-height 1.2, letter-spacing -0.025em): Used for primary blocked statements (*"This short video is blocked."*).
- **Headline** (Bold 700, 1.25rem / 20px, line-height 1.3, letter-spacing -0.02em): Used for card titles and modal headings.
- **Title** (Semi-bold 600, 1.0625rem / 17px, line-height 1.4): Section headers in settings and preferences.
- **Body** (Regular 400, 0.875rem / 14px, line-height 1.5): Standard descriptions, hints, and explanatory paragraphs.
- **Label** (Semi-bold 600, 0.6875rem / 11px, letter-spacing 0.06em, uppercase): Structural tags, platform pill badges, and table column headers.

### Named Rules
**The Tabular Clock Rule.** Any numeral that changes dynamically (seconds, minutes, percentages) must explicitly render with `tabular-nums` to eliminate layout jitter.

## Layout

ShortStop delivers four distinct views tailored to spatial constraints:
1. **Action Popup:** Fixed 340px width container optimized for instant vertical scanability.
2. **Blocked Interception Page:** Centered fluid card (`max-width: 520px`) with generous vertical padding, isolated in the center of the viewport.
3. **Settings Dashboard:** Centered reading column (`max-width: 720px`) with responsive 3-column input grids collapsing to 1-column on viewports `<600px`.
4. **Onboarding Flow:** Welcoming centered card (`max-width: 500px`) with clean vertical feature rows.

### Spacing Scale
Rhythm relies on consistent 4px grid multiples: 4px (`xs`), 8px (`sm`), 12px (`md`), 16px (`lg`), 24px (`xl`), and 40px (`xxl`).

## Elevation & Depth

ShortStop rejects faux-3D skeuomorphism, colored halos, and heavy blurs. Depth is achieved primarily through **tonal layering and razor borders**:
- Level 0 (Canvas): `#09090B`
- Level 1 (Surfaces): `#141416` with 1px border `#27272A`
- Level 2 (Recessed inputs / Secondary buttons): `#1C1C1F`
- Level 3 (Floating Modals / Intercept Card): Elevated with clean ambient shadow (`0 20px 25px -5px rgba(0, 0, 0, 0.5)`).

### Named Rules
**The Flat-Surface Rule.** Cards and controls sit flush in their plane. Shadows exist solely on floating modal dialogs to establish layer isolation.

## Shapes

- **Radius Scale:**
  - `4px` (`sm`): Small badges, platform status pills.
  - `6px` (`md`): Buttons, text inputs, form controls.
  - `8px` (`lg`): Inner feature containers and sub-cards.
  - `12px` (`xl`): Primary window shells, setting cards, and modal dialogs.
  - `9999px` (`full`): Status badges and custom switch sliders.
- **Borders:** Continuous 1px solid stroke on all boundaries; no heavy or asymmetric borders.

## Components

### Buttons
- **Primary:** Solid pure white (`#FFFFFF`) with dark obsidian text (`#09090B`), radius 6px, padding `10px 20px`. Hover shifts to `#E4E4E7`.
- **Secondary:** Subdued charcoal background (`#1C1C1F`) with razor border (`#27272A`) and white text. Hover darkens to `#27272A`.
- **Outline / Ghost:** Transparent background with subtle border. Hover fills with `#1C1C1F`.
- **Danger:** Signal red background (`#EF4444`) with white text. Reserved for confirming grace unlocks and resetting rules.
- **Focus Ring:** Explicit 2px white outline with 2px offset (`outline: 2px solid #FFFFFF; outline-offset: 2px`).

### Status Badges & Pills
- **Protected:** Emerald green fill (`rgba(34, 197, 94, 0.12)`), green border (`rgba(34, 197, 94, 0.35)`), green text (`#22C55E`).
- **Warning / Locked:** Signal red fill (`rgba(239, 68, 68, 0.12)`), red border (`rgba(239, 68, 68, 0.35)`), red text (`#EF4444`).
- **Neutral / Focus:** Subtle charcoal fill (`#1C1C1F`), grey border (`#3F3F46`), crisp white text (`#FFFFFF`).

### Countdown Circle (Signature Component)
- **Geometry:** 7.5rem (120px) circular container with 2px solid signal red border and generous 1rem interior padding.
- **Content:** Centered 2.25rem bold tabular numeral with uppercase "SECONDS" label beneath.

### Switch Toggles
- **Track:** 36px × 20px pill. Unchecked is dark grey (`#27272A`), checked is pure white (`#FFFFFF`).
- **Thumb:** 16px circular knob with smooth transition.

## Do's and Don'ts

### Do:
- **Do** maintain strict WCAG AA contrast (≥4.5:1 for body, ≥3:1 for headers) across both dark and light modes.
- **Do** style browser surfaces (`::selection`, custom scrollbars, and `:focus-visible` outlines).
- **Do** enforce tabular numbers (`tabular-nums`) on any counter, clock, or numerical metric.
- **Do** provide `@media (prefers-reduced-motion: reduce)` alternatives that neutralize transitions for motion-sensitive users.

### Don't:
- **Don't** use decorative pulsing dots or artificial status animations.
- **Don't** introduce colorful backgrounds, brand gradients, or blue/indigo tints.
- **Don't** use shame-based or patronizing language on blocked screens.
- **Don't** allow text in circular progress or countdown containers to touch the outer border boundary.
