// Verifies the site's content and top-of-page layout against what Jon asked for:
//   - header stays STICKY (deployed behaviour), not the uncommitted md:fixed
//   - everything else at the top of the page matches the deployed site
//   - the resume is the 2026 one, and it is actually downloadable on mobile
//   - the Lowe's role from the 2026 resume is the newest Experience entry
//   - the school's full legal name
//
// Written BEFORE the changes, run first to watch it fail.
// Run:  node qa/site-content.mjs        (site must be running on :5173)

import { chromium } from 'playwright';

const BASE = process.env.SITE_URL || 'http://localhost:5173';
const RESUME_PATH = '/doc/JonWhitmer_Resume2026.pdf';
const RESUME_BYTES = 102813; // C:\Users\jonwh\Documents\Internship\JonWhitmer_Resume2026.pdf

let pass = 0, fail = 0;
const ok  = (n, d = '') => { console.log(`  PASS  ${n}`); pass++; };
const bad = (n, d = '') => { console.log(`  FAIL  ${n}\n        -> ${d}`); fail++; };
const assert = (n, cond, detail) => (cond ? ok(n) : bad(n, detail));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(5000);

console.log('\n=== 1. Header stays sticky (Jon: "keep the sticky") ===');

const header = await page.evaluate(() => {
  const h = document.querySelector('header');
  if (!h) return null;
  const cs = getComputedStyle(h);
  return { position: cs.position, height: Math.round(h.getBoundingClientRect().height), cls: h.className };
});
assert('A <header> exists', header !== null, 'no header element');
assert('Header position is "sticky", not "fixed"', header?.position === 'sticky',
  `got position: ${header?.position} (class: ${header?.cls})`);
assert('Header class no longer contains md:fixed', !/md:fixed/.test(header?.cls || ''),
  `class still: ${header?.cls}`);

// Jon: "I wanted the navbar locked to the top so people could always navigate
// even if they're halfway down the page." `sticky top-0` already does exactly
// this — it pins once you scroll past it. Asserted by actually scrolling rather
// than trusting the CSS keyword.
console.log('\n=== 1b. Navbar stays locked to the top when scrolled ===');

const scrolled = await page.evaluate(async () => {
  window.scrollTo(0, Math.round(document.documentElement.scrollHeight / 2));
  await new Promise(r => setTimeout(r, 600));
  const h = document.querySelector('header');
  const r = h.getBoundingClientRect();
  // Is the header the element you actually hit at the top-centre of the screen?
  const atPoint = document.elementFromPoint(window.innerWidth / 2, 10);
  const navLink = [...h.querySelectorAll('button, a')]
    .find(e => /experience/i.test(e.textContent || ''));
  const nr = navLink && navLink.getBoundingClientRect();
  return {
    scrollY: Math.round(window.scrollY),
    top: Math.round(r.top),
    visible: r.bottom > 0 && r.top < window.innerHeight,
    headerOwnsTopOfScreen: !!(atPoint && h.contains(atPoint)),
    navLinkInViewport: !!(nr && nr.top >= 0 && nr.bottom <= window.innerHeight),
  };
});

assert('Page actually scrolled (test is meaningful)', scrolled.scrollY > 500,
  `scrollY only ${scrolled.scrollY}`);
assert('Header is still pinned at the very top after scrolling', scrolled.top === 0,
  `header top is ${scrolled.top} after scrolling to ${scrolled.scrollY}`);
assert('Header is still visible half way down the page', scrolled.visible, 'header scrolled away');
assert('Header is what you touch at the top of the screen', scrolled.headerOwnsTopOfScreen,
  'something else is covering the navbar');
assert('A nav link is reachable without scrolling back up', scrolled.navLinkInViewport,
  'the Experience nav link is off-screen');

// The fix for the sticky header changes an overflow rule, and the reason that
// rule existed was to contain off-screen background blobs. Assert the trade did
// not simply swap a broken navbar for a horizontal scrollbar.
const overflow = await page.evaluate(() => ({
  docWidth: document.documentElement.scrollWidth,
  viewport: window.innerWidth,
}));
assert('No horizontal page scroll introduced by the overflow change',
  overflow.docWidth <= overflow.viewport,
  `document is ${overflow.docWidth}px wide in a ${overflow.viewport}px viewport`);

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);

