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

/**
 * Profile sticky storytelling — pins each chapter's sticky container
 * while scrolling through it, and fills the background keyword from
 * bottom-to-top like ink, using clip-path scrub.
 */
export function animateProfileSticky(section: Element): void {
  if (!section) return;

  if (prefersReducedMotion()) {
    section.querySelectorAll('[data-keyword-fill]').forEach((el) => {
      gsap.set(el, { clipPath: 'inset(0% 0 0 0)' });
    });
    section.querySelectorAll('[data-profile-text]').forEach((el) => {
      gsap.set(el, { opacity: 1, y: 0 });
    });
    return;
  }

  section.querySelectorAll('[data-profile-chapter]').forEach((chapter) => {
    const sticky = chapter.querySelector<HTMLElement>('[data-chapter-sticky]');
    const fill   = chapter.querySelector('[data-keyword-fill]');
    const texts  = chapter.querySelectorAll('[data-profile-text]');

    // ── Pin + keyword ink-fill (scrubbed together) ──────────────
    if (sticky && fill) {
      gsap.set(fill, { clipPath: 'inset(100% 0 0 0)' });

      gsap.timeline({
        scrollTrigger: {
          trigger: sticky,
          start: 'top top',
          end: '+=90vh',
          pin: true,
          pinSpacing: true,
          scrub: 1.8,
          anticipatePin: 1,
        },
      }).to(fill, {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'none',
      });
    }

    // ── Content text entrance (fires once, not scrubbed) ─────────
    texts.forEach((text, i) => {
      gsap.from(text, {
        y: 55,
        opacity: 0,
        rotation: (i % 2 === 0 ? -1.5 : 1),
        duration: 0.75,
        ease: 'power3.out',
        delay: i * 0.08,
        scrollTrigger: {
          trigger: sticky ?? chapter,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      });
    });
  });
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
