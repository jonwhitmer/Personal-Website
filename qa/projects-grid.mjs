// RED-first test for the rebuilt Projects section.
//
// The section used to be a carousel showing one project of seven. This asserts
// the behaviour that replaces it: all EIGHT visible at once, each one openable,
// each one carrying a date and a real link (or an honest "not public" label).
//
// Run:  node projects-grid.mjs      (site must be running on :5173)

import { chromium, devices } from 'playwright';

const BASE = process.env.SITE_URL || 'http://localhost:5173';

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

console.log('\n=== 1. Eight projects, all visible at once ===');

const sec = await page.evaluate(() => {
  const s = document.getElementById('projects');
  if (!s) return null;
  const tiles = [...s.querySelectorAll('[data-project-tile]')];
  return {
    heading: s.querySelector('h2')?.textContent.trim() || null,
    count: tiles.length,
    ids: tiles.map(t => t.getAttribute('data-project-tile')),
    text: s.innerText,
    // distinct left edges = how many grid columns are actually rendered
    columns: new Set(tiles.map(t => Math.round(t.getBoundingClientRect().left))).size,
    titles: tiles.map(t => t.querySelector('h3')?.textContent.trim() || ''),
    dates: tiles.map(t => (t.querySelector('[data-project-date]')?.textContent || '').trim()),
    thumbs: tiles.map(t => {
      const img = t.querySelector('img');
      return img ? { src: img.getAttribute('src'), loaded: img.naturalWidth > 0,
                     fit: getComputedStyle(img).objectFit } : null;
    }),
  };
});

assert('#projects section exists', sec !== null, 'no #projects');
assert('It still has its <h2>', !!sec?.heading, 'no h2 inside #projects');
assert('Eight project tiles are rendered', sec?.count === 8, `found ${sec?.count}: ${JSON.stringify(sec?.ids)}`);
assert('The one-at-a-time carousel counter is gone', !/Project\s+\d+\s+of\s+\d+/i.test(sec?.text || ''),
  'the "Project 1 of 7" counter is still on the page');
assert('The grid really has more than one column at 1440px', (sec?.columns || 0) >= 2,
  `all tiles share ${sec?.columns} left edge(s)`);
for (const t of ['Vesper', 'Reeljax', 'Lectern', 'Docket', 'Coaster', 'Furhat', 'Intelli-Assess', 'Discord']) {
  assert(`"${t}" is on the grid`, (sec?.titles || []).some(x => x.includes(t)),
    `titles: ${JSON.stringify(sec?.titles)}`);
}
assert('Every tile carries a period/date', (sec?.dates || []).every(d => /\d{4}/.test(d)),
  `dates: ${JSON.stringify(sec?.dates)}`);
assert('Every tile shows a thumbnail that actually decoded',
  (sec?.thumbs || []).every(t => t && t.loaded),
  `thumbs: ${JSON.stringify(sec?.thumbs)}`);
assert('Thumbnails are object-contain, never cropped',
  (sec?.thumbs || []).every(t => t && t.fit === 'contain'),
  `object-fit values: ${JSON.stringify((sec?.thumbs || []).map(t => t?.fit))}`);

console.log('\n=== 2. Links: live site, public repos, honest labels ===');

const links = await page.evaluate(() => {
  const out = {};
  for (const tile of document.querySelectorAll('[data-project-tile]')) {
    out[tile.getAttribute('data-project-tile')] = {
      anchors: [...tile.querySelectorAll('a')].map(a => ({
        href: a.getAttribute('href'),
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel'),
        text: (a.textContent || '').trim(),
      })),
      text: tile.innerText,
    };
  }
  return out;
});

const hrefsOf = (id) => (links[id]?.anchors || []).map(a => a.href);

// Lectern's deployed copy reads Jon's personal notes, so this site must not be a
// way in to it. No link from the tile, and the deployed hostname appears nowhere
// on the page at all - not in an href, not in the visible text.
assert('Lectern does NOT link out to its deployed site',
  hrefsOf('lectern').length === 0,
  `lectern hrefs: ${JSON.stringify(hrefsOf('lectern'))}`);
