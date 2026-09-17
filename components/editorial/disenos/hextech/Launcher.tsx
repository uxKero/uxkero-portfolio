import React, { useState } from 'react';
import { CERTIFICACIONES, CONTACTO, DATOS, HERO, IDENTIDAD, PRODUCTOS, type Bi } from '../../editorial-content';
import { Ornamento } from './Ornamentos';
import { ICONO_INVOCADOR } from './lol';

// ─────────────────────────────────────────────────────────────────────────────
// El launcher, calcado de la anatomía del cliente actual de League: escudo
// circular y botón en punta a la izquierda, pestañas grandes en mayúscula,
// fila de botones de ícono con separadores finos y la muesca colgando sobre el
// activo, bloque de monedas en dos líneas y perfil con anillo, nivel y estado.
// El panel social va pegado al borde: bloque de estado arriba, grupos
// plegables con contador, filas con avatar circular y los que no están en
// vivo atenuados como amigos desconectados, y la barrita de abajo.
// ─────────────────────────────────────────────────────────────────────────────

type L = 'es' | 'en';

interface PropsBarra {
  idioma: L;
  pestanas: Record<string, Bi>;
  activa: string;
  irA: (id: string) => void;
  alCambiarIdioma: () => void;
  selector: React.ReactNode;
}

