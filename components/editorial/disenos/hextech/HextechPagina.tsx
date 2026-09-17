import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PropsPagina } from '../../disenos';
import {
  CERTIFICACIONES,
  CONTACTO,
  DATOS,
  GUIAS,
  HERO,
  IDENTIDAD,
  MANIFIESTO,
  OFICIO,
  PRODUCTOS,
  TRABAJO,
  type Bi,
  type Producto,
} from '../../editorial-content';
import { BarraLauncher, Glifo, PanelSocial } from './Launcher';
import { Emblema, Estandarte } from './Estandarte';
import {
  ARBOLES_RUNAS,
  ARTE,
  AVISO_RIOT,
  CAMPEON_POR_ORG,
  FONDO_SALA,
  ITEM_POR_PRODUCTO,
  LIGAS,
  campeonesAlAzar,
  carga,
  emblema,
  itemIcono,
  retratoCampeon,
  runaIcono,
} from './lol';

// ─────────────────────────────────────────────────────────────────────────────
// Hextech / Holo. El portfolio con la anatomía del cliente actual de League,
// sección por sección y a partir de las capturas reales:
//   Inicio     → pantalla de modos (lol1): opciones a la izquierda, evento al
//                centro sobre el wallpaper, botón de acción abajo a la derecha.
//   Colección  → tienda (lol2): subpestañas, destacado grande con páginas,
//                cuatro fichas, franja promocional y fila de productos.
//   Perfil     → perfil (lol5): estandarte con el emblema, arte central y la
//                fila de insignias con sus números.
//   Carrera    → lobby de grupo (lol3): estandartes en fila, el propio al
//                centro, progresión y botón de buscar partida.
//   Oficio     → colección de aspectos (lol4): contador circular, buscador y
//                grilla de cartas con marco dorado.
// El oro es marco, el teal es la acción y el crema es la información.
// ─────────────────────────────────────────────────────────────────────────────

type L = 'es' | 'en';

const PESTANA: Record<string, Bi> = {
  top: { es: 'Inicio', en: 'Home' },
  productos: { es: 'Colección', en: 'Collection' },
  perfil: { es: 'Perfil', en: 'Profile' },
  trabajo: { es: 'Carrera', en: 'Career' },
  oficio: { es: 'Oficio', en: 'Craft' },
  estudios: { es: 'Desafíos', en: 'Challenges' },
  guias: { es: 'Guías', en: 'Guides' },
  contacto: { es: 'Contacto', en: 'Contact' },
};

const ORDEN = ['top', 'productos', 'perfil', 'trabajo', 'oficio', 'estudios', 'guias', 'contacto'];
const WALLPAPER = '/hextech/alan-splash.webp';
const WALLPAPER_VIDEO = '/hextech/alan-splash.mp4';
const ROMANOS = ['I', 'II', 'III', 'IV', 'V'];
const dominio = (url: string) => url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

const APILADO = '(max-width: 900px), (hover: none)';

