# Redesign Plan — Original Portfolio, "Gaming Minimal"

> Research + implementation plan. Date: 2026-08-13.
> Scope: bring back the **original portfolio home** (the full-screen ABOUT / EXPERIENCE / CONTACT
> accordion in `components/HeroSection.tsx` + `components/sections/*`) restyled with a
> **gaming-minimal** aesthetic. Blogs, guides, admin and API stay untouched.

---

## 1. Where we are (repo research)

| Piece | State |
|---|---|
| Current home | `components/Lifeline.tsx` — Evil Rabbit-style horizontal timeline (see `design/lifeline-design.md`) |
| Original home | `components/HeroSection.tsx` — 3 expanding panels (about / experience / contact), photo + Unsplash backgrounds, grayscale→color hover, `flex-[10]/flex-[1]` accordion. Still in the repo, just unrouted. |
| Sections | `AboutSection.tsx` (440 loc), `ExperienceSection.tsx` (246), `ContactSection.tsx` (123) — content is current (AI Experience Designer & Product Lead rebrand) |
| Gaming assets already here | `ui/animated-hud-targeting-ui.tsx` (964 loc animated HUD reticle, framer-motion), `ui/particle-text-canvas.tsx` (name builds from particles), Geist **Mono** already loaded in `index.css` |
| Data | `utils/lifeline-data.ts` — bilingual career data 1995→2026, categorized (work/study/project/life). Reusable as the Experience panel's data source. |
| Stack | Vite + React 19 + Tailwind + shadcn tokens + framer-motion. Dark default, light theme via `.dark` class + localStorage. |

**Key insight:** the repo already owns the three hardest gaming-minimal ingredients — a serious
HUD reticle component, a particle text canvas, and a mono typeface. The redesign is mostly
*retheming and composition*, not building new tech.

## 2. Direction — what "gaming minimal" means here

Reference poles from research:

- **Destiny** — the minimal pole: award-winning typographic menus, free cursor, thin hairlines,
  huge negative space. This is the primary reference.
- **Dead Space** — diegetic UI: information lives *inside* the world (no floating chrome).
  Translation: HUD elements annotate real content, never decorate empty space.
- **Persona 5** — the maximalist anti-reference: what we deliberately do NOT do
  (no jagged shapes, no busy transitions, no color chaos).

**Thesis:** keep the Lifeline's discipline of restraint (black/white surfaces, Geist, flat,
sharp corners, muted-until-attended text) and let the *gaming* read come from a small,
strict kit of HUD gestures — never from color or noise.

### The gaming-minimal kit (the ONLY allowed gestures)

1. **Corner brackets** `⌜ ⌟` — 1px, on the active/hovered panel only. The signature.
2. **Targeting reticle** (existing `TargetingUI`) — fires once on panel *selection*, then dismisses. Never idle-looping.
3. **Mono data labels** — Geist Mono, 11px, uppercase, tracking 0.08em: `01 // ABOUT`, `STATUS: ONLINE`, `LAT -34.6 / LON -58.4`.
4. **One accent color** — the reticle cyan already in use (`#38bdf8` dark / `#0e7490` light). Used only on: reticle, active-panel bracket, blinking status dot. Never on text or backgrounds.
5. **Scanline/boot micro-moment** — a single ≤400ms text-decode or hairline sweep when a panel opens. Once per interaction, respects `prefers-reduced-motion`.

Everything else stays Lifeline-grade minimal: `#000`/`#fff` surfaces, zinc-500 rest text
resolving to full contrast on attention, `rounded-none` structure, no shadows, hairline borders
at 10% opacity.

### Tokens (delta vs. current)

```
accent-hud:        #38bdf8 (dark) / #0e7490 (light)   ← promoted from reticle
font-data:         "Geist Mono"  11px / 500 / 0.08em / uppercase
bracket:           1px solid currentColor, 12×12px corner strokes
status-dot:        6px, accent-hud, 2s pulse (disabled under reduced-motion)
everything else:   inherit design/design-tokens.json (Lifeline tokens)
```

## 3. Structure

