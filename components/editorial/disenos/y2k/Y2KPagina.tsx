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
import { Destello, Pixel, type NombrePixel } from './Pixeles';

// ─────────────────────────────────────────────────────────────────────────────
// Y2K Chrome. El portfolio como escritorio de fin de milenio: la interfaz es
// ornamento y además es la estructura. Portada de collage en modo Electric con
// una cascada de diálogos cuyo frente es el llamado real; productos como
// ventanas que se arrastran, minimizan y maximizan; trabajo como explorador de
// archivos; perfil como publicidad de revista en modo Ice; oficio como menús
// contextuales; estudios como instalador; guías como ventanas de ayuda y
// contacto como un mensaje nuevo. Se navega con una barra de tareas.
// Regla de capas: lo decorativo puede rotar o ser ilegible; lo que se lee va
// en Verdana sobre navy o papel, sin trama encima.
// ─────────────────────────────────────────────────────────────────────────────

type L = 'es' | 'en';

const TXT = {
  inicio: { es: 'Inicio', en: 'Home' },
  sitio: { es: 'Visitar sitio', en: 'Visit site' },
  abrir: { es: 'Abrir', en: 'Open' },
  enviar: { es: 'Enviar', en: 'Send' },
  para: { es: 'Para', en: 'To' },
  asunto: { es: 'Asunto', en: 'Subject' },
  asuntoTexto: { es: 'El próximo producto', en: 'The next product' },
  nuevoMensaje: { es: 'Mensaje nuevo', en: 'New message' },
  objetos: { es: 'objetos', en: 'objects' },
  nombre: { es: 'Nombre', en: 'Name' },
  empresa: { es: 'Empresa', en: 'Company' },
  tipo: { es: 'Tipo', en: 'Type' },
  estado: { es: 'Estado', en: 'Status' },
  instalado: { es: 'Instalado', en: 'Installed' },
  ver: { es: 'Ver', en: 'View' },
  instalando: { es: 'Certificaciones instaladas', en: 'Certifications installed' },
  deTotal: { es: 'de', en: 'of' },
  ayuda: { es: 'Ayuda', en: 'Help' },
  estadoSistema: { es: 'Estado del sistema', en: 'System status' },
  disponibleHace: { es: 'Disponible', en: 'Available' },
  salio: { es: 'YA SALIÓ', en: 'OUT NOW' },
  diseños: { es: 'Diseño', en: 'Design' },
  idioma: { es: 'Idioma', en: 'Language' },
} satisfies Record<string, Bi>;

// El orden de esta página: productos primero, que es lo que se viene a ver.
const ORDEN = ['top', 'productos', 'trabajo', 'perfil', 'oficio', 'estudios', 'guias', 'contacto'];

const ICONO: Record<string, NombrePixel> = {
  top: 'pc',
  productos: 'mundo',
  trabajo: 'carpeta',
  perfil: 'persona',
  oficio: 'estrella',
  estudios: 'tilde',
  guias: 'libro',
  contacto: 'sobre',
};

const etiqueta = (id: string, idioma: L) =>
  id === 'top' ? TXT.inicio[idioma] : (SECCIONES.find((s) => s.id === id)?.label[idioma] ?? id);

const dominio = (url: string) => url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

const irA = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
};

const dos = (n: number) => String(n).padStart(2, '0');

/** Hora local, para la bandeja y el timecode del visor. */
const useReloj = (cada: number) => {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && cada < 1000) return;
    const t = window.setInterval(() => setAhora(new Date()), cada);
    return () => window.clearInterval(t);
  }, [cada]);
  return ahora;
};

/** Las ventanas se abren al entrar en pantalla, de a una y a saltos. */
const useApertura = (raiz: React.RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const piezas = Array.from(el.querySelectorAll<HTMLElement>('.y2-abre'));
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            // Atributo y no clase: React reescribe className cuando la ventana cambia
            // de estado y se llevaría la marca, dejándola invisible.
            (e.target as HTMLElement).dataset.abierta = '';
            obs.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    );
    piezas.forEach((p) => obs.observe(p));
    return () => obs.disconnect();
  }, [raiz]);
};

