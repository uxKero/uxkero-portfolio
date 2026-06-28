import React, { useEffect, useRef } from 'react';

interface ParticleTextProps {
  /** Text to render as particles. Ignored when `draw` is provided. */
  text?: string;
  /** Custom shape to sample instead of text (e.g. a frame outline). */
  draw?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  /** Sampling step — smaller = denser particles. */
  gap?: number;
  /** Particle dot size in px. */
  dot?: number;
  /** Logical canvas size (CSS px). */
  width?: number;
  height?: number;
  /** Particle color (any CSS color). */
  color?: string;
  /** Font size in px for the rendered text. */
  fontSize?: number;
  /** Font weight. */
  fontWeight?: number;
  /** Enable pointer repulsion (default true). */
  interactive?: boolean;
  /** 'assemble' = particles fly into shape; 'disperse' = scatter + fade out. */
  mode?: 'assemble' | 'disperse';
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  ox: number; // outward unit x (for disperse)
  oy: number;
}

/**
 * ParticleText — renders text onto an offscreen pass, samples its pixels, and
 * turns each into a fine particle. On `assemble` the particles spring into the
 * letterforms (and are repelled by the pointer); on `disperse` they scatter
 * outward and fade — giving a build-in / break-out entrance & exit.
 */
const ParticleText: React.FC<ParticleTextProps> = ({
  text = 'ALAN PONCE',
  draw,
  gap = 2,
  dot = 1.3,
  width = 340,
  height = 84,
  color = '#fafafa',
  fontSize = 42,
  fontWeight = 600,
  interactive = true,
  mode = 'assemble',
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    const cx = width / 2;
    const cy = height / 2;

    // 1) Draw the source (custom shape or text) to sample its pixels.
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    if (draw) {
      draw(ctx, width, height);
    } else {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${fontWeight} ${fontSize}px Geist, system-ui, sans-serif`;
      ctx.fillText(text, cx, cy);
    }
    const sample = ctx.getImageData(0, 0, width, height).data;
    ctx.clearRect(0, 0, width, height);

    // 2) Build fine particles from filled pixels.
    const particles: Particle[] = [];
    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        if (sample[(y * width + x) * 4 + 3] > 128) {
          const dx = x - cx;
          const dy = y - cy;
          const len = Math.hypot(dx, dy) || 1;
          particles.push({
            x: cx + (Math.random() - 0.5) * width * 1.2,
            y: cy + (Math.random() - 0.5) * height * 1.2,
            tx: x,
            ty: y,
            vx: 0,
            vy: 0,
            ox: dx / len,
            oy: dy / len,
          });
        }
      }
    }

    // 3) Pointer tracking for repulsion (only while assembled).
    const pointer = { x: -9999, y: -9999 };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * width;
      pointer.y = ((e.clientY - rect.top) / rect.height) * height;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    if (interactive) {
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('mouseleave', onLeave);
    }

    // 4) Animate.
    let raf = 0;
    let alpha = 0; // global fade-in
    const repelRadius = 34;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const dispersing = modeRef.current === 'disperse';
      alpha += ((dispersing ? 0 : 1) - alpha) * (dispersing ? 0.12 : 0.16);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = color;

      for (const p of particles) {
        if (dispersing) {
          p.vx += p.ox * 0.9 + (Math.random() - 0.5) * 0.4;
          p.vy += p.oy * 0.9 + (Math.random() - 0.5) * 0.4;
        } else {
          p.vx += (p.tx - p.x) * 0.025;
          p.vy += (p.ty - p.y) * 0.025;
          if (interactive) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < repelRadius) {
              const force = (repelRadius - dist) / repelRadius;
              p.vx += (dx / (dist || 1)) * force * 3.5;
              p.vy += (dy / (dist || 1)) * force * 3.5;
            }
          }
        }
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillRect(p.x, p.y, dot, dot);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [text, draw, gap, dot, width, height, color, fontSize, fontWeight, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width, height, display: 'block' }}
      aria-label={text}
      role="img"
    />
  );
};

export default ParticleText;
