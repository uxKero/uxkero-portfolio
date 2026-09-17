import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
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
  SECCIONES,
  TRABAJO,
  type Bi,
  type Producto,
} from '../../editorial-content';
import { Icono, type NombreIcono } from './Iconos';

// El visor 3D trae three.js: se baja solo si el modelo existe.
const Personaje3D = lazy(() => import('./Personaje3D'));

// ─────────────────────────────────────────────────────────────────────────────
// Brawl Plate. El portfolio como interfaz de juego: el mismo contenido que el
// editorial, otra estructura. Portada de lobby, perfil como tarjeta de jugador,
// trabajo como ruta de progreso, productos como tienda, oficio como
// habilidades, estudios como misiones, guías como eventos y contacto como la
// pantalla de la siguiente partida. Todo lo que se toca o contiene algo es una
// placa de cuatro capas; los párrafos viven siempre sobre una placa oscura.
// ─────────────────────────────────────────────────────────────────────────────

const TXT = {
  nuevo: { es: 'Nuevo', en: 'New' },
  paises: { es: 'Países', en: 'Countries' },
  productos: { es: 'Productos', en: 'Products' },
  certificaciones: { es: 'Certificaciones', en: 'Certifications' },
  jugador: { es: 'Jugador', en: 'Player' },
  sitio: { es: 'Sitio', en: 'Site' },
  ver: { es: 'Ver', en: 'View' },
  leer: { es: 'Leer', en: 'Read' },
  completada: { es: 'Completada', en: 'Completed' },
  propio: { es: 'Producto propio', en: 'My own product' },
  enVivo: { es: 'En vivo', en: 'Live now' },
  idioma: { es: 'Idioma', en: 'Language' },
} satisfies Record<string, Bi>;

const SUBTITULO: Record<string, Bi> = {
  perfil: { es: 'Tarjeta de jugador', en: 'Player card' },
  trabajo: { es: 'Ruta de carrera', en: 'Career road' },
  productos: { es: 'Tienda de productos', en: 'Product shop' },
  oficio: { es: 'Habilidades', en: 'Abilities' },
  estudios: { es: 'Misiones completadas', en: 'Completed quests' },
  guias: { es: 'Eventos', en: 'Events' },
  contacto: { es: 'Siguiente partida', en: 'Next match' },
};

const ICONO_SECCION: Record<string, NombreIcono> = {
  top: 'lobby',
  perfil: 'jugador',
  trabajo: 'maletin',
  productos: 'caja',
  oficio: 'rayo',
  estudios: 'estrella',
  guias: 'libro',
  contacto: 'sobre',
};

// El color de la tienda es vocabulario: cada estado tiene el suyo.
const CATEGORIA: Record<string, string> = {
  'Launching soon': 'violeta',
  Live: 'verde',
  'Open source': 'violeta',
  'In progress': 'naranja',
  Prototype: 'dorado',
  Finished: 'apagada',
};

const sec = (id: string) => SECCIONES.find((s) => s.id === id) ?? SECCIONES[0];
const dominio = (url: string) => url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

/** Marca como llegado todo lo que entra en pantalla: nada aparece, todo llega. */
const useLlegadas = (raiz: React.RefObject<HTMLElement | null>, clave: string) => {
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const piezas = Array.from(el.querySelectorAll<HTMLElement>('.bw-llega'));
    if (!('IntersectionObserver' in window)) {
      piezas.forEach((p) => p.classList.add('is-in'));
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            obs.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    piezas.forEach((p) => obs.observe(p));
    return () => obs.disconnect();
  }, [raiz, clave]);
};

/** La sección en pantalla, para la barra de pestañas. */
const useSeccionActiva = () => {
  const [activa, setActiva] = useState('top');
  useEffect(() => {
    let pedido = 0;
    const medir = () => {
      pedido = 0;
      const linea = window.innerHeight * 0.45;
      let actual = 'top';
      SECCIONES.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= linea) actual = s.id;
      });
      setActiva(actual);
    };
    const alScroll = () => {
      if (!pedido) pedido = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alScroll);
    return () => {
      window.removeEventListener('scroll', alScroll);
      window.removeEventListener('resize', alScroll);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);
  return activa;
};

