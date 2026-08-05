import React from 'react';
import { MAP_WIDTH, MAP_HEIGHT, STATES, CITIES } from '../data/journeyMap';

const FROM = CITIES['slippery-rock'];
const TO = CITIES['charlotte'];

// A gentle bow to the east so the route reads as a path rather than a ruler
// line. The control point is offset perpendicular to the straight line, which
// keeps the curve sensible no matter where the two endpoints sit.
const bow = () => {
  const mx = (FROM.x + TO.x) / 2;
  const my = (FROM.y + TO.y) / 2;
  const dx = TO.x - FROM.x;
  const dy = TO.y - FROM.y;
  const len = Math.hypot(dx, dy) || 1;
  const curve = len * 0.18;
  return { cx: mx - (dy / len) * curve, cy: my + (dx / len) * curve };
};
const { cx, cy } = bow();
const ROUTE = `M ${FROM.x} ${FROM.y} Q ${cx} ${cy} ${TO.x} ${TO.y}`;

/**
 * A small "where I came from, where I am" map.
 *
 * It used to be a full chapter with a heading, coordinates, mileage and a card
 * around it. It is now a quiet detail that sits beside the intro: the picture
 * says the whole thing, so anything written next to it was just repeating it.
 *
 * Every colour comes from a CSS custom property set on :root and overridden
 * under html.dark (see index.css), passed through `style` rather than the
 * fill/stroke attributes so var() resolves in every browser, not just Chromium.
 */
export default function JourneyMap() {
  return (
    <div data-journey-map className="w-full">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full h-auto max-w-full"
        role="img"
        aria-label={`Small map of the eastern United States marking ${FROM.name}, ${FROM.state} and ${TO.name}, ${TO.state}.`}
      >
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--map-route-from)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--map-route-to)' }} />
          </linearGradient>
        </defs>

        {STATES.map((s) => (
          <path
            key={s.n}
            data-state={s.n}
            d={s.d}
            style={{
              fill: s.hi ? 'var(--map-state-fill-hi)' : 'var(--map-state-fill)',
              stroke: s.hi ? 'var(--map-state-stroke-hi)' : 'var(--map-state-stroke)',
            }}
            // Heavier strokes than the big version had: at this size a 1.5px
            // line on a 1000-unit viewBox renders as a faint smudge.
            strokeWidth={s.hi ? 5 : 3}
            strokeLinejoin="round"
          />
        ))}

        <path
          data-route="slippery-rock->charlotte"
          d={ROUTE}
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="26 20"
          className="motion-safe:animate-[dash_2.4s_linear_infinite]"
        />

        {[
          { key: 'slippery-rock', c: FROM, color: 'var(--map-route-from)' },
          { key: 'charlotte', c: TO, color: 'var(--map-route-to)' },
        ].map(({ key, c, color }) => (
          <g key={key} data-city={key}>
            <circle cx={c.x} cy={c.y} r="22" style={{ fill: color }} opacity="0.22">
              <animate attributeName="r" values="22;34;22" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.30;0;0.30" dur="2.6s" repeatCount="indefinite" />
            </circle>
            {/* The ring is the PAGE colour, so the pin separates from the map
                in either theme instead of growing a black halo on white. */}
            <circle
              cx={c.x}
              cy={c.y}
              r="13"
              style={{ fill: color, stroke: 'var(--map-city-ring)' }}
              strokeWidth="5"
            />
          </g>
        ))}
      </svg>

      <p className="mt-2 text-[13px] leading-snug text-slate-600 dark:text-gray-400 text-center">
        <span className="text-slate-900 dark:text-gray-200 font-semibold">Slippery Rock, PA</span>
        {' → '}
        <span className="text-slate-900 dark:text-gray-200 font-semibold">Charlotte, NC</span>
      </p>
    </div>
  );
}