assert('Discord Bot links to its public repo',
  hrefsOf('discord').includes('https://github.com/jonwhitmer/DiscordBot'),
  `discord hrefs: ${JSON.stringify(hrefsOf('discord'))}`);

for (const id of ['reeljax', 'lectern', 'docket', 'coaster']) {
  assert(`${id} shows a quiet "Private repo" label instead of a made-up link`,
    /private repo/i.test(links[id]?.text || ''), `tile text: ${links[id]?.text}`);
  assert(`${id} invents no GitHub URL`,
    !hrefsOf(id).some(h => /github\.com/i.test(h || '')), `hrefs: ${JSON.stringify(hrefsOf(id))}`);
}

const allAnchors = Object.values(links).flatMap(l => l.anchors);
assert('Every external link opens in a new tab safely',
  allAnchors.length > 0 && allAnchors.every(a =>
    a.target === '_blank' && /noopener/.test(a.rel || '') && /noreferrer/.test(a.rel || '')),
  JSON.stringify(allAnchors));
assert('No link points anywhere that was not verified',
  allAnchors.every(a => [
    'https://github.com/jonwhitmer/MapVideo',
    'https://github.com/jonwhitmer/Fantasy-Football-Scheduler',
    'https://github.com/jonwhitmer/DiscordBot',
  ].includes(a.href)),
  JSON.stringify(allAnchors.map(a => a.href)));

// Belt and braces: the address itself must not survive anywhere in the rendered
// page, so a reader cannot copy it out of the text even without a clickable link.
const lecternHostAnywhere = await page.evaluate(() =>
  /lectern[a-z0-9-]*\.vercel\.app/i.test(document.documentElement.innerHTML));
assert('The deployed Lectern address appears nowhere in the page',
  !lecternHostAnywhere, 'a lectern *.vercel.app address is still in the DOM');

console.log('\n=== 3. Opening a tile shows the full detail ===');

await page.evaluate(() => {
  document.querySelector('[data-project-tile="docket"] [data-project-open]')?.click();
});
await page.waitForTimeout(700);

const detail = await page.evaluate(() => {
  const d = document.querySelector('[data-project-detail]');
  if (!d) return null;
  return {
    id: d.getAttribute('data-project-detail'),
    title: d.querySelector('h3')?.textContent.trim(),
    bullets: d.querySelectorAll('li').length,
    role: d.getAttribute('role'),
    labelled: !!d.getAttribute('aria-labelledby') || !!d.getAttribute('aria-label'),
    hasNext: !!d.querySelector('[aria-label="Next image"]'),
    hasPrev: !!d.querySelector('[aria-label="Previous image"]'),
    dots: d.querySelectorAll('[aria-label^="View image"]').length,
    img: d.querySelector('img')?.getAttribute('src'),
    text: d.innerText,
    scrollLocked: getComputedStyle(document.body).overflow,
  };
});

assert('A detail panel opened', detail !== null, 'no [data-project-detail] after clicking a tile');
assert('It is the project that was clicked', detail?.id === 'docket', `opened "${detail?.id}"`);
assert('It shows the project title', /Docket/i.test(detail?.title || ''), `title: ${detail?.title}`);
assert('It shows all four bullets', (detail?.bullets || 0) >= 4, `${detail?.bullets} <li>`);
assert('It is announced as a dialog', detail?.role === 'dialog', `role="${detail?.role}"`);
assert('The dialog has an accessible name', !!detail?.labelled, 'no aria-labelledby/aria-label');
assert('The slideshow arrows are there', detail?.hasNext && detail?.hasPrev, JSON.stringify(detail));
// Five now, not four: a demo video was added ahead of Docket's four
// screenshots, and it gets a dot like any other slide.
assert('The slideshow dots are there', (detail?.dots || 0) === 5, `${detail?.dots} dots`);
assert('The page behind it cannot scroll', detail?.scrollLocked === 'hidden',
  `body overflow is "${detail?.scrollLocked}"`);