/** Una cifra no cambia: cuenta hasta su valor cuando entra en pantalla. */
const Cuenta: React.FC<{ valor: string; desde?: number }> = ({ valor, desde = 0 }) => {
  const m = valor.match(/^(\D*)(\d+)(\D*)$/);
  const objetivo = m ? parseInt(m[2], 10) : 0;
  const [n, setN] = useState(m ? desde : objetivo);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !m) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(objetivo);
      return;
    }
    let cuadro = 0;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const t = Math.min(1, (ahora - inicio) / 700);
        const suave = 1 - (1 - t) ** 3;
        setN(Math.round(desde + (objetivo - desde) * suave));
        if (t < 1) cuadro = requestAnimationFrame(paso);
        else el.classList.add('is-listo');
      };
      cuadro = requestAnimationFrame(paso);
    });
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(cuadro);
    };
    // El valor viene del contenido y no cambia en vida del componente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!m) return <span>{valor}</span>;
  return (
    <span ref={ref} className="bw-cuenta">
      {m[1]}
      {n}
      {m[3]}
    </span>
  );
};

/**
 * Un modelo opcional. Vite contesta cualquier ruta inexistente con el index.html
 * y código 200, así que no alcanza con mirar el estado: se mira el tipo.
 */
const useModelo = (src: string) => {
  const [existe, setExiste] = useState(false);
  useEffect(() => {
    let vivo = true;
    fetch(src, { method: 'HEAD' })
      .then((r) => {
        const tipo = r.headers.get('content-type') ?? '';
        if (vivo && r.ok && !tipo.includes('text/html')) setExiste(true);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [src]);
  return existe;
};

/** Carga una imagen opcional: si todavía no existe, se usa el reemplazo. */
const useImagen = (src: string) => {
  const [lista, setLista] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLista(true);
    img.src = src;
  }, [src]);
  return lista;
};

const irA = (e: React.MouseEvent, id: string) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
};

const Cabecera: React.FC<{ id: string; L: 'es' | 'en'; cifra?: string }> = ({ id, L, cifra }) => (
  <header className="bw-cabecera bw-plate bw-llega">
    <span className="bw-cabecera__n">{sec(id).n}</span>
    <Icono nombre={ICONO_SECCION[id]} tam={44} className="bw-cabecera__icono" />
    <div className="bw-cabecera__textos">
      <h2 className="bw-contorno">{sec(id).label[L]}</h2>
      <p>{SUBTITULO[id][L]}</p>
    </div>
    {cifra && (
      <span className="bw-pill bw-cabecera__cifra">
        <Cuenta valor={cifra} />
      </span>
    )}
  </header>
);

