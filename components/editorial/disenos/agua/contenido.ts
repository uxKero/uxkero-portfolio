import {
  CERTIFICACIONES,
  CONTACTO,
  DATOS,
  GUIAS,
  MANIFIESTO,
  OFICIO,
  PRODUCTOS,
  SECCIONES,
  TRABAJO,
  type Producto,
} from '../../editorial-content';

// ─────────────────────────────────────────────────────────────────────────────
// El portfolio escrito en la pared del pozo. Todo se mide en metros: a qué
// profundidad está cada cosa y cuánto ocupa. Los títulos van tallados en la
// roca; el contenido, en placas de bronce abulonadas a la pared. Cada placa
// sabe dibujarse: letras blancas sobre negro, que el shader convierte en
// relieve.
// ─────────────────────────────────────────────────────────────────────────────

type L = 'es' | 'en';

export type Accion =
  | { tipo: 'producto'; producto: Producto }
  | { tipo: 'enlace'; url: string }
  | { tipo: 'ruta'; href: string };

export interface Talla {
  tipo: 'talla';
  lineas: string[];
  /** Profundidad del centro, en metros. */
  prof: number;
  /** Alto de las mayúsculas, en metros. */
  alto: number;
  x: number;
  italica?: boolean;
}

export interface Placa {
  tipo: 'placa';
  id: string;
  prof: number;
  x: number;
  ancho: number;
  alto: number;
  dibujar: (c: CanvasRenderingContext2D, w: number, h: number) => void;
  /** Lo grabado atrás: se ve al dar vuelta la placa en la mano. */
  dorso?: (c: CanvasRenderingContext2D, w: number, h: number) => void;
  accion?: Accion;
}

export type Pieza = Talla | Placa;

export interface Plan {
  piezas: Pieza[];
  /** Profundidad de cada sección, para el profundímetro. */
  secciones: { id: string; prof: number }[];
  fondo: number;
}

const SERIF = "'Instrument Serif', Georgia, serif";
const SANS = "'Instrument Sans', system-ui, sans-serif";

/** Parte un texto en renglones que entran en el ancho. */
function renglones(c: CanvasRenderingContext2D, texto: string, ancho: number) {
  const palabras = texto.split(' ');
  const salida: string[] = [];
  let linea = '';
  for (const p of palabras) {
    const prueba = linea ? `${linea} ${p}` : p;
    if (c.measureText(prueba).width > ancho && linea) {
      salida.push(linea);
      linea = p;
    } else linea = prueba;
  }
  if (linea) salida.push(linea);
  return salida;
}

/** El marco de toda placa: un filete en relieve a un dedo del borde y los
 *  cuatro bulones que la sostienen contra la roca. */
function marco(c: CanvasRenderingContext2D, w: number, h: number) {
  const m = Math.round(Math.min(w, h) * 0.045);
  c.strokeStyle = '#fff';
  c.lineWidth = Math.max(3, Math.round(w * 0.006));
  c.strokeRect(m, m, w - m * 2, h - m * 2);
  const r = Math.max(4, Math.min(w, h) * 0.018);
  for (const [x, y] of [[m * 0.5, m * 0.5], [w - m * 0.5, m * 0.5], [m * 0.5, h - m * 0.5], [w - m * 0.5, h - m * 0.5]]) {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = '#fff';
    c.fill();
  }
  return m * 2.2;
}

const capital = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** Dónde empieza lo escrito: bajo el labio del pozo, en la cara lisa. */
const INICIO = 1.7;
/** El centro de lo escrito, frente a la cámara. */
const CENTRO = 0.1;