Home returns to the **3-panel accordion** (`/`), Lifeline moves to **`/lifeline`** and is
linked from the Experience panel ("full timeline →"). Nothing is deleted.

Panel treatment (the big visual change vs. the original):

- **Drop the Unsplash photo backgrounds.** Photos are the least "minimal" thing in the original.
  Only `yo2.png` (the portrait) survives, grayscale, in the About panel.
- Collapsed panels: pure black, vertical mono label (`01 // ABOUT`), zinc-600 → white on hover,
  hairline separators — like the Lifeline's rest state.
- Active panel: content on flat black, corner brackets, one-time reticle + decode moment.
- Header: reuse `SiteHeader` (particle-name hover panel) so home and `/writing` stay one family.
- Footer strip: mono status line (`THEME`, `EN/ES`, `© 2026`, blinking status dot) — doubles as
  the theme/language toggles that already exist.

Per-section notes:

- **About** → keep copy; add a small mono "character sheet" block (role, base, stack, languages)
  as the panel's data ornament.
- **Experience** → replace the current card grid with a condensed list styled like lifeline
  entries (year in tabular nums + role + one-line description), sourced from `lifeline-data.ts`
  filtered to `work`. Deep-link to `/lifeline`.
- **Contact** → "comms" framing: mono labels (`CHANNEL: EMAIL`), same form/links, no new color.

## 4. Phases

**Phase 0 — tokens & routing (small)**
Add `accent-hud` + data-label utilities to `tailwind.config.js`/`index.css`; route `/` →
`HeroSection`, `/lifeline` → `Lifeline`; update `useSEO` on both.

**Phase 1 — home shell (the core)**
Restyle `HeroSection.tsx`: remove photo backgrounds, mono vertical labels, corner-bracket
component (new, ~40 loc), wire `TargetingUI` to panel selection (pattern already exists in
`Lifeline.tsx:63` + year-click handler), one-time decode animation.

**Phase 2 — sections**
Restyle About / Experience / Contact per §3. Experience reads from `lifeline-data.ts` (single
source of truth — kill any duplicated career copy).

**Phase 3 — polish & a11y**
`prefers-reduced-motion` kills reticle/decode/pulse; keyboard focus ring (`#3B82F680` already
tokenized); rest-state contrast on *interactive* labels ≥ AA (brackets/hover carry the
atmosphere instead of sub-AA text — panels are navigation, unlike the Lifeline's prose);
mobile = vertical accordion (original behavior), brackets and reticle desktop-only.

**Phase 4 — QA**
Both themes × both languages × mobile/desktop; blogs, guides, admin, deep links unaffected;
Lighthouse — particle canvas and reticle must not tank LCP (mount reticle only on interaction).

## 5. Risks / decisions taken

- **Two homes tension** — resolved by demoting Lifeline to `/lifeline`, not deleting it.
- **Kitsch risk** — the kit in §2 is a hard allowlist; if a gesture isn't in it, it doesn't ship.
- **A11y vs. atmosphere** — nav labels meet AA (they're controls); only decorative mono
  annotations may sit at zinc-600.
- **Perf** — all HUD elements are SVG/CSS; no new deps needed.

## 6. Sources

- [Top 5 Best Video Game UIs — SUPERJUMP](https://medium.com/super-jump/top-5-best-video-game-uis-db941d6a9357) (Destiny's typographic minimalism)
- [The Most Stylish UI Designs in Video Games — TheGamer](https://www.thegamer.com/games-with-stylish-great-user-interfaces-ui-hud-menus/) (Persona 5 as maximalist pole, Dead Space diegetic)
- [Game UI Database](https://www.gameuidatabase.com/) (55k screenshots for reference during Phase 1)
- [25 Web Design Trends 2025 — DEV](https://dev.to/watzon/25-web-design-trends-to-watch-in-2025-e83) (HUD-style overlays as a current web trend)
- [6 Game UIs You Should Study — Medium](https://iuliana-urechi.medium.com/6-game-ui-you-should-study-9e8f435471c3)
- Internal: `design/lifeline-design.md`, `design/design-tokens.json` (token base carried forward)
