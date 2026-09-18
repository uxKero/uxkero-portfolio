import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CampoPuntos from './CampoPuntos';
import {
  CERTIFICACIONES,
  GUIAS,
  IDENTIDAD,
  MANIFIESTO,
  OFICIO,
  PRODUCTOS,
  TRABAJO,
  type Bi,
} from '../../editorial-content';

// ─────────────────────────────────────────────────────────────────────────────
// UXK.OS1, el escritorio del oficio. Cuatro bloques en las esquinas y uno
// principal al medio, apilados sobre un campo tramado, sin una sola sombra: la
// profundidad sale del orden de apilado y nada más.
//
// Cada bloque corre su propio loop, y ninguno es adorno: el reloj marca la hora
// real de Mar del Plata, la disponibilidad late, el planeador del Juego de la
// Vida corre de verdad y el inventario recorre los productos publicados. El
// central es el que importa: barre los cuatro grupos de oficio uno por uno y
// va mostrando lo que hay adentro.
//
// Las ventanas se arrastran de la barra de título y la que se toca pasa al
// frente. Dos detalles del arrastre que había que resolver: la posición se
// calcula contra el lienzo y no contra la ventana del navegador, porque si no
// el bloque salta lejos en el primer movimiento; y al soltar vuelve a su sitio
// con una transición, no de golpe.
// ─────────────────────────────────────────────────────────────────────────────

type L = 'es' | 'en';

const TXT = {
  disponible: { es: 'Disponible', en: 'Available' },
  remoto: { es: 'Roles remotos', en: 'Remote roles' },
  enVivo: { es: 'En vivo', en: 'Live' },
  publicados: { es: 'Publicados', en: 'Shipped' },
  credenciales: { es: 'Credenciales', en: 'Credentials' },
  capacidades: { es: 'Capacidades por grupo', en: 'Capabilities per group' },
  vida: { es: 'Juego de la Vida', en: 'Game of Life' },
  arrastrar: {
    es: 'Las ventanas se arrastran. La que se toca pasa al frente.',
    en: 'Drag the windows. The one you touch comes to the front.',
  },
  leyendo: { es: 'Leyendo', en: 'Reading' },
  modulos: { es: 'módulos', en: 'modules' },
  activo: { es: 'Activo', en: 'Active' },
} satisfies Record<string, Bi>;

/** Nombre corto de cada grupo de oficio, para el rótulo grande del central. */
const SIGLA = ['PROD', 'AGENT', 'BUILD', 'OPS'];

// Sitio de cada bloque, en porcentaje del lienzo. Las esquinas son esquinas de
// verdad; el central queda por delante de todos.
interface Sitio {
  ancho: number;
  /** Distancia en píxeles desde el borde que corresponda. */
  izq?: number;
  der?: number;
  arr?: number;
  aba?: number;
}

// Cada bloque se ancla al borde que le toca. Los de las esquinas se miden
// desde su propia esquina, así el aire es el mismo en las cuatro: con todo
// posicionado desde arriba a la izquierda, el margen de la derecha depende del
// ancho de cada ventana y quedan desparejas.
const SITIOS: Record<string, Sitio> = {
  estado: { izq: 34, arr: 30, ancho: 216 },
  reloj: { der: 34, arr: 30, ancho: 228 },
  inventario: { izq: 34, aba: 30, ancho: 234 },
  vida: { der: 34, aba: 30, ancho: 166 },
  // La cascada que asoma por detrás del principal, como en el original.
  lectura: { izq: 130, arr: 170, ancho: 232 },
  casas: { izq: 330, arr: 108, ancho: 218 },
  guias: { izq: 580, arr: 180, ancho: 218 },
  // Y el principal, siempre al frente.
  craft: { izq: 224, arr: 280, ancho: 520 },
};

interface PropsVentana {
  titulo: string;
  sitio: Sitio;
  caja: { w: number; h: number };
  z: number;
  alFrente: () => void;
  /**
   * El cuerpo. Las cuatro esquinas van en 'marca', sin blanco; la cascada en
   * grises variados; el principal en papel.
   */
  tono?: 'marca' | 'cromo' | 'campo' | 'papel';
  children: React.ReactNode;
}