export function armarPlan(L: L): Plan {
  const piezas: Pieza[] = [];
  const secciones: { id: string; prof: number }[] = [{ id: 'top', prof: 0 }];
  const label = (id: string) => SECCIONES.find((s) => s.id === id)!.label[L];
  const titulo = (id: string, prof: number) => {
    secciones.push({ id, prof: prof - 0.4 });
    piezas.push({ tipo: 'talla', lineas: [label(id)], prof, alto: 0.34, x: 0.3 });
  };
  const fila = (n: number, ancho: number, separa = 0.16) =>
    Array.from({ length: n }, (_, i) => CENTRO + (i - (n - 1) / 2) * (ancho + separa));

  // ── Perfil ────────────────────────────────────────────────────────────────
  titulo('perfil', 4.2);
  piezas.push({
    tipo: 'placa',
    id: 'manifiesto',
    prof: 6.0,
    x: CENTRO,
    ancho: 2.5,
    alto: 1.3,
    dibujar: (c, w, h) => {
      const m = marco(c, w, h);
      c.fillStyle = '#fff';
      c.textBaseline = 'top';
      c.font = `italic 400 ${h * 0.11}px ${SERIF}`;
      const t = MANIFIESTO.titular[L];
      c.fillText(`${capital(t[0])} ${t[1].toLowerCase()} ${t[2].toLowerCase()}`, m, m);
      const col = (w - m * 2 - m) / 3;
      c.font = `500 ${h * 0.042}px ${SANS}`;
      MANIFIESTO.parrafos[L].forEach((p, i) => {
        renglones(c, p, col - m * 0.3).forEach((r, j) => c.fillText(r, m + i * (col + m * 0.5), m + h * 0.22 + j * h * 0.06));
      });
    },
  });
  fila(3, 1.0, 0.2).forEach((x, i) => {
    const d = DATOS[i];
    piezas.push({
      tipo: 'placa',
      id: `dato-${i}`,
      prof: 7.9,
      x,
      ancho: 1.0,
      alto: 0.62,
      dibujar: (c, w, h) => {
        const m = marco(c, w, h);
        c.fillStyle = '#fff';
        c.textBaseline = 'top';
        c.font = `400 ${h * 0.36}px ${SERIF}`;
        c.fillText(d.cifra, m, m * 0.7);
        c.font = `600 ${h * 0.075}px ${SANS}`;
        c.fillText(d.titulo[L], m, h * 0.52);
        c.font = `500 ${h * 0.06}px ${SANS}`;
        renglones(c, d.contexto[L], w - m * 2).forEach((r, j) => c.fillText(r, m, h * 0.65 + j * h * 0.085));
      },
    });
  });

  // ── Trabajo ───────────────────────────────────────────────────────────────
  titulo('trabajo', 9.8);
  fila(TRABAJO.length, 1.0).forEach((x, i) => {
    const t = TRABAJO[i];
    piezas.push({
      tipo: 'placa',
      id: `trabajo-${i}`,
      prof: 11.0,
      x,
      ancho: 1.0,
      alto: 0.72,
      accion: t.url ? { tipo: 'enlace', url: t.url } : undefined,
      dibujar: (c, w, h) => {
        const m = marco(c, w, h);
        c.fillStyle = '#fff';
        c.textBaseline = 'top';
        c.font = `600 ${h * 0.055}px ${SANS}`;
        c.fillText(`${t.n} · ${t.estado[L].toUpperCase()}`, m, m);
        c.font = `400 ${h * 0.12}px ${SERIF}`;
        renglones(c, t.rol[L], w - m * 2).forEach((r, j) => c.fillText(r, m, m + h * 0.11 + j * h * 0.13));
        c.font = `600 ${h * 0.065}px ${SANS}`;
        c.fillText(t.org, m, h * 0.7);
        c.font = `500 ${h * 0.055}px ${SANS}`;
        c.fillText(t.contexto[L], m, h * 0.8);
      },
    });
  });

  // ── Productos ─────────────────────────────────────────────────────────────
  titulo('productos', 12.9);
  const porFila = 3;
  const pasoFila = 0.98;
  PRODUCTOS.forEach((p, i) => {
    const filaN = Math.floor(i / porFila);
    const enFila = Math.min(porFila, PRODUCTOS.length - filaN * porFila);
    const xs = fila(enFila, 1.2, 0.18);
    piezas.push({
      tipo: 'placa',
      id: `producto-${p.slug}`,
      prof: 14.1 + filaN * pasoFila,
      x: xs[i % porFila],
      ancho: 1.2,
      alto: 0.78,
      accion: { tipo: 'producto', producto: p },
      dorso: (c, w, h) => {
        const m = marco(c, w, h);
        c.fillStyle = '#fff';
        c.textBaseline = 'top';
        c.font = `400 ${h * 0.11}px ${SERIF}`;
        c.fillText(p.nombre, m, m);
        c.font = `500 ${h * 0.047}px ${SANS}`;
        const lineas = renglones(c, p.texto[L], w - m * 2);
        const paso = Math.min(h * 0.068, (h * 0.66) / Math.max(lineas.length, 1));
        lineas.forEach((r, j) => c.fillText(r, m, m + h * 0.17 + j * paso));
        const pie = p.meta ? p.meta[L] : p.stack;
        if (pie) {
          c.font = `600 ${h * 0.045}px ${SANS}`;
          c.fillText(pie, m, h - m - h * 0.06);
        }
      },
      dibujar: (c, w, h) => {
        const m = marco(c, w, h);
        c.fillStyle = '#fff';
        c.textBaseline = 'top';
        c.font = `600 ${h * 0.06}px ${SANS}`;
        c.fillText(`${p.n} · ${p.estado[L].toUpperCase()}`, m, m);
        c.font = `400 ${h * 0.2}px ${SERIF}`;
        c.fillText(p.nombre, m, m + h * 0.1);
        c.font = `500 ${h * 0.062}px ${SANS}`;
        renglones(c, p.rol[L], w - m * 2).slice(0, 2).forEach((r, j) => c.fillText(r, m, h * 0.62 + j * h * 0.085));
      },
    });
  });
  const ultimaFila = 14.1 + Math.floor((PRODUCTOS.length - 1) / porFila) * pasoFila;

  // ── Oficio ────────────────────────────────────────────────────────────────
  const pOficio = ultimaFila + 1.9;
  titulo('oficio', pOficio);
  fila(OFICIO.length, 1.0).forEach((x, i) => {
    const o = OFICIO[i];
    piezas.push({
      tipo: 'placa',
      id: `oficio-${i}`,
      prof: pOficio + 1.45,
      x,
      ancho: 1.0,
      alto: 1.06,
      dibujar: (c, w, h) => {
        const m = marco(c, w, h);
        c.fillStyle = '#fff';
        c.textBaseline = 'top';
        c.font = `400 ${h * 0.085}px ${SERIF}`;
        renglones(c, o.titulo[L], w - m * 2).forEach((r, j) => c.fillText(r, m, m + j * h * 0.09));
        c.font = `500 ${h * 0.045}px ${SANS}`;
        o.items.forEach((it, j) => c.fillText(`— ${it[L]}`, m, m + h * 0.24 + j * h * 0.075));
      },
    });
  });

  // ── Estudios ──────────────────────────────────────────────────────────────
  const pEstudios = pOficio + 3.3;
  titulo('estudios', pEstudios);
  fila(CERTIFICACIONES.length, 1.0).forEach((x, i) => {
    const e = CERTIFICACIONES[i];
    piezas.push({
      tipo: 'placa',
      id: `estudio-${i}`,
      prof: pEstudios + 1.05,
      x,
      ancho: 1.0,
      alto: 0.5,
      accion: e.url ? { tipo: 'enlace', url: e.url } : undefined,
      dibujar: (c, w, h) => {
        const m = marco(c, w, h);
        c.fillStyle = '#fff';
        c.textBaseline = 'top';
        c.font = `600 ${h * 0.08}px ${SANS}`;
        c.fillText(`${e.casa.toUpperCase()} · ${e.anio}`, m, m);
        c.font = `400 ${h * 0.15}px ${SERIF}`;
        renglones(c, e.nombre, w - m * 2).forEach((r, j) => c.fillText(r, m, m + h * 0.16 + j * h * 0.16));
      },
    });
  });

  // ── Guías ─────────────────────────────────────────────────────────────────
  const pGuias = pEstudios + 2.6;
  titulo('guias', pGuias);
  fila(GUIAS.length, 1.6, 0.2).forEach((x, i) => {
    const g = GUIAS[i];
    piezas.push({
      tipo: 'placa',
      id: `guia-${i}`,
      prof: pGuias + 1.1,
      x,
      ancho: 1.6,
      alto: 0.66,
      accion: { tipo: 'ruta', href: g.href },
      dibujar: (c, w, h) => {
        const m = marco(c, w, h);
        c.fillStyle = '#fff';
        c.textBaseline = 'top';
        c.font = `600 ${h * 0.06}px ${SANS}`;
        c.fillText(g.meta[L].toUpperCase(), m, m);
        c.font = `400 ${h * 0.17}px ${SERIF}`;
        c.fillText(g.titulo, m, m + h * 0.1);
        c.font = `500 ${h * 0.06}px ${SANS}`;
        renglones(c, g.texto[L], w - m * 2).forEach((r, j) => c.fillText(r, m, h * 0.55 + j * h * 0.085));
      },
    });
  });

  // ── Contacto ──────────────────────────────────────────────────────────────
  const pContacto = pGuias + 2.8;
  secciones.push({ id: 'contacto', prof: pContacto - 0.4 });
  piezas.push({
    tipo: 'talla',
    lineas: CONTACTO.titular[L].map((l, i) => (i === 0 ? capital(l) : l.toLowerCase())),
    prof: pContacto,
    alto: 0.24,
    x: CENTRO,
  });
  piezas.push({
    tipo: 'placa',
    id: 'mail',
    prof: pContacto + 1.2,
    x: CENTRO,
    ancho: 2.0,
    alto: 0.42,
    accion: { tipo: 'enlace', url: `mailto:${CONTACTO.email}` },
    dibujar: (c, w, h) => {
      marco(c, w, h);
      c.fillStyle = '#fff';
      c.textBaseline = 'middle';
      c.textAlign = 'center';
      c.font = `400 ${h * 0.34}px ${SERIF}`;
      c.fillText(CONTACTO.email, w / 2, h / 2);
    },
  });
  fila(CONTACTO.enlaces.length, 0.48, 0.1).forEach((x, i) => {
    const e = CONTACTO.enlaces[i];
    piezas.push({
      tipo: 'placa',
      id: `enlace-${i}`,
      prof: pContacto + 1.85,
      x,
      ancho: 0.48,
      alto: 0.22,
      accion: { tipo: 'enlace', url: e.href },
      dibujar: (c, w, h) => {
        marco(c, w, h);
        c.fillStyle = '#fff';
        c.textBaseline = 'middle';
        c.textAlign = 'center';
        c.font = `600 ${h * 0.24}px ${SANS}`;
        c.fillText(e.label, w / 2, h / 2);
      },
    });
  });

  for (const p of piezas) p.prof += INICIO;
  for (const s of secciones) if (s.id !== 'top') s.prof += INICIO;
  return { piezas, secciones, fondo: pContacto + INICIO + 2.0 };
}
