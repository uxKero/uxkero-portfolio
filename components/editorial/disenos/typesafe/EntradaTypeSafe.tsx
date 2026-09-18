import React, { useLayoutEffect, useState } from 'react';
import type { PropsEntrada } from '../../disenos';

// ─────────────────────────────────────────────────────────────────────────────
// Entrada de TypeSafe. Desde el punto del clic sale una hoja rosa que crece
// como rectángulo duro y al centro aparece una ventana de sistema cargando: la
// barra se llena por bloques hasta el final y recién ahí la hoja se retira.
//
// El fondo se queda quieto a propósito. La versión anterior tenía una banda
// tramada barriendo y las cuatro escuadras viajando desde el centro, y con la
// ventana al medio eran tres cosas moviéndose a la vez: la carga, que es lo
// único que hay que mirar, se perdía. Acá se mueve un solo objeto.
//
// Es coherente con el resto del diseño: barra de título maciza, cuerpo gris,
// filete de 1px y el track de la barra segmentado en bloques, como el de los
// paneles de datos.
// ─────────────────────────────────────────────────────────────────────────────

const CUBRIR = 300;
const CARGAR = 980;
const DESCUBRIR = 280;
const BLOQUES = 24;

const EntradaTypeSafe: React.FC<PropsEntrada> = ({ origen, onCubierta, onFin }) => {
  const [fase, setFase] = useState<'cubrir' | 'cargar' | 'descubrir'>('cubrir');
  const [llenos, setLlenos] = useState(0);

  useLayoutEffect(() => {
    const tiempos: number[] = [];
    tiempos.push(
      window.setTimeout(() => {
        setFase('cargar');
        onCubierta();
        for (let k = 1; k <= BLOQUES; k++) {
          tiempos.push(window.setTimeout(() => setLlenos(k), (k * (CARGAR - 160)) / BLOQUES));
        }
      }, CUBRIR),
    );
    tiempos.push(window.setTimeout(() => setFase('descubrir'), CUBRIR + CARGAR));
    tiempos.push(window.setTimeout(onFin, CUBRIR + CARGAR + DESCUBRIR));
    return () => tiempos.forEach((t) => window.clearTimeout(t));
    // Corre una sola vez por montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.round((llenos / BLOQUES) * 100);

  return (
    <div
      className={`tse tse--${fase}`}
      aria-hidden="true"
      style={{ '--ox': `${origen.x}px`, '--oy': `${origen.y}px` } as React.CSSProperties}
    >
      <div className="tse__hoja">
        <span className="tse__trama" />

        <span className="tse__marca tse__marca--ai" />
        <span className="tse__marca tse__marca--ad" />
        <span className="tse__marca tse__marca--bi" />
        <span className="tse__marca tse__marca--bd" />

        <div className="tse__centro">
          <div className="tse__win">
            <div className="tse__win__cab">
              <span>UXK.OS1</span>
              <span className="tse__win__botones">
                <i />
                <i />
              </span>
            </div>
            <div className="tse__win__cuerpo">
              <p className="tse__win__linea">Loading TypeSafe</p>
              <div className="tse__barra">
                {Array.from({ length: BLOQUES }, (_, i) => (
                  <i key={i} className={i < llenos ? 'is-lleno' : undefined} />
                ))}
              </div>
              <p className="tse__win__pie">
                <span>1PX / 5PX</span>
                <span className="tse__pct">{pct}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntradaTypeSafe;