const useSeccionActiva = () => {
  const [activa, setActiva] = useState('top');
  useEffect(() => {
    let pedido = 0;
    const medir = () => {
      pedido = 0;
      const linea = window.innerHeight * 0.4;
      let actual = 'top';
      ORDEN.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= linea) actual = id;
      });
      setActiva(actual);
    };
    const alScroll = () => {
      if (!pedido) pedido = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', alScroll);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, []);
  return activa;
};

// ── Ventana ──────────────────────────────────────────────────────────────────

interface PropsVentana {
  titulo: string;
  icono?: NombrePixel;
  className?: string;
  style?: React.CSSProperties;
  /** Ventanas de producto: se arrastran, se minimizan y se maximizan. */
  movible?: boolean;
  controles?: boolean;
  children: React.ReactNode;
  pie?: React.ReactNode;
}

const Ventana: React.FC<PropsVentana> = ({
  titulo,
  icono = 'documento',
  className,
  style,
  movible = false,
  controles = true,
  children,
  pie,
}) => {
  const [minimizada, setMinimizada] = useState(false);
  const [maximizada, setMaximizada] = useState(false);
  const [desvio, setDesvio] = useState({ x: 0, y: 0 });
  const [arriba, setArriba] = useState(false);
  const arrastre = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);

  const bajar = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!movible || !window.matchMedia('(hover: hover)').matches) return;
      if ((e.target as Element).closest('button')) return;
      arrastre.current = { x: e.clientX, y: e.clientY, dx: desvio.x, dy: desvio.y };
      e.currentTarget.setPointerCapture(e.pointerId);
      setArriba(true);
    },
    [movible, desvio],
  );

  const mover = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    if (!a) return;
    setDesvio({ x: a.dx + e.clientX - a.x, y: a.dy + e.clientY - a.y });
  }, []);

  const soltar = useCallback(() => {
    arrastre.current = null;
  }, []);

  return (
    <div
      className={`y2-ventana${className ? ` ${className}` : ''}${minimizada ? ' is-minimizada' : ''}${
        maximizada ? ' is-maximizada' : ''
      }${arriba ? ' is-arriba' : ''}${movible ? ' is-movible' : ''}`}
      style={{ ...style, translate: desvio.x || desvio.y ? `${desvio.x}px ${desvio.y}px` : undefined }}
      onPointerDown={() => {
        // La que se toca pasa adelante; las demás vuelven a su capa.
        document.querySelectorAll('.y2-ventana.is-arriba').forEach((v) => v.classList.remove('is-arriba'));
        setArriba(true);
      }}
    >
      <div
        className="y2-ventana__titulo"
        onPointerDown={bajar}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onDoubleClick={() => movible && setDesvio({ x: 0, y: 0 })}
      >
        <Pixel nombre={icono} tam={16} />
        <span className="y2-ventana__nombre">{titulo}</span>
        {controles && (
          <span className="y2-ventana__controles">
            {movible ? (
              <>
                <button
                  className="y2-control"
                  aria-label="Minimizar"
                  onClick={() => setMinimizada((m) => !m)}
                >
                  <i className="y2-control__min" />
                </button>
                <button
                  className="y2-control"
                  aria-label="Maximizar"
                  onClick={() => {
                    setMaximizada((m) => !m);
                    setMinimizada(false);
                    setDesvio({ x: 0, y: 0 });
                  }}
                >
                  <i className="y2-control__max" />
                </button>
              </>
            ) : (
              <>
                <span className="y2-control" aria-hidden="true">
                  <i className="y2-control__min" />
                </span>
                <span className="y2-control" aria-hidden="true">
                  <i className="y2-control__max" />
                </span>
              </>
            )}
            <span className="y2-control y2-control--x" aria-hidden="true">
              <i className="y2-control__x" />
            </span>
          </span>
        )}
      </div>
      <div className="y2-ventana__cuerpo">{children}</div>
      {pie && <div className="y2-ventana__pie">{pie}</div>}
    </div>
  );
};