const Trazo: React.FC<{ d: string; tam?: number }> = ({ d, tam = 16 }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const T = {
  sobre: 'M4 6h16v12H4zM4 7l8 6l8-6',
  descarga: 'M12 4v11M7 10l5 5l5-5M5 20h14',
  buscar: 'M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14M20 20l-4-4',
  mas: 'M12 6v12M6 12h12',
  enlace: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  menu: 'M4 7h16M4 12h16M4 17h16',
  cerrar: 'M6 6l12 12M18 6L6 18',
};

// Glifos planos y monocromos: el cliente no usa íconos a color en la barra.
export const GLIFOS: Record<string, React.ReactNode> = {
  kerocraft: <path d="M12 2l9 5v10l-9 5l-9-5V7zM12 12l9-5M12 12v10M12 12L3 7" fill="currentColor" stroke="#010a13" strokeWidth="1.4" strokeLinejoin="round" />,
  voybien: <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7zm0 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6z" fill="currentColor" fillRule="evenodd" />,
  productos: <path d="M4 8h16l-1.5 13h-13zM8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />,
  perfil: <path d="M12 3a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9zM3.5 21c.8-4.6 4.2-7 8.5-7s7.7 2.4 8.5 7z" fill="currentColor" />,
  trabajo: <path d="M5 7.5h14v11H5zM9 7.5v-3h6v3M5 11.5h14" fill="currentColor" stroke="currentColor" strokeWidth="0.6" fillRule="evenodd" />,
  oficio: <path d="M12 2l3.5 6.5L22 12l-6.5 3.5L12 22l-3.5-6.5L2 12l6.5-3.5zM12 8l-4 4l4 4l4-4z" fill="currentColor" fillRule="evenodd" />,
  estudios: <path d="M3 5.5l5 4l4-7l4 7l5-4l-2 12H5zM6 18.5h12v2H6z" fill="currentColor" />,
  guias: <path d="M6 3h10l3 3v15H6zM9 9h7M9 13h7M9 17h4" fill="currentColor" stroke="#010a13" strokeWidth="1.6" />,
};

export const Glifo: React.FC<{ id: string; tam?: number }> = ({ id, tam = 26 }) => (
  <svg className="lc-glifo" width={tam} height={tam} viewBox="0 0 24 24" aria-hidden="true">
    {GLIFOS[id]}
  </svg>
);

// Las pestañas de texto son las grandes; el resto va como íconos, como en el cliente.
const TEXTO = ['top', 'productos', 'perfil'];
const ICONOS = ['trabajo', 'oficio', 'estudios', 'guias'];

export const BarraLauncher: React.FC<PropsBarra> = ({ idioma, pestanas, activa, irA, alCambiarIdioma, selector }) => {
  const [menu, setMenu] = useState(false);
  const ir = (id: string) => {
    setMenu(false);
    irA(id);
  };

  return (
    <header className="lc-barra">
      <div className="lc-llamado">
        <button className="lc-juega" onClick={() => ir('contacto')}>
          <span>{HERO.ctaSecundaria[idioma]}</span>
        </button>
      </div>

      <nav className={`lc-nav${menu ? ' is-abierto' : ''}`} aria-label={idioma === 'es' ? 'Secciones' : 'Sections'}>
        <div className="lc-textos">
          {TEXTO.map((id) => (
            <button
              key={id}
              className={`lc-pestana${activa === id ? ' is-activa' : ''}`}
              onClick={() => ir(id)}
              aria-current={activa === id ? 'true' : undefined}
            >
              {pestanas[id][idioma]}
            </button>
          ))}
        </div>
        <div className="lc-iconos">
          {ICONOS.map((id) => (
            <button
              key={id}
              className={`lc-icono${activa === id ? ' is-activa' : ''}`}
              onClick={() => ir(id)}
              aria-label={pestanas[id][idioma]}
              title={pestanas[id][idioma]}
              aria-current={activa === id ? 'true' : undefined}
            >
              <Glifo id={id} />
              <span className="lc-icono__texto">{pestanas[id][idioma]}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="lc-monedas">
        <span className="lc-moneda lc-moneda--pastilla" title={idioma === 'es' ? 'Productos propios' : 'Products of my own'}>
          <Ornamento nombre="moneda" tam={16} />
          <b>{DATOS[2].cifra}</b>
          <button className="lc-moneda__mas" onClick={() => ir('productos')} aria-label={pestanas.productos[idioma]}>
            <Trazo d={T.mas} tam={10} />
          </button>
        </span>
        <span className="lc-moneda" title={idioma === 'es' ? 'Países' : 'Countries'}>
          <Ornamento nombre="cristal" tam={16} />
          <b>{DATOS[1].cifra}</b>
        </span>
      </div>

      <div className="lc-perfil">
        <div className="lc-perfil__controles">
          <button className="lc-mini" onClick={alCambiarIdioma} aria-label={idioma === 'es' ? 'Switch to English' : 'Cambiar a español'}>
            {idioma === 'es' ? 'EN' : 'ES'}
          </button>
          <div className="lc-selector">{selector}</div>
          <button className="lc-mini lc-menu" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Menu">
            <Trazo d={menu ? T.cerrar : T.menu} tam={14} />
          </button>
        </div>
        <span className="lc-avatar">
          <span className="lc-avatar__anillo">
            <img src={ICONO_INVOCADOR} alt="" />
          </span>
          <span className="lc-avatar__nivel">{new Date().getFullYear() - 2013}</span>
        </span>
        <span className="lc-perfil__textos">
          <b>{IDENTIDAD.marca}</b>
          <small>
            <i /> {idioma === 'es' ? 'Disponible' : 'Available'}
          </small>
        </span>
      </div>
    </header>
  );
};

// ── Panel social ─────────────────────────────────────────────────────────────

const dominio = (url: string) => url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

const Grupo: React.FC<React.PropsWithChildren<{ titulo: string; cuenta: string }>> = ({ titulo, cuenta, children }) => {
  const [abierto, setAbierto] = useState(true);
  return (
    <section className="lc-grupo">
      <button className="lc-grupo__cabeza" onClick={() => setAbierto((a) => !a)} aria-expanded={abierto}>
        <i className={`lc-grupo__flecha${abierto ? ' is-abierto' : ''}`} aria-hidden="true" />
        {titulo} ({cuenta})
      </button>
      {abierto && children}
    </section>
  );
};

const Fila: React.FC<{ href: string; img?: string; monograma?: string; nombre: string; estado: string; enLinea: boolean; externo?: boolean; descarga?: boolean }> = ({
  href,
  img,
  monograma,
  nombre,
  estado,
  enLinea,
  externo = true,
  descarga,
}) => (
  <a
    className={`lc-fila${enLinea ? '' : ' is-desconectado'}`}
    href={href}
    target={externo ? '_blank' : undefined}
    rel={externo ? 'noopener noreferrer' : undefined}
    download={descarga || undefined}
  >
    <span className="lc-fila__avatar">
      {img ? <img src={img} alt="" loading="lazy" /> : <span className="lc-fila__monograma">{monograma}</span>}
      <i className="lc-fila__punto" />
    </span>
    <span className="lc-fila__textos">
      <b>{nombre}</b>
      <small>{estado}</small>
    </span>
  </a>
);

export const PanelSocial: React.FC<{ idioma: L; irA: (id: string) => void }> = ({ idioma, irA }) => {
  const enVivo = PRODUCTOS.filter((p) => p.estado.en === 'Live');
  const resto = PRODUCTOS.filter((p) => p.estado.en !== 'Live');
  const cv = CONTACTO.enlaces.find((e) => e.label === 'CV');
  const gh = CONTACTO.enlaces.find((e) => e.label === 'GitHub');

  return (
    <aside className="lc-social" aria-label="Social">
      {/* El bloque de grupo del cliente, acá con la disponibilidad. */}
      <div className="lc-grupo-abierto">
        <p className="lc-titulo">
          <Trazo d="M8 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 11a3 3 0 1 0 0-6M22 20c0-3.3-2-6-5-6" tam={15} />
          {idioma === 'es' ? 'Lobby abierto' : 'Open lobby'}
        </p>
        <div className="lc-grupo-abierto__cuerpo">
          <span className="lc-grupo-abierto__retrato" aria-hidden="true">
            <img src={ICONO_INVOCADOR} alt="" />
          </span>
          <span>
            <span className="lc-plazas" aria-hidden="true">
              <i className="is-ocupada" />
              <i />
              <i />
              <i />
              <i />
            </span>
            <small>{IDENTIDAD.estado[idioma]}</small>
          </span>
        </div>
      </div>

      <div className="lc-social__cabeza">
        <p className="lc-titulo">Social</p>
        <span className="lc-social__acciones">
          <a href={`mailto:${CONTACTO.email}`} aria-label={CONTACTO.email} title={CONTACTO.email}>
            <Trazo d={T.sobre} />
          </a>
          {cv && (
            <a href={cv.href} download aria-label="CV" title="CV">
              <Trazo d={T.descarga} />
            </a>
          )}
          {gh && (
            <a href={gh.href} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
              <Trazo d={T.enlace} />
            </a>
          )}
          <button onClick={() => irA('productos')} aria-label={idioma === 'es' ? 'Buscar' : 'Search'} title={idioma === 'es' ? 'Buscar' : 'Search'}>
            <Trazo d={T.buscar} />
          </button>
        </span>
      </div>

      <div className="lc-social__lista">
        <Grupo titulo={idioma === 'es' ? 'En vivo' : 'Live'} cuenta={`${enVivo.length}/${PRODUCTOS.length}`}>
          {enVivo.map((p) => (
            <Fila
              key={p.slug}
              href={p.url ?? p.gh ?? '#'}
              img={`/editorial/proyectos-color/${p.slug}.jpg`}
              nombre={p.nombre}
              estado={idioma === 'es' ? 'En línea' : 'Online'}
              enLinea
            />
          ))}
        </Grupo>
        <Grupo titulo={idioma === 'es' ? 'Enlaces' : 'Links'} cuenta={String(CONTACTO.enlaces.length)}>
          {CONTACTO.enlaces.map((e) => (
            <Fila
              key={e.label}
              href={e.href}
              monograma={e.label === 'X / @uxKero' ? 'X' : e.label.slice(0, 2)}
              nombre={e.label}
              estado={e.externo ? dominio(e.href) : 'PDF'}
              enLinea
              externo={e.externo}
              descarga={e.label === 'CV'}
            />
          ))}
        </Grupo>
        <Grupo titulo={idioma === 'es' ? 'Colección' : 'Collection'} cuenta={String(resto.length)}>
          {resto.map((p) => (
            <Fila
              key={p.slug}
              href={p.url ?? p.gh ?? '#productos'}
              img={`/editorial/proyectos-color/${p.slug}.jpg`}
              nombre={p.nombre}
              estado={p.estado[idioma]}
              enLinea={false}
              externo={Boolean(p.url ?? p.gh)}
            />
          ))}
        </Grupo>
      </div>

      <div className="lc-social__pie">
        <a className="lc-pie-btn" href={`mailto:${CONTACTO.email}`} aria-label={CONTACTO.email} title={CONTACTO.email}>
          <Trazo d={T.sobre} />
        </a>
        <button className="lc-pie-btn" onClick={() => irA('estudios')} aria-label={idioma === 'es' ? 'Desafíos' : 'Challenges'}>
          <Glifo id="guias" />
          <span className="lc-insignia">{CERTIFICACIONES.length}</span>
        </button>
        <a className="lc-pie-btn" href="https://github.com/uxKero" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
          <Trazo d={T.enlace} />
        </a>
        <span className="lc-version">{new Date().getFullYear() - 2000}.09</span>
        <button className="lc-pie-btn" onClick={() => irA('top')} aria-label={idioma === 'es' ? 'Inicio' : 'Home'}>
          <Glifo id="oficio" />
        </button>
      </div>
    </aside>
  );
};
