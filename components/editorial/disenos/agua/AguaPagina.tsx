import React, { useEffect, useMemo, useRef, useState } from 'react';
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
} from '../../editorial-content';
import { crearMotor, type Motor } from './motor/escena';
import { armarPlan, type Accion } from './contenido';
import Carga from './Carga';

// ─────────────────────────────────────────────────────────────────────────────
// Bajo el agua. La portada es una cámara a ras del mar de Mar del Plata: la
// ventana del navegador es la carcasa, y si se la arrastra el agua se mueve de
// verdad. Leer es bajar por un pozo junto a la escollera: el portfolio está
// tallado en la roca de enfrente y abulonado en placas de bronce. El mouse es
// la linterna del buzo; lo que ilumina se puede tocar. Cada producto abre su
// ficha en una pizarra de buceo.
//
// El scroll se mide en metros: tantos píxeles por metro de bajada. Todo el
// texto vive también en la página, oculto a la vista, para buscadores y
// lectores de pantalla.
// ─────────────────────────────────────────────────────────────────────────────

type L = 'es' | 'en';

const PX_METRO = 150;
/** Píxeles por metro en la cinta del profundímetro. */
const PX_CINTA = 26;

const TXT = {
  pista: { es: 'Arrastrar la ventana mueve el agua', en: 'Dragging the window moves the water' },
  linterna: { es: 'El cursor es una linterna', en: 'The cursor is a torch' },
  placas: { es: 'Las placas se sacan de la pared para leerlas', en: 'Plaques come off the wall to be read' },
  ayuda: { es: 'Cómo se navega', en: 'How to navigate' },
  profundidad: { es: 'Profundidad', en: 'Depth' },
  ver: { es: 'Ver el producto', en: 'See the product' },
  codigo: { es: 'Ver el código', en: 'See the source' },
  cerrar: { es: 'Cerrar', en: 'Close' },
  girar: { es: 'Dar vuelta', en: 'Turn over' },
  abrir: { es: 'Abrir', en: 'Open' },
  devolver: { es: 'Devolver', en: 'Put back' },
  idioma: { es: 'English', en: 'Español' },
} satisfies Record<string, Bi>;

const metros = (m: number, idioma: L) =>
  `${m <= 0.05 ? '' : '−'}${Math.abs(m).toLocaleString(idioma === 'es' ? 'es-AR' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} m`;

const profundidad = () => Math.max(0, window.scrollY / PX_METRO);

/** Lo que se puede hacer con la placa en la mano. */
const EnMano: React.FC<{
  info: { accion?: Accion; tieneDorso: boolean };
  L: L;
  alSoltar: () => void;
  alGirar: () => void;
  alAbrir: (a: Accion, cual?: 'url' | 'gh') => void;
}> = ({ info, L, alSoltar, alGirar, alAbrir }) => {
  const soltar = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    soltar.current?.focus({ preventScroll: true });
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && alSoltar();
    window.addEventListener('keydown', tecla);
    const antes = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', tecla);
      document.documentElement.style.overflow = antes;
    };
  }, [alSoltar]);
  const a = info.accion;
  return (
    <div className="ag-mano" onClick={alSoltar}>
      <div className="ag-mano__barra" role="toolbar" onClick={(e) => e.stopPropagation()}>
        {info.tieneDorso && (
          <button onClick={alGirar}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {TXT.girar[L]}
          </button>
        )}
        {a?.tipo === 'producto' && a.producto.url && (
          <button className="ag-mano__principal" onClick={() => alAbrir(a, 'url')}>
            {TXT.ver[L]}
          </button>
        )}
        {a?.tipo === 'producto' && a.producto.gh && <button onClick={() => alAbrir(a, 'gh')}>{TXT.codigo[L]}</button>}
        {a && a.tipo !== 'producto' && (
          <button className="ag-mano__principal" onClick={() => alAbrir(a)}>
            {TXT.abrir[L]}
          </button>
        )}
        <button ref={soltar} onClick={alSoltar} aria-label={TXT.cerrar[L]}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {TXT.devolver[L]}
        </button>
      </div>
    </div>
  );
};

