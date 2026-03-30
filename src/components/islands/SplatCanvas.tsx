import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animateSplats } from '../../utils/animations';
import styles from './SplatCanvas.module.css';

type BlobConfig = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotation: number;
  color: string;
  opacity: number;
  depth: number;
  filterId: string;
};

// Fixed seed data — no Math.random() at render time to avoid hydration mismatches.
// Viewport units in percentage (SVG viewBox 0 0 100 100).
const BLOB_CONFIGS: BlobConfig[] = [
  { cx: 12, cy: 18, rx: 14, ry: 9,  rotation: -20, color: '--color-primary',   opacity: 0.75, depth: 1.2, filterId: 'inkA' },
  { cx: 75, cy: 8,  rx: 18, ry: 11, rotation: 15,  color: '--color-secondary', opacity: 0.70, depth: 0.8, filterId: 'inkB' },
  { cx: 90, cy: 35, rx: 10, ry: 14, rotation: 40,  color: '--color-accent',    opacity: 0.65, depth: 1.4, filterId: 'inkC' },
  { cx: 50, cy: 12, rx: 16, ry: 8,  rotation: -5,  color: '--color-secondary', opacity: 0.72, depth: 0.6, filterId: 'inkA' },
  { cx: 28, cy: 55, rx: 12, ry: 16, rotation: 25,  color: '--color-primary',   opacity: 0.80, depth: 1.0, filterId: 'inkB' },
  { cx: 82, cy: 60, rx: 15, ry: 10, rotation: -30, color: '--color-accent',    opacity: 0.60, depth: 1.3, filterId: 'inkC' },
  { cx: 62, cy: 78, rx: 13, ry: 18, rotation: 10,  color: '--color-primary',   opacity: 0.78, depth: 0.9, filterId: 'inkA' },
  { cx: 8,  cy: 72, rx: 11, ry: 9,  rotation: -45, color: '--color-secondary', opacity: 0.68, depth: 1.1, filterId: 'inkB' },
  { cx: 40, cy: 88, rx: 17, ry: 11, rotation: 20,  color: '--color-primary',   opacity: 0.82, depth: 0.7, filterId: 'inkC' },
  { cx: 93, cy: 82, rx: 9,  ry: 13, rotation: -15, color: '--color-secondary', opacity: 0.74, depth: 1.5, filterId: 'inkA' },
  { cx: 55, cy: 42, rx: 14, ry: 10, rotation: 35,  color: '--color-accent',    opacity: 0.62, depth: 0.5, filterId: 'inkB' },
  { cx: 18, cy: 38, rx: 10, ry: 15, rotation: -10, color: '--color-accent',    opacity: 0.70, depth: 1.2, filterId: 'inkC' },
  { cx: 70, cy: 30, rx: 16, ry: 12, rotation: 5,   color: '--color-primary',   opacity: 0.76, depth: 0.8, filterId: 'inkA' },
  { cx: 35, cy: 22, rx: 12, ry: 8,  rotation: -25, color: '--color-secondary', opacity: 0.66, depth: 1.0, filterId: 'inkB' },
];

export default function SplatCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Splat entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      animateSplats(containerRef.current!);
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Mouse parallax with per-blob depth
  useEffect(() => {
    const blobs = containerRef.current?.querySelectorAll<SVGGElement>('[data-splat]');
    if (!blobs || blobs.length === 0) return;

    type QuickToEntry = { x: (val: number) => void; y: (val: number) => void; depth: number };
    const quickTos: QuickToEntry[] = Array.from(blobs).map((el, i) => ({
      x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power1.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power1.out' }),
      depth: BLOB_CONFIGS[i]?.depth ?? 1,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      const xFactor = (e.clientX / window.innerWidth - 0.5) * 22;
      const yFactor = (e.clientY / window.innerHeight - 0.5) * 22;
      quickTos.forEach((qt) => {
        qt.x(xFactor * qt.depth);
        qt.y(yFactor * qt.depth);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className={styles.splatContainer}>
      <svg
        className={styles.inkSvg}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="inkA" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves="3" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="28" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="inkB" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="4" seed="11" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="inkC" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="turbulence" baseFrequency="0.025" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="34" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {BLOB_CONFIGS.map((b, i) => (
          <g
            key={i}
            data-splat={i}
            data-depth={b.depth}
            className={styles.inkBlob}
          >
            <ellipse
              cx={b.cx}
              cy={b.cy}
              rx={b.rx}
              ry={b.ry}
              transform={`rotate(${b.rotation} ${b.cx} ${b.cy})`}
              fill={`var(${b.color})`}
              opacity={b.opacity}
              filter={`url(#${b.filterId})`}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
