import React, { useEffect, useRef } from 'react';
import { publicarCaja } from './senal';

// ─────────────────────────────────────────────────────────────────────────────
// Lienzo térmico de la portada. Miles de marcas de 2px que suben en diagonal de
// abajo a la izquierda hacia arriba a la derecha, sumando luz donde se pisan:
// el núcleo blanquea por suma, no por opacidad. El texto no se toca nunca: cada
// marca se apaga según su distancia a lo que hay que leer. Encima, la capa de
// anotación del sistema: caja de selección, detalle ampliado y línea guía.
// ─────────────────────────────────────────────────────────────────────────────

type Rect = { x: number; y: number; w: number; h: number };

const RAMPA = ['#553009', '#974C10', '#FF4500', '#FF8D04', '#FF9C00', '#FFE194', '#FFFFD6'];
const ACENTO = '#FF9C00';
const SOBRE_ACENTO = '#141414';
const SUPERFICIE = '#141414';
const NUCLEO = '#FFFFD6';
const GRILLA = '#1E1B19';
const PASO_GRILLA = 92;
const FUENTE = "500 11px 'JetBrains Mono', ui-monospace, monospace";

// La rampa se interpola en OKLab: en RGB aparecen bandas turbias.
const aLineal = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const aSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

const hexAOklab = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const r = aLineal(((n >> 16) & 255) / 255);
  const g = aLineal(((n >> 8) & 255) / 255);
  const b = aLineal((n & 255) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const oklabARgb = ([L, a, b]: number[]) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [r, g, bb].map((c) => Math.round(Math.min(1, Math.max(0, aSrgb(c))) * 255));
};

const PASOS = 96;
const COLORES: string[] = (() => {
  const labs = RAMPA.map(hexAOklab);
  const salida: string[] = [];
  for (let k = 0; k < PASOS; k++) {
    const t = (k / (PASOS - 1)) * (labs.length - 1);
    const i = Math.min(labs.length - 2, Math.floor(t));
    const f = t - i;
    const lab = labs[i].map((v, j) => v + (labs[i + 1][j] - v) * f);
    const [r, g, b] = oklabARgb(lab);
    const alfa = 0.34 + 0.66 * (k / (PASOS - 1));
    salida.push(`rgba(${r},${g},${b},${alfa.toFixed(3)})`);
  }
  return salida;
})();

/** Azar con semilla: el mismo lienzo en cada visita, no ruido distinto por recarga. */
const semilla = (s: number) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const distanciaRects = (a: Rect, b: Rect) => {
  const dx = Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w));
  const dy = Math.max(0, b.y - (a.y + a.h), a.y - (b.y + b.h));
  return Math.hypot(dx, dy);
};

const inflar = (r: Rect, p: number): Rect => ({ x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p });

const SELECTORES_TEXTO = [
  '.ed-marca',
  '.ed-masthead__der',
  '.ed-hero .ed-eyebrow',
  '.ed-hero h1 > span',
  '.ed-hero__pie > *',
];

interface Escena {
  ancho: number;
  alto: number;
  caja: Rect | null;
  detalle: Rect | null;
  guia: [number, number, number, number] | null;
  // Marcas en arreglos planos: x, y, alto, intensidad, fase, atenuación.
  mx: Float32Array;
  my: Float32Array;
  mh: Float32Array;
  mi: Float32Array;
  mf: Float32Array;
  total: number;
}

