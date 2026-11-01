# Mr Thunder Gym — Frontend Website

Multi-page static site for the gym. Phase 1 built the structure; **Phase 2A
applied the visual design** (Hallmark restyle: dark "electric" system,
documented in `design.md`). No frameworks, no build step, no backend.

## How to run

- Open `index.html` directly in a browser, **or**
- Serve statically, e.g. `npx serve .` (no build step, no dependencies).
- A network connection is needed once per session for the Google Fonts
  files (`Fjalla One`, `Archivo`); system fallbacks load otherwise.

## Folder structure

```
/index.html            Landing (Stage hero + bolt panel, 3D intro slot, bento,
                       service rows, achievements showcase, statement, CTA band)
/booking.html          Frontend-only booking form + WhatsApp confirm + facts column
/achievements.html     Figures strip, JS-rendered grid, category filters, lightbox
/facilities.html       Filterable equipment rows + amenities well + CTA band
/about.html            Story, mission/vision dl, team rows, visit split
/404.html              Themed "wrong turn" page (noindex)
/css/style.css         Site layer; written against tokens only (no literal colours)
/tokens.css            Design tokens (dark OKLCH palette, type, spacing, motion)
/base.css              Hallmark floor rules (imports nothing; expects tokens)
/js/main.js            SITE_CONFIG + shared behaviour (nav toggle, active link,
                       config fill, footer year, card filters, hallmarkSlots)
/js/booking.js         Form validation, success panel, WhatsApp link
/js/achievements.js    Achievement data array + grid render + lightbox
/js/intro.js           Thunder Gym storm intro (Canvas 2D, index.html only;
                       every tweak knob in the CONFIG object at the top)
/js/motion.js          Phase 3 scroll motion: reveal-on-scroll + stats count-up
                       (config at the top; no-op under reduced motion)
/assets/images/        Themed placeholder SVGs (dark panel + yellow bolt,
                       clearly named; swap real photos over the same filenames)
/assets/social/        og-image.svg — 1200x630 sharing image (export a PNG
                       copy before launch; most crawlers ignore SVG)
/robots.txt            Placeholder-domain sitemap pointer (swap before launch)
/sitemap.xml           5 pages, placeholder-domain URLs (swap before launch)
/design.md             The locked design system (Phase 2A)
```

## Site config (one place to change)

`js/main.js` → `SITE_CONFIG` holds gym name, tagline, phone, email, address,
working hours, social links and `whatsappNumber` (used by the booking page's
**Confirm on WhatsApp** button). This is a **placeholder number** — replace it
with the real one, in international format (`country code + number`, no `+`,
no spaces).

Pages read this config at load time via `data-config="key"` attributes, so the
header/footer/sidebar stay in sync from a single edit.

## Scroll motion (Phase 3)

`js/motion.js` (defer on every page) adds two behaviours with no libraries:

- **Reveal-on-scroll** — section headings, cards and rows get a short fade +
  small upward translate the first time they enter the viewport, staggered
  within a group. Plays once per element. Selectors and timings live in the
  `CONFIG` object at the top of the file.
- **Stats count-up** — the achievements "stats strip" numbers count up from
  zero when the strip appears. The numbers in the markup are the single
  source (the JS reads them), and they remain **placeholder figures**.

Safety: `prefers-reduced-motion` disables everything; with JS off or an old
browser, content is simply visible (hidden states are applied only through a
`js-motion` class the script adds itself). The hero, header, footer, the
booking form and its success panel are excluded.

## Before launch (checklist)

Nothing below blocks development — the site opens straight from the folder —
but every item is placeholder content until it is confirmed:

1. **Photos** — swap the themed placeholder SVGs in
   `assets/images/` (and the `.data-slot` tiles via `hallmarkSlots`) for real
   gym photographs, keeping the same filenames/slots.
2. **Contact facts** — replace the placeholder values in `js/main.js →
   SITE_CONFIG` and the matching `PLACEHOLDER` comments: phone number,
   WhatsApp number (`whatsappNumber` — international format), email, address,
   working hours and social profile URLs (currently `#`).
3. **Numbers and people** — the achievements stats strip, every
   `PLACEHOLDER` stat/figure, and the trainer names/roles/bios on
   `about.html` are sample content until the gym confirms real values.
   (The count-up animates whatever the markup says.)
4. **Domain** — `www.mrthundergym.example` is a **placeholder domain**
   (`.example` is reserved for dummies). Replace it everywhere: every
   `canonical` link, `og:url` / `og:image` / `twitter:image`, the JSON-LD
   `url`, `robots.txt`'s sitemap pointer, and all `<loc>` entries in
   `sitemap.xml`. Comment markers `TODO LAUNCH` flag each spot.
