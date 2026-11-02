/* Mr Thunder Gym — site script (one file for every page).
   The HTML already holds all content, so the site works without JS.
   This file adds: mobile nav, live "open now" status, today's row in
   the hours board, filters, the achievements lightbox, booking form
   validation and scroll reveals. */
'use strict';

/* Edit gym details here. Hours are 24h "HH:MM". Day 0 = Sunday. */
const GYM = {
  phone: '98765 43210',            // PLACEHOLDER until the gym confirms
  whatsapp: '919876543210',        // PLACEHOLDER, country code + number
  hours: {
    0: [['06:00', '09:00']],
    1: [['05:00', '09:30'], ['17:00', '21:00']],
    2: [['05:00', '09:30'], ['17:00', '21:00']],
    3: [['05:00', '09:30'], ['17:00', '21:00']],
    4: [['05:00', '09:30'], ['17:00', '21:00']],
    5: [['05:00', '09:30'], ['17:00', '21:00']],
    6: [['05:00', '09:30'], ['17:00', '21:00']],
  },
};

document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- time helpers (always India time, wherever the visitor is) ---------- */
function gymNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, mins: Number(get('hour')) * 60 + Number(get('minute')) };
}
const toMins = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
function fmt(hhmm) {
  let [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + String(m).padStart(2, '0') + ' ' + ap;
}

function openStatus() {
  const { day, mins } = gymNow();
  for (const [o, c] of GYM.hours[day]) {
    if (mins >= toMins(o) && mins < toMins(c)) return { open: true, text: 'Open now · until ' + fmt(c) };
  }
  for (const [o] of GYM.hours[day]) {
    if (mins < toMins(o)) return { open: false, text: 'Closed · opens ' + fmt(o) + ' today' };
  }
  const next = (day + 1) % 7;
  const label = next === 0 ? 'Sunday' : 'tomorrow';
  return { open: false, text: 'Closed · opens ' + fmt(GYM.hours[next][0][0]) + ' ' + label };
}

document.querySelectorAll('[data-status]').forEach((el) => {
  const paint = () => { const s = openStatus(); el.dataset.open = s.open; el.textContent = s.text; };
  paint();
  setInterval(paint, 60000);
});

document.querySelectorAll('[data-day]').forEach((row) => {
  if (Number(row.dataset.day) === gymNow().day) row.classList.add('is-today');
});

document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ---------- mobile nav ---------- */
(function nav() {
  const btn = document.querySelector('.nav-toggle');
  const menu = document.getElementById('site-nav');
  if (!btn || !menu) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { set(false); btn.focus(); }
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  window.matchMedia('(min-width: 62.01rem)').addEventListener('change', (e) => { if (e.matches) set(false); });
})();

/* ---------- filters: <div data-filter="#list"> with buttons [data-value] ---------- */
document.querySelectorAll('[data-filter]').forEach((group) => {
  const list = document.querySelector(group.dataset.filter);
  const status = document.querySelector(group.dataset.status);
  if (!list) return;
  const buttons = group.querySelectorAll('button[data-value]');
  buttons.forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.value;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    let shown = 0;
    list.querySelectorAll('[data-tags]').forEach((item) => {
      const hit = v === 'all' || item.dataset.tags.split(' ').includes(v);
      item.hidden = !hit;
      if (hit) shown++;
    });
    if (status) status.textContent = 'Showing ' + shown + (v === 'all' ? ' items' : ' in ' + b.textContent.trim());
  }));
});

/* ---------- lightbox ---------- */
(function lightbox() {
  const dlg = document.getElementById('lightbox');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const img = dlg.querySelector('img');
  const title = dlg.querySelector('h2');
  const meta = dlg.querySelector('[data-lb-meta]');
  const text = dlg.querySelector('[data-lb-text]');
  let items = [];
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const card = items[index];
    const pic = card.querySelector('img');
    img.src = pic.src; img.alt = pic.alt;
    title.textContent = card.querySelector('h3').textContent;
    meta.textContent = card.querySelector('.win-meta').textContent.replace(/\s+/g, ' ').trim();
    text.textContent = card.querySelector('p').textContent;
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.win-btn');
    if (!btn) return;
    items = [...document.querySelectorAll('.win:not([hidden])')];
    opener = btn;
    show(items.indexOf(btn.closest('.win')));
    dlg.showModal();
  });
  dlg.querySelector('[data-lb-close]').addEventListener('click', () => dlg.close());
  dlg.querySelector('[data-lb-prev]').addEventListener('click', () => show(index - 1));
  dlg.querySelector('[data-lb-next]').addEventListener('click', () => show(index + 1));
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { if (opener) opener.focus(); });
})();

