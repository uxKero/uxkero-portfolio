import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Chevron, FiguraAgente, FiguraCapas, Triangulos } from './Planchas';
import Volumen from './Volumen';
import Nubes from './Nubes';
import Escritorio from './Escritorio';
import LaminaDither from './LaminaDither';

// ─────────────────────────────────────────────────────────────────────────────
// TypeSafe. El portfolio como plancha de imprenta: cada bloque va registrado
// con sus cuatro escuadras de recorte y su rótulo mono en notación de archivo,
// montado sobre el borde. La superficie alterna sola y eso separa las
// secciones: no hay un solo separador en toda la página.
//
// Tres decisiones que salieron de mirar el sistema original, no el resumen:
// - Los titulares de sección van CENTRADOS, cada uno dentro de su propia
//   escuadra, como una plancha aparte de lo que viene abajo.
// - El marcador macizo es para etiquetas mono (nombres dentro de tablas y
//   ventanas). Un titular display nunca lleva fondo sólido.
// - Los paneles y las ventanas no flotan sobre la superficie: viven dentro de
//   un campo tramado con filete, y el rótulo se monta sobre ese filete.
//
// Regla de legibilidad que no se rompe nunca: sobre superficie de color la
// tinta es oscura. Blanco sobre rosa da 2,38:1 y acá no aparece una sola vez.
// La nube de medio tono invierte luminancia dentro de sí misma, así que no
// lleva una sola letra encima.
// ─────────────────────────────────────────────────────────────────────────────

type L = 'es' | 'en';

const TXT = {
  plancha: { es: 'Plancha', en: 'Plate' },
  codigo: { es: 'Código', en: 'Source' },
  escribir: { es: 'Empecemos', en: 'Let us start' },
  registro: { es: 'Registro de empleo', en: 'Employment record' },
  indiceProd: { es: 'Índice de productos', en: 'Products index' },
  credenciales: { es: 'Credenciales', en: 'Credentials' },
  rol: { es: 'Rol', en: 'Role' },
  casa: { es: 'Casa', en: 'Org' },
  contexto: { es: 'Contexto', en: 'Context' },
  estado: { es: 'Estado', en: 'Status' },
  producto: { es: 'Producto', en: 'Product' },
  anio: { es: 'Año', en: 'Year' },
  certificado: { es: 'Certificado', en: 'Certificate' },
  ver: { es: 'Ver', en: 'View' },
  idioma: { es: 'Idioma', en: 'Language' },
  derechos: { es: 'Todos los derechos reservados', en: 'All rights reserved' },
  novedad: { es: 'Novedades', en: 'News' },
  novedadTexto: {
    es: 'KeroCraft ya está publicado y en uso',
    en: 'KeroCraft is published and in use',
  },
  leerMas: { es: 'Ver más', en: 'Read More' },
  publicados: {
    es: 'Publicados y en uso, no prototipos de portfolio.',
    en: 'Shipped and in use, not portfolio prototypes.',
  },
  notaTrabajo: { es: 'Cuatro casas, todas activas', en: 'Four houses, all of them active' },
  marbete: { es: 'Abrir el escritorio', en: 'Open the desktop' },
  notaOficio: {
    es: 'Ocho lecturas vivas sobre un mismo escritorio',
    en: 'Eight live readouts on one desktop',
  },
} satisfies Record<string, Bi>;

// Dos cadenas reales: si alguien las decodifica, dicen algo. Es la firma de la
// idea de este sistema, texto que es información y a la vez textura.
const B64_FICHA =
  'QWxhbiBQb25jZS4gQUkgRXhwZXJpZW5jZSBEZXNpZ25lciAmIFByb2R1Y3QgTGVhZC4gTWFyIGRlbCBQbGF0YSwgQXJnZW50aW5hLiBVVEMtMy4gdXhrZXJvQGdtYWlsLmNvbS4gQ3JlYXI6IGRlIGxhIG5lY2VzaWRhZCBhbCBwcm9kdWN0by4=';
const B64_PIE =
  'RXN0YSBwbGFuY2hhIHNlIGNvbXBvbmUgZW4gZWwgbmF2ZWdhZG9yLiBGaWxldGUgZGUgMXB4LCB0cmFtYSBkZSA1cHgsIHRpbnRhIGNhbGlkYSBzb2JyZSByb3NhLiBOYWRhIGVzdGEgaW1wcmVzbywgdG9kbyBlc3RhIHJlZ2lzdHJhZG8u';

