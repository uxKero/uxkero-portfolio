import React, { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// El campo tramado del escritorio: la grilla de 5px de siempre y las manchas de
// medio tono que el sistema usa de fondo.
//
// La primera versión las dibujaba con un radio y quedaban discos: la mancha del
// original no es un disco. Mirando la captura de cerca son cuatro cosas:
//
// 1. El contorno es de nube, no de compás. Sale de ruido con el dominio
//    deformado, igual que los cúmulos del hero, recortado contra una caída
//    radial ancha.
// 2. La caída es larguísima. Del centro macizo al cielo hay decenas de pasos
//    de punto, no tres; por eso se lee como tinta que se va acabando.
// 3. El halo pierde puntos. Cerca del borde faltan cada vez más, y los que
//    quedan no caen clavados en la grilla: tiemblan.
// 4. Hay puntos sueltos lejos de la mancha, salpicados, que es lo que le saca
//    el aire de degradado.
//
// Es estático: se dibuja una vez y se rehace solo al cambiar de tamaño. No hay
// nada que animar, y un artefacto impreso no se mueve.
// ─────────────────────────────────────────────────────────────────────────────

const PASO = 5;
const ROSA_PUNTO = '#e5738f';
const TINTA = '#1e1e1e';

const suave = (t: number) => t * t * (3 - 2 * t);
const limitar = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);

/** Azar con semilla: la misma trama en cada visita, no ruido por recarga. */
const azarCon = (s: number) => () => {
  s = (s * 1664525 + 1013904223) | 0;
  return ((s >>> 8) & 0xffffff) / 0xffffff;
};

/** Ruido de valor con interpolación suave. */
const hacerRuido = (semilla: number) => {
  const azar = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + semilla * 13.77) * 43758.5453;
    return n - Math.floor(n);
  };
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = suave(x - xi);
    const yf = suave(y - yi);
    const a = azar(xi, yi);
    const b = azar(xi + 1, yi);
    const c = azar(xi, yi + 1);
    const d = azar(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
};

/** fBm con el dominio deformado: es lo que da el borde enrollado. */
const hacerRelieve = (semilla: number) => {
  const ruido = hacerRuido(semilla);
  const fbm = (x: number, y: number) => {
    let suma = 0;
    let amp = 0.5;
    let frec = 1;
    for (let o = 0; o < 4; o++) {
      suma += amp * ruido(x * frec, y * frec);
      frec *= 2.03;
      amp *= 0.5;
    }
    return suma / 0.9375;
  };
  return (x: number, y: number) => {
    const qx = fbm(x, y);
    const qy = fbm(x + 4.7, y + 2.1);
    return fbm(x + 2.6 * qx, y + 2.6 * qy);
  };
};

// Las manchas, en proporción del lienzo. El radio es el de la caída completa,
// no el del lleno: el centro macizo ocupa apenas su tercio interior.
const MANCHAS = [
  { x: 0.72, y: 0.44, r: 0.3, semilla: 7 },
  { x: 0.08, y: 0.66, r: 0.23, semilla: 19 },
  { x: 0.93, y: 0.86, r: 0.19, semilla: 31 },
  { x: 0.31, y: 0.94, r: 0.17, semilla: 53 },
];

const CampoPuntos: React.FC = () => {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = lienzo.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const dibujar = () => {
      const caja = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ancho = Math.max(1, Math.round(caja.width));
      const alto = Math.max(1, Math.round(caja.height));
      cv.width = Math.round(ancho * dpr);
      cv.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, ancho, alto);

      const lado = Math.min(ancho, alto);
      const manchas = MANCHAS.map((m) => ({
        cx: m.x * ancho,
        cy: m.y * alto,
        radio: m.r * lado,
        relieve: hacerRelieve(m.semilla),
      }));

      const azar = azarCon(101);

      for (let y = PASO / 2; y < alto; y += PASO) {
        for (let x = PASO / 2; x < ancho; x += PASO) {
          // Cuánta tinta hay acá: se queda con la mancha más fuerte.
          let carga = 0;
          for (const m of manchas) {
            const dx = (x - m.cx) / m.radio;
            const dy = (y - m.cy) / m.radio;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > 1.35) continue;

            // La caída radial: larga, del lleno al cielo sin escalón.
            const caida = 1 - suave(limitar(d, 0, 1));
            // Y el relieve, que le rompe el contorno de compás.
            const r = m.relieve(dx * 1.25 + 4, dy * 1.25 + 4);
            const v = caida * 1.42 + (r - 0.5) * 0.9 - 0.42;
            if (v > carga) carga = v;
          }

          const t = azar();

          if (carga <= 0) {
            // Fuera de la mancha: la grilla de siempre, con alguna salpicadura
            // suelta que le saca el aire de degradado.
            ctx.fillStyle = ROSA_PUNTO;
            ctx.beginPath();
            ctx.arc(x, y, t > 0.994 ? 1.5 : 0.75, 0, Math.PI * 2);
            ctx.fill();
            continue;
          }

          // El halo pierde puntos, y cada vez más cerca del borde.
          if (carga < 0.5 && t > 0.2 + carga * 1.7) {
            ctx.fillStyle = ROSA_PUNTO;
            ctx.beginPath();
            ctx.arc(x, y, 0.75, 0, Math.PI * 2);
            ctx.fill();
            continue;
          }

          // Los del halo no caen clavados en la grilla: tiemblan.
          const tiemble = (1 - limitar(carga, 0, 1)) * 1.4;
          const px = x + (azar() - 0.5) * tiemble;
          const py = y + (azar() - 0.5) * tiemble;

          const radio = 0.7 + limitar(carga, 0, 1) * 3.2;
          ctx.fillStyle = carga > 0.22 ? TINTA : ROSA_PUNTO;
          if (radio >= PASO * 0.7) {
            // Ya no es un punto: es tinta llena, y se pinta como celda.
            ctx.fillRect(x - PASO / 2, y - PASO / 2, PASO + 0.5, PASO + 0.5);
          } else {
            ctx.beginPath();
            ctx.arc(px, py, radio, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    dibujar();
    const obs = new ResizeObserver(dibujar);
    obs.observe(cv);
    return () => obs.disconnect();
  }, []);

  return <canvas className="ts-campo-puntos" ref={lienzo} aria-hidden="true" />;
};

export default CampoPuntos;
