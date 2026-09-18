import React, { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// El volumen en alambre del cierre. En el sistema original es un cubo en
// perspectiva dibujado con línea discontinua de 1px; acá es el mismo objeto
// pero en tres dimensiones de verdad: dos cajas desfasadas que giran solas y
// se inclinan hacia el puntero.
//
// Va en canvas y no en three.js a propósito. Lo único que hace falta es
// proyectar doce aristas y dibujarlas con el mismo trazo de 1px discontinuo que
// usa el resto del diseño; un motor 3D traería su propio antialias y su propio
// grosor de línea, que es justo lo que este sistema no tiene.
// ─────────────────────────────────────────────────────────────────────────────

type Punto = [number, number, number];

// Los ocho vértices de un cubo centrado en el origen.
const VERTICES: Punto[] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

const ARISTAS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

// Dos cajas desfasadas, como en el cierre del sistema original.
const CAJAS = [
  { escala: 1, desfase: [-0.28, -0.24, 0] as Punto },
  { escala: 0.92, desfase: [0.3, 0.26, 0.1] as Punto },
];

interface Props {
  className?: string;
  /** Lado del lienzo, en píxeles de CSS. */
  size?: number;
}

const Volumen: React.FC<Props> = ({ className, size = 340 }) => {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = lienzo.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(size * dpr);
    cv.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // El puntero inclina el objeto; sin puntero vuelve solo a su descanso.
    const objetivo = { x: 0, y: 0 };
    const actual = { x: 0, y: 0 };
    let pedido = 0;
    let visible = true;

    const seguir = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // Se mide contra la ventana entera: el cubo reacciona aunque el puntero
      // esté sobre el texto de al lado, que es donde la gente lee.
      objetivo.x = ((e.clientY - cy) / window.innerHeight) * 1.1;
      objetivo.y = ((e.clientX - cx) / window.innerWidth) * 1.1;
    };

    const proyectar = ([x, y, z]: Punto, gx: number, gy: number) => {
      // Giro en Y y después en X.
      const cy1 = Math.cos(gy);
      const sy1 = Math.sin(gy);
      const x1 = x * cy1 + z * sy1;
      const z1 = -x * sy1 + z * cy1;

      const cx1 = Math.cos(gx);
      const sx1 = Math.sin(gx);
      const y2 = y * cx1 - z1 * sx1;
      const z2 = y * sx1 + z1 * cx1;

      // Perspectiva de un punto de fuga.
      const d = 4.6;
      const k = (d / (d + z2)) * (size * 0.24);
      return [size / 2 + x1 * k, size / 2 + y2 * k];
    };

    const dibujar = (t: number) => {
      pedido = window.requestAnimationFrame(dibujar);
      if (!visible) return;

      actual.x += (objetivo.x - actual.x) * 0.06;
      actual.y += (objetivo.y - actual.y) * 0.06;

      const giro = quieto ? 0.6 : t / 7000;
      ctx.clearRect(0, 0, size, size);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'currentColor';
      ctx.strokeStyle = getComputedStyle(cv).color;

      CAJAS.forEach((caja, i) => {
        const gx = actual.x + (i ? 0.14 : 0) + 0.42;
        const gy = giro + actual.y + (i ? 0.5 : 0);
        ctx.beginPath();
        ARISTAS.forEach(([a, b]) => {
          const pa = proyectar(
            VERTICES[a].map((v, j) => v * caja.escala + caja.desfase[j]) as Punto,
            gx,
            gy,
          );
          const pb = proyectar(
            VERTICES[b].map((v, j) => v * caja.escala + caja.desfase[j]) as Punto,
            gx,
            gy,
          );
          ctx.moveTo(pa[0], pa[1]);
          ctx.lineTo(pb[0], pb[1]);
        });
        ctx.stroke();
      });
    };

    const vista = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    vista.observe(cv);

    window.addEventListener('pointermove', seguir);
    pedido = window.requestAnimationFrame(dibujar);

    return () => {
      window.removeEventListener('pointermove', seguir);
      if (pedido) window.cancelAnimationFrame(pedido);
      vista.disconnect();
    };
  }, [size]);

  return (
    <canvas
      className={className}
      ref={lienzo}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
};

export default Volumen;
