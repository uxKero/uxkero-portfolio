import React, { useLayoutEffect, useState } from 'react';
import type { PropsEntrada } from '../../disenos';

// ─────────────────────────────────────────────────────────────────────────────
// Entrada de Y2K. Todo a saltos, nada interpolado: el escritorio azul con
// dither cae en seis escalones, se apila una cascada de ventanas de instalación
// y la de adelante llena su barra de bloques. Con la pantalla tapada se cambia
// el diseño; después el escritorio se retira en escalones hacia abajo.
// ─────────────────────────────────────────────────────────────────────────────

const CUBRIR = 420;
const INSTALAR = 760;
const DESCUBRIR = 420;
const BLOQUES = 18;

const EntradaY2K: React.FC<PropsEntrada> = ({ onCubierta, onFin }) => {
  const [fase, setFase] = useState<'cubrir' | 'instalar' | 'descubrir'>('cubrir');
  const [llenos, setLlenos] = useState(0);

  useLayoutEffect(() => {
    const tiempos: number[] = [];
    tiempos.push(
      window.setTimeout(() => {
        setFase('instalar');
        onCubierta();
        for (let k = 1; k <= BLOQUES; k++) {
          tiempos.push(window.setTimeout(() => setLlenos(k), (k * (INSTALAR - 120)) / BLOQUES));
        }
      }, CUBRIR),
    );
    tiempos.push(window.setTimeout(() => setFase('descubrir'), CUBRIR + INSTALAR));
    tiempos.push(window.setTimeout(onFin, CUBRIR + INSTALAR + DESCUBRIR));
    return () => tiempos.forEach((t) => window.clearTimeout(t));
    // Corre una sola vez por montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`y2e y2e--${fase}`} aria-hidden="true">
      <div className="y2e__escritorio" />
      <div className="y2e__cascada">
        {[5, 4, 3, 2, 1, 0].map((k) => (
          <div key={k} className="y2e__ventana" style={{ '--k': k } as React.CSSProperties}>
            <div className="y2e__titulo">Setup - Y2K Chrome</div>
            <div className="y2e__cuerpo">
              {k === 0 && (
                <>
                  <p>Installing UXKERO Y2K Chrome...</p>
                  <div className="y2e__barra">
                    {Array.from({ length: BLOQUES }, (_, i) => (
                      <i key={i} className={i < llenos ? 'is-lleno' : undefined} />
                    ))}
                  </div>
                  <p className="y2e__pct">{Math.round((llenos / BLOQUES) * 100)}%</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntradaY2K;