/** Mide el texto y arma la escena: dónde van las anotaciones y cada marca. */
const armarEscena = (lienzo: HTMLCanvasElement, compacto: boolean): Escena => {
  const base = lienzo.getBoundingClientRect();
  const ancho = base.width;
  const alto = base.height;
  const raiz = lienzo.closest('.ed-root') ?? document;

  const obstaculos: Rect[] = [];
  const agregar = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    obstaculos.push({ x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height });
  };
  SELECTORES_TEXTO.forEach((s) => raiz.querySelectorAll(s).forEach(agregar));
  ['.ed-riel', '.ed-barra'].forEach((s) => {
    const el = document.querySelector(s);
    if (el && getComputedStyle(el).display !== 'none') agregar(el);
  });

  // Grilla de ocupación con suma acumulada: cada consulta de rectángulo es O(1).
  const celda = 8;
  const cols = Math.ceil(ancho / celda);
  const filas = Math.ceil(alto / celda);
  const acum = new Int32Array((cols + 1) * (filas + 1));
  const ocupado = new Uint8Array(cols * filas);
  obstaculos.forEach((o) => {
    const r = inflar(o, compacto ? 14 : 24);
    const c0 = Math.max(0, Math.floor(r.x / celda));
    const c1 = Math.min(cols - 1, Math.floor((r.x + r.w) / celda));
    const f0 = Math.max(0, Math.floor(r.y / celda));
    const f1 = Math.min(filas - 1, Math.floor((r.y + r.h) / celda));
    for (let f = f0; f <= f1; f++) for (let c = c0; c <= c1; c++) ocupado[f * cols + c] = 1;
  });
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      acum[(f + 1) * (cols + 1) + c + 1] =
        ocupado[f * cols + c] + acum[f * (cols + 1) + c + 1] + acum[(f + 1) * (cols + 1) + c] - acum[f * (cols + 1) + c];
    }
  }
  const libre = (r: Rect) => {
    const margen = 18;
    if (r.x < margen || r.y < margen + 14 || r.x + r.w > ancho - margen || r.y + r.h > alto - margen) return false;
    const c0 = Math.floor(r.x / celda);
    const c1 = Math.ceil((r.x + r.w) / celda);
    const f0 = Math.floor((r.y - 18) / celda);
    const f1 = Math.ceil((r.y + r.h) / celda);
    const suma = acum[f1 * (cols + 1) + c1] - acum[f0 * (cols + 1) + c1] - acum[f1 * (cols + 1) + c0] + acum[f0 * (cols + 1) + c0];
    return suma === 0;
  };
  const puntoLibre = (x: number, y: number) => {
    const c = Math.floor(x / celda);
    const f = Math.floor(y / celda);
    if (c < 0 || f < 0 || c >= cols || f >= filas) return false;
    return ocupado[f * cols + c] === 0;
  };

  // El detalle ampliado busca arriba a la derecha; la región, lo más lejos posible.
  const escala = 2;
  const tamCaja = compacto ? { w: 84, h: 52 } : { w: 150, h: 92 };
  const tamDetalle = { w: tamCaja.w * escala, h: tamCaja.h * escala };
  const paso = 16;

  let detalle: Rect | null = null;
  let mejor = -Infinity;
  for (let y = 0; y + tamDetalle.h < alto; y += paso) {
    for (let x = 0; x + tamDetalle.w < ancho; x += paso) {
      const r = { x, y, ...tamDetalle };
      if (!libre(r)) continue;
      const puntaje = (x + r.w) / ancho - (y / alto) * 0.9;
      if (puntaje > mejor) {
        mejor = puntaje;
        detalle = r;
      }
    }
  }

  let caja: Rect | null = null;
  let guia: Escena['guia'] = null;
  if (detalle) {
    const d = detalle;
    mejor = -Infinity;
    for (let y = 0; y + tamCaja.h < alto; y += paso) {
      for (let x = 0; x + tamCaja.w < ancho; x += paso) {
        const r = { x, y, ...tamCaja };
        if (!libre(r) || distanciaRects(r, d) < 60) continue;
        // La guía une las esquinas enfrentadas y no puede cruzar texto.
        const ax = r.x + r.w / 2 < d.x + d.w / 2 ? r.x + r.w : r.x;
        const ay = r.y + r.h / 2 < d.y + d.h / 2 ? r.y + r.h : r.y;
        const bx = ax === r.x + r.w ? d.x : d.x + d.w;
        const by = ay === r.y + r.h ? d.y : d.y + d.h;
        const largo = Math.hypot(bx - ax, by - ay);
        let limpia = true;
        for (let k = 1; k < largo; k += 6) {
          const t = k / largo;
          if (!puntoLibre(ax + (bx - ax) * t, ay + (by - ay) * t)) {
            limpia = false;
            break;
          }
        }
        if (!limpia) continue;
        const puntaje = largo / ancho + (1 - x / ancho) * 0.35 + (y / alto) * 0.35;
        if (puntaje > mejor) {
          mejor = puntaje;
          caja = r;
          guia = [ax, ay, bx, by];
        }
      }
    }
    if (!caja) detalle = null;
  }

  // ── Marcas ──
  const azar = semilla(Math.round(ancho) * 31 + Math.round(alto));
  const gauss = () => {
    const u = 1 - azar();
    const v = azar();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const centro = caja
    ? { x: caja.x + caja.w / 2, y: caja.y + caja.h / 2 }
    : { x: ancho * 0.3, y: alto * 0.72 };
  const pendiente = (alto * 0.8) / ancho;
  const diagonal = (x: number) => centro.y - (x - centro.x) * pendiente;

  // Un segundo foco sobre la diagonal, lejos de la caja y en zona libre.
  let foco2 = { x: ancho * 0.8, y: diagonal(ancho * 0.8) };
  for (let k = 0; k < 40; k++) {
    const x = ancho * (0.15 + azar() * 0.8);
    const y = diagonal(x) + gauss() * alto * 0.05;
    if (Math.abs(x - centro.x) > ancho * 0.28 && puntoLibre(x, y) && y > 40 && y < alto - 40) {
      foco2 = { x, y };
      break;
    }
  }

  const bloqueos = obstaculos.concat(detalle ? [inflar(detalle, 6)] : []);
  const cap = Math.ceil(ancho / 4) * 16;
  const mx = new Float32Array(cap);
  const my = new Float32Array(cap);
  const mh = new Float32Array(cap);
  const mi = new Float32Array(cap);
  const mf = new Float32Array(cap);
  let total = 0;
  const radio = compacto ? 26 : 44;

  const sumar = (x: number, y: number, h: number, i: number) => {
    if (total >= cap || y < 0 || y > alto) return;
    const r = { x, y: y - h / 2, w: 2, h };
    let d = Infinity;
    for (const o of bloqueos) d = Math.min(d, distanciaRects(r, o));
    const t = Math.min(1, d / radio);
    const atenuacion = t * t * (3 - 2 * t);
    const valor = i * atenuacion;
    if (valor < 0.03) return;
    mx[total] = x;
    my[total] = y;
    mh[total] = h;
    mi[total] = valor;
    mf[total] = azar() * Math.PI * 2;
    total++;
  };

  const anchoCaja = caja ? caja.w : ancho * 0.1;
  const altoCaja = caja ? caja.h : alto * 0.1;

  for (let x = 2; x < ancho; x += 4) {
    // Fondo tenue en todo el lienzo: casi no se ve hasta que el puntero lo calienta.
    if (!compacto) {
      const sueltas = 1 + Math.floor(azar() * 2);
      for (let k = 0; k < sueltas; k++) sumar(x, azar() * alto, 2 + azar() * 12, 0.05 + azar() * 0.07);
    }

    const yc = diagonal(x);
    const banda = 3 + Math.floor(azar() * 3);
    for (let k = 0; k < banda; k++) {
      const desvio = gauss();
      const y = yc + desvio * alto * 0.16;
      sumar(x, y, 3 + azar() * 26, (0.1 + azar() * 0.28) * Math.exp(-desvio * desvio * 0.35));
    }

    const focos = [
      { c: centro, rx: anchoCaja * 0.75, ry: altoCaja * 0.32, fuerza: 1 },
      { c: foco2, rx: ancho * 0.07, ry: alto * 0.07, fuerza: 0.72 },
    ];
    for (const f of focos) {
      const dx = (x - f.c.x) / f.rx;
      if (Math.abs(dx) > 2.2) continue;
      const peso = Math.exp(-dx * dx);
      const n = 2 + Math.floor(peso * 7);
      for (let k = 0; k < n; k++) {
        const y = f.c.y + gauss() * f.ry;
        sumar(x, y, 6 + azar() * 38 * peso, f.fuerza * peso * (0.45 + azar() * 0.55));
      }
    }
  }

  return { ancho, alto, caja, detalle, guia, mx, my, mh, mi, mf, total };
};