/** Ventana arrastrable: barra maciza, filete de 1px y ningún bisel. */
const Ventana: React.FC<PropsVentana> = ({
  titulo,
  sitio,
  caja,
  z,
  alFrente,
  tono = 'cromo',
  children,
}) => {
  const raiz = useRef<HTMLDivElement>(null);
  const [corrido, setCorrido] = useState<{ x: number; y: number } | null>(null);
  const [volviendo, setVolviendo] = useState(false);
  const [alto, setAlto] = useState(0);
  const arrastre = useRef<{ dx: number; dy: number } | null>(null);

  // Para anclar abajo hace falta el alto propio, que solo se sabe una vez
  // montado y cambia con el contenido de cada loop.
  useEffect(() => {
    const nodo = raiz.current;
    if (!nodo) return;
    const medir = () => setAlto(nodo.getBoundingClientRect().height);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(nodo);
    return () => obs.disconnect();
  }, []);

  const origen = {
    x: sitio.der !== undefined ? caja.w - sitio.der - sitio.ancho : (sitio.izq ?? 0),
    y: sitio.aba !== undefined ? caja.h - sitio.aba - alto : (sitio.arr ?? 0),
  };

  useEffect(() => {
    const mover = (e: PointerEvent) => {
      const a = arrastre.current;
      const lienzo = raiz.current?.parentElement;
      if (!a || !lienzo) return;
      // Contra el lienzo, no contra la ventana del navegador: con coordenadas
      // de pantalla el bloque salta lejos en el primer movimiento.
      const r = lienzo.getBoundingClientRect();
      setCorrido({ x: e.clientX - r.left - a.dx, y: e.clientY - r.top - a.dy });
    };
    const soltar = () => {
      if (!arrastre.current) return;
      arrastre.current = null;
      // Vuelve a su sitio con transición, no de golpe.
      setVolviendo(true);
      setCorrido(null);
      window.setTimeout(() => setVolviendo(false), 460);
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
    return () => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
    };
  }, []);

  const tomar = (e: React.PointerEvent) => {
    alFrente();
    const nodo = raiz.current;
    const lienzo = nodo?.parentElement;
    if (!nodo || !lienzo) return;
    const r = nodo.getBoundingClientRect();
    arrastre.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    setVolviendo(false);
    setCorrido({ x: r.left - lienzo.getBoundingClientRect().left, y: r.top - lienzo.getBoundingClientRect().top });
  };

  const pos = corrido ?? origen;

  return (
    <div
      ref={raiz}
      className={`ts-win ts-win--${tono}${volviendo ? ' is-volviendo' : ''}`}
      style={{ left: pos.x, top: pos.y, zIndex: z, width: sitio.ancho }}
      onPointerDown={alFrente}
    >
      <div className="ts-win__cab" onPointerDown={tomar}>
        <span>{titulo}</span>
        <span className="ts-win__botones" aria-hidden="true">
          <i />
          <i />
        </span>
      </div>
      <div className="ts-win__cuerpo">{children}</div>
    </div>
  );
};

/** Disponibilidad, con el punto que late. */
const Estado: React.FC<{ idioma: L }> = ({ idioma: L }) => (
  <div className="ts-widget">
    <p className="ts-widget__linea">
      <i className="ts-latido" aria-hidden="true" />
      {TXT.disponible[L]}
    </p>
    <p className="ts-widget__linea">{TXT.remoto[L]}</p>
    <p className="ts-widget__linea">{IDENTIDAD.lugar[L]}</p>
    <p className="ts-widget__linea">UTC-3</p>
  </div>
);

/** Reloj de pared: la hora real, que es el dato más barato y más vivo. */
const Reloj: React.FC<{ idioma: L }> = ({ idioma }) => {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setAhora(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const dos = (n: number) => String(n).padStart(2, '0');
  const fecha = ahora.toLocaleDateString(idioma === 'es' ? 'es-AR' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="ts-widget">
      <p className="ts-widget__linea ts-widget__fecha">{fecha}</p>
      <p className="ts-widget__reloj">
        {dos(ahora.getHours())}:{dos(ahora.getMinutes())}:{dos(ahora.getSeconds())}
      </p>
    </div>
  );
};

/** Inventario: recorre los productos publicados, uno cada tres segundos. */
const Inventario: React.FC<{ idioma: L }> = ({ idioma: L }) => {
  const vivos = useMemo(() => PRODUCTOS.filter((p) => p.activo), []);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((k) => (k + 1) % vivos.length), 3000);
    return () => window.clearInterval(t);
  }, [vivos.length]);

  const p = vivos[i];

  return (
    <div className="ts-widget">
      <p className="ts-widget__linea">
        {TXT.publicados[L]} {String(vivos.length).padStart(2, '0')}
      </p>
      <p className="ts-widget__destacado">{p.nombre}</p>
      <p className="ts-widget__linea">{p.estado[L]}</p>
      <div className="ts-widget__marcas" aria-hidden="true">
        {vivos.map((q, k) => (
          <i key={q.slug} className={k === i ? 'is-activa' : undefined} />
        ))}
      </div>
    </div>
  );
};

