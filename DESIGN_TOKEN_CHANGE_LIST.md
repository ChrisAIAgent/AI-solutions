# Design Token Change List — Marketing Library Portal Visual Upgrade v2

> **Date:** 2026-07-09
> **Scope:** SCSS/CSS visual polish upgrade (variables, glassmorphism, gradients, micro-interactions, motion)
> **Rule:** All colors via CSS variables only; no hardcoded values in components.

---

## 1. New Color Tokens (`_colors.scss`)

| Token | Light Value | Dark Value | Purpose |
|-------|------------|-----------|---------|
| `--brand-cyan-bright` | `#2EA7FF` | `#2EA7FF` | Aurora gradient start |
| `--brand-teal` | `#13DDC4` | `#13DDC4` | Accent teal |
| `--aurora-gradient` | `linear-gradient(135deg, #2EA7FF, #7B2FFF, #C850C0)` | same | Hero badge / FAB / active states |
| `--aurora-gradient-subtle` | `rgba(...)` low opacity bg | same | Subtle background fills |
| `--brand-gradient-hover` | darker variant | same | Button hover states |
| `--border-color-subtle` | `#EEECEF` | `rgba(255,255,255,0.04)` | Secondary borders (cards, dividers) |
| `--glass-bg` | `rgba(255,255,255,0.72)` | `rgba(18,18,26,0.78)` | Glassmorphism surface |
| `--glass-border` | `rgba(255,255,255,0.5)` | `rgba(255,255,255,0.08)` | Glass border |
| `--glass-shadow` | `0 8px 32px rgba(123,47,255,0.06)` | `0 8px 32px rgba(0,0,0,0.35)` | Glass shadow |
| `--glass-blur` | `blur(20px)` | `blur(24px)` | Glass blur amount |
| `--glow-purple` | `rgba(123,47,255,0.20)` | `rgba(123,47,255,0.25)` | Soft purple glow |
| `--glow-purple-strong` | `rgba(123,47,255,0.35)` | `rgba(123,47,255,0.45)` | Strong purple glow |
| `--glow-aurora` | `rgba(46,167,255,0.15)` | `rgba(46,167,255,0.18)` | Aurora/cyan glow |
| `--shadow-card` | `0 2px 12px rgba(0,0,0,0.04)` | `0 2px 12px rgba(0,0,0,0.20)` | Default card shadow |
| `--shadow-card-hover` | `0 12px 40px rgba(123,47,255,0.12)` | + extra glow | Card hover shadow |
| `--shadow-elevated` | `0 18px 56px rgba(0,0,0,0.10)` | `0 18px 56px rgba(0,0,0,0.40)` | Elevated element shadow |
| `--radius-pill` | `999px` | same | Capsule / pill radius |

### Dark Mode Surface Changes

| Token | Before | After | Reason |
|-------|--------|-------|--------|
| `--bg-page` | `#08080D` | **`#0B0B12`** | Slightly warmer near-black |
| `--bg-surface` | `#0E0E16` | **`#12121A`** | Better contrast step |
| `--bg-card` | `#161622` | **`#181824`** | More depth from page |
| `--bg-hover` | `#1E1E2C` | **`#222230`** | Clearer hover feedback |
| `--text-primary` | `rgba(255,255,255,0.94)` | same | — |
| `--text-secondary` | `rgba(255,255,255,0.68)` | **`rgba(255,255,255,0.66)`** | Slightly more restraint |
| `--text-tertiary` | `rgba(255,255,255,0.42)` | **`rgba(255,255,255,0.40)`** | Clearer hierarchy |

---

## 2. New Typography Tokens (`_typography.scss`)

| Token | Change | Details |
|-------|--------|---------|
| `--font-heading` | **NEW: `'Sora', 'Inter', ...`** | All headings use Sora now |
| `--font-mono` | Added `'JetBrains Mono'` first | Was SF Mono fallback before |
| All `--fs-*` sizes | Now use **`clamp()`** for fluid scaling | Responsive font sizing built-in |

---

## 3. New Motion/Easing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` | Primary easing (all transitions) |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy/elastic (icon scale, panel expand) |
| `--duration-micro` | `120ms` | Focus/hover micro-feedback |
| `--duration-fast` | `200ms` | Quick state changes |
| `--duration-normal` | `300ms` | Standard transition |
| `--duration-slow` | `500ms` | Section entrance animations |
| `--noise-opacity` | `0.018` (light) / `0.03` (dark) | Subtle grain overlay on body |

---

## 4. Per-Module Upgrade Summary

