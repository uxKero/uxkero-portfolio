import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Las piezas dibujadas de TypeSafe. Este sistema no tiene fotografía ni set de
// íconos: lo que ocupa ese lugar es la lámina técnica, un collage de dibujo de
// patente partido en dos temperaturas con un bloque de color macizo encima.
//
// La lámina tiene cuatro capas fijas, que son las que la hacen de este sistema:
//   1. El corte vertical: mitad oscura, mitad clara, con el dibujo invertido de
//      tinta a cada lado.
//   2. El line art de patente, con cotas sueltas y numeración de figura.
//   3. El bloque teal macizo, que tapa parte del dibujo en vez de acompañarlo.
//   4. La hoja de calibración encima del teal: filas de un mismo dígito con
//      algunas celdas marcadas, como una prueba de lectura óptica fallada.
//
// Todo se traza con 1px, que es la única línea del sistema.
// ─────────────────────────────────────────────────────────────────────────────

/** Tres triángulos macizos: el separador del llamado a la acción. */
export const Triangulos: React.FC = () => (
  <span className="ts-cta__tri" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <svg key={i} width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
        <path d="M0 0l14 8-14 8z" />
      </svg>
    ))}
  </span>
);

export const Chevron: React.FC = () => (
  <svg width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden="true">
    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const OSCURO = '#2b2b2b';
const CLARO = '#c3c9c8';
const TINTA_CLARA = '#d8dcdb';
const TEAL = '#09aea0';

/** La hoja de calibración: filas de un dígito con algunas celdas marcadas. */
const Calibracion: React.FC<{ x: number; y: number; w: number; h: number; semilla: number }> = ({
  x,
  y,
  w,
  h,
  semilla,
}) => {
  const columnas = 16;
  const filas = 5;
  const pasoX = w / columnas;
  const pasoY = h / (filas + 1);

  // Azar con semilla: la misma hoja en cada visita, no ruido por recarga.
  let s = semilla;
  const azar = () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 8) & 0xffffff) / 0xffffff;
  };

  const celdas: React.ReactNode[] = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const cx = x + pasoX * (c + 0.5);
      const cy = y + pasoY * (f + 1);
      // Algunas celdas salen marcadas: un renglón que la lectura no resolvió.
      if (azar() > 0.87) {
        celdas.push(
          <rect
            key={`m${f}-${c}`}
            x={cx - pasoX * 0.2}
            y={cy - pasoY * 0.42}
            width={pasoX * 0.4}
            height={pasoY * 0.66}
            rx={pasoX * 0.2}
            fill={azar() > 0.5 ? TINTA_CLARA : OSCURO}
          />,
        );
        continue;
      }
      celdas.push(
        <text key={`t${f}-${c}`} x={cx} y={cy} textAnchor="middle" fontSize={pasoY * 0.7}>
          {f}
        </text>,
      );
    }
  }

  return (
    <g fill={OSCURO} stroke="none" fontFamily="var(--f-mono)" fontWeight="500">
      {celdas}
    </g>
  );
};

/** El dibujo de la izquierda: engranaje, corredera y el operador con visor. */
const ArteEngranaje: React.FC = () => (
  <g stroke={TINTA_CLARA} fill="none" strokeWidth="1">
    <circle cx="96" cy="72" r="46" />
    <circle cx="96" cy="72" r="18" />
    {Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return (
        <path
          key={i}
          d={`M${(96 + Math.cos(a) * 46).toFixed(1)} ${(72 + Math.sin(a) * 46).toFixed(1)}L${(
            96 +
            Math.cos(a) * 57
          ).toFixed(1)} ${(72 + Math.sin(a) * 57).toFixed(1)}`}
        />
      );
    })}
    <path d="M16 122h86v26H16z" />
    <path d="M24 130h70M24 138h46" strokeDasharray="2 3" />
    <path d="M42 162v48M36 202l6 12 6-12" />
    <path d="M52 254c0-30 26-52 56-52s54 22 54 52v58H52z" />
    <path d="M62 278h88v22H62z" />
    <rect x="98" y="282" width="14" height="14" />
    <path d="M52 298H28M162 298h22" strokeDasharray="2 3" />
  </g>
);

