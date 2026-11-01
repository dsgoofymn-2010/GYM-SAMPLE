# design.md — Mr Thunder Gym (Phase 2A restyle)

Dark "electric" system for a neighbourhood gym in Virudhunagar. Hallmark
custom run, genre **atmospheric**, redesign depth **full**. Single source
of truth is `tokens.css` at the project root, imported by `css/style.css`
(then `base.css`, the floor rules; edit tokens, not surfaces).

## Idea

The gym's own scoreboard: honest facts (hours, floor, wins) posted loud
under one lightning mark. Signature: the bolt monogram panel with the
gym's tagline on the home page.

## Palette (OKLCH, hue 96 gold-tinted; no pure absolutes)

| Role | Token | Value |
|---|---|---|
| Paper (page ground) | `--color-paper` | `oklch(0.17 0.012 96)` |
| Raised surface | `--color-paper-2` | `oklch(0.22 0.013 96)` |
| Highest surface | `--color-paper-3` | `oklch(0.27 0.014 96)` |
| Ink (text) | `--color-ink` | `oklch(0.95 0.014 96)` |
| Ink secondary | `--color-ink-2` | `oklch(0.85 0.014 96)` |
| Muted | `--color-muted` | `oklch(0.71 0.018 96)` |
| Hairline rule | `--color-rule` | `oklch(0.35 0.015 96)` |
| Accent (lightning yellow) | `--color-accent` | `oklch(0.86 0.19 96)` |
| Ink on accent fills | `--color-accent-ink` | `oklch(0.15 0.03 96)` |
| Focus | `--color-focus` | `oklch(0.9 0.18 96)` |
| Error | `--color-error` | `oklch(0.72 0.16 27)` |
| Success | `--color-success` | `oklch(0.78 0.12 150)` |
| Overlay scrim | `--color-overlay` | `oklch(0.1 0.012 96 / 0.8)` |

Community rule: the accent holds controls, the bolt marks and focus
(posture: committed); the ground stays near-black. Input edges use
`--color-muted` for 3:1; hairlines use `--color-rule` only.

## Type

- **Display:** `Fjalla One` (400), uppercase, tracking `-0.01em`, on
  `h1`/`h2`, `.logo`, `.hero-tag`, `.statement-text`, `.footer-name`.
  Fallback: `"Arial Narrow", Impact, sans-serif`.
- **Body:** `Archivo` (400 + 600). Fallback: `"Segoe UI", system-ui, sans-serif`.
- Three weights in running use; no third family (the display face doubles
  as the single outlier).
- Scale: `--text-display` (hero) → `--text-display-s` (page h1, figures)
  → `--text-section` (h2) → `--text-title` (h3/cards) → body 1rem →
  `--text-sm/-xs` for meta.

## Structure

- `.container` capped at 1440px, gutters 64px (24px ≤60rem, 16px ≤40rem),
  12 columns, 32px column gap.
- `.section` owns its `padding-block-start` (`--section-gap-s`); a full
  bleed `.band` changes paper to `--color-paper-2` and keeps the container.
- Chrome: sticky `.site-header` slab, 72px (64px on phones); brand = bolt
  mark + uppercase wordmark. Footer: mast name row over a 12-column grid.
- Per-page compositions: index (Stage hero, bento, ledger rows, showcase,
  statement, band), facilities (page head, filter chips, media rows,
  amenities well, band), achievements (figures strip, chips, card grid,
  dark lightbox), booking (page head, form well, facts column, success
  panel), about (story head, mission dl, team rows, visit split).

## Controls

- `.btn`: filled accent, min-height 52px (44px `.btn-sm` in the nav),
  radius 4px, 8 states. Hover glows: two soft accent rings (waive 29,
  never animated, collapses under reduced motion).
- `.btn-ghost`: transparent ground, muted edge; hover raises ink.
- `.filter-btn` chips: 44px targets, `aria-pressed` fills with accent.
- Inputs: min-height 52px, `--color-paper` ground, muted edge, error edge
  on `[aria-invalid="true"]`; focus outline sits inside the field
  (offset -3px). `.field-error` reserves `min-height: 1lh`.
- One filled primary per state (answered F4): page content carries the
  single submit/CTA; the header "Book Now" is persistent chrome.

## Motion

- Durations 120/220/420ms on `--ease-out`; press = 1px dip, no width or
  height animation, no scroll choreography (CSS-only microinteractions).
- `prefers-reduced-motion: reduce` collapses every transition/transform.
- Phase 2B reserves `<section id="intro-3d">` (Three.js) on index.html;
  the hero reads complete without it.

## Imagery

- Real gym photographs come from the user. Today the pages carry themed
  dark placeholder SVGs (`assets/images/`, filenames unchanged from
  Phase 1, no in-image caption text).
- Named `data-slot` frames (index floor tiles + achievements preview
  tiles, about visit figure) swap real photos in via `hallmarkSlots({...})`
  from `js/main.js` without touching layout.

## Exports

- `tokens.css` — the whole token system; portable to any new page.
- `base.css` — Hallmark floor rules (imports nothing; expects tokens).
- `css/style.css` — the site layer written against tokens only.
