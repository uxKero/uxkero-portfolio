---
version: anydesign-1
name: Lifeline — Evil Rabbit (Founding Designer at Vercel)
source: https://lifeline.evilrabbit.com/
captured_at: 2026-06-28
description: |
  A horizontally-scrolling autobiographical timeline rendered as a single quiet rail across
  pure black (dark) / pure white (light). Text lives at near-silence in zinc-500 and only
  resolves to full contrast on hover, so reading becomes an act of attention. There is no
  chrome, no card, no shadow doing UI work — the entire brand is carried by restraint,
  Geist typography, tabular numerals, and a dashed lifeline axis punctuated by two-color
  people dots (blue mentors, pink met-in-person).

colors:
  surface: "#000000"
  surface-light: "#FFFFFF"
  text-primary: "#FFFFFF"
  text-primary-light: "#000000"
  text-muted: "#71717A"
  text-faint: "#52525B"
  border: "#FFFFFF1A"
  border-light: "#0000001A"
  rail: "#27272A"
  rail-light: "#D4D4D8"
  tick: "#A1A1AA"
  accent-mentor: "#3B82F6"
  accent-met: "#EC4899"
  ring: "#3B82F680"

typography:
  year:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 20px
    feature: tabular-nums
  age:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 16px
    feature: tabular-nums
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.08em
    textTransform: uppercase
  event:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: -0.01em
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5

spacing:
  base: 4px
  scale: [4, 8, 12, 16, 20, 24, 32, 40, 64]

rounded:
  none: 0px
  full: 9999px

components:
  nav-bar:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    typography: "{typography.body}"
    padding: 0 24px
  year-column:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    typography: "{typography.year}"
    rounded: "{rounded.none}"
    padding: 0 32px 0 0
  event-text:
    textColor: "{colors.text-muted}"
    typography: "{typography.event}"
  person-dot:
    backgroundColor: "{colors.accent-mentor}"
    rounded: "{rounded.full}"
  theme-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.full}"
---

# Design Analysis — Lifeline (Evil Rabbit)

> Analysis generated with the `anydesign` skill.
> Date: 2026-06-28
> Analysis emphasis: reconstruction + design system

---

## Source

- **Source type**: URL (Next.js SPA — empty SSR HTML)
- **Path / URL**: `https://lifeline.evilrabbit.com/`
- **Capture method**: Playwright multi-viewport screenshot (desktop 1440×900, tablet 768×1024, mobile 375×812) + scroll-capture + post-JS rendered HTML + CSS custom-property extraction (1 stylesheet, 312 raw vars / 79 deduped)
- **Detected limitations**: Hover/active states inferred from CSS classes, not filmed. Light mode confirmed via classes but screenshots were taken in the site's default dark mode. Horizontal auto-scroll/pinning behavior inferred from `will-change-transform` + `translate3d` inline styles.

---

## TL;DR

A pure black/white autobiographical **lifeline**: one quiet horizontal rail, one column per year (age 0/1986 → age 40/2026), events hanging beneath each year in muted `zinc-500` that brightens to full contrast only on hover. The brand is built entirely from **subtraction** — Geist + tabular numerals + a dashed axis + two-color people dots (blue `#3B82F6` mentors / pink `#EC4899` met-in-person). Reconstruct with Tailwind (already its native stack): the whole look is `bg-black text-zinc-500` + `group-hover:text-white` + a horizontal scroll container.

---

## 1. Visual identity

### 1.1 Surface description

**Personality** (5 adjectives): silent, editorial, precise, confident, archival.

**Mood**: a museum vitrine at night. Calm, almost reverent — the design asks you to lean in rather than shouting for attention.

**Detectable stylistic references**: Vercel / Geist design language (unsurprising — author directs Geist). Swiss-grid editorial timelines, terminal/monospace data tables, the "near-invisible until hovered" interaction pattern seen in Linear and Rauno Freiberg's work.