// A sticky header floats above the page, so `scrollIntoView` parks a section's
// heading UNDERNEATH it. This clicks every real nav link and checks the heading
// is actually readable afterwards. The uncommitted code tried to fix this with a
// hard-coded -30px offset in JS; CSS scroll-margin-top does it properly and also
// covers plain #anchor links and browser back/forward.
console.log('\n=== 1c. Nav links land below the header, not under it ===');

const navIds = ['experience', 'education', 'certifications', 'projects', 'skills', 'future', 'contact'];
for (const id of navIds) {
  const r = await page.evaluate(async (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    await new Promise(r => setTimeout(r, 400));
    const sec = document.getElementById(id);
    const head = sec && sec.querySelector('h2');
    const hdr = document.querySelector('header');
    if (!sec || !head || !hdr) return null;
    return {
      headingTop: Math.round(head.getBoundingClientRect().top),
      headerBottom: Math.round(hdr.getBoundingClientRect().bottom),
    };
  }, id);
  assert(`#${id} heading is not hidden under the sticky header`,
    r !== null && r.headingTop >= r.headerBottom,
    r ? `heading top ${r.headingTop} is above header bottom ${r.headerBottom} (covered by ${r.headerBottom - r.headingTop}px)` : `#${id} or its h2 not found`);

  // Landing on a chapter must tell you which chapter you are in. For a section
  // that OPENS a chapter, that is the eyebrow itself. For a section further down
  // inside a chapter (Projects and Skills are both inside 05, Contact inside 06)
  // the eyebrow is legitimately far above, so the live indicator has to answer
  // instead. Both are checked, whichever applies.
  const eb = await page.evaluate((id) => {
    const sec = document.getElementById(id);
    const ch = sec && sec.closest('[data-chapter]');
    const lbl = ch && ch.querySelector('[data-chapter-label]');
    const hdr = document.querySelector('header');
    if (!lbl || !hdr) return null;
    const firstSection = ch.querySelector('section[id]');
    const b = lbl.getBoundingClientRect();
    return {
      opensChapter: firstSection === sec,
      top: Math.round(b.top),
      headerBottom: Math.round(hdr.getBoundingClientRect().bottom),
      number: ch.getAttribute('data-chapter'),
      indicator: (document.querySelector('[data-current-chapter]')?.textContent || '').trim(),
    };
  }, id);

  if (eb?.opensChapter) {
    // Not just "below the header": at 9rem of scroll-margin the label sat 3px
    // under it, which reads as broken rather than deliberate. This pins a real
    // band of breathing room.
    const air = eb.top - eb.headerBottom;
    assert(`#${id} lands with its chapter label comfortably clear of the header`,
      air >= 16 && air <= 56,
      `chapter ${eb.number} label sits ${air}px below the header (want 16-56px)`);
  } else {
    assert(`#${id} is mid-chapter, so the live indicator names chapter ${eb?.number}`,
      !!eb && eb.indicator.includes(eb.number),
      `indicator reads "${eb?.indicator}", expected it to name chapter ${eb?.number}`);
  }
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);

