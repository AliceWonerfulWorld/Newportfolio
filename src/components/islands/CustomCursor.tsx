import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './CustomCursor.module.css';

/**
 * カスタムカーソル Island
 *
 * - 小さな neon ドット（即時追従）+ 大きなトレイリングリング の2層構造
 * - a/button ホバー時に ring が elastic でプニッと膨らみ dot が消える
 * - クリック時にリングがバースト → spring back
 * - 移動方向に ring を伸ばす（速度ベースの stretch）
 * - prefers-reduced-motion 対応：静的な正方形カーソルにフォールバック
 *
 * 使用する側: <CustomCursor client:only="react" transition:persist />
 */
export default function CustomCursor() {
  const ringRef   = useRef<HTMLDivElement>(null);
  const dotRef    = useRef<HTMLDivElement>(null);
  const staticRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring   = ringRef.current!;
    const dot    = dotRef.current!;
    const staticEl = staticRef.current!;

    // ── Reduced-motion: シンプルな静的カーソルのみ ──────────────
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      gsap.set([ring, dot], { display: 'none' });
      gsap.set(staticEl, { xPercent: -50, yPercent: -50 });

      const onMoveReduced = (e: MouseEvent) => {
        gsap.set(staticEl, { x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', onMoveReduced, { passive: true });
      return () => window.removeEventListener('mousemove', onMoveReduced);
    }

    // ── フル GSAP アニメーション ─────────────────────────────────
    gsap.set(staticEl, { display: 'none' });

    // 中央揃え（top:0, left:0 起点から xPercent/yPercent で補正）
    gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });

    // quickTo: 毎 mousemove で新規 tween を作らない高性能な方法
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power2.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power2.out' });
    const dotX  = gsap.quickTo(dot,  'x', { duration: 0.1, ease: 'none' });
    const dotY  = gsap.quickTo(dot,  'y', { duration: 0.1, ease: 'none' });

    // 速度トラッキング（方向ストレッチ用）
    let prevX = 0;
    let prevY = 0;

    // ── mousemove ───────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const velX = e.clientX - prevX;
      const velY = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      // 速度に応じて ring を進行方向に伸ばす
      const speed   = Math.sqrt(velX * velX + velY * velY);
      const stretch = Math.min(speed * 0.06, 0.5);
      const angle   = Math.atan2(velY, velX) * (180 / Math.PI);

      gsap.to(ring, {
        rotation: angle,
        scaleX:   1 + stretch,
        scaleY:   Math.max(0.5, 1 - stretch * 0.5),
        duration: 0.15,
        ease:     'power2.out',
        overwrite: 'auto',
      });
    };

    // ── ホバー（イベント委譲） ────────────────────────────────────
    // closest() を使うことで動的に追加された a/button も自動カバー
    const onMouseOver = (e: MouseEvent) => {
      if (!(e.target as Element).closest('a, button')) return;
      gsap.to(ring, {
        scale:       1.8,
        borderColor: 'var(--color-secondary)',
        duration:    0.5,
        ease:        'elastic.out(1, 0.3)',
        overwrite:   'auto',
      });
      gsap.to(dot, {
        scale:    0,
        duration: 0.25,
        ease:     'power2.out',
        overwrite: 'auto',
      });
    };

    const onMouseOut = (e: MouseEvent) => {
      if (!(e.target as Element).closest('a, button')) return;
      gsap.to(ring, {
        scale:       1,
        borderColor: 'var(--color-primary)',
        duration:    0.5,
        ease:        'elastic.out(1, 0.3)',
        overwrite:   'auto',
      });
      gsap.to(dot, {
        scale:    1,
        duration: 0.3,
        ease:     'power2.out',
        overwrite: 'auto',
      });
    };

    // ── クリックバースト ─────────────────────────────────────────
    const onClick = () => {
      gsap.timeline()
        .to(ring, {
          scale:    2,
          opacity:  0,
          duration: 0.25,
          ease:     'power2.out',
        })
        .to(ring, {
          scale:    1,
          opacity:  1,
          duration: 0.6,
          ease:     'elastic.out(1, 0.3)',
        });
    };

    // ── ウィンドウ出入り ─────────────────────────────────────────
    const onDocLeave = () =>
      gsap.to([ring, dot], { opacity: 0, duration: 0.2 });
    const onDocEnter = () =>
      gsap.to([ring, dot], { opacity: 1, duration: 0.2 });

    // ── イベント登録 ─────────────────────────────────────────────
    window.addEventListener('mousemove',  onMouseMove,  { passive: true });
    window.addEventListener('mouseover',  onMouseOver);
    window.addEventListener('mouseout',   onMouseOut);
    window.addEventListener('click',      onClick);
    document.addEventListener('mouseleave', onDocLeave);
    document.addEventListener('mouseenter', onDocEnter);

    // ── クリーンアップ ───────────────────────────────────────────
    // transition:persist により full unmount は一度のみだが、
    // dev HMR リロード時に確実にクリーンアップする
    return () => {
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseover',  onMouseOver);
      window.removeEventListener('mouseout',   onMouseOut);
      window.removeEventListener('click',      onClick);
      document.removeEventListener('mouseleave', onDocLeave);
      document.removeEventListener('mouseenter', onDocEnter);
      gsap.killTweensOf([ring, dot]);
    };
  }, []);

  return (
    <div className={styles.cursorRoot} aria-hidden="true">
      <div ref={ringRef}   className={styles.inkRing}     />
      <div ref={dotRef}    className={styles.neonDot}     />
      <div ref={staticRef} className={styles.staticCursor} />
    </div>
  );
}
