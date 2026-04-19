// Client-only motion bootstrap. Runs after DOMContentLoaded.
// - Lenis for smooth scroll (disabled under prefers-reduced-motion).
// - Motion One `inView` drives the `.reveal → .is-in` CSS transition.
// Keep this file small: it ships to every page.

import Lenis from 'lenis';
import { inView } from 'motion';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced) {
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
  });
  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Hash-link smooth scroll via Lenis.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const id = a.getAttribute('href')!.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { offset: -64 });
    history.pushState(null, '', `#${id}`);
  });
}

// Reveal-on-view. Under reduced motion, just commit the final state synchronously.
const reveals = document.querySelectorAll<HTMLElement>('.reveal');
if (reduced) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  reveals.forEach((el) => {
    inView(el, () => {
      el.classList.add('is-in'); // CSS transition in global.css handles the tween.
    }, { amount: 0.15 });
  });
}
