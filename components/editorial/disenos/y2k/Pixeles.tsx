import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Íconos del período: pixel art de 12x12 con paleta corta. Un set lineal
// moderno rompe el estilo. Cada letra es un color; el punto, transparente.
// ─────────────────────────────────────────────────────────────────────────────

const PALETA: Record<string, string> = {
  k: '#000000',
  y: '#FDB90E',
  Y: '#FDD01B',
  b: '#1100FF',
  B: '#4467FF',
  w: '#FFFFFF',
  g: '#C0C0C0',
  G: '#808080',
  n: '#001533',
  t: '#2CA3A1',
  r: '#FA6016',
};

const DIBUJOS = {
  carpeta: [
    '............',
    '.kkkk.......',
    'kYYYYk......',
    'kYyyyykkkkk.',
    'kYYYYYYYYYyk',
    'kYyyyyyyyyyk',
    'kYyyyyyyyyyk',
    'kYyyyyyyyyyk',
    'kYyyyyyyyyyk',
    'kYyyyyyyyyyk',
    'kkkkkkkkkkkk',
    '............',
  ],
  documento: [
    '.kkkkkkk....',
    '.kwwwwwwkk..',
    '.kwwwwwwkwk.',
    '.kwnnnnwkkkk',
    '.kwwwwwwwwwk',
    '.kwnnnnnnnwk',
    '.kwwwwwwwwwk',
    '.kwnnnnnnnwk',
    '.kwwwwwwwwwk',
    '.kwnnnnnwwwk',
    '.kwwwwwwwwwk',
    '.kkkkkkkkkkk',
  ],
  mundo: [
    '...kkkkkk...',
    '.kkBBBttBBk.',
    '.kBBttttBBBk',
    'kBBtttBBBBBk',
    'kBttttBBtBBk',
    'kBBttBBBttBk',
    'kBBBBBBtttBk',
    'kBBBBBttttBk',
    '.kBBBBBttBk.',
    '.kkBBBBBBkk.',
    '...kkkkkk...',
    '............',
  ],
  sobre: [
    '............',
    'kkkkkkkkkkkk',
    'kwwwwwwwwwwk',
    'kkwwwwwwwwkk',
    'kwkwwwwwwkwk',
    'kwwkwwwwkwwk',
    'kwwwkkkkwwwk',
    'kwwkwwwwkwwk',
    'kwkwwwwwwkwk',
    'kkwwwwwwwwkk',
    'kkkkkkkkkkkk',
    '............',
  ],
  libro: [
    '............',
    '.kkkkkkkkkk.',
    'kbbbbbbbbbbk',
    'kbBBBBBBBBbk',
    'kbBwwwwwwBbk',
    'kbBBBBBBBBbk',
    'kbBBBBBBBBbk',
    'kbBBBBBBBBbk',
    'kbbbbbbbbbbk',
    'kwwwwwwwwwwk',
    'kkkkkkkkkkkk',
    '............',
  ],
  estrella: [
    '.....kk.....',
    '.....yy.....',
    '....kyyk....',
    '....kyyk....',
    '..kkyYYykk..',
    'kyyyYwwYyyyk',
    'kyyyYwwYyyyk',
    '..kkyYYykk..',
    '....kyyk....',
    '....kyyk....',
    '.....yy.....',
    '.....kk.....',
  ],
  tilde: [
    '............',
    '..........kk',
    '.........kbk',
    '........kbk.',
    'kk.....kbk..',
    'kbk...kbk...',
    '.kbk.kbk....',
    '..kbkbk.....',
    '...kbk......',
    '....k.......',
    '............',
    '............',
  ],
  aviso: [
    '.....kk.....',
    '....kyyk....',
    '....kyyk....',
    '...kyyyyk...',
    '...kykkyk...',
    '..kyykkyyk..',
    '..kyykkyyk..',
    '.kyyyyyyyyk.',
    '.kyyykkyyyk.',
    'kyyyyyyyyyyk',
    'kkkkkkkkkkkk',
    '............',
  ],
  pc: [
    '.kkkkkkkkkk.',
    '.kggggggggk.',
    '.kgbbbbbbgk.',
    '.kgbBBBBbgk.',
    '.kgbBBBBbgk.',
    '.kgbbbbbbgk.',
    '.kggggggggk.',
    '.kkkkkkkkkk.',
    '....kggk....',
    '..kkkkkkkk..',
    '..kggggggk..',
    '..kkkkkkkk..',
  ],
  persona: [
    '....kkkk....',
    '...kyyyyk...',
    '...kyyyyk...',
    '...kyyyyk...',
    '....kkkk....',
    '..kkBBBBkk..',
    '.kBBBBBBBBk.',
    '.kBBBBBBBBk.',
    '.kBBBBBBBBk.',
    '.kBBBBBBBBk.',
    '.kkkkkkkkkk.',
    '............',
  ],
} as const;

export type NombrePixel = keyof typeof DIBUJOS;

export const Pixel: React.FC<{ nombre: NombrePixel; tam?: number; className?: string }> = ({
  nombre,
  tam = 16,
  className,
}) => {
  const filas = DIBUJOS[nombre];
  const rects: React.ReactNode[] = [];
  filas.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x++) {
      const c = fila[x];
      if (c === '.') continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={PALETA[c]} />);
    }
  });
  return (
    <svg
      className={className ? `y2-pixel ${className}` : 'y2-pixel'}
      width={tam}
      height={tam}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {rects}
    </svg>
  );
};

/** Destello de cuatro puntas, blanco, para la capa de textura. */
export const Destello: React.FC<{ tam: number; style?: React.CSSProperties; className?: string }> = ({
  tam,
  style,
  className,
}) => (
  <svg
    className={className ? `y2-destello ${className}` : 'y2-destello'}
    width={tam}
    height={tam}
    viewBox="0 0 32 32"
    style={style}
    aria-hidden="true"
  >
    <path d="M16 0 C17 11 21 15 32 16 C21 17 17 21 16 32 C15 21 11 17 0 16 C11 15 15 11 16 0Z" fill="#fff" />
  </svg>
);
