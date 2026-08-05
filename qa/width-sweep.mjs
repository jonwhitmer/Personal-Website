// Continuous width sweep.
//
// `responsive.mjs` checks 8 fixed device profiles. That is how a layout can be
// green everywhere and still be visibly broken: a defect that only appears
// between 741px and 767px, or right where a grid changes column count, sits in
// the gap between two "supported" sizes and nothing ever looks at it. Jon kept
// finding exactly that by dragging his window.
//
// So this walks EVERY width in small steps and, at each one, asks the questions
// that correspond to "something is cut off":
//   1. does the page scroll horizontally
//   2. does any element extend past the right edge of the viewport
//   3. is any text clipped by its own container (overflow hidden and content
//      wider/taller than the box)
//   4. is anything truncated with an ellipsis
//   5. does the sticky header stay one row
//
// Run:  node qa/width-sweep.mjs

import { chromium } from 'playwright';

const BASE = process.env.SITE_URL || 'http://localhost:5173';

// Fine steps where layouts actually change, coarser once the page is just
// getting wider with a capped container.
const WIDTHS = [];
for (let w = 320; w <= 1024; w += 8) WIDTHS.push(w);
for (let w = 1032; w <= 1600; w += 16) WIDTHS.push(w);
for (let w = 1632; w <= 2560; w += 64) WIDTHS.push(w);

const PROBE = () => {
  const vw = window.innerWidth;
  const problems = [];

  if (document.documentElement.scrollWidth > vw + 1) {
    problems.push({ kind: 'page-overflow', detail: `document ${document.documentElement.scrollWidth}px in ${vw}px` });
  }

  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;

    // Decorative, deliberately-clipped things are not defects. The background
    // blobs sit outside the viewport on purpose behind an overflow clip.
    const decorative = cs.pointerEvents === 'none' || el.closest('[aria-hidden="true"]');

    if (!decorative && b.right > vw + 1) {
      problems.push({
        kind: 'spills-right',
        detail: `<${el.tagName}> right=${Math.round(b.right)} vw=${vw}`,
        cls: (el.className || '').toString().slice(0, 70),
      });
    }

    if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) {
      problems.push({
        kind: 'ellipsis-truncated',
        detail: `"${(el.textContent || '').trim().slice(0, 40)}"`,
        cls: (el.className || '').toString().slice(0, 70),
      });
    }

    // Text clipped by its own box: the container hides overflow and the content
    // genuinely does not fit. Skip anything that can scroll, and skip elements
    // whose children are absolutely positioned (cross-fade stacks, canvases).
    const hidesX = cs.overflowX === 'hidden' || cs.overflowX === 'clip';
    const hidesY = cs.overflowY === 'hidden' || cs.overflowY === 'clip';
    const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasOwnText && (hidesX || hidesY)) {
      const clippedX = hidesX && el.scrollWidth > el.clientWidth + 2;
      const clippedY = hidesY && el.scrollHeight > el.clientHeight + 2;
      if (clippedX || clippedY) {
        problems.push({
          kind: 'text-clipped',
          detail: `"${(el.textContent || '').trim().slice(0, 40)}" ${el.scrollWidth}x${el.scrollHeight} in ${el.clientWidth}x${el.clientHeight}`,
          cls: (el.className || '').toString().slice(0, 70),
        });
      }
    }
  }

  // The header must stay a single row at every width.
  //
  // Compare vertical CENTRES, not tops. The brand block, the nav and the button
  // group are different heights inside an `items-center` flex row, so their tops
  // legitimately differ by a few pixels while sitting on the same line. Reading
  // that as "three rows" was a false positive across half the sweep.
  const header = document.querySelector('header');
  if (header) {
    const row = header.querySelector(':scope > div');
    if (row) {
      const centres = [...row.children]
        .map((c) => c.getBoundingClientRect())
        .filter((b) => b.height > 0)
        .map((b) => b.top + b.height / 2);
      if (centres.length > 1) {
        const spread = Math.max(...centres) - Math.min(...centres);
        // Anything beyond a few px means a child has genuinely wrapped onto its
        // own line rather than just being a different height.
        if (spread > 8) {
          problems.push({ kind: 'header-wrapped', detail: `centres spread ${Math.round(spread)}px` });
        }
      }
    }
  }

  return problems;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(4000);

// Reveal every chapter once; they animate in and are otherwise unmeasurable.
await page.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.75);
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 250));
});

const failures = new Map();   // signature -> { widths: [], sample }
let checked = 0;