/** La pantalla abierta vive en el hash, así un enlace abre directo en esa pestaña. */
const usePantalla = () => {
  const leer = () => {
    const h = window.location.hash.slice(1);
    return ORDEN.includes(h) ? h : 'top';
  };
  const [activa, setActiva] = useState(leer);
  useEffect(() => {
    const alCambiar = () => setActiva(leer());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  const irA = useCallback((id: string) => {
    if (!ORDEN.includes(id)) return;
    const url = new URL(window.location.href);
    url.hash = id === 'top' ? '' : id;
    window.history.replaceState(window.history.state, '', url);
    setActiva(id);
    window.scrollTo({ top: 0 });
  }, []);
  return { activa, irA };
};

/** Cuántos elementos entran en la grilla sin salirse de la pantalla. */
const useCapacidad = (el: HTMLElement | null, anchoMin: number, altoMin: number, gapX: number, gapY: number) => {
  const [n, setN] = useState(Infinity);
  useLayoutEffect(() => {
    if (!el) return;
    const apilado = window.matchMedia(APILADO);
    const medir = () => {
      if (apilado.matches) return setN(Infinity);
      const { width, height } = el.getBoundingClientRect();
      const columnas = Math.max(1, Math.floor((width + gapX) / (anchoMin + gapX)));
      const filas = Math.max(1, Math.floor((height + gapY) / (altoMin + gapY)));
      setN(columnas * filas);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    apilado.addEventListener('change', medir);
    return () => {
      ro.disconnect();
      apilado.removeEventListener('change', medir);
    };
  }, [el, anchoMin, altoMin, gapX, gapY]);
  return n;
};

/** Paginador del cliente: flechas y números cuadrados. */
const Paginador: React.FC<{ total: number; actual: number; onCambiar: (i: number) => void; idioma: L }> = ({ total, actual, onCambiar, idioma }) =>
  total > 1 ? (
    <nav className="cl-paginador" aria-label={idioma === 'es' ? 'Páginas' : 'Pages'}>
      <button onClick={() => onCambiar(actual - 1)} disabled={actual === 0} aria-label={idioma === 'es' ? 'Anterior' : 'Previous'}>
        ‹
      </button>
      {Array.from({ length: total }, (_, i) => (
        <button key={i} className={i === actual ? 'is-activa' : undefined} onClick={() => onCambiar(i)} aria-current={i === actual || undefined}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => onCambiar(actual + 1)} disabled={actual === total - 1} aria-label={idioma === 'es' ? 'Siguiente' : 'Next'}>
        ›
      </button>
    </nav>
  ) : null;

/** Recorta una lista a la página que entra y mantiene la página dentro del rango. */
const usePaginado = <T,>(lista: T[], porPagina: number, reinicio: unknown) => {
  const [pagina, setPagina] = useState(0);
  const total = Number.isFinite(porPagina) ? Math.max(1, Math.ceil(lista.length / porPagina)) : 1;
  useEffect(() => setPagina(0), [reinicio]);
  const actual = Math.min(pagina, total - 1);
  const visibles = Number.isFinite(porPagina) ? lista.slice(actual * porPagina, (actual + 1) * porPagina) : lista;
  return { visibles, total, actual, setPagina };
};

/** El wallpaper propio cuando exista; mientras tanto, el arte K/DA. */
const useWallpaper = () => {
  const [src, setSrc] = useState(ARTE.temporada);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setSrc(WALLPAPER);
    img.src = WALLPAPER;
  }, []);
  return src;
};

const useAparicion = (raiz: React.RefObject<HTMLElement | null>, clave: string) => {
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.visible = '';
            obs.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    );
    const observar = () => el.querySelectorAll('.hx-aparece:not([data-visible])').forEach((p) => obs.observe(p));
    observar();
    // Las subpestañas y los filtros vuelven a montar piezas: sin esto quedarían invisibles.
    const cambios = new MutationObserver(observar);
    cambios.observe(el, { childList: true, subtree: true });
    return () => {
      cambios.disconnect();
      obs.disconnect();
    };
  }, [raiz, clave]);
};

// ── Piezas comunes del cliente ──────────────────────────────────────────────

/** Botón de contorno dorado sobre relleno oscuro, como "CALENDARIO" o "COMPRAR RP". */
const BotonOro: React.FC<
  React.PropsWithChildren<{ href?: string; onClick?: () => void; externo?: boolean; descarga?: boolean; className?: string }>
> = ({ href, onClick, externo, descarga, className, children }) =>
  href ? (
    <a
      className={`cl-boton${className ? ` ${className}` : ''}`}
      href={href}
      target={externo ? '_blank' : undefined}
      rel={externo ? 'noopener noreferrer' : undefined}
      download={descarga || undefined}
    >
      {children}
    </a>
  ) : (
    <button className={`cl-boton${className ? ` ${className}` : ''}`} onClick={onClick}>
      {children}
    </button>
  );

/** Subpestañas de página: serif chica, la activa subrayada. */
const Subpestanas: React.FC<{ items: { id: string; texto: string }[]; activa: string; onCambiar: (id: string) => void }> = ({
  items,
  activa,
  onCambiar,
}) => (
  <nav className="cl-subpestanas">
    {items.map((it) => (
      <button key={it.id} className={`cl-subpestana${activa === it.id ? ' is-activa' : ''}`} onClick={() => onCambiar(it.id)}>
        {it.texto}
      </button>
    ))}
  </nav>
);

/** Cabecera de sección: número, título y línea. */
const Encabezado: React.FC<{ n: string; titulo: string; extra?: React.ReactNode }> = ({ n, titulo, extra }) => (
  <header className="cl-encabezado">
    <span className="cl-encabezado__n">{n}</span>
    <h2 className="cl-display">{titulo}</h2>
    <span className="cl-encabezado__linea" />
    {extra}
  </header>
);