// Jon: "navbar needs some work.. i think it looks squished together". Measured:
// the links were touching (0-4px apart) and the brand sat 16px from the nav.
// Wherever the desktop nav is shown at all, it has to have room.
console.log('\n=== 1d. The navbar has room to breathe ===');
for (const width of [1024, 1100, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 800 });
  await page.waitForTimeout(700);
  const n = await page.evaluate(() => {
    const header = document.querySelector('header');
    const nav = header.querySelector('nav');
    if (!nav || getComputedStyle(nav).display === 'none') return { hidden: true };
    const links = [...nav.querySelectorAll('button')];
    const gaps = [];
    for (let i = 1; i < links.length; i++) {
      gaps.push(Math.round(links[i].getBoundingClientRect().left - links[i - 1].getBoundingClientRect().right));
    }
    const brand = header.querySelector('h1')?.closest('div')?.parentElement;
    const groups = header.querySelectorAll(':scope > div > div');
    const actions = groups[groups.length - 1];
    return {
      hidden: false,
      minLinkGap: gaps.length ? Math.min(...gaps) : null,
      brandToNav: brand ? Math.round(nav.getBoundingClientRect().left - brand.getBoundingClientRect().right) : null,
      navToActions: actions ? Math.round(actions.getBoundingClientRect().left - nav.getBoundingClientRect().right) : null,
      rows: new Set([...header.querySelectorAll(':scope > div > *')]
        .map(e => Math.round(e.getBoundingClientRect().top))).size,
    };
  });

  // The full nav must be VISIBLE on a desktop. Hiding it behind a hamburger at
  // 1024-1279 was the wrong trade: it solved the crowding by removing the thing
  // people came to use.
  assert(`The desktop nav is visible at ${width}px`, !n.hidden,
    'nav is display:none at a desktop width');
  if (n.hidden) continue;
  assert(`Nav links are at least 8px apart at ${width}px`, (n.minLinkGap ?? -1) >= 8,
    `smallest gap between links is ${n.minLinkGap}px`);
  // Below 1280 there is genuinely less room: the brand, seven links, LinkedIn,
  // GitHub, the theme toggle and Resume all have to fit and all have to stay
  // visible. 16px there, a full 32px once the window can afford it.
  const need = width >= 1280 ? 32 : 16;
  assert(`Brand is at least ${need}px clear of the nav at ${width}px`, (n.brandToNav ?? -1) >= need,
    `gap is ${n.brandToNav}px`);
  assert(`Nav is at least ${need}px clear of the buttons at ${width}px`, (n.navToActions ?? -1) >= need,
    `gap is ${n.navToActions}px`);

  // Jon: "you got rid of linkedin and github.. that should be on that navbar".
  const socials = await page.evaluate(() => {
    const inHeader = (re) => [...document.querySelectorAll('header a')]
      .some(a => re.test(a.getAttribute('aria-label') || '') &&
                 a.getBoundingClientRect().width > 0);
    return { linkedin: inHeader(/linkedin/i), github: inHeader(/github/i) };
  });
  assert(`LinkedIn and GitHub are on the navbar at ${width}px`,
    socials.linkedin && socials.github,
    `linkedin=${socials.linkedin} github=${socials.github}`);

  // The Resume button showed BOTH a document icon and a download icon between
  // 1024 and 1279 once the breakpoints stopped being complementary.
  const icons = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('header button')]
      .find(b => /resume/i.test(b.textContent || '') || /resume/i.test(b.getAttribute('aria-label') || ''));
    if (!btn) return null;
    return [...btn.querySelectorAll('svg')]
      .filter(s => { const r = s.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).length;
  });
  assert(`Resume button shows exactly one icon at ${width}px`, icons === 1,
    `counted ${icons} visible icons`);
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(700);

// Mojibake guard. Editing a UTF-8 source file with a tool that reads it as ANSI
// and writes it back as UTF-8 turns every non-ASCII character into gibberish:
// a bullet becomes "a{euro}c", an apostrophe becomes "a{euro}(tm)". It is silent
// in the editor and only shows up on the rendered page, which is where Jon found
// it. This checks the page a reader actually sees.
console.log('\n=== 1e. No mangled characters anywhere on the page ===');
{
  const bad = await page.evaluate(() => {
    const text = document.body.innerText;
    // U+FFFD is the replacement glyph; the rest are the classic UTF-8-read-as-
    // Latin-1 sequences.
    const patterns = [/�/g, /â€/g, /Ã©/g, /Â /g, /Â[¡-¿]/g];
    const found = [];
    for (const re of patterns) {
      for (const m of text.matchAll(re)) {
        found.push(text.slice(Math.max(0, m.index - 25), m.index + 25).replace(/\s+/g, ' '));
        if (found.length >= 5) break;
      }
    }
    return found;
  });
  assert('No mojibake in the rendered text', bad.length === 0,
    bad.map(s => `"...${s}..."`).join(' | '));
}

// An inline link has to sit on the same line as the words around it. Giving one
// a 44px min-height to satisfy the tap-target rule turns it into a tall box that
// rides above the text. The tap area still has to be 44px, so this checks BOTH:
// the visible text is aligned, and the clickable region is still big enough.
console.log('\n=== 1f. Inline links sit on the text baseline ===');
{
  const links = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('p button, p a, li button, li a')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // Only genuine INLINE links flow with the text and can sit crooked in it.
      // A block or flex button inside a list item is a control in its own right
      // and is supposed to be taller than a line (the question list is full of
      // them), so measuring those against a line height is meaningless.
      if (!getComputedStyle(el).display.startsWith('inline')) continue;
      const parent = el.closest('p, li');
      const cs = getComputedStyle(parent);
      const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
      // How far the link's own box strays beyond one line of its paragraph.
      const overflow = Math.round(r.height - lineHeight);
      // Effective tap area: the box itself, or a ::after that extends it.
      const after = getComputedStyle(el, '::after');
      const afterH = parseFloat(after.height) || 0;
      out.push({
        text: (el.textContent || '').trim().slice(0, 24),
        boxH: Math.round(r.height),
        lineH: Math.round(lineHeight),
        overflow,
        tapH: Math.round(Math.max(r.height, afterH)),
      });
    }
    return out;
  });

  const crooked = links.filter(l => l.overflow > 6);
  assert('No inline link is taller than its own line of text', crooked.length === 0,
    crooked.map(l => `"${l.text}" box ${l.boxH}px vs line ${l.lineH}px`).join(' | '));

  const tooSmall = links.filter(l => l.tapH < 44);
  assert('Inline links still have a 44px tap area', tooSmall.length === 0,
    tooSmall.map(l => `"${l.text}" tap ${l.tapH}px`).join(' | '));
}

