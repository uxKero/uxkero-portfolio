import React, { useLayoutEffect, useState } from 'react';
import type { PropsEntrada } from '../../disenos';
import { IDENTIDAD } from '../../editorial-content';
import { Emblema, Estandarte } from './Estandarte';

// ─────────────────────────────────────────────────────────────────────────────
// Entrada de Hextech, con las mismas piezas del launcher:
//   cubrir   → un velo oscuro nace desde el clic y el filo de oro de la barra
//              se dibuja arriba.
//   forjar   → con todo tapado cambia el diseño; detrás, el wallpaper propio
//              desenfocado, y desde la barra cuelga el estandarte mientras el
//              emblema se forja y la línea de carga avanza.
//   hallar   → partida encontrada: dos ondas teal salen del emblema y un
//              brillo cruza la tela.
//   abrir    → el estandarte sube y el launcher aparece desde el centro.
// ─────────────────────────────────────────────────────────────────────────────

const CUBRIR = 420;
const FORJAR = 1150;
const HALLAR = 480;
const ABRIR = 700;

type Fase = 'inicio' | 'cubrir' | 'forjar' | 'hallar' | 'abrir';

const EntradaHextech: React.FC<PropsEntrada> = ({ origen, onCubierta, onFin }) => {
  const [fase, setFase] = useState<Fase>('inicio');

  useLayoutEffect(() => {
    const tiempos: number[] = [];
    // Un cuadro en reposo para que el velo arranque desde cero.
    const cuadro = requestAnimationFrame(() => requestAnimationFrame(() => setFase('cubrir')));
    tiempos.push(
      window.setTimeout(() => {
        onCubierta();
        setFase('forjar');
      }, CUBRIR),
      window.setTimeout(() => setFase('hallar'), CUBRIR + FORJAR),
      window.setTimeout(() => setFase('abrir'), CUBRIR + FORJAR + HALLAR),
      window.setTimeout(onFin, CUBRIR + FORJAR + HALLAR + ABRIR),
    );
    return () => {
      cancelAnimationFrame(cuadro);
      tiempos.forEach((t) => window.clearTimeout(t));
    };
    // Corre una sola vez por montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estilo = { '--ox': `${origen.x}px`, '--oy': `${origen.y}px` } as React.CSSProperties;

  return (
    <div className={`hxe hxe--${fase}`} style={estilo} aria-hidden="true">
      <div className="hxe__velo">
        <div className="hxe__fondo">
          <img src="/hextech/alan-splash.webp" alt="" />
        </div>
        <span className="hxe__filo" />

        <div className="hxe__colgante">
          <Estandarte destacado>
            <span className="cl-nivel">
              <i aria-hidden="true" />
              {new Date().getFullYear() - 2013}
            </span>
            <div className="hxe__emblema">
              <Emblema foto="/hextech/alan-splash.webp" tam={196} />
              <span className="hxe__onda" />
              <span className="hxe__onda hxe__onda--2" />
            </div>
            <p className="cl-banderin__nombre">{IDENTIDAD.nombre}</p>
            <p className="hxe__titulo">Hextech · Holo</p>
          </Estandarte>
        </div>

        <div className="hxe__carga">
          <i />
        </div>
      </div>
    </div>
  );
};

export default EntradaHextech;