const Boton: React.FC<
  React.PropsWithChildren<{ href?: string; onClick?: () => void; defecto?: boolean; externo?: boolean; download?: boolean }>
> = ({ href, onClick, defecto, externo, download, children }) => {
  const clase = `y2-boton${defecto ? ' y2-boton--defecto' : ''}`;
  if (href) {
    return (
      <a
        className={clase}
        href={href}
        target={externo ? '_blank' : undefined}
        rel={externo ? 'noopener noreferrer' : undefined}
        download={download || undefined}
      >
        <span>{children}</span>
      </a>
    );
  }
  return (
    <button className={clase} onClick={onClick}>
      <span>{children}</span>
    </button>
  );
};

const Imagen: React.FC<{ src: string; modo?: 'electric' | 'ice'; alt?: string; className?: string }> = ({
  src,
  modo = 'electric',
  alt = '',
  className,
}) => (
  <div className={`y2-imagen y2-imagen--${modo}${className ? ` ${className}` : ''}`}>
    <img src={src} alt={alt} loading="lazy" />
  </div>
);

const Cabecera: React.FC<{ id: string; idioma: L; ruta: string; cuenta?: number; script?: string }> = ({
  id,
  idioma,
  ruta,
  cuenta,
  script,
}) => (
  <header className="y2-cabecera y2-abre">
    <span className="y2-chip">{ruta}</span>
    <h2 className="y2-display">
      {etiqueta(id, idioma)}
      {script && <em className="y2-script">{script}</em>}
    </h2>
    {cuenta !== undefined && (
      <span className="y2-micro">
        {cuenta} {TXT.objetos[idioma]}
      </span>
    )}
  </header>
);

// ── Producto ─────────────────────────────────────────────────────────────────

const VentanaProducto: React.FC<{ p: Producto; idioma: L; i: number }> = ({ p, idioma, i }) => {
  const destacado = p.slug === 'kerocraft';
  const terminado = !p.activo;
  return (
    <Ventana
      titulo={p.url ? `${p.nombre} - [${dominio(p.url)}]` : `${p.slug}.exe`}
      icono={p.url ? 'mundo' : 'documento'}
      movible
      className={`y2-producto y2-abre${destacado ? ' y2-producto--destacado' : ''}${
        p.destacado === 'tinta' ? ' y2-producto--segundo' : ''
      }${p.ancho ? ' y2-producto--ancho' : ''}${terminado ? ' is-terminado' : ''}`}
      style={{ '--d': `${(i % 3) * 60}ms` } as React.CSSProperties}
      pie={
        <>
          <span className="y2-panel-hundido">{p.estado[idioma]}</span>
          <span className="y2-panel-hundido y2-panel-hundido--largo">{p.stack ?? `#${p.n}`}</span>
        </>
      }
    >
      {destacado && (
        <>
          <span className="y2-sello">{TXT.salio[idioma]}</span>
          <Destello tam={30} className="y2-titila" style={{ position: 'absolute', top: 44, right: 26 }} />
          <Destello tam={16} className="y2-titila y2-titila--2" style={{ position: 'absolute', top: 88, right: 70 }} />
        </>
      )}
      <Imagen src={`/editorial/proyectos/${p.slug}.jpg`} modo={terminado ? 'ice' : 'electric'} />
      <div className="y2-producto__texto">
        <h3 className="y2-display y2-display--chico">{p.nombre}</h3>
        <p className="y2-producto__rol">{p.rol[idioma]}</p>
        <div className="y2-campo">
          <p>{p.texto[idioma]}</p>
        </div>
        {p.meta && <span className="y2-chip y2-chip--amarillo">{p.meta[idioma]}</span>}
        <div className="y2-acciones">
          {p.url && (
            <Boton href={p.url} externo defecto>
              {TXT.sitio[idioma]}
            </Boton>
          )}
          {p.gh && (
            <Boton href={p.gh} externo>
              GitHub
            </Boton>
          )}
        </div>
      </div>
    </Ventana>
  );
};

