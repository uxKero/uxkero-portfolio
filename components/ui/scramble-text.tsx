import React, { useEffect, useRef, useState } from 'react';

const GLYPHS = '▓▒░<>/\\|=+*#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Text that "decodes" into place: characters resolve left-to-right out of
 * random glyph noise. Renders instantly under prefers-reduced-motion.
 */
const ScrambleText: React.FC<{
  text: string;
  className?: string;
  /** ms before the decode starts */
  delay?: number;
  /** ms per resolved character */
  speed?: number;
}> = ({ text, className = '', delay = 0, speed = 35 }) => {
  const [output, setOutput] = useState(() => (reduced() ? text : ''));
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (reduced()) {
      setOutput(text);
      return;
    }
    let revealed = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      revealed = Math.min(text.length, Math.floor(elapsed / speed));
      const noise = text
        .slice(revealed)
        .split('')
        .map((c) => (c === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
        .join('');
      setOutput(text.slice(0, revealed) + noise);
      if (revealed < text.length) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [text, delay, speed]);

  // Reserve full width from the first frame so layout never shifts
  return (
    <span className={`whitespace-pre ${className}`} aria-label={text}>
      {output || ' '}
    </span>
  );
};

export default ScrambleText;
