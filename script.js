
/* ============================================================
   script.js — Cabina Dermocosmética YT
   ============================================================ */
   
'use strict'; 
/* ---- Navbar scroll ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});
 
/* ---- Hamburger menu ---- */
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
const navOverlay = document.createElement('div');
 
// Crear overlay de fondo para cerrar al tocar afuera
navOverlay.classList.add('nav-overlay');
document.body.appendChild(navOverlay);
 
function openMenu() {
  hamburger.classList.add('active');
  navLinks.classList.add('open');
  navOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
 
function closeMenu() {
  hamburger.classList.remove('active');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}
 
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
 
/* ---- Smooth scroll para links internos ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
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