console.log('\n=== 2. Top spacing matches the deployed site ===');

const hero = await page.evaluate(() => {
  const h2 = [...document.querySelectorAll('h2')].find(e => /Hi, I'm Jon/i.test(e.textContent || ''));
  const s = h2 && h2.closest('section');
  if (!s) return null;
  const cs = getComputedStyle(s);
  return { top: Math.round(s.getBoundingClientRect().top), marginTop: cs.marginTop, cls: s.className };
});
assert('Hero section found', hero !== null, 'could not find the "Hi, I\'m Jon." section');
assert('Hero has no compensating top margin (mt is 0)', hero?.marginTop === '0px',
  `marginTop is ${hero?.marginTop} (class: ${hero?.cls})`);
// The hero no longer butts straight against the header: Chapter 01's eyebrow
// ("01 - WHO I AM") sits between them by design. What must still be true is that
// nothing is COMPENSATING for a broken header, which is what the 33px gap was.
// So this asserts the hero follows its chapter eyebrow immediately, with the
// eyebrow itself clearing the header. Measured, not a magic number.
const eyebrow = await page.evaluate(() => {
  const ch = document.querySelector('[data-chapter="01"] [data-chapter-label]');
  if (!ch) return null;
  const b = ch.getBoundingClientRect();
  return { top: Math.round(b.top), bottom: Math.round(b.bottom) };
});
assert('Chapter 01 eyebrow clears the sticky header', (eyebrow?.top ?? -1) >= (header?.height ?? 0),
  `eyebrow top ${eyebrow?.top} vs header height ${header?.height}`);
assert('Hero follows its chapter eyebrow closely, with no compensating gap',
  hero !== null && eyebrow !== null && (hero.top - eyebrow.bottom) <= 60,
  `gap between eyebrow bottom (${eyebrow?.bottom}) and hero top (${hero?.top}) is ${(hero?.top ?? 0) - (eyebrow?.bottom ?? 0)}px`);

console.log('\n=== 3. The questions panel (no fake AI, no LeetCode dashboard) ===');

const body = await page.evaluate(() => document.body.innerText);
// The fake "Jaymik" AI assistant is gone, replaced by an honest panel of
// pre-written questions. This asserts what that panel must and must NOT be: no
// free-text box (there is nothing behind it), and no claim to be an AI.
const qa = await page.evaluate(() => {
  const panel = document.querySelector('[data-qa-panel]');
  if (!panel) return null;
  return {
    text: panel.innerText,
    inputs: panel.querySelectorAll('input[type="text"], textarea').length,
    buttons: [...panel.querySelectorAll('button')]
      .filter(b => (b.textContent || '').trim().length > 8).length,
  };
});
assert('The questions panel is on the page', qa !== null, 'no [data-qa-panel] element');
assert('It asks what it can help with', /what can i help you with/i.test(qa?.text || ''),
  `panel text starts: ${(qa?.text || '').slice(0, 80)}`);
assert('It offers several pickable questions', (qa?.buttons || 0) >= 4,
  `only ${qa?.buttons} question buttons`);
assert('It has NO free-text input (there is no model behind it)', qa?.inputs === 0,
  `found ${qa?.inputs} text inputs, which would imply a live assistant`);
assert('The "Jaymik" AI-assistant framing is gone', !/jaymik/i.test(body),
  'the page still mentions Jaymik');
assert('It does not claim to be an AI or a chatbot',
  !/\b(ai[- ]powered|ai assistant|chatbot|powered by groq)\b/i.test(qa?.text || ''),
  `panel text: ${(qa?.text || '').slice(0, 160)}`);
assert('No LeetCode dashboard heading rendered', !/leetcode (dashboard|stats|progress)/i.test(body),
  'the undeployed LeetCode dashboard is still rendered');

console.log('\n=== 4. Experience: Lowe\'s is the newest entry ===');

const companies = await page.evaluate(() => {
  const sec = document.querySelector('#experience');
  if (!sec) return null;
  return [...sec.querySelectorAll('h3')].map(h => h.textContent.trim());
});
assert('Experience section found', companies !== null, 'no #experience section');
assert('Lowe\'s Companies, Inc. is present', (companies || []).some(c => /Lowe/i.test(c)),
  `companies listed: ${JSON.stringify(companies)}`);
assert('Lowe\'s is listed FIRST (most recent first)', /Lowe/i.test((companies || [])[0] || ''),
  `first company is: ${(companies || [])[0]}`);
assert('The two older roles are still there',
  (companies || []).some(c => /Independent Contractor/i.test(c)) &&
  (companies || []).some(c => /FedEx/i.test(c)),
  `companies listed: ${JSON.stringify(companies)}`);

const expText = await page.evaluate(() => document.querySelector('#experience')?.innerText || '');
for (const [label, re] of [
  ['job title "Associate Software Engineer"', /Associate Software Engineer/i],
  ['location "Charlotte, NC"',               /Charlotte,\s*NC/i],
  ['dates "Jan 2026 - Present"',             /Jan\s*2026\s*[-–]\s*Present/i],
  ['the domestic transportation team',       /the domestic transportation team/i],
  ['the 90% test coverage bullet',           /90%\s*test coverage/i],
]) {
  assert(`Lowe's card shows ${label}`, re.test(expText), `not found in #experience text`);
}

// A broken <img> still renders an element and still passes a "is it there" check,
// so this asserts the browser actually decoded the file (naturalWidth > 0) and
// that the asset itself is fetchable.
const logo = await page.evaluate(() => {
  const img = [...document.querySelectorAll('#experience img')]
    .find(i => /lowe/i.test(i.getAttribute('src') || '') || /lowe/i.test(i.alt || ''));
  if (!img) return null;
  const r = img.getBoundingClientRect();
  return { src: img.getAttribute('src'), alt: img.alt, loaded: img.naturalWidth > 0,
           w: Math.round(r.width), h: Math.round(r.height) };
});
assert("Lowe's logo image is in the Experience card", logo !== null, 'no Lowe\'s <img> found');
assert("Lowe's logo actually loaded (not a broken image)", !!logo?.loaded,
  `naturalWidth was 0 for ${logo?.src}`);
assert("Lowe's logo is visible at a usable size", (logo?.w || 0) >= 24 && (logo?.h || 0) >= 24,
  `rendered ${logo?.w}x${logo?.h}`);
assert("Lowe's logo has real alt text", /lowe/i.test(logo?.alt || ''), `alt is "${logo?.alt}"`);

const logoRes = await page.request.get(BASE + '/images/lowes.svg');
assert('The logo file is served', logoRes.status() === 200, `got ${logoRes.status()}`);

console.log('\n=== 5. Education: full legal school name ===');

const eduText = await page.evaluate(() => document.querySelector('#education')?.innerText || '');
assert('School reads "Slippery Rock University of Pennsylvania"',
  /Slippery Rock University of Pennsylvania/i.test(eduText),
  `education text: ${eduText.slice(0, 120)}`);

console.log('\n=== 6. Resume points at the 2026 file and is downloadable ===');

const res = await page.request.get(BASE + RESUME_PATH);
assert(`GET ${RESUME_PATH} returns 200`, res.status() === 200, `got ${res.status()}`);
const buf = res.status() === 200 ? await res.body() : Buffer.alloc(0);
assert('It is a real PDF', buf.slice(0, 5).toString() === '%PDF-', `starts with: ${buf.slice(0, 8).toString()}`);
assert('It is byte-for-byte the 2026 resume', buf.length === RESUME_BYTES,
  `served ${buf.length} bytes, expected ${RESUME_BYTES}`);

// The Resume button takes a DIFFERENT branch under 1024px: it downloads the file
// directly instead of opening the preview modal. That branch was never wired up
// (it pointed at "/path-to-your-resume.pdf"), so this clicks the real button at a
// tablet width and checks where the download actually goes — behaviour, not a
// grep of the source, which would pass on a constant that is imported but unused.
const mobile = await browser.newPage({ viewport: { width: 900, height: 800 } });
await mobile.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await mobile.waitForTimeout(4000);

let downloadUrl = null;
mobile.on('download', d => { downloadUrl = d.url(); });
await mobile.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find(b => /resume/i.test(b.textContent || ''));
  if (btn) btn.click();
});
await mobile.waitForTimeout(2500);

