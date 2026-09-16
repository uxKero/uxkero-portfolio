import React, { useEffect, useRef, useState } from 'react';
import { DISENOS, pedirFuentes, type Diseno } from './disenos';
import type { Idioma } from './editorial-content';

interface Props {
  idioma: Idioma;
  activo: Diseno;
  cargando: string | null;
  onCambiar: (id: string) => void;
  /** En el riel abre hacia la izquierda; en la barra del celular, hacia arriba. */
  variante: 'riel' | 'barra';
}

const SelectorDiseno: React.FC<Props> = ({ idioma: L, activo, cargando, onCambiar, variante }) => {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const indice = DISENOS.findIndex((d) => d.id === activo.id);

  useEffect(() => {
    if (!abierto) return;
    // Cada nombre se escribe con su propia letra: se piden al abrir.
    DISENOS.forEach(pedirFuentes);

    const fuera = (e: MouseEvent | TouchEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('touchstart', fuera);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('touchstart', fuera);
      document.removeEventListener('keydown', escape);
    };
  }, [abierto]);

  return (
    <div className={`ed-disenos ed-disenos--${variante}`} ref={caja}>
      <button
        className="ed-disenos__btn"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-haspopup="true"
      >
        <span className="ed-disenos__muestra" aria-hidden="true">
          {activo.muestra.map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </span>
        {L === 'es' ? 'Diseño' : 'Design'}
      </button>

      {abierto && (
        <div className="ed-disenos__panel" role="menu">
          <p className="ed-disenos__titulo">
            <span>{L === 'es' ? 'Diseños' : 'Designs'}</span>
            <span>
              {String(indice + 1).padStart(2, '0')} / {String(DISENOS.length).padStart(2, '0')}
            </span>
          </p>
          <ul>
            {DISENOS.map((d, i) => {
              const esActivo = d.id === activo.id;
              return (
                <li key={d.id}>
                  <button
                    role="menuitemradio"
                    aria-checked={esActivo}
                    className={`ed-disenos__item${esActivo ? ' is-activo' : ''}`}
                    onClick={() => {
                      if (!esActivo) onCambiar(d.id);
                      setAbierto(false);
                    }}
                  >
                    <span className="ed-disenos__n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ed-disenos__muestra ed-disenos__muestra--grande" aria-hidden="true">
                      {d.muestra.map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </span>
                    <span className="ed-disenos__texto">
                      <span className="ed-disenos__nombre" style={{ fontFamily: d.familia }}>
                        {d.nombre}
                      </span>
                      <span className="ed-disenos__desc">
                        {cargando === d.id ? (L === 'es' ? 'Cargando' : 'Loading') : d.descripcion[L]}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectorDiseno;
