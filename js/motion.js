/* =====================================================================
   Mr Thunder Gym — scroll motion (Phase 3, every page)
   ---------------------------------------------------------------------
   Two quiet behaviours, vanilla only (IntersectionObserver, no
   libraries):
     1. Reveal-on-scroll: short fade + small upward translate for
        section headings, cards and rows. Staggered within a group.
        Each element plays ONCE, then is left alone.
     2. Count-up for the stats strip (.stat-value on achievements.html).
        Numbers are PLACEHOLDERS (the HTML carries the real text); the
        animation only counts to whatever the markup already says.

   SAFETY RULES (Floor 27/62):
     - prefers-reduced-motion: reduce -> the script bails; nothing
       hides, nothing animates. The CSS block in style.css also
       double-locks this selector set.
     - JS off / IntersectionObserver missing -> body never gets the
       `js-motion` class, so `body.js-motion .reveal` never applies and
       every element is fully visible, exactly as the markup reads.
     - Above-fold elements are shown instantly with no transition, so
       loaded-in-place content never flashes and the LCP is untouched
       (the hero is not in the reveal list at all).
   ===================================================================== */
(function () {
  'use strict';

  /* =====================================================================
     TWEAKABLES — one object: what reveals, how fast, how it staggers.
     ===================================================================== */
  const CONFIG = {
    // Elements that fade + rise when they first scroll into view.
    revealSelector: [
      '.section-head',
      '.page-head',
      '.lead-open',
      '.bento > *',
      '.rows > li',
      '.showcase > *',
      '.amenities > li',
      '.equip-row',
      '.statement-text',
      '.statement-support',
      '.mission > *',
      '.visit-info',
      '.visit-media',
      '.cards-grid > *',
      '.stats > *',
      '.band-inner',
      '.iron-grid > *',
      '.field',
      '.form-actions',
      '.facts > *',
      '.note',
      '.band-copy',
      '.band-number',
    ].join(', '),
    // Never reveal anything inside these (modal states, chrome).
    skipSelector: '.site-header, .site-footer, .hero, #booking-success',
    // Count-up target class (text read from the markup itself).
    statSelector: '.stat-value',
    staggerMs: 80,   // per-element delay inside one intersection batch
    staggerMax: 320, // stagger ceiling
    countMs: 900,    // stats count-up duration
  };

  /* Gate 1: reduced motion -> inert, content stays exactly as served. */
  const reduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Gate 2: the observer platform itself. */
  if (reduced || !('IntersectionObserver' in window) || !('requestAnimationFrame' in window)) {
    return; // no class is ever added; CSS hides nothing.
  }

  /* ==================================================================
     Reveal
     ================================================================== */
  const targets = Array.from(document.querySelectorAll(CONFIG.revealSelector)).filter(
    (el) =>
      !el.classList.contains('reveal') &&
      !(CONFIG.skipSelector && el.closest(CONFIG.skipSelector))
  );

  if (targets.length) {
    document.body.classList.add('js-motion');
  }

  const io = new IntersectionObserver(
    (entries) => {
      // Arrival order from the observer is DOM order, not viewport
      // order — sort the batch top-first so the stagger reads downward.
      const batch = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      batch.forEach((entry, i) => {
        const el = entry.target;
        const delay = Math.min(i * CONFIG.staggerMs, CONFIG.staggerMax);
        el.style.setProperty('--reveal-delay', delay + 'ms');
        el.classList.add('revealed');
        io.unobserve(el); // played once, left alone afterwards
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  /* Already-inside-the-first-viewport items: shown instantly with the
     transition suppressed for one frame — no flash, no LCP interference. */
  const alreadyVisible = [];
  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      el.classList.add('reveal', 'revealed', 'reveal-instant');
      alreadyVisible.push(el);
    } else {
      el.classList.add('reveal');
      io.observe(el);
    }
  });
  if (alreadyVisible.length) {
    window.requestAnimationFrame(() => {
      alreadyVisible.forEach((el) => el.classList.remove('reveal-instant'));
    });
  }

  /* ==================================================================
     Count-up (stats strip, achievements.html — placeholder figures)
     ================================================================== */
  function runCount(el) {
    if (el.dataset.countDone) return;
    el.dataset.countDone = '1';
    const raw = el.textContent.trim();
    const match = /^(\d[\d,\s]*)(.*)$/.exec(raw);
    if (!match) return; // not a plain number -> leave the markup as-is
    const target = parseInt(match[1].replace(/[,\s]/g, ''), 10);
    const suffix = match[2] || ''; // keeps the "+" / unit off the digits
    if (!isFinite(target) || target === 0) return;

    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / CONFIG.countMs);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString('en-IN') + suffix;
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('en-IN') + suffix;
    };
    window.requestAnimationFrame(step);
  }

  const statIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll(CONFIG.statSelector).forEach((el) => {
    if (!el.closest(CONFIG.skipSelector)) statIo.observe(el);
  });
})();
