import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../../utils/useSEO';
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
  type Idioma,
} from './editorial-content';
import './editorial.css';

// ─────────────────────────────────────────────────────────────────────────────
// Home editorial. Secciones numeradas en vertical, como las páginas de una
// publicación. No hay barra de navegación: se navega con el riel de la derecha,
// que además marca cuánto se leyó. El texto vive en editorial-content.ts.
// ─────────────────────────────────────────────────────────────────────────────

const Flecha: React.FC = () => (
  <svg className="ed-flecha" width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
    <path d="M0 5h14M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

/** Aparición secuencial: fundido y desplazamiento corto, una sola vez. */
const useReveal = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;

    const objetivos = Array.from(raiz.querySelectorAll<HTMLElement>('.ed-reveal'));
    if (!('IntersectionObserver' in window)) {
      objetivos.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    objetivos.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return ref;
};

/** Qué sección está en pantalla y cuánto se avanzó en la lectura. */
const useLectura = () => {
  const [activa, setActiva] = useState(SECCIONES[0].id);
  const [avance, setAvance] = useState(0);

  useEffect(() => {
    let pedido = 0;

    const medir = () => {
      pedido = 0;
      const linea = window.scrollY + window.innerHeight * 0.4;
      let actual = SECCIONES[0].id;
      SECCIONES.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= linea) actual = s.id;
      });
      setActiva(actual);

      const recorrido = document.documentElement.scrollHeight - window.innerHeight;
      setAvance(recorrido > 0 ? Math.min(1, Math.max(0, window.scrollY / recorrido)) : 0);
    };

    const alScrollear = () => {
      if (!pedido) pedido = window.requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener('scroll', alScrollear, { passive: true });
    window.addEventListener('resize', alScrollear);
    return () => {
      window.removeEventListener('scroll', alScrollear);
      window.removeEventListener('resize', alScrollear);
      if (pedido) window.cancelAnimationFrame(pedido);
    };
  }, []);

  return { activa, avance };
};

/** El dominio pelado, que es lo que hay que leer en un enlace. */
const dominio = (url: string) => url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

/** Busca una sección por id: así el orden del índice no ata a los renderizados. */
const sec = (id: string) => SECCIONES.find((s) => s.id === id) ?? SECCIONES[0];

const CabeceraSeccion: React.FC<{ n: string; label: string }> = ({ n, label }) => (
  <div className="ed-sec__head ed-reveal">
    <span className="ed-sec__n">{n}</span>
    <span className="ed-sec__label">{label}</span>
    <span className="ed-sec__linea" />
  </div>
);