5. **og-image** — export a raster PNG (1200x630) beside
   `assets/social/og-image.svg` and point the `og:image` / `twitter:image`
   URLs at the PNG; most social crawlers do not render SVG.
6. **Structured data** — after step 2, re-check the JSON-LD on
   `index.html` and `about.html` (phone, email, hours, domain) and validate
   the result (Google Rich Results Test) once live.
7. **Intro replay flag** — `js/intro.js` plays once per session; append
   `?intro` to the `index.html` URL to force a replay while testing.
8. **Copy pass** — most visible copy is marked `PLACEHOLDER` in the source;
   do a final read-through with the owner.
9. **Serve over HTTPS** — the canonical/OG/Sitemap URLs assume it.


## Storm intro (index.html only)

`index.html` opens with a ~3.9s storm intro: canvas lightning strikes build
to one big bolt, a flash and a spark burst, then the title card dissolves
into the hero. It is wired on the landing page only, with one
`<script defer>` tag right after `js/main.js`; the other pages never load
it and their look is unchanged. The intro is fully self-contained —
Canvas 2D, no dependencies, injects its own styles — so there is no
Three.js CDN involved.

- **Tweak**: everything lives in the `CONFIG` object at the top of
  `js/intro.js` — strike timing / position / thickness / flash strength,
  title and tagline, colours, total length, dissolve length, spark count
  and the device-pixel-ratio cap.
- **Disable**: set `CONFIG.enabled = false` in `js/intro.js` — the page
  then always opens directly on the static hero.
- **Replay behaviour**: `CONFIG.oncePerSession = true` (default) plays it
  once per visit (new tab / window); `false` plays it on every load.
  Appending `?intro` to the URL forces a replay for testing regardless of
  the flag.
- **Behaviour**: scrolling is locked only while it plays; a "Skip intro"
  button sits bottom-right from the first frame — click it or press `Esc`
  and the overlay fades out immediately. `prefers-reduced-motion` never
  plays the intro. Removal always happens (dedicated timers, plus a
  failsafe) and failure paths stand down silently — the page is never
  blocked, blank or console-noisy.

## Swapping in real photos

Every image-bearing tile on the landing page and the about "Visit" figure
carries a `data-slot="name"` mark. Calling `hallmarkSlots({...})` (from
`js/main.js`) swaps a real photograph into the frame without touching layout:

```html
<script>
  window.hallmarkSlots({
    'gym-floor-cardio': 'assets/images/floor-cardio.jpg',
    'visit-floor': { src: 'assets/images/visit.jpg', alt: 'The training floor' },
  });
</script>
```

Facilities rows and achievement cards take their photos directly by filename.

## Wiring preserved from Phase 1

- All element `id`s, form field names, `data-config` attributes and JS hooks
  kept; `SITE_CONFIG` remains the single source for contact facts.
- Booking validation, WhatsApp link, achievements filter + lightbox,
  facilities filter, nav hamburger all behave as before.
- The storm intro (`js/intro.js`) runs on the landing page only: it mounts
  its own full-viewport overlay for the animation, removes itself with its
  styles when done, and this page's flow height is unchanged.
- Every stat, figure and copy block remains **placeholder content**, marked
  with `PLACEHOLDER` comments in code — verify real numbers before launch.

## Accessibility notes

- Semantic HTML, skip link, labelled forms with inline errors
  (`aria-live`, `aria-invalid`, `aria-describedby`).
- Dark theme holds WCAG AA contrast on token pairs; visible `:focus-visible`
  outlines everywhere.
- `prefers-reduced-motion: reduce` collapses transitions, edge glow and press
  transforms.
- Hamburger menu uses `aria-expanded` / `aria-controls`.
- Scroll motion (Phase 3) is fully gated by `prefers-reduced-motion`, plays
  once per element, and leaves all content visible when JS is unavailable
  (hidden states require the script-added `js-motion` class).
- The Phase 2B intro overlay is labelled (`role="dialog"`, accessible
  name), gets focus moved to its "Skip intro" button on show, and both
  the button and `Esc` end it; the scene canvas itself is decorative
  (`aria-hidden`).
- Lightbox is keyboard accessible: `Esc` closes, arrow keys navigate,
  `Tab` loops within the dialog, focus returns to the opener on close.
- Active nav link uses `aria-current="page"`.