**Information density**: minimalist at rest, dense on demand (a 40-year dataset compressed into one scroll).

**Implicit positioning**: speaks to designers, founders, and engineers who read restraint as a flex. Zero onboarding, zero explanation — it assumes a literate audience.

**Confidence**: ✅ high

### 1.2 Brand voice / Atmosphere

This design believes its audience does not need to be persuaded, only *trusted*. Every conventional portfolio move — hero headline, project cards, big imagery, CTAs — is deliberately withheld. The information starts at `text-muted` (#71717A), below comfortable reading contrast, and the only way to read any single moment clearly is to hover it, paying it individual attention. That is the thesis made physical: a life is not a highlight reel, it is a long quiet rail of years where most cells are empty and a few carry weight. The restraint is not minimalism-as-fashion; it is an argument that the work speaks for itself once you bother to look.

The horizontal axis (time as left-to-right scroll) rejects the vertical scroll-feed default, which forces the visitor into a deliberate, lateral act of "moving through time." The two-color dot system (blue mentors, pink met-in-person) is the only chromatic indulgence in the entire interface, and it is reserved exclusively for *people* — the implicit statement that relationships are the one thing worth coloring in a monochrome life.

This is a brand voice a generic designer could not have produced without seeing it: most would have added contrast for "accessibility," a hero for "conversion," and cards for "scannability." This design refuses all three on purpose.

### 1.3 The "ONE brand thing"

- **The thing**: the **dashed horizontal lifeline rail** with text sitting at sub-readable `zinc-500` that resolves to full contrast only under the pointer.
- **Why it carries the brand**: remove the rail + the hover-to-reveal contrast and you are left with a generic dark-mode list. The interaction *is* the identity — reading requires attention, exactly the brand's thesis.
- **How everything else supports it**: no shadows, no cards, no fills, no second accent, a single typeface — every other decision is suppressed so the rail and the hover-reveal are the only events on screen.
- **Where it appears (and where it doesn't)**: the rail spans the entire timeline; it is never decorated, never colored, never thickened. The two accent colors appear *only* on people dots — never on text, links, or the rail itself.

*Confidence*: ✅ high

---

## 2. Design System (tokens)

### 2.1 Colors

Color is defined as shadcn-style HSL channels in two themes. Default render is **dark**.

**Dark theme (default)**

| Token | Hex | Role | Where it appears | Confidence |
|---|---|---|---|---|
| `surface` | `#000000` | Base background | `body`, nav (at 80% + blur) | ✅ high |
| `text-primary` | `#FFFFFF` (≈`#FAFAFA`) | Resolved text on hover | Hovered year/events, logo | ✅ high |
| `text-muted` | `#71717A` (zinc-500) | Default text | All years, ages, events at rest | ✅ high |
| `text-faint` | `#52525B` (zinc-600) | Dark-mode labels | "Age"/"Years" labels, ages | ✅ high |
| `border` | `rgba(255,255,255,0.10)` | Nav hairline | `border-b` on nav | ✅ high |
| `rail` | `#27272A` (zinc-800) | Dashed lifeline axis | The horizontal time rail | ✅ high |
| `tick` | `#A1A1AA` (zinc-400) | Year tick marks | 10px vertical tick per year | ✅ high |
| `accent-mentor` | `#3B82F6` (blue-500) | Mentor people dots | Dot before mentor names | ✅ high |
| `accent-met` | `#EC4899` (pink-500) | Met-in-person dots | Dot before met names | ✅ high |
| `ring` | `rgba(59,130,246,0.5)` | Focus ring | Keyboard focus | ✅ high |

**Light theme** (`--background: 0 0% 100%`, `--foreground: 0 0% 0%`)

| Token | Hex | Role | Confidence |
|---|---|---|---|
| `surface-light` | `#FFFFFF` | Base background | ✅ high |
| `text-primary-light` | `#000000` | Resolved text | ✅ high |
| `text-muted` | `#71717A` (zinc-500) | Default text (shared) | ✅ high |
| `border-light` | `rgba(0,0,0,0.10)` | Nav hairline | ✅ high |
| `rail-light` | `#D4D4D8` (zinc-300) | Dashed rail | ✅ high |

### 2.2 Typography

- **Detected family**: `Geist` (Vercel's typeface) — ✅ high confidence, confirmed via `--font-geist-sans: "__GeistSans_8adcd2"` and `@font-face .woff2` refs. Geist Mono is almost certainly present for tabular contexts but the visible numerals use `tabular-nums` on Geist Sans.
- **Suggested fallback**: `system-ui, -apple-system, sans-serif`

**Observed scale:**

| Token | Size | Weight | Line-height | Tracking | Use |
|---|---|---|---|---|---|
| `year` | 15px | 500 | 20px | — (tabular-nums) | Year number per column |
| `age` | 11px | 500 | 16px | — (tabular-nums) | Age number per column |
| `label` | 11px | 500 | 16px | 0.08em, UPPERCASE | "Age" / "Years" pinned labels |
| `event` | 14px | 400 | 1.55 | -0.01em | Event description text, `max-width: 18rem` |
| `body` | 16px | 400 | 1.5 | — | Generic fallback body |

**Notable details**: tabular numerals everywhere numbers align vertically; negative tracking (-0.01em) only on event prose; the label row is the *only* uppercase + positive-tracking element (classic data-table header treatment).

### 2.3 Spacing

- **Inferred base unit**: 4px (Tailwind scale)
- **Observable multiples**: 4, 8, 12, 16, 20, 24, 32, 40, 64
- **Signature layout constants** (from CSS vars): `--lifeline-rail: 5rem` (80px, axis offset from top of column), `--cell-size: 2rem` (32px), `--lifeline-people-top: calc(14.5rem + 40px)` (people-dot vertical band)
- **Consistency**: ✅ high

### 2.4 Radii

- `none`: 0px — **everything** rectangular (columns, nav, rail). No rounded corners anywhere in layout.
- `full`: 9999px — only on people dots (`h-1.5 w-1.5 rounded-full`) and circular avatars.

*This is a deliberate two-value system: sharp rectangles for structure, perfect circles for people. Nothing in between.*

### 2.5 Elevation system

**Effectively flat (Level 0 only).** No card shadows, no drop shadows in the UI. The design avoids elevation entirely as a structural device. Two non-structural shadow recipes exist in the stylesheet but are reserved:

| Level | Name | Treatment | Use |
|---|---|---|---|
| 0 | Flat | No shadow, no border | Entire layout |
| — | Glow (special) | `0 0 24px hsla(0,0%,100%,.45)` | Reserved highlight (e.g. active/hover emphasis) |
| — | Inset accent (special) | `inset 3px 0 0 0 hsla(0,0%,100%,.85)` | Left-edge marker (special states) |

The **nav** is the one "floating" element: `position: fixed` + `backdrop-blur-xl` (blur 24px) + `bg-black/80` — depth by translucency, not shadow.

#### Decorative depth (non-functional)

- **Polarity flip** is the whole-page mechanism: the entire surface inverts black↔white via the theme toggle. There is no per-section banding.
- No gradients, no noise, no background patterns. Pure flat fields.

### 2.6 Borders

- Nav hairline: `1px solid rgba(255,255,255,0.10)` (dark) / `rgba(0,0,0,0.10)` (light)
- Lifeline rail: `1px dashed` in `rail` (#27272A dark / #D4D4D8 light), full width, positioned at `top: var(--lifeline-rail)`
- Year tick: `1px` solid vertical bar, `height: 10px`, `tick` color (#A1A1AA), `group-hover` → brighter
- Focus: ring `rgba(59,130,246,0.5)`

### 2.7 Accessibility quick-check

See companion `design-a11y.md`. Summary:
- `text-primary` (#FFF) on `surface` (#000): **21:1** — AAA ✅ (hover state)
- `text-muted` (#71717A) on `surface` (#000): **≈4.0:1** — AA for large only ⚠️ (this is *intentional* — rest state is below AA for body; the brand trades contrast for atmosphere)
- `accent-mentor` (#3B82F6) on `surface` (#000): **≈3.7:1** — large/graphical only, used as 6px dots (decorative) ⚠️

---

## 3. Components Inventory

### 3.1 Generic components

#### Nav bar
- **Composition**: `fixed inset-x-0 top-0 z-50`, inner `mx-auto max-w-5xl h-16 px-6 flex items-center justify-between`
- **Background**: `bg-black/80` + `backdrop-blur-xl`, bottom hairline `border-white/10`
- **Contents**: rabbit logo SVG (`h-6 w-6`) left; X/Twitter icon link (`h-4 w-4`, `text-zinc-500 hover:text-white`) right
- **Confidence**: ✅ high

#### Icon link
- **Variants**: logo (no color transition, `hover:opacity-70`), social (`text-zinc-500` → `hover:text-black dark:hover:text-white`)
- **Size**: 16–24px, Lucide icon set (`lucide-sun` confirmed)
- **Confidence**: ✅ high

#### Theme toggle
- **What**: Lucide `sun` icon (`h-4 w-4`), bottom-left of viewport, flips polarity black↔white
- **States**: sun (in dark) ↔ moon (inferred, in light)
- **Confidence**: ✅ high (icon) / ⚠️ medium (moon counterpart inferred)

### 3.2 Signature components

#### The Lifeline rail (THE signature)
- **What it is**: a horizontal scroll container (`width: 7482px` inner) holding one column per year. A dashed axis runs across all columns at `top: var(--lifeline-rail)` (80px). Each column carries a vertical tick on the axis, an age number, a year number, then events stacked below.
- **Why it's signature**: the horizontal-time + hover-to-reveal-contrast interaction is unmistakable and unique. No competitor list looks like this.
- **Composition**: outer `flex h-full items-center overflow-hidden`; inner `relative flex w-max items-start will-change-transform` with the lifeline CSS vars; columns are `group relative shrink-0 pr-8` (width 80px empty / ~290px when populated), all starting at `opacity: 0` and fading in on scroll.
- **Confidence**: ✅ high

#### Pinned label column
- **What**: a 72px `lifeline-labels` column holding "Age" / "Years" uppercase labels; it is `is-pinned` and counter-translates (`translate3d`) so it stays visible while the timeline scrolls horizontally.
- **Why signature**: sticky-axis-label behavior on a horizontal scroller is a bespoke data-viz touch.
- **Confidence**: ✅ high

#### Year column
- **What**: per-year unit — tick (`absolute left-0 top-[var(--lifeline-rail)] h-[10px] w-px bg-zinc-400`), age `p.text-[11px]`, year `p.text-[15px] tabular-nums`, events region `min-h-[3.25rem] space-y-4` with each event `max-w-[18rem] text-[14px] leading-[1.55] tracking-[-0.01em]`.
- **States**: rest = `text-zinc-500`; `group-hover` → `text-black dark:text-zinc-300` (year/age) and `text-white` emphasis; `duration-300 ease-out`.
- **Confidence**: ✅ high

#### People dot + avatar
- **What**: `h-1.5 w-1.5 rounded-full` dot (`bg-blue-500` mentor / `bg-pink-500` met-in-person) + optional circular avatar image + name in muted text, positioned in the people band (`--lifeline-people-top`).
- **Legend**: bottom strip — "● Mentors" (blue) / "● Met in person" (pink).
- **Confidence**: ✅ high

#### Inline link
- **What**: links inside event prose (e.g. *Geist*, *Vercel*, *Auth0*) — underlined, inherit muted color, brighten with the column on hover. Section sets `[&_a]:cursor-pointer`.
- **Confidence**: ✅ high

#### Footer
- **What**: theme toggle bottom-left, `© 2026` bottom-right in `text-muted`.
- **Confidence**: ✅ high

---

## 4. Layout & Composition

### 4.1 Grid & containers

- **Nav container**: `max-w-5xl` (1024px), 24px horizontal padding, 64px (h-16) tall.
- **Timeline**: NOT width-constrained — a full-bleed horizontal scroll region whose inner width equals total years × column width (~7482px). The body is `overflow: hidden`; the timeline manages its own scroll.
- **Vertical anatomy of a column** (top→down): age (11px) → year (15px) → dashed axis at 80px → events region → people band at ~272px.

### 4.2 Composition patterns

- Single horizontal rail, no sections, no hero.
- Fixed translucent nav over a flat field.
- Pinned axis-label column on the left.
- Anchored footer (toggle + copyright).

### 4.3 Responsive behavior

#### Breakpoints

| Name | Width | Key changes |
|---|---|---|
| Mobile | < 768px | Timeline becomes **vertical** — `main` switches to `overflow-y-auto`, columns stack top-to-bottom; axis runs vertically; nav stays fixed. |
| Desktop | ≥ 768px (`md`) | `md:overflow-hidden` — timeline is **horizontal**, scroll-driven; pinned label column active. |

*Confirmed across captured desktop/tablet/mobile screenshots: mobile renders as a vertical scroll of the same year→event structure (see `lifeline-mobile.png`); desktop is horizontal.*

#### Touch targets

- Nav icons ~16–24px visual but sit in a 64px-tall bar (adequate hit area).
- People dots are 6px visual (decorative, not primary targets); names beside them are the tap targets.
- ⚠️ Event inline links are text-sized — fine on desktop, tighter on mobile.

#### Collapsing strategy

- **Orientation flip** is the core responsive move: horizontal rail (desktop) → vertical list (mobile). Not a reflow of columns but an axis rotation.
- Nav does not collapse to a hamburger — it only ever holds two icons.

### 4.4 Image behavior

- **Logo**: inline monochrome SVG rabbit, `h-6 w-6`, `currentColor` (flips with theme).
- **Icons**: Lucide set, 16px, stroke-based, `currentColor`.
- **Avatars**: small circular photos (`rounded-full`) beside people names; grayscale-leaning, low prominence.
- No hero imagery, no product mockups, no decorative graphics.

---

## 5. Reconstruction Notes

### Suggested stack

**Tailwind CSS** (the site's native stack) + React. Optionally shadcn/ui tokens (the HSL `--background`/`--foreground`/`--border`/`--ring` convention is already shadcn). Geist via `geist` npm package or `next/font`.

Justification: every observed class is a Tailwind utility; the color system is literal shadcn HSL vars; the only custom CSS are the three `--lifeline-*` layout vars and `--cell-size`.

### Quick wins

- Palette + Geist + `tabular-nums` reproduce ~70% of the look instantly.
- The rest-state aesthetic is two utilities: `text-zinc-500` everywhere + `group-hover:text-white`.
- Dashed rail = one absolutely-positioned `div.h-px.border-t.border-dashed.border-zinc-800`.

### Tricky bits

- **Horizontal scroll + pinned label column**: the `is-pinned` label counter-translates via JS (`translate3d` driven by scroll position). Needs a scroll listener or `position: sticky` workaround.
- **Opacity fade-in per column on scroll**: columns start `opacity:0` and reveal via IntersectionObserver / scroll progress.
- **Orientation flip** (horizontal↔vertical at `md`): two layout modes, not one responsive grid.
- **Geist font loading**: self-hosted `.woff2`; use the `geist` package to avoid FOUT.
- **Empty year columns** are narrow (80px) while populated ones widen (~290px) — column width is content-driven.

### Implicit states to define

- Year column hover (filmed via classes: brighten) ✅ known
- Keyboard focus (ring defined) — verify visible focus on links
- Light-mode toggle counterpart icon (moon) — inferred
- Reduced-motion fallback for scroll animations — not observed, must add
- Loading/empty states — N/A (static dataset)

### Confidence map

| Layer | Confidence | Why |
|---|---|---|
| Identity | ✅ high | Clear, consistent, distinctive |
| Colors | ✅ high | Extracted from CSS vars + classes |
| Typography | ✅ high | Geist confirmed in CSS; sizes from classes |
| Spacing | ✅ high | Tailwind scale + explicit CSS vars |
| Components | ✅ high | Full DOM skeleton captured |
| Layout | ✅ high | 3 viewports + rendered HTML |
| Interaction/animation | ⚠️ medium | Inferred from classes/inline transforms, not filmed |

---

## 6. Do's and Don'ts

### Do

- **Start all timeline text at `text-muted` (#71717A) and resolve to full contrast only on `group-hover`.** The low rest-contrast is the thesis, not a bug.
- **Use `tabular-nums` on every number** (ages, years) so columns align vertically.
- **Keep structure perfectly rectangular (`rounded-none`) and reserve `rounded-full` exclusively for people dots and avatars.** No in-between radii.
- **Restrict color to exactly two accents — blue `#3B82F6` (mentors) and pink `#EC4899` (met-in-person) — and only on people dots.** Never color text, rails, or links.
- **Render the time axis as a single `1px dashed` rail** in `rail` (#27272A dark / #D4D4D8 light), never solid, never thickened.
- **Float the nav with `backdrop-blur-xl` + `bg-black/80` and a 10%-opacity hairline** — depth via translucency, never shadow.
- **Set event prose at 14px / line-height 1.55 / tracking -0.01em, capped at `max-width: 18rem`.**
- **Support full polarity flip (black↔white) via a single Lucide sun/moon toggle.**

### Don't

- **Don't add a hero, headline, or CTA.** The absence is the brand — the rail starts immediately under the nav.
- **Don't raise rest-state body contrast to "fix accessibility."** Hover is the contrast mechanism; provide a reduced-motion / focus path instead.
- **Don't introduce a third accent color or use the two accents on anything but people dots.**
- **Don't add shadows or cards for elevation.** The layout is flat; the only depth cue allowed is nav translucency.
- **Don't round structural corners.** Rectangles for structure, circles for people — nothing else.
- **Don't promote font weight above 500.** The weight ceiling is medium; there is no bold display type.
- **Don't switch the axis to vertical on desktop or horizontal on mobile** — orientation is the responsive contract (horizontal ≥ md, vertical < md).
- **Don't use a second typeface.** Geist (with tabular numerals) carries everything.

---

## 7. Open Questions

- The light-mode **moon** icon counterpart is inferred from the sun toggle — not directly captured. ✅ low-risk.
- Exact **scroll mechanism** (wheel-to-horizontal? drag? auto-advance?) is inferred from `will-change-transform` + JS translate values; the precise easing/lerp is not extractable from static HTML.
- Whether **Geist Mono** is used anywhere (vs. Geist Sans + `tabular-nums`) — only Sans confirmed in vars.
- Does the people-dot band ever overlap/collide at dense years, and how is that resolved? Not observable in captured range.

*Otherwise material is sufficient for high-fidelity reconstruction.*

---

## 8. Companion files

- [x] `design-tokens.json` — structured tokens in W3C DTCG format (`$value`/`$type`)
- [x] `design-a11y.md` — WCAG contrast report (note: rest-state contrast is intentionally sub-AA)
- [x] `lifeline-desktop.png` / `lifeline-tablet.png` / `lifeline-mobile.png` — captures (in scratchpad)

---

*End of analysis.*
