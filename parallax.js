/* ═══════════════════════════════════════════════════════════════
   LOUIS AFRICAN HAIR BRAIDING — Parallax Engine (v2 — clean)
   Règles strictes :
   • Uniquement les éléments position:absolute ou images dans
     un conteneur overflow:hidden → pas de conflit layout
   • Jamais sur les éléments avec animation CSS transform
   • Jamais sur le carousel, les marquees, la navbar
   • Vitesses conservatrices (0.05 – 0.35)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── GUARDS ─────────────────────────────────────────────────── */
  if (window.matchMedia('(hover:none) and (pointer:coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  /* ── STATE ──────────────────────────────────────────────────── */
  let smoothY  = 0;   // position lissée Lenis
  let ticking  = false;
  let VH       = window.innerHeight;

  /* Recalcule la hauteur écran au resize/rotation pour garder
     les décalages parallax alignés (évite le drift après resize) */
  window.addEventListener('resize', () => {
    VH = window.innerHeight;
    if (!ticking) { requestAnimationFrame(render); ticking = true; }
  }, { passive: true });

  /* ══════════════════════════════════════════════════════════════
     CIBLES SÛRES  (aucun conflit possible)

     Groupe A — position:absolute → transform:translateY safe
     Groupe B — img/video dans overflow:hidden → translateY crée
                l'effet de clipping parallaxe attendu
     Groupe C — orbes → on modifie `top` (pas transform) pour
                éviter d'écraser l'animation CSS orbDrift
  ══════════════════════════════════════════════════════════════ */

  const LAYERS_A = [
    /* HÉRO — vitesses réduites pour éviter les bords noirs */
    { sel: '.hero-video',            speed:  0.12 },
    { sel: '.hero-bg',               speed:  0.12 },
    /* Overlays gradient héro */
    { sel: '.hero-overlay-top',      speed:  0.07 },
    /* Testimonial flottant — contre-mouvement doux */
    { sel: '.floating-testimonial',  speed: -0.05 },
    /* Booking background */
    { sel: '.booking-bg',            speed:  0.10 },
    { sel: '.booking-overlay',       speed:  0.07 },
  ];

  const LAYERS_B = [
    /* Images immersion — vitesses réduites */
    { sel: '.immersion-img:nth-child(1) img',    speed:  0.07 },
    { sel: '.immersion-img:nth-child(1) video',  speed:  0.07 },
    { sel: '.immersion-img:nth-child(2) img',    speed: -0.05 },
    { sel: '.immersion-img:nth-child(2) video',  speed: -0.05 },
    { sel: '.immersion-img:nth-child(3) img',    speed:  0.08 },
    { sel: '.immersion-img:nth-child(3) video',  speed:  0.08 },
    /* Images galerie bento */
    { sel: '.gallery-item:nth-child(odd)  img',  speed:  0.05 },
    { sel: '.gallery-item:nth-child(even) img',  speed: -0.04 },
    /* Détail grid */
    { sel: '.detail-grid img',                   speed:  0.06 },
    /* About / service pages */
    { sel: '.founder-img img',                   speed:  0.08 },
    { sel: '.atelier-img img',                   speed:  0.06 },
    { sel: '.stylist-img img',                   speed: -0.04 },
    { sel: '.service-hero-img img',              speed:  0.09 },
    { sel: '.desc-img img',                      speed:  0.07 },
  ];

  /* ── COLLECTE ───────────────────────────────────────────────── */
  const items = [];

  LAYERS_A.forEach(({ sel, speed }) => {
    document.querySelectorAll(sel).forEach(el => {
      /* will-change uniquement sur les backgrounds lourds */
      if (speed > 0.2) el.style.willChange = 'transform';
      items.push({ el, speed, mode: 'translateY' });
    });
  });

  LAYERS_B.forEach(({ sel, speed }) => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.willChange = 'transform';
      items.push({ el, speed, mode: 'translateY' });
    });
  });

  /* Tracker hover sur les images de galerie pour préserver scale(1.08) */
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.parentElement.addEventListener('mouseenter', () => { img.dataset.hovered = '1'; });
    img.parentElement.addEventListener('mouseleave', () => { img.dataset.hovered = '0'; });
  });

  /* Orbes — on stocke leur top de base et on décale via margin-top
     pour ne pas écraser l'animation CSS orbDrift                   */
  const orbItems = [];
  document.querySelectorAll('.scene-orb').forEach((el, i) => {
    orbItems.push({ el, speed: [0.28, -0.22, 0.40][i % 3] });
  });

  /* ── RENDU ──────────────────────────────────────────────────── */
  function render () {
    const sy = smoothY;

    /* Groupe A & B : translateY basé sur la position relative au centre écran */
    /* BUG #14 FIX : combiner translateY avec le scale hover pour ne pas l'écraser */
    items.forEach(({ el, speed }) => {
      const rect   = el.getBoundingClientRect();
      const elCY   = rect.top + rect.height * 0.5;
      const offset = (elCY - VH * 0.5) * speed;
      const scale  = el.dataset.hovered === '1' ? ' scale(1.08)' : '';
      el.style.transform = `translateY(${offset.toFixed(2)}px)${scale}`;
    });

    /* Groupe C (orbes) : on décale margin-top pour ne pas écraser orbDrift */
    orbItems.forEach(({ el, speed }) => {
      const offset = (sy * speed * 0.3).toFixed(2);
      el.style.marginTop = `${offset}px`;
    });

    ticking = false;
  }

  /* ── SOURCE SCROLL ──────────────────────────────────────────── */
  function onScroll (y) {
    smoothY = y;
    if (!ticking) {
      requestAnimationFrame(render);
      ticking = true;
    }
  }

  /* Connexion Lenis (position lissée réelle) */
  function connectLenis () {
    const l = window.__lenis;
    if (l && typeof l.on === 'function') {
      l.on('scroll', ({ scroll }) => onScroll(scroll));
      return true;
    }
    return false;
  }

  if (!connectLenis()) {
    let tries = 0;
    const poll = setInterval(() => {
      if (connectLenis() || ++tries > 30) {
        clearInterval(poll);
        /* Fallback natif si Lenis absent */
        window.addEventListener('scroll',
          () => onScroll(window.pageYOffset), { passive: true });
      }
    }, 100);
  }

  /* Rendu initial */
  smoothY = window.pageYOffset;
  requestAnimationFrame(render);

})();
