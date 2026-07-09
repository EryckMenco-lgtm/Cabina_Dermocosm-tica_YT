/* ============================================================
   script.js — Cabina Dermocosmética YT
   ============================================================ */

/* ---- Navbar scroll ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ---- Hamburger menu ---- */
const hamburger  = document.querySelector('.hamburger');
const navLinks   = document.querySelector('.nav-links');
const navOverlay = document.createElement('div');
const navParent       = navLinks?.parentElement; // guardar padre original (nav-inner)
const navLinksNextSib = navLinks?.nextElementSibling; // guardar posición original (antes de .nav-cta)

navOverlay.classList.add('nav-overlay');
document.body.appendChild(navOverlay);

function isMobile() {
  return window.innerWidth <= 768;
}

function openMenu() {
  if (!isMobile()) return;
  // Mover al body solo en móvil para que fixed funcione desde el viewport
  document.body.appendChild(navLinks);
  hamburger.classList.add('active');
  document.body.classList.add('menu-open');
  requestAnimationFrame(() => {
    navLinks.classList.add('open');
    navOverlay.classList.add('active');
  });
  document.body.style.overflow = 'hidden';
  window.lenis?.stop();
}

function closeMenu() {
  hamburger.classList.remove('active');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('active');
  document.body.classList.remove('menu-open');
  document.body.style.overflow = '';
  window.lenis?.start();
  // Devolver nav-links a su lugar original después de la transición
  setTimeout(() => {
    if (!navLinks.classList.contains('open') && navParent && !isMobile()) {
      navParent.insertBefore(navLinks, navLinksNextSib);
    }
  }, 360);
}

// Al cambiar tamaño de ventana, restaurar posición si pasa a desktop
window.addEventListener('resize', () => {
  if (!isMobile()) {
    closeMenu();
    if (navParent && navLinks.parentElement === document.body) {
      navParent.insertBefore(navLinks, navLinksNextSib);
    }
  }
});

hamburger?.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeMenu() : openMenu();
});

// Cerrar al hacer clic en un link
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Cerrar al tocar el overlay
navOverlay.addEventListener('click', closeMenu);

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

/* ---- Smooth scroll para links internos (usa Lenis si está disponible) ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    if (window.lenis) {
      window.lenis.scrollTo(target, { offset: -offset });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- Fade-up con IntersectionObserver ---- */
const fadeEls = document.querySelectorAll('.fade-up');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => fadeObserver.observe(el));

/* ---- Contador animado (stats) ---- */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const step     = 16;
  const steps    = duration / step;
  let current    = 0;
  const inc      = target / steps;

  const timer = setInterval(() => {
    current += inc;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.round(current) + suffix;
  }, step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-target]').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

const statsSection = document.getElementById('stats');
if (statsSection) statsObserver.observe(statsSection);

/* ---- Slider de testimonios ---- */
const slider   = document.querySelector('.testimonios-slider');
const dots     = document.querySelectorAll('.testim-dot');
const cards    = document.querySelectorAll('.testim-card');
let currentSlide = 0;
let autoInterval;

