/**
 * Glitch Grow — main.js
 * Intersection Observer reveals, counter animation, terminal typing, mobile menu
 */

(function () {
  'use strict';

  // ── Intersection Observer for .reveal elements ──
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ── Animated counters ──
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.counter').forEach((el) => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ── Terminal typing effect ──
  const terminalObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startTerminalAnimation();
          terminalObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const terminal = document.getElementById('terminal');
  if (terminal) terminalObserver.observe(terminal);

  function startTerminalAnimation() {
    const lines = document.querySelectorAll('.terminal-line');
    lines.forEach((line) => {
      const delay = parseInt(line.getAttribute('data-delay'), 10) || 0;
      setTimeout(() => line.classList.add('typed'), delay);
    });
  }

  // ── Nav scroll effect ──
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // ── Mobile menu toggle ──
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      mobileMenu.classList.toggle('hidden');
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // ── Contact form ──
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      const btn = form.querySelector('button');
      const originalText = btn.textContent;

      // Simple client-side feedback; wire up backend later
      btn.textContent = 'Sent!';
      btn.disabled = true;
      form.classList.add('form-success');

      // Could POST to /api/leads here
      console.log('[glitch-grow] Demo request:', email);

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        form.reset();
        form.classList.remove('form-success');
      }, 3000);
    });
  }
})();