assert('Clicking Resume under 1024px actually downloads something', downloadUrl !== null,
  'no download fired — the button is dead on tablet/mobile widths');
assert('The mobile download is the 2026 resume', (downloadUrl || '').endsWith(RESUME_PATH),
  `download went to: ${downloadUrl}`);
await mobile.close();

console.log('\n=== 7. The Slippery Rock -> Charlotte journey map ===');

// The map is no longer its own section. It is a small figure inside the
// "Get to Know Me" tab of More About Me, so the tab has to be opened first.
await page.evaluate(() => {
  document.getElementById('future')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  const tab = [...document.querySelectorAll('#future button')]
    .find(b => /get to know me/i.test(b.textContent || ''));
  tab?.click();
});
await page.waitForTimeout(900);

const map = await page.evaluate(() => {
  const sec = document.querySelector('[data-journey-map]');
  if (!sec) return null;
  const svg = sec.querySelector('svg');
  const text = sec.innerText;
  // Every marker/label is tagged with a data attribute so the test is not
  // matching on styling classes that are free to change.
  const from = sec.querySelector('[data-city="slippery-rock"]');
  const to = sec.querySelector('[data-city="charlotte"]');
  const route = sec.querySelector('[data-route]');
  const states = sec.querySelectorAll('[data-state]');
  const box = sec.getBoundingClientRect();
  return {
    text,
    hasSvg: !!svg,
    hasFrom: !!from, hasTo: !!to, hasRoute: !!route,
    stateCount: states.length,
    // PA sits north of NC, so on screen the origin marker must be ABOVE the destination
    fromY: from ? from.getBoundingClientRect().top : null,
    toY: to ? to.getBoundingClientRect().top : null,
    width: Math.round(box.width),
    viewportW: window.innerWidth,
  };
});

