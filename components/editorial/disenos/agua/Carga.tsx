import React, { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// La carga: un velo de agua verde que tapa todo mientras el mar se arma. Una
// línea fina, como el nivel en un tubo, sube con lo que va llegando. Cuando
// la escena está lista y ya dibujó sus primeros cuadros, el agua del velo se
// escurre hacia abajo y la destapa. Es el mismo verde con que termina la
// entrada del selector, así el paso de una a otra no se nota.
// ─────────────────────────────────────────────────────────────────────────────

const Carga: React.FC<{ progreso: number; lista: boolean }> = ({ progreso, lista }) => {
  const [fuera, setFuera] = useState(false);

  useEffect(() => {
    if (!lista) return;
    const t = window.setTimeout(() => setFuera(true), 1300);
    return () => window.clearTimeout(t);
  }, [lista]);

  if (fuera) return null;
  return (
    <div className={`ag-carga${lista ? ' ag-carga--sale' : ''}`} aria-hidden="true">
      <div className="ag-carga__agua">
        <span className="ag-carga__brillo" />
        <span className="ag-carga__brillo ag-carga__brillo--2" />
      </div>
      <div className="ag-carga__nivel">
        <span style={{ transform: `scaleY(${Math.max(0.04, progreso)})` }} />
      </div>
    </div>
  );
};

export default Carga;