/** Los renglones de acento llevan su caja de selección con la coordenada real. */
const marcarAcentos = (lienzo: HTMLCanvasElement) => {
  const raiz = lienzo.closest('.ed-root');
  if (!raiz) return;
  raiz.querySelectorAll<HTMLElement>('.ed-acento').forEach((el) => {
    const r = el.getBoundingClientRect();
    el.dataset.coord = `${Math.round(r.left)}, ${Math.round(r.top + window.scrollY)}`;
  });
};

const CALCO = 2;

const transparente = (c: string) => c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c);

/**
 * Calca lo que se lee en la portada (texto, rellenos, bordes y contornos) a un
 * lienzo aparte, a doble resolución. La ampliación x2 lo superpone al dato, así
 * muestra la interfaz entera y no solo las marcas.
 */
const calcarPortada = (portada: HTMLElement, lienzo: HTMLCanvasElement, escala: number) => {
  const base = lienzo.getBoundingClientRect();
  const calco = document.createElement('canvas');
  calco.width = Math.round(base.width * escala);
  calco.height = Math.round(base.height * escala);
  const ctx = calco.getContext('2d');
  if (!ctx) return null;
  ctx.scale(escala, escala);

  // Rellenos, bordes y contornos primero; el texto va encima de todo.
  portada.querySelectorAll<HTMLElement>('*').forEach((el) => {
    if (el === lienzo || el.closest('svg')) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const caja = el.getBoundingClientRect();
    const x = caja.left - base.left;
    const y = caja.top - base.top;
    const w = caja.width;
    const h = caja.height;
    if (w === 0 || h === 0) return;

    if (!transparente(cs.backgroundColor)) {
      ctx.fillStyle = cs.backgroundColor;
      ctx.fillRect(x, y, w, h);
    }

    const lado = (nombre: 'Top' | 'Right' | 'Bottom' | 'Left') => {
      const ancho = parseFloat(cs.getPropertyValue(`border-${nombre.toLowerCase()}-width`));
      const estilo = cs.getPropertyValue(`border-${nombre.toLowerCase()}-style`);
      const tono = cs.getPropertyValue(`border-${nombre.toLowerCase()}-color`);
      if (!(ancho > 0) || estilo === 'none' || transparente(tono)) return;
      ctx.fillStyle = tono;
      if (nombre === 'Top') ctx.fillRect(x, y, w, ancho);
      if (nombre === 'Bottom') ctx.fillRect(x, y + h - ancho, w, ancho);
      if (nombre === 'Left') ctx.fillRect(x, y, ancho, h);
      if (nombre === 'Right') ctx.fillRect(x + w - ancho, y, ancho, h);
    };
    lado('Top');
    lado('Right');
    lado('Bottom');
    lado('Left');

    const contorno = parseFloat(cs.outlineWidth);
    if (cs.outlineStyle !== 'none' && contorno > 0 && !transparente(cs.outlineColor)) {
      const aire = parseFloat(cs.outlineOffset) || 0;
      ctx.strokeStyle = cs.outlineColor;
      ctx.lineWidth = contorno;
      ctx.strokeRect(
        x - aire - contorno / 2,
        y - aire - contorno / 2,
        w + 2 * aire + contorno,
        h + 2 * aire + contorno,
      );
    }

    // La etiqueta de coordenada del acento es un ::before: se rearma a mano.
    if (el.classList.contains('ed-acento') && el.dataset.coord) {
      const em = parseFloat(cs.fontSize) * 0.12;
      ctx.font = "500 11px 'JetBrains Mono', ui-monospace, monospace";
      const ancho = ctx.measureText(el.dataset.coord).width + 12;
      const izq = x - em - 1;
      const abajo = y - em;
      ctx.fillStyle = '#FF9C00';
      ctx.fillRect(izq, abajo - 17, ancho, 17);
      ctx.fillStyle = '#141414';
      ctx.textBaseline = 'middle';
      ctx.fillText(el.dataset.coord, izq + 6, abajo - 8);
    }
  });

  portada.querySelectorAll<SVGElement>('svg.ed-flecha').forEach((flecha) => {
    const r = flecha.getBoundingClientRect();
    const x = r.left - base.left;
    const y = r.top - base.top;
    ctx.strokeStyle = getComputedStyle(flecha).color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y + 5);
    ctx.lineTo(x + 14, y + 5);
    ctx.moveTo(x + 10, y + 1);
    ctx.lineTo(x + 14, y + 5);
    ctx.lineTo(x + 10, y + 9);
    ctx.stroke();
  });

  const caminante = document.createTreeWalker(portada, NodeFilter.SHOW_TEXT);
  const rango = document.createRange();
  ctx.textBaseline = 'alphabetic';
  for (let nodo = caminante.nextNode(); nodo; nodo = caminante.nextNode()) {
    const padre = nodo.parentElement;
    if (!padre || padre.closest('svg')) continue;
    const cs = getComputedStyle(padre);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;

    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.fillStyle = cs.color;
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    const brilla = !!padre.closest('.ed-titular');
    ctx.shadowColor = brilla ? 'rgba(255, 156, 0, 0.45)' : 'transparent';
    ctx.shadowBlur = brilla ? 6 * escala : 0;
    const mayusculas = cs.textTransform === 'uppercase';

    // Palabra por palabra: así cada una cae en su renglón real aunque el texto corte.
    const texto = nodo.textContent ?? '';
    for (const m of texto.matchAll(/\S+/g)) {
      const desde = m.index ?? 0;
      rango.setStart(nodo, desde);
      rango.setEnd(nodo, desde + m[0].length);
      const r = rango.getClientRects()[0];
      if (!r || r.width === 0) continue;
      const palabra = mayusculas ? m[0].toUpperCase() : m[0];
      const medida = ctx.measureText(palabra);
      const alto = medida.fontBoundingBoxAscent + medida.fontBoundingBoxDescent;
      const linea = r.top - base.top + (r.height - alto) / 2 + medida.fontBoundingBoxAscent;
      ctx.fillText(palabra, r.left - base.left, linea);
    }
  }
  ctx.shadowBlur = 0;

  return calco;
};