/** Emblema del estandarte de perfil, dibujado propio. */
const Cresta: React.FC<{ foto: string; tam?: number }> = ({ foto, tam = 150 }) => {
  const id = React.useId().replace(/:/g, '');
  return (
    <div className="cl-cresta" style={{ width: tam, height: tam * 1.02 }}>
      <svg viewBox="0 0 150 153" width={tam} height={tam * 1.02} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}o`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f0e6a2" />
            <stop offset="0.45" stopColor="#c89b3c" />
            <stop offset="1" stopColor="#5b3d12" />
          </linearGradient>
          <linearGradient id={`${id}t`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0ac8b9" />
            <stop offset="1" stopColor="#063a4a" />
          </linearGradient>
        </defs>
        <path d="M18 18 L40 58 L34 96 L14 64 Z M132 18 L110 58 L116 96 L136 64 Z" fill={`url(#${id}t)`} stroke={`url(#${id}o)`} strokeWidth="3" />
        <circle cx="75" cy="72" r="47" fill="#010a13" stroke={`url(#${id}o)`} strokeWidth="6" />
        <path d="M58 118 L75 150 L92 118 Z" fill={`url(#${id}o)`} />
        <path d="M66 120 L75 138 L84 120 Z" fill="#0ac8b9" />
      </svg>
      <img src={foto} alt="" />
    </div>
  );
};

// ── Inicio: pantalla de modos ───────────────────────────────────────────────

const Inicio: React.FC<{ idioma: L; wallpaper: string; irA: (id: string) => void }> = ({ idioma, wallpaper, irA }) => {
  const kerocraft = PRODUCTOS[0];
  const opciones: { id: string; texto: string; nuevo?: boolean; destino: () => void }[] = [
    { id: 'kerocraft', texto: kerocraft.nombre, nuevo: true, destino: () => window.open(kerocraft.url, '_blank', 'noopener') },
    { id: 'voybien', texto: 'VoyBien', destino: () => window.open(PRODUCTOS[1].url, '_blank', 'noopener') },
    ...ORDEN.slice(1, 7).map((id) => ({ id, texto: PESTANA[id][idioma], destino: () => irA(id) })),
  ];
  const [elegida, setElegida] = useState('kerocraft');

  return (
    <section className="cl-inicio" id="top">
      <div className="cl-inicio__fondo" aria-hidden="true">
        <img src={wallpaper} alt="" />
        {wallpaper === WALLPAPER && (
          <video
            className="cl-inicio__video"
            src={WALLPAPER_VIDEO}
            poster={WALLPAPER}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={(e) => e.currentTarget.classList.add('is-lista')}
          />
        )}
      </div>

      <aside className="cl-modos">
        <ul>
          {opciones.map((o) => (
            <li key={o.id}>
              <button
                className={`cl-modo${elegida === o.id ? ' is-activo' : ''}`}
                onMouseEnter={() => setElegida(o.id)}
                onFocus={() => setElegida(o.id)}
                onClick={o.destino}
              >
                {o.nuevo && <i className="cl-modo__nuevo" aria-hidden="true" />}
                <span className="cl-modo__glifo">
                  <Glifo id={o.id} tam={30} />
                </span>
                <span className="cl-modo__texto">{o.texto}</span>
              </button>
            </li>
          ))}
        </ul>
        <a className="cl-modo cl-modo--pie" href="/alan-ponce-cv%20(may-2026).pdf" download>
          <i className="cl-modo__nuevo" aria-hidden="true" />
          <span className="cl-modo__glifo">
            <Glifo id="guias" tam={24} />
          </span>
          <span className="cl-modo__texto">{idioma === 'es' ? 'Currículum' : 'Résumé'}</span>
        </a>
      </aside>

      <div className="cl-evento">
        <p className="cl-evento__fecha">
          2013 · {idioma === 'es' ? 'Hoy' : 'Today'}
          <span className="cl-ayuda" title={IDENTIDAD.lugar[idioma]}>
            ?
          </span>
        </p>
        <h1 className="cl-display cl-evento__titulo">
          {HERO.titular[idioma].map((l) => (
            <span key={l.texto}>{l.texto}</span>
          ))}
        </h1>
        <p className="cl-evento__sub">{HERO.eyebrow[idioma]}</p>
        <p className="cl-evento__texto">
          {HERO.bajada[idioma]} {MANIFIESTO.parrafos[idioma][0]}
        </p>
      </div>

      <BotonOro className="cl-inicio__secundario" onClick={() => irA('productos')}>
        {idioma === 'es' ? 'Ver colección' : 'View collection'}
      </BotonOro>
      <BotonOro className="cl-boton--jugar cl-inicio__jugar" href={`mailto:${CONTACTO.email}`}>
        {idioma === 'es' ? 'Contacto' : 'Contact'}
      </BotonOro>
    </section>
  );
};

