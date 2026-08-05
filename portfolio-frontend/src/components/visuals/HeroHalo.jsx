import React from 'react';

/**
 * The still version of the portrait field: an instrument-dial ring assembly
 * drawn once and never moved.
 *
 * This is what ships to phones, to anyone who asked for reduced motion, to a
 * browser with no WebGL, and for the moment before the 3D chunk arrives. It has
 * to be a finished picture on its own - nobody should be able to tell they were
 * served the fallback, only that nothing is moving.
 *
 * Colours come from Tailwind `dark:` variants rather than JavaScript, so the
 * theme toggle reaches it with no re-render and no observer.
 */

const SIZE = 240;
const CENTRE = SIZE / 2;

const TICKS = Array.from({ length: 32 }, (_, i) => (i * Math.PI * 2) / 32);
const MARKERS = [0.5, 2.1, 3.6, 5.2];

export default function HeroHalo() {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full" role="presentation" focusable="false">
      {/* Two orbits at different tilts, matching the two the 3D scene turns. */}
      <g fill="none" className="stroke-blue-700 dark:stroke-cyan-300">
        <circle cx={CENTRE} cy={CENTRE} r="112" strokeOpacity="0.2" strokeWidth="0.8" strokeDasharray="3 7" />
        <ellipse
          cx={CENTRE} cy={CENTRE} rx="110" ry="44"
          strokeOpacity="0.4" strokeWidth="1"
          transform={`rotate(-24 ${CENTRE} ${CENTRE})`}
        />
        <ellipse
          cx={CENTRE} cy={CENTRE} rx="106" ry="38"
          strokeOpacity="0.24" strokeWidth="1"
          transform={`rotate(58 ${CENTRE} ${CENTRE})`}
        />
      </g>

      <g className="stroke-blue-700 dark:stroke-cyan-300" strokeWidth="1" strokeOpacity="0.28">
        {TICKS.map((angle, i) => {
          const inner = i % 8 === 0 ? 100 : 105;
          return (
            <line
              key={angle}
              x1={CENTRE + Math.cos(angle) * inner}
              y1={CENTRE + Math.sin(angle) * inner}
              x2={CENTRE + Math.cos(angle) * 110}
              y2={CENTRE + Math.sin(angle) * 110}
            />
          );
        })}
      </g>

      {/* The packets, parked where the 3D scene would have them travelling. */}
      <g stroke="none" className="fill-cyan-600 dark:fill-cyan-300" transform={`rotate(-24 ${CENTRE} ${CENTRE})`}>
        {MARKERS.map((angle) => (
          <circle
            key={angle}
            cx={CENTRE + Math.cos(angle) * 110}
            cy={CENTRE + Math.sin(angle) * 44}
            r="2.8"
            fillOpacity="0.8"
          />
        ))}
      </g>
    </svg>
  );
}
