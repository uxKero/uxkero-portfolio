import React, { useLayoutEffect, useRef, useState } from 'react';
import type { PropsEntrada } from '../../disenos';

// ─────────────────────────────────────────────────────────────────────────────
// Entrada térmica. El calor sale del punto donde se hizo clic y se come la
// pantalla con un frente incandescente que se enfría a imagen de cámara
// térmica. Con todo tapado se cambia el diseño por debajo; después un segundo
// frente disuelve la imagen, cada píxel se enciende una última vez y deja ver
// Amber. Dura algo menos de dos segundos.
// ─────────────────────────────────────────────────────────────────────────────

const RAMPA = [
  [0x14, 0x14, 0x14],
  [0x55, 0x30, 0x09],
  [0x97, 0x4c, 0x10],
  [0xff, 0x45, 0x00],
  [0xff, 0x8d, 0x04],
  [0xff, 0x9c, 0x00],
  [0xff, 0xe1, 0x94],
  [0xff, 0xff, 0xd6],
];

const color = (v: number) => {
  const t = Math.min(0.9999, Math.max(0, v)) * (RAMPA.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const a = RAMPA[i];
  const b = RAMPA[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
};

const CELDA = 9;
const CALENTAR = 700;
const PAUSA = 90;
const ENFRIAR = 950;

const suave = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Ruido de valor: una grilla gruesa interpolada más un grano fino. */
const ruido = (cols: number, filas: number, paso: number) => {
  const gc = Math.ceil(cols / paso) + 2;
  const gf = Math.ceil(filas / paso) + 2;
  const grilla = Float32Array.from({ length: gc * gf }, () => Math.random());
  const salida = new Float32Array(cols * filas);
  for (let y = 0; y < filas; y++) {
    for (let x = 0; x < cols; x++) {
      const fx = x / paso;
      const fy = y / paso;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = fx - x0;
      const ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx);
      const sy = ty * ty * (3 - 2 * ty);
      const v00 = grilla[y0 * gc + x0];
      const v10 = grilla[y0 * gc + x0 + 1];
      const v01 = grilla[(y0 + 1) * gc + x0];
      const v11 = grilla[(y0 + 1) * gc + x0 + 1];
      const arriba = v00 + (v10 - v00) * sx;
      const abajo = v01 + (v11 - v01) * sx;
      salida[y * cols + x] = (arriba + (abajo - arriba) * sy) * 0.8 + Math.random() * 0.2;
    }
  }
  return salida;
};

const Entrada: React.FC<PropsEntrada> = ({ origen, onCubierta, onFin }) => {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const [lectura, setLectura] = useState(0);

  useLayoutEffect(() => {
    const cv = lienzo.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;

    const cols = Math.ceil(window.innerWidth / CELDA);
    const filas = Math.ceil(window.innerHeight / CELDA);
    cv.width = cols;
    cv.height = filas;
    const imagen = ctx.createImageData(cols, filas);
    const px = imagen.data;

    const ox = origen.x / CELDA;
    const oy = origen.y / CELDA;
    const lejos = Math.max(
      Math.hypot(ox, oy),
      Math.hypot(cols - ox, oy),
      Math.hypot(ox, filas - oy),
      Math.hypot(cols - ox, filas - oy),
    );
    const n1 = ruido(cols, filas, 7);
    const n2 = ruido(cols, filas, 5);
    const llegada = new Float32Array(cols * filas);
    const salida = new Float32Array(cols * filas);
    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const d = Math.hypot(x - ox, y - oy) / lejos;
        llegada[i] = d * 0.78 + n1[i] * 0.22;
        salida[i] = d * 0.5 + n2[i] * 0.5;
      }
    }

    let cuadro = 0;
    let avisada = false;
    let terminada = false;
    const inicio = performance.now();

    const pintar = (ahora: number) => {
      const t = ahora - inicio;
      const fase1 = Math.min(1, t / CALENTAR);
      const fase2 = Math.max(0, Math.min(1, (t - CALENTAR - PAUSA) / ENFRIAR));
      const frente = suave(fase1) * 1.3;
      const frente2 = suave(fase2) * 1.32;
      const parpadeo = 0.9 + 0.1 * Math.sin(t / 40);

      for (let i = 0, j = 0; i < llegada.length; i++, j += 4) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;

        const x1 = frente - llegada[i];
        if (x1 > 0) {
          const banda = 0.24;
          if (x1 < banda) {
            // Frente de calor: el borde que avanza es el más caliente.
            const h = x1 / banda;
            [r, g, b] = color(1 - h * 0.75);
            a = Math.min(1, x1 / 0.02) * 255;
          } else {
            // Detrás del frente queda la imagen de cámara térmica, apagada.
            [r, g, b] = color((0.1 + n1[i] * 0.22) * parpadeo);
            a = 255;
          }

          if (fase2 > 0) {
            const x2 = frente2 - salida[i];
            const banda2 = 0.2;
            if (x2 >= banda2) a = 0;
            else if (x2 > 0) {
              const h = x2 / banda2;
              [r, g, b] = color(0.35 + Math.sin(Math.PI * h) * 0.6);
              a = (1 - h) * 255;
            }
          }
        }

        px[j] = r;
        px[j + 1] = g;
        px[j + 2] = b;
        px[j + 3] = a;
      }
      ctx.putImageData(imagen, 0, 0);

      if (!avisada && fase1 >= 1) {
        avisada = true;
        onCubierta();
      }
      setLectura(Math.round((fase1 * 0.45 + fase2 * 0.55) * 100));

      if (fase2 >= 1) {
        if (!terminada) {
          terminada = true;
          onFin();
        }
        return;
      }
      cuadro = requestAnimationFrame(pintar);
    };

    pintar(performance.now());
    return () => cancelAnimationFrame(cuadro);
    // La transición corre una sola vez por montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="am-entrada" aria-hidden="true">
      <canvas ref={lienzo} className="am-entrada__lienzo" />
      <span className="am-entrada__lectura">
        THERMAL <b>{String(lectura).padStart(3, '0')}%</b>
      </span>
    </div>
  );
};

export default Entrada;