function goToSlide(index) {
  if (!slider || !cards.length) return;
  const cardW = cards[0].offsetWidth + 24;
  currentSlide = Math.max(0, Math.min(index, cards.length - 1));
  slider.style.transform = `translateX(-${currentSlide * cardW}px)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    clearInterval(autoInterval);
    goToSlide(i);
    startAuto();
  });
});

function startAuto() {
  autoInterval = setInterval(() => {
    goToSlide((currentSlide + 1) % cards.length);
  }, 4500);
}

if (cards.length) startAuto();

// Touch swipe para testimonios
let touchStartX = 0;
slider?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
slider?.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) {
    clearInterval(autoInterval);
    goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
    startAuto();
  }
});

/* ---- Formulario de contacto (validación + confirmación en pantalla) ---- */
const form = document.getElementById('contacto-form');
if (form) {
  const feedback  = document.getElementById('form-feedback');
  const submitBtn = form.querySelector('.form-submit');

  // Marca/limpia el error de un campo y devuelve true si es válido
  const setError = (name, msg) => {
    const field = form.querySelector(`[name="${name}"]`);
    const errEl = form.querySelector(`.form-error[data-error-for="${name}"]`);
    if (field) {
      field.classList.toggle('is-invalid', !!msg);
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    if (errEl) errEl.textContent = msg || '';
    return !msg;
  };

  // Al corregir un campo, se limpia su error
  form.querySelectorAll('[name="nombre"], [name="servicio"], [name="consent"]').forEach((el) => {
    const clear = () => setError(el.name, '');
    el.addEventListener('input', clear);
    el.addEventListener('change', clear);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = form.querySelector('[name="nombre"]').value.trim();
    const service = form.querySelector('[name="servicio"]').value;
    const consent = form.querySelector('[name="consent"]').checked;

    // Validación
    let ok = true;
    ok = setError('nombre', name.length < 2 ? 'Escribe tu nombre.' : '') && ok;
    ok = setError('servicio', !service ? 'Elige un servicio.' : '') && ok;
    ok = setError('consent', !consent ? 'Debes aceptar la política de datos.' : '') && ok;

    if (!ok) {
      if (feedback) {
        feedback.textContent = 'Revisa los campos marcados para continuar.';
        feedback.className = 'form-feedback is-error show';
      }
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    // Éxito: confirmación en pantalla + fuegos + WhatsApp
    if (feedback) {
      feedback.textContent = '¡Gracias! Te redirigimos a WhatsApp para confirmar tu cita…';
      feedback.className = 'form-feedback is-success show';
    }
    if (submitBtn) submitBtn.disabled = true;

    const wa    = `Hola! Me llamo *${name}* y estoy interesada/o en el servicio de *${service}*. ¿Podemos agendar una cita?`;
    const waURL = `https://wa.me/573017270612?text=${encodeURIComponent(wa)}`;
    launchFireworks();
    setTimeout(() => {
      window.open(waURL, '_blank');
      if (submitBtn) submitBtn.disabled = false;
    }, 400);
  });
}

/* ---- Año dinámico en footer ---- */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---- Filtros servicios ampliados ---- */
const sampTabs  = document.querySelectorAll('.samp-tab');
const sampCards = document.querySelectorAll('.samp-card');

sampTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    sampTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.sfilter;
    sampCards.forEach(card => {
      const show = cat === 'all' || card.dataset.scategory === cat;
      card.style.transition = 'opacity 0.35s, transform 0.35s';
      if (show) {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.display = '';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (card.style.opacity === '0') card.style.display = 'none';
        }, 350);
      }
    });
    // Al filtrar, volver al inicio del carrusel y recalcular controles
    sampTrack?.scrollTo({ left: 0, behavior: 'smooth' });
    setTimeout(updateSampControls, 380);
  });
});

/* ---- Carrusel deslizable de tratamientos (flechas + progreso + arrastre) ---- */
const sampTrack    = document.getElementById('samp-track');
const sampPrev     = document.querySelector('.samp-prev');
const sampNext     = document.querySelector('.samp-next');
const sampProgress = document.getElementById('samp-progress-bar');

function sampStep() {
  const card = [...sampCards].find(c => c.style.display !== 'none');
  return card ? card.getBoundingClientRect().width + 24 : 320;
}

function updateSampControls() {
  if (!sampTrack) return;
  const maxScroll = sampTrack.scrollWidth - sampTrack.clientWidth;
  const x = sampTrack.scrollLeft;
  if (sampPrev) sampPrev.disabled = x <= 2;
  if (sampNext) sampNext.disabled = x >= maxScroll - 2;
  if (sampProgress) {
    const ratio = maxScroll > 0 ? x / maxScroll : 0;
    const barW  = Math.max(15, (sampTrack.clientWidth / sampTrack.scrollWidth) * 100);
    sampProgress.style.width = barW + '%';
    sampProgress.style.marginLeft = (ratio * (100 - barW)) + '%';
  }
}

sampPrev?.addEventListener('click', () => sampTrack?.scrollBy({ left: -sampStep(), behavior: 'smooth' }));
sampNext?.addEventListener('click', () => sampTrack?.scrollBy({ left:  sampStep(), behavior: 'smooth' }));
sampTrack?.addEventListener('scroll', updateSampControls, { passive: true });
window.addEventListener('resize', updateSampControls);

