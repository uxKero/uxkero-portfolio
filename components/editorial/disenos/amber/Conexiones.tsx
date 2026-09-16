import React, { useEffect, useRef, useState } from 'react';
import { escucharCaja, type CajaHeroe } from './senal';
import { useEscalaDeLectura } from './escalaLectura';

// ─────────────────────────────────────────────────────────────────────────────
// Capa de anotación de la página entera. Una espina corre por el margen
// izquierdo desde la caja de la portada hasta el contacto; de ella salen ramas a
// cada sección, fila y tarjeta, y lo que comparte renglón se encadena de
// costado. La espina se enciende con la lectura. Al pasar por un elemento
// aparece su caja con coordenadas vivas y una señal sube por su ruta hasta la
// portada. Las líneas solo corren por márgenes y huecos: nunca cruzan texto.
// ─────────────────────────────────────────────────────────────────────────────

type R = { x: number; y: number; w: number; h: number };

interface Pieza {
  /** Elemento que recibe el hover. */
  host: string;
  /** Parte del host a la que llega la conexión; se mide el texto, no la caja. */
  ancla?: string;
  /** Qué se enmarca: el ancla, el host entero o nada (solo nodo). */
  caja: 'ancla' | 'host' | 'nada';
  margen: number;
  /** La etiqueta va adentro del marco cuando el marco toca a sus vecinos. */
  dentro?: boolean;
  /** Marcos visibles siempre, no solo al pasar. */
  fija?: 'todas' | 'primera';
}

// Cada grupo se encadena en orden: lo que comparte renglón con el anterior se
// conecta de costado; el resto baja directo de la espina.
const GRUPOS: Pieza[][] = [
  [{ host: '.ed-dato', ancla: '.ed-dato__cifra', caja: 'ancla', margen: 6, fija: 'todas' }],
  [{ host: '#perfil .ed-sec__head', ancla: '.ed-sec__n', caja: 'nada', margen: 0 }],
  [
    { host: '#perfil .ed-manifiesto h2', ancla: 'span', caja: 'ancla', margen: 8 },
    { host: '#perfil .ed-retrato', caja: 'host', margen: 10, fija: 'todas' },
  ],
  [{ host: '#trabajo .ed-sec__head', ancla: '.ed-sec__n', caja: 'nada', margen: 0 }],
  [{ host: '.ed-puesto', ancla: '.ed-puesto__n', caja: 'host', margen: 0, dentro: true }],
  [{ host: '#productos .ed-sec__head', ancla: '.ed-sec__n', caja: 'nada', margen: 0 }],
  [{ host: '.ed-destacado', ancla: 'h3', caja: 'host', margen: 0, dentro: true }],
  [{ host: '.ed-producto', ancla: 'h3', caja: 'host', margen: 0, dentro: true }],
  [{ host: '#oficio .ed-sec__head', ancla: '.ed-sec__n', caja: 'nada', margen: 0 }],
  [{ host: '.ed-oficio__col', ancla: 'h3', caja: 'host', margen: 12 }],
  [{ host: '#estudios .ed-sec__head', ancla: '.ed-sec__n', caja: 'nada', margen: 0 }],
  [{ host: '.ed-cert', ancla: '.ed-cert__nombre', caja: 'host', margen: 0, dentro: true }],
  [{ host: '#guias .ed-sec__head', ancla: '.ed-sec__n', caja: 'nada', margen: 0 }],
  [{ host: '.ed-guia', ancla: 'h3', caja: 'host', margen: 0, dentro: true }],
  [{ host: '.ed-contacto .ed-eyebrow', caja: 'nada', margen: 0 }],
  [{ host: '.ed-contacto__mail', caja: 'ancla', margen: 8, fija: 'todas' }],
];