// Read whichever element is showing rather than assuming an <img>. Slide 1 is
// now the demo video, so an img-only read finds nothing on the first slide and
// the advance check fails for the wrong reason.
const currentMedia = () => page.evaluate(() => {
  const panel = document.querySelector('[data-project-detail]');
  const el = panel?.querySelector('video, img');
  return el ? `${el.tagName}:${el.getAttribute('src')}` : null;
});

const before = await currentMedia();
await page.evaluate(() => document.querySelector('[data-project-detail] [aria-label="Next image"]')?.click());
await page.waitForTimeout(500);
const after = await currentMedia();
assert('Next actually advances the slideshow', before && after && before !== after,
  `still on ${after}`);
assert('The slideshow opens on the demo video', (before || '').startsWith('VIDEO:'),
  `slide 1 was ${before}`);

console.log('\n=== 4. The full screen image viewer still works ===');

await page.evaluate(() => {
  const b = document.querySelector('[data-project-detail] [aria-label="View full size"]');
  b ? b.click() : document.querySelector('[data-project-detail] img')?.click();
});
await page.waitForTimeout(600);

const viewer = await page.evaluate(() => {
  const v = document.querySelector('[data-image-viewer]');
  if (!v) return null;
  const img = v.querySelector('img');
  const r = img ? img.getBoundingClientRect() : null;
  const b = v.getBoundingClientRect();
  return {
    coversScreen: Math.round(b.width) >= window.innerWidth && Math.round(b.height) >= window.innerHeight,
    imgWidth: r ? Math.round(r.width) : 0,
    vw: window.innerWidth,
    closeButtons: [...v.querySelectorAll('button[aria-label="Close"]')]
      .filter(x => x.getBoundingClientRect().width > 0).length,
  };
});
assert('The image viewer opened', viewer !== null, 'no [data-image-viewer]');
assert('It covers the whole screen', !!viewer?.coversScreen, JSON.stringify(viewer));
assert('The image is shown large, not thumbnail sized',
  (viewer?.imgWidth || 0) > (viewer?.vw || 0) * 0.5, JSON.stringify(viewer));
assert('It has a close button', (viewer?.closeButtons || 0) >= 1, JSON.stringify(viewer));

await page.keyboard.press('Escape');
await page.waitForTimeout(500);
const stillOpen = await page.evaluate(() => !!document.querySelector('[data-project-detail]'));
assert('Escape closes the image viewer but leaves the project open', stillOpen,
  'the whole detail closed with the viewer');

await page.keyboard.press('Escape');
await page.waitForTimeout(500);
const closed = await page.evaluate(() => ({
  detail: !!document.querySelector('[data-project-detail]'),
  overflow: getComputedStyle(document.body).overflow,
}));
assert('A second Escape closes the project detail', !closed.detail, 'detail still open');
assert('Body scrolling is restored on close', closed.overflow !== 'hidden',
  `body overflow left at "${closed.overflow}"`);

console.log('\n=== 4b. Clicking the card opens it; clicking a link does not ===');