assert('The journey map is present in More About Me', map !== null,
  'no [data-journey-map] element found after opening the Get to Know Me tab');
assert('It renders an inline SVG map', !!map?.hasSvg, 'no <svg> inside the map');
assert('The map is small, not a full-width feature', (map?.width || 0) <= 340,
  `rendered ${map?.width}px wide`);
assert('Real state outlines are drawn (not a decorative blob)', (map?.stateCount || 0) >= 8,
  `only ${map?.stateCount} [data-state] paths found`);
assert('Slippery Rock is marked', !!map?.hasFrom, 'no [data-city="slippery-rock"] marker');
assert('Charlotte is marked', !!map?.hasTo, 'no [data-city="charlotte"] marker');
assert('A route connects them', !!map?.hasRoute, 'no [data-route] element');
assert('Slippery Rock is drawn NORTH of Charlotte (map is geographically right)',
  map?.fromY !== null && map?.toY !== null && map.fromY < map.toY,
  `origin y=${map?.fromY} is not above destination y=${map?.toY}`);

for (const [label, re] of [
  ['Slippery Rock, Pennsylvania', /Slippery Rock/i],
  ['Charlotte, North Carolina',   /Charlotte/i],
]) {
  assert(`Journey section names ${label}`, re.test(map?.text || ''), `not in section text`);
}

// Jon: "just show the journey and be straight to the point". The map speaks for
// itself; coordinates, mileage and an observation about longitude were clutter.
for (const [label, re] of [
  ['no latitude/longitude readout', /\d+\.\d+\s*°\s*[NW]/i],
  ['no mileage figure',             /\d{3}\s*mi\b/i],
  ['no "degree of longitude" line', /degree of longitude/i],
]) {
  assert(`Journey section has ${label}`, !re.test(map?.text || ''),
    `still present in: ${(map?.text || '').replace(/\s+/g, ' ').slice(0, 160)}`);
}

// Employer-internal naming should not appear anywhere on a public page.
const pageText = await page.evaluate(() => document.body.innerText);
assert('The TMS acronym is not used anywhere on the page', !/\bTMS\b/.test(pageText),
  'found "TMS" in the page text');
assert('"Transportation Management System" is not spelled out either',
  !/Transportation Management System/i.test(pageText),
  'found the expanded form in the page text');

assert('Map section does not overflow the viewport',
  (map?.width || 0) <= (map?.viewportW || 0),
  `section is ${map?.width}px in a ${map?.viewportW}px viewport`);

console.log('\n=== 8. The page reads as one chaptered journey ===');

