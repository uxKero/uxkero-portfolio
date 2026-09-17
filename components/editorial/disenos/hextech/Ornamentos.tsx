import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Íconos ornamentales del sistema: volumen con degradado, detalle dorado y
// facetas. Un set lineal moderno lo vuelve un tema oscuro con bordes dorados.
// Cada ícono define sus degradados con un prefijo propio para no chocar.
// ─────────────────────────────────────────────────────────────────────────────

export type NombreOrnamento = 'cristal' | 'moneda' | 'esencia' | 'corona' | 'runa' | 'pergamino' | 'estandarte' | 'engranaje';

const Oro: React.FC<{ id: string }> = ({ id }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#FFD970" />
    <stop offset="0.45" stopColor="#C8AA6E" />
    <stop offset="1" stopColor="#785A28" />
  </linearGradient>
);

export const Ornamento: React.FC<{ nombre: NombreOrnamento; tam?: number; className?: string }> = ({
  nombre,
  tam = 20,
  className,
}) => {
  // Id único por instancia: si una copia oculta define el degradado, las demás lo pierden.
  const id = `hx-${nombre}-${React.useId().replace(/:/g, '')}`;
  let dibujo: React.ReactNode = null;

  switch (nombre) {
    case 'cristal':
      dibujo = (
        <>
          <defs>
            <linearGradient id={`${id}-c`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#CDFAFA" />
              <stop offset="0.5" stopColor="#0AC8B9" />
              <stop offset="1" stopColor="#005A82" />
            </linearGradient>
            <Oro id={`${id}-o`} />
          </defs>
          <path d="M16 2 L26 12 L16 30 L6 12 Z" fill={`url(#${id}-c)`} stroke={`url(#${id}-o)`} strokeWidth="1.4" />
          <path d="M6 12 H26 M16 2 L12 12 L16 30 L20 12 Z" fill="none" stroke="rgba(205,250,250,.55)" strokeWidth="0.8" />
        </>
      );
      break;
    case 'moneda':
      dibujo = (
        <>
          <defs>
            <Oro id={`${id}-o`} />
          </defs>
          <circle cx="16" cy="16" r="12" fill={`url(#${id}-o)`} stroke="#3C2A0E" strokeWidth="1" />
          <circle cx="16" cy="16" r="8.5" fill="none" stroke="#785A28" strokeWidth="1.2" />
          <path d="M16 10 L20 16 L16 22 L12 16 Z" fill="#FFF3C4" opacity="0.85" />
        </>
      );
      break;
    case 'esencia':
      dibujo = (
        <>
          <defs>
            <linearGradient id={`${id}-e`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFD9A0" />
              <stop offset="0.5" stopColor="#E0822E" />
              <stop offset="1" stopColor="#7A3410" />
            </linearGradient>
            <Oro id={`${id}-o`} />
          </defs>
          <path d="M16 3 C22 10 25 15 25 20 A9 9 0 0 1 7 20 C7 15 10 10 16 3 Z" fill={`url(#${id}-e)`} stroke={`url(#${id}-o)`} strokeWidth="1.3" />
          <path d="M12 19 A4 4 0 0 0 16 24" fill="none" stroke="#FFE8C4" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
        </>
      );
      break;
    case 'corona':
      dibujo = (
        <>
          <defs>
            <Oro id={`${id}-o`} />
          </defs>
          <path d="M4 24 L6 10 L12 16 L16 6 L20 16 L26 10 L28 24 Z" fill={`url(#${id}-o)`} stroke="#3C2A0E" strokeWidth="1" strokeLinejoin="round" />
          <rect x="4" y="24" width="24" height="3" fill="#785A28" />
          <path d="M16 13 L18 16 L16 19 L14 16 Z" fill="#0AC8B9" />
        </>
      );
      break;
    case 'runa':
      dibujo = (
        <>
          <defs>
            <Oro id={`${id}-o`} />
          </defs>
          <path d="M16 2 L30 16 L16 30 L2 16 Z" fill="#061421" stroke={`url(#${id}-o)`} strokeWidth="1.5" />
          <path d="M16 8 L24 16 L16 24 L8 16 Z" fill="none" stroke="#785A28" strokeWidth="1" />
          <path d="M16 12 L20 16 L16 20 L12 16 Z" fill="#0AC8B9" />
        </>
      );
      break;
    case 'pergamino':
      dibujo = (
        <>
          <defs>
            <Oro id={`${id}-o`} />
          </defs>
          <path d="M8 5 H24 V25 A3 3 0 0 1 21 28 H8 A3 3 0 0 1 5 25 V8 A3 3 0 0 1 8 5 Z" fill="#1E2328" stroke={`url(#${id}-o)`} strokeWidth="1.4" />
          <path d="M10 11 H20 M10 15 H20 M10 19 H16" stroke="#C8AA6E" strokeWidth="1.2" />
        </>
      );
      break;
    case 'estandarte':
      dibujo = (
        <>
          <defs>
            <Oro id={`${id}-o`} />
          </defs>
          <path d="M7 3 H25 V26 L16 21 L7 26 Z" fill="#0A1428" stroke={`url(#${id}-o)`} strokeWidth="1.4" />
          <path d="M16 8 L20 13 L16 18 L12 13 Z" fill={`url(#${id}-o)`} />
        </>
      );
      break;
    case 'engranaje':
      dibujo = (
        <>
          <defs>
            <Oro id={`${id}-o`} />
          </defs>
          <path
            d="M14 3h4l1 4 3 1 3-2 3 3-2 3 1 3 4 1v4l-4 1-1 3 2 3-3 3-3-2-3 1-1 4h-4l-1-4-3-1-3 2-3-3 2-3-1-3-4-1v-4l4-1 1-3-2-3 3-3 3 2 3-1z"
            fill="#1E2328"
            stroke={`url(#${id}-o)`}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="16" r="4.5" fill="none" stroke="#C8AA6E" strokeWidth="1.4" />
        </>
      );
      break;
  }

  return (
    <svg className={className ? `hx-orn ${className}` : 'hx-orn'} width={tam} height={tam} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {dibujo}
    </svg>
  );
};

/** Rombo: bullet, paso de carrusel y nodo de runa. */
export const Rombo: React.FC<{ activo?: boolean; className?: string }> = ({ activo, className }) => (
  <i className={`hx-rombo${activo ? ' is-activo' : ''}${className ? ` ${className}` : ''}`} aria-hidden="true" />
);