if (sampTrack) {
  // Arrastrar con el mouse en desktop (el táctil usa el scroll nativo)
  let down = false, startX = 0, startScroll = 0, moved = false;
  sampTrack.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    down = true; moved = false;
    startX = e.clientX;
    startScroll = sampTrack.scrollLeft;
    sampTrack.classList.add('dragging');
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    sampTrack.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    sampTrack.classList.remove('dragging');
  });
  // Un arrastre no debe disparar el botón "Agendar" de la tarjeta
  sampTrack.addEventListener('click', (e) => {
    if (moved) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  updateSampControls();
  window.addEventListener('load', updateSampControls);
}

/* ---- Botones agendar de servicios ampliados ---- */
document.querySelectorAll('.btn-samp[data-wa]').forEach(btn => {
  btn.addEventListener('click', () => {
    const svc = btn.dataset.wa;
    const msg = encodeURIComponent(`Hola! Estoy interesada/o en el servicio de *${svc}*. ¿Podrías darme más información?`);
    window.open(`https://wa.me/573017270612?text=${msg}`, '_blank');
  });
});

/* ============================================================
   ✦ Fuegos artificiales al AGENDAR — celebración a pantalla completa
   ============================================================ */
function launchFireworks() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let canvas = document.getElementById('fx-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'fixed', inset: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '10050'
    });
    document.body.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth, H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  // Paleta de la marca (rosa + dorado + destellos)
  const colors = ['#f2b5a0', '#e8a090', '#c56f5c', '#d4b896', '#c9a15f', '#fce8e0', '#ffffff'];
  const particles = [];

  function burst(x, y) {
    const n = 80 + Math.floor(Math.random() * 40); // 80–120 partículas por estallido
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * 7 + 2;              // más energía = radio mayor
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1,
        color: colors[(Math.random() * colors.length) | 0],
        size: Math.random() * 2.6 + 1.4
      });
    }
  }

  // Celebración breve (~2s): festeja sin retrasar el camino a WhatsApp
  const nBursts = 6;
  const gap = 150;
  for (let b = 0; b < nBursts; b++) {
    setTimeout(() => burst(W * (0.12 + Math.random() * 0.76), H * (0.12 + Math.random() * 0.52)), b * gap);
  }
  const endAt = performance.now() + nBursts * gap + 500;

  function tick(now) {
    // Estela: desvanecemos el frame anterior en lugar de borrarlo (fuegos más vivos)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 0.05;        // gravedad
      p.vx *= 0.987;
      p.vy *= 0.987;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.015;     // vida corta: la celebración no estorba
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;  // brillo
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    if (particles.length > 0 || now < endAt) {
      canvas._raf = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }
  cancelAnimationFrame(canvas._raf);
  canvas._raf = requestAnimationFrame(tick);
}

/* Disparadores: botones/enlaces de "Agendar" y envío del formulario */
(function bindFireworks() {
  const triggers = new Set(document.querySelectorAll('.btn-samp'));
  document.querySelectorAll('.btn, .nav-cta').forEach((el) => {
    if ((el.getAttribute('type') || '') === 'submit') return; // el submit lo dispara el evento del formulario
    if (/agendar|whatsapp|enviar/i.test(el.textContent || '')) triggers.add(el);
  });
  triggers.forEach((el) => el.addEventListener('click', launchFireworks));
  // El formulario dispara los fuegos desde su propio handler, solo si es válido.
})();

/* ============================================================
   ✦ CAPA DINÁMICA — GSAP + Lenis (experiencia premium)
   Funciona igual en escritorio y en teléfonos.
   ============================================================ */