const chapters = await page.evaluate(() => {
  const els = [...document.querySelectorAll('[data-chapter]')];
  return els.map(el => ({
    number: el.getAttribute('data-chapter'),
    label: (el.querySelector('[data-chapter-label]')?.textContent || '').trim(),
    top: Math.round(el.getBoundingClientRect().top + window.scrollY),
    hasRail: !!el.querySelector('[data-rail]'),
  }));
});

assert('Five chapters are on the page', chapters.length === 5,
  `found ${chapters.length}: ${JSON.stringify(chapters.map(c => c.number))}`);
assert('Chapters are numbered 01 through 05',
  JSON.stringify(chapters.map(c => c.number)) === JSON.stringify(['01', '02', '03', '04', '05']),
  `got ${JSON.stringify(chapters.map(c => c.number))}`);
assert('Every chapter has a label', chapters.every(c => c.label.length > 0),
  `labels: ${JSON.stringify(chapters.map(c => c.label))}`);

// Certifications are qualifications earned, not things built, so they belong
// with the degree rather than under "What I've Built".
const certChapter = await page.evaluate(() => {
  const c = document.querySelector('#certifications')?.closest('[data-chapter]');
  return c ? { number: c.getAttribute('data-chapter'),
               label: (c.querySelector('[data-chapter-label]')?.textContent || '').trim() } : null;
});
assert('Certifications sit with Education, not under "What I\'ve Built"',
  certChapter !== null && !/built/i.test(certChapter.label),
  `certifications are in chapter ${certChapter?.number} "${certChapter?.label}"`);
assert('Certifications share a chapter with Education',
  certChapter?.number === await page.evaluate(() =>
    document.querySelector('#education')?.closest('[data-chapter]')?.getAttribute('data-chapter')),
  `certifications in ${certChapter?.number}`);
assert('Chapters appear down the page in numeric order',
  chapters.every((c, i) => i === 0 || c.top > chapters[i - 1].top),
  `tops: ${JSON.stringify(chapters.map(c => c.top))}`);
assert('Every chapter draws the connecting rail', chapters.every(c => c.hasRail),
  'a chapter is missing its [data-rail]');

// The rail must reach the BOTTOM of its chapter. It used to fade to transparent,
// so on chapter 05 (More About Me plus Contact) the line stopped before Contact
// and made it look like Contact was not part of the chapter.
const railReach = await page.evaluate(() => {
  const out = [];
  for (const ch of document.querySelectorAll('[data-chapter]')) {
    const rail = ch.querySelector('[data-rail]');
    if (!rail || getComputedStyle(rail).display === 'none') continue;
    const line = rail.firstElementChild;
    const chBox = ch.getBoundingClientRect();
    const railBox = rail.getBoundingClientRect();
    const bg = line ? getComputedStyle(line).backgroundImage : '';
    out.push({
      number: ch.getAttribute('data-chapter'),
      coversChapter: Math.abs(railBox.height - chBox.height) <= 2,
      fadesOut: /transparent|rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(bg),
    });
  }
  return out;
});
assert('The rail spans the full height of every chapter',
  railReach.length > 0 && railReach.every(r => r.coversChapter),
  JSON.stringify(railReach));
assert('The rail never fades to nothing before its chapter ends',
  railReach.every(r => !r.fadesOut),
  `chapters fading out: ${railReach.filter(r => r.fadesOut).map(r => r.number).join(', ')}`);

