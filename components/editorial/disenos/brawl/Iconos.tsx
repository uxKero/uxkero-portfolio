import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Íconos ilustrados del sistema: volumen, color propio y contorno negro. Un set
// lineal rompe el estilo. Cada uno tiene relleno base, un brillo arriba y el
// contorno de 3.5 en el mismo negro de las placas.
// ─────────────────────────────────────────────────────────────────────────────

export type NombreIcono =
  | 'trofeo'
  | 'mundo'
  | 'caja'
  | 'estrella'
  | 'rayo'
  | 'libro'
  | 'jugador'
  | 'maletin'
  | 'sobre'
  | 'tilde'
  | 'flecha'
  | 'lobby';

const T = { stroke: '#000', strokeWidth: 3.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const BRILLO = 'rgba(255,255,255,0.55)';

const DIBUJOS: Record<NombreIcono, React.ReactNode> = {
  trofeo: (
    <>
      <path d="M14 8h20v10c0 7-4.5 12-10 12S14 25 14 18V8z" fill="#EEC309" {...T} />
      <path d="M14 12H7c0 7 3 10 8 10M34 12h7c0 7-3 10-8 10" fill="none" {...T} />
      <path d="M20 30h8l1 7h-10l1-7z" fill="#BD9A07" {...T} />
      <rect x="13" y="37" width="22" height="6" rx="2" fill="#F48B18" {...T} />
      <path d="M18 11v7" stroke={BRILLO} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  mundo: (
    <>
      <circle cx="24" cy="24" r="17" fill="#0187FF" {...T} />
      <path d="M13 17c4 1 6 4 5 7s2 6 6 5m4-17c-2 3 0 5 3 5s5 3 3 6" fill="#3CB41E" {...T} strokeWidth="3" />
      <path d="M15 14a12 12 0 0 1 8-5" stroke={BRILLO} strokeWidth="3" strokeLinecap="round" fill="none" />
    </>
  ),
  caja: (
    <>
      <path d="M8 16l16-8 16 8v17l-16 8-16-8V16z" fill="#F48B18" {...T} />
      <path d="M8 16l16 8 16-8M24 24v17" fill="none" {...T} />
      <path d="M16 12l16 8v7" fill="none" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 19l8 4" stroke={BRILLO} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  estrella: (
    <>
      <path
        d="M24 5l5.6 11.6 12.7 1.8-9.2 8.9 2.2 12.6L24 34l-11.3 5.9 2.2-12.6-9.2-8.9 12.7-1.8L24 5z"
        fill="#EEC309"
        {...T}
      />
      <path d="M21 14l-2 5" stroke={BRILLO} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  rayo: (
    <>
      <path d="M27 4L10 27h11l-3 17 19-24H25l2-16z" fill="#3CF2FF" {...T} />
      <path d="M22 13l-5 8" stroke={BRILLO} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  libro: (
    <>
      <path d="M6 11c7-2 13-1 18 3v27c-5-4-11-5-18-3V11z" fill="#5912D0" {...T} />
      <path d="M42 11c-7-2-13-1-18 3v27c5-4 11-5 18-3V11z" fill="#7B3CF0" {...T} />
      <path d="M11 17c3-1 6-1 9 1M11 23c3-1 6-1 9 1" stroke={BRILLO} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  jugador: (
    <>
      <circle cx="24" cy="17" r="9" fill="#F7B529" {...T} />
      <path d="M8 43c1-10 7-15 16-15s15 5 16 15H8z" fill="#0187FF" {...T} />
      <path d="M19 13a5 5 0 0 1 4-3" stroke={BRILLO} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  maletin: (
    <>
      <rect x="6" y="15" width="36" height="25" rx="4" fill="#CD0E2D" {...T} />
      <path d="M17 15v-5h14v5" fill="none" {...T} />
      <path d="M6 25h36" {...T} />
      <rect x="20" y="22" width="8" height="7" rx="1.5" fill="#EEC309" {...T} strokeWidth="3" />
      <path d="M11 20h8" stroke={BRILLO} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  sobre: (
    <>
      <rect x="5" y="11" width="38" height="27" rx="4" fill="#FFFFFF" {...T} />
      <path d="M6 13l18 14 18-14" fill="none" {...T} />
      <path d="M7 36l12-11M41 36L29 25" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  tilde: (
    <>
      <circle cx="24" cy="24" r="18" fill="#3CB41E" {...T} />
      <path d="M15 24l6 6 12-13" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 24l6 6 12-13" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  flecha: (
    <>
      <path d="M6 18h20V9l16 15-16 15v-9H6V18z" fill="#FFFFFF" {...T} />
    </>
  ),
  lobby: (
    <>
      <path d="M6 22L24 7l18 15v19H6V22z" fill="#F7B529" {...T} />
      <rect x="19" y="28" width="10" height="13" fill="#CD0E2D" {...T} strokeWidth="3" />
      <path d="M11 22l13-10" stroke={BRILLO} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};

export const Icono: React.FC<{ nombre: NombreIcono; tam?: number; className?: string }> = ({
  nombre,
  tam = 32,
  className,
}) => (
  <svg
    className={className ? `bw-icono ${className}` : 'bw-icono'}
    width={tam}
    height={tam}
    viewBox="0 0 48 48"
    aria-hidden="true"
    focusable="false"
  >
    {DIBUJOS[nombre]}
  </svg>
);