(function premiumLayer() {
  const reduce      = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP     = typeof window.gsap  !== 'undefined';
  const hasLenis    = typeof window.Lenis !== 'undefined';
  const preloader   = document.getElementById('preloader');

  /* Preloader solo la primera vez por sesión: en recargas se entra directo
     (el <head> añade .no-preloader al <html> y el CSS lo oculta al instante) */
  const skipPreloader = document.documentElement.classList.contains('no-preloader');
  try { sessionStorage.setItem('yt-preloader', '1'); } catch (e) {}

  document.body.classList.add('is-loading');

  function hidePreloaderSimple() {
    if (!preloader) { document.body.classList.remove('is-loading'); return; }
    preloader.classList.add('done');
    document.body.classList.remove('is-loading');
    setTimeout(() => preloader.remove(), 700);
  }

  /* --- Modo accesible: sin movimiento --- */
  if (reduce) { hidePreloaderSimple(); return; }

  /* ---------------- Lenis (scroll suave) ---------------- */
  let lenis = null;
  if (hasLenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.lenis = lenis;
    if (hasGSAP) {
      lenis.on('scroll', () => ScrollTrigger.update());
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* --- Sin GSAP: solo scroll suave + cierre de preloader --- */
  if (!hasGSAP) {
    if (document.readyState === 'complete') hidePreloaderSimple();
    else window.addEventListener('load', hidePreloaderSimple);
    setTimeout(hidePreloaderSimple, 2500);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ====================================================
     Helper: dividir en palabras conservando <em>/<br>
     ==================================================== */
  function splitWords(el) {
    if (!el || el.dataset.split) return [];
    el.dataset.split = '1';
    const out = [];
    Array.from(el.childNodes).forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (part.trim() === '') { frag.appendChild(document.createTextNode(part)); return; }
          const span = document.createElement('span');
          span.style.display = 'inline-block';
          span.style.willChange = 'transform, opacity';
          span.textContent = part;
          frag.appendChild(span);
          out.push(span);
        });
        el.replaceChild(frag, child);
      } else if (child.nodeName === 'BR') {
        /* conservar salto */
      } else if (child.nodeType === 1) {
        child.style.display = 'inline-block';
        out.push(child);
      }
    });
    return out;
  }

  /* ====================================================
     Intro del HERO
     ==================================================== */
  const heroTitle  = document.querySelector('.hero-title');
  const heroWords  = heroTitle ? splitWords(heroTitle) : [];
  const heroExtras = ['.hero-eyebrow', '.hero-sub', '.hero-actions', '.hero-badge']
                       .map((s) => document.querySelector(s)).filter(Boolean);

  if (heroWords.length) gsap.set(heroWords, { yPercent: 120, opacity: 0 });
  if (heroExtras.length) gsap.set(heroExtras, { y: 28, opacity: 0 });
  gsap.set('.hero-right img', { scale: 1.18 });

  function playHeroIntro() {
    const tl = gsap.timeline();
    tl.to('.hero-right img', { scale: 1, duration: 1.5, ease: 'power3.out' }, 0);
    if (heroWords.length)
      tl.to(heroWords, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.2);
    if (heroExtras.length)
      tl.to(heroExtras, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power2.out' }, 0.5);
    return tl;
  }

  /* ====================================================
     Preloader (timeline) + arranque
     ==================================================== */
  if (lenis) lenis.stop();

  let started = false;
  function start() {
    if (started) return;
    started = true;

    // Ya se vio el preloader en esta sesión: entrar directo al contenido
    if (skipPreloader) {
      if (preloader) preloader.remove();
      document.body.classList.remove('is-loading');
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
      playHeroIntro();
      return;
    }

    const tl = gsap.timeline();
    tl.to('.preloader-bar span', { width: '100%', duration: 0.5, ease: 'power1.inOut' })
      .to('.preloader-inner', { y: -18, opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0.05')
      .to('#preloader', {
        yPercent: -100, duration: 0.6, ease: 'power3.inOut',
        onComplete: () => {
          if (preloader) preloader.remove();
          document.body.classList.remove('is-loading');
          if (lenis) lenis.start();
          ScrollTrigger.refresh();
        }
      }, '-=0.1')
      .add(playHeroIntro(), '-=0.35');
  }
  if (skipPreloader || document.readyState === 'complete') start();
  else window.addEventListener('load', start);
  setTimeout(start, 3000); // red de seguridad

  /* ====================================================
     Reveal de títulos de sección (palabra por palabra)
     ==================================================== */
  gsap.utils.toArray('.section-title').forEach((title) => {
    const words = splitWords(title);
    if (!words.length) return;
    gsap.set(words, { yPercent: 120, opacity: 0 });
    gsap.to(words, {
      yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out',
      scrollTrigger: { trigger: title, start: 'top 86%' }
    });
  });

  /* ====================================================
     Parallax del hero (solo escritorio para no romper el
     encuadre del fondo en móvil)
     ==================================================== */
  gsap.matchMedia().add('(min-width: 1025px)', () => {
    gsap.to('.hero-right img', {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.sobre-decoration', {
      yPercent: 40, ease: 'none',
      scrollTrigger: { trigger: '#sobre-mi', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    /* --- Galería horizontal de servicios: RETIRADA ---
       El track usaba width:max-content, por lo que (scrollWidth - clientWidth)
       daba 0 y las tarjetas se salían de pantalla sin poder desplazarse.
       Ahora los servicios se muestran como rejilla normal (3→2→1), más robusto
       y accesible. */
  });

  /* ====================================================
     Proceso — barra de progreso + pop de los números
     ==================================================== */
  const procesoSteps = document.querySelector('.proceso-steps');
  if (procesoSteps && window.matchMedia('(min-width: 1025px)').matches) {
    const fill = document.createElement('div');
    fill.className = 'proceso-progress';
    procesoSteps.appendChild(fill);
    gsap.fromTo(fill, { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: procesoSteps, start: 'top 72%', end: 'bottom 62%', scrub: true }
    });
  }
  gsap.utils.toArray('.step-num').forEach((num) => {
    gsap.from(num, {
      scale: 0.4, opacity: 0, duration: 0.6, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: num, start: 'top 88%' }
    });
  });

  /* ====================================================
     Barra de progreso de scroll
     ==================================================== */
  const prog = document.getElementById('scroll-progress');
  if (prog) {
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => { prog.style.transform = `scaleX(${self.progress})`; }
    });
  }

  /* ====================================================
     Scrollspy — link activo del navbar
     ==================================================== */
  const navLinkEls = document.querySelectorAll('.nav-links a');
  function setActiveNav(hash) {
    navLinkEls.forEach((a) => a.classList.toggle('nav-active', a.getAttribute('href') === hash));
  }
  document.querySelectorAll('section[id]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 45%', end: 'bottom 45%',
      onToggle: (self) => { if (self.isActive) setActiveNav('#' + sec.id); }
    });
  });

  /* ====================================================
     Comparador Antes / Después (mouse + táctil)
     ==================================================== */
  document.querySelectorAll('.ba-slider[data-ba]').forEach((slider) => {
    const handle = slider.querySelector('.ba-handle');
    let dragging = false;
    const setPos = (clientX) => {
      const r = slider.getBoundingClientRect();
      let pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      slider.style.setProperty('--pos', pct + '%');
      handle && handle.setAttribute('aria-valuenow', Math.round(pct));
    };
    slider.addEventListener('pointerdown', (e) => {
      dragging = true;
      slider.setPointerCapture && slider.setPointerCapture(e.pointerId);
      setPos(e.clientX);
    });
    slider.addEventListener('pointermove', (e) => { if (dragging) setPos(e.clientX); });
    window.addEventListener('pointerup', () => { dragging = false; });
    handle && handle.addEventListener('keydown', (e) => {
      const cur = parseFloat(slider.style.getPropertyValue('--pos')) || 50;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); slider.style.setProperty('--pos', Math.max(2, cur - 4) + '%'); }
      if (e.key === 'ArrowRight') { e.preventDefault(); slider.style.setProperty('--pos', Math.min(98, cur + 4) + '%'); }
    });
  });

  /* ====================================================
     Micro-interacciones SOLO con puntero fino (escritorio)
     En móvil/táctil no aplican (no existe cursor).
     ==================================================== */
  if (finePointer) {
    document.body.classList.add('has-cursor');
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    });
    document.querySelectorAll('a, button, .btn, .ba-handle, .samp-tab, .samp-arrow')
      .forEach((el) => {
        el.addEventListener('mouseenter', () => ring && ring.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => ring && ring.classList.remove('is-hover'));
      });

    /* --- Botones magnéticos --- */
    document.querySelectorAll('.btn-primary, .nav-cta').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', () =>
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }));
    });

    /* --- Tilt 3D + glare en tarjetas --- */
    document.querySelectorAll('.samp-card').forEach((card) => {
      card.classList.add('tilt');
      const glare = document.createElement('span');
      glare.className = 'tilt-glare';
      card.appendChild(glare);
      const MAX = 7;
      // Al ENTRAR: elevar de inmediato para que TODAS reaccionen igual,
      // sin depender de que el ratón se mueva.
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.25s var(--ease-out), box-shadow 0.35s ease';
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(-8px)';
      });
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rxx = (py - 0.5) * -2 * MAX;
        const ryy = (px - 0.5) *  2 * MAX;
        card.style.transition = 'transform 0.08s linear, box-shadow 0.35s ease';
        card.style.transform = `perspective(800px) rotateX(${rxx}deg) rotateY(${ryy}deg) translateY(-8px)`;
        glare.style.setProperty('--gx', px * 100 + '%');
        glare.style.setProperty('--gy', py * 100 + '%');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.45s var(--ease-out), box-shadow 0.45s ease';
        card.style.transform = '';
      });
    });
  }

  /* Recalcular posiciones cuando todo cargó */
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
