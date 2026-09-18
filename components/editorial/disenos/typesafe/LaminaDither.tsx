import React, { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Las láminas de los productos, tramadas a 1 bit.
//
// El documento del sistema pide tramado de un bit para las imágenes con
// degradado, y es lo que separa a estas fichas de las de cualquier otro diseño:
// no son fotos en duotono, son fotos reducidas a dos tintas y a un patrón.
//
// Cada producto tiene su propia receta, y son doce distintas: el par de tintas
// sale de la paleta del sistema y el patrón cambia de familia (Bayer de 4 y de
// 8, líneas, diagonales, cruzado, ondas, medio tono agrupado, ruido, bloques).
// Al pasar el puntero la lámina se resuelve con la segunda receta, así que el
// hover es una transformación de verdad y no un cambio de opacidad.
//
// Cómo se dibuja. La imagen se baja una sola vez y se guarda su luminancia en
// un Float32Array a la resolución del bloque; pintar una receta es recorrer ese
// arreglo comparando contra el umbral del patrón, que son unos pocos cientos de
// miles de comparaciones y entra de sobra en un cuadro. Cambiar de receta no
// vuelve a tocar la imagen.
// ─────────────────────────────────────────────────────────────────────────────

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60,
  28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47,
  7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

// Medio tono agrupado: el punto crece desde el centro de la celda, que es como
// engorda una trama de imprenta de verdad.
const AGRUPADO = [
  12, 5, 6, 13, 4, 0, 1, 7, 11, 3, 2, 8, 15, 10, 9, 14,
].map((v) => (v + 0.5) / 16);

type Patron =
  | 'bayer4'
  | 'bayer8'
  | 'agrupado'
  | 'lineas'
  | 'verticales'
  | 'diagonal'
  | 'cruzado'
  | 'ondas'
  | 'ruido'
  | 'bloques';

const hash = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

/** El umbral del patrón en cada celda: de eso sale toda la textura. */
const umbralDe = (patron: Patron, x: number, y: number) => {
  switch (patron) {
    case 'bayer4':
      return BAYER4[(y & 3) * 4 + (x & 3)];
    case 'bayer8':
      return BAYER8[(y & 7) * 8 + (x & 7)];
    case 'agrupado':
      return AGRUPADO[(y & 3) * 4 + (x & 3)];
    case 'lineas':
      return 0.16 + 0.68 * ((y % 3) / 3) + 0.08 * BAYER4[(y & 3) * 4 + (x & 3)];
    case 'verticales':
      return 0.16 + 0.68 * ((x % 3) / 3) + 0.08 * BAYER4[(y & 3) * 4 + (x & 3)];
    case 'diagonal':
      return 0.12 + 0.76 * (((x + y) % 4) / 4);
    case 'cruzado':
      return 0.1 + 0.8 * Math.max((x % 4) / 4, (y % 4) / 4);
    case 'ondas':
      return 0.5 + 0.38 * Math.sin(y * 0.9 + Math.sin(x * 0.11) * 3.4);
    case 'ruido':
      return 0.14 + 0.72 * hash(x, y);
    case 'bloques':
      return BAYER4[((y >> 1) & 3) * 4 + ((x >> 1) & 3)];
    default:
      return 0.5;
  }
};

export interface Receta {
  patron: Patron;
  /** La tinta y el papel de esta lámina, los dos de la paleta del sistema. */
  tinta: string;
  papel: string;
  /** Lado del bloque en píxeles: cuanto más grande, más gruesa la trama. */
  bloque: number;
  /** Corrimiento del punto medio, para compensar imágenes muy claras u oscuras. */
  sesgo?: number;
}

// Doce recetas, una por producto. El orden sigue al de PRODUCTOS.
export const RECETAS: Record<string, [Receta, Receta]> = {
  kerocraft: [
    { patron: 'bayer8', tinta: '#1e1e1e', papel: '#f386a1', bloque: 2 },
    { patron: 'agrupado', tinta: '#e350b9', papel: '#1e1e1e', bloque: 3, sesgo: -0.05 },
  ],
  voybien: [
    { patron: 'lineas', tinta: '#28292b', papel: '#abbab9', bloque: 2 },
    { patron: 'ondas', tinta: '#09aea0', papel: '#1e1e1e', bloque: 2, sesgo: -0.06 },
  ],
  clow: [
    { patron: 'agrupado', tinta: '#1e1e1e', papel: '#d9efff', bloque: 3 },
    { patron: 'cruzado', tinta: '#f386a1', papel: '#1e1e1e', bloque: 2 },
  ],
  anydesign: [
    { patron: 'bayer4', tinta: '#09aea0', papel: '#fefefe', bloque: 2 },
    { patron: 'diagonal', tinta: '#1e1e1e', papel: '#09aea0', bloque: 2 },
  ],
  lastmemory: [
    { patron: 'diagonal', tinta: '#3c2d31', papel: '#dedede', bloque: 2 },
    { patron: 'ruido', tinta: '#dedede', papel: '#3c2d31', bloque: 2 },
  ],
  elcubil: [
    { patron: 'ondas', tinta: '#e350b9', papel: '#d9efff', bloque: 2 },
    { patron: 'bloques', tinta: '#1e1e1e', papel: '#e350b9', bloque: 2 },
  ],
  saga: [
    { patron: 'cruzado', tinta: '#1e1e1e', papel: '#09aea0', bloque: 2 },
    { patron: 'bayer8', tinta: '#d9efff', papel: '#1e1e1e', bloque: 2 },
  ],
  clawdows: [
    { patron: 'verticales', tinta: '#e350b9', papel: '#fefefe', bloque: 2 },
    { patron: 'lineas', tinta: '#1e1e1e', papel: '#f386a1', bloque: 2 },
  ],
  pokialert: [
    { patron: 'ruido', tinta: '#28292b', papel: '#d9efff', bloque: 2 },
    { patron: 'agrupado', tinta: '#09aea0', papel: '#28292b', bloque: 3 },
  ],
  afondo: [
    { patron: 'bloques', tinta: '#1e1e1e', papel: '#e350b9', bloque: 2 },
    { patron: 'verticales', tinta: '#fefefe', papel: '#1e1e1e', bloque: 2 },
  ],
  kanau: [
    { patron: 'bayer4', tinta: '#e350b9', papel: '#1e1e1e', bloque: 2, sesgo: -0.08 },
    { patron: 'ondas', tinta: '#d9efff', papel: '#3c2d31', bloque: 2 },
  ],
  prodegame: [
    { patron: 'agrupado', tinta: '#3c2d31', papel: '#abbab9', bloque: 4 },
    { patron: 'cruzado', tinta: '#abbab9', papel: '#3c2d31', bloque: 3 },
  ],
};

const POR_DEFECTO: [Receta, Receta] = [
  { patron: 'bayer8', tinta: '#1e1e1e', papel: '#f386a1', bloque: 2 },
  { patron: 'diagonal', tinta: '#f386a1', papel: '#1e1e1e', bloque: 2 },
];

/** Un color hex a ABGR, que es como lo espera el ImageData. */
const aAbgr = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (255 << 24) | (((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255));
};

interface Props {
  slug: string;
  /** Segunda receta activa: se pinta al pasar el puntero por la ficha. */
  alterna: boolean;
}

const LaminaDither: React.FC<Props> = ({ slug, alterna }) => {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const luz = useRef<{ datos: Float32Array; w: number; h: number } | null>(null);
  const [listo, setListo] = useState(false);

  const recetas = RECETAS[slug] ?? POR_DEFECTO;
  const receta = recetas[alterna ? 1 : 0];

  // La imagen se baja una vez, recién cuando la ficha se acerca a la pantalla,
  // y se guarda su luminancia a la resolución del bloque más chico.
  useEffect(() => {
    const cv = lienzo.current;
    if (!cv) return;
    let vivo = true;

    const cargar = () => {
      const img = new Image();
      img.decoding = 'async';
      img.src = `/editorial/proyectos-color/${slug}.jpg`;
      img.onload = () => {
        if (!vivo) return;
        const caja = cv.getBoundingClientRect();
        const bloque = Math.min(...recetas.map((r) => r.bloque));
        const w = Math.max(1, Math.round((caja.width || 420) / bloque));
        const h = Math.max(1, Math.round((caja.height || 236) / bloque));

        const tmp = document.createElement('canvas');
        tmp.width = w;
        tmp.height = h;
        const tctx = tmp.getContext('2d', { willReadFrequently: true });
        if (!tctx) return;
        tctx.drawImage(img, 0, 0, w, h);

        const px = tctx.getImageData(0, 0, w, h).data;
        const datos = new Float32Array(w * h);
        const histo = new Uint32Array(256);
        for (let i = 0; i < datos.length; i++) {
          const j = i * 4;
          const l = (0.2126 * px[j] + 0.7152 * px[j + 1] + 0.0722 * px[j + 2]) / 255;
          datos[i] = l;
          histo[Math.min(255, Math.round(l * 255))]++;
        }

        // Niveles automáticos contra los percentiles 2 y 98. Las doce láminas
        // vienen con rangos muy distintos: sin esto, las claras salen lavadas y
        // las oscuras se tapan, y el patrón deja de verse.
        const recorte = Math.max(1, Math.round(datos.length * 0.02));
        let acum = 0;
        let bajo = 0;
        for (let k = 0; k < 256; k++) {
          acum += histo[k];
          if (acum >= recorte) {
            bajo = k / 255;
            break;
          }
        }
        acum = 0;
        let alto = 1;
        for (let k = 255; k >= 0; k--) {
          acum += histo[k];
          if (acum >= recorte) {
            alto = k / 255;
            break;
          }
        }
        const rango = Math.max(0.08, alto - bajo);
        for (let i = 0; i < datos.length; i++) {
          const v = (datos[i] - bajo) / rango;
          // Y un toque de contraste encima: el tramado premia el blanco y negro.
          datos[i] = Math.min(1, Math.max(0, (v - 0.5) * 1.22 + 0.5));
        }

        luz.current = { datos, w, h };
        setListo(true);
      };
    };

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          obs.disconnect();
          cargar();
        }
      },
      { rootMargin: '400px' },
    );
    obs.observe(cv);

    return () => {
      vivo = false;
      obs.disconnect();
    };
    // Las recetas de un producto no cambian en vida del componente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Pintar una receta es recorrer la luminancia contra el umbral del patrón.
  useEffect(() => {
    const cv = lienzo.current;
    const fuente = luz.current;
    if (!cv || !fuente || !listo) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const { datos, w, h } = fuente;
    const escala = receta.bloque / Math.min(...recetas.map((r) => r.bloque));
    const cols = Math.max(1, Math.round(w / escala));
    const filas = Math.max(1, Math.round(h / escala));

    const buf = document.createElement('canvas');
    buf.width = cols;
    buf.height = filas;
    const bctx = buf.getContext('2d');
    if (!bctx) return;

    const imagen = bctx.createImageData(cols, filas);
    const salida = new Uint32Array(imagen.data.buffer);
    const tinta = aAbgr(receta.tinta);
    const papel = aAbgr(receta.papel);
    const sesgo = receta.sesgo ?? 0;

    for (let f = 0; f < filas; f++) {
      const sy = Math.min(h - 1, Math.round(f * escala));
      for (let c = 0; c < cols; c++) {
        const sx = Math.min(w - 1, Math.round(c * escala));
        const v = datos[sy * w + sx] + sesgo;
        salida[f * cols + c] = v < umbralDe(receta.patron, c, f) ? tinta : papel;
      }
    }

    bctx.putImageData(imagen, 0, 0);

    const caja = cv.getBoundingClientRect();
    const ancho = Math.max(1, Math.round(caja.width));
    const alto = Math.max(1, Math.round(caja.height));
    cv.width = ancho;
    cv.height = alto;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, cols, filas, 0, 0, ancho, alto);
  }, [listo, receta, recetas]);

  return <canvas className="ts-ficha__dither" ref={lienzo} aria-hidden="true" />;
};

export default LaminaDither;
