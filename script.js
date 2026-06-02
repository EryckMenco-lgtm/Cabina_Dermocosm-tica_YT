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

/* ---- Filtros de portafolio ---- */
const filterBtns = document.querySelectorAll('.filter-btn');
const portoItems = document.querySelectorAll('.porto-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.dataset.filter;
    portoItems.forEach(item => {
      const show = cat === 'all' || item.dataset.category === cat;
      item.style.transition = 'opacity 0.35s, transform 0.35s';
      if (show) {
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
        item.style.display = '';
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (item.style.opacity === '0') item.style.display = 'none';
        }, 350);
      }
    });
  });
});

/* ---- Lightbox ---- */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = lightbox?.querySelector('img');
const lightboxClose = lightbox?.querySelector('.lightbox-close');

document.querySelectorAll('.porto-item[data-src]').forEach(item => {
  item.addEventListener('click', () => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = item.dataset.src;
    lightboxImg.alt = item.dataset.label || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    window.lenis?.stop();
  });
});

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

function closeLightbox() {
  lightbox?.classList.remove('active');
  document.body.style.overflow = '';
  window.lenis?.start();
}

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

/* ---- Formulario de contacto ---- */
const form = document.getElementById('contacto-form');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name    = form.querySelector('[name="nombre"]').value.trim();
  const service = form.querySelector('[name="servicio"]').value;
  const phone   = form.querySelector('[name="telefono"]').value.trim();
  const message = form.querySelector('[name="mensaje"]').value.trim();

  const wa    = `Hola! Me llamo *${name}* y estoy interesada/o en el servicio de *${service}*.\n\nMi teléfono: ${phone}\n\nMensaje: ${message}`;
  const waURL = `https://wa.me/573017270612?text=${encodeURIComponent(wa)}`;
  window.open(waURL, '_blank');
});

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
  });
});

/* ---- Botones agendar de servicios ampliados ---- */
document.querySelectorAll('.btn-samp[data-wa]').forEach(btn => {
  btn.addEventListener('click', () => {
    const svc = btn.dataset.wa;
    const msg = encodeURIComponent(`Hola! Estoy interesada/o en el servicio de *${svc}*. ¿Podrías darme más información?`);
    window.open(`https://wa.me/573017270612?text=${msg}`, '_blank');
  });
});

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
    const tl = gsap.timeline();
    tl.to('.preloader-bar span', { width: '100%', duration: 1.0, ease: 'power1.inOut' })
      .to('.preloader-inner', { y: -18, opacity: 0, duration: 0.45, ease: 'power2.in' }, '+=0.05')
      .to('#preloader', {
        yPercent: -100, duration: 0.8, ease: 'power3.inOut',
        onComplete: () => {
          if (preloader) preloader.remove();
          document.body.classList.remove('is-loading');
          if (lenis) lenis.start();
          ScrollTrigger.refresh();
        }
      }, '-=0.1')
      .add(playHeroIntro(), '-=0.35');
  }
  if (document.readyState === 'complete') start();
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

    /* --- Galería horizontal de "Servicios especializados" --- */
    const servSection = document.querySelector('#servicios');
    const grid = servSection ? servSection.querySelector('.servicios-grid') : null;
    if (servSection && grid) {
      grid.classList.add('is-horizontal');
      const distance = () => Math.max(0, grid.scrollWidth - grid.clientWidth);
      const tween = gsap.to(grid, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: servSection,
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
      return () => { grid.classList.remove('is-horizontal'); gsap.set(grid, { x: 0 }); tween.scrollTrigger?.kill(); tween.kill(); };
    }
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
    document.querySelectorAll('a, button, .porto-item, .btn, .ba-handle, .filter-btn, .samp-tab')
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
    document.querySelectorAll('.servicio-card, .samp-card').forEach((card) => {
      card.classList.add('tilt');
      const glare = document.createElement('span');
      glare.className = 'tilt-glare';
      card.appendChild(glare);
      const MAX = 7;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rxx = (py - 0.5) * -2 * MAX;
        const ryy = (px - 0.5) *  2 * MAX;
        card.style.transform = `perspective(800px) rotateX(${rxx}deg) rotateY(${ryy}deg) translateY(-6px)`;
        glare.style.setProperty('--gx', px * 100 + '%');
        glare.style.setProperty('--gy', py * 100 + '%');
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* Recalcular posiciones cuando todo cargó */
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
