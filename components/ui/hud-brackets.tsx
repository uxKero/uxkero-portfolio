import React from 'react';

/**
 * Four 1px corner strokes framing the active/hovered panel — the signature
 * "gaming minimal" gesture. Color comes from currentColor so callers set it
 * with a text-* class (e.g. text-hud). Purely decorative.
 */
const HudBrackets: React.FC<{ className?: string; inset?: string; size?: string }> = ({
  className = '',
  inset = 'inset-3',
  size = 'w-3 h-3',
}) => (
  <div className={`pointer-events-none absolute ${inset} ${className}`} aria-hidden>
    <span className={`absolute left-0 top-0 ${size} border-l border-t border-current`} />
    <span className={`absolute right-0 top-0 ${size} border-r border-t border-current`} />
    <span className={`absolute bottom-0 left-0 ${size} border-b border-l border-current`} />
    <span className={`absolute bottom-0 right-0 ${size} border-b border-r border-current`} />
  </div>
);

export default HudBrackets;