// ── Página ───────────────────────────────────────────────────────────────────

const Y2KPagina: React.FC<PropsPagina> = ({ idioma, alCambiarIdioma, selector }) => {
  const navigate = useNavigate();
  const raiz = useRef<HTMLDivElement>(null);
  const activa = useSeccionActiva();
  const reloj = useReloj(1000);
  const timecode = useReloj(83);
  const [inicio, setInicio] = useState(false);
  useApertura(raiz);

  const menuInicio = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!inicio) return;
    const fuera = (e: MouseEvent) => {
      if (menuInicio.current && !menuInicio.current.contains(e.target as Node)) setInicio(false);
    };
    const escape = (e: KeyboardEvent) => e.key === 'Escape' && setInicio(false);
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', escape);
    };
  }, [inicio]);

  const tc = `${dos(timecode.getHours())}:${dos(timecode.getMinutes())}:${dos(timecode.getSeconds())}:${dos(
    Math.floor(timecode.getMilliseconds() / 40),
  )}`;
  const hora = `${dos(reloj.getHours())}:${dos(reloj.getMinutes())}`;
  const kerocraft = PRODUCTOS[0];
  const resto = PRODUCTOS.slice(1);
  const habilidades = OFICIO.flatMap((g) => g.items.map((it) => it[idioma]));

  return (
    <div className="y2-pagina" ref={raiz}>
      {/* Filtros de duotono para las imágenes: azul y amarillo, o navy y mint. */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="y2-duo-electric" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.067 0.992" />
            <feFuncG type="table" tableValues="0 0.725" />
            <feFuncB type="table" tableValues="1 0.055" />
          </feComponentTransfer>
        </filter>
        <filter id="y2-duo-ice" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0 0.875" />
            <feFuncG type="table" tableValues="0.082 0.957" />
            <feFuncB type="table" tableValues="0.2 0.961" />
          </feComponentTransfer>
        </filter>
      </svg>

      {/* Marco del lienzo con micro-etiquetas en las cuatro esquinas: capa de textura. */}
      <div className="y2-marco" aria-hidden="true">
        <span className="y2-esquina y2-esquina--ai">{IDENTIDAD.lugar[idioma]} · UTC-3</span>
        <span className="y2-esquina y2-esquina--ad">{IDENTIDAD.rol[idioma]}</span>
        <span className="y2-esquina y2-esquina--bi">EST. 2013</span>
        <span className="y2-esquina y2-esquina--bd">{IDENTIDAD.marca} · Y2K CHROME</span>
      </div>

      {/* ── Portada: collage Electric ── */}
      <section className="y2-portada" id="top">
        <div className="y2-portada__trama" aria-hidden="true" />
        <span className="y2-cromo y2-portada__marca" aria-hidden="true">
          {IDENTIDAD.marca}
        </span>
        <Destello tam={34} className="y2-titila" style={{ position: 'absolute', left: '46%', top: '12%' }} />
        <Destello tam={14} className="y2-titila y2-titila--2" style={{ position: 'absolute', left: '52%', top: '22%' }} />
        <Destello tam={22} className="y2-titila y2-titila--3" style={{ position: 'absolute', right: '6%', bottom: '30%' }} />

        <div className="y2-portada__textos">
          <span className="y2-chip y2-chip--navy">{HERO.eyebrow[idioma]}</span>
          <div className="y2-repeticion" aria-label={IDENTIDAD.nombre}>
            <span>{IDENTIDAD.nombre}</span>
            <span aria-hidden="true">{IDENTIDAD.nombre}</span>
            <span aria-hidden="true">{IDENTIDAD.nombre}</span>
          </div>
          <h1 className="y2-display y2-portada__titular">
            {HERO.titular[idioma].map((l) => (
              <span key={l.texto} className={l.acento ? 'y2-amarillo' : undefined}>
                {l.texto}
              </span>
            ))}
          </h1>
        </div>

        <figure className="y2-portada__foto">
          <Imagen src="/editorial/retrato.png" alt={IDENTIDAD.nombre} className="y2-recorte" />
          <div className="y2-visor" aria-hidden="true">
            <i className="y2-visor__esq y2-visor__esq--ai" />
            <i className="y2-visor__esq y2-visor__esq--ad" />
            <i className="y2-visor__esq y2-visor__esq--bi" />
            <i className="y2-visor__esq y2-visor__esq--bd" />
            <span className="y2-visor__rec">
              <b />
              REC
            </span>
            <span className="y2-visor__tc">{tc}</span>
            <span className="y2-visor__mira" />
          </div>
          <span className="y2-senal y2-senal--1" aria-hidden="true">
            <i />
            PRODUCT
          </span>
          <span className="y2-senal y2-senal--2" aria-hidden="true">
            <i />
            AI SYSTEMS
          </span>
          <span className="y2-senal y2-senal--3" aria-hidden="true">
            <i />
            BUILDER
          </span>
          <span className="y2-globo" aria-hidden="true">
            HELLO WORLD
          </span>
        </figure>

        {/* La cascada: los de atrás son ornamento, el de adelante es el llamado real. */}
        <div className="y2-cascada">
          {[4, 3, 2, 1].map((k) => (
            <div key={k} className="y2-cascada__fantasma" style={{ '--k': k } as React.CSSProperties} aria-hidden="true">
              <Ventana titulo={TXT.estadoSistema[idioma]} icono="aviso">
                <div className="y2-dialogo" />
              </Ventana>
            </div>
          ))}
          <Ventana titulo={TXT.estadoSistema[idioma]} icono="aviso" className="y2-cascada__frente">
            <div className="y2-dialogo">
              <Pixel nombre="aviso" tam={36} />
              <div>
                <p className="y2-dialogo__fuerte">{IDENTIDAD.estado[idioma]}</p>
                <p>{HERO.bajada[idioma]}</p>
              </div>
            </div>
            <div className="y2-acciones y2-acciones--derecha">
              <Boton defecto onClick={() => irA('productos')}>
                {HERO.cta[idioma]}
              </Boton>
              <Boton href={`mailto:${CONTACTO.email}`}>{HERO.ctaSecundaria[idioma]}</Boton>
            </div>
          </Ventana>
        </div>

        <div className="y2-marquesina" aria-hidden="true">
          <div className="y2-marquesina__pista">
            {[0, 1].map((vuelta) => (
              <span key={vuelta}>
                {habilidades.map((h) => (
                  <React.Fragment key={`${vuelta}-${h}`}>
                    {h} <b>✦</b>{' '}
                  </React.Fragment>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Productos: ventanas sobre el escritorio ── */}
      <section className="y2-sec y2-sec--escritorio" id="productos">
        <div className="y2-sec__interior">
          <Cabecera id="productos" idioma={idioma} ruta="C:\UXKERO\PRODUCTS" cuenta={PRODUCTOS.length} />
          <div className="y2-escritorio">
            <VentanaProducto p={kerocraft} idioma={idioma} i={0} />
            {resto.map((p, i) => (
              <VentanaProducto key={p.slug} p={p} idioma={idioma} i={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trabajo: explorador ── */}
      <section className="y2-sec y2-sec--navy" id="trabajo">
        <div className="y2-sec__interior">
          <Cabecera id="trabajo" idioma={idioma} ruta="C:\UXKERO\WORK" cuenta={TRABAJO.length} />
          <Ventana
            titulo={`C:\\UXKERO\\WORK`}
            icono="carpeta"
            className="y2-explorador y2-abre"
            pie={
              <>
                <span className="y2-panel-hundido">
                  {TRABAJO.length} {TXT.objetos[idioma]}
                </span>
                <span className="y2-panel-hundido y2-panel-hundido--largo">{IDENTIDAD.rol[idioma]}</span>
              </>
            }
          >
            <div className="y2-direccion">
              <span>{idioma === 'es' ? 'Dirección' : 'Address'}</span>
              <div className="y2-campo y2-campo--linea">
                <Pixel nombre="carpeta" tam={14} /> C:\UXKERO\WORK
              </div>
            </div>
            <div className="y2-tabla-marco">
              <table className="y2-tabla">
                <thead>
                  <tr>
                    <th>{TXT.nombre[idioma]}</th>
                    <th>{TXT.empresa[idioma]}</th>
                    <th>{TXT.tipo[idioma]}</th>
                    <th>{TXT.estado[idioma]}</th>
                  </tr>
                </thead>
                <tbody>
                  {TRABAJO.map((t) => (
                    <tr key={t.org}>
                      <td>
                        <Pixel nombre="carpeta" tam={16} />
                        <b>{t.rol[idioma]}</b>
                      </td>
                      <td>
                        {t.url ? (
                          <a href={t.url} target="_blank" rel="noopener noreferrer">
                            {t.org}
                          </a>
                        ) : (
                          t.org
                        )}
                      </td>
                      <td>{t.contexto[idioma]}</td>
                      <td>
                        <span className="y2-led" />
                        {t.estado[idioma]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Ventana>
        </div>
      </section>

      {/* ── Perfil: publicidad de revista, modo Ice ── */}
      <section className="y2-sec y2-sec--papel" id="perfil">
        <div className="y2-sec__interior y2-aviso">
          <div className="y2-aviso__texto y2-abre">
            <span className="y2-chip">{etiqueta('perfil', idioma)}</span>
            <p className="y2-script y2-script--grande">Alan Ponce</p>
            <h2 className="y2-display y2-display--navy">
              {MANIFIESTO.titular[idioma].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
            <div className="y2-prosa">
              {MANIFIESTO.parrafos[idioma].map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
          </div>
          <div className="y2-aviso__producto y2-abre" style={{ '--d': '120ms' } as React.CSSProperties}>
            <div className="y2-aviso__foto">
              <Imagen src="/editorial/retrato.png" modo="ice" alt={IDENTIDAD.nombre} />
              <Destello tam={28} className="y2-titila" style={{ position: 'absolute', top: 18, left: 20 }} />
              <Destello tam={14} className="y2-titila y2-titila--3" style={{ position: 'absolute', top: 60, left: 58 }} />
              <span className="y2-micro y2-aviso__pie-foto">{MANIFIESTO.pieDeFoto[idioma]}</span>
            </div>
            <table className="y2-specs">
              <caption>SPECIFICATIONS · ESPECIFICACIONES</caption>
              <tbody>
                {DATOS.map((d) => (
                  <tr key={d.cifra}>
                    <th>{d.cifra}</th>
                    <td>
                      <span lang="en">{d.titulo.en}</span>
                      <span lang="es">{d.titulo.es}</span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <th>UTC-3</th>
                  <td>
                    <span lang="en">{IDENTIDAD.estado.en}</span>
                    <span lang="es">{IDENTIDAD.estado.es}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Oficio: menús contextuales ── */}
      <section className="y2-sec y2-sec--menta" id="oficio">
        <div className="y2-sec__interior">
          <header className="y2-cabecera y2-cabecera--clara y2-abre">
            <span className="y2-chip">C:\UXKERO\CRAFT</span>
            <h2 className="y2-display y2-display--navy">{etiqueta('oficio', idioma)}</h2>
          </header>
          <div className="y2-menus">
            {OFICIO.map((g, i) => (
              <ul
                key={g.titulo.en}
                className="y2-menu y2-abre"
                style={{ '--d': `${i * 60}ms` } as React.CSSProperties}
              >
                <li className="y2-menu__titulo">
                  <Pixel nombre={(['persona', 'estrella', 'pc', 'carpeta'] as NombrePixel[])[i]} tam={16} />
                  {g.titulo[idioma]}
                </li>
                {g.items.map((it, j) => (
                  <React.Fragment key={it.en}>
                    {j > 0 && j % 3 === 0 && <li className="y2-menu__separador" aria-hidden="true" />}
                    <li className="y2-menu__item">
                      <span>{it[idioma]}</span>
                      <i aria-hidden="true">▸</i>
                    </li>
                  </React.Fragment>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* ── Estudios: instalador ── */}
      <section className="y2-sec y2-sec--papel" id="estudios">
        <div className="y2-sec__interior">
          <Ventana
            titulo={`Setup - ${etiqueta('estudios', idioma)}`}
            icono="tilde"
            className="y2-instalador y2-abre"
            pie={
              <span className="y2-panel-hundido y2-panel-hundido--largo">
                {CERTIFICACIONES.length} {TXT.deTotal[idioma]} {CERTIFICACIONES.length} ·{' '}
                {TXT.instalando[idioma]}
              </span>
            }
          >
            <div className="y2-instalador__grilla">
              <div className="y2-instalador__lado" aria-hidden="true">
                <span className="y2-cromo y2-cromo--vertical">SETUP</span>
                <Destello tam={26} className="y2-titila" style={{ position: 'absolute', top: 24, left: 26 }} />
              </div>
              <div className="y2-instalador__lista">
                <h2 className="y2-display y2-display--navy y2-display--chico">{etiqueta('estudios', idioma)}</h2>
                {CERTIFICACIONES.map((c, i) => (
                  <div className="y2-paso" key={c.nombre} style={{ '--d': `${i * 250}ms` } as React.CSSProperties}>
                    <div className="y2-paso__cabeza">
                      <Pixel nombre="tilde" tam={16} />
                      <b>{c.nombre}</b>
                      <span className="y2-micro">
                        {c.casa} · {c.anio}
                      </span>
                    </div>
                    <div className="y2-progreso" role="img" aria-label={TXT.instalado[idioma]}>
                      {Array.from({ length: 20 }, (_, k) => (
                        <i key={k} style={{ '--k': k } as React.CSSProperties} />
                      ))}
                    </div>
                    <div className="y2-paso__pie">
                      <span className="y2-micro">{TXT.instalado[idioma]} · 100%</span>
                      {c.url && (
                        <Boton href={c.url} externo>
                          {TXT.ver[idioma]}
                        </Boton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Ventana>
        </div>
      </section>

      {/* ── Guías: ventanas de ayuda ── */}
      <section className="y2-sec y2-sec--escritorio" id="guias">
        <div className="y2-sec__interior">
          <Cabecera id="guias" idioma={idioma} ruta="C:\UXKERO\GUIDES" cuenta={GUIAS.length} />
          <div className="y2-ayudas">
            {GUIAS.map((g, i) => (
              <Ventana
                key={g.href}
                titulo={`${TXT.ayuda[idioma]} - ${g.titulo}`}
                icono="libro"
                movible
                className="y2-ayuda y2-abre"
                style={{ '--d': `${i * 80}ms` } as React.CSSProperties}
              >
                <div className="y2-ayuda__cuerpo">
                  <Pixel nombre="libro" tam={48} />
                  <div>
                    <h3 className="y2-display y2-display--chico y2-display--navy">{g.titulo}</h3>
                    <p>{g.texto[idioma]}</p>
                    <span className="y2-chip">{g.meta[idioma]}</span>
                  </div>
                </div>
                <div className="y2-acciones y2-acciones--derecha">
                  <Boton defecto onClick={() => navigate(g.href)}>
                    {TXT.abrir[idioma]}
                  </Boton>
                </div>
              </Ventana>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto: mensaje nuevo ── */}
      <section className="y2-sec y2-sec--final" id="contacto">
        <div className="y2-portada__trama" aria-hidden="true" />
        <Destello tam={30} className="y2-titila" style={{ position: 'absolute', left: '8%', top: '18%' }} />
        <Destello tam={18} className="y2-titila y2-titila--2" style={{ position: 'absolute', right: '12%', top: '30%' }} />
        <div className="y2-sec__interior y2-final">
          <div className="y2-final__titular y2-abre">
            <span className="y2-chip y2-chip--navy">{etiqueta('contacto', idioma)}</span>
            <h2 className="y2-display y2-final__h">
              {CONTACTO.titular[idioma].map((l, i) => (
                <span key={l} className={i === CONTACTO.titular[idioma].length - 1 ? 'y2-amarillo' : undefined}>
                  {l}
                </span>
              ))}
            </h2>
            <span className="y2-globo y2-globo--final" aria-hidden="true">
              NEW MESSAGE!
            </span>
          </div>
          <Ventana
            titulo={TXT.nuevoMensaje[idioma]}
            icono="sobre"
            className="y2-mensaje y2-abre"
            style={{ '--d': '100ms' } as React.CSSProperties}
          >
            <div className="y2-mensaje__campos">
              <label>{TXT.para[idioma]}:</label>
              <a className="y2-campo y2-campo--linea" href={`mailto:${CONTACTO.email}`}>
                {CONTACTO.email}
              </a>
              <label>{TXT.asunto[idioma]}:</label>
              <div className="y2-campo y2-campo--linea">{TXT.asuntoTexto[idioma]}</div>
            </div>
            <div className="y2-campo y2-mensaje__cuerpo">
              <p>{CONTACTO.bajada[idioma]}</p>
            </div>
            <div className="y2-acciones y2-mensaje__acciones">
              <Boton href={`mailto:${CONTACTO.email}?subject=${encodeURIComponent(TXT.asuntoTexto[idioma])}`} defecto>
                <Pixel nombre="sobre" tam={14} /> {TXT.enviar[idioma]}
              </Boton>
              {CONTACTO.enlaces.map((e) => (
                <Boton key={e.label} href={e.href} externo={e.externo} download={e.label === 'CV'}>
                  {e.label}
                </Boton>
              ))}
            </div>
          </Ventana>
        </div>
        <footer className="y2-pie">
          <span>© 2026 {IDENTIDAD.nombre}</span>
          <span>{IDENTIDAD.lugar[idioma]} · UTC-3</span>
        </footer>
      </section>

      {/* ── Barra de tareas ── */}
      <nav className="y2-tareas" aria-label={idioma === 'es' ? 'Navegación' : 'Navigation'}>
        <div className="y2-inicio" ref={menuInicio}>
          <button
            className={`y2-boton y2-boton--inicio${inicio ? ' is-presionado' : ''}`}
            onClick={() => setInicio((v) => !v)}
            aria-expanded={inicio}
          >
            <span>
              <Pixel nombre="estrella" tam={16} />
              <b>{IDENTIDAD.marca}</b>
            </span>
          </button>
          {inicio && (
            <div className="y2-menu-inicio" role="menu">
              <div className="y2-menu-inicio__banda" aria-hidden="true">
                <span>
                  <b>UXKERO</b> Y2K
                </span>
              </div>
              <ul>
                {ORDEN.map((id) => (
                  <li key={id}>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setInicio(false);
                        irA(id);
                      }}
                    >
                      <Pixel nombre={ICONO[id]} tam={24} />
                      {etiqueta(id, idioma)}
                    </button>
                  </li>
                ))}
                <li className="y2-menu__separador" aria-hidden="true" />
                <li>
                  <a role="menuitem" href={`mailto:${CONTACTO.email}`}>
                    <Pixel nombre="sobre" tam={24} />
                    {CONTACTO.email}
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="y2-tareas__lista">
          {ORDEN.map((id) => (
            <button
              key={id}
              className={`y2-boton y2-tarea${activa === id ? ' is-presionado' : ''}`}
              onClick={() => irA(id)}
              aria-current={activa === id ? 'true' : undefined}
            >
              <span>
                <Pixel nombre={ICONO[id]} tam={16} />
                {etiqueta(id, idioma)}
              </span>
            </button>
          ))}
        </div>

        <div className="y2-bandeja">
          <button className="y2-bandeja__idioma" onClick={alCambiarIdioma} aria-label={TXT.idioma[idioma]}>
            {idioma === 'es' ? 'EN' : 'ES'}
          </button>
          {selector}
          <span className="y2-bandeja__hora">{hora}</span>
        </div>
      </nav>
    </div>
  );
};

export default Y2KPagina;
