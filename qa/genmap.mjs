// Turns real US state boundaries into a small, accurate SVG path set for the
// PA -> NC corridor. Run once; the output is committed as static data so the
// site has no runtime map dependency and works offline.
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'C:/Users/jonwh/AppData/Local/Temp/claude/C--Users-jonwh-Code-JonVault/76eb9d02-b270-4965-a6c2-fc90483f5d21/scratchpad/us-states.json';
const OUT = 'C:/Users/jonwh/Personal-Website/portfolio-frontend/src/data/journeyMap.js';

const WANTED = [
  'Pennsylvania', 'North Carolina', 'Ohio', 'West Virginia', 'Virginia',
  'Maryland', 'South Carolina', 'Kentucky', 'Tennessee', 'New York',
  'New Jersey', 'Delaware', 'Georgia',
];
const HIGHLIGHT = new Set(['Pennsylvania', 'North Carolina']);

const CITIES = {
  'slippery-rock': { name: 'Slippery Rock', state: 'Pennsylvania', lat: 41.0637, lon: -80.0559 },
  'charlotte':     { name: 'Charlotte',     state: 'North Carolina', lat: 35.2271, lon: -80.8431 },
};

const geo = JSON.parse(readFileSync(SRC, 'utf8'));

// --- Web Mercator. Standard for a small regional map; keeps state shapes honest.
// The 180/PI factor converts the projected y back into the same "degrees" unit
// as longitude. Without it y is in radians, x is in degrees, and the whole map
// squashes to a ~18px-tall smear that collapses every outline to a straight line.
const merc = (lat) =>
  (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2));

// --- Ramer-Douglas-Peucker: drop points that do not change the outline shape.
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1e-12;
    const d = Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= eps) return [pts[0], pts[pts.length - 1]];
  return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
}

const feats = geo.features.filter(f => WANTED.includes(f.properties.name));
if (feats.length !== WANTED.length) {
  const got = feats.map(f => f.properties.name);
  throw new Error('Missing states: ' + WANTED.filter(w => !got.includes(w)).join(', '));
}

// Collect every ring in lon/lat, then find the bounding box.
const rings = [];
for (const f of feats) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    for (const ring of poly) {
      if (ring.length > 12) rings.push({ state: f.properties.name, ring });
    }
  }
}

let minLon = 180, maxLon = -180, minMy = 1e9, maxMy = -1e9;
for (const { ring } of rings) {
  for (const [lon, lat] of ring) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    const my = merc(lat);
    if (my < minMy) minMy = my;
    if (my > maxMy) maxMy = my;
  }
}

const W = 1000;
const scale = W / (maxLon - minLon);
const H = Math.round((maxMy - minMy) * scale);

const project = (lon, lat) => [
  (lon - minLon) * scale,
  (maxMy - merc(lat)) * scale,   // SVG y grows downward
];

// No simplification pass. This source is ALREADY generalised (Pennsylvania is
// 33 points, the whole file is 87KB for 52 states), so running Douglas-Peucker
// over it only destroys shape — it collapsed every ring to a straight line and
// produced an empty map. Left rdp() defined above but unused, deliberately: if
// a denser boundary source is ever swapped in, that is where it plugs back in.
const paths = [];
for (const { state, ring } of rings) {
  const pts = ring.map(([lon, lat]) => project(lon, lat));
  if (pts.length < 4) continue;
  const d = 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
  paths.push({ state, d, highlight: HIGHLIGHT.has(state) });
}

// Keep only the largest ring per state (drops offshore islands that add noise).
const byState = new Map();
for (const p of paths) {
  const prev = byState.get(p.state);
  if (!prev || p.d.length > prev.d.length) byState.set(p.state, p);
}
const finalPaths = [...byState.values()];

const cities = {};
for (const [key, c] of Object.entries(CITIES)) {
  const [x, y] = project(c.lon, c.lat);
  cities[key] = { ...c, x: +x.toFixed(1), y: +y.toFixed(1) };
}

// Great-circle distance (haversine), so the number on the page is real.
const R_MI = 3958.7613;
const toRad = (d) => d * Math.PI / 180;
const a = CITIES['slippery-rock'], b = CITIES['charlotte'];
const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
const h = Math.sin(dLat / 2) ** 2 +
  Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
const miles = 2 * R_MI * Math.asin(Math.sqrt(h));

const out = `// GENERATED FILE — do not hand-edit.
//
// Built from real US state boundaries (public-domain US Census cartographic
// data via PublicaMundi/MappingAPI), projected with Web Mercator and simplified
// with Ramer-Douglas-Peucker so the outlines stay recognisable but the file
// stays small. Generator: qa/genmap.mjs.
//
// Committed as static data on purpose: the map needs no runtime library, no
// network call, and no API key, so it renders instantly and works offline.

export const MAP_WIDTH = ${W};
export const MAP_HEIGHT = ${H};

export const STATES = ${JSON.stringify(finalPaths.map(p => ({ n: p.state, d: p.d, hi: p.highlight })), null, 0)};

export const CITIES = ${JSON.stringify(cities, null, 2)};

/** Great-circle distance between the two cities, in miles. */
export const DISTANCE_MILES = ${Math.round(miles)};

/** They sit within a degree of longitude of each other — the move was almost due south. */
export const LONGITUDE_DELTA_DEG = ${Math.abs(a.lon - b.lon).toFixed(2)};
`;

writeFileSync(OUT, out, 'utf8');
console.log(`states: ${finalPaths.length}`);
console.log(`viewBox: 0 0 ${W} ${H}`);
console.log(`distance: ${miles.toFixed(1)} mi`);
console.log(`lon delta: ${Math.abs(a.lon - b.lon).toFixed(2)} deg`);
console.log(`cities:`, JSON.stringify(cities));
console.log(`bytes: ${out.length}`);
console.log(`wrote ${OUT}`);
