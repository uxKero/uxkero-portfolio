import React, { useLayoutEffect, useState } from 'react';
import type { PropsEntrada } from '../../disenos';

// ─────────────────────────────────────────────────────────────────────────────
// Entrada de Bajo el agua. Desde el punto del clic sube el agua: un círculo
// verde que crece con el borde ondulado hasta tapar la pantalla. Ahí se monta
// la página, que trae su propio velo de carga del mismo verde, y la entrada se
// retira sin que se note: el resto lo destapa la carga cuando el mar está
// listo.
// ─────────────────────────────────────────────────────────────────────────────

const CUBRIR = 620;

const EntradaAgua: React.FC<PropsEntrada> = ({ origen, onCubierta, onFin }) => {
  const [fase, setFase] = useState<'cubrir' | 'pasar'>('cubrir');

  useLayoutEffect(() => {
    const t1 = window.setTimeout(() => {
      setFase('pasar');
      onCubierta();
    }, CUBRIR);
    // Un respiro para que el velo de la página ya esté pintado debajo.
    const t2 = window.setTimeout(onFin, CUBRIR + 260);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // Corre una sola vez por montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`ag-entrada ag-entrada--${fase}`}
      aria-hidden="true"
      style={{ '--ox': `${origen.x}px`, '--oy': `${origen.y}px` } as React.CSSProperties}
    >
      <span className="ag-entrada__agua" />
    </div>
  );
};

export default EntradaAgua;
