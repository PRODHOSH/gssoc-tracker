<h1 align="center">GSSoC Tracker - `ctrl-alt-upgrade` Branch</h1>

<p align="center">Comprehensive documentation of the UI overhaul, GSAP animations, Three.js integrations, and analytics tracking introduced in this branch compared to the original `main` branch.</p>

---

## Overview

The `ctrl-alt-upgrade` branch represents a massive leap forward in the visual fidelity and interactivity of the GSSoC Tracker. Originally designed as a fast, functional utility for tracking PRs, this branch introduces a layer of **premium, hardware-accelerated animations**, **in-depth visual analytics**, and **modern responsive components**. 

This document provides a minute-by-minute breakdown of every modification made to the Landing Page, the PR Tracker Page, the Mentor Page, and the global infrastructure. It serves as an architectural map for developers looking to extend or build upon these new systems.

---

## 1. Global Modifications

### Interactive Click Explosions
- **File:** `src/components/animations/ClickExplosion.tsx`
- **What changed:** A global click listener has been attached to the root layout. Clicking anywhere on the screen (except on interactive elements like buttons/links) triggers a high-performance GSAP timeline that spawns 20 neon-green snowflake icons.
- **How it works:** Uses `document.createElement` to dynamically mount temporary nodes to the DOM precisely at `e.clientX` / `e.clientY`. GSAP handles the outward radial scatter (`Math.cos(angle)`, `Math.sin(angle)`) and spin physics, before instantly garbage-collecting the DOM nodes upon completion to prevent memory leaks.

---

## 2. Landing Page (`/`)

The landing page has been entirely decoupled from the original static design and rebuilt with immersive 3D graphics and modern component segregation.

### WebGPU Galaxy Background
- **File:** `src/components/landing/GalaxyBackground.tsx`
- **What changed:** Replaced the plain dark background with a bleeding-edge `three.js` (WebGPU) implementation of a rotating, interactive galaxy.
- **How it works:** It uses `three/webgpu` and `three/tsl` (Three.js Shading Language) to render tens of thousands of particles efficiently. If WebGPU is not supported by the browser, it gracefully logs a warning and disables the rendering. 
- **Type Patches:** Added `src/types/three.d.ts` to manually declare modules for `three/webgpu`, `three/tsl`, and the `navigator.gpu` interface, resolving Next.js build errors.

### Modular UI Architecture
The monolithic landing page was split into hyper-focused, semantic React components:
- `LandingHero.tsx`: The primary call-to-action area over the galaxy background.
- `LandingFeatures.tsx` & `LandingProtocol.tsx`: Broken-down explanations of the tracker's functionality.
- `LandingScoring.tsx`: Visual breakdown of the PR point systems.
- `HomeNavbar.tsx`: Fixed spacing and mobile menu layout issues present in the original version.

---

## 3. PR Tracker Page (`/pr-tracker/[username]`)

The Tracker page received the heaviest modifications, transitioning from a simple stat read-out to a fully-fledged analytics dashboard.

### 3D Stacked Stats Grid (Hover-to-Expand)
- **File:** `src/components/pr-tracker/StatsGrid.tsx`
- **What changed:** The static CSS grid of PR stats (Total Points, Merged, Streak) was rewritten into a state-driven GSAP Client Component.
- **The Visual:** Cards initially pile up in the dead-center of the container with a pronounced 3D depth effect (staggered Y-offsets of `16px`, horizontal fanning of `8px`, descending scale down by `0.06`, and alternating rotations).
- **The Interaction:** Hovering (or tapping on mobile) triggers a high-speed `gsap.to()` tween that snaps the cards out into their natural responsive CSS grid slots instantly (`0.5s` duration, `back.out(1.1)` ease).
- **The State Machine:** An internal `timerRef` ensures the cards auto-collapse back into the messy 3D pile if left untouched for 7 seconds. Re-hovering resets the timer.

### Zig-Zag Scroll Entrance Animations
- **File:** `src/components/animations/ScrollSlideIn.tsx`
- **What changed:** A reusable GSAP wrapper component using `ScrollTrigger`.
- **How it works:** As the user scrolls down the dashboard, elements wait until they cross the 85% viewport threshold, then slide into their final positions from a massive `400px` horizontal offset.
- **Implementation:** Integrated into `page.tsx` and `AnalyticsCharts.tsx` to create a deliberate left-right-left zig-zag entrance sequence for the Heatmap, Charts, and PR Tables. The parent container now strictly enforces `overflow-x-hidden` to prevent layout breaking during the 400px off-screen offset.

### Advanced Data Visualization
- **`ContributionHeatmap.tsx`**: Added a GitHub-style green activity grid to visualize commit frequency and PR merges over time.
- **`AnalyticsCharts.tsx`**: Integrated Recharts to provide:
  1. A Radar/Bar chart for PR Difficulty Level distribution.
  2. A Doughnut chart for Quality Multiplier breakdown.
- **`LiveClock.tsx`**: Added a real-time updating clock to the tracker header for time-zone syncing.
- **`QuickFeedbackPopup.tsx`**: A new interactive toast notification system for user feedback.

---

## 4. Mentor Page (`/mentor/[username]`)

- **Component Reuse:** The Mentor page now inherits the advanced data visualizations built for the Contributor tracker (`MentorStats.tsx`, `MentorCharts.tsx`).
- **Type Safety Fix:** Modified `page.tsx` to correctly map the `MentorPR` data shape into a mock `TrackedPR` interface, allowing `AnalyticsCharts.tsx` to flawlessly consume the mentor data without throwing TypeScript compilation errors during `npm run build`.

---

## 5. PR Validator Page (`/pr-check`)

- **Component Split:** The monolithic PR Checker page was componentized into `ValidatorNavbar.tsx`, `ValidatorSpecs.tsx`, and `ValidatorHistory.tsx`.
- **UI Refresh:** Now shares the global `ClickExplosion` and overarching brand aesthetic established in the `ctrl-alt-upgrade` branch.

---

## Starting Development on this Branch

If you are cloning this branch to develop further features:

1. **GSAP is Core:** GSAP (`gsap`, `@gsap/react`, `ScrollTrigger`) is now heavily integrated into the layout. If a component is behaving strangely on mount, check for conflicting CSS transitions or GSAP `.set()` initializations.
2. **WebGPU Nuances:** The Galaxy Background relies on experimental Three.js APIs. Ensure you keep `src/types/three.d.ts` updated if you import further experimental add-ons, or the Next.js production build will fail type-checking.
3. **Z-Index Wars:** The `StatsGrid` dynamically alters `z-index` (from 50 down to 1) during its hover expansion. Ensure surrounding absolute elements (like the `ClickExplosion` wrapper at `z-index: 9999`) don't interfere with pointer events.

---

> **Built with GSAP, Three.js, and Turbopack on the `ctrl-alt-upgrade` branch.**
