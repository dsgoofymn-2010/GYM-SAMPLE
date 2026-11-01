/* =====================================================================
   Mr Thunder Gym — booking page script (booking.html only)
   ---------------------------------------------------------------------
   PHASE 1 / FRONTEND ONLY: no server, no API calls. Data never leaves
   the browser. Validation is custom (novalidate), with inline errors.
   ===================================================================== */
'use strict';

(function () {
  const form = document.getElementById('booking-form');
  if (!form) return; // Not on booking.html.

  const CONFIG = (window.GymUI && window.GymUI.SITE_CONFIG) || {};
  const successPanel = document.getElementById('booking-success');
  const successTitle = document.getElementById('booking-success-title');
  const summaryList = document.getElementById('booking-summary');
  const whatsappLink = document.getElementById('whatsapp-confirm');
  const bookAnotherBtn = document.getElementById('book-another');

  const dateInput = form.elements.date;

  /* ------------------------------------------------------------------
     Date helpers
     ------------------------------------------------------------------ */
  function todayISO() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function formatDate(iso) {
    // PLACEHOLDER: en-IN medium date format.
    try {
      return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
        new Date(iso + 'T12:00:00')
      );
    } catch {
      return iso;
    }
  }

  if (dateInput) dateInput.min = todayISO();

  /* ------------------------------------------------------------------
     Validation rules (return true, or an error message string)
     ------------------------------------------------------------------ */
  const validators = {
    name(value) {
      const v = value.trim();
      if (!v) return 'Full name is required.';
      if (v.length < 3) return 'Please enter your full name (at least 3 characters).';
      return true;
    },
    phone(value) {
      const digits = value.replace(/\D/g, '');
      if (!digits) return 'Phone number is required.';
      if (!/^\d{10}$/.test(digits)) return 'Enter a 10-digit phone number.';
      return true;
    },
    email(value) {
      const v = value.trim();
      if (!v) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        return 'Enter a valid email address (like name@example.com).';
      }
      return true;
    },
    service(value) {
      if (!value) return 'Please choose a service type.';
      return true;
    },
    date(value) {
      if (!value) return 'Preferred date is required.';
      if (value < todayISO()) return 'Choose today or a future date.';
      return true;
    },
    slot(value) {
      if (!value) return 'Please choose a time slot.';
      return true;
    },
    // message: optional field, no validation.
  };

  /* ------------------------------------------------------------------
     Error display
     ------------------------------------------------------------------ */
  function setFieldState(name, error) {
    const input = form.elements[name];
    const fieldBox = input ? input.closest('.field') : null;
    const errorEl = document.getElementById('error-' + name);
    if (!input || !errorEl) return;

    const hasError = typeof error === 'string';
    errorEl.textContent = hasError ? error : '';
    input.setAttribute('aria-invalid', hasError ? 'true' : 'false');
    if (fieldBox) fieldBox.classList.toggle('invalid', hasError);
  }

  function clearAllErrors() {
    Object.keys(validators).forEach((name) => setFieldState(name, true));
  }

  function firstInvalid() {
    return Object.keys(validators).find((name) => {
      const input = form.elements[name];
      return input && input.getAttribute('aria-invalid') === 'true';
    });
  }

  // Clear a field's error as soon as the user edits it.
  form.addEventListener('input', (event) => {
    const target = event.target;
    if (target instanceof Element && target.name && validators[target.name]) {
      setFieldState(target.name, true);
    }
  });

  /* ------------------------------------------------------------------
     Booking summary + WhatsApp confirm
     ------------------------------------------------------------------ */
  function addSummaryRow(dt, dd) {
    const term = document.createElement('dt');
    term.textContent = dt;
    const desc = document.createElement('dd');
    desc.textContent = dd;
    summaryList.append(term, desc);
  }

  function buildWhatsAppUrl(booking) {
    const lines = [
      'Booking request for ' + (CONFIG.name || 'Mr Thunder Gym'),
      'Name: ' + booking.name,
      'Phone: ' + booking.phone,
      'Email: ' + booking.email,
      'Service: ' + booking.service,
      'Date: ' + booking.date,
      'Time slot: ' + booking.slot,
    ];
    if (booking.message) lines.push('Message: ' + booking.message);
    return (
      'https://wa.me/' + (CONFIG.whatsappNumber || '') +
      '?text=' + encodeURIComponent(lines.join('\n'))
    );
  }

  function showSuccess(booking) {
    summaryList.replaceChildren();
    addSummaryRow('Name', booking.name);
    addSummaryRow('Phone', booking.phone);
    addSummaryRow('Email', booking.email);
    addSummaryRow('Service', booking.service);
    addSummaryRow('Date', booking.date);
    addSummaryRow('Time slot', booking.slot);
    if (booking.message) addSummaryRow('Message', booking.message);

    whatsappLink.setAttribute('href', buildWhatsAppUrl(booking));

    form.hidden = true;
    successPanel.hidden = false;
    successTitle.focus(); // Move keyboard/screen-reader focus to the result.
  }

  /* ------------------------------------------------------------------
     Submit (no server call — frontend only)
     ------------------------------------------------------------------ */
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let firstErrorField = null;
    Object.entries(validators).forEach(([name, validate]) => {
      const input = form.elements[name];
      if (!input) return;
      const result = validate(input.value);
      setFieldState(name, result);
      if (typeof result === 'string' && !firstErrorField) firstErrorField = input;
    });

    if (firstErrorField) {
      firstErrorField.focus();
      return;
    }

    const serviceSelect = form.elements.service;
    const slotSelect = form.elements.slot;

    showSuccess({
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.replace(/\D/g, ''),
      email: form.elements.email.value.trim(),
      service: serviceSelect.value,
      date: formatDate(form.elements.date.value),
      slot: slotSelect.value,
      message: form.elements.message.value.trim(),
    });
  });

  /* ------------------------------------------------------------------
     "Book another" — back to the empty form
     ------------------------------------------------------------------ */
  bookAnotherBtn.addEventListener('click', () => {
    successPanel.hidden = true;
    form.hidden = false;
    form.reset();
    clearAllErrors();
    if (dateInput) dateInput.min = todayISO();
    form.elements.name.focus();
  });
})();
