import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Bi } from './editorial-content';

// ─────────────────────────────────────────────────────────────────────────────
// Diseños alternativos de la home. El editorial es el de la casa y no carga
// nada extra; cada alternativo trae su hoja y sus piezas en un módulo aparte,
// que se baja recién cuando alguien lo elige. Todo su CSS vive bajo
// .ed-root[data-diseno='id'], así que nunca pisa al editorial.
// ─────────────────────────────────────────────────────────────────────────────

export interface ModuloDiseno {
  /** Pieza que se monta dentro de la portada, detrás del hero. */
  Portada?: React.ComponentType<{ idioma: string }>;
  /** Capa que cubre la página entera, por encima del contenido. */
  Capa?: React.ComponentType<{ idioma: string }>;
  /** Agregado dentro de la lámina que sigue al puntero en los productos. */
  Lamina?: React.ComponentType<{ x: number; y: number; slug: string }>;
  /** Página entera propia, en lugar de la estructura editorial. */
  Pagina?: React.ComponentType<PropsPagina>;
  /** Transición propia al entrar: avisa cuando tapa la pantalla y cuando termina. */
  Entrada?: React.ComponentType<PropsEntrada>;
}

export interface PropsPagina {
  idioma: 'es' | 'en';
  alCambiarIdioma: () => void;
  /** El selector de diseños ya armado, para ubicarlo donde la página quiera. */
  selector: React.ReactNode;
}

export interface PropsEntrada {
  origen: { x: number; y: number };
  onCubierta: () => void;
  onFin: () => void;
}

interface EntradaEnCurso {
  Comp: React.ComponentType<PropsEntrada>;
  clave: number;
  origen: { x: number; y: number };
  cubierta: () => void;
}

export interface Diseno {
  id: string;
  nombre: string;
  descripcion: Bi;
  /** Tres colores que lo resumen, para la muestra del selector. */
  muestra: [string, string, string];
  /** Familia con la que se escribe su nombre en el selector. */
  familia: string;
  fuentes?: string;
  cargar?: () => Promise<ModuloDiseno>;
}

export const DISENOS: Diseno[] = [
  {
    id: 'editorial',
    nombre: 'Editorial',
    descripcion: { es: 'Papel, tinta y naranja', en: 'Paper, ink and orange' },
    muestra: ['#f4ebdd', '#151515', '#e84b17'],
    familia: "'Barlow Condensed', sans-serif",
  },
  {
    id: 'amber',
    nombre: 'Amber Thermal',
    descripcion: { es: 'Lectura térmica sobre fósforo ámbar', en: 'Thermal readout on amber phosphor' },
    muestra: ['#141414', '#FF9C00', '#FFFFD6'],
    familia: "'JetBrains Mono', ui-monospace, monospace",
    fuentes:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap',
    cargar: () => import('./disenos/amber/Amber'),
  },
  {
    id: 'brawl',
    nombre: 'Brawl Plate',
    descripcion: { es: 'Interfaz de juego, placas y recompensas', en: 'Game UI, plates and rewards' },
    muestra: ['#0249BB', '#EEC309', '#343C50'],
    familia: "'Lilita One', system-ui, sans-serif",
    fuentes:
      'https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@400;600;700;800;900&display=swap',
    cargar: () => import('./disenos/brawl/Brawl'),
  },
  {
    id: 'y2k',
    nombre: 'Y2K Chrome',
    descripcion: { es: 'Escritorio de fin de milenio, cromo y trama', en: 'Millennium desktop, chrome and halftone' },
    muestra: ['#1100FF', '#C0C0C0', '#FDB90E'],
    familia: "'Audiowide', system-ui, sans-serif",
    fuentes:
      'https://fonts.googleapis.com/css2?family=Audiowide&family=Syncopate:wght@400;700&family=VT323&family=Great+Vibes&display=swap',
    cargar: () => import('./disenos/y2k/Y2K'),
  },
  {
    id: 'hextech',
    nombre: 'Hextech Holo',
    descripcion: { es: 'Cliente de juego, oro y holograma', en: 'Game client, gold and hologram' },
    muestra: ['#010A13', '#C8AA6E', '#0AC8B9'],
    familia: "'Spectral SC', serif",
    fuentes:
      'https://fonts.googleapis.com/css2?family=Spectral+SC:wght@600;700&family=Anton&family=Barlow:wght@400;600;700&family=Chakra+Petch:wght@500&family=Great+Vibes&display=swap',
    cargar: () => import('./disenos/hextech/Hextech'),
  },
  {
    id: 'typesafe',
    nombre: 'TypeSafe',
    descripcion: { es: 'Plancha de imprenta, no pantalla', en: 'A press plate, not a screen' },
    muestra: ['#F386A1', '#3C2D31', '#ABBAB9'],
    familia: "'Inter Tight', system-ui, sans-serif",
    fuentes:
      'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=DotGothic16&display=swap',
    cargar: () => import('./disenos/typesafe/TypeSafe'),
  },
];

