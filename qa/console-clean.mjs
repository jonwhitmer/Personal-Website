// Fails if the browser reports ANYTHING on the console, or a request fails, in
// any state the site can actually be in. A portfolio with a red console is the
// first thing an engineer looking at it will notice.
//
// Run:  node qa/console-clean.mjs

import { chromium, devices } from 'playwright';

const BASE = process.env.SITE_URL || 'http://localhost:5173';
const browser = await chromium.launch();

// Noise that is not the site's fault and cannot be fixed from this repo.
const IGNORE = [
  /Download the React DevTools/i,
  // Headless Chromium's own GPU path emits these while compositing the WebGL
  // canvas. Confirmed to be the harness and not the site: running the same page
  // headed on a real GPU produces zero WebGL messages, and nothing in src/ calls
  // readPixels. Nothing in this repo can silence them.
  /GL Driver Message/i,
  /GPU stall due to ReadPixels/i,
];

const runs = [
  { name: 'desktop 1440, load only', device: { viewport: { width: 1440, height: 900 } }, act: async () => {} },
  {
    name: 'desktop 1440, full walk',
    device: { viewport: { width: 1440, height: 900 } },
    act: async (page) => {
      // Every nav target, so each section mounts.
      for (const id of ['experience', 'education', 'certifications', 'projects', 'skills', 'future', 'contact']) {
        await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ behavior: 'instant', block: 'start' }), id);
        await page.waitForTimeout(350);
      }
      // Both other tabs of More About Me (they are lazily rendered).
      for (const label of [/what i'm working on/i, /get to know me/i, /what's next/i]) {
        await page.evaluate((src) => {
          const re = new RegExp(src.slice(1, src.lastIndexOf('/')), 'i');
          [...document.querySelectorAll('#future button')].find(b => re.test(b.textContent || ''))?.click();
        }, label.toString());
        await page.waitForTimeout(600);
      }
      // Ask a question, then reset.
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('[data-qa-panel] button')].filter(x => x.textContent.trim().length > 8);
        b[0]?.click();
      });
      await page.waitForTimeout(2500);
      await page.evaluate(() => document.querySelector('[data-qa-reset]')?.click());
      await page.waitForTimeout(600);
      // Step through the project carousel so every image loads.
      for (let i = 0; i < 7; i++) {
        await page.evaluate(() => {
          const next = [...document.querySelectorAll('#projects button')].find(b => /next/i.test(b.textContent || ''));
          next?.click();
        });
        await page.waitForTimeout(500);
      }
      // Flip the theme both ways.
      await page.evaluate(() => document.querySelector('[data-theme-toggle]')?.click());
      await page.waitForTimeout(600);
      await page.evaluate(() => document.querySelector('[data-theme-toggle]')?.click());
      await page.waitForTimeout(600);
    },
  },
  {
    name: 'iPhone 13, open the menu',
    device: { ...devices['iPhone 13'] },
    act: async (page) => {
      await page.evaluate(() => document.querySelector('button[aria-label="Menu"]')?.click());
      await page.waitForTimeout(800);
      await page.evaluate(() => document.querySelector('button[aria-label="Menu"]')?.click());
      await page.waitForTimeout(500);
    },
  },
];

let problems = 0;

for (const run of runs) {
  const ctx = await browser.newContext({ ...run.device });
  const page = await ctx.newPage();
  const found = [];

  page.on('console', (m) => {
    if (!['error', 'warning'].includes(m.type())) return;
    const text = m.text();
    if (IGNORE.some((re) => re.test(text))) return;
    found.push(`console.${m.type()}: ${text.slice(0, 220)}`);
  });
  page.on('pageerror', (e) => found.push(`pageerror: ${e.message.slice(0, 220)}`));
  page.on('requestfailed', (r) => {
    const err = r.failure()?.errorText || '';
    if (/ERR_ABORTED/.test(err)) return;   // navigations we cancelled ourselves
    found.push(`requestfailed: ${r.url().slice(0, 140)} (${err})`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) found.push(`http ${r.status()}: ${r.url().slice(0, 140)}`);
  });

  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(4000);
  await run.act(page);
  await page.waitForTimeout(1200);

  if (found.length === 0) {
    console.log(`  PASS  ${run.name}: clean`);
  } else {
    console.log(`  FAIL  ${run.name}: ${found.length} problem(s)`);
    [...new Set(found)].forEach((f) => console.log(`        - ${f}`));
    problems += found.length;
  }
  await ctx.close();
}

console.log(`\n----------------------------------------`);
console.log(` CONSOLE PROBLEMS: ${problems}`);
console.log(`----------------------------------------\n`);
await browser.close();
process.exit(problems > 0 ? 1 : 0);