### Navbar
- ✅ Glass background with `backdrop-filter: blur(20px/24px)`
- ✅ `.scrolled` class triggers deeper shadow + border on scroll (>20px)
- ✅ Control buttons: gradient pseudo-element hover, glow shadow
- ✅ Active state: subtle gradient bg + glow
- ✅ Logo drop-shadow glow effect

### Hero Section
- ✅ Layered radial gradient background (3 layers + dot-grid pattern)
- ✅ Two floating aurora orbs (`::before`, `::after`) with slow float animation
- ✅ Badge: Aurora gradient + pulse box-shadow animation
- ✅ Title uses `--font-heading` (Sora)
- ✅ Stats: Glass card style, numbers use `background-clip: text` aurora gradient
- ✅ Search bar: 1.5px border → focus glow ring (4px spread + inset)
- ✅ Filter chips: Glass bg, gradient fill on active via `::before`

### Showcase
- ✅ Cinematic dark card: dual-tone gradient base + inner vignette
- ✅ Blobs: `mix-blend-mode: screen`, larger/slower, 23-27s cycles
- ✅ Video wrapper: inner box-shadow vignette, hover scale(1.02)
- ✅ Video controls: backdrop-filter blur, scale bounce on hover

### Categories Grid
- ✅ Cards: `backdrop-filter: blur(12px)` glass + gradient border via mask pseudo-element
- ✅ Hover: translateY(-5px) + gradient border reveal + glow shadow
- ✅ Icon container: unified size (54px), gradient bg + shadow, scale bounce on card hover
- ✅ Card footer: top border separator
- ✅ Text clamp on descriptions (2 lines)

### Sub-Panels
- ✅ Elastic expand: `@keyframes panelExpand` with slight overshoot (scale 1.003)
- ✅ Top aurora accent line on open (via `::before`)
- ✅ Sub-items: hover row lift (-2px) + glow + arrow translateX

### TOC Sidebar
- ✅ Glass background + blur(16px)
- ✅ Active item: brand gradient left border + `::after` glow indicator + `::before` fill sweep on hover
- ✅ Custom scrollbar (4px thumb, brand-purple hover)
- ✅ FAB button: Aurora gradient + rotate(3deg) on hover + stronger glow

### Footer
- ✅ Top gradient line (aurora, 60% width centered)
- ✅ Logo: gradient text + drop-shadow glow
- ✅ Tagline: italic style

### Back to Top
- ✅ Glass bg + backdrop-filter
- ✅ Aurora gradient on hover + translateY(-3px)

---

## 5. Global Enhancements

| Feature | Implementation |
|---------|---------------|
| Noise texture | SVG feTurbulence data URI as body::before overlay |
| Scroll fade-up | `.fade-up-element` class + IntersectionObserver (threshold 0.08) |
| Reduced motion | `prefers-reduced-motion: reduce` disables all animations globally |
| Focus visible | 2px solid purple outline with offset for keyboard navigation |
| Font loading | Google Fonts: Inter + Sora + JetBrains Mono + Noto Sans SC |
| Scroll spy navbar | JS adds `.scrolled` class at >20px scroll position |
| Build output | CSS: 59.17KB gzipped (acceptable increase for premium visuals) |

---

## 6. Files Modified

| File | Action | Key Changes |
|------|--------|-------------|
| `src/scss/includes/variables/_colors.scss` | **Rewritten** | ~50 new tokens (glow, glass, motion, aurora, dark upgrades) |
| `src/scss/includes/variables/_typography.scss` | **Rewritten** | +Sora heading font, JetBrains Mono mono, fluid clamp() sizing |
| `src/scss/main.scss` | **Rewritten** | All sections upgraded with glass/glow/motion treatments |
| `index.html` | **Edited** | Added Sora+JetBrains Mono to fonts, added .fade-up-element classes to 3 sections |
| `src/js/main.js` | **Edited** | Added navbar scroll detection (section 0.5) + IntersectionObserver (section 12) |

---

## 7. Red Lines Verified ✅

- [x] Brand purple hue family preserved (#7B2FFF primary unchanged)
- [x] No new frameworks or build tools introduced
- [x] All colors via CSS variables — zero hardcoded in components
- [x] Theme toggle, language switch, search, filter, categories, video carousel, TOC, back-to-top — all functional
- [x] Responsive layout preserved (1440px max, TOC ≥1280px, FAB <1280px)
- [x] No unauthorized fonts/images — all Google Fonts (Inter, Sora, JetBrains Mono, Noto Sans SC)
- [x] prefers-reduced-motion fully respected
- [x] Build succeeds without errors
