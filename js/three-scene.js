/* =====================================================================
   Mr Thunder Gym — 3D background scene (glassmorphism phase)
   ---------------------------------------------------------------------
   A fixed, non-interactive canvas behind the whole page: floating
   electric dust and a slowly turning extruded bolt, lit in the
   site's own accent. Glass panels (backdrop-filter) sit on top and
   blur it, so it is both backdrop and glass source at once.

   SAFETY RULES:
   - prefers-reduced-motion: reduce -> one still frame is rendered,
     then the loop stops. Nothing moves.
   - Three.js fails to load (offline, CDN blocked) -> the canvas is
     removed and the page is exactly what it was before: glass panels
     fall back to their token alpha, content is untouched.
   - Hidden tab -> rendering pauses.
   ===================================================================== */
(async function () {
  'use strict';

  const reduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('createElement' in document) || !window.WebGLRenderingContext) return;
  if (document.getElementById('bg3d')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'bg3d';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  let THREE;
  try {
    THREE = await import(
      /* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js'
    );
  } catch {
    canvas.remove();
    return;
  }

  // Scene colours match design.md (hue 96 lightning family; no absolutes).
  const ACCENT_HUE = new THREE.Color('hsl(96, 95%, 62%)');
  const GROUND = new THREE.Color('hsl(80, 20%, 6%)');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 40);
  camera.position.set(0, 0, 11);

  /* ---- The bolt: the site's monogram, extruded and slowly turning ---- */
  const boltShape = new THREE.Shape();
  // Scaled from the brand path "M13 2 4 14h6l-1 8 11-13h-6z".
  boltShape.moveTo(1.17, 2.15);
  boltShape.lineTo(-2.75, -2.15);
  boltShape.lineTo(-1.5, -2.15);
  boltShape.lineTo(-1.86, -3.85);
  boltShape.lineTo(3.44, 0.15);
  boltShape.lineTo(1.9, 0.15);
  boltShape.lineTo(1.51, 2.15);
  boltShape.closePath();

  const boltGeo = new THREE.ExtrudeGeometry(boltShape, {
    depth: 0.45,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 2,
  });
  const bolt = new THREE.Mesh(
    boltGeo,
    new THREE.MeshStandardMaterial({
      color: ACCENT_HUE,
      metalness: 0.35,
      roughness: 0.35,
      emissive: ACCENT_HUE,
      emissiveIntensity: 0.42,
    })
  );
  bolt.position.set(3.1, 0.4, 0);
  bolt.rotation.set(0.12, -0.35, -0.18);
  scene.add(bolt);

  const edge = new THREE.Mesh(
    new THREE.EdgesGeometry(boltGeo, 24),
    new THREE.LineBasicMaterial({
      color: 0xfff8d8,
      transparent: true,
      opacity: 0.5,
    })
  );
  bolt.add(edge);

  /* ---- Electric dust: the storm, settled into particles ---- */
  const dustCount = window.innerWidth < 720 ? 220 : 420;
  const positions = new Float32Array(dustCount * 3);
  const speeds = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 24;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 9 - 1;
    speeds[i] = 0.12 + Math.random() * 0.3;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: ACCENT_HUE,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      depthWrite: false,
    })
  );
  scene.add(dust);

  /* ---- Lights ---- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.PointLight(ACCENT_HUE, 140, 30);
  key.position.set(4.5, 3, 6);
  scene.add(key);
  const fill = new THREE.PointLight(GROUND.clone().lerp(0xffffff, 0.7), 60, 30);
  fill.position.set(-5, -2, 4);
  scene.add(fill);

  /* ---- Layout + motion ---- */
  function size() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Bolt drifts outward on wide screens, stays clear of hero copy.
    const x = Math.min(1, (w - 700) / 900) * 2.6;
    bolt.position.x = 0.9 + x;
  }
  size();
  window.addEventListener('resize', size);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  function frame(t) {
    const s = t * 0.001;
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    bolt.rotation.y = -0.35 + Math.sin(s * 0.4) * 0.28 - pointer.x * 0.18;
    bolt.rotation.z = -0.18 + Math.cos(s * 0.3) * 0.06 + pointer.y * 0.08;
    bolt.position.y = 0.4 + Math.sin(s * 0.55) * 0.22;

    const pos = dustGeo.attributes.position;
    for (let i = 0; i < dustCount; i++) {
      let y = pos.getY(i) - speeds[i] * 0.008;
      if (y < -6.5) y = 6.5;
      pos.setY(i, y + Math.sin((s + i) * 0.6) * 0.0016);
    }
    pos.needsUpdate = true;

    camera.position.x = pointer.x * 0.55;
    camera.position.y = -pointer.y * 0.35;
    camera.lookAt(0.6, 0, 0);

    renderer.render(scene, camera);
  }

  if (reduced) {
    frame(12000); // one settled still frame, then stop
    return;
  }

  let raf = 0;
  let running = true;
  function loop(t) {
    if (running) frame(t);
    raf = window.requestAnimationFrame(loop);
  }
  raf = window.requestAnimationFrame(loop);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      window.cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      raf = window.requestAnimationFrame(loop);
    }
  });
})();
