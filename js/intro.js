/* Thunder Gym storm intro (Canvas 2D, no dependencies, no WebGL).
   Drop-in: <script src="js/intro.js" defer></script> on index.html only.
   Adds its own CSS + overlay, plays once per session, and always removes itself. */
(function () {
  'use strict';

  // ---- Tweak everything here ----
  var CONFIG = {
    enabled: true,
    oncePerSession: true,      // true = plays once per visit (new tab/window); false = plays on every load of the page
    storageKey: 'mrthunder-intro-played',
    color: '#ffd21f',          // bolt glow (lightning yellow)
    core: '#ffffff',           // bolt core
    title: 'THUNDER GYM',
    tagline: 'Ignite your power',
    totalMs: 3900,             // whole intro length
    fadeMs: 450,               // dissolve at the end
    failsafeMs: 8000,          // hard removal no matter what
    dprCap: 1.75,
    sparks: 90
  };
  // t = start (ms), x = horizontal position (0..1), reach = how far down (0..1 of height),
  // w = thickness, flash = screen flash strength, life = how long it lingers (ms)
  var STRIKES = [
    { t: 400,  x: 0.17, reach: 0.55, w: 0.7, flash: 0.12, life: 300 },
    { t: 950,  x: 0.83, reach: 0.62, w: 0.8, flash: 0.14, life: 320 },
    { t: 1600, x: 0.50, reach: 0.50, w: 3.0, flash: 0.7,  life: 1500, main: true }
  ];

  if (!CONFIG.enabled) return;
  // Force a replay for testing: add ?intro to the URL (e.g. index.html?intro)
  var force = !!(document.currentScript && document.currentScript.hasAttribute('data-force')) ||
    /[?&]intro(=|&|$)/.test(window.location.search);
  try {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (CONFIG.oncePerSession) {
      if (!force && sessionStorage.getItem(CONFIG.storageKey)) return;
      sessionStorage.setItem(CONFIG.storageKey, '1');
    }
  } catch (e) { /* storage blocked: just play */ }

  function boot() {
    try { start(); } catch (err) {
      var o = document.querySelector('.mt-intro'); if (o) o.remove();
      document.documentElement.style.overflow = '';
    }
  }

  function start() {
    var root = document.documentElement, prevOverflow = root.style.overflow;
    var css = document.createElement('style');
    css.textContent =
      '.mt-intro{position:fixed;inset:0;z-index:9999;overflow:hidden;background:radial-gradient(ellipse at 50% 42%,#17150c 0%,#0a0906 72%)}' +
      '.mt-c{position:absolute;inset:0;width:100%;height:100%;display:block}' +
      '.mt-flash{position:absolute;inset:0;background:#fff3b0;opacity:0;pointer-events:none}' +
      '.mt-title{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;opacity:0;pointer-events:none;color:#fff;' +
        'font-family:var(--font-display,"Fjalla One"),Impact,"Arial Narrow",sans-serif;font-size:clamp(2.6rem,11vw,8rem);letter-spacing:.05em;line-height:1;' +
        'text-shadow:0 0 16px ' + CONFIG.color + ',0 0 60px rgba(255,210,31,.65)}' +
      '.mt-title small{display:block;margin-top:1.1rem;font-size:.17em;letter-spacing:.35em;color:' + CONFIG.color + ';text-shadow:none}' +
      '.mt-skip{position:absolute;right:20px;bottom:20px;min-height:44px;padding:0 1.2rem;background:rgba(10,9,6,.6);color:' + CONFIG.color + ';' +
        'border:1px solid rgba(255,210,31,.55);border-radius:4px;font:600 .95rem/1 system-ui,sans-serif;cursor:pointer}' +
      '.mt-skip:focus-visible{outline:3px solid #fff;outline-offset:3px}';
    document.head.appendChild(css);

    var ov = document.createElement('div');
    ov.className = 'mt-intro';
    ov.innerHTML = '<canvas class="mt-c"></canvas><div class="mt-flash"></div>' +
      '<div class="mt-title" aria-hidden="true">' + CONFIG.title + '<small>' + CONFIG.tagline + '</small></div>' +
      '<button class="mt-skip" type="button">Skip intro</button>';
    document.body.appendChild(ov);
    root.style.overflow = 'hidden';

    var cv = ov.querySelector('.mt-c'), ctx = cv.getContext('2d');
    var flashEl = ov.querySelector('.mt-flash'), titleEl = ov.querySelector('.mt-title'), skipBtn = ov.querySelector('.mt-skip');
    var W = 1, H = 1, dpr = 1;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, CONFIG.dprCap);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size);

    // ---- Bolt geometry: midpoint displacement + recursive branches ----
    function jag(a, b, d, out) {
      if (d < 3) { out.push(b); return; }
      var m = [(a[0] + b[0]) / 2 + (Math.random() - 0.5) * d, (a[1] + b[1]) / 2 + (Math.random() - 0.5) * d * 0.4];
      jag(a, m, d / 1.9, out); jag(m, b, d / 1.9, out);
    }
    function poly(a, b, d, w, s) {
      var pts = [a]; jag(a, b, d, pts);
      var cum = [0], len = 0;
      for (var i = 1; i < pts.length; i++) { len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(len); }
      return { pts: pts, cum: cum, len: len, w: w, s: s };
    }
    function branches(p, w, depth, out) {
      for (var i = 6; i < p.pts.length - 2; i++) {
        if (Math.random() > 0.07 / (depth + 1)) continue;
        var a = p.pts[i], dir = (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.6);
        var len = (0.07 + Math.random() * 0.17) * H / (depth + 1);
        var b = [a[0] + Math.sin(dir) * len, a[1] + Math.cos(dir) * len];
        var q = poly(a, b, len * 0.4, w, Math.min(0.95, p.s + (p.cum[i] / p.len) * (depth ? 0.1 : 1) + 0.02));
        out.push(q);
        if (depth < 2) branches(q, w * 0.6, depth + 1, out);
      }
    }
    function makeBolt(s) {
      var x = W * s.x + (Math.random() - 0.5) * W * 0.04;
      var main = poly([x, -20], [x + (Math.random() - 0.5) * W * 0.05, H * s.reach], Math.min(H, W) * 0.35, s.w, 0);
      var polys = [main];
      branches(main, s.w * 0.55, 0, polys);
      return polys;
    }
    function trace(p, f) {
      var lim = p.len * f, pts = p.pts;
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) {
        if (p.cum[i] <= lim) { ctx.lineTo(pts[i][0], pts[i][1]); continue; }
        var k = (lim - p.cum[i - 1]) / (p.cum[i] - p.cum[i - 1]);
        ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k);
        break;
      }
    }
    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function pulse(age, k) { return age < 0 ? 0 : age < 30 ? age / 30 : Math.exp(-(age - 30) / k); }

    // ---- Timeline ----
    var done = false, skipped = false, raf = 0, t0 = performance.now();
    var started = [], bolts = [], sparks = [], sparksMade = false, impact = null, mainStart = 0;
    for (var i = 0; i < STRIKES.length; i++) if (STRIKES[i].main) mainStart = STRIKES[i].t;

    function frame(now) {
      if (done) return;
      var el = now - t0, dt = 1 / 60;
      for (var i = 0; i < STRIKES.length; i++) {
        var s = STRIKES[i];
        if (!started[i] && el >= s.t) {
          started[i] = true;
          var polys = makeBolt(s);
          bolts.push({ polys: polys, s: s, born: el });
          if (s.main) { var m = polys[0].pts; impact = { x: m[m.length - 1][0], y: m[m.length - 1][1], t: el + 160 }; }
        }
      }
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineJoin = ctx.lineCap = 'round';

      // ground glow after the main strike lands
      if (impact && el >= impact.t) {
        var ga = 0.5 * Math.exp(-(el - impact.t) / 700);
        var g = ctx.createRadialGradient(impact.x, impact.y, 0, impact.x, impact.y, Math.min(W, H) * 0.5);
        g.addColorStop(0, 'rgba(255,210,31,' + ga + ')'); g.addColorStop(1, 'rgba(255,210,31,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        if (!sparksMade) {
          sparksMade = true;
          for (var n = 0; n < CONFIG.sparks; n++) {
            sparks.push({ x: impact.x, y: impact.y, vx: (Math.random() - 0.5) * 560, vy: -Math.random() * 480 - 60, life: 0.6 + Math.random() * 0.9, age: 0, r: 1 + Math.random() * 2 });
          }
        }
      }

      // bolts
      var flash = 0;
      for (var b = 0; b < bolts.length; b++) {
        var bo = bolts[b], age = el - bo.born, s2 = bo.s;
        var reveal = s2.main ? 160 : 70, f = clamp(age / reveal);
        var a = age < reveal ? 1 : Math.max(0, 1 - (age - reveal) / (s2.life - reveal));
        flash += s2.flash * pulse(age, s2.main ? 260 : 80);
        if (a <= 0) continue;
        if (age >= reveal && Math.random() < 0.18) a *= 0.45;
        ctx.shadowColor = CONFIG.color;
        for (var p = 0; p < bo.polys.length; p++) {
          var pl = bo.polys[p], fr = pl.s === 0 ? f : clamp((f - pl.s) * 4);
          if (fr <= 0) continue;
          ctx.strokeStyle = CONFIG.color;
          ctx.globalAlpha = 0.22 * a; ctx.lineWidth = pl.w * 13; ctx.shadowBlur = s2.main ? 36 : 16;
          trace(pl, fr); ctx.stroke();
          ctx.shadowBlur = 0; ctx.globalAlpha = 0.6 * a; ctx.lineWidth = pl.w * 4.2;
          trace(pl, fr); ctx.stroke();
          ctx.strokeStyle = CONFIG.core; ctx.globalAlpha = a; ctx.lineWidth = Math.max(1, pl.w * 1.5);
          trace(pl, fr); ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;

      // sparks
      ctx.fillStyle = CONFIG.color;
      for (var k = sparks.length - 1; k >= 0; k--) {
        var sp = sparks[k]; sp.age += dt;
        if (sp.age > sp.life) { sparks.splice(k, 1); continue; }
        sp.vy += 900 * dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt;
        ctx.globalAlpha = 1 - sp.age / sp.life;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

      // screen flash (kept to one soft pulse per strike, never rapid strobing)
      flashEl.style.opacity = Math.min(0.8, flash).toFixed(3);

      // impact shake
      var sa = el - (mainStart + 160);
      if (sa > 0 && sa < 450) {
        var amp = 7 * (1 - sa / 450);
        cv.style.transform = 'translate(' + ((Math.random() - 0.5) * amp).toFixed(1) + 'px,' + ((Math.random() - 0.5) * amp).toFixed(1) + 'px)';
      } else cv.style.transform = '';

      // title reveal
      var tp = clamp((el - (mainStart + 450)) / 450);
      titleEl.style.opacity = tp;
      titleEl.style.transform = 'translateY(-50%) scale(' + (1.08 - 0.08 * tp).toFixed(3) + ')';

      // dissolve
      var fadeStart = CONFIG.totalMs - CONFIG.fadeMs;
      if (!skipped && el > fadeStart) ov.style.opacity = (1 - clamp((el - fadeStart) / CONFIG.fadeMs)).toFixed(3);
      if (el >= CONFIG.totalMs) { finish(); return; }
      raf = requestAnimationFrame(frame);
    }

    // ---- Always end cleanly ----
    var tEnd, tFail;
    function finish() {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf); clearTimeout(tEnd); clearTimeout(tFail);
      window.removeEventListener('resize', size);
      window.removeEventListener('keydown', onKey);
      try { ov.remove(); css.remove(); } catch (e) {}
      root.style.overflow = prevOverflow;
    }
    function skip() {
      if (skipped || done) return;
      skipped = true;
      ov.style.transition = 'opacity 220ms'; ov.style.opacity = '0';
      setTimeout(finish, 260);
    }
    function onKey(e) { if (e.key === 'Escape') skip(); }
    skipBtn.addEventListener('click', skip);
    window.addEventListener('keydown', onKey);
    tEnd = setTimeout(finish, CONFIG.totalMs + 300);   // does not depend on rAF or transitions
    tFail = setTimeout(finish, CONFIG.failsafeMs);     // last resort
    try { skipBtn.focus({ preventScroll: true }); } catch (e) {}
    raf = requestAnimationFrame(frame);
  }

  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
