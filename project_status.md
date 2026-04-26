# LUMIÈRE Portfolio Project Status

## Project Specifications

### Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Vanilla CSS (globals.css), No Tailwind
- **Animations**: GSAP + ScrollTrigger
- **Smooth Scroll**: Lenis
- **3D Engine**: Three.js (@react-three/fiber + @react-three/drei)
- **Typography**: SplitType for text reveals

### Typography System
- **Display**: "Gloock" (Google Fonts) - Editorial italic serif
- **Secondary Display**: "Fraunces" (Google Fonts) - Variable font
- **Body/UI**: "DM Sans" (300/400 weight)
- **Base Size**: 15px, Line-height 1.9
- **Hero Title**: `clamp(7rem, 16vw, 15rem)`

### Color System
- `--void`: `#080709` (Hero background)
- `--ink`: `#141210` (Dark content)
- `--parchment`: `#F4F0E8` (Light content)
- `--gold`: `#BF8C3A` (Accent)

---

## Current Implementation

### 1. Core Infrastructure
- [x] Next.js project initialized with TypeScript and App Router.
- [x] All required dependencies installed (`gsap`, `lenis`, `three`, `split-type`, etc.).
- [x] Global styling implemented in `src/app/globals.css` covering all design tokens and section-specific layouts.

### 2. Global Components
- [x] **ClientWrapper**: Manages Lenis smooth scroll, GSAP ticker synchronization, and global UI elements.
- [x] **Custom Cursor**: Integrated with lerp following and hover scaling effects.
- [x] **Page Loader**: Animated site title reveal using GSAP and SplitType.
- [x] **Navigation**: Sticky nav with automatic theme switching (light/dark) based on current section and smooth scroll links.
- [x] **Grain Overlay**: Fixed SVG feTurbulence noise at 4% opacity.

### 3. Sections
- [x] **Section 1 (Hero)**: 3D Three.js scene loading `bulbs.glb` with scroll-synced camera zoom, point light intensity, and emissive glow.
- [x] **Section 2 (Statement)**: Full-viewport pinned text reveal word-by-word with blur/opacity transition.
- [x] **Section 3 (Services)**: Hover-interactive rows with gold line expansion and slide-in descriptions.
- [x] **Section 4 (Works)**: Alternating layouts for 3 projects with clip-path image reveals and parallax effects.
- [x] **Section 5 (Marquee)**: Infinite CSS-based horizontal scrolling text.
- [x] **Section 6 (About)**: Parallax image with gold offset border and staggered text entrance.
- [x] **Section 7 (Process)**: Pinned multi-step reveal with large numbering and progress line.
- [x] **Section 8 (Contact)**: Large typographic signature and animated email link.

---

## What's Left to Do

### 1. Performance & Polish
- [ ] **3D Optimization**: Ensure the GLB model (27MB) is optimized for web (currently using the raw file).
- [ ] **Responsive Design**: While using `clamp()` for typography, some grid layouts might need specific mobile media queries for better alignment on small screens.
- [ ] **Cross-Browser Testing**: Verify custom cursor and Three.js transmission materials on Safari/Firefox.

### 2. Content & Assets
- [ ] **Model Check**: Verify that the `traversal` logic in `ThreeScene.tsx` correctly identifies the glass and filament parts of the provided GLB (currently based on common naming patterns).
- [ ] **Image Placeholders**: Replace Unsplash source URLs with local optimized images if production performance is a priority.

### 3. Technical Debt
- [x] **Lenis Typing**: Resolved type error regarding `smoothTouch` in `ClientWrapper.tsx`.
- [x] **Three.js Typing**: Resolved `transmission` type error in `ThreeScene.tsx` via casting.
- [ ] **SplitType Reversion**: Ensure all SplitType instances are properly reverted on component unmount to prevent DOM pollution during hot-reloads.