// The rail runs the full height of every chapter. If any text starts at or left
// of the rail, the line draws straight through the words. Checked against real
// measured text boxes at desktop widths, per chapter, because eyeballing one
// screenshot is exactly how this shipped broken the first time.
for (const width of [1024, 1280, 1440, 1600, 1920]) {
  const collide = await page.setViewportSize({ width, height: 950 })
    .then(() => page.waitForTimeout(900))
    .then(() => page.evaluate(() => {
      const bad = [];
      for (const ch of document.querySelectorAll('[data-chapter]')) {
        const rail = ch.querySelector('[data-rail]');
        if (!rail) continue;
        const rr = rail.getBoundingClientRect();
        if (rr.width === 0 && rr.height === 0) continue;      // hidden at this width
        if (getComputedStyle(rail).display === 'none') continue;
        const railRight = rr.right;
        for (const el of ch.querySelectorAll('h1,h2,h3,h4,p,li,span,a,button,img,svg')) {
          const t = (el.textContent || '').trim();
          if (!t && el.tagName !== 'IMG' && el.tagName !== 'SVG') continue;
          const b = el.getBoundingClientRect();
          if (b.width === 0 || b.height === 0) continue;
          if (getComputedStyle(el).visibility === 'hidden') continue;
          if (b.left < railRight - 0.5) {
            bad.push({ ch: ch.getAttribute('data-chapter'), tag: el.tagName,
                       left: Math.round(b.left), railRight: Math.round(railRight),
                       text: t.slice(0, 30) });
            break;
          }
        }
      }
      return bad;
    }));
  assert(`Story rail does not collide with content at ${width}px`, collide.length === 0,
    collide.map(c => `ch${c.ch} <${c.tag}> left=${c.left} < rail ${c.railRight} "${c.text}"`).join(' | '));
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(900);

// The left edge of the page must be one straight line. The hero used to start
// 48px left of every other section, which is what made the side spacing look
// ragged and what the rail then drew through.
for (const width of [1280, 1440, 1600, 1920, 2560]) {
  await page.setViewportSize({ width, height: 950 });
  await page.waitForTimeout(800);
  const edges = await page.evaluate(() => {
    const L = (el) => (el ? Math.round(el.getBoundingClientRect().left) : null);
    const hero = [...document.querySelectorAll('h2')].find(e => /Hi, I'm Jon/i.test(e.textContent || ''));
    return {
      hero: L(hero),
      experience: L(document.querySelector('#experience h2')),
      education: L(document.querySelector('#education h2')),
      certifications: L(document.querySelector('#certifications h2')),
    };
  });
  const vals = Object.values(edges).filter(v => v !== null);
  const spread = Math.max(...vals) - Math.min(...vals);
  assert(`Every section starts on the same left edge at ${width}px`, spread <= 1,
    `left edges ${JSON.stringify(edges)} differ by ${spread}px`);

  // Left edges alone were not enough. Contact's card was capped at max-w-3xl
  // while every other section's spanned max-w-6xl, so it started in the right
  // place and then stopped 384px short of everything else. Aligned on one side
  // and ragged on the other is arguably worse than being consistently inset.
  const rights = await page.evaluate(() => {
    const out = {};
    for (const id of ['experience', 'education', 'certifications', 'projects', 'skills', 'future', 'contact']) {
      const sec = document.getElementById(id);
      if (!sec) continue;
      // The widest card-like block in the section: what the eye reads as its edge.
      const blocks = [...sec.querySelectorAll('div')]
        .filter(d => /rounded-(xl|2xl)/.test(d.className || ''))
        .map(d => d.getBoundingClientRect())
        .filter(r => r.width > 200);
      if (blocks.length) out[id] = Math.round(Math.max(...blocks.map(r => r.right)));
    }
    return out;
  });
  const rVals = Object.values(rights);
  const rSpread = rVals.length ? Math.max(...rVals) - Math.min(...rVals) : 0;
  assert(`Every section's card ends on the same right edge at ${width}px`, rSpread <= 2,
    `right edges ${JSON.stringify(rights)} differ by ${rSpread}px`);
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(800);

// "The Move" is no longer a chapter; the map lives inside More About Me.
const noMoveChapter = await page.evaluate(() =>
  [...document.querySelectorAll('[data-chapter-label]')].every(l => !/the move/i.test(l.textContent || '')));
assert('There is no standalone "The Move" chapter any more', noMoveChapter,
  'a chapter is still labelled "The Move"');

const prog = await page.evaluate(async () => {
  const bar = document.querySelector('[data-scroll-progress]');
  if (!bar) return null;
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 400));
  const atTop = bar.getBoundingClientRect().width;
  window.scrollTo(0, document.documentElement.scrollHeight);
  await new Promise(r => setTimeout(r, 700));
  const atEnd = bar.getBoundingClientRect().width;
  window.scrollTo(0, 0);
  return { atTop: Math.round(atTop), atEnd: Math.round(atEnd), vw: window.innerWidth };
});
assert('A scroll progress indicator exists', prog !== null, 'no [data-scroll-progress] element');
assert('Progress grows as you scroll', (prog?.atEnd || 0) > (prog?.atTop || 0),
  `width ${prog?.atTop} at top, ${prog?.atEnd} at bottom`);
assert('Progress reaches the full width at the bottom',
  (prog?.atEnd || 0) >= (prog?.vw || 0) * 0.9,
  `only ${prog?.atEnd} of ${prog?.vw}`);

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

console.log('\n----------------------------------------');
console.log(` PASSED: ${pass}   FAILED: ${fail}`);
console.log('----------------------------------------\n');

await browser.close();
process.exit(fail > 0 ? 1 : 0);
