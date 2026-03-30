import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animateHeroEntry(
  titleEl: Element,
  subtitleEl: Element,
  delay = 0.15
): gsap.core.Timeline {
  const tl = gsap.timeline({ delay });

  if (prefersReducedMotion()) {
    gsap.set([titleEl, subtitleEl], { opacity: 1, clearProps: 'all' });
    return tl;
  }

  // Manually split title into per-character spans
  const text = titleEl.textContent ?? '';
  titleEl.innerHTML = text
    .split('')
    .map((ch) =>
      ch === ' '
        ? ' '
        : `<span style="display:inline-block">${ch}</span>`
    )
    .join('');

  const chars = titleEl.querySelectorAll('span');

  // Make title container visible; chars start hidden
  gsap.set(titleEl, { opacity: 1 });
  gsap.set(chars, {
    opacity: 0,
    x: () => gsap.utils.random(-120, 120),
    y: () => gsap.utils.random(-80, 80),
    rotation: () => gsap.utils.random(-45, 45),
    scale: 0.3,
  });
  gsap.set(subtitleEl, { opacity: 0, x: -60, skewX: 10 });

  tl.to(chars, {
    opacity: 1,
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    duration: 0.7,
    stagger: { amount: 0.4, from: 'random' },
    ease: 'back.out(1.7)',
  }).to(
    subtitleEl,
    {
      opacity: 1,
      x: 0,
      skewX: 0,
      duration: 0.5,
      ease: 'power3.out',
    },
    '-=0.2'
  );

  return tl;
}

export function animateSplats(
  container: Element | null,
  delay = 0
): gsap.core.Timeline {
  const tl = gsap.timeline({ delay });

  if (!container) return tl;

  if (prefersReducedMotion()) {
    gsap.set(container.querySelectorAll('[data-splat]'), {
      opacity: 1,
      scale: 1,
      clearProps: 'transform',
    });
    return tl;
  }

  const blobs = container.querySelectorAll('[data-splat]');

  gsap.set(blobs, {
    scale: 0,
    opacity: 0,
    transformOrigin: 'center center',
  });

  tl.to(blobs, {
    scale: 1,
    opacity: 1,
    duration: 0.6,
    stagger: { amount: 0.8, from: 'random' },
    ease: 'back.out(1.7)',
  });

  return tl;
}

export function animateWorksCards(container: Element): void {
  const cards = container.querySelectorAll('[data-work-card]');
  if (!cards.length) return;

  if (prefersReducedMotion()) {
    gsap.set(cards, { opacity: 1, clearProps: 'all' });
    return;
  }

  cards.forEach((card, i) => {
    // Animate FROM a scattered/falling state TO the CSS-defined final state
    gsap.from(card, {
      y: 180,
      opacity: 0,
      scale: 0.8,
      rotation: (i % 2 === 0 ? -1 : 1) * 22,
      duration: 0.9,
      ease: 'back.out(1.5)',
      delay: i * 0.12,
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });
}
