/* ═══════════════════════════════════════════════════════════════
   LOUIS AFRICAN HAIR BRAIDING — Animation Engine (v2 — clean)
   Corrections v2 :
   • Logo spin : uniquement .footer-logo-mark, pas tous les SVGs
   • Orbes : pas d'overflow:hidden sur les sections parentes
   • tiltReveal : pas sur .glass-gold/.glass-soft (trop large)
   • spinReveal : fallback timeout pour éviter opacity:0 bloqué
   • cursorGlow : overflow:hidden sur body pour éviter scrollbar
   • tilt : retiré de .glass-gold (trop agressif)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── GUARDS ─────────────────────────────────────────────────── */
  const isTouch = window.matchMedia('(hover:none) and (pointer:coarse)').matches;

  /* ── HELPERS ─────────────────────────────────────────────────── */
  function q(sel) { return document.querySelectorAll(sel); }

  function onVisible(el, cb, threshold = 0.1) {
    let fired = false;
    function fire(target) {
      if (fired) return;   /* BUG #13 FIX : empêche le double-fire */
      fired = true;
      cb(target);
    }
    /* Si déjà dans le viewport au chargement → déclenche immédiatement */
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      requestAnimationFrame(() => fire(el));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { fire(e.target); obs.unobserve(e.target); } });
    }, { threshold, rootMargin: '0px 0px -20px 0px' });
    obs.observe(el);
    /* Sécurité : force visible après 3s — guard against double-fire */
    setTimeout(() => { fire(el); obs.unobserve(el); }, 3000);
  }

  /* ── 3D MOUSE-FOLLOW TILT ───────────────────────────────────── */
  /* Uniquement sur les cards explicites — pas de sélecteurs génériques */

  function initTilt(selector, intensity) {
    if (isTouch) return; /* pas de tilt sur tactile */
    q(selector).forEach(card => {
      /* Ne pas appliquer si dans le carousel ou la navbar */
      if (card.closest('#carousel-track') || card.closest('#navbar')) return;

      card.classList.add('tilt-card');

      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${(-y * intensity).toFixed(2)}deg) rotateY(${(x * intensity).toFixed(2)}deg) translateZ(8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
        card.style.transform  = '';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  }

  /* ── FLOATING ORBITAL ORBS ──────────────────────────────────── */

  function spawnOrbs(container, count, minSize = 200, maxSize = 400) {
    /* NE JAMAIS modifier overflow — cela casse le layout */
    const pos = getComputedStyle(container).position;
    if (pos === 'static') container.style.position = 'relative';

    for (let i = 0; i < count; i++) {
      const orb  = document.createElement('div');
      const size = minSize + Math.random() * (maxSize - minSize);
      const idx  = (i % 3) + 1;
      orb.className = `scene-orb scene-orb-${idx}`;
      orb.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `top:${8 + Math.random() * 70}%`,
        `left:${5 + Math.random() * 75}%`,
        `animation-delay:${-(i * 5 + Math.random() * 4)}s`,
        `filter:blur(${40 + Math.random() * 25}px)`,
        `opacity:${.5 + Math.random() * .3}`,
        'pointer-events:none',
        'z-index:0',
      ].join(';');
      container.appendChild(orb);
    }
  }

  /* ── SPARKLE DOTS ───────────────────────────────────────────── */

  function spawnSparkles(el, count = 3) {
    if (el.querySelector('.sparkle-dot')) return; /* anti-doublon */
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

    for (let i = 0; i < count; i++) {
      const s  = document.createElement('div');
      const sz = 2 + Math.random() * 2.5;
      s.className = 'sparkle-dot';
      s.style.cssText = [
        `top:${10 + Math.random() * 80}%`,
        `left:${10 + Math.random() * 80}%`,
        `width:${sz}px`, `height:${sz}px`,
        `animation-delay:${Math.random() * 2}s`,
        `animation-duration:${1.6 + Math.random() * 1.4}s`,
      ].join(';');
      el.appendChild(s);
    }
  }

  function removeSparkles(el) {
    el.querySelectorAll('.sparkle-dot').forEach(s => {
      s.style.animationPlayState = 'paused';
      setTimeout(() => s.remove(), 400);
    });
  }

  /* ── LOGO SVG SLOW SPIN ─────────────────────────────────────── */
  /* CORRECTION : uniquement .footer-logo-mark — pas "footer svg" entier */

  function initLogoSpin() {
    q('.footer-logo-mark').forEach((el, i) => {
      el.style.display        = 'inline-block';
      el.style.animation      = `slowSpin 36s linear infinite`;
      el.style.animationDelay = `${-(i * 8)}s`;
    });
  }

  /* ── TILT-IN REVEAL FOR CARDS ───────────────────────────────── */
  /* CORRECTION : sélecteurs précis, pas de .glass-gold/.glass-soft */

  function initTiltReveal() {
    const SAFE_SELECTORS = [
      '.service-card:not(#carousel-track .service-card)',
      '.cta-card',
      '.feature-card',
      '.pricing-card',
      '.info-card',
    ];

    SAFE_SELECTORS.forEach(sel => {
      q(sel).forEach((el, i) => {
        if (el.classList.contains('reveal') || el.classList.contains('tilt-reveal')) return;
        el.classList.add('tilt-reveal');
        el.style.transitionDelay = `${(i % 4) * 0.1}s`;
        onVisible(el, t => t.classList.add('visible'));
      });
    });
  }

  /* ── SPIN-REVEAL FOR HEADINGS ────────────────────────────────── */
  /* CORRECTION : timeout fallback pour éviter opacity:0 bloqué    */

  function initSpinReveal() {
    q('h1, h2').forEach(el => {
      /* Skip si déjà géré par .reveal ou hors section animée */
      if (el.classList.contains('reveal') ||
          el.classList.contains('spin-reveal') ||
          el.classList.contains('booking-h2')) return;

      el.classList.add('spin-reveal');
      onVisible(el, t => t.classList.add('visible'), 0.12);
    });
  }

  /* ── EYEBROW SHIMMER ON HOVER ───────────────────────────────── */

  function initEyebrowShimmer() {
    if (isTouch) return;
    q('.eyebrow').forEach(el => {
      el.addEventListener('mouseenter', () => el.classList.add('shimmer-gold'));
      el.addEventListener('mouseleave', () => el.classList.remove('shimmer-gold'));
    });
  }

  /* ── STAT FLOAT ─────────────────────────────────────────────── */

  function initStatFloat() {
    q('#hero-counter, .hero-stat-num').forEach((el, i) => {
      el.classList.add('anim-float-sm');
      el.style.animationDelay = `${i * 0.5}s`;
    });
  }

  /* ── GALLERY SPARKLES ON HOVER ──────────────────────────────── */

  function initGallerySparkles() {
    if (isTouch) return;
    q('.gallery-item').forEach(item => {
      item.addEventListener('mouseenter', () => spawnSparkles(item, 3));
      item.addEventListener('mouseleave', () => removeSparkles(item));
    });
  }

  /* ── BUTTON SPARKLE ─────────────────────────────────────────── */

  function initButtonEffects() {
    if (isTouch) return;
    q('.btn-primary:not(.btn-gold-pulse)').forEach(btn => {
      btn.classList.add('anim-breathe');
    });
    /* Sparkle uniquement sur le CTA principal pour ne pas surcharger */
    q('#cta-band-book, #hero-cta-book').forEach(btn => {
      btn.addEventListener('mouseenter', () => spawnSparkles(btn, 4));
      btn.addEventListener('mouseleave', () => removeSparkles(btn));
    });
  }

  /* ── BACKGROUND ORBS PER SECTION ───────────────────────────── */
  /* CORRECTION : pas d'overflow:hidden, nombre limité           */

  function initSectionOrbs() {
    /* Sections sombres : orbes plus visibles */
    ['#hero', '#immersion', '#booking'].forEach(id => {
      const sec = document.querySelector(id);
      if (!sec || sec.dataset.orbsDone) return;
      sec.dataset.orbsDone = '1';
      spawnOrbs(sec, id === '#hero' ? 3 : 2);
    });

    /* Footer */
    const footer = document.querySelector('footer');
    if (footer && !footer.dataset.orbsDone) {
      footer.dataset.orbsDone = '1';
      spawnOrbs(footer, 2, 250, 450);
    }

    /* Sections claires : 1 orbe très subtile, max 4 sections */
    let count = 0;
    document.querySelectorAll('section').forEach(sec => {
      if (sec.dataset.orbsDone || count >= 4) return;
      /* Éviter hero et booking déjà traités */
      if (sec.id === 'hero' || sec.id === 'booking' || sec.id === 'immersion') return;
      sec.dataset.orbsDone = '1';
      spawnOrbs(sec, 1, 300, 500);
      count++;
    });
  }

  /* ── ROTATING CTA ICONS ─────────────────────────────────────── */

  function initIconRotations() {
    /* CTA icons: rotation lente et propre */
    q('.cta-icon svg').forEach((svg, i) => {
      svg.style.display      = 'inline-block';
      svg.style.animation    = `slowSpin ${30 + i * 8}s linear infinite`;
      svg.style.willChange   = 'transform';
    });

    /* Review quote marks : rocking doux */
    q('.review-card > svg:first-child').forEach((svg, i) => {
      svg.style.display        = 'inline-block';
      svg.style.animation      = `gentleRock ${5 + i * 0.4}s ease-in-out infinite`;
      svg.style.animationDelay = `${i * 0.25}s`;
    });
  }

  /* ── CURSOR GOLDEN SPOTLIGHT ────────────────────────────────── */
  /* BUG #10 FIX : z-index 99 (sous lightbox 200 et navbar 100)  */
  /* BUG #4 FIX  : overflow:hidden sur wrapper pour éviter scroll */

  function initCursorGlow() {
    if (isTouch) return;

    /* Wrapper fixe qui ne trigger pas de scrollbar */
    const wrap = document.createElement('div');
    wrap.style.cssText = [
      'position:fixed', 'inset:0',
      'pointer-events:none',
      'z-index:99',          /* FIX: était 9998, apparaissait AU-DESSUS du lightbox */
      'overflow:hidden',
    ].join(';');
    document.body.appendChild(wrap);

    const glow = document.createElement('div');
    glow.style.cssText = [
      'position:absolute',
      'border-radius:50%',
      'width:360px', 'height:360px',
      'background:radial-gradient(circle, rgba(201,169,97,.06) 0%, transparent 68%)',
      'transform:translate(-50%,-50%)',
      'transition:opacity .5s',
      'opacity:0',
      'pointer-events:none',
    ].join(';');
    wrap.appendChild(glow);

    let gx = 0, gy = 0, mx = 0, my = 0, visible = false;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (!visible) { glow.style.opacity = '1'; visible = true; }
    });
    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0'; visible = false;
    });

    function lerp(a, b, t) { return a + (b - a) * t; }
    (function tick() {
      gx = lerp(gx, mx, 0.07);
      gy = lerp(gy, my, 0.07);
      glow.style.left = gx + 'px';
      glow.style.top  = gy + 'px';
      requestAnimationFrame(tick);
    })();
  }

  /* ── BOOKING H2 WORD HOVER TILT ─────────────────────────────── */

  function initBookingWordRotate() {
    const h2 = document.querySelector('.booking-h2');
    if (!h2 || h2.dataset.split || isTouch) return;
    h2.dataset.split = '1';
    const words = h2.textContent.trim().split(/\s+/);
    h2.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word + ' ';
      span.style.cssText = [
        'display:inline-block',
        `transition:transform .35s cubic-bezier(.34,1.56,.64,1) ${i * .06}s, color .3s`,
      ].join(';');
      span.addEventListener('mouseenter', () => {
        span.style.transform = 'rotate(-2.5deg) scale(1.05)';
        span.style.color = 'var(--gold-300, #dbc178)';
      });
      span.addEventListener('mouseleave', () => {
        span.style.transform = '';
        span.style.color = '';
      });
      h2.appendChild(span);
    });
  }

  /* ── STAGGER REVEAL CHILDREN ────────────────────────────────── */

  function initRevealStagger() {
    q('.triple-grid > div').forEach((el, i) => {
      if (el.classList.contains('reveal') || el.classList.contains('slide-rotate-reveal')) return;
      el.classList.add('slide-rotate-reveal');
      el.style.transitionDelay = `${i * 0.12}s`;
      onVisible(el, t => t.classList.add('visible'), 0.08);
    });
  }

  /* ── MAIN INIT ──────────────────────────────────────────────── */

  function init() {
    /* Tilt uniquement sur les cards explicites */
    initTilt('.cta-card',    6);
    initTilt('.review-card', 4);

    initSectionOrbs();
    initLogoSpin();
    initTiltReveal();
    initSpinReveal();
    initEyebrowShimmer();
    initStatFloat();
    initGallerySparkles();
    initButtonEffects();
    initIconRotations();
    initRevealStagger();
    initBookingWordRotate();
    initCursorGlow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ═══════════════════════════════════════════════════════════════
   REVEAL SAFETY NET (mobile-robust)
   Backup observer for the .reveal family so content is NEVER left
   blank if a page's inline observer fails or doesn't run.
   • reveals on scroll-in (keeps the animation)
   • forces visible after 3s as a last resort
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  function run() {
    var sel = '.reveal, .tilt-reveal, .spin-reveal, .slide-rotate-reveal';
    var els = document.querySelectorAll(sel);
    if (!els.length) return;
    function show(el) { el.classList.add('visible'); }
    if (!('IntersectionObserver' in window)) { els.forEach(show); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) {
      if (el.classList.contains('visible')) return;
      obs.observe(el);
      setTimeout(function () { show(el); }, 3000); /* never stay hidden */
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else { run(); }
})();

/* ═══════════════════════════════════════════════════════════════
   BFCACHE SCROLL-LOCK FIX
   Quand une page est restaurée depuis le back/forward cache (bouton
   Précédent/Suivant, retour depuis un autre onglet), le smooth-scroll
   Lenis a « capturé » le scroll mais sa boucle requestAnimationFrame ne
   tourne plus → la page devient impossible à scroller (haut ET bas).
   On détruit alors proprement Lenis et on lève tout verrou de scroll,
   ce qui redonne immédiatement le scroll natif. Aucun rechargement,
   aucun clignotement.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  function unlockScroll() {
    var l = window.__lenis;
    if (l && typeof l.destroy === 'function') {
      try { l.destroy(); } catch (e) {}
      window.__lenis = null;
    }
    var h = document.documentElement;
    h.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
    h.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
  }
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) unlockScroll();   /* uniquement les restaurations bfcache */
  });
})();
