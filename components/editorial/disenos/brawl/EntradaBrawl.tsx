import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PropsEntrada } from '../../disenos';

// ─────────────────────────────────────────────────────────────────────────────
// Entrada de Brawl. Una estrella de sticker sale del clic girando, una azul
// detrás de una amarilla, hasta tapar la pantalla. Con todo tapado aparece la
// placa de carga, cuenta hasta 100 y el diseño cambia por debajo; después las
// estrellas se encogen hacia el mismo punto y dejan ver el lobby.
// ─────────────────────────────────────────────────────────────────────────────

const PUNTAS = 14;

const estrella = (radioAfuera: number, radioAdentro: number) => {
  const puntos: string[] = [];
  for (let i = 0; i < PUNTAS * 2; i++) {
    const r = i % 2 === 0 ? radioAfuera : radioAdentro;
    const a = (Math.PI * i) / PUNTAS - Math.PI / 2;
    puntos.push(`${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`);
  }
  return puntos.join(' ');
};

const CUBRIR = 520;
const CARGAR = 560;
const DESCUBRIR = 420;

const EntradaBrawl: React.FC<PropsEntrada> = ({ origen, onCubierta, onFin }) => {
  const [fase, setFase] = useState<'cubrir' | 'cargar' | 'descubrir'>('cubrir');
  const [carga, setCarga] = useState(0);
  const avisada = useRef(false);

  // La estrella mide 200 y su radio interior es 0.72 del exterior: la escala
  // tiene que llevar ese radio más allá de la esquina más lejana del clic.
  const escala = useMemo(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const lejos = Math.max(
      Math.hypot(origen.x, origen.y),
      Math.hypot(w - origen.x, origen.y),
      Math.hypot(origen.x, h - origen.y),
      Math.hypot(w - origen.x, h - origen.y),
    );
    return (lejos / (96 * 0.72)) * 1.08;
  }, [origen]);

  useLayoutEffect(() => {
    const tiempos: number[] = [];
    let cuadro = 0;

    tiempos.push(
      window.setTimeout(() => {
        setFase('cargar');
        if (!avisada.current) {
          avisada.current = true;
          onCubierta();
        }
        const inicio = performance.now();
        const contar = (ahora: number) => {
          const t = Math.min(1, (ahora - inicio) / (CARGAR - 80));
          setCarga(Math.round(100 * (1 - (1 - t) ** 2)));
          if (t < 1) cuadro = requestAnimationFrame(contar);
        };
        cuadro = requestAnimationFrame(contar);
      }, CUBRIR),
    );
    tiempos.push(window.setTimeout(() => setFase('descubrir'), CUBRIR + CARGAR));
    tiempos.push(window.setTimeout(onFin, CUBRIR + CARGAR + DESCUBRIR));

    return () => {
      tiempos.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(cuadro);
    };
    // Corre una sola vez por montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estilo = {
    left: origen.x - 100,
    top: origen.y - 100,
    '--escala': escala,
  } as React.CSSProperties;

  return (
    <div className={`bwe bwe--${fase}`} aria-hidden="true">
      <svg className="bwe__estrella bwe__estrella--azul" style={estilo} width="200" height="200" viewBox="0 0 200 200">
        <polygon points={estrella(96, 70)} fill="#0249BB" stroke="#000" strokeWidth="3" />
      </svg>
      <svg className="bwe__estrella bwe__estrella--amarilla" style={estilo} width="200" height="200" viewBox="0 0 200 200">
        <polygon points={estrella(96, 70)} fill="#EEC309" stroke="#000" strokeWidth="3" />
        <polygon points={estrella(80, 58)} fill="#F8E73D" />
      </svg>
      <div className="bwe__carga">
        <strong>Brawl Plate</strong>
        <div className="bwe__barra">
          <i style={{ width: `${carga}%` }} />
          <span>{carga}%</span>
        </div>
      </div>
    </div>
  );
};

export default EntradaBrawl;