const Editorial: React.FC = () => {
  const navigate = useNavigate();
  // El portfolio apunta a roles remotos: arranca en inglés y el riel ofrece ES.
  const [idioma, setIdioma] = useState<Idioma>('en');
  const [menu, setMenu] = useState(false);
  const L = idioma;
  const ref = useReveal();
  const { activa, avance } = useLectura();

  useSEO({
    title: 'Alan Ponce | AI Experience Designer & Product Lead | UXKERO',
    description:
      'AI Experience Designer and Product Lead. Product design for systems that decide, and agent assisted development all the way to production. Mar del Plata, Argentina.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    type: 'website',
  });

  // El papel también tiene que estar detrás del scroll, no solo en el contenedor.
  useEffect(() => {
    document.body.classList.add('ed-page');
    document.documentElement.classList.remove('dark');
    return () => {
      document.body.classList.remove('ed-page');
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu]);

  const irA = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
  }, []);

  // ── Lámina al pasar por un proyecto ──────────────────────────────────────
  // Cada producto tiene su lámina impresa en /editorial/proyectos. Aparece al
  // lado del puntero, del lado donde haya lugar, y nunca en pantallas táctiles.
  const [lamina, setLamina] = useState<{ slug: string; x: number; y: number } | null>(null);
  const laminasListas = useRef(false);

  const precargarLaminas = useCallback(() => {
    if (laminasListas.current) return;
    laminasListas.current = true;
    PRODUCTOS.forEach((p) => {
      const img = new Image();
      img.src = `/editorial/proyectos/${p.slug}.jpg`;
    });
  }, []);

  const abrirLamina = useCallback((e: React.MouseEvent, slug: string) => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    setLamina({ slug, x: e.clientX, y: e.clientY });
  }, []);

  const moverLamina = useCallback((e: React.MouseEvent) => {
    setLamina((l) => (l ? { ...l, x: e.clientX, y: e.clientY } : l));
  }, []);

  const cerrarLamina = useCallback(() => setLamina(null), []);

  const destacados = PRODUCTOS.filter((p) => p.destacado);
  const resto = PRODUCTOS.filter((p) => !p.destacado);
  const indiceActivo = Math.max(0, SECCIONES.findIndex((s) => s.id === activa));

  const ANCHO_LAMINA = 380;
  const ALTO_LAMINA = 200;
  const posicionLamina = lamina
    ? {
        left:
          lamina.x + 28 + ANCHO_LAMINA > window.innerWidth - 16
            ? Math.max(16, lamina.x - 28 - ANCHO_LAMINA)
            : lamina.x + 28,
        top: Math.min(Math.max(16, lamina.y - ALTO_LAMINA / 2), window.innerHeight - ALTO_LAMINA - 16),
      }
    : null;

  return (
    <div className="ed-root" ref={ref} lang={L}>
      {/* ── Riel de navegación ── */}
      <nav className="ed-riel" aria-label={L === 'es' ? 'Secciones' : 'Sections'}>
        <ul className="ed-riel__lista">
          <li className="ed-riel__vara" aria-hidden="true">
            <i style={{ height: `${avance * 100}%` }} />
          </li>
          {SECCIONES.map((s) => (
            <li key={s.id}>
              <a
                className={`ed-riel__item${activa === s.id ? ' is-activa' : ''}`}
                href={`#${s.id}`}
                onClick={(e) => irA(e, s.id)}
                aria-current={activa === s.id ? 'true' : undefined}
              >
                <span className="ed-riel__nombre">{s.label[L]}</span>
                <span className="ed-riel__n">{s.n}</span>
                <span className="ed-riel__marca" />
              </a>
            </li>
          ))}
        </ul>
        <div className="ed-riel__pie">
          <span className="ed-riel__contador">
            <b>{SECCIONES[indiceActivo].n}</b> / {SECCIONES[SECCIONES.length - 1].n}
          </span>
          <button
            className="ed-idioma"
            onClick={() => setIdioma(L === 'es' ? 'en' : 'es')}
            aria-label={L === 'es' ? 'Switch to English' : 'Cambiar a español'}
          >
            {L === 'es' ? 'EN' : 'ES'}
          </button>
        </div>
      </nav>

      {/* ── Lámina del proyecto ── */}
      {lamina && posicionLamina && (
        <figure className="ed-lamina" style={posicionLamina} aria-hidden="true">
          <img src={`/editorial/proyectos/${lamina.slug}.jpg`} alt="" width={720} height={378} />
        </figure>
      )}

      {/* ── Índice en pantallas chicas ── */}
      <button className="ed-indice-btn" onClick={() => setMenu(true)}>
        {L === 'es' ? 'Índice' : 'Index'}
      </button>

      {menu && (
        <div className="ed-menu">
          <div className="ed-menu__top">
            <span className="ed-marca">
              {IDENTIDAD.nombre} <span>{IDENTIDAD.marca}</span>
            </span>
            <button className="ed-menu__cerrar" onClick={() => setMenu(false)}>
              {L === 'es' ? 'Cerrar' : 'Close'}
            </button>
          </div>
          <ul className="ed-menu__lista">
            {SECCIONES.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    setMenu(false);
                    irA(e, s.id);
                  }}
                >
                  <em>{s.n}</em>
                  {s.label[L]}
                </a>
              </li>
            ))}
          </ul>
          <div className="ed-menu__pie">
            <a className="ed-btn" href={`mailto:${CONTACTO.email}`}>
              {HERO.ctaSecundaria[L]}
              <Flecha />
            </a>
            <button className="ed-idioma" onClick={() => setIdioma(L === 'es' ? 'en' : 'es')}>
              {L === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>
      )}

      {/* ── Portada: firma y hero, ajustados al alto de la pantalla ── */}
      <div className="ed-portada" id="top">
        <div className="ed-shell">
          <div className="ed-masthead">
            <span className="ed-marca">
              {IDENTIDAD.nombre} <span>{IDENTIDAD.marca}</span>
            </span>
            <span className="ed-masthead__der">{IDENTIDAD.lugar[L]}</span>
          </div>
        </div>

        <section className="ed-hero">
          <div className="ed-shell">
            <div className="ed-hero__grid">
              <div>
                <p className="ed-eyebrow ed-reveal">{HERO.eyebrow[L]}</p>
                <h1 className="ed-titular ed-reveal" data-delay="1">
                  {HERO.titular[L].map((linea) => (
                    <span key={linea.texto} className={linea.acento ? 'ed-acento' : undefined}>
                      {linea.texto}
                    </span>
                  ))}
                </h1>
              </div>

              <div className="ed-hero__pie">
                <p className="ed-bajada ed-reveal" data-delay="2">
                  {HERO.bajada[L]}
                </p>
                <div className="ed-hero__acciones ed-reveal" data-delay="3">
                  <a className="ed-btn" href="#trabajo" onClick={(e) => irA(e, 'trabajo')}>
                    {HERO.cta[L]}
                    <Flecha />
                  </a>
                  <a className="ed-btn ed-btn--sec" href={`mailto:${CONTACTO.email}`}>
                    {HERO.ctaSecundaria[L]}
                  </a>
                </div>
                <p className="ed-hero__estado ed-reveal" data-delay="3">
                  <span className="ed-punto" />
                  {IDENTIDAD.estado[L]}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Datos ── */}
      <div className="ed-shell">
        <div className="ed-datos">
          {DATOS.map((d, i) => (
            <div className="ed-dato ed-reveal" data-delay={String(i)} key={d.cifra}>
              <div className="ed-dato__cifra">{d.cifra}</div>
              <h2 className="ed-dato__titulo">{d.titulo[L]}</h2>
              <p className="ed-dato__contexto">{d.contexto[L]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 01 Perfil ── */}
      <section className="ed-sec" id="perfil">
        <div className="ed-shell">
          <CabeceraSeccion n={sec('perfil').n} label={sec('perfil').label[L]} />
          <div className="ed-manifiesto">
            <div>
              <h2 className="ed-titular ed-reveal">
                {MANIFIESTO.titular[L].map((linea) => (
                  <span key={linea}>{linea}</span>
                ))}
              </h2>
              <div className="ed-manifiesto__texto">
                {MANIFIESTO.parrafos[L].map((p, i) => (
                  <p className="ed-parrafo ed-reveal" data-delay={String(i + 1)} key={p.slice(0, 24)}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <figure className="ed-retrato ed-reveal" data-delay="2" style={{ margin: 0 }}>
              <img
                src="/editorial/retrato.png"
                alt={L === 'es' ? 'Retrato de Alan Ponce' : 'Portrait of Alan Ponce'}
                width={1050}
                height={1400}
                loading="lazy"
              />
              <figcaption>{MANIFIESTO.pieDeFoto[L]}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── 02 Trabajo ── */}
      <section className="ed-sec" id="trabajo">
        <div className="ed-shell">
          <CabeceraSeccion n={sec('trabajo').n} label={sec('trabajo').label[L]} />
          <div className="ed-puestos">
            {TRABAJO.map((p) => (
              <article className="ed-puesto ed-reveal" key={p.org}>
                <div className="ed-puesto__n">{p.n}</div>
                <h3 className="ed-puesto__rol">{p.rol[L]}</h3>
                <p className="ed-puesto__org">
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.org}
                    </a>
                  ) : (
                    p.org
                  )}
                  {' · '}
                  {p.contexto[L]}
                </p>
                <span className={`ed-estado${p.activo ? '' : ' ed-estado--off'}`}>
                  <i />
                  {p.estado[L]}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 Productos ── */}
      <section className="ed-sec" id="productos" onMouseEnter={precargarLaminas}>
        <div className="ed-shell">
          <CabeceraSeccion n={sec('productos').n} label={sec('productos').label[L]} />

          <div className="ed-destacados">
            {destacados.map((p) => (
              <article
                className={`ed-destacado ed-destacado--${p.destacado} ed-reveal`}
                key={p.nombre}
                onMouseEnter={(e) => abrirLamina(e, p.slug)}
                onMouseMove={moverLamina}
                onMouseLeave={cerrarLamina}
              >
                <div className="ed-destacado__izq">
                  <p className="ed-destacado__eyebrow">{L === 'es' ? 'Producto propio' : 'My own product'}</p>
                  <h3>{p.nombre}</h3>
                  <p className="ed-destacado__rol">{p.rol[L]}</p>
                  <span className="ed-destacado__estado">
                    <i />
                    {p.estado[L]}
                  </span>
                </div>
                <div className="ed-destacado__der">
                  <p className="ed-destacado__texto">{p.texto[L]}</p>
                  <div className="ed-destacado__pie">
                    <span>{p.stack}</span>
                    {p.url && (
                      <a className="ed-accion" href={p.url} target="_blank" rel="noopener noreferrer">
                        {dominio(p.url)}
                        <Flecha />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="ed-productos">
            {resto.map((p, i) => (
              <article
                className={`ed-producto ed-reveal${p.activo ? '' : ' ed-producto--cerrado'}${
                  p.ancho ? ' ed-producto--ancho' : ''
                }`}
                data-delay={String(i % 3)}
                key={p.nombre}
                onMouseEnter={(e) => abrirLamina(e, p.slug)}
                onMouseMove={moverLamina}
                onMouseLeave={cerrarLamina}
              >
                <div className="ed-producto__titulo">
                  <span className="ed-producto__n">{p.n}</span>
                  <h3>{p.nombre}</h3>
                  <p className="ed-producto__rol">{p.rol[L]}</p>
                </div>
                <div className="ed-producto__cuerpo">
                  <p className="ed-producto__texto">{p.texto[L]}</p>
                  {p.meta && <p className="ed-producto__meta">{p.meta[L]}</p>}
                </div>
                <div className="ed-producto__pie">
                  <span className={`ed-estado${p.activo ? '' : ' ed-estado--off'}`} style={{ marginTop: 0 }}>
                    <i />
                    {p.estado[L]}
                  </span>
                  <span className="ed-producto__enlaces">
                    {p.url && (
                      <a className="ed-accion" href={p.url} target="_blank" rel="noopener noreferrer">
                        {L === 'es' ? 'Sitio' : 'Site'}
                        <Flecha />
                      </a>
                    )}
                    {p.gh && (
                      <a className="ed-accion" href={p.gh} target="_blank" rel="noopener noreferrer">
                        GitHub
                        <Flecha />
                      </a>
                    )}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      {/* ── 04 Oficio ── */}
      <section className="ed-sec" id="oficio">
        <div className="ed-shell">
          <CabeceraSeccion n={sec('oficio').n} label={sec('oficio').label[L]} />
          <div className="ed-oficio">
            {OFICIO.map((grupo, i) => (
              <div className="ed-oficio__col ed-reveal" data-delay={String(i % 3)} key={grupo.titulo.es}>
                <h3>{grupo.titulo[L]}</h3>
                <ul>
                  {grupo.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 Estudios ── */}
      <section className="ed-sec" id="estudios">
        <div className="ed-shell">
          <CabeceraSeccion n={sec('estudios').n} label={sec('estudios').label[L]} />
          <div className="ed-certs">
            {CERTIFICACIONES.map((c, i) => {
              const contenido = (
                <>
                  <span className="ed-cert__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ed-cert__nombre">{c.nombre}</span>
                  <span className="ed-cert__casa">
                    {c.casa} · {c.anio}
                  </span>
                </>
              );
              return c.url ? (
                <a className="ed-cert ed-reveal" href={c.url} target="_blank" rel="noopener noreferrer" key={c.nombre}>
                  {contenido}
                </a>
              ) : (
                <div className="ed-cert ed-reveal" key={c.nombre}>
                  {contenido}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 06 Guías ── */}
      <section className="ed-sec" id="guias">
        <div className="ed-shell">
          <CabeceraSeccion n={sec('guias').n} label={sec('guias').label[L]} />
          <div className="ed-guias">
            {GUIAS.map((g, i) => (
              <button className="ed-guia ed-reveal" data-delay={String(i)} key={g.href} onClick={() => navigate(g.href)}>
                <h3>{g.titulo}</h3>
                <p>{g.texto[L]}</p>
                <div className="ed-guia__pie">
                  <span>{g.meta[L]}</span>
                  <span className="ed-accion">
                    {L === 'es' ? 'Leer' : 'Read'}
                    <Flecha />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07 Contacto ── */}
      <section className="ed-contacto" id="contacto">
        <div className="ed-shell">
          <p className="ed-eyebrow ed-reveal">
            {sec('contacto').n} · {sec('contacto').label[L]}
          </p>
          <h2 className="ed-titular ed-reveal" data-delay="1" style={{ marginTop: 20 }}>
            {CONTACTO.titular[L].map((linea, i) => (
              <span key={linea} className={i === CONTACTO.titular[L].length - 1 ? 'ed-acento' : undefined}>
                {linea}
              </span>
            ))}
          </h2>
          <p className="ed-bajada ed-reveal" data-delay="2" style={{ marginTop: 28 }}>
            {CONTACTO.bajada[L]}
          </p>
          <a className="ed-contacto__mail ed-reveal" data-delay="2" href={`mailto:${CONTACTO.email}`}>
            {CONTACTO.email}
          </a>
          <div className="ed-contacto__enlaces ed-reveal" data-delay="3">
            {CONTACTO.enlaces.map((e) => (
              <a
                key={e.label}
                href={e.href}
                target={e.externo ? '_blank' : undefined}
                rel={e.externo ? 'noopener noreferrer' : undefined}
                download={e.label === 'CV' ? true : undefined}
              >
                {e.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="ed-shell">
        <div className="ed-foot">
          <span>© 2026 {IDENTIDAD.nombre}</span>
          <span>{IDENTIDAD.lugar[L]} · UTC-3</span>
        </div>
      </footer>
    </div>
  );
};

export default Editorial;