// The whole tile is clickable through a stretched ::after on "View details".
// Click dead space in the middle of the Coaster card's text block.
await page.evaluate(() => {
  document.querySelector('[data-project-tile="coaster"]')?.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(700);
{
  const box = await page.locator('[data-project-tile="coaster"] h3').boundingBox();
  await page.mouse.click(box.x + box.width - 6, box.y + box.height / 2);
  await page.waitForTimeout(700);
  const id = await page.evaluate(() =>
    document.querySelector('[data-project-detail]')?.getAttribute('data-project-detail') || null);
  assert('Clicking the card body opens that project', id === 'coaster', `opened "${id}"`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

// The link row must sit ABOVE the stretched layer, or "View code" silently opens
// the modal instead of the repo. Checked on Discord Bot: it is now the only tile
// on the grid that still carries an outbound link.
{
  await page.evaluate(() => {
    document.querySelector('[data-project-tile="discord"]')?.scrollIntoView({ block: 'center' });
    // Neutralise the navigation so the test does not leave the page.
    document.querySelector('[data-project-tile="discord"] a')
      ?.addEventListener('click', (e) => { e.preventDefault(); window.__linkClicked = true; });
  });
  await page.waitForTimeout(500);
  await page.locator('[data-project-tile="discord"] a').click();
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({
    linkClicked: !!window.__linkClicked,
    detailOpen: !!document.querySelector('[data-project-detail]'),
    url: location.href,
  }));
  assert('The outbound link is the thing that receives the click', r.linkClicked,
    'the click never reached the anchor');
  assert('Clicking a link does not open the detail modal', !r.detailOpen,
    'the modal opened instead of following the link');
  // Compare against the base this run was actually given, not a hardcoded `localhost:5173`.
  // The assertion means "we are still on the site under test"; hardcoding the host made it
  // mean "we are still on localhost", which is a different and weaker claim that happens to
  // fail when the same machine is addressed as 127.0.0.1 instead.
  assert('The page did not navigate away during the test', r.url.startsWith(BASE), `${r.url} is not under ${BASE}`);
}

console.log('\n=== 4bb. The Lectern detail panel offers no way in either ===');

// The detail modal renders its own copy of the link row, so the tile passing is
// not proof. Open Lectern and check the panel the same way.
{
  await page.evaluate(() => {
    document.querySelector('[data-project-tile="lectern"] [data-project-open]')?.click();
  });
  await page.waitForTimeout(700);
  const panel = await page.evaluate(() => {
    const d = document.querySelector('[data-project-detail]');
    if (!d) return null;
    return {
      id: d.getAttribute('data-project-detail'),
      hrefs: [...d.querySelectorAll('a')].map(a => a.getAttribute('href')),
      html: d.innerHTML,
    };
  });
  assert('The Lectern detail panel opened', panel?.id === 'lectern', `opened "${panel?.id}"`);
  assert('The Lectern detail panel carries no outbound link',
    (panel?.hrefs || []).length === 0, `panel hrefs: ${JSON.stringify(panel?.hrefs)}`);
  assert('The deployed Lectern address is not in the detail panel either',
    !/lectern[a-z0-9-]*\.vercel\.app/i.test(panel?.html || ''),
    'the vercel address is still rendered inside the panel');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

console.log('\n=== 4c. Contrast of the new text in both themes ===');

const CONTRAST = `(() => {
  const rgb = (s) => { const m = String(s).match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null; const p = m[1].split(/[,\\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (c) => { c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = (el) => { let n = el; while (n) { const c = rgb(getComputedStyle(n).backgroundColor);
    if (c && c.a >= 0.95) return c; n = n.parentElement; } return rgb(getComputedStyle(document.body).backgroundColor); };
  const out = [];
  const check = (sel, label) => { const el = document.querySelector(sel); if (!el) return;
    const cs = getComputedStyle(el); const fg = rgb(cs.color), bg = bgOf(el);
    const a = lum(fg), b = lum(bg);
    out.push({ label, ratio: (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05),
               size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight) }); };
  check('[data-project-tile="lectern"] [data-project-date]', 'Tile date');
  check('[data-project-tile="lectern"] h3', 'Tile title');
  check('[data-project-tile="lectern"] p', 'Tile summary');
  check('[data-project-tile="lectern"] [data-project-open]', 'View details button');
  check('[data-project-tile="discord"] a', 'Outbound link');
  check('[data-project-tile="reeljax"] span.relative', 'Private repo label');
  check('[data-project-tile="lectern"] span.relative', 'Lectern private repo label');
  return out;
})()`;

for (const mode of ['dark', 'light']) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await c.newPage();
  await p.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3500);
  if (mode === 'light') {
    await p.evaluate(() => document.querySelector('[data-theme-toggle]')?.click());
    await p.waitForTimeout(700);
  }
  await p.evaluate(() => document.getElementById('projects')?.scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(900);
  const rows = await p.evaluate(CONTRAST);
  assert(`Sampled the new ${mode} text`, rows.length >= 5, `${rows.length} samples`);
  for (const r of rows) {
    const large = r.size >= 24 || (r.size >= 18.66 && r.weight >= 700);
    const need = large ? 3.0 : 4.5;
    assert(`${r.label} meets WCAG AA in ${mode} (needs ${need}:1)`, r.ratio >= need,
      `ratio ${r.ratio.toFixed(2)}:1 at ${r.size}px/${r.weight}`);
  }
  await c.close();
}

console.log('\n=== 5. On a phone, one readable column ===');

const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const phone = await ctx.newPage();
await phone.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await phone.waitForTimeout(4000);
await phone.evaluate(() => document.getElementById('projects')?.scrollIntoView({ block: 'start' }));
await phone.waitForTimeout(900);

const ph = await phone.evaluate(() => {
  const tiles = [...document.querySelectorAll('[data-project-tile]')];
  const small = [];
  for (const el of document.querySelectorAll('#projects a, #projects button')) {
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    if (b.height < 44 || b.width < 44) small.push({ t: (el.textContent || '').trim().slice(0, 20),
                                                    w: Math.round(b.width), h: Math.round(b.height) });
  }
  const tiny = [];
  for (const el of document.querySelectorAll('#projects *')) {
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) continue;
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs && fs < 13) tiny.push({ fs, t: (el.textContent || '').trim().slice(0, 20) });
  }
  return {
    columns: new Set(tiles.map(t => Math.round(t.getBoundingClientRect().left))).size,
    count: tiles.length,
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    small, tiny,
  };
});
assert('All eight tiles are still there on a phone', ph.count === 8, `${ph.count}`);
assert('They stack into a single column', ph.columns === 1, `${ph.columns} columns`);
assert('No horizontal overflow on a phone', !ph.overflow, 'the page scrolls sideways');
assert('Every control in the section meets 44px', ph.small.length === 0, JSON.stringify(ph.small));
assert('No text under 13px in the section', ph.tiny.length === 0, JSON.stringify(ph.tiny));
await ctx.close();

console.log('\n=== 6. The open panel never exceeds the screen ===');

// The defect this locks down: the panel was 868px tall in a 664px viewport, so
// the bullets and the link row sat below the fold and the close button scrolled
// off the top. Neither qa/responsive.mjs nor qa/site-content.mjs sees this,
// because both measure the page with no overlay open.
const PHONES = [
  ['320',     { viewport: { width: 320, height: 800 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: devices['Pixel 5'].userAgent }],
  ['375',     { ...devices['iPhone SE'] }],
  ['390',     { ...devices['iPhone 13'] }],
  ['430',     { ...devices['iPhone 14 Pro Max'] }],
  ['768',     { ...devices['iPad Mini'] }],
];

for (const [label, opts] of PHONES) {
  const c = await browser.newContext(opts);
  const pg = await c.newPage();
  await pg.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(4000);

  // Open from partway down the page so scroll restoration is actually tested.
  await pg.evaluate(() => {
    document.querySelector('[data-project-tile="reeljax"]')?.scrollIntoView({ block: 'center' });
  });
  await pg.waitForTimeout(500);
  const scrollBefore = await pg.evaluate(() => Math.round(window.scrollY));
  await pg.evaluate(() => document.querySelector('[data-project-tile="reeljax"] [data-project-open]')?.click());
  await pg.waitForTimeout(800);

  const m = await pg.evaluate(async () => {
    const d = document.querySelector('[data-project-detail]');
    const vh = window.innerHeight, vw = window.innerWidth;
    const box = d.getBoundingClientRect();
    const body = d.querySelector('.overflow-y-auto');
    // Scroll the panel's own region to the very bottom.
    if (body) { body.scrollTop = body.scrollHeight; await new Promise(r => setTimeout(r, 300)); }
    const bullets = [...d.querySelectorAll('li')];
    const last = bullets[bullets.length - 1]?.getBoundingClientRect();
    const foot = d.lastElementChild?.getBoundingClientRect();
    const close = d.querySelector('button[aria-label="Close project"]')?.getBoundingClientRect();
    const vis = (r) => !!r && r.top >= -1 && r.bottom <= vh + 1 && r.left >= -1 && r.right <= vw + 1;
    return {
      vh, vw,
      top: Math.round(box.top), bottom: Math.round(box.bottom),
      right: Math.round(box.right),
      fits: box.bottom <= vh + 1 && box.top >= -1,
      noSideSpill: box.right <= vw + 1 && box.left >= -1,
      pageOverflow: document.documentElement.scrollWidth > vw,
      lastBulletVisible: vis(last),
      footerVisible: vis(foot),
      closeVisible: vis(close),
      bodyScrolls: !!body,
    };
  });

  assert(`${label}: the panel fits the screen (bottom ${m.bottom} vs innerHeight ${m.vh})`,
    m.fits, `panel spans ${m.top}..${m.bottom} in ${m.vh}px`);
  assert(`${label}: the panel does not spill sideways`, m.noSideSpill,
    `right edge ${m.right} in ${m.vw}px`);
  assert(`${label}: opening it adds no horizontal page scroll`, !m.pageOverflow, 'page scrolls sideways');
  assert(`${label}: the panel has its own scrolling region`, m.bodyScrolls, 'no overflow-y-auto region');
  assert(`${label}: the last bullet can be scrolled to`, m.lastBulletVisible, 'last bullet unreachable');
  assert(`${label}: the link row can be scrolled to`, m.footerVisible, 'link row unreachable');
  assert(`${label}: the close button stays on screen while you read`, m.closeVisible,
    'close button scrolled out of the viewport');

  // Closing must put the page back exactly where it was.
  await pg.evaluate(() => document.querySelector('button[aria-label="Close project"]')?.click());
  await pg.waitForTimeout(700);
  const after = await pg.evaluate(() => ({
    scrollY: Math.round(window.scrollY),
    bodyPosition: getComputedStyle(document.body).position,
    bodyOverflow: getComputedStyle(document.body).overflow,
  }));
  assert(`${label}: the page is back where it was after closing (${scrollBefore} -> ${after.scrollY})`,
    Math.abs(after.scrollY - scrollBefore) <= 2, `moved by ${after.scrollY - scrollBefore}px`);
  assert(`${label}: the body is unpinned after closing`, after.bodyPosition !== 'fixed',
    `body position is still ${after.bodyPosition}`);
  assert(`${label}: the body scrolls again after closing`, after.bodyOverflow !== 'hidden',
    `body overflow is still ${after.bodyOverflow}`);

  // While open, the page behind must not move.
  await pg.evaluate(() => document.querySelector('[data-project-tile="reeljax"] [data-project-open]')?.click());
  await pg.waitForTimeout(700);
  const locked = await pg.evaluate(async () => {
    const y0 = window.scrollY;
    window.scrollBy(0, 400);
    await new Promise(r => setTimeout(r, 300));
    return { y0: Math.round(y0), y1: Math.round(window.scrollY) };
  });
  assert(`${label}: the page behind cannot scroll while the panel is open`,
    locked.y0 === locked.y1, `scrolled from ${locked.y0} to ${locked.y1}`);
  await c.close();
}

console.log('\n----------------------------------------');
console.log(` PASSED: ${pass}   FAILED: ${fail}`);
console.log('----------------------------------------\n');
await browser.close();
process.exit(fail > 0 ? 1 : 0);
