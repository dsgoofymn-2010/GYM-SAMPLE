/* =====================================================================
   Mr Thunder Gym — shared site script (loaded on every page)
   ---------------------------------------------------------------------
   Handles: site config, config-driven text filling, nav toggle,
   active nav link, footer year, generic card/tag filters.

   PHASE 1: structure only — no animations, no backend calls.
   PHASE 2 hooks: retheme via css/style.css :root variables; a Three.js
   intro can be mounted into <section id="intro-3d"> on index.html using
   files from /assets/3d/.
   ===================================================================== */
'use strict';

/* =====================================================================
   SITE CONFIG — change values here; every page fills itself from this.
   ===================================================================== */
const SITE_CONFIG = {
  name: 'Mr Thunder Gym',
  logoText: 'THUNDER GYM',
  tagline: 'Train loud. Lift stronger.', // PLACEHOLDER: tagline copy
  phone: '98765 43210',                  // PLACEHOLDER: gym phone number
  email: 'info@mrthundergym.in',         // PLACEHOLDER: gym email
  address:
    '12, Annaikarai Street, Near Bus Stand,\n' +
    'Virudhunagar, Tamil Nadu 626001',   // PLACEHOLDER: full address
  hours:
    'Mon-Sat: 5:00 AM to 9:30 AM & 5:00 PM to 9:00 PM\n' +
    'Sunday: 6:00 AM to 9:00 AM',         // PLACEHOLDER: working hours
  // PLACEHOLDER: WhatsApp number, international format (no "+", no spaces).
  // Used by the "Confirm on WhatsApp" button on booking.html.
  whatsappNumber: '919876543210',
  // PLACEHOLDER: real social profile URLs can replace the "#" links in Phase 2.
  socials: [
    { label: 'Instagram', url: '#' },
    { label: 'Facebook', url: '#' },
    { label: 'YouTube', url: '#' },
  ],
};

/* Expose for page scripts (booking.js, achievements.js). */
window.GymUI = { SITE_CONFIG, initCardFilters };

/* =====================================================================
   1. MOBILE NAV (hamburger toggle)
   ===================================================================== */
function initNavMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    setOpen(!nav.classList.contains('open'));
  });

  // Close the menu when a link inside it is used.
  nav.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setOpen(false);
    }
  });

  // Escape closes the menu and returns focus to the toggle.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* =====================================================================
   2. ACTIVE NAV LINK (highlights the current page)
   ===================================================================== */
function initNavActive() {
  const toBasename = (value) => {
    const cleaned = String(value).split('#')[0].split('?')[0].replace(/\\/g, '/');
    const parts = cleaned.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1].toLowerCase() : 'index.html';
  };

  const current = toBasename(window.location.pathname);

  document.querySelectorAll('.site-nav a.nav-link').forEach((link) => {
    let target = 'index.html';
    try {
      target = toBasename(new URL(link.href).pathname);
    } catch {
      target = toBasename(link.getAttribute('href') || '');
    }
    if (target === current) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('active');
    }
  });
}

/* =====================================================================
   3. CONFIG FILLING (footer/contact copy comes from SITE_CONFIG)
   ===================================================================== */
function applySiteData() {
  // Footer year.
  document.querySelectorAll('#footer-year').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // Elements with data-config="<key>" get the matching config value.
  document.querySelectorAll('[data-config]').forEach((el) => {
    const key = el.getAttribute('data-config');
    const value = SITE_CONFIG[key];
    if (value == null) return;
    if (el.tagName === 'A') {
      if (key === 'phone') el.setAttribute('href', 'tel:' + String(value).replace(/[^\d+]/g, ''));
      if (key === 'email') el.setAttribute('href', 'mailto:' + value);
    }
    el.textContent = value;
  });

  // Structured hours schedule (index.html bento "Opening Hours" tile):
  // one row per day range; a "&" inside the config splits a range into
  // separately listed sessions, so the tile never shows a run-on line.
  document.querySelectorAll('[data-config-schedule]').forEach((el) => {
    renderHoursSchedule(el, SITE_CONFIG.hours);
  });

  // Social link placeholders rendered from config.
  document.querySelectorAll('[data-social-links]').forEach((list) => {
    list.replaceChildren();
    SITE_CONFIG.socials.forEach((social) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'social-link';
      a.href = social.url;
      a.textContent = social.label;
      if (!a.href.startsWith('#')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      li.appendChild(a);
      list.appendChild(li);
    });
  });
}