const dominio = (url: string) =>
  url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

const irA = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
};

/**
 * La etiqueta que sigue al puntero sobre el titular. Se mueve con transform en
 * cada cuadro y no con estado de React: con estado, a 60 cuadros por segundo,
 * la etiqueta va siempre un paso atrás del cursor.
 */
const useMarbete = () => {
  const marbete = useRef<HTMLDivElement>(null);
  const zona = useRef<HTMLElement | null>(null);

  const seguir = useCallback((e: React.MouseEvent) => {
    const el = marbete.current;
    if (!el) return;
    el.style.transform = `translate3d(${e.clientX - 1}px, ${e.clientY - 1}px, 0)`;
  }, []);

  const entrar = useCallback(() => marbete.current?.classList.add('is-visible'), []);
  const salir = useCallback(() => marbete.current?.classList.remove('is-visible'), []);

  return { marbete, zona, seguir, entrar, salir };
};

/** Las cuatro escuadras de recorte. Dos las pone el bloque y dos este hijo. */
const Cruz: React.FC = () => <span className="ts-cruz" aria-hidden="true" />;

const Rotulo: React.FC<{ children: React.ReactNode; suelto?: boolean }> = ({ children, suelto }) => (
  <span className={`ts-rotulo${suelto ? ' ts-rotulo--suelto' : ''}`}>{children}</span>
);

const Puntos: React.FC = () => <span className="ts-puntos" aria-hidden="true" />;

const Trama: React.FC<{ variante?: 'sage' | 'oscura'; nube?: boolean }> = ({ variante, nube }) => (
  <span
    className={`ts-trama${variante ? ` ts-trama--${variante}` : ''}${nube ? ' ts-trama--nube' : ''}`}
    aria-hidden="true"
  />
);

interface PropsPlancha {
  id?: string;
  rotulo: string;
  superficie: 'rosa' | 'sage' | 'cielo' | 'oscura';
  trama?: boolean;
  children: React.ReactNode;
}

/** Un bloque registrado: superficie, trama, cuatro escuadras y su rótulo. */
const Plancha: React.FC<PropsPlancha> = ({ id, rotulo, superficie, trama, children }) => (
  <section id={id} className={`ts-plancha ts-s-${superficie}`}>
    {trama && (
      <Trama variante={superficie === 'sage' ? 'sage' : superficie === 'oscura' ? 'oscura' : undefined} />
    )}
    <div className="ts-marco">
      <Rotulo>{rotulo}</Rotulo>
      {children}
    </div>
  </section>
);