const LADO = 11;

/** Un planeador en una grilla toroidal. Corre de verdad y se puede dibujar. */
const semilla = () => {
  const g = Array.from({ length: LADO }, () => Array<boolean>(LADO).fill(false));
  [
    [0, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ].forEach(([f, c]) => {
    g[f][c] = true;
  });
  return g;
};

const Vida: React.FC<{ idioma: L }> = ({ idioma }) => {
  const [grilla, setGrilla] = useState(semilla);

  useEffect(() => {
    const t = window.setInterval(() => {
      setGrilla((g) =>
        g.map((fila, f) =>
          fila.map((viva, c) => {
            let vecinas = 0;
            for (let df = -1; df <= 1; df++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (df === 0 && dc === 0) continue;
                if (g[(f + df + LADO) % LADO][(c + dc + LADO) % LADO]) vecinas++;
              }
            }
            return vecinas === 3 || (viva && vecinas === 2);
          }),
        ),
      );
    }, 420);
    return () => window.clearInterval(t);
  }, []);

  const tocar = (f: number, c: number) =>
    setGrilla((g) => g.map((fila, i) => fila.map((v, j) => (i === f && j === c ? !v : v))));

  return (
    <div className="ts-widget">
      <div className="ts-vida__grilla">
        {grilla.map((fila, f) =>
          fila.map((viva, c) => (
            <button
              key={`${f}-${c}`}
              className={viva ? 'is-viva' : undefined}
              onClick={() => tocar(f, c)}
              aria-label={`${f + 1}, ${c + 1}`}
            />
          )),
        )}
      </div>
      <p className="ts-widget__linea">{TXT.vida[idioma]}</p>
    </div>
  );
};

/** Readme: el manifiesto, una frase por vez. */
const Lectura: React.FC<{ idioma: L }> = ({ idioma: L }) => {
  const frases = MANIFIESTO.parrafos[L];
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((k) => (k + 1) % frases.length), 6000);
    return () => window.clearInterval(t);
  }, [frases.length]);

  return (
    <div className="ts-widget">
      <p className="ts-widget__parrafo">{frases[i]}</p>
      <div className="ts-widget__marcas" aria-hidden="true">
        {frases.map((f, k) => (
          <i key={f.slice(0, 12)} className={k === i ? 'is-activa' : undefined} />
        ))}
      </div>
    </div>
  );
};

/** Las casas donde trabaja hoy, una por vez. */
const Casas: React.FC<{ idioma: L }> = ({ idioma: L }) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((k) => (k + 1) % TRABAJO.length), 3400);
    return () => window.clearInterval(t);
  }, []);

  const t = TRABAJO[i];

  return (
    <div className="ts-widget">
      <p className="ts-widget__destacado">{t.org}</p>
      <p className="ts-widget__linea">{t.rol[L]}</p>
      <p className="ts-widget__linea">
        <i className="ts-latido" aria-hidden="true" />
        {t.estado[L]}
      </p>
    </div>
  );
};

/** Las guías, con su cantidad de módulos. */
const Guias: React.FC<{ idioma: L }> = ({ idioma: L }) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((k) => (k + 1) % GUIAS.length), 4200);
    return () => window.clearInterval(t);
  }, []);

  const g = GUIAS[i];

  return (
    <div className="ts-widget">
      <p className="ts-widget__destacado">{g.titulo}</p>
      <p className="ts-widget__linea">{g.meta[L]}</p>
      <div className="ts-widget__marcas" aria-hidden="true">
        {GUIAS.map((q, k) => (
          <i key={q.href} className={k === i ? 'is-activa' : undefined} />
        ))}
      </div>
    </div>
  );
};

/**
 * El bloque principal: barre los cuatro grupos de oficio, uno cada cuatro
 * segundos, y mientras va listando lo que hay adentro. Las barras comparan el
 * peso de cada grupo, que es el dato real de la sección.
 */