for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(90);
  const problems = await page.evaluate(PROBE);
  checked++;
  for (const p of problems) {
    const sig = `${p.kind}|${p.cls || ''}|${p.detail.replace(/\d+/g, '#')}`;
    if (!failures.has(sig)) failures.set(sig, { widths: [], sample: p });
    failures.get(sig).widths.push(width);
  }
}

// --- Overlays, and short windows -------------------------------------------
//
// Everything above measures the page with nothing open, in a 900px-tall window.
// Both of those assumptions have already hidden a real defect: the project modal
// overflowed a phone by 204px and neither suite saw it, because neither opened
// it. A laptop with a browser and a dock is also nowhere near 900px tall.
const OVERLAY_VIEWPORTS = [
  { width: 320, height: 568 },   // smallest phone, short
  { width: 390, height: 664 },   // iPhone 13 with browser chrome
  { width: 768, height: 600 },   // tablet, landscape-ish
  { width: 1280, height: 620 },  // laptop with a dock and a browser
  { width: 1440, height: 720 },
  { width: 1920, height: 900 },
];

const OVERLAYS = [
  {
    name: 'project detail',
    open: () => document.querySelector('[data-project-tile] [data-project-open]')?.click(),
    root: '[data-project-detail]',
    close: () => document.querySelector('[data-project-detail] [aria-label*="lose"]')?.click(),
  },
  {
    name: 'mobile menu',
    open: () => document.querySelector('button[aria-label="Menu"]')?.click(),
    root: 'header + div, header div[class*="absolute"]',
    close: () => document.querySelector('button[aria-label="Menu"]')?.click(),
  },
];

for (const vp of OVERLAY_VIEWPORTS) {
  await page.setViewportSize(vp);
  await page.waitForTimeout(150);
  for (const ov of OVERLAYS) {
    const opened = await page.evaluate((o) => {
      // eslint-disable-next-line no-new-func
      new Function(`return (${o.open})()`)();
      return true;
    }, { open: ov.open.toString() }).catch(() => false);
    if (!opened) continue;
    await page.waitForTimeout(500);

    const r = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        present: true,
        offBottom: Math.round(b.bottom - window.innerHeight),
        offRight: Math.round(b.right - window.innerWidth),
        offTop: Math.round(-b.top),
        scrollable: el.scrollHeight > el.clientHeight + 2 ||
          !!el.querySelector('*') && [...el.querySelectorAll('*')].some(c => c.scrollHeight > c.clientHeight + 2),
      };
    }, ov.root);

    if (r && r.present) {
      if (r.offBottom > 1 && !r.scrollable) {
        const sig = `overlay-cutoff|${ov.name}`;
        if (!failures.has(sig)) failures.set(sig, { widths: [], sample: { kind: 'overlay-cutoff', detail: `${ov.name} extends ${r.offBottom}px below a ${vp.height}px window with nothing scrollable` } });
        failures.get(sig).widths.push(vp.width);
      }
      if (r.offRight > 1) {
        const sig = `overlay-right|${ov.name}`;
        if (!failures.has(sig)) failures.set(sig, { widths: [], sample: { kind: 'overlay-cutoff', detail: `${ov.name} extends ${r.offRight}px past the right edge` } });
        failures.get(sig).widths.push(vp.width);
      }
    }

    await page.evaluate((o) => {
      // eslint-disable-next-line no-new-func
      new Function(`return (${o.close})()`)();
    }, { close: ov.close.toString() }).catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(350);
  }
  checked++;
}

console.log(`\nSwept ${checked} viewports from ${WIDTHS[0]}px to ${WIDTHS[WIDTHS.length - 1]}px, plus ${OVERLAY_VIEWPORTS.length} short windows with overlays open\n`);

if (failures.size === 0) {
  console.log('  No defect at any width.');
} else {
  // Group so one bug across 40 widths reads as one bug, not forty.
  const sorted = [...failures.values()].sort((a, b) => b.widths.length - a.widths.length);
  for (const f of sorted) {
    const w = f.widths;
    const range = w.length === 1 ? `${w[0]}px` : `${w[0]}px to ${w[w.length - 1]}px (${w.length} widths)`;
    console.log(`  [${f.sample.kind}] ${range}`);
    console.log(`      ${f.sample.detail}`);
    if (f.sample.cls) console.log(`      class: ${f.sample.cls}`);
  }
}

console.log(`\n----------------------------------------`);
console.log(` DISTINCT DEFECTS: ${failures.size}`);
console.log(`----------------------------------------\n`);

await browser.close();
process.exit(failures.size > 0 ? 1 : 0);
