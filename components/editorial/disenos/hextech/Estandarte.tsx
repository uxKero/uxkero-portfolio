import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Estandarte y emblema, dibujados en SVG a partir de lol2 y lol3 mirados de
// cerca. El cuerpo es gris cálido con textura y filetes de oro a los costados;
// abajo, alas de metal que convergen en una punta con su gema. El emblema lleva
// cuernos de metal con brillo, capas de alas violetas, doble aro de oro con luz
// fría adentro y una gema facetada al pie. Todo el oro es metal: degradados de
// varias paradas con reflejo, nunca un color plano.
// ─────────────────────────────────────────────────────────────────────────────

const Metal: React.FC<{ id: string; vertical?: boolean }> = ({ id, vertical = true }) => (
  <linearGradient id={id} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
    <stop offset="0" stopColor="#fff3c4" />
    <stop offset="0.18" stopColor="#e2c27a" />
    <stop offset="0.42" stopColor="#9a7432" />
    <stop offset="0.58" stopColor="#f0d58c" />
    <stop offset="0.8" stopColor="#7a5a24" />
    <stop offset="1" stopColor="#3c2a0e" />
  </linearGradient>
);

/** El emblema: cuernos, alas, doble aro, retrato y gema. */
export const Emblema: React.FC<{ foto: string; tam?: number; filtrar?: boolean }> = ({ foto, tam = 150, filtrar }) => {
  const u = React.useId().replace(/:/g, '');
  return (
    <div className="cl-emblema" style={{ width: tam, height: tam * 1.05 }}>
      <svg viewBox="0 0 200 210" width={tam} height={tam * 1.05} aria-hidden="true">
        <defs>
          <Metal id={`${u}m`} />
          <Metal id={`${u}h`} vertical={false} />
          <linearGradient id={`${u}ala`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b98cff" />
            <stop offset="0.45" stopColor="#5a2fb0" />
            <stop offset="1" stopColor="#1b0f3d" />
          </linearGradient>
          <linearGradient id={`${u}ala2`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e8a0ff" />
            <stop offset="1" stopColor="#7a2a8a" />
          </linearGradient>
          <linearGradient id={`${u}ala3`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fb8ff" />
            <stop offset="0.5" stopColor="#4a3ac8" />
            <stop offset="1" stopColor="#2a0f5a" />
          </linearGradient>
          <linearGradient id={`${u}cuerno`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4efe6" />
            <stop offset="0.5" stopColor="#8f8a86" />
            <stop offset="1" stopColor="#3f3a3a" />
          </linearGradient>
          <radialGradient id={`${u}luz`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.78" stopColor="#bfefff" stopOpacity="0" />
            <stop offset="0.9" stopColor="#bfefff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#4ac6ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${u}gema`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff2a8" />
            <stop offset="0.45" stopColor="#f0b020" />
            <stop offset="1" stopColor="#8a4a00" />
          </linearGradient>
          <filter id={`${u}sombra`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
          </filter>
        </defs>
        <g filter={`url(#${u}sombra)`}>
          {/* Alas: una capa exterior grande azul violeta y dos violetas encima */}
          <path d="M70 62 C28 58 4 92 8 132 C22 118 40 116 54 122 C36 142 40 166 62 178 C64 158 74 146 88 142 C66 126 60 94 70 62Z" fill={`url(#${u}ala3)`} stroke="#c9d8ff" strokeOpacity="0.45" strokeWidth="1.2" />
          <path d="M130 62 C172 58 196 92 192 132 C178 118 160 116 146 122 C164 142 160 166 138 178 C136 158 126 146 112 142 C134 126 140 94 130 62Z" fill={`url(#${u}ala3)`} stroke="#c9d8ff" strokeOpacity="0.45" strokeWidth="1.2" />
          <path d="M60 70 C30 80 18 110 28 140 C40 130 52 128 64 132 C54 116 54 94 60 70Z" fill={`url(#${u}ala)`} stroke="#e6d4ff" strokeOpacity="0.55" strokeWidth="1.2" />
          <path d="M140 70 C170 80 182 110 172 140 C160 130 148 128 136 132 C146 116 146 94 140 70Z" fill={`url(#${u}ala)`} stroke="#e6d4ff" strokeOpacity="0.55" strokeWidth="1.2" />
          <path d="M50 100 C36 118 40 150 60 166 C62 150 70 140 80 136 C64 130 54 118 50 100Z" fill={`url(#${u}ala2)`} opacity="0.85" />
          <path d="M150 100 C164 118 160 150 140 166 C138 150 130 140 120 136 C136 130 146 118 150 100Z" fill={`url(#${u}ala2)`} opacity="0.85" />
          {/* Nervaduras de las plumas */}
          <path d="M22 118 C36 110 50 112 60 118 M34 150 C48 140 62 140 74 144 M178 118 C164 110 150 112 140 118 M166 150 C152 140 138 140 126 144" fill="none" stroke="#1a0f3d" strokeOpacity="0.55" strokeWidth="1.5" />
          <path d="M16 110 C30 100 46 100 58 106 M184 110 C170 100 154 100 142 106" fill="none" stroke="#dfe8ff" strokeOpacity="0.35" strokeWidth="1" />
          {/* Cuernos de metal claro con filo dorado */}
          <path d="M58 20 C40 48 36 80 52 104 C54 84 62 66 76 56 C64 50 58 38 58 20Z" fill={`url(#${u}cuerno)`} stroke={`url(#${u}m)`} strokeWidth="2.5" />
          <path d="M142 20 C160 48 164 80 148 104 C146 84 138 66 124 56 C136 50 142 38 142 20Z" fill={`url(#${u}cuerno)`} stroke={`url(#${u}m)`} strokeWidth="2.5" />
          {/* Doble aro */}
          <circle cx="100" cy="100" r="55" fill="#0a0f18" stroke={`url(#${u}m)`} strokeWidth="9" />
          <circle cx="100" cy="100" r="49" fill="none" stroke="#3c2a0e" strokeWidth="1.5" />
          <path d="M72 48 L100 36 L128 48 L118 52 L100 45 L82 52Z" fill={`url(#${u}h)`} />
          {/* Pie con gema facetada */}
          <path d="M72 150 L100 196 L128 150 L112 156 L100 176 L88 156Z" fill={`url(#${u}m)`} />
          <path d="M100 146 L118 162 L100 186 L82 162Z" fill={`url(#${u}gema)`} stroke="#5a3a08" strokeWidth="1.5" />
          <path d="M100 146 L108 162 L100 186 L92 162Z" fill="#fff6c8" opacity="0.35" />
        </g>
      </svg>
      <span className="cl-emblema__foto">
        <img src={foto} alt="" className={filtrar ? 'is-filtrada' : undefined} />
        <i />
      </span>
    </div>
  );
};

/** El estandarte: tela oscura recta arriba y, abajo, un escudo que se cierra en
 *  curva larga con el filo de oro, orejas en las esquinas y dos hojas de metal
 *  que se cruzan en la punta. */
export const Estandarte: React.FC<React.PropsWithChildren<{ className?: string; destacado?: boolean }>> = ({
  className,
  destacado,
  children,
}) => {
  const u = React.useId().replace(/:/g, '');
  return (
    <div className={`cl-banderin${destacado ? ' is-destacado' : ''}${className ? ` ${className}` : ''}`}>
      <span className="cl-banderin__cuerpo" aria-hidden="true" />
      <svg className="cl-banderin__remate" viewBox="0 0 200 150" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <Metal id={`${u}m`} />
          <linearGradient id={`${u}tela`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1f1e1c" />
            <stop offset="0.5" stopColor="#2a2825" />
            <stop offset="1" stopColor="#1f1e1c" />
          </linearGradient>
          <linearGradient id={`${u}fondo`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0e0e0d" stopOpacity="0" />
            <stop offset="1" stopColor="#0e0e0d" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={`${u}filo`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c8aa6e" stopOpacity="0" />
            <stop offset="0.3" stopColor="#785a28" />
            <stop offset="0.65" stopColor="#e2c27a" />
            <stop offset="1" stopColor="#f0d58c" />
          </linearGradient>
          <linearGradient id={`${u}oreja`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6b5226" />
            <stop offset="1" stopColor="#2a1f0c" />
          </linearGradient>
          <filter id={`${u}s`} x="-10%" y="-20%" width="120%" height="150%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.7" />
          </filter>
        </defs>
        {/* La tela recta es la del cuerpo; acá solo el pico que baja entre las orejas */}
        <path d="M0 122 H200 V124 L100 150 L0 124Z" fill={`url(#${u}tela)`} />
        {/* Panel interior que se cierra en curva larga */}
        <path d="M9 0 H191 V34 C191 90 132 118 100 140 C68 118 9 90 9 34Z" fill={`url(#${u}fondo)`} />
        {/* Orejas oscuras en las esquinas, con filo de oro */}
        <path d="M0 92 L0 126 L26 132 L16 110Z M200 92 L200 126 L174 132 L184 110Z" fill={`url(#${u}oreja)`} stroke="#9a7432" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <g filter={`url(#${u}s)`}>
          {/* Filo de oro que nace tenue y dobla hacia la punta */}
          <path d="M9 0 V34 C9 90 68 118 100 140 C132 118 191 90 191 34 V0" fill="none" stroke={`url(#${u}filo)`} strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
          {/* Hojas de metal que se cruzan en la punta */}
          <path d="M12 110 C42 116 74 128 97 148 L101 157 L88 152 C70 138 42 128 6 124Z" fill={`url(#${u}m)`} />
          <path d="M188 110 C158 116 126 128 103 148 L99 157 L112 152 C130 138 158 128 194 124Z" fill={`url(#${u}m)`} />
          <path d="M40 100 C62 106 84 118 98 136 L96 141 C80 126 60 116 35 109Z M160 100 C138 106 116 118 102 136 L104 141 C120 126 140 116 165 109Z" fill={`url(#${u}m)`} opacity="0.85" />
          <path d="M100 134 L106 145 L100 158 L94 145Z" fill="#f0d58c" stroke="#5a3a08" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d="M100 134 L102.5 145 L100 158 L97.5 145Z" fill="#fff6c8" opacity="0.55" />
        </g>
      </svg>
      <div className="cl-banderin__contenido">{children}</div>
    </div>
  );
};