// ── Colección: tienda ───────────────────────────────────────────────────────

const FILTROS = ['destacados', 'Live', 'Open source', 'In progress', 'todos'] as const;
type Filtro = (typeof FILTROS)[number];

const Ficha: React.FC<{ p: Producto; idioma: L; onAbrir: (p: Producto) => void }> = ({ p, idioma, onAbrir }) => (
  <button className={`cl-ficha${p.activo ? '' : ' is-apagada'}`} onClick={() => onAbrir(p)}>
    <img className="cl-ficha__arte" src={`/editorial/proyectos-color/${p.slug}.jpg`} alt="" loading="lazy" />
    <span className="cl-chip">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      {p.estado[idioma]}
    </span>
    <span className="cl-ficha__pie">
      <span className="cl-ficha__nombre">{p.nombre}</span>
      <span className="cl-ficha__precio">
        <img src={itemIcono(ITEM_POR_PRODUCTO[p.slug].id)} alt="" />
        {p.meta ? p.meta[idioma] : p.rol[idioma]}
      </span>
    </span>
  </button>
);

const Coleccion: React.FC<{ idioma: L }> = ({ idioma }) => {
  const [filtro, setFiltro] = useState<Filtro>('destacados');
  const [pagina, setPagina] = useState(0);
  const [abierto, setAbierto] = useState<Producto | null>(null);
  const destacados = [PRODUCTOS[0], PRODUCTOS[1], PRODUCTOS[11]];
  const fichas = [PRODUCTOS[2], PRODUCTOS[3], PRODUCTOS[4], PRODUCTOS[5]];
  const lista = useMemo(
    () => (filtro === 'destacados' ? [] : filtro === 'todos' ? PRODUCTOS : PRODUCTOS.filter((p) => p.estado.en === filtro)),
    [filtro],
  );
  const d = destacados[pagina];
  const [grilla, setGrilla] = useState<HTMLDivElement | null>(null);
  const paginado = usePaginado(lista, useCapacidad(grilla, 200, 210, 12, 12), filtro);

  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(null);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [abierto]);

  const nombres: Record<Filtro, Bi> = {
    destacados: { es: 'Destacados', en: 'Featured' },
    Live: { es: 'En vivo', en: 'Live' },
    'Open source': { es: 'Código abierto', en: 'Open source' },
    'In progress': { es: 'En desarrollo', en: 'In progress' },
    todos: { es: 'Todos', en: 'All' },
  };

  return (
    <section className="cl-sec" id="productos">
      <div className="cl-barra-sec">
        <Subpestanas items={FILTROS.map((f) => ({ id: f, texto: nombres[f][idioma] }))} activa={filtro} onCambiar={(f) => setFiltro(f as Filtro)} />
        <BotonOro href="https://github.com/uxKero" externo>
          {idioma === 'es' ? 'Ver GitHub' : 'View GitHub'}
        </BotonOro>
      </div>

      {filtro === 'destacados' && (
        <>
          <div className="cl-tienda hx-aparece">
            <div className="cl-destacado">
              <button className="cl-destacado__abrir" onClick={() => setAbierto(d)} aria-label={d.nombre}>
                <img src={`/editorial/proyectos-color/${d.slug}.jpg`} alt="" />
                <span className="cl-destacado__texto">
                  <small>
                    {d.estado[idioma]} · {d.stack ?? d.rol[idioma]}
                  </small>
                  <b className="cl-display">{d.nombre}</b>
                  <span>{d.rol[idioma]}</span>
                </span>
              </button>
              <span className="cl-paginas">
                {destacados.map((x, i) => (
                  <button key={x.slug} className={i === pagina ? 'is-activa' : undefined} onClick={() => setPagina(i)} aria-label={x.nombre}>
                    {i + 1}
                  </button>
                ))}
              </span>
            </div>
            <div className="cl-fichas">
              {fichas.map((p) => (
                <Ficha key={p.slug} p={p} idioma={idioma} onAbrir={setAbierto} />
              ))}
            </div>
          </div>

          <div className="cl-franja hx-aparece">
            <b className="cl-franja__marca">
              167
              <small>{idioma === 'es' ? 'estrellas' : 'stars'}</small>
            </b>
            <p>
              {idioma === 'es'
                ? 'anydesign convierte cualquier captura, sitio o archivo de Figma en un design.md reconstruible. Este diseño salió de ahí.'
                : 'anydesign turns any screenshot, site or Figma file into a rebuildable design.md. This very design came out of it.'}
            </p>
            <BotonOro href="https://github.com/uxKero/anydesign" externo>
              {idioma === 'es' ? 'Ver repositorio ↗' : 'View repository ↗'}
            </BotonOro>
          </div>
        </>
      )}

      {filtro !== 'destacados' && (
        <div className="cl-grilla">
          <div className="cl-fila-fichas" ref={setGrilla}>
            {paginado.visibles.map((p) => (
              <Ficha key={p.slug} p={p} idioma={idioma} onAbrir={setAbierto} />
            ))}
          </div>
          <Paginador total={paginado.total} actual={paginado.actual} onCambiar={paginado.setPagina} idioma={idioma} />
        </div>
      )}

      {abierto && (
        <div className="hx-velo" onClick={() => setAbierto(null)}>
          <div className="cl-modal" role="dialog" aria-modal="true" aria-label={abierto.nombre} onClick={(e) => e.stopPropagation()}>
            <button className="cl-modal__cerrar" onClick={() => setAbierto(null)} aria-label={idioma === 'es' ? 'Cerrar' : 'Close'}>
              ×
            </button>
            <div className="cl-modal__arte">
              <img src={`/editorial/proyectos-color/${abierto.slug}.jpg`} alt="" />
            </div>
            <div className="cl-modal__cuerpo">
              <p className="cl-sobre">
                #{abierto.n} · {abierto.estado[idioma]}
              </p>
              <h3 className="cl-display">{abierto.nombre}</h3>
              <p className="cl-modal__rol">{abierto.rol[idioma]}</p>
              <p className="cl-modal__texto">{abierto.texto[idioma]}</p>
              <p className="cl-modal__item">
                <img src={itemIcono(ITEM_POR_PRODUCTO[abierto.slug].id)} alt="" />
                <span>
                  <small>{idioma === 'es' ? 'Ítem equipado' : 'Equipped item'}</small>
                  {ITEM_POR_PRODUCTO[abierto.slug][idioma]}
                </span>
              </p>
              {abierto.stack && <p className="cl-modal__stack">{abierto.stack}</p>}
              <div className="cl-acciones">
                {abierto.url && (
                  <BotonOro className="cl-boton--jugar" href={abierto.url} externo>
                    {dominio(abierto.url)}
                  </BotonOro>
                )}
                {abierto.gh && (
                  <BotonOro href={abierto.gh} externo>
                    GitHub
                  </BotonOro>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ── Perfil ──────────────────────────────────────────────────────────────────

const Perfil: React.FC<{ idioma: L; wallpaper: string }> = ({ idioma, wallpaper }) => {
  const [pestana, setPestana] = useState('resumen');
  const insignias: { titulo: Bi; sub: Bi; img: string; valor: string }[] = [
    { titulo: { es: 'Diseñando', en: 'Designing' }, sub: { es: 'Desde 2013', en: 'Since 2013' }, img: emblema('gold'), valor: String(new Date().getFullYear() - 2013) },
    { titulo: { es: 'Alcance', en: 'Reach' }, sub: { es: 'Países', en: 'Countries' }, img: emblema('emerald'), valor: DATOS[1].cifra },
    { titulo: { es: 'Productos propios', en: 'Own products' }, sub: { es: 'Publicados', en: 'Shipped' }, img: emblema('master'), valor: DATOS[2].cifra },
    { titulo: { es: 'Certificaciones', en: 'Certifications' }, sub: { es: 'Completadas', en: 'Completed' }, img: emblema('diamond'), valor: String(CERTIFICACIONES.length) },
    { titulo: { es: 'Estandarte', en: 'Banner' }, sub: { es: 'Mar del Plata', en: 'Mar del Plata' }, img: emblema('platinum'), valor: 'UTC-3' },
  ];

  return (
    <section className="cl-perfil" id="perfil">
      <div className="cl-perfil__fondo" aria-hidden="true">
        <img src={ARTE.piltover} alt="" loading="lazy" />
      </div>
      <div className="cl-perfil__barra">
        <Subpestanas
          items={[
            { id: 'resumen', texto: idioma === 'es' ? 'Resumen' : 'Overview' },
            { id: 'manifiesto', texto: idioma === 'es' ? 'Manifiesto' : 'Manifesto' },
          ]}
          activa={pestana}
          onCambiar={setPestana}
        />
      </div>

      <aside className="cl-perfil__lado hx-aparece">
        <Estandarte>
          <span className="cl-nivel">
            <i aria-hidden="true" />
            {new Date().getFullYear() - 2013}
          </span>
          <Emblema foto={wallpaper === WALLPAPER ? WALLPAPER : '/editorial/retrato.png'} filtrar={wallpaper !== WALLPAPER} tam={176} />
          <p className="cl-banderin__nombre">{IDENTIDAD.nombre}</p>
          <p className="cl-banderin__titulo">{IDENTIDAD.rol[idioma]}</p>
          <div className="cl-runas">
            {ARBOLES_RUNAS.slice(0, 3).map((a) => (
              <span key={a.clave} title={a[idioma]}>
                <img src={runaIcono(a.icono)} alt="" />
              </span>
            ))}
          </div>
        </Estandarte>
      </aside>

      <div className="cl-perfil__centro">
        {pestana === 'manifiesto' ? (
          <div className="cl-manifiesto">
            <h2 className="cl-display">
              {MANIFIESTO.titular[idioma].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
            {MANIFIESTO.parrafos[idioma].map((p) => (
              <p key={p.slice(0, 16)}>{p}</p>
            ))}
          </div>
        ) : (
          <div className="cl-insignias">
            {insignias.map((it, i) => (
              <div key={i} className="cl-insignia hx-aparece" style={{ '--d': `${i * 70}ms` } as React.CSSProperties}>
                <p className="cl-insignia__titulo">{it.titulo[idioma]}</p>
                <p className="cl-insignia__sub">{it.sub[idioma]}</p>
                <div className="cl-insignia__arte">
                  <img src={it.img} alt="" loading="lazy" />
                </div>
                <p className="cl-insignia__numero">{it.valor}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Carrera: lobby ──────────────────────────────────────────────────────────

const Carrera: React.FC<{ idioma: L }> = ({ idioma }) => {
  const orden = [TRABAJO[0], TRABAJO[1], TRABAJO[3], TRABAJO[2]];
  const [retratos] = useState(() => campeonesAlAzar(orden.length));
  return (
    <section className="cl-lobby" id="trabajo">
      <div className="cl-lobby__fondo" aria-hidden="true">
        <img src={FONDO_SALA.abismo} alt="" />
      </div>
      <header className="cl-lobby__cabeza">
        <span className="cl-lobby__volver" aria-hidden="true">
          ‹
        </span>
        <span className="cl-lobby__cola">
          <img src={itemIcono(ITEM_POR_PRODUCTO.kerocraft.id)} alt="" />
          {idioma === 'es' ? 'Carrera · Grupo de 4 · Remoto' : 'Career · Party of 4 · Remote'}
        </span>
      </header>

      <div className="cl-lobby__fila">
        {orden.map((t, i) => {
          const propio = t.org === 'KeroClow';
          const campeon = CAMPEON_POR_ORG[t.org];
          return (
            <article key={t.org} className={`cl-miembro hx-aparece${propio ? ' cl-miembro--propio' : ''}`} style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
              <Estandarte destacado={propio}>
                <Emblema foto={retratoCampeon(retratos[i])} tam={propio ? 150 : 124} />
                <p className="cl-banderin__nombre">
                  {propio && (
                    <svg className="cl-corona" width="14" height="12" viewBox="0 0 24 20" aria-hidden="true">
                      <path d="M2 18L0 4l7 6l5-10l5 10l7-6l-2 14z" fill="currentColor" />
                    </svg>
                  )}
                  {t.url ? (
                    <a href={t.url} target="_blank" rel="noopener noreferrer">
                      {t.org}
                    </a>
                  ) : (
                    t.org
                  )}
                </p>
                <p className="cl-banderin__titulo">{t.rol[idioma]}</p>
                <p className="cl-banderin__ctx">{t.contexto[idioma]}</p>
                <p className="cl-miembro__campeon">{campeon.motivo[idioma]}</p>
              </Estandarte>
            </article>
          );
        })}
        <a className="cl-miembro cl-miembro--vacio" href={`mailto:${CONTACTO.email}`}>
          <span className="cl-mas">+</span>
          <small>{idioma === 'es' ? 'Tu equipo' : 'Your team'}</small>
        </a>
      </div>

      <div className="cl-lobby__pie">
        <div className="cl-buscar-zona">
          <span className="cl-buscar__linea" aria-hidden="true" />
          <a className="cl-buscar" href={`mailto:${CONTACTO.email}`}>
            <span className="cl-texto-boton">{idioma === 'es' ? 'Armar equipo' : 'Find a match'}</span>
          </a>
          <span className="cl-buscar__linea cl-buscar__linea--der" aria-hidden="true" />
        </div>
        <div className="cl-progresion">
          <div className="cl-progresion__tabs">
            <span className="is-activa">{idioma === 'es' ? 'Progresión' : 'Progression'}</span>
            <span>
              {idioma === 'es' ? 'Puestos' : 'Roles'} ({TRABAJO.length})
            </span>
          </div>
          <div className="cl-progresion__cuerpo">
            <p>{idioma === 'es' ? 'En curso' : 'Ongoing'}</p>
            <div className="cl-progresion__barra">
              <span>2013</span>
              <i>
                <b />
              </i>
              <span>{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Oficio: colección de aspectos ───────────────────────────────────────────

const Oficio: React.FC<{ idioma: L }> = ({ idioma }) => {
  const [grupo, setGrupo] = useState(-1);
  const [texto, setTexto] = useState('');
  const total = OFICIO.reduce((n, g) => n + g.items.length, 0);
  const cartas = OFICIO.flatMap((g, i) =>
    g.items.map((it, k) => ({ g: i, it, runa: ARBOLES_RUNAS[i].runas[k % ARBOLES_RUNAS[i].runas.length] })),
  ).filter((c) => (grupo < 0 || c.g === grupo) && (!texto || c.it[idioma].toLowerCase().includes(texto.toLowerCase())));
  const [zona, setZona] = useState<HTMLDivElement | null>(null);
  const paginado = usePaginado(cartas, useCapacidad(zona, 128, 150, 18, 22), `${grupo}|${texto}`);

  return (
    <section className="cl-sec" id="oficio">
      <div className="cl-barra-sec">
        <Subpestanas
          items={[{ id: '-1', texto: idioma === 'es' ? 'Todo' : 'All' }, ...OFICIO.map((g, i) => ({ id: String(i), texto: g.titulo[idioma] }))]}
          activa={String(grupo)}
          onCambiar={(id) => setGrupo(Number(id))}
        />
      </div>
      <div className="cl-coleccion">
        <aside className="cl-coleccion__lado">
          <div className="cl-contador">
            <b>{total}</b>
            <span>{idioma === 'es' ? 'Habilidades en colección' : 'Abilities in collection'}</span>
          </div>
          <ul className="cl-contador__grupos">
            {OFICIO.map((g, i) => (
              <li key={g.titulo.en} title={g.titulo[idioma]}>
                <img src={runaIcono(ARBOLES_RUNAS[i].icono)} alt="" />
                <span>{g.items.length}</span>
              </li>
            ))}
          </ul>
          <label className="cl-buscador">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14M20 20l-4-4" />
            </svg>
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={idioma === 'es' ? 'Buscar' : 'Search'} />
          </label>
        </aside>
        <div className="cl-coleccion__cuerpo">
          <div className="cl-coleccion__cabeza">
            <h3 className="cl-display cl-coleccion__titulo">
              {grupo < 0 ? (idioma === 'es' ? 'Adquirido desde 2013' : 'Acquired since 2013') : OFICIO[grupo].titulo[idioma]}
            </h3>
            <Paginador total={paginado.total} actual={paginado.actual} onCambiar={paginado.setPagina} idioma={idioma} />
          </div>
          <div className="cl-cartas" ref={setZona}>
            {paginado.visibles.map((c) => (
              <div key={c.it.en} className="cl-carta">
                <span className="cl-carta__arte">
                  <img src={runaIcono(c.runa.icono)} alt="" loading="lazy" />
                </span>
                <span className="cl-carta__nombre">{c.it[idioma]}</span>
                <span className="cl-carta__arbol">{ARBOLES_RUNAS[c.g][idioma]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


// ── Desafíos, guías y contacto ──────────────────────────────────────────────

const Desafios: React.FC<{ idioma: L }> = ({ idioma }) => (
  <section className="cl-sec" id="estudios">
    <Encabezado
      n="05"
      titulo={PESTANA.estudios[idioma]}
      extra={
        <span className="cl-sobre">
          {CERTIFICACIONES.length}/{CERTIFICACIONES.length}
        </span>
      }
    />
    <div className="cl-desafios">
      {CERTIFICACIONES.map((c, i) => (
        <article key={c.nombre} className="cl-desafio hx-aparece" style={{ '--d': `${i * 80}ms` } as React.CSSProperties}>
          <div className="cl-desafio__emblema" aria-hidden="true">
            <img src={emblema(LIGAS[i % LIGAS.length])} alt="" loading="lazy" />
          </div>
          <div className="cl-desafio__texto">
            <p className="cl-sobre">
              {ROMANOS[i]} · {c.casa} · {c.anio}
            </p>
            <h3>{c.nombre}</h3>
            <div className="cl-barrita">
              <i />
            </div>
          </div>
          {c.url && (
            <BotonOro href={c.url} externo>
              {idioma === 'es' ? 'Ver' : 'View'}
            </BotonOro>
          )}
        </article>
      ))}
    </div>
  </section>
);

const Guias: React.FC<{ idioma: L }> = ({ idioma }) => {
  const navigate = useNavigate();
  return (
    <section className="cl-sec" id="guias">
      <Encabezado n="06" titulo={PESTANA.guias[idioma]} />
      <div className="cl-guias">
        {GUIAS.map((g, i) => (
          <article key={g.href} className="cl-guia hx-aparece" style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
            <img className="cl-guia__arte" src={carga(i === 0 ? 'Heimerdinger' : 'Viktor')} alt="" loading="lazy" />
            <div className="cl-guia__texto">
              <p className="cl-sobre">{g.meta[idioma]}</p>
              <h3 className="cl-display">{g.titulo}</h3>
              <p>{g.texto[idioma]}</p>
              <BotonOro onClick={() => navigate(g.href)}>{idioma === 'es' ? 'Leer guía' : 'Read guide'}</BotonOro>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const Contacto: React.FC<{ idioma: L }> = ({ idioma }) => (
  <section className="cl-sec cl-sec--final" id="contacto">
    <div className="cl-invitacion hx-aparece">
      <p className="cl-sobre">{idioma === 'es' ? 'Invitación a la partida' : 'Match invite'}</p>
      <h2 className="cl-display">
        {CONTACTO.titular[idioma].map((l) => (
          <span key={l}>{l}</span>
        ))}
      </h2>
      <p>{CONTACTO.bajada[idioma]}</p>
      <div className="cl-acciones cl-acciones--centro">
        <BotonOro className="cl-boton--jugar" href={`mailto:${CONTACTO.email}`}>
          {idioma === 'es' ? 'Aceptar' : 'Accept'}
        </BotonOro>
        <BotonOro href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</BotonOro>
      </div>
    </div>
    <footer className="cl-pie">
      <span>© 2026 {IDENTIDAD.nombre}</span>
      <span>{IDENTIDAD.lugar[idioma]} · UTC-3</span>
      <p>{AVISO_RIOT}</p>
    </footer>
  </section>
);

// ── Página ──────────────────────────────────────────────────────────────────

const HextechPagina: React.FC<PropsPagina> = ({ idioma, alCambiarIdioma, selector }) => {
  const raiz = useRef<HTMLDivElement>(null);
  const { activa, irA } = usePantalla();
  const wallpaper = useWallpaper();
  useAparicion(raiz, `${idioma}|${activa}`);

  const pantallas: Record<string, React.ReactNode> = {
    top: <Inicio idioma={idioma} wallpaper={wallpaper} irA={irA} />,
    productos: <Coleccion idioma={idioma} />,
    perfil: <Perfil idioma={idioma} wallpaper={wallpaper} />,
    trabajo: <Carrera idioma={idioma} />,
    oficio: <Oficio idioma={idioma} />,
    estudios: <Desafios idioma={idioma} />,
    guias: <Guias idioma={idioma} />,
    contacto: <Contacto idioma={idioma} />,
  };

  return (
    <div className="hx-pagina" ref={raiz}>
      <BarraLauncher idioma={idioma} pestanas={PESTANA} activa={activa} irA={irA} alCambiarIdioma={alCambiarIdioma} selector={selector} />

      <div className="hx-cuerpo">
        <main className="hx-centro">
          <div className="hx-pantalla" key={activa} data-pantalla={activa}>
            {pantallas[activa]}
          </div>
        </main>

        <PanelSocial idioma={idioma} irA={irA} />
      </div>
    </div>
  );
};

export default HextechPagina;
