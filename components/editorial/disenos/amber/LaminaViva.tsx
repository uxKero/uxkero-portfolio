import React, { useEffect, useState } from 'react';

// Rótulos de la lámina: la coordenada del puntero arriba y, abajo, una señal en
// vivo con reloj. La banda de escaneo y el parpadeo viven en el CSS.

const dos = (n: number) => String(n).padStart(2, '0');

const LaminaViva: React.FC<{ x: number; y: number; slug: string }> = ({ x, y, slug }) => {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const reloj = window.setInterval(() => setAhora(new Date()), 47);
    return () => window.clearInterval(reloj);
  }, []);

  const hora = `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}:${dos(ahora.getSeconds())}.${dos(
    Math.floor(ahora.getMilliseconds() / 10),
  )}`;

  return (
    <>
      <span className="ed-lamina__coord">
        {Math.round(x)}, {Math.round(y)}
      </span>
      <span className="am-vivo">
        <i />
        LIVE <b>{slug.toUpperCase()}</b> {hora}
      </span>
    </>
  );
};

export default LaminaViva;