/** El dibujo de la derecha: perfil extruido, barrido en arco y cota al pie. */
const ArtePerfil: React.FC = () => (
  <g stroke={OSCURO} fill="none" strokeWidth="1">
    <path d="M286 46l72 30v52l-72-30z" />
    <path d="M286 46l34-18 72 30-34 18" />
    <path d="M358 76l34-18v52l-34 18" />
    <path d="M300 62l44 18M300 76l44 18" strokeDasharray="2 3" />
    <path d="M414 62c38 46 38 152 0 214" />
    <path d="M406 270l10 8 2-12" />
    <path d="M266 152c56-10 112 12 148 62" strokeDasharray="3 4" />
    <circle cx="302" cy="214" r="34" />
    <circle cx="302" cy="214" r="12" />
    <path d="M302 180v-22M302 248v22M268 214h-22M336 214h22" strokeDasharray="2 3" />
    <path d="M252 342h188M252 336v12M440 336v12" />
  </g>
);

interface PropsLamina {
  /** Número de figura, rotulado en vertical sobre el margen derecho. */
  fig: string;
  /** Cota grande de la esquina, como en las planchas de patente. */
  cota: string;
  pie: string;
  semilla: number;
}

const Lamina: React.FC<PropsLamina> = ({ fig, cota, pie, semilla }) => (
  <svg viewBox="0 0 480 380" aria-hidden="true">
    {/* 1. El corte: mitad oscura, mitad clara. */}
    <rect x="0" y="0" width="238" height="380" fill={OSCURO} />
    <rect x="238" y="0" width="242" height="380" fill={CLARO} />

    {/* 2. El line art, invertido de tinta a cada lado del corte. */}
    <ArteEngranaje />
    <ArtePerfil />

    {/* Las cotas sueltas, que es lo que convierte un dibujo en una plancha. */}
    <text
      x="14"
      y="44"
      fontFamily="var(--f-display)"
      fontSize="36"
      letterSpacing="-0.02em"
      fill={TINTA_CLARA}
      stroke="none"
    >
      {cota}
    </text>
    <g fontFamily="var(--f-mono)" fontSize="11" stroke="none" letterSpacing="0.04em">
      <text x="152" y="32" fill={TINTA_CLARA} transform="rotate(-90 152 32)">
        766
      </text>
      <text x="198" y="28" fill={TINTA_CLARA} transform="rotate(-90 198 28)">
        76
      </text>
      <text x="420" y="316" fill={OSCURO} transform="rotate(-90 420 316)">
        764
      </text>
    </g>
    <text
      x="454"
      y="286"
      fontFamily="var(--f-mono)"
      fontSize="22"
      letterSpacing="0.06em"
      fill={OSCURO}
      stroke="none"
      transform="rotate(-90 454 286)"
    >
      {fig}
    </text>

    {/* 3. El bloque teal macizo, que tapa el dibujo en vez de acompañarlo. */}
    <rect x="112" y="58" width="258" height="292" fill={TEAL} />

    {/* 4. La hoja de calibración, encima del teal. */}
    <text
      x="124"
      y="82"
      fontFamily="var(--f-mono)"
      fontSize="13"
      letterSpacing="0.06em"
      fill={OSCURO}
      stroke="none"
    >
      {pie}
    </text>
    <Calibracion x={118} y={96} w={246} h={240} semilla={semilla} />
  </svg>
);

export const FiguraAgente: React.FC<{ fig: string }> = ({ fig }) => (
  <Lamina fig={fig} cota="170" pie="UXK / OPENCLAW" semilla={17} />
);

export const FiguraCapas: React.FC<{ fig: string }> = ({ fig }) => (
  <Lamina fig={fig} cota="204" pie="UXK / MULTI AGENTE" semilla={41} />
);