const AguaPagina: React.FC<PropsPagina> = ({ idioma, alCambiarIdioma, selector }) => {
  const L = idioma as L;
  const navigate = useNavigate();
  const lienzo = useRef<HTMLCanvasElement>(null);
  const motor = useRef<Motor | null>(null);
  const lectura = useRef<HTMLSpanElement>(null);
  const regla = useRef<HTMLDivElement>(null);
  const [encima, setEncima] = useState(false);
  const [mano, setMano] = useState<{ accion?: Accion; tieneDorso: boolean } | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [lista, setLista] = useState(false);
  const [activa, setActiva] = useState('top');
  const plan = useMemo(() => armarPlan(L), [L]);
  const titulo = useMemo(
    () => ({
      partes: HERO.titular[L].map((l, i) => ({
        texto: i === 0 ? l.texto.charAt(0) + l.texto.slice(1).toLowerCase() : l.texto.toLowerCase(),
        italica: l.acento,
      })),
      arriba: (IDENTIDAD.nombre + ' · ' + HERO.eyebrow[L]).toUpperCase(),
      abajo: HERO.bajada[L],
    }),
    [L],
  );
  const abrir = (a: Accion, cual: 'url' | 'gh' = 'url') => {
    if (a.tipo === 'producto') {
      const destino = cual === 'gh' ? a.producto.gh : a.producto.url;
      if (destino) window.open(destino, '_blank', 'noreferrer');
    } else if (a.tipo === 'ruta') navigate(a.href);
    else if (a.url.startsWith('mailto:')) window.location.href = a.url;
    else window.open(a.url, '_blank', 'noreferrer');
  };

  useEffect(() => {
    // La bajada empieza siempre en la superficie, aunque el navegador
    // recuerde dónde quedó la última vez.
    const previo = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    // La barra de scroll no se ve: se baja con la rueda, el dedo o el profundímetro.
    document.documentElement.classList.add('ag-sin-barra');
    window.scrollTo(0, 0);
    const canvas = lienzo.current;
    if (!canvas) return;
    motor.current = crearMotor(canvas, {
      profundidad,
      plan,
      titulo,
      alPasar: setEncima,
      alInspeccionar: setMano,
      alProgreso: setProgreso,
      alListo: () => setLista(true),
    });
    return () => {
      history.scrollRestoration = previo;
      document.documentElement.classList.remove('ag-sin-barra');
      motor.current?.soltar();
      motor.current = null;
    };
    // El motor se crea una vez; el plan nuevo se le pasa aparte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    motor.current?.cambiarPlan(plan);
  }, [plan]);

  useEffect(() => {
    motor.current?.cambiarTitulo(titulo);
  }, [titulo]);

  useEffect(() => {
    let raf = 0;
    let previo = '';
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const m = Math.min(profundidad(), plan.fondo);
      const texto = m.toLocaleString(L === 'es' ? 'es-AR' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      if (texto !== previo && lectura.current) {
        lectura.current.textContent = texto;
        previo = texto;
      }
      // La cinta corre por detrás del índice fijo, como en un computador de buceo.
      if (regla.current) regla.current.style.transform = `translateY(${(-m * PX_CINTA).toFixed(1)}px)`;
      let actual = 'top';
      for (const s of plan.secciones) if (m >= s.prof - 0.6) actual = s.id;
      setActiva((a) => (a === actual ? a : actual));
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [L, plan]);

  const ir = (prof: number) => window.scrollTo({ top: prof * PX_METRO, behavior: 'smooth' });
  const label = (id: string) => SECCIONES.find((s) => s.id === id)?.label[L] ?? '';

  return (
    <div className={`ag${encima ? ' ag--encima' : ''}`}>
      <canvas ref={lienzo} className="ag__lienzo" aria-hidden="true" />

      <nav className="ag-prof" aria-label={TXT.profundidad[L]}>
        <div className="ag-prof__cinta">
          <div className="ag-prof__regla" ref={regla} style={{ height: plan.fondo * PX_CINTA }}>
            {Array.from({ length: Math.floor(plan.fondo) + 1 }, (_, m) => (
              <span key={m} className={`ag-prof__raya${m % 5 === 0 ? ' ag-prof__raya--cinco' : ''}`} style={{ top: m * PX_CINTA }}>
                {m % 5 === 0 && <i>{m}</i>}
              </span>
            ))}
            {plan.secciones.map((s) => (
              <button
                key={s.id}
                className={`ag-prof__marca${activa === s.id ? ' ag-prof__marca--activa' : ''}`}
                style={{ top: s.prof * PX_CINTA }}
                onClick={() => ir(s.prof)}
              >
                {label(s.id)}
              </button>
            ))}
          </div>
          <div className="ag-prof__indice" aria-live="off">
            <span className="ag-prof__lectura" ref={lectura}>
              0,0
            </span>
            <span className="ag-prof__unidad">m</span>
          </div>
        </div>
        <div className="ag-prof__pie">
          <button className="ag-prof__idioma" onClick={alCambiarIdioma}>
            {TXT.idioma[L]}
          </button>
          <span className="ag-prof__info" tabIndex={0} aria-label={TXT.ayuda[L]}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M12 11v6M12 7.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="ag-prof__globo" role="tooltip">
              <span>{TXT.pista[L]}</span>
              <span>{TXT.linterna[L]}</span>
              <span>{TXT.placas[L]}</span>
            </span>
          </span>
        </div>
      </nav>

      <section className="ag__portada">
        <p className="ag__firma">{IDENTIDAD.lugar[L]}</p>
        <p className="ag__ante" aria-hidden="true">
          {titulo.arriba}
        </p>
        {/* El título se ve dibujado sobre la línea del agua; acá queda para quien no ve la escena. */}
        <h1 className="ag-oculto">{HERO.titular[L].map((l) => l.texto).join(' ')}</h1>
        <p className="ag-oculto">{HERO.bajada[L]}</p>
      </section>

      {/* La bajada: tantos metros como tenga el plan. */}
      <div className="ag__bajada-largo" style={{ height: plan.fondo * PX_METRO }} aria-hidden="true" />

      {/* El mismo contenido en texto, para quien no ve la pared. */}
      <main className="ag-oculto">
        <section>
          <h2>{label('perfil')}</h2>
          <p>{MANIFIESTO.titular[L].join(' ')}</p>
          {MANIFIESTO.parrafos[L].map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul>
            {DATOS.map((d) => (
              <li key={d.cifra}>
                {d.cifra} {d.titulo[L]}. {d.contexto[L]}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>{label('trabajo')}</h2>
          <ul>
            {TRABAJO.map((t) => (
              <li key={t.n}>
                {t.rol[L]}, {t.url ? <a href={t.url}>{t.org}</a> : t.org}. {t.contexto[L]}. {t.estado[L]}.
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>{label('productos')}</h2>
          {PRODUCTOS.map((p) => (
            <article key={p.slug}>
              <h3>{p.nombre}</h3>
              <p>
                {p.rol[L]}. {p.estado[L]}.
              </p>
              <p>{p.texto[L]}</p>
              {p.url && <a href={p.url}>{p.url}</a>}
              {p.gh && <a href={p.gh}>{p.gh}</a>}
            </article>
          ))}
        </section>
        <section>
          <h2>{label('oficio')}</h2>
          {OFICIO.map((o) => (
            <div key={o.titulo.es}>
              <h3>{o.titulo[L]}</h3>
              <ul>
                {o.items.map((i) => (
                  <li key={i.es}>{i[L]}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
        <section>
          <h2>{label('estudios')}</h2>
          <ul>
            {CERTIFICACIONES.map((c) => (
              <li key={c.nombre}>
                {c.url ? <a href={c.url}>{c.nombre}</a> : c.nombre}, {c.casa}, {c.anio}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>{label('guias')}</h2>
          {GUIAS.map((g) => (
            <p key={g.href}>
              <a href={g.href}>{g.titulo}</a>. {g.texto[L]}
            </p>
          ))}
        </section>
        <section>
          <h2>{label('contacto')}</h2>
          <p>{CONTACTO.bajada[L]}</p>
          <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>
          {CONTACTO.enlaces.map((e) => (
            <a key={e.label} href={e.href}>
              {e.label}
            </a>
          ))}
        </section>
      </main>

      {mano && (
        <EnMano
          info={mano}
          L={L}
          alSoltar={() => motor.current?.soltarPlaca()}
          alGirar={() => motor.current?.girarPlaca()}
          alAbrir={abrir}
        />
      )}

      <Carga progreso={progreso} lista={lista} />

      <div className="ag__barra">{selector}</div>
    </div>
  );
};

export default AguaPagina;