const CartaProducto: React.FC<{ p: Producto; L: 'es' | 'en'; i: number }> = ({ p, L, i }) => {
  const categoria = CATEGORIA[p.estado.en] ?? 'violeta';
  const estrella = p.meta && p.slug === 'anydesign';
  return (
    <article
      className={`bw-oferta bw-plate bw-oferta--${categoria} bw-llega${p.ancho ? ' bw-oferta--ancha' : ''}${
        p.destacado ? ' bw-oferta--destacada' : ''
      }`}
      style={{ '--d': `${(i % 3) * 70}ms` } as React.CSSProperties}
    >
      <div className="bw-oferta__banda">
        <span>{p.destacado ? TXT.propio[L] : p.estado[L]}</span>
        <span className="bw-oferta__n">#{p.n}</span>
      </div>
      {p.slug === 'kerocraft' && <span className="bw-bandera">{p.estado[L]}</span>}
      {estrella && (
        <span className="bw-estallido" aria-label={p.meta![L]}>
          <b>167</b>
          <small>{L === 'es' ? 'estrellas' : 'stars'}</small>
        </span>
      )}
      <div className="bw-oferta__imagen">
        <img src={`/editorial/proyectos/${p.slug}.jpg`} alt="" loading="lazy" width={720} height={378} />
      </div>
      <div className="bw-oferta__cuerpo">
        <h3 className="bw-contorno">{p.nombre}</h3>
        <p className="bw-oferta__rol">{p.rol[L]}</p>
        <p className="bw-oferta__texto">{p.texto[L]}</p>
        {p.meta && !estrella && <span className="bw-valor">{p.meta[L]}</span>}
      </div>
      <div className="bw-oferta__pie">
        {p.stack && <span className="bw-oferta__stack">{p.stack}</span>}
        <span className="bw-oferta__acciones">
          {p.url && (
            <a className="bw-btn bw-plate bw-plate--amarilla" href={p.url} target="_blank" rel="noopener noreferrer">
              {p.destacado ? dominio(p.url) : TXT.sitio[L]}
            </a>
          )}
          {p.gh && (
            <a className="bw-btn bw-plate" href={p.gh} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
        </span>
      </div>
    </article>
  );
};

const BrawlPagina: React.FC<PropsPagina> = ({ idioma: L, alCambiarIdioma, selector }) => {
  const navigate = useNavigate();
  const raiz = useRef<HTMLDivElement>(null);
  const activa = useSeccionActiva();
  const personaje = useImagen('/brawl/alan-brawler.webp');
  const avatar = useImagen('/brawl/alan-avatar.webp');
  const modelo3d = useModelo('/brawl/alan-brawler.glb');
  useLlegadas(raiz, L);

  const destacados = PRODUCTOS.filter((p) => p.destacado);
  const resto = PRODUCTOS.filter((p) => !p.destacado);
  const anios = new Date().getFullYear() - 2013;

  const pestanaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // En pantallas angostas la pestaña activa se mantiene a la vista.
    const barra = pestanaRef.current;
    const tab = barra?.querySelector<HTMLElement>('.is-activa');
    if (barra && tab && barra.scrollWidth > barra.clientWidth) {
      barra.scrollTo({ left: tab.offsetLeft - barra.clientWidth / 2 + tab.clientWidth / 2, behavior: 'smooth' });
    }
  }, [activa]);

  return (
    <div className="bw-pagina" ref={raiz}>
      <div className="bw-fondo" aria-hidden="true" />

      {/* ── Lobby ── */}
      <section className="bw-lobby" id="top">
        <div className="bw-lobby__perfil bw-plate bw-llega">
          <div className="bw-avatar">
            <img src={avatar ? '/brawl/alan-avatar.webp' : '/editorial/retrato.png'} alt="" width={96} height={96} />
            <span className="bw-nivel">{anios}</span>
          </div>
          <div className="bw-lobby__nombre">
            <strong className="bw-contorno">{IDENTIDAD.nombre}</strong>
            <span className="bw-bandera bw-bandera--quieta">{IDENTIDAD.marca}</span>
            <small>{IDENTIDAD.rol[L]}</small>
          </div>
        </div>

        <div className="bw-lobby__hud bw-llega">
          <span className="bw-pill" title={TXT.paises[L]}>
            <Icono nombre="mundo" tam={40} />
            <Cuenta valor={DATOS[1].cifra} />
          </span>
          <span className="bw-pill" title={TXT.productos[L]}>
            <Icono nombre="caja" tam={40} />
            <Cuenta valor={DATOS[2].cifra} />
          </span>
          <span className="bw-pill" title={TXT.certificaciones[L]}>
            <Icono nombre="estrella" tam={40} />
            <Cuenta valor={String(CERTIFICACIONES.length)} />
          </span>
        </div>

        <nav className="bw-lobby__menu" aria-label={L === 'es' ? 'Secciones' : 'Sections'}>
          {SECCIONES.filter((s) => s.id !== 'top' && s.id !== 'contacto').map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => irA(e, s.id)}
              className="bw-menu bw-plate bw-btn bw-llega"
              style={{ '--d': `${i * 60}ms` } as React.CSSProperties}
            >
              <Icono nombre={ICONO_SECCION[s.id]} tam={34} />
              <span>{s.label[L]}</span>
              {s.id === 'productos' && <span className="bw-contador">{PRODUCTOS.length}</span>}
            </a>
          ))}
        </nav>

        <div className="bw-lobby__escenario" aria-hidden="true">
          <div className="bw-lobby__rayos" />
          {personaje && modelo3d ? (
            <Suspense fallback={<img className="bw-personaje" src="/brawl/alan-brawler.webp" alt="" />}>
              <Personaje3D reemplazo={<img className="bw-personaje" src="/brawl/alan-brawler.webp" alt="" />} />
            </Suspense>
          ) : personaje ? (
            <img className="bw-personaje" src="/brawl/alan-brawler.webp" alt="" />
          ) : (
            <div className="bw-carta-jugador bw-plate">
              <div className="bw-carta-jugador__banda">{TXT.jugador[L]} 01</div>
              <img src="/editorial/retrato.png" alt="" width={1050} height={1400} />
              <div className="bw-carta-jugador__nombre bw-contorno">UXKERO</div>
            </div>
          )}
          {/* Con el modelo 3D la sombra va dentro de su escena. */}
          {!modelo3d && <div className="bw-lobby__piso" />}
        </div>

        <div className="bw-lobby__titulo bw-llega">
          <span className="bw-bandera">{HERO.eyebrow[L]}</span>
          <h1 className="bw-contorno bw-contorno--grande">
            {HERO.titular[L].map((linea) => (
              <span key={linea.texto} className={linea.acento ? 'bw-amarillo' : undefined}>
                {linea.texto}
              </span>
            ))}
          </h1>
        </div>

        <a
          className="bw-lobby__novedad bw-plate bw-btn bw-llega"
          href="#productos"
          onClick={(e) => irA(e, 'productos')}
        >
          <span className="bw-bandera">{TXT.nuevo[L]}</span>
          <Icono nombre="caja" tam={44} />
          <span>
            <strong className="bw-contorno">KeroCraft</strong>
            <small>{PRODUCTOS[0].estado[L]}</small>
          </span>
        </a>

        <div className="bw-lobby__estado bw-plate bw-llega">
          <span className="bw-vivo">
            <i />
            {IDENTIDAD.estado[L]}
          </span>
          <p>{HERO.bajada[L]}</p>
        </div>

        <div className="bw-lobby__accion bw-llega">
          <a className="bw-btn bw-plate" href={`mailto:${CONTACTO.email}`}>
            <Icono nombre="sobre" tam={30} />
            {HERO.ctaSecundaria[L]}
          </a>
          <a
            className="bw-jugar bw-btn bw-plate bw-plate--amarilla"
            href="#trabajo"
            onClick={(e) => irA(e, 'trabajo')}
          >
            {HERO.cta[L]}
            <Icono nombre="flecha" tam={40} />
          </a>
        </div>
      </section>

      {/* ── Perfil ── */}
      <section className="bw-sec" id="perfil">
        <Cabecera id="perfil" L={L} />
        <div className="bw-perfil">
          <div className="bw-ficha bw-plate bw-llega">
            <div className="bw-ficha__banda">
              {TXT.jugador[L]} · {IDENTIDAD.lugar[L]}
            </div>
            <div className="bw-ficha__foto">
              <img src={avatar ? '/brawl/alan-avatar.webp' : '/editorial/retrato.png'} alt={IDENTIDAD.nombre} />
            </div>
            <ul className="bw-ficha__stats">
              {DATOS.map((d, i) => (
                <li key={d.cifra}>
                  <Icono nombre={(['trofeo', 'mundo', 'caja'] as NombreIcono[])[i]} tam={40} />
                  <span>
                    <b className="bw-contorno">
                      <Cuenta valor={d.cifra} desde={i === 0 ? 1990 : 0} />
                    </b>
                    <small>{d.titulo[L]}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bw-lectura bw-plate bw-llega" style={{ '--d': '90ms' } as React.CSSProperties}>
            <h3 className="bw-contorno">
              {MANIFIESTO.titular[L].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h3>
            {MANIFIESTO.parrafos[L].map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trabajo: ruta de carrera ── */}
      <section className="bw-sec" id="trabajo">
        <Cabecera id="trabajo" L={L} cifra={String(TRABAJO.length)} />
        <div className="bw-ruta bw-llega">
          <div className="bw-ruta__pista" aria-hidden="true">
            <i />
          </div>
          <ol className="bw-ruta__hitos">
            {TRABAJO.map((t, i) => (
              <li key={t.org} className="bw-hito" style={{ '--d': `${i * 120}ms` } as React.CSSProperties}>
                <span className="bw-hito__n bw-plate bw-plate--amarilla">{t.n}</span>
                <div className="bw-hito__carta bw-plate">
                  <h3 className="bw-contorno">{t.rol[L]}</h3>
                  <p className="bw-hito__org">
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noopener noreferrer">
                        {t.org}
                      </a>
                    ) : (
                      <b>{t.org}</b>
                    )}
                  </p>
                  <p className="bw-hito__contexto">{t.contexto[L]}</p>
                  <span className={`bw-valor${t.estado.en === 'Ongoing' ? ' bw-valor--naranja' : ''}`}>
                    {t.estado[L]}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Productos: tienda ── */}
      <section className="bw-sec" id="productos">
        <Cabecera id="productos" L={L} cifra={String(PRODUCTOS.length)} />
        <div className="bw-tienda bw-tienda--destacados">
          {destacados.map((p, i) => (
            <CartaProducto key={p.slug} p={p} L={L} i={i} />
          ))}
        </div>
        <div className="bw-tienda">
          {resto.map((p, i) => (
            <CartaProducto key={p.slug} p={p} L={L} i={i} />
          ))}
        </div>
      </section>

      {/* ── Oficio: habilidades ── */}
      <section className="bw-sec" id="oficio">
        <Cabecera id="oficio" L={L} />
        <div className="bw-habilidades">
          {OFICIO.map((g, i) => (
            <div
              key={g.titulo.en}
              className="bw-habilidad bw-plate bw-llega"
              style={{ '--d': `${i * 80}ms` } as React.CSSProperties}
            >
              <div className="bw-habilidad__banda">
                <Icono nombre={(['jugador', 'rayo', 'caja', 'maletin'] as NombreIcono[])[i]} tam={40} />
                <h3 className="bw-contorno">{g.titulo[L]}</h3>
              </div>
              <ul>
                {g.items.map((it) => (
                  <li key={it.en} className="bw-chip">
                    {it[L]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Estudios: misiones ── */}
      <section className="bw-sec" id="estudios">
        <Cabecera id="estudios" L={L} cifra={String(CERTIFICACIONES.length)} />
        <ul className="bw-misiones">
          {CERTIFICACIONES.map((c, i) => (
            <li
              key={c.nombre}
              className="bw-mision bw-plate bw-llega"
              style={{ '--d': `${i * 80}ms` } as React.CSSProperties}
            >
              <Icono nombre="tilde" tam={52} />
              <div className="bw-mision__texto">
                <h3 className="bw-contorno">{c.nombre}</h3>
                <small>
                  {c.casa} · {c.anio}
                </small>
                <div className="bw-barra" role="img" aria-label={TXT.completada[L]}>
                  <i />
                  <span>
                    {TXT.completada[L]} 1/1
                  </span>
                </div>
              </div>
              {c.url && (
                <a className="bw-btn bw-plate bw-plate--amarilla" href={c.url} target="_blank" rel="noopener noreferrer">
                  {TXT.ver[L]}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Guías: eventos ── */}
      <section className="bw-sec" id="guias">
        <Cabecera id="guias" L={L} cifra={String(GUIAS.length)} />
        <div className="bw-eventos">
          {GUIAS.map((g, i) => (
            <article
              key={g.href}
              className={`bw-evento bw-plate bw-llega bw-evento--${i === 0 ? 'azul' : 'violeta'}`}
              style={{ '--d': `${i * 90}ms` } as React.CSSProperties}
            >
              <div className="bw-evento__cartel">
                <Icono nombre="libro" tam={84} />
                <span className="bw-valor">{g.meta[L]}</span>
              </div>
              <div className="bw-evento__cuerpo">
                <h3 className="bw-contorno">{g.titulo}</h3>
                <p>{g.texto[L]}</p>
                <button className="bw-btn bw-plate bw-plate--amarilla" onClick={() => navigate(g.href)}>
                  {TXT.leer[L]}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Contacto: siguiente partida ── */}
      <section className="bw-sec bw-final" id="contacto">
        <div className="bw-final__rayos" aria-hidden="true" />
        <span className="bw-bandera bw-llega">
          {sec('contacto').n} · {SUBTITULO.contacto[L]}
        </span>
        <h2 className="bw-contorno bw-contorno--grande bw-llega">
          {CONTACTO.titular[L].map((l, i) => (
            <span key={l} className={i === CONTACTO.titular[L].length - 1 ? 'bw-amarillo' : undefined}>
              {l}
            </span>
          ))}
        </h2>
        <p className="bw-final__bajada bw-plate bw-llega">{CONTACTO.bajada[L]}</p>
        <a className="bw-jugar bw-final__mail bw-btn bw-plate bw-plate--amarilla bw-llega" href={`mailto:${CONTACTO.email}`}>
          <Icono nombre="sobre" tam={44} />
          {CONTACTO.email}
        </a>
        <div className="bw-final__enlaces bw-llega">
          {CONTACTO.enlaces.map((e) => (
            <a
              key={e.label}
              className="bw-btn bw-plate"
              href={e.href}
              target={e.externo ? '_blank' : undefined}
              rel={e.externo ? 'noopener noreferrer' : undefined}
              download={e.label === 'CV' ? true : undefined}
            >
              {e.label}
            </a>
          ))}
        </div>
        <footer className="bw-pie">
          <span>© 2026 {IDENTIDAD.nombre}</span>
          <span>{IDENTIDAD.lugar[L]} · UTC-3</span>
        </footer>
      </section>

      {/* ── Barra de pestañas ── */}
      <nav className="bw-pestanas" aria-label={L === 'es' ? 'Navegación' : 'Navigation'}>
        <div className="bw-pestanas__lista" ref={pestanaRef}>
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => irA(e, s.id)}
              className={`bw-pestana${activa === s.id ? ' is-activa' : ''}`}
              aria-current={activa === s.id ? 'true' : undefined}
            >
              <Icono nombre={ICONO_SECCION[s.id]} tam={28} />
              <span>{s.id === 'top' ? 'Lobby' : s.label[L]}</span>
            </a>
          ))}
        </div>
        <div className="bw-pestanas__extra">
          <button className="bw-btn bw-plate bw-idioma" onClick={alCambiarIdioma} aria-label={TXT.idioma[L]}>
            {L === 'es' ? 'EN' : 'ES'}
          </button>
          {selector}
        </div>
      </nav>
    </div>
  );
};

export default BrawlPagina;
