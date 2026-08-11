document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════
     LOADER — curtain reveal, tiempo mínimo
  ══════════════════════════════════════ */
  const loader = document.getElementById('loader');
  const MIN_LOADER_MS = 2200;
  const loaderStart = performance.now();

  const hideLoader = () => {
    const elapsed = performance.now() - loaderStart;
    const wait = Math.max(0, MIN_LOADER_MS - elapsed);
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      setTimeout(() => { loader.style.display = 'none'; }, 1200);
    }, wait);
  };
  document.body.style.overflow = 'hidden';
  window.addEventListener('load', hideLoader);
  // Fallback por si 'load' tarda demasiado (recursos externos lentos)
  setTimeout(hideLoader, 5000);

  /* ══════════════════════════════════════
     FOOTER YEAR
  ══════════════════════════════════════ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ══════════════════════════════════════
     NAVBAR SCROLL STATE
  ══════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  const setNavbarState = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  setNavbarState();
  window.addEventListener('scroll', setNavbarState, { passive: true });

  /* ══════════════════════════════════════
     MOBILE MENU
  ══════════════════════════════════════ */
  const hamburger = document.getElementById('hamburger');
  const mobMenu = document.getElementById('mob-menu');

  const closeMobMenu = () => {
    mobMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = mobMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  mobMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobMenu));

  /* ══════════════════════════════════════
     REVEAL ON SCROLL
  ══════════════════════════════════════ */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ══════════════════════════════════════
     STATS COUNTER
  ══════════════════════════════════════ */
  const statEls = document.querySelectorAll('.stat-num');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString('es-MX') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => statsObserver.observe(el));

  /* ══════════════════════════════════════
     MARQUEE CONTENT
  ══════════════════════════════════════ */
  const marqueeInner = document.getElementById('marquee');
  if (marqueeInner) {
    const items = [
      'Ansiedad y Estrés',
      'Depresión',
      'Autoestima',
      'Terapia de Pareja',
      'Pérdidas y Rupturas',
      'Confidencialidad Total',
      'Psicólogo Colegiado'
    ];
    const buildGroup = () => {
      const span = document.createElement('span');
      items.forEach(text => {
        const item = document.createElement('span');
        item.innerHTML = `<i class="fa-solid fa-star"></i> ${text}`;
        span.appendChild(item);
      });
      return span;
    };
    marqueeInner.appendChild(buildGroup());
    marqueeInner.appendChild(buildGroup());
  }

  /* ══════════════════════════════════════
     HERO KICKER — efecto máquina de escribir
  ══════════════════════════════════════ */
  const kickerText = document.getElementById('kicker-text');
  if (kickerText && !prefersReducedMotion) {
    const phrases = ['Terapia Individual', 'Terapia de Pareja', 'Terapia Grupal', 'Acompañamiento a Adolescentes'];
    let phraseIdx = 0, charIdx = 0, deleting = false;

    const typeTick = () => {
      const current = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        kickerText.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(typeTick, 1600);
          return;
        }
      } else {
        charIdx--;
        kickerText.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      setTimeout(typeTick, deleting ? 35 : 65);
    };
    setTimeout(typeTick, 2600);
  }

  /* ══════════════════════════════════════
     PARTICLE CANVASES — hero + cta-banner
  ══════════════════════════════════════ */
  const initParticleCanvas = (canvas, containerEl, opts = {}) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const density = opts.density || 42000;
    const color = opts.color || '166,216,211';
    let particles = [];
    let width, height, dpr;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = containerEl.offsetWidth;
      height = containerEl.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      const count = Math.max(opts.min || 18, Math.round((width * height) / density));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.6,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.5 + 0.15
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    if (!prefersReducedMotion) requestAnimationFrame(draw);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); initParticles(); }, 200);
    });
  };

  initParticleCanvas(document.getElementById('hero-canvas'), document.getElementById('hero'), { color: '166,216,211', density: 42000 });
  initParticleCanvas(document.getElementById('cta-particles'), document.getElementById('cta-banner'), { color: '245,232,210', density: 30000, min: 14 });

  /* ══════════════════════════════════════
     PARALLAX FIXED BACKGROUNDS
  ══════════════════════════════════════ */
  if (!prefersReducedMotion) {
    const parallaxTargets = [
      { el: document.getElementById('hero-bg'), section: document.getElementById('hero'), factor: 0.18 },
      { el: document.getElementById('cta-bg'), section: document.getElementById('cta-banner'), factor: 0.22 },
      { el: document.getElementById('stats-bg'), section: document.getElementById('stats'), factor: 0.16 }
    ].filter(t => t.el && t.section);

    let ticking = false;
    const updateParallax = () => {
      parallaxTargets.forEach(({ el, section, factor }) => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const offset = (rect.top) * factor;
          el.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  /* ══════════════════════════════════════
     SMOOTH ANCHOR SCROLL (offset for fixed navbar)
  ══════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ══════════════════════════════════════
     CONTACT FORM → ABRE WHATSAPP CON MENSAJE
  ══════════════════════════════════════ */
  const WHATSAPP_NUMBER = '5215532643500';

  const form = document.getElementById('wa-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('f-name');
      const interest = document.getElementById('f-interest');
      const msg = document.getElementById('f-msg');
      let valid = true;

      [name, msg].forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#e05252';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      const waMessage =
        `Hola, soy ${name.value.trim()}.\n` +
        `Motivo de contacto: ${interest.value}.\n` +
        `${msg.value.trim()}`;

      const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
      window.open(waLink, '_blank', 'noopener');

      form.innerHTML = `
        <div class="form-success">
          <i class="fa-brands fa-whatsapp"></i>
          <h4>¡Te estamos redirigiendo a WhatsApp!</h4>
          <p>Gracias, ${name.value.trim().split(' ')[0]}. Si no se abrió automáticamente, escríbenos directamente por WhatsApp.</p>
        </div>
      `;
    });
  }

});
