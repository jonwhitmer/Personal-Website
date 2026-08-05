// RED-first test for two changes to the Projects section:
//
//   1. Vesper joins the grid, newest first. It is the voice agent: hold the
//      button, talk, and a Claude Code session does the work.
//   2. Each of the five current projects leads its detail slideshow with a short
//      silent demo video, so a recruiter sees the app MOVE before they see a
//      screenshot of it.
//
// The rules this locks in, all of which were easy to get wrong:
//   - the GRID tile stays a still image. Five videos decoding at once on the
//     projects grid is a mobile tax nobody asked for, so the tile thumbnail must
//     still be an <img> with a real .png behind it.
//   - the video is slide ONE inside the modal, not slide four.
//   - the file behind each video actually decodes. A <video> element with a 404
//     src renders as an empty black box and reports no error anywhere a human
//     would look, so readyState and videoWidth are asserted, not just the src.
//   - every video runs 5-10s, is muted and loops. An unmuted autoplaying video
//     is blocked by the browser AND rude.
//
// Run:  node project-videos.mjs      (site must be running on :5173)

import { chromium } from 'playwright';

const BASE = process.env.SITE_URL || 'http://localhost:5173';

// The five current builds. Older projects (Furhat, Intelli-Assess, Discord bot)
// are deliberately excluded: Furhat already leads with its own robot clip, and
// the other two are finished work with no app left running to record.
const WITH_VIDEO = ['vesper', 'reeljax', 'lectern', 'docket', 'coaster'];

let pass = 0, fail = 0;
const assert = (n, cond, detail) => {
  if (cond) { console.log(`  PASS  ${n}`); pass++; }
  else { console.log(`  FAIL  ${n}\n        -> ${detail}`); fail++; }
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(4000);
await page.evaluate(() => document.getElementById('projects')?.scrollIntoView({ block: 'start' }));
await page.waitForTimeout(900);

console.log('\n=== 1. Vesper is in the grid ===');

const grid = await page.evaluate(() => {
  const s = document.getElementById('projects');
  if (!s) return null;
  const tiles = [...s.querySelectorAll('[data-project-tile]')];
  return {
    ids: tiles.map(t => t.getAttribute('data-project-tile')),
    tiles: tiles.map(t => ({
      id: t.getAttribute('data-project-tile'),
      title: t.querySelector('h3')?.textContent.trim() || '',
      date: (t.querySelector('[data-project-date]')?.textContent || '').trim(),
      summary: t.querySelector('p')?.textContent.trim() || '',
      // A video on the TILE is the thing being ruled out.
      hasVideo: !!t.querySelector('video'),
      thumb: (() => {
        const img = t.querySelector('img');
        return img ? { src: img.getAttribute('src'), loaded: img.naturalWidth > 0 } : null;
      })(),
    })),
  };
});

assert('#projects section exists', grid !== null, 'no #projects');
assert('Vesper has a tile', grid?.ids.includes('vesper'), `tiles: ${grid?.ids.join(', ')}`);

const vesper = grid?.tiles.find(t => t.id === 'vesper');
assert('Vesper tile is titled "Vesper"', vesper?.title === 'Vesper', `title is "${vesper?.title}"`);
assert('Vesper carries a date like the others', /\d{4}/.test(vesper?.date || ''), `date is "${vesper?.date}"`);
assert('Vesper explains itself in the summary',
  (vesper?.summary || '').length > 60, `summary is ${(vesper?.summary || '').length} chars`);
assert('Vesper is newest-first (leads the grid)', grid?.ids[0] === 'vesper',
  `first tile is "${grid?.ids[0]}"`);

console.log('\n=== 2. Grid tiles stay still images ===');
for (const t of grid?.tiles || []) {
  assert(`${t.id}: tile thumbnail is not a video`, !t.hasVideo, 'a <video> is rendering in the grid tile');
  assert(`${t.id}: tile thumbnail is a loaded image`, !!t.thumb?.loaded,
    t.thumb ? `${t.thumb.src} did not decode` : 'no <img> in the tile');
}

console.log('\n=== 3. Each current project opens on a playing demo video ===');

for (const id of WITH_VIDEO) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const pg = await c.newPage();
  await pg.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(3500);
  await pg.evaluate(() => document.getElementById('projects')?.scrollIntoView({ block: 'start' }));
  await pg.waitForTimeout(600);

  const opened = await pg.evaluate((pid) => {
    const btn = document.querySelector(`[data-project-tile="${pid}"] [data-project-open]`);
    if (!btn) return false;
    btn.click();
    return true;
  }, id);
  assert(`${id}: the tile opens`, opened, `no open button for ${id}`);
  if (!opened) { await c.close(); continue; }

  // Give the file time to fetch and decode before reading readyState.
  await pg.waitForTimeout(3500);

  const v = await pg.evaluate(() => {
    const panel = document.querySelector('[data-project-detail]');
    if (!panel) return { noPanel: true };
    const video = panel.querySelector('video');
    // Which slide are we on? Slide 1 means the FIRST dot is the active one.
    const dots = [...panel.querySelectorAll('[aria-label^="View image"]')];
    const activeDot = dots.findIndex(d => (d.querySelector('span')?.className || '').includes('bg-blue-500'));
    return {
      hasVideo: !!video,
      slideIndex: activeDot,
      slides: dots.length,
      src: video?.getAttribute('src') || null,
      // readyState >= 2 means at least the current frame is decoded.
      readyState: video?.readyState ?? -1,
      width: video?.videoWidth ?? 0,
      duration: video?.duration ?? 0,
      muted: video?.muted ?? null,
      loop: video?.loop ?? null,
      autoplay: video?.autoplay ?? null,
    };
  });

  assert(`${id}: a <video> is on screen when the project opens`, v.hasVideo === true,
    v.noPanel ? 'the detail panel never opened' : 'no <video> in the panel');

  if (v.hasVideo) {
    assert(`${id}: the video is slide 1, not buried`, v.slideIndex === 0,
      `active slide index is ${v.slideIndex} of ${v.slides}`);
    assert(`${id}: the video file decodes (${v.src})`, v.readyState >= 2 && v.width > 0,
      `readyState ${v.readyState}, videoWidth ${v.width} - the src is probably 404`);
    assert(`${id}: the video runs 5-10s (${v.duration.toFixed(1)}s)`,
      v.duration >= 5 && v.duration <= 10.5, `duration is ${v.duration}s`);
    assert(`${id}: the video is muted`, v.muted === true, 'an autoplaying video with sound');
    assert(`${id}: the video loops`, v.loop === true, 'it plays once and freezes');
    assert(`${id}: the video autoplays`, v.autoplay === true, 'it needs a click to start');

    // It must actually be advancing, not a decoded still.
    const t0 = await pg.evaluate(() => document.querySelector('[data-project-detail] video')?.currentTime ?? 0);
    await pg.waitForTimeout(1200);
    const t1 = await pg.evaluate(() => document.querySelector('[data-project-detail] video')?.currentTime ?? 0);
    assert(`${id}: the video is actually playing`, t1 > t0, `currentTime stuck at ${t0}`);
  }

  await c.close();
}

console.log('\n----------------------------------------');
console.log(` PASSED: ${pass}   FAILED: ${fail}`);
console.log('----------------------------------------\n');
await browser.close();
process.exit(fail > 0 ? 1 : 0);
