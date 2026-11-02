# design.md — Mr Thunder Gym (rebuild, Nov 2026)

**Direction:** fight-bill poster. Warm paper, black ink, chilli red, tall condensed headlines.
Previous dark/gold version is in git at commit b1bbf54.

## Files
- `css/site.css`: the only stylesheet. Edit tokens in `:root`.
- `js/site.js`: the only script. Gym phone, WhatsApp and opening hours live in `GYM` at the top.
- Pages are plain static HTML and work without JavaScript.

## Tokens
| Role | Value |
|---|---|
| Paper / paper-2 | `#f3eee4` / `#e8e0d0` |
| Ink / ink-2 / muted | `#15120f` / `#3d3731` / `#655c52` |
| Red (on paper) / red (on dark) | `#c42417` / `#ff6a52` |
| Night band | `#15120f` |

Type: **Anton** (display, uppercase) + **Manrope** 400–800 (body).

## Features
- Live "open now / opens at" pill computed in India time from `GYM.hours`.
- Hours board highlights today's row.
- Filters on facilities and achievements (`data-filter`, `data-tags`).
- Achievements lightbox uses `<dialog>` with arrow-key navigation.
- Booking form validates in the browser, then builds a WhatsApp message. Nothing is sent to a server.
- Reveal-on-scroll and the ticker turn off under `prefers-reduced-motion`.

## Before launch
Replace the placeholder phone, WhatsApp number, email, stats, coach bios, achievement stories and SVG/stock images.