/* ---------- booking form ---------- */
(function booking() {
  const form = document.getElementById('booking-form');
  if (!form) return;
  const success = document.getElementById('booking-success');
  const summary = document.getElementById('form-summary');
  const date = form.elements.date;

  const today = new Date();
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  date.min = iso(today);
  const max = new Date(today); max.setDate(max.getDate() + 60); date.max = iso(max);

  const rules = {
    name: (v) => (v.trim().length < 2 ? 'Enter your name (at least 2 letters).' : ''),
    phone: (v) => (!/^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '').replace(/^(\+?91)/, '')) ? 'Enter a 10-digit Indian mobile number.' : ''),
    email: (v) => (v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Check the email address, for example name@gmail.com.' : ''),
    service: (v) => (!v ? 'Choose what you want to book.' : ''),
    date: (v) => {
      if (!v) return 'Pick a date.';
      if (v < date.min || v > date.max) return 'Pick a date in the next 60 days.';
      return '';
    },
    slot: (v, all) => {
      if (!v) return 'Choose a time slot.';
      if (all.date && new Date(all.date + 'T00:00').getDay() === 0 && v !== 'sunday') return 'On Sundays only the 6:00 to 9:00 AM slot runs.';
      if (all.date && new Date(all.date + 'T00:00').getDay() !== 0 && v === 'sunday') return 'The Sunday slot only runs on Sundays.';
      return '';
    },
  };

  const values = () => Object.fromEntries(new FormData(form));
  const check = (name) => {
    const field = form.elements[name];
    const msg = rules[name](field.value, values());
    const err = document.getElementById('error-' + name);
    err.textContent = msg;
    if (msg) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
    return msg;
  };

  Object.keys(rules).forEach((name) => {
    const f = form.elements[name];
    f.addEventListener('blur', () => { if (f.value || f.hasAttribute('aria-invalid')) check(name); });
    f.addEventListener('input', () => { if (f.hasAttribute('aria-invalid')) check(name); });
  });
  date.addEventListener('change', () => { if (form.elements.slot.value) check('slot'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = Object.keys(rules).map((n) => [n, check(n)]).filter(([, m]) => m);
    if (errors.length) {
      summary.hidden = false;
      summary.querySelector('ul').innerHTML = errors
        .map(([n, m]) => '<li><a href="#f-' + n + '">' + m + '</a></li>').join('');
      summary.focus();
      return;
    }
    summary.hidden = true;
    const v = values();
    const label = (name) => { const s = form.elements[name]; return s.options ? s.options[s.selectedIndex].text : s.value; };
    const niceDate = new Date(v.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    const rows = [['Name', v.name.trim()], ['Phone', v.phone.trim()], ['Booking', label('service')], ['Date', niceDate], ['Slot', label('slot')]];
    if (v.email.trim()) rows.splice(2, 0, ['Email', v.email.trim()]);
    success.querySelector('dl').innerHTML = rows.map(([k, val]) => '<dt>' + k + '</dt><dd></dd>').join('');
    success.querySelectorAll('dd').forEach((dd, i) => { dd.textContent = rows[i][1]; });

    let msg = 'Hi Mr Thunder Gym, I would like to book:\n' + rows.map(([k, val]) => k + ': ' + val).join('\n');
    if (v.message && v.message.trim()) msg += '\nNote: ' + v.message.trim();
    success.querySelector('[data-whatsapp]').href = 'https://wa.me/' + GYM.whatsapp + '?text=' + encodeURIComponent(msg);

    form.hidden = true;
    success.hidden = false;
    success.focus();
    success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  success.querySelector('[data-again]').addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
    form.querySelectorAll('.error').forEach((el) => { el.textContent = ''; });
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();

/* ---------- reveals ---------- */
(function reveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
})();