interface Nodo {
  id: string;
  host: HTMLElement;
  tipo: 'rama' | 'cadena';
  /** Tramo de conexión propio. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Altura sobre la espina: decide si ya se encendió. */
  yEspina: number;
  ancla: R;
  caja: R | null;
  dentro: boolean;
  margen: number;
  fija: boolean;
  claro: boolean;
  seccion: boolean;
  /** Tramos desde el elemento hasta la espina, para la señal. Van sueltos: la
   *  señal salta el texto que hay entre un eslabón y el siguiente. */
  ruta: [number, number, number, number][];
}

interface Geo {
  ancho: number;
  alto: number;
  espina: number;
  nodos: Nodo[];
}

const AMBAR = '#FF9C00';
const NUCLEO = '#FFFFD6';
const TINTA_AMBAR = '#8A4300';
const APAGADO = '#3D3630';
const SOBRE = '#141414';
const ANCHO_CARACTER = 6.6;

const rectTexto = (el: Element, raiz: DOMRect): R => {
  const rango = document.createRange();
  rango.selectNodeContents(el);
  const t = rango.getBoundingClientRect();
  const r = t.width > 0 ? t : el.getBoundingClientRect();
  return { x: r.left - raiz.left, y: r.top - raiz.top, w: r.width, h: r.height };
};

const rectCaja = (el: Element, raiz: DOMRect): R => {
  const r = el.getBoundingClientRect();
  return { x: r.left - raiz.left, y: r.top - raiz.top, w: r.width, h: r.height };
};

const medir = (raiz: HTMLElement): Geo => {
  const base = raiz.getBoundingClientRect();
  const primera = raiz.querySelector('.ed-sec__n');
  const margen = primera ? rectCaja(primera, base).x : 72;
  const espina = Math.round(Math.max(10, margen - 36)) + 0.5;
  const contacto = raiz.querySelector('.ed-contacto');
  const claroDesde = contacto ? rectCaja(contacto, base).y : Infinity;

  const nodos: Nodo[] = [];
  GRUPOS.forEach((grupo, g) => {
    let previo: Nodo | null = null;
    let indice = 0;
    grupo.forEach((pieza) => {
      raiz.querySelectorAll<HTMLElement>(pieza.host).forEach((host) => {
        const anclaEl = pieza.ancla ? host.querySelector(pieza.ancla) : host;
        if (!anclaEl) return;
        const ancla = pieza.ancla || pieza.caja === 'ancla' ? rectTexto(anclaEl, base) : rectCaja(host, base);
        if (ancla.w === 0 || ancla.h === 0) return;
        const hostR = rectCaja(host, base);
        const caja = pieza.caja === 'nada' ? null : pieza.caja === 'host' ? hostR : ancla;
        const cy = Math.round(ancla.y + ancla.h / 2) + 0.5;
        const fija = pieza.fija === 'todas' || (pieza.fija === 'primera' && indice === 0);
        // Los tramos llegan al marco si está siempre visible; si no, al texto.
        const hasta = fija && caja ? caja.x - pieza.margen - 4 : ancla.x - 12;

        let nodo: Nodo;
        const p: Nodo | null = previo;
        const mismoRenglon =
          p !== null && ancla.x > p.ancla.x + p.ancla.w && p.y1 >= hostR.y && p.y1 <= hostR.y + hostR.h;

        if (p && mismoRenglon) {
          const y = p.y1;
          const desde = p.fija && p.caja ? p.caja.x + p.caja.w + p.margen + 4 : p.ancla.x + p.ancla.w + 12;
          nodo = {
            id: `${g}-${indice}`,
            host,
            tipo: 'cadena',
            x1: desde,
            y1: y,
            x2: hasta,
            y2: y,
            yEspina: p.yEspina,
            ancla,
            caja,
            dentro: !!pieza.dentro,
            margen: pieza.margen,
            fija,
            claro: y >= claroDesde,
            seccion: false,
            ruta: [[hasta, y, desde, y], ...p.ruta],
          };
        } else {
          nodo = {
            id: `${g}-${indice}`,
            host,
            tipo: 'rama',
            x1: espina,
            y1: cy,
            x2: hasta,
            y2: cy,
            yEspina: cy,
            ancla,
            caja,
            dentro: !!pieza.dentro,
            margen: pieza.margen,
            fija,
            claro: cy >= claroDesde,
            seccion: pieza.caja === 'nada',
            ruta: [[hasta, cy, espina, cy]],
          };
        }
        if (nodo.x2 - nodo.x1 > 6) nodos.push(nodo);
        previo = nodo;
        indice++;
      });
    });
  });

  // El alto sale de la caja y no de scrollHeight: la capa no puede ser más alta
  // que la página, o la raíz se vuelve un contenedor con scroll propio.
  return { ancho: Math.floor(base.width), alto: Math.floor(base.height), espina, nodos };
};