/* =====================================================================
   3b. STRUCTURED HOURS SCHEDULE (index.html bento tile)
   ---------------------------------------------------------------------
   Renders SITE_CONFIG.hours into .tile-session rows:
     "Mon-Sat: 5:00 AM to 9:30 AM & 5:00 PM to 9:00 PM\n
      Sunday: 6:00 AM to 9:00 AM"
   becomes
     Mon-Sat | 5:00 AM to 9:30 AM
             | 5:00 PM to 9:00 PM
     Sunday  | 6:00 AM to 9:00 AM
   The "&" is treated only as a session separator and never printed.
   Lines that cannot be parsed are skipped; if NOTHING parses (an
   unexpected config format), the container's static fallback markup
   stays in place, so the tile is never empty.
   ===================================================================== */
function renderHoursSchedule(container, hours) {
  if (!container || hours == null) return;
  const frag = document.createDocumentFragment();
  let rows = 0;

  String(hours)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const sep = line.indexOf(':');
      if (sep <= 0) return; // not a "Day: times" line -> skip
      const day = line.slice(0, sep).trim();
      const rest = line.slice(sep + 1).trim();
      const times = rest.split(/\s*&\s*/).map((t) => t.trim()).filter(Boolean);
      if (!day || !times.length) return;

      const row = document.createElement('div');
      row.className = 'tile-session';
      const dayEl = document.createElement('p');
      dayEl.className = 'tile-session-day';
      dayEl.textContent = day;
      const timesEl = document.createElement('div');
      timesEl.className = 'tile-session-times';
      times.forEach((t) => {
        const span = document.createElement('span');
        span.textContent = t;
        timesEl.appendChild(span);
      });
      row.append(dayEl, timesEl);
      frag.appendChild(row);
      rows++;
    });

  if (rows) container.replaceChildren(frag);
}

/* =====================================================================
   4. GENERIC CARD FILTER (used by facilities.html; achievements.js
      re-runs this after rendering its grid)
   ===================================================================== */
function initCardFilters(root = document) {
  root.querySelectorAll('[data-filter-group]').forEach((group) => {
    if (group.dataset.filterBound) return; // idempotent
    const targetSel = group.getAttribute('data-filter-target');
    const target = targetSel ? document.querySelector(targetSel) : null;
    if (!target) return;

    const cards = Array.from(target.querySelectorAll('[data-tags]'));
    const buttons = Array.from(group.querySelectorAll('[data-filter]'));
    if (!cards.length || !buttons.length) return;

    const apply = (filter) => {
      cards.forEach((card) => {
        const tags = card.getAttribute('data-tags').split(/\s+/).filter(Boolean);
        card.hidden = filter !== 'all' && !tags.includes(filter);
      });
      buttons.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-filter') === filter));
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => apply(btn.getAttribute('data-filter')));
    });

    group.dataset.filterBound = '1';
    apply(group.getAttribute('data-filter-default') || 'all');
  });
}

/* =====================================================================
   BOOT
   Scripts load with `defer`, so the DOM is ready when this runs.
   ===================================================================== */
initNavMenu();
initNavActive();
applySiteData();
initCardFilters(document);

/* =====================================================================
   5. HALLMARK IMAGE SLOTS (Phase 2A)
   ---------------------------------------------------------------------
   Named slots marked with data-slot="<key>" on index.html (bento floor
   tiles, achievements preview tiles) and about.html (visit figure).
   They hold themed placeholder SVGs today; call hallmarkSlots after
   this script loads to swap a real photograph into any slot, e.g.:

   hallmarkSlots({
     'gym-floor-cardio': 'assets/images/floor-cardio.jpg',
     'visit-floor': { src: 'assets/images/visit.jpg', alt: 'The floor' },
   });
   ===================================================================== */
window.hallmarkSlots = function (map) {
  if (!map || typeof map !== 'object') return;
  Object.keys(map).forEach(function (key) {
    const slot = document.querySelector('[data-slot="' + key + '"]');
    if (!slot) return;
    const value = map[key];
    const src = typeof value === 'string' ? value : value && value.src;
    if (!src) return;
    const img = new Image();
    img.src = src;
    img.loading = 'lazy';
    img.alt = (value && typeof value === 'object' && value.alt) || '';
    const current = slot.querySelector('img');
    if (current) {
      current.replaceWith(img);
    } else {
      slot.appendChild(img);
    }
  });
};

/* Drop any image that fails to load (a mistyped slot path would leave a
   broken-image icon inside a frame otherwise). */
document.addEventListener('error', function (event) {
  if (event.target instanceof HTMLImageElement) event.target.remove();
}, true);
