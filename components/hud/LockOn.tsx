import React from 'react';
import { motion } from 'framer-motion';

/**
 * One-shot lock-on: two square outlines converge and fade over the target.
 * Purpose-built replacement for heavier reticle art — ~60 lines, pure SVG.
 * Caller unmounts it after ~900ms; it renders nothing by itself afterwards.
 */
const LockOn: React.FC<{ color?: string; size?: number }> = ({ color = '#38bdf8', size = 180 }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ delay: 0.55, duration: 0.3 }}
    aria-hidden
  >
    {/* Outer square: rotates and shrinks onto the target */}
    <motion.rect
      x="10"
      y="10"
      width="80"
      height="80"
      stroke={color}
      strokeWidth="1"
      initial={{ scale: 1.5, rotate: 45, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 0.9 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: '50% 50%' }}
    />
    {/* Inner square: counter-rotates in */}
    <motion.rect
      x="26"
      y="26"
      width="48"
      height="48"
      stroke={color}
      strokeWidth="1"
      initial={{ scale: 1.8, rotate: -45, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 0.5 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: '50% 50%' }}
    />
    {/* Center tick */}
    <motion.circle
      cx="50"
      cy="50"
      r="1.6"
      fill={color}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.15 }}
    />
  </motion.svg>
);

export default LockOn;