const Etiqueta: React.FC<{ x: number; y: number; texto: string }> = ({ x, y, texto }) => {
  const w = Math.round(texto.length * ANCHO_CARACTER + 12);
  return (
    <g>
      <rect x={Math.round(x)} y={Math.round(y)} width={w} height={16} fill={AMBAR} />
      <text
        x={Math.round(x) + 6}
        y={Math.round(y) + 11.5}
        fill={SOBRE}
        className="am-capa__texto"
      >
        {texto}
      </text>
    </g>
  );
};

const Conexiones: React.FC<{ idioma: string }> = ({ idioma }) => {
  const svg = useRef<SVGSVGElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [foco, setFoco] = useState<{ id: string; x: number; y: number } | null>(null);
  const [lectura, setLectura] = useState(0);
  const [heroe, setHeroe] = useState<CajaHeroe | null>(null);

  useEffect(() => escucharCaja(setHeroe), []);
  useEscalaDeLectura(svg);

  // Medición y hover. Se vuelve a medir cuando cambia el alto de la página.
  useEffect(() => {
    const raiz = svg.current?.parentElement;
    if (!raiz) return;
    let quitar: (() => void)[] = [];
    let pedido = 0;
    let temporizador = 0;
    const conPuntero = window.matchMedia('(hover: hover)').matches;

    const armar = () => {
      temporizador = 0;
      quitar.forEach((f) => f());
      quitar = [];
      const g = medir(raiz);
      setGeo(g);
      if (!conPuntero) return;

      g.nodos.forEach((n) => {
        const mover = (ev: PointerEvent) => {
          const base = raiz.getBoundingClientRect();
          const x = ev.clientX - base.left;
          const y = ev.clientY - base.top;
          if (pedido) cancelAnimationFrame(pedido);
          pedido = requestAnimationFrame(() => {
            pedido = 0;
            setFoco({ id: n.id, x, y });
          });
        };
        const salir = () => {
          if (pedido) cancelAnimationFrame(pedido);
          pedido = 0;
          setFoco((f) => (f?.id === n.id ? null : f));
        };
        n.host.addEventListener('pointermove', mover);
        n.host.addEventListener('pointerleave', salir);
        quitar.push(() => {
          n.host.removeEventListener('pointermove', mover);
          n.host.removeEventListener('pointerleave', salir);
        });
      });

      // Los renglones de acento leen la coordenada del puntero mientras está encima.
      raiz.querySelectorAll<HTMLElement>('.ed-acento').forEach((el) => {
        const mover = (ev: PointerEvent) => {
          const base = raiz.getBoundingClientRect();
          el.dataset.coord = `${Math.round(ev.clientX - base.left)}, ${Math.round(ev.clientY - base.top)}`;
        };
        const salir = () => {
          const r = el.getBoundingClientRect();
          el.dataset.coord = `${Math.round(r.left)}, ${Math.round(r.top + window.scrollY)}`;
        };
        el.addEventListener('pointermove', mover);
        el.addEventListener('pointerleave', salir);
        quitar.push(() => {
          el.removeEventListener('pointermove', mover);
          el.removeEventListener('pointerleave', salir);
        });
      });
    };

    const pedirArmado = () => {
      if (temporizador) window.clearTimeout(temporizador);
      temporizador = window.setTimeout(armar, 80);
    };

    const ro = new ResizeObserver(pedirArmado);
    ro.observe(raiz);
    document.fonts?.ready.then(pedirArmado);
    armar();

    return () => {
      ro.disconnect();
      quitar.forEach((f) => f());
      if (pedido) cancelAnimationFrame(pedido);
      if (temporizador) window.clearTimeout(temporizador);
    };
  }, [idioma]);

  // Lectura: la espina se enciende hasta el 55% de la pantalla.
  useEffect(() => {
    let pedido = 0;
    const medirLectura = () => {
      pedido = 0;
      const raiz = svg.current?.parentElement;
      if (!raiz) return;
      setLectura(window.innerHeight * 0.55 - raiz.getBoundingClientRect().top);
      // El riel solo necesita fondo propio cuando tiene la zona clara detrás.
      const contacto = raiz.querySelector('.ed-contacto');
      const riel = document.querySelector('.ed-riel');
      if (contacto && riel) {
        const claro = contacto.getBoundingClientRect().top < riel.getBoundingClientRect().bottom + 24;
        if (claro) raiz.dataset.rielClaro = '';
        else delete raiz.dataset.rielClaro;
      }
    };
    const alScroll = () => {
      if (!pedido) pedido = requestAnimationFrame(medirLectura);
    };
    medirLectura();
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alScroll);
    return () => {
      delete svg.current?.parentElement?.dataset.rielClaro;
      window.removeEventListener('scroll', alScroll);
      window.removeEventListener('resize', alScroll);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);

  if (!geo || geo.nodos.length === 0) return <svg ref={svg} className="am-capa" aria-hidden="true" />;

  const { espina, nodos } = geo;
  const heroeY = heroe ? Math.round(heroe.y + heroe.h / 2) + 0.5 : null;
  const arriba = heroeY ?? nodos[0].yEspina;
  const abajo = nodos[nodos.length - 1].yEspina;
  const encendidaHasta = Math.min(abajo, Math.max(arriba, lectura));
  const enfocado = foco ? nodos.find((n) => n.id === foco.id) ?? null : null;

  const colorTramo = (n: Nodo) => {
    if (enfocado?.id === n.id) return n.claro ? TINTA_AMBAR : NUCLEO;
    return n.yEspina <= lectura ? AMBAR : APAGADO;
  };

  const tramosFoco = enfocado
    ? [...enfocado.ruta, [espina, enfocado.yEspina, espina, arriba] as [number, number, number, number]]
    : [];

  return (
    <svg
      ref={svg}
      className="am-capa"
      width={geo.ancho}
      height={geo.alto}
      viewBox={`0 0 ${geo.ancho} ${geo.alto}`}
      aria-hidden="true"
    >
      {/* Espina: apagada entera y encendida hasta donde se leyó */}
      <line x1={espina} y1={arriba} x2={espina} y2={abajo} stroke={APAGADO} />
      <line x1={espina} y1={arriba} x2={espina} y2={encendidaHasta} stroke={AMBAR} className="am-capa__viva" />
      <rect x={espina - 3.5} y={encendidaHasta - 3} width={7} height={7} fill={NUCLEO} className="am-capa__cabeza" />

      {/* Rama de la portada: sigue a la caja cuando se mueve */}
      {heroe && heroeY !== null && heroe.x - 8 > espina + 6 && (
        <g>
          <line
            x1={espina}
            y1={heroeY}
            x2={Math.round(heroe.x) - 6}
            y2={heroeY}
            stroke={heroe.activa ? NUCLEO : AMBAR}
          />
          <rect x={espina - 2.5} y={heroeY - 2.5} width={5} height={5} fill={heroe.activa ? NUCLEO : AMBAR} />
          {heroe.activa && (
            <line x1={espina} y1={heroeY} x2={espina} y2={abajo} stroke={NUCLEO} className="am-capa__senal am-capa__senal--baja" />
          )}
        </g>
      )}

      {nodos.map((n) => {
        const color = colorTramo(n);
        const enFoco = enfocado?.id === n.id;
        return (
          <g key={n.id}>
            <line x1={n.x1} y1={n.y1} x2={n.x2} y2={n.y2} stroke={color} />
            {/* Tope en el extremo que toca al elemento */}
            <line x1={n.x2} y1={n.y2 - 3} x2={n.x2} y2={n.y2 + 4} stroke={color} />
            {n.tipo === 'rama' ? (
              <rect
                x={espina - (n.seccion ? 3.5 : 2.5)}
                y={n.y1 - (n.seccion ? 3 : 2)}
                width={n.seccion ? 7 : 5}
                height={n.seccion ? 7 : 5}
                fill={enFoco ? color : n.yEspina <= lectura ? AMBAR : n.claro ? '#FDFCF4' : '#141414'}
                stroke={color}
              />
            ) : (
              <line x1={n.x1} y1={n.y1 - 3} x2={n.x1} y2={n.y1 + 4} stroke={color} />
            )}
            {n.seccion && (
              <text
                x={espina - 8}
                y={n.y1 + 3.5}
                textAnchor="end"
                className="am-capa__regla"
                fill={n.yEspina <= lectura ? (n.claro ? TINTA_AMBAR : AMBAR) : n.claro ? '#5C544C' : '#9C9084'}
              >
                {Math.round(n.y1)}
              </text>
            )}
          </g>
        );
      })}

      {/* Marcos: los fijos siempre, el resto al pasar */}
      {nodos.map((n) => {
        if (!n.caja || !(n.fija || enfocado?.id === n.id)) return null;
        const enFoco = enfocado?.id === n.id && foco;
        const m = n.margen;
        const cx = n.caja.x + n.caja.w / 2;
        const cy = n.caja.y + n.caja.h / 2;
        // Imán: el marco se corre apenas hacia el puntero.
        const dx = enFoco ? Math.max(-6, Math.min(6, (foco.x - cx) * 0.04)) : 0;
        const dy = enFoco ? Math.max(-6, Math.min(6, (foco.y - cy) * 0.04)) : 0;
        const abrir = enFoco ? 4 : 0;
        const x = Math.round(n.caja.x - m - abrir + dx) + 0.5;
        const y = Math.round(n.caja.y - m - abrir + dy) + 0.5;
        const w = Math.round(n.caja.w + 2 * (m + abrir));
        const h = Math.round(n.caja.h + 2 * (m + abrir));
        const trazo = enFoco ? (n.claro ? TINTA_AMBAR : NUCLEO) : AMBAR;
        const texto = enFoco
          ? `${Math.round(foco.x)}, ${Math.round(foco.y)}`
          : `${Math.round(n.caja.x)}, ${Math.round(n.caja.y)}`;
        const medida = `${Math.round(n.caja.w)} x ${Math.round(n.caja.h)}`;
        return (
          <g key={`caja-${n.id}`} className={enFoco ? 'am-capa__marco is-foco' : 'am-capa__marco'}>
            <rect x={x} y={y} width={w} height={h} fill="none" stroke={trazo} />
            {n.dentro ? (
              <Etiqueta x={x + 1} y={y + 1} texto={texto} />
            ) : (
              <Etiqueta x={x - 0.5} y={y - 16} texto={texto} />
            )}
            {enFoco && (
              <Etiqueta
                x={x + w - Math.round(medida.length * ANCHO_CARACTER + 12) + (n.dentro ? -1 : 0.5)}
                y={n.dentro ? y + h - 17 : y + h}
                texto={medida}
              />
            )}
          </g>
        );
      })}

      {/* Señal que sube desde el elemento hasta la portada */}
      {tramosFoco.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={enfocado?.claro && y1 >= (enfocado?.yEspina ?? 0) - 1 ? TINTA_AMBAR : NUCLEO}
          strokeWidth={1.5}
          className="am-capa__senal"
        />
      ))}
    </svg>
  );
};

export default Conexiones;