/** El titular de sección: centrado y dentro de su propia escuadra. */
const Cabecera: React.FC<{ lineas: string[]; nota?: React.ReactNode; grande?: boolean }> = ({
  lineas,
  nota,
  grande,
}) => (
  <div className="ts-cabecera ts-marcas">
    <Cruz />
    <h2 className={`ts-display ts-titular${grande ? '' : ' ts-display--med'}`}>
      {lineas.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </h2>
    {nota && <p className="ts-cabecera__nota">{nota}</p>}
  </div>
);

const Campo: React.FC<{ rotulo: string; children: React.ReactNode }> = ({ rotulo, children }) => (
  <div className="ts-campo">
    <Rotulo>{rotulo}</Rotulo>
    {children}
  </div>
);

const Estado: React.FC<{ texto: string; vivo?: boolean; cerrado?: boolean }> = ({
  texto,
  vivo,
  cerrado,
}) => (
  <span className={`ts-estado${vivo ? ' is-vivo' : ''}${cerrado ? ' is-cerrado' : ''}`}>
    <i aria-hidden="true" />
    {texto}
  </span>
);

const Panel: React.FC<{ titulo: string; nota?: string; children: React.ReactNode; scroll?: boolean }> = ({
  titulo,
  nota,
  children,
  scroll,
}) => (
  <div className="ts-panel">
    <div className="ts-panel__cab">
      <span>{titulo}</span>
      {nota && <span>{nota}</span>}
    </div>
    {scroll ? <div className="ts-panel__scroll">{children}</div> : children}
  </div>
);

const Ficha: React.FC<{ p: Producto; idioma: L }> = ({ p, idioma: L }) => {
  const vivo = p.estado.en === 'Live';
  // Al pasar el puntero la lámina se resuelve con su segunda receta de trama:
  // el hover es una transformación de la imagen, no un cambio de opacidad.
  const [alterna, setAlterna] = useState(false);
  const cuerpo = (
    <>
      <div className="ts-ficha__cuerpo">
        <h3 className="ts-h2">{p.nombre}</h3>
        <div className="ts-ficha__meta">
          <Estado texto={p.estado[L]} vivo={vivo} cerrado={!p.activo} />
          {p.stack && <span>{p.stack}</span>}
          {p.meta && <span>{p.meta[L]}</span>}
        </div>
        <p className="ts-cuerpo">{p.texto[L]}</p>
      </div>
      <div className="ts-ficha__pie">
        <span className="ts-micro">{p.rol[L]}</span>
        {p.url && (
          <a href={p.url} target="_blank" rel="noreferrer">
            {dominio(p.url)}
          </a>
        )}
        {p.gh && (
          <a href={p.gh} target="_blank" rel="noreferrer">
            {TXT.codigo[L]}
          </a>
        )}
      </div>
    </>
  );

  return (
    <article
      className="ts-ficha"
      onMouseEnter={() => setAlterna(true)}
      onMouseLeave={() => setAlterna(false)}
    >
      <Rotulo>{`${p.nombre}.${p.n}`}</Rotulo>
      <div className="ts-ficha__lamina">
        <LaminaDither slug={p.slug} alterna={alterna} />
      </div>
      <span className="ts-ficha__cat">
        <Rotulo>{p.estado[L]}</Rotulo>
      </span>
      {p.ancho ? <div className="ts-ficha__envoltorio">{cuerpo}</div> : cuerpo}
    </article>
  );
};

const TypeSafePagina: React.FC<PropsPagina> = ({ idioma, alCambiarIdioma, selector }) => {
  const L = idioma as L;
  const navegar = useNavigate();
  const raiz = useRef<HTMLDivElement>(null);
  const [activa, setActiva] = useState(SECCIONES[0].id);
  const [abierto, setAbierto] = useState<number | null>(null);
  const marbete = useMarbete();

  // Qué sección está en pantalla, para marcarla en el índice impreso.
  useEffect(() => {
    let pedido = 0;
    const medir = () => {
      pedido = 0;
      const linea = window.scrollY + window.innerHeight * 0.35;
      let actual = SECCIONES[0].id;
      SECCIONES.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= linea) actual = s.id;
      });
      setActiva(actual);
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

  const destacados = PRODUCTOS.filter((p) => p.destacado);
  const resto = PRODUCTOS.filter((p) => !p.destacado);
  const destacado = destacados[0];

  const abrirGuia = useCallback(
    (href: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      navegar(href);
    },
    [navegar],
  );

  const etiqueta = (i: number) => SECCIONES[i].label[L].toUpperCase();

  return (
    <div className="ts-pagina" ref={raiz}>
      {/* La tinta cálida como duotono: el retrato y las láminas se llevan a la
          misma tinta con la que está compuesta la página. */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="ts-duo-tinta" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.235 0.996" />
            <feFuncG type="table" tableValues="0.176 0.996" />
            <feFuncB type="table" tableValues="0.192 0.996" />
          </feComponentTransfer>
        </filter>
      </svg>

      <div className="ts-marbete" ref={marbete.marbete} aria-hidden="true">
        {/* La cabeza del puntero con sus alitas y la muesca del medio, sin el
            vástago: un triángulo liso no se lee como cursor. */}
        <svg className="ts-marbete__puntero" width="19" height="24" viewBox="0 0 19 24" fill="none">
          <path
            d="M1.6 1.4v19.2l5.1-5.1h7.8z"
            fill="currentColor"
            stroke="#fefefe"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        <span>{TXT.marbete[L]}</span>
        <i>
          <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
            <path d="M0 0l10 6-10 6z" />
          </svg>
        </i>
      </div>

      {/* ── 00 Portada ───────────────────────────────────────────────────────
          Cielo, nube de medio tono magenta y una ventana de novedades flotando
          en el hueco. El titular arranca recién donde la nube termina. */}
      <section id="top" className="ts-portada">
        <Nubes />
        <div className="ts-portada__chips">
          <span className="ts-chip ts-chip--mono">{IDENTIDAD.marca}</span>
          <button className="ts-chip ts-chip--mono" onClick={alCambiarIdioma}>
            {TXT.idioma[L]}: {L === 'es' ? 'ES' : 'EN'}
          </button>
          {selector}
        </div>

        <div className="ts-noticia">
            <div className="ts-noticia__cab">
              {new Date().toLocaleDateString(L === 'es' ? 'es-AR' : 'en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {'  ▪  '}
              {IDENTIDAD.marca} {TXT.novedad[L]}
            </div>
            <div className="ts-noticia__cuerpo">
              <p>{TXT.novedadTexto[L]}</p>
              {destacado?.url && (
                <a href={destacado.url} target="_blank" rel="noreferrer">
                  {TXT.leerMas[L]}
                </a>
              )}
            </div>
        </div>

        <div className="ts-portada__marco ts-marcas">
          <Cruz />
          <span className="ts-b64-vertical" aria-hidden="true">
            {B64_FICHA}
          </span>

          <div className="ts-portada__abajo">
          <p className="ts-ticker">
            <b>{IDENTIDAD.nombre}</b>
            <Puntos />
            <b>{HERO.bajada[L]}</b>
          </p>

          <h1
            className="ts-display ts-titular"
            onMouseEnter={marbete.entrar}
            onMouseLeave={marbete.salir}
            onMouseMove={marbete.seguir}
            onClick={() => irA('oficio')}
            style={{ pointerEvents: 'auto' }}
          >
            {HERO.titular[L].map((linea) => (
              <span key={linea.texto}>{linea.texto}</span>
            ))}
          </h1>

          <div className="ts-portada__pie">
            <button className="ts-cta" onClick={() => irA('productos')}>
              <u>{HERO.cta[L]}</u>
            </button>
            <button className="ts-cta" onClick={() => irA('contacto')}>
              <u>{HERO.ctaSecundaria[L]}</u>
            </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Índice impreso: es la navegación ─────────────────────────────── */}
      <Plancha rotulo="Index.Plate" superficie="rosa">
        <div className="ts-indice ts-marcas">
          <Cruz />
          <ul className="ts-indice__lista">
          {SECCIONES.map((s) => (
            <li key={s.id}>
              <button
                className={`ts-indice__item${s.id === activa ? ' is-activo' : ''}`}
                onClick={() => irA(s.id)}
              >
                <b>{s.n}</b>
                <b className="ts-indice__nombre">{s.label[L].toUpperCase()}</b>
                <Puntos />
                <b>
                  {TXT.plancha[L]} {s.n}
                </b>
              </button>
              </li>
            ))}
          </ul>
        </div>
      </Plancha>

      {/* ── Cifras ───────────────────────────────────────────────────────── */}
      <Plancha rotulo="Track.Record" superficie="rosa" trama>
        <div className="ts-datos ts-marcas">
          <Cruz />
          {DATOS.map((d) => (
            <div className="ts-dato" key={d.cifra}>
              <span className="ts-dato__cifra">{d.cifra}</span>
              <p className="ts-dato__titulo">{d.titulo[L]}</p>
              <p className="ts-cuerpo">{d.contexto[L]}</p>
            </div>
          ))}
        </div>
      </Plancha>

      {/* ── Oficio: el escritorio del oficio ────────────────────────────── */}
      <section id="oficio" className="ts-plancha ts-s-rosa ts-craft-seccion">
        <Trama />
        <div className="ts-marco">
          <Rotulo>Craft.OS</Rotulo>
          <Cabecera lineas={[etiqueta(4)]} nota={TXT.notaOficio[L]} />
          <div>
            <Escritorio idioma={L} />
          </div>
        </div>
      </section>

      {/* ── 01 Perfil ────────────────────────────────────────────────────── */}
      <Plancha id="perfil" rotulo="Manifesto.01" superficie="sage" trama>
        <Cabecera lineas={MANIFIESTO.titular[L]} grande />
        <div className="ts-perfil__reja">
          <div className="ts-columnas">
            {MANIFIESTO.parrafos[L].map((p, i) => (
              <div className="ts-columna" key={p.slice(0, 24)}>
                <span className="ts-kicker">Manifesto.0{i + 1}</span>
                <p className="ts-cuerpo ts-cuerpo--fuerte">{p}</p>
              </div>
            ))}
          </div>
          <figure className="ts-retrato">
            <img src="/editorial/retrato.png" alt={IDENTIDAD.nombre} loading="lazy" />
            <figcaption>{MANIFIESTO.pieDeFoto[L]}</figcaption>
          </figure>
        </div>
      </Plancha>

      {/* ── 02 Trabajo ───────────────────────────────────────────────────── */}
      <Plancha id="trabajo" rotulo="Work.Log" superficie="oscura" trama>
        <Cabecera lineas={[etiqueta(2)]} nota={TXT.notaTrabajo[L]} />
        <Campo rotulo="Work.Table">
          <Panel titulo={TXT.registro[L]} nota="2013 / 2026" scroll>
            <table className="ts-tabla">
              <thead>
                <tr>
                  <th />
                  <th>{TXT.rol[L]}</th>
                  <th>{TXT.casa[L]}</th>
                  <th>{TXT.contexto[L]}</th>
                  <th>{TXT.estado[L]}</th>
                </tr>
              </thead>
              <tbody>
                {TRABAJO.map((t) => (
                  <tr key={t.org}>
                    <td className="ts-tabla__n">{t.n}</td>
                    <td>{t.rol[L]}</td>
                    <td>
                      {t.url ? (
                        <a href={t.url} target="_blank" rel="noreferrer">
                          <span className="ts-marcador">{t.org}</span>
                        </a>
                      ) : (
                        <span className="ts-marcador">{t.org}</span>
                      )}
                    </td>
                    <td>{t.contexto[L]}</td>
                    <td>
                      <Estado texto={t.estado[L]} vivo={t.activo} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Campo>
      </Plancha>

      {/* ── 03 Productos ─────────────────────────────────────────────────── */}
      <Plancha id="productos" rotulo="Products.Index" superficie="rosa" trama>
        <Cabecera lineas={[etiqueta(3)]} nota={TXT.publicados[L]} />

        <div className="ts-destacados">
          {destacados.map((p) => (
            <Ficha key={p.slug} p={p} idioma={L} />
          ))}
        </div>

        <div className="ts-grilla">
          {resto.map((p) => (
            <div key={p.slug} className={p.ancho ? 'is-ancho' : undefined}>
              <Ficha p={p} idioma={L} />
            </div>
          ))}
        </div>

        {/* El índice de los doce, en acordeón. Arranca cerrado, así lo que ya
            dicen las fichas de arriba no queda dos veces en pantalla, y la
            pregunta en mono contra la respuesta en grotesca grande es el gesto
            propio de este componente. */}
        <div className="ts-tabla-productos">
          <Campo rotulo="Products.Table">
            <div className="ts-faq-bloque">
              <p className="ts-faq-bloque__cab">
                <span>{TXT.indiceProd[L]}</span>
                <span>
                  {PRODUCTOS.length} / {PRODUCTOS.length}
                </span>
              </p>
              <div className="ts-faq">
                {PRODUCTOS.map((p, i) => {
                  const esta = abierto === i;
                  return (
                    <div className={`ts-faq__item${esta ? ' is-abierto' : ''}`} key={p.slug}>
                      <button
                        className="ts-faq__q"
                        aria-expanded={esta}
                        onClick={() => setAbierto(esta ? null : i)}
                      >
                        <span className="ts-faq__fila">
                          <b className="ts-faq__n">{p.n}</b>
                          <b className="ts-faq__nombre">{p.nombre}</b>
                          <Puntos />
                          <Estado
                            texto={p.estado[L]}
                            vivo={p.estado.en === 'Live'}
                            cerrado={!p.activo}
                          />
                        </span>
                        <span className="ts-chevron" aria-hidden="true">
                          <Chevron />
                        </span>
                      </button>
                      <div className="ts-faq__r">
                        <div>
                          <p className="ts-cuerpo ts-cuerpo--fuerte">{p.texto[L]}</p>
                          <p className="ts-faq__pie">
                            <span className="ts-micro">{p.rol[L]}</span>
                            {p.stack && <span className="ts-micro">{p.stack}</span>}
                            {p.meta && <span className="ts-micro">{p.meta[L]}</span>}
                            {p.url && (
                              <a href={p.url} target="_blank" rel="noreferrer">
                                {dominio(p.url)}
                              </a>
                            )}
                            {p.gh && (
                              <a href={p.gh} target="_blank" rel="noreferrer">
                                {TXT.codigo[L]}
                              </a>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Campo>
        </div>
      </Plancha>

      {/* ── 05 Estudios ──────────────────────────────────────────────────── */}
      <Plancha id="estudios" rotulo="Credentials.Plate" superficie="cielo">
        <Cabecera lineas={[etiqueta(5)]} />
        <Campo rotulo="Credentials.Table">
          <Panel
            titulo={TXT.credenciales[L]}
            nota={`${CERTIFICACIONES.length} / ${CERTIFICACIONES.length}`}
            scroll
          >
            <table className="ts-tabla">
              <thead>
                <tr>
                  <th />
                  <th>{TXT.certificado[L]}</th>
                  <th>{TXT.casa[L]}</th>
                  <th>{TXT.anio[L]}</th>
                  <th className="ts-tabla__num">{TXT.ver[L]}</th>
                </tr>
              </thead>
              <tbody>
                {CERTIFICACIONES.map((c, i) => (
                  <tr key={c.nombre}>
                    <td className="ts-tabla__n">{String(i + 1).padStart(2, '0')}</td>
                    <td>{c.nombre}</td>
                    <td>
                      <span className="ts-marcador">{c.casa}</span>
                    </td>
                    <td className="ts-tabla__num">{c.anio}</td>
                    <td className="ts-tabla__num">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noreferrer">
                          coursera.org
                        </a>
                      ) : (
                        <span style={{ opacity: 0.4 }}>/</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Campo>
      </Plancha>

      {/* ── 06 Guías ─────────────────────────────────────────────────────── */}
      <Plancha id="guias" rotulo="Guides.Fig" superficie="sage" trama>
        <Cabecera lineas={[etiqueta(6)]} />
        <div className="ts-guias__grilla">
          {GUIAS.map((g, i) => (
            <article className="ts-guia" key={g.href}>
              <div className="ts-tecnica">
                {i === 0 ? <FiguraAgente fig="Fig. 1" /> : <FiguraCapas fig="Fig. 2" />}
                <span className="ts-guia__tag">
                  <Rotulo>{g.meta[L]}</Rotulo>
                </span>
              </div>
              <h3 className="ts-h2">{g.titulo}</h3>
              <p className="ts-cuerpo">{g.texto[L]}</p>
              <a className="ts-leer" href={g.href} onClick={abrirGuia(g.href)}>
                {TXT.leerMas[L]}
              </a>
            </article>
          ))}
        </div>
      </Plancha>

      {/* ── 07 Contacto ──────────────────────────────────────────────────── */}
      <Plancha id="contacto" rotulo="Contact.Out" superficie="oscura" trama>
        <Volumen className="ts-alambre" size={340} />
        <Cabecera lineas={CONTACTO.titular[L]} grande />
        <div className="ts-contacto__reja">
          <div>
            <p className="ts-cuerpo ts-cuerpo--fuerte">{CONTACTO.bajada[L]}</p>
            <a className="ts-cta" href={`mailto:${CONTACTO.email}`} style={{ marginTop: 32 }}>
              <span>{TXT.escribir[L]}</span>
              <Triangulos />
              <u>{CONTACTO.email}</u>
            </a>
          </div>
          <div>
            <Rotulo suelto>Contact.Links</Rotulo>
            <div className="ts-enlaces" style={{ marginTop: 14 }}>
              {CONTACTO.enlaces.map((e) => (
                <a
                  key={e.label}
                  href={e.href}
                  target={e.externo ? '_blank' : undefined}
                  rel={e.externo ? 'noreferrer' : undefined}
                >
                  {e.label}
                </a>
              ))}
            </div>
            <p className="ts-b64" style={{ marginTop: 20 }}>
              {B64_PIE}
            </p>
          </div>
        </div>
      </Plancha>

      <footer className="ts-pie">
        <span>
          {'©'} {new Date().getFullYear()} {IDENTIDAD.nombre}. {TXT.derechos[L]}.
        </span>
        <span className="ts-pie__medio">{IDENTIDAD.marca} / TypeSafe / 1PX / 5PX</span>
        <span className="ts-pie__der">
          {CONTACTO.enlaces
            .filter((e) => e.externo)
            .map((e) => (
              <a key={e.label} href={e.href} target="_blank" rel="noreferrer">
                {e.label}
              </a>
            ))}
        </span>
      </footer>
    </div>
  );
};

export default TypeSafePagina;