const etiqueta = (ctx: CanvasRenderingContext2D, texto: string, x: number, y: number) => {
  ctx.font = FUENTE;
  const w = Math.ceil(ctx.measureText(texto).width) + 12;
  ctx.fillStyle = ACENTO;
  ctx.fillRect(Math.round(x), Math.round(y - 16), w, 16);
  ctx.fillStyle = SOBRE_ACENTO;
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, Math.round(x) + 6, Math.round(y - 8) + 0.5);
};

const CampoTermico: React.FC<{ idioma: string }> = ({ idioma }) => {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = lienzo.current;
    const portada = cv?.parentElement;
    if (!cv || !portada) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
    let escena: Escena | null = null;
    let dpr = 1;
    let cuadro = 0;
    let visible = true;
    let ultimo = 0;
    let armado = 0;

    // La caja sigue al puntero con inercia; un clic la fija donde está.
    const pos = { x: 0, y: 0 };
    const objetivo = { x: 0, y: 0 };
    const puntero = { x: 0, y: 0, dentro: false };
    let fijada = false;
    const desplazamiento = { x: 0, y: 0 };
    let publicada = '';
    // Copia de lo que se lee en la portada, solo para la ampliación x2.
    let calco: HTMLCanvasElement | null = null;

    const casa = () => (escena?.caja ? { x: escena.caja.x, y: escena.caja.y } : { x: 0, y: 0 });

    const apuntar = (px: number, py: number) => {
      const e = escena;
      if (!e?.caja) return;
      objetivo.x = Math.min(Math.max(px - e.caja.w / 2, 1), e.ancho - e.caja.w - 1);
      objetivo.y = Math.min(Math.max(py - e.caja.h / 2, 1), e.alto - e.caja.h - 1);
    };

    const armar = () => {
      armado = 0;
      const compacto = window.matchMedia('(max-width: 900px), (hover: none)').matches;
      dpr = compacto ? 1 : Math.min(2, window.devicePixelRatio || 1);
      const r = cv.getBoundingClientRect();
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      escena = armarEscena(cv, compacto);
      const raiz = cv.closest('.ed-root')?.getBoundingClientRect();
      desplazamiento.x = raiz ? r.left - raiz.left : 0;
      desplazamiento.y = raiz ? r.top - raiz.top : 0;
      const c = casa();
      if (!fijada && !puntero.dentro) {
        objetivo.x = pos.x = c.x;
        objetivo.y = pos.y = c.y;
      }
      publicada = '';
      marcarAcentos(cv);
      calco = calcarPortada(portada, cv, CALCO);
      dibujar(performance.now());
    };

    const pedirArmado = () => {
      if (armado) window.clearTimeout(armado);
      armado = window.setTimeout(armar, 60);
    };

    const dibujar = (ahora: number) => {
      const e = escena;
      if (!e) return;
      const t = quieto.matches ? 0 : ahora / 1000;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, e.ancho, e.alto);

      // Grilla del lienzo: paso fijo, casi invisible.
      ctx.fillStyle = GRILLA;
      for (let x = PASO_GRILLA; x < e.ancho; x += PASO_GRILLA) ctx.fillRect(x, 0, 1, e.alto);
      for (let y = PASO_GRILLA; y < e.alto; y += PASO_GRILLA) ctx.fillRect(0, y, e.ancho, 1);

      // Cruz de lectura que acompaña al puntero.
      if (puntero.dentro) {
        ctx.fillStyle = '#2A2522';
        ctx.fillRect(Math.round(puntero.x), 0, 1, e.alto);
        ctx.fillRect(0, Math.round(puntero.y), e.ancho, 1);
      }

      // Marcas con suma de luz. El barrido recorre el lienzo cada 7 segundos y
      // el puntero calienta lo que tiene cerca, sin tocar las zonas de texto.
      ctx.globalCompositeOperation = 'lighter';
      const barrido = quieto.matches ? -9999 : (((t / 7) % 1.25) - 0.12) * e.ancho;
      for (let k = 0; k < e.total; k++) {
        const x = e.mx[k];
        const pulso = quieto.matches ? 1 : 0.8 + 0.2 * Math.sin(t * 1.3 + e.mf[k]);
        const cerca = (x - barrido) / 70;
        let valor = e.mi[k] * pulso + (e.mi[k] > 0.08 ? 0.4 * Math.exp(-cerca * cerca) : 0);
        if (puntero.dentro) {
          const d2 = ((x - puntero.x) ** 2 + (e.my[k] - puntero.y) ** 2) / 12100;
          if (d2 < 9) valor += 0.6 * Math.exp(-d2) * Math.min(1, e.mi[k] * 5);
        }
        valor = Math.min(1, valor);
        const h = e.mh[k];
        const arriba = e.my[k] - h / 2;
        ctx.fillStyle = COLORES[Math.min(PASOS - 1, Math.floor(valor * (PASOS - 1)))];
        ctx.fillRect(x, arriba, 2, h);
        const mecha = h * 0.45;
        ctx.globalAlpha = 0.28;
        ctx.fillRect(x, arriba - mecha, 2, mecha);
        ctx.fillRect(x, arriba + h, 2, mecha);
        ctx.globalAlpha = 1;
      }

      // Líneas de barrido del fósforo, solo sobre el dato.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      for (let y = 0; y < e.alto; y += 3) ctx.fillRect(0, y, e.ancho, 1);

      ctx.globalCompositeOperation = 'source-over';

      if (e.caja && e.detalle) {
        const c = { x: pos.x, y: pos.y, w: e.caja.w, h: e.caja.h };
        const d = e.detalle;
        ctx.fillStyle = SUPERFICIE;
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(cv, c.x * dpr, c.y * dpr, c.w * dpr, c.h * dpr, d.x, d.y, d.w, d.h);
        if (calco) {
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(calco, c.x * CALCO, c.y * CALCO, c.w * CALCO, c.h * CALCO, d.x, d.y, d.w, d.h);
          ctx.imageSmoothingEnabled = false;
        }

        const activa = puntero.dentro || fijada;
        ctx.strokeStyle = ACENTO;
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(d.x) + 0.5, Math.round(d.y) + 0.5, Math.round(d.w), Math.round(d.h));

        // La guía une las dos esquinas más cercanas, se mueva la caja adonde se mueva.
        const esquinas = (r: Rect) => [
          [r.x, r.y],
          [r.x + r.w, r.y],
          [r.x, r.y + r.h],
          [r.x + r.w, r.y + r.h],
        ];
        let mejor = Infinity;
        let par = [0, 0, 0, 0];
        for (const [ax, ay] of esquinas(c)) {
          for (const [bx, by] of esquinas(d)) {
            const dist = Math.hypot(bx - ax, by - ay);
            if (dist < mejor) {
              mejor = dist;
              par = [ax, ay, bx, by];
            }
          }
        }
        ctx.beginPath();
        ctx.moveTo(Math.round(par[0]) + 0.5, Math.round(par[1]) + 0.5);
        ctx.lineTo(Math.round(par[2]) + 0.5, Math.round(par[3]) + 0.5);
        ctx.stroke();

        ctx.strokeStyle = activa ? NUCLEO : ACENTO;
        ctx.strokeRect(Math.round(c.x) + 0.5, Math.round(c.y) + 0.5, Math.round(c.w), Math.round(c.h));
        if (activa) {
          // Esquinas de mira por fuera de la caja.
          const l = 8;
          const o = 4;
          ctx.fillStyle = NUCLEO;
          const x0 = Math.round(c.x) - o;
          const y0 = Math.round(c.y) - o;
          const x1 = Math.round(c.x + c.w) + o;
          const y1 = Math.round(c.y + c.h) + o;
          ctx.fillRect(x0, y0, l, 1);
          ctx.fillRect(x0, y0, 1, l);
          ctx.fillRect(x1 - l + 1, y0, l, 1);
          ctx.fillRect(x1, y0, 1, l);
          ctx.fillRect(x0, y1, l, 1);
          ctx.fillRect(x0, y1 - l + 1, 1, l);
          ctx.fillRect(x1 - l + 1, y1, l, 1);
          ctx.fillRect(x1, y1 - l + 1, 1, l);
        }

        etiqueta(ctx, `${Math.round(c.x)}, ${Math.round(c.y)}${fijada ? '  LOCK' : ''}`, c.x, c.y);
        // La ampliación lee el centro de la región que muestra, no su propia posición.
        etiqueta(ctx, `x2  ${Math.round(c.x + c.w / 2)}, ${Math.round(c.y + c.h / 2)}`, d.x, d.y);

        const clave = `${Math.round(c.x)},${Math.round(c.y)},${activa}`;
        if (clave !== publicada) {
          publicada = clave;
          publicarCaja({ x: c.x + desplazamiento.x, y: c.y + desplazamiento.y, w: c.w, h: c.h, activa });
        }
      }
    };

    const bucle = (ahora: number) => {
      cuadro = 0;
      if (!visible || document.hidden || quieto.matches) return;
      // A 30 cuadros alcanza para que se lea vivo sin gastar de más.
      // Con el puntero encima va a 60 cuadros; quieto alcanza con 30.
      if (ahora - ultimo > (puntero.dentro ? 14 : 33)) {
        ultimo = ahora;
        pos.x += (objetivo.x - pos.x) * 0.5;
        pos.y += (objetivo.y - pos.y) * 0.5;
        dibujar(ahora);
      }
      cuadro = window.requestAnimationFrame(bucle);
    };

    const arrancar = () => {
      if (!cuadro && visible && !document.hidden && !quieto.matches) cuadro = window.requestAnimationFrame(bucle);
    };

    // Con movimiento reducido no hay bucle: se salta a la posición y se redibuja.
    const alInstante = () => {
      if (!quieto.matches) return;
      pos.x = objetivo.x;
      pos.y = objetivo.y;
      dibujar(performance.now());
    };

    const alMover = (ev: PointerEvent) => {
      if (ev.pointerType !== 'mouse') return;
      const r = cv.getBoundingClientRect();
      puntero.x = ev.clientX - r.left;
      puntero.y = ev.clientY - r.top;
      puntero.dentro = true;
      if (!fijada) apuntar(puntero.x, puntero.y);
      alInstante();
    };

    const alSalir = () => {
      puntero.dentro = false;
      if (!fijada) {
        const c = casa();
        objetivo.x = c.x;
        objetivo.y = c.y;
      }
      alInstante();
    };

    const alClic = (ev: MouseEvent) => {
      if ((ev.target as Element).closest('a, button') || !escena?.caja) return;
      fijada = !fijada;
      if (!fijada) apuntar(puntero.x, puntero.y);
      alInstante();
    };

    // Los botones cambian al pasar: el calco se rehace para que la ampliación lo muestre.
    let recalcando = 0;
    const alCambiarEstado = (ev: PointerEvent) => {
      if (!(ev.target as Element).closest?.('a, button')) return;
      window.clearTimeout(recalcando);
      calco = calcarPortada(portada, cv, CALCO);
      recalcando = window.setTimeout(() => {
        calco = calcarPortada(portada, cv, CALCO);
      }, 220);
    };

    portada.addEventListener('pointermove', alMover);
    portada.addEventListener('pointerleave', alSalir);
    portada.addEventListener('click', alClic);
    portada.addEventListener('pointerover', alCambiarEstado);
    portada.addEventListener('pointerout', alCambiarEstado);

    const ro = new ResizeObserver(pedirArmado);
    ro.observe(cv);
    const io = new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting;
      arrancar();
    });
    io.observe(cv);

    const alVisibilidad = () => arrancar();
    const alMovimiento = () => {
      dibujar(performance.now());
      arrancar();
    };
    document.addEventListener('visibilitychange', alVisibilidad);
    quieto.addEventListener('change', alMovimiento);
    document.fonts?.ready.then(pedirArmado);
    // Las entradas por escaneo terminan después del primer armado: se recalca.
    const recalco = window.setTimeout(pedirArmado, 1200);

    armar();
    arrancar();

    return () => {
      ro.disconnect();
      io.disconnect();
      portada.removeEventListener('pointermove', alMover);
      portada.removeEventListener('pointerleave', alSalir);
      portada.removeEventListener('click', alClic);
      portada.removeEventListener('pointerover', alCambiarEstado);
      portada.removeEventListener('pointerout', alCambiarEstado);
      window.clearTimeout(recalcando);
      document.removeEventListener('visibilitychange', alVisibilidad);
      quieto.removeEventListener('change', alMovimiento);
      if (cuadro) window.cancelAnimationFrame(cuadro);
      if (armado) window.clearTimeout(armado);
      window.clearTimeout(recalco);
      publicarCaja(null);
    };
  }, [idioma]);

  return <canvas ref={lienzo} className="am-campo" aria-hidden="true" />;
};

export default CampoTermico;