const Craft: React.FC<{ idioma: L }> = ({ idioma: L }) => {
  const maxItems = useMemo(() => Math.max(...OFICIO.map((g) => g.items.length)), []);
  const [foco, setFoco] = useState(0);
  const [cuantos, setCuantos] = useState(0);

  useEffect(() => {
    const paso = window.setInterval(() => {
      setFoco((f) => (f + 1) % OFICIO.length);
      setCuantos(0);
    }, 4400);
    return () => window.clearInterval(paso);
  }, []);

  useEffect(() => {
    setCuantos(0);
    const total = OFICIO[foco].items.length;
    const t = window.setInterval(() => {
      setCuantos((c) => (c >= total ? c : c + 1));
    }, 220);
    return () => window.clearInterval(t);
  }, [foco]);

  return (
    <div className="ts-craft">
      <p className="ts-craft__nota">{TXT.capacidades[L]}</p>

      {OFICIO.map((g, i) => (
        <div className={`ts-barra${i === foco ? ' is-foco' : ''}`} key={g.titulo.en}>
          <span className="ts-marcador">{SIGLA[i]}</span>
          <span className="ts-barra__pista">
            <i
              className="ts-barra__relleno"
              style={{ width: `${(g.items.length / maxItems) * 100}%` }}
            />
          </span>
          <span className="ts-barra__valor">{String(g.items.length).padStart(2, '0')}</span>
        </div>
      ))}

      <div className="ts-craft__lectura">
        <p className="ts-craft__titulo">
          {TXT.leyendo[L]} {'›'} {OFICIO[foco].titulo[L]}
        </p>
        <div className="ts-craft__chips">
          {OFICIO[foco].items.slice(0, cuantos).map((it) => (
            <span key={it.en}>
              <i aria-hidden="true">+</i>
              {it[L]}
            </span>
          ))}
        </div>
      </div>

      <div className="ts-craft__pie">
        <span className="ts-marcador">
          {TXT.credenciales[L]} {String(CERTIFICACIONES.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

const Escritorio: React.FC<{ idioma: L }> = ({ idioma: L }) => {
  const lienzo = useRef<HTMLDivElement>(null);
  const [orden, setOrden] = useState<string[]>([]);
  const [caja, setCaja] = useState({ w: 1100, h: 620 });

  useEffect(() => {
    const nodo = lienzo.current;
    if (!nodo) return;
    const medir = () => {
      const r = nodo.getBoundingClientRect();
      setCaja({ w: r.width, h: r.height });
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(nodo);
    return () => obs.disconnect();
  }, []);

  const alFrente = useCallback(
    (id: string) => () => setOrden((o) => [...o.filter((k) => k !== id), id]),
    [],
  );

  const z = (id: string, base: number) => {
    const i = orden.indexOf(id);
    return i === -1 ? base : 40 + i;
  };

  return (
    <div className="ts-escritorio">
      <span className="ts-rotulo">UXK.OS1</span>

      <div className="ts-escritorio__lienzo" ref={lienzo}>
        <CampoPuntos />
        <Ventana
          titulo="Status 1.0"
          sitio={SITIOS.estado}
          caja={caja}
          z={z('estado', 10)}
          alFrente={alFrente('estado')}
          tono="marca"
        >
          <Estado idioma={L} />
        </Ventana>

        <Ventana
          titulo="Clock Tool 1.1"
          sitio={SITIOS.reloj}
          caja={caja}
          z={z('reloj', 11)}
          alFrente={alFrente('reloj')}
          tono="marca"
        >
          <Reloj idioma={L} />
        </Ventana>

        <Ventana
          titulo="Shipped 1.2"
          sitio={SITIOS.inventario}
          caja={caja}
          z={z('inventario', 12)}
          alFrente={alFrente('inventario')}
          tono="marca"
        >
          <Inventario idioma={L} />
        </Ventana>

        <Ventana
          titulo="Glider 1.1"
          sitio={SITIOS.vida}
          caja={caja}
          z={z('vida', 13)}
          alFrente={alFrente('vida')}
          tono="marca"
        >
          <Vida idioma={L} />
        </Ventana>

        <Ventana
          titulo="Readme.txt"
          sitio={SITIOS.lectura}
          caja={caja}
          z={z('lectura', 20)}
          alFrente={alFrente('lectura')}
          tono="papel"
        >
          <Lectura idioma={L} />
        </Ventana>

        <Ventana
          titulo="Work.log"
          sitio={SITIOS.casas}
          caja={caja}
          z={z('casas', 21)}
          alFrente={alFrente('casas')}
          tono="cromo"
        >
          <Casas idioma={L} />
        </Ventana>

        <Ventana
          titulo="Guides 2.0"
          sitio={SITIOS.guias}
          caja={caja}
          z={z('guias', 22)}
          alFrente={alFrente('guias')}
          tono="campo"
        >
          <Guias idioma={L} />
        </Ventana>

        <Ventana
          titulo="UXK.Craft"
          sitio={SITIOS.craft}
          caja={caja}
          z={z('craft', 30)}
          alFrente={alFrente('craft')}
          tono="papel"
        >
          <Craft idioma={L} />
        </Ventana>
      </div>

      <p className="ts-escritorio__aviso">{TXT.arrastrar[L]}</p>
    </div>
  );
};

export default Escritorio;
