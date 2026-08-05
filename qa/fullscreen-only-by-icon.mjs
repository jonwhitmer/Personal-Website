// Full screen must be something you ASK for.
//
// The slideshow used to open the full screen viewer when you clicked anywhere on
// the picture. That makes the most ordinary gesture on the page - clicking the
// thing you are looking at - throw a black overlay over the whole screen, and
// there is no way to click a screenshot to look closer at it without triggering
// that. Jon's rule: it goes full screen only when you click the little full
// screen icon on the picture, and not otherwise.
//
// So this asserts three things that have to hold together:
//   1. clicking the picture itself does nothing
//   2. the icon is VISIBLE without hovering, or rule 1 leaves no way in at all
//   3. clicking the icon does open it
//
// Rule 2 is the one that is easy to miss. The icon used to be invisible on
// desktop until you hovered the picture, which was fine while the picture itself
// was clickable and is not fine now.
//
// Run:  node fullscreen-only-by-icon.mjs      (site must be running on :5173)

import { chromium, devices } from 'playwright';

const BASE = process.env.SITE_URL || 'http://localhost:5173';
const VIEWER = '[data-image-viewer]';
const FULLSCREEN_BTN = '[data-project-detail] [aria-label="View full size"]';

let pass = 0, fail = 0;
const assert = (n, cond, detail) => {
  if (cond) { console.log(`  PASS  ${n}`); pass++; }
  else { console.log(`  FAIL  ${n}\n        -> ${detail}`); fail++; }
};

const browser = await chromium.launch();

/** Open a project's detail panel, scrolled into view and settled. */
async function openProject(page, id) {
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3500);
  await page.evaluate(() => document.getElementById('projects')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(700);
  await page.evaluate((pid) => {
    document.querySelector(`[data-project-tile="${pid}"] [data-project-open]`)?.click();
  }, id);
  await page.waitForTimeout(2500);
}

const viewerOpen = (page) => page.evaluate((sel) => !!document.querySelector(sel), VIEWER);

// ---------------------------------------------------------------------------
console.log('\n=== 1. Clicking the picture does NOT go full screen ===');
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  await openProject(page, 'docket');

  // Slide 1 is the demo video. Click it high up, well clear of the native
  // control bar along the bottom, which is the browser's own furniture.
  const vid = await page.locator('[data-project-detail] video').boundingBox();
  assert('Slide 1 is the demo video', !!vid, 'no <video> in the panel');
  if (vid) {
    await page.mouse.click(vid.x + vid.width / 2, vid.y + vid.height * 0.25);
    await page.waitForTimeout(700);
    assert('Clicking the VIDEO does not open the viewer', !(await viewerOpen(page)),
      'the full screen viewer opened from a click on the video');
  }

  // Advance to a screenshot and do the same.
  await page.evaluate(() =>
    document.querySelector('[data-project-detail] [aria-label="Next image"]')?.click());
  await page.waitForTimeout(800);

  const img = await page.locator('[data-project-detail] img').first().boundingBox();
  assert('Slide 2 is a screenshot', !!img, 'no <img> after advancing');
  if (img) {
    await page.mouse.click(img.x + img.width / 2, img.y + img.height / 2);
    await page.waitForTimeout(700);
    assert('Clicking the IMAGE does not open the viewer', !(await viewerOpen(page)),
      'the full screen viewer opened from a click on the image');
  }

  // A picture that does nothing must not dress itself up as clickable.
  const cursor = await page.evaluate(() => {
    const el = document.querySelector('[data-project-detail] img');
    return el ? getComputedStyle(el).cursor : null;
  });
  assert('The picture does not advertise itself as clickable', cursor !== 'pointer',
    `cursor is "${cursor}" - it invites a click that now does nothing`);

  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log('\n=== 2. The full screen icon is visible without hovering ===');
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  await openProject(page, 'docket');
  // Move to a screenshot slide - the icon belongs to pictures, not to the video,
  // which carries the browser's own full screen control.
  await page.evaluate(() =>
    document.querySelector('[data-project-detail] [aria-label="Next image"]')?.click());
  await page.waitForTimeout(800);

  // Park the pointer far away so nothing is in a hover state.
  await page.mouse.move(5, 5);
  await page.waitForTimeout(600);

  const btn = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      opacity: Number(cs.opacity),
      visibility: cs.visibility,
      display: cs.display,
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  }, FULLSCREEN_BTN);

  assert('The full screen button exists', btn !== null, 'no [aria-label="View full size"]');
  assert('It is not transparent while un-hovered', (btn?.opacity ?? 0) > 0.9,
    `opacity ${btn?.opacity} with the pointer parked in the corner`);
  assert('It is a real 44px target', (btn?.w || 0) >= 44 && (btn?.h || 0) >= 44,
    `${btn?.w}x${btn?.h}`);

  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log('\n=== 3. Clicking the icon DOES go full screen ===');
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  await openProject(page, 'docket');
  await page.evaluate(() =>
    document.querySelector('[data-project-detail] [aria-label="Next image"]')?.click());
  await page.waitForTimeout(800);

  await page.locator(FULLSCREEN_BTN).click();
  await page.waitForTimeout(800);
  assert('The icon opens the full screen viewer', await viewerOpen(page),
    'clicking the icon did nothing');

  const big = await page.evaluate((sel) => {
    const v = document.querySelector(sel);
    const img = v?.querySelector('img');
    const r = img?.getBoundingClientRect();
    return { imgWidth: r ? Math.round(r.width) : 0, vw: window.innerWidth };
  }, VIEWER);
  assert('It shows the picture large', big.imgWidth > big.vw * 0.5,
    `image is ${big.imgWidth}px in a ${big.vw}px window`);

  // Escape must peel back one layer only.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  assert('Escape closes the viewer', !(await viewerOpen(page)), 'viewer still up');
  assert('...and leaves the project open', await page.evaluate(() =>
    !!document.querySelector('[data-project-detail]')), 'the whole project closed too');

  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log('\n=== 4. Same rule on a phone ===');
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await openProject(page, 'docket');
  await page.evaluate(() =>
    document.querySelector('[data-project-detail] [aria-label="Next image"]')?.click());
  await page.waitForTimeout(900);

  const img = await page.locator('[data-project-detail] img').first().boundingBox();
  if (img) {
    await page.touchscreen.tap(img.x + img.width / 2, img.y + img.height / 2);
    await page.waitForTimeout(700);
    assert('Tapping the picture does not open the viewer', !(await viewerOpen(page)),
      'a tap on the picture opened full screen');
  }

  const visible = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? Number(getComputedStyle(el).opacity) : -1;
  }, FULLSCREEN_BTN);
  assert('The icon is visible on a phone too', visible > 0.9, `opacity ${visible}`);

  await ctx.close();
}

console.log('\n----------------------------------------');
console.log(` PASSED: ${pass}   FAILED: ${fail}`);
console.log('----------------------------------------\n');
await browser.close();
process.exit(fail > 0 ? 1 : 0);