const CLAVE = 'uxkero:diseno';
const PARAMETRO = 'design';

const buscar = (id: string | null) => DISENOS.find((d) => d.id === id);

/** Pide las fuentes de un diseño una sola vez. */
export const pedirFuentes = (d: Diseno) => {
  if (!d.fuentes || typeof document === 'undefined') return;
  const id = `ed-fuentes-${d.id}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = d.fuentes;
  document.head.appendChild(link);
};

const leerInicial = () => {
  if (typeof window === 'undefined') return null;
  const url = new URLSearchParams(window.location.search).get(PARAMETRO);
  if (buscar(url)) return url;
  try {
    const guardado = window.localStorage.getItem(CLAVE);
    if (buscar(guardado)) return guardado;
  } catch {
    // Sin almacenamiento arranca el de la casa.
  }
  return null;
};

/**
 * El diseño activo. Solo se aplica cuando su módulo y sus fuentes ya están
 * listos, para que nunca se vea la página a medio vestir.
 */
export const useDiseno = () => {
  const [activo, setActivo] = useState<Diseno>(DISENOS[0]);
  const [modulo, setModulo] = useState<ModuloDiseno | null>(null);
  const [cargando, setCargando] = useState<string | null>(null);
  const [cambios, setCambios] = useState(0);
  const [entrada, setEntrada] = useState<EntradaEnCurso | null>(null);
  const pedido = useRef(0);
  const toque = useRef({ x: 0, y: 0 });

  // La transición nace donde se hizo clic.
  useEffect(() => {
    const anotar = (e: PointerEvent) => {
      toque.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointerdown', anotar, true);
    return () => window.removeEventListener('pointerdown', anotar, true);
  }, []);

  const aplicar = useCallback(async (id: string, anunciar: boolean) => {
    const d = buscar(id) ?? DISENOS[0];
    const turno = ++pedido.current;
    setCargando(d.id);

    let mod: ModuloDiseno | null = null;
    if (d.cargar) {
      pedirFuentes(d);
      const fuentes = document.fonts
        ? Promise.race([
            document.fonts.load(`500 16px ${d.familia}`),
            new Promise((r) => setTimeout(r, 1500)),
          ])
        : Promise.resolve();
      [mod] = await Promise.all([d.cargar(), fuentes]);
    }

    if (turno !== pedido.current) return;

    // Con transición propia, el cambio se hace recién cuando la pantalla está tapada.
    const Entrada = anunciar ? mod?.Entrada : undefined;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (Entrada && !quieto) {
      await new Promise<void>((cubierta) =>
        setEntrada({ Comp: Entrada, clave: turno, origen: toque.current, cubierta }),
      );
      if (turno !== pedido.current) return;
    }

    setModulo(mod);
    setActivo(d);
    setCargando(null);
    if (anunciar && !(Entrada && !quieto)) setCambios((n) => n + 1);

    try {
      if (d.id === DISENOS[0].id) window.localStorage.removeItem(CLAVE);
      else window.localStorage.setItem(CLAVE, d.id);
    } catch {
      // No se recuerda, pero se aplica igual.
    }

    const url = new URL(window.location.href);
    if (d.id === DISENOS[0].id) url.searchParams.delete(PARAMETRO);
    else url.searchParams.set(PARAMETRO, d.id);
    window.history.replaceState(window.history.state, '', url);
  }, []);

  useEffect(() => {
    const inicial = leerInicial();
    if (inicial && inicial !== DISENOS[0].id) aplicar(inicial, false);
  }, [aplicar]);

  const cambiar = useCallback((id: string) => aplicar(id, true), [aplicar]);
  const terminarEntrada = useCallback(() => setEntrada(null), []);

  return { activo, modulo, cargando, cambios, cambiar, entrada, terminarEntrada };
};
