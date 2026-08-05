// The gate for dark/light mode.
//
// Jon's rules: every app ships a persisted dark mode, and DARK IS THE DEFAULT -
// dark must look exactly like the site does today. Light mode is the addition.
// A theme toggle that produces white-on-white or 2:1 grey text is worse than no
// toggle at all, so contrast is measured in BOTH themes rather than eyeballed.
//
// Run:  node qa/theme.mjs

import { chromium, devices } from 'playwright';

const BASE = process.env.SITE_URL || 'http://localhost:5173';

let pass = 0, fail = 0;
const assert = (n, cond, detail) => {
  if (cond) { console.log(`  PASS  ${n}`); pass++; }
  else { console.log(`  FAIL  ${n}\n        -> ${detail}`); fail++; }
};

// --- WCAG relative luminance + contrast ratio -------------------------------
const parseRGB = (s) => {
  const m = String(s).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
};
const lum = ({ r, g, b }) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (fg, bg) => {
  const a = lum(fg), b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const browser = await chromium.launch();

// Reads the effective background by walking up until an opaque colour is found,
// because almost every card here is a translucent white overlay.
const SAMPLER = `(() => {
  const out = [];
  const pick = (sel, label) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const cs = getComputedStyle(el);
    let bgEl = el, bg = null;
    while (bgEl) {
      const c = getComputedStyle(bgEl).backgroundColor;
      const m = String(c).match(/rgba?\\(([^)]+)\\)/);
      if (m) {
        const p = m[1].split(/[,\\s/]+/).filter(Boolean).map(Number);
        const a = p.length > 3 ? p[3] : 1;
        if (a >= 0.95) { bg = c; break; }
      }
      bgEl = bgEl.parentElement;
    }
    out.push({ label, color: cs.color, bg: bg || getComputedStyle(document.body).backgroundColor,
               size: parseFloat(cs.fontSize), weight: cs.fontWeight });
  };
  pick('#experience h2', 'Experience heading');
  pick('#experience li', 'Experience bullet');
  pick('#experience h3', 'Company name');
  pick('#education p', 'Education body');
  pick('#journey p', 'Journey caption');
  pick('[data-chapter-label]', 'Chapter label');
  pick('header h1', 'Header name');
  pick('header nav button', 'Nav link');
  pick('#contact label', 'Form label');
  return out;
})()`;

for (const mode of ['dark', 'light']) {
  console.log(`\n=== ${mode.toUpperCase()} MODE ===`);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3500);

  if (mode === 'dark') {
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    assert('Dark is the default on a first visit', isDark,
      `<html class="${await page.evaluate(() => document.documentElement.className)}">`);
  } else {
    const toggled = await page.evaluate(() => {
      const btn = document.querySelector('[data-theme-toggle]');
      if (!btn) return 'no-toggle';
      btn.click();
      return document.documentElement.classList.contains('dark') ? 'still-dark' : 'ok';
    });
    assert('The toggle switches to light', toggled === 'ok', `result: ${toggled}`);
    await page.waitForTimeout(700);
  }

  // Toggle control quality
  const btn = await page.evaluate(() => {
    const b = document.querySelector('[data-theme-toggle]');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             label: b.getAttribute('aria-label') || b.textContent.trim(),
             inHeader: !!b.closest('header') };
  });
  assert('A theme toggle exists', btn !== null, 'no [data-theme-toggle] element');
  assert('Toggle is in the header', !!btn?.inHeader, 'toggle is not inside <header>');
  assert('Toggle meets the 44px tap target', (btn?.w ?? 0) >= 44 && (btn?.h ?? 0) >= 44,
    `measured ${btn?.w}x${btn?.h}`);
  assert('Toggle has an accessible name', (btn?.label || '').length > 2, `label: "${btn?.label}"`);

  // Page-level colours actually changed
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const bgL = lum(parseRGB(bodyBg) || { r: 0, g: 0, b: 0 });
  if (mode === 'dark') {
    assert('Dark mode page background is genuinely dark', bgL < 0.06, `${bodyBg} (luminance ${bgL.toFixed(3)})`);
  } else {
    assert('Light mode page background is genuinely light', bgL > 0.7, `${bodyBg} (luminance ${bgL.toFixed(3)})`);
  }

  // Contrast on real sampled text
  const samples = await page.evaluate(SAMPLER);
  assert('Sampled real text from the page', samples.length >= 6, `only ${samples.length} samples`);
  for (const s of samples) {
    const fg = parseRGB(s.color), bg = parseRGB(s.bg);
    if (!fg || !bg) { assert(`${s.label}: colours readable`, false, `${s.color} on ${s.bg}`); continue; }
    const ratio = contrast(fg, bg);
    // WCAG AA: 3.0 for large text (>=24px, or >=18.66px bold), 4.5 otherwise.
    const large = s.size >= 24 || (s.size >= 18.66 && Number(s.weight) >= 700);
    const need = large ? 3.0 : 4.5;
    assert(`${s.label} meets WCAG AA in ${mode} (needs ${need}:1)`, ratio >= need,
      `ratio ${ratio.toFixed(2)}:1 - ${s.color} on ${s.bg} at ${s.size}px/${s.weight}`);
  }

  await page.close();
}

// --- Persistence -------------------------------------------------------------
console.log('\n=== PERSISTENCE ===');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelector('[data-theme-toggle]')?.click());
  await page.waitForTimeout(500);
  const before = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const after = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  assert('The chosen theme survives a reload', before === after,
    `before reload dark=${before}, after reload dark=${after}`);

  // A theme that flashes the wrong colours before hydrating looks broken.
  const flash = await page.evaluate(() => {
    // The class must be applied by a blocking script in <head>, not after React
    // mounts. If it is only set by React, the very first paint is the wrong theme.
    const inline = [...document.querySelectorAll('head script:not([src])')]
      .map(s => s.textContent).join('');
    return /classList|documentElement/.test(inline) && /localStorage/.test(inline);
  });
  assert('Theme is applied before first paint (no flash of the wrong theme)', flash,
    'no blocking <head> script found that reads localStorage and sets the class');
  await page.close();
}

// --- Light mode on a phone ---------------------------------------------------
console.log('\n=== LIGHT MODE ON A PHONE ===');
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelector('[data-theme-toggle]')?.click());
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    docW: document.documentElement.scrollWidth,
    vw: window.innerWidth,
    isLight: !document.documentElement.classList.contains('dark'),
  }));
  assert('Light mode is reachable on a phone', r.isLight, 'still dark after tapping the toggle');
  assert('Light mode introduces no horizontal overflow', !r.overflow, `${r.docW}px in ${r.vw}px`);
  await ctx.close();
}

console.log('\n----------------------------------------');
console.log(` PASSED: ${pass}   FAILED: ${fail}`);
console.log('----------------------------------------\n');
await browser.close();
process.exit(fail > 0 ? 1 : 0);
