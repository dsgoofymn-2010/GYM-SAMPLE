/* =====================================================================
   Mr Thunder Gym — achievements page script (achievements.html only)
   ---------------------------------------------------------------------
   Renders the achievement grid from the ACHIEVEMENTS_ITEMS array below,
   handles category filters and the accessible lightbox.

   PHASE 1: all data is placeholder content. Add/edit items by editing
   ACHIEVEMENTS_ITEMS — the grid, filters and lightbox stay in sync.
   ===================================================================== */
'use strict';

(function () {
  const grid = document.getElementById('achievements-grid');
  if (!grid) return; // Not on achievements.html.

  /* ==================================================================
     DATA — add new achievements here (PLACEHOLDER CONTENT).
     category: 'Competitions' | 'Transformations' | 'Events'
     ================================================================== */
  const CATEGORY_TAGS = {
    'Competitions': 'competitions',
    'Transformations': 'transformations',
    'Events': 'events',
  };

  const ACHIEVEMENTS_ITEMS = [
    // PLACEHOLDER: every item below is sample data — replace text/images.
    {
      id: 'comp-1',
      title: 'District Championship: 3 Gold Medals',
      year: 2024,
      category: 'Competitions',
      description: 'PLACEHOLDER: Team Thunder swept the podium at the district bodybuilding championship.',
      image: 'assets/images/achievement-competition-1.svg',
      alt: 'Mr Thunder Gym team on the district championship podium (placeholder image)',
    },
    {
      id: 'comp-2',
      title: 'State Powerlifting Meet',
      year: 2023,
      category: 'Competitions',
      description: 'PLACEHOLDER: Two lifters qualified for the state-level powerlifting finals.',
      image: 'assets/images/achievement-competition-2.svg',
      alt: 'Powerlifter mid-lift at the state meet (placeholder image)',
    },
    {
      id: 'comp-3',
      title: 'Inter-Gym Strength Challenge',
      year: 2023,
      category: 'Competitions',
      description: 'PLACEHOLDER: Winners of the first inter-gym strength challenge in Virudhunagar.',
      image: 'assets/images/achievement-competition-3.svg',
      alt: 'Winners holding trophies at the strength challenge (placeholder image)',
    },
    {
      id: 'comp-4',
      title: 'Best Physique Award',
      year: 2022,
      category: 'Competitions',
      description: 'PLACEHOLDER: Member received the best physique award at a regional open event.',
      image: 'assets/images/achievement-competition-4.svg',
      alt: 'Member posing at a physique competition (placeholder image)',
    },
    {
      id: 'trans-1',
      title: 'Mr Ramanathan, 18 kg Transformation',
      year: 2024,
      category: 'Transformations',
      description: 'PLACEHOLDER: 12-month supervised weight-loss journey with diet coaching.',
      image: 'assets/images/achievement-transformation-1.svg',
      alt: 'Member before and after a weight-loss transformation (placeholder image)',
    },
    {
      id: 'trans-2',
      title: 'Ms Divya, First Pull-up to 10 Reps',
      year: 2024,
      category: 'Transformations',
      description: 'PLACEHOLDER: Strength journey from zero pull-ups to ten clean reps.',
      image: 'assets/images/achievement-transformation-2.svg',
      alt: 'Member doing pull-ups in the gym (placeholder image)',
    },
    {
      id: 'trans-3',
      title: 'Mr Karthik, 10 kg Lean Bulk',
      year: 2023,
      category: 'Transformations',
      description: 'PLACEHOLDER: Structured bulk with personal training and meal plans.',
      image: 'assets/images/achievement-transformation-3.svg',
      alt: 'Member flexing after a lean bulk cycle (placeholder image)',
    },
    {
      id: 'event-1',
      title: 'Annual Fitness Awareness Camp',
      year: 2024,
      category: 'Events',
      description: 'PLACEHOLDER: Free fitness screening camp for the Virudhunagar community.',
      image: 'assets/images/achievement-event-1.svg',
      alt: 'Crowd at the annual fitness awareness camp (placeholder image)',
    },
    {
      id: 'event-2',
      title: 'Marathon Prep Workshop',
      year: 2023,
      category: 'Events',
      description: 'PLACEHOLDER: Running-form and injury-prevention workshop for members.',
      image: 'assets/images/achievement-event-2.svg',
      alt: 'Coach demonstrating running drills at a workshop (placeholder image)',
    },
  ];

  /* ==================================================================
     RENDER
     ================================================================== */
  function buildCard(item) {
    const card = document.createElement('article');
    card.className = 'card achievement-card';
    card.dataset.tags = CATEGORY_TAGS[item.category] || '';
    card.dataset.id = item.id;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card-media-button';
    button.dataset.id = item.id;
    button.setAttribute('aria-label', 'View larger: ' + item.title);
    button.setAttribute('aria-haspopup', 'dialog');

    const img = document.createElement('img');
    img.className = 'card-media';
    img.src = item.image;
    img.alt = item.alt;
    img.width = 800;
    img.height = 600;
    img.loading = 'lazy';
    button.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const meta = document.createElement('p');
    meta.className = 'achievement-meta';
    const tag = document.createElement('span');
    tag.className = 'card-tag';
    tag.textContent = item.category;
    const line = document.createElement('span');
    line.className = 'meta-year';
    line.textContent = 'Year: ' + item.year;
    meta.append(tag, line);

    const title = document.createElement('h3');
    title.textContent = item.title;

    const desc = document.createElement('p');
    desc.textContent = item.description;

    body.append(meta, title, desc);
    card.append(button, body);
    return card;
  }

  const items = ACHIEVEMENTS_ITEMS; // alias
  grid.replaceChildren(...items.map(buildCard));

  /* ==================================================================
     FILTERS — handled by the shared initCardFilters() in main.js.
     Rendering above happens before initCardFilters(document) is inside
     main.js boot, so re-run it here now that cards exist.
     ================================================================== */
  if (window.GymUI && typeof window.GymUI.initCardFilters === 'function') {
    window.GymUI.initCardFilters(document);
  }

  /* ==================================================================
     LIGHTBOX (keyboard accessible)
     ================================================================== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMeta = document.getElementById('lightbox-meta');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let currentList = [];
  let currentIndex = -1;
  let lastFocused = null;

  function visibleItems() {
    const visibleIds = new Set(
      Array.from(grid.querySelectorAll('.achievement-card:not([hidden])'))
        .map((card) => card.dataset.id)
    );
    return items.filter((item) => visibleIds.has(item.id));
  }

  function updateLightbox() {
    const item = currentList[currentIndex];
    if (!item) return;
    lightboxImg.src = item.image;
    lightboxImg.alt = item.alt;
    lightboxTitle.textContent = item.title;
    lightboxMeta.textContent = item.category + ', ' + item.year;
  }

  function step(delta) {
    if (!currentList.length) return;
    currentIndex = (currentIndex + delta + currentList.length) % currentList.length;
    updateLightbox();
  }

  function openLightbox(id) {
    currentList = visibleItems();
    currentIndex = currentList.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;

    lastFocused = document.activeElement;
    updateLightbox();
    lightbox.hidden = false;
    document.body.classList.add('no-scroll');
    closeBtn.focus();
    document.addEventListener('keydown', onLightboxKeydown);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onLightboxKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function onLightboxKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'Tab') {
      // Minimal focus loop: Close / Prev / Next.
      const focusables = [closeBtn, prevBtn, nextBtn];
      const index = focusables.indexOf(document.activeElement);
      event.preventDefault();
      if (event.shiftKey) {
        focusables[(index - 1 + focusables.length) % focusables.length].focus();
      } else {
        focusables[(index + 1) % focusables.length].focus();
      }
    }
  }

  grid.addEventListener('click', (event) => {
    const trigger = event.target.closest('.card-media-button');
    if (trigger) openLightbox(trigger.dataset.id);
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  // Click on the dark backdrop (not the figure) closes it.
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
})();
