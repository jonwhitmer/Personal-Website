// Measures the site on real device profiles instead of a narrow desktop window.
// A 390px-wide DESKTOP viewport disables every `pointer: coarse` rule and lies
// about how the site feels on a phone, so each profile below carries a real
// device scale factor, isMobile and hasTouch.
//
// Run:  node qa/responsive.mjs

import { chromium, devices } from 'playwright';

const BASE = process.env.SITE_URL || 'http://localhost:5173';

const PROFILES = [
  { name: 'iPhone SE (375)',    use: devices['iPhone SE'] },
  { name: 'iPhone 13 (390)',    use: devices['iPhone 13'] },
  { name: 'Pixel 5 (393)',      use: devices['Pixel 5'] },
  { name: 'iPhone 14 Pro Max',  use: devices['iPhone 14 Pro Max'] },
  { name: 'iPad Mini (768)',    use: devices['iPad Mini'] },
  { name: 'Galaxy Fold (320)',  use: { viewport: { width: 320, height: 800 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: devices['Pixel 5'].userAgent } },
  { name: 'Laptop (1280)',      use: { viewport: { width: 1280, height: 800 } } },
  { name: '4K (2560)',          use: { viewport: { width: 2560, height: 1440 } } },
];

const MIN_TAP = 44;   // px â€” Apple HIG / WCAG 2.5.5 target size
const MIN_TEXT = 13;  // px â€” Jon's floor on phones

const browser = await chromium.launch();
let totalProblems = 0;

for (const p of PROFILES) {
  const ctx = await browser.newContext({ ...p.use });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Chapters reveal on scroll (opacity-0 + translate-y until seen), and a hidden
  // element measures as 0x0 or is skipped entirely. Measuring straight after
  // load therefore reports a fraction of the real defects. Walk the whole page
  // first so every chapter has been revealed, then measure.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.75);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 400));
  });
  await page.waitForTimeout(1200);

  const r = await page.evaluate(({ MIN_TAP, MIN_TEXT }) => {
    const vw = window.innerWidth;
    const isPhone = vw < 768;

    // 1. horizontal overflow â€” the single worst mobile defect
    const docW = document.documentElement.scrollWidth;

    // 2. any element sticking out past the right edge
    const spillers = [];
    for (const el of document.querySelectorAll('body *')) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      // The blurred background blobs are deliberately positioned off-screen and
      // are clipped by an `overflow-x-clip` ancestor, so they extend past the
      // viewport box without ever causing a scrollbar. Counting them as defects
      // buries the real ones. Anything non-interactive and clipped is skipped;
      // the documentElement.scrollWidth check above is the real overflow gate.
      if (getComputedStyle(el).pointerEvents === 'none') continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      if (b.right > vw + 1) {
        spillers.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 60),
          right: Math.round(b.right),
        });
        
      }
    }

    // 3. tap targets (phones only)
    const small = [];
    if (isPhone) {
      for (const el of document.querySelectorAll('a, button, input, textarea, select, [role="button"]')) {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        if (getComputedStyle(el).display === 'none') continue;
        // A link inside a sentence cannot be 44px tall without leaving the text
        // baseline, so the correct pattern is a normal inline box with the hit
        // area grown by an absolutely positioned ::after. Measuring only the
        // element's own box reports those as failures when they are actually
        // correct, so take whichever is larger.
        const after = getComputedStyle(el, '::after');
        const tapH = Math.max(b.height, parseFloat(after.height) || 0);
        const tapW = Math.max(b.width, parseFloat(after.width) || 0);
        if (tapH < MIN_TAP || tapW < MIN_TAP) {
          small.push({
            tag: el.tagName,
            text: (el.textContent || '').trim().slice(0, 22),
            w: Math.round(tapW), h: Math.round(tapH),
          });
          // No cap. A capped list reads as "8 problems" when there are 92, and
          // silently understates how much work is left.
        }
      }
    }

    // 4. tiny text (phones only)
    const tiny = [];
    if (isPhone) {
      for (const el of document.querySelectorAll('body *')) {
        if (!el.childNodes.length) continue;
        const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (!hasText) continue;
        // Text nobody can see is not a legibility defect. The chapter indicator
        // is `hidden sm:flex`, so on a phone it is display:none and was being
        // counted as two 12px violations that do not exist on screen.
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        if (getComputedStyle(el).visibility === 'hidden') continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs && fs < MIN_TEXT) {
          tiny.push({ tag: el.tagName, fs, text: (el.textContent || '').trim().slice(0, 22) });
          
        }
      }
    }

    // 5. truncation â€” Jon's hard rule: never clip content with an ellipsis
    const clipped = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) {
        clipped.push({ tag: el.tagName, text: (el.textContent || '').trim().slice(0, 30) });
        
      }
    }

    // 6. the mobile beta banner
    const beta = /Website in Beta on Mobile/i.test(document.body.innerText);

    return {
      vw, docW, overflow: docW > vw,
      spillers, small, tiny, clipped, beta,
      headerH: Math.round(document.querySelector('header')?.getBoundingClientRect().height || 0),
    };
  }, { MIN_TAP, MIN_TEXT });

  const problems =
    (r.overflow ? 1 : 0) + r.spillers.length + r.small.length + r.tiny.length + r.clipped.length;
  totalProblems += problems;

  console.log(`\n### ${p.name}  (viewport ${r.vw}px, header ${r.headerH}px)`);
  console.log(`  horizontal overflow : ${r.overflow ? `YES â€” document ${r.docW}px in ${r.vw}px` : 'no'}`);
  if (r.spillers.length) {
    console.log(`  elements past right edge (${r.spillers.length}+):`);
    r.spillers.forEach(s => console.log(`      <${s.tag}> right=${s.right}  ${s.cls}`));
  }
  if (r.small.length) {
    console.log(`  tap targets under ${MIN_TAP}px (${r.small.length}+):`);
    r.small.forEach(s => console.log(`      <${s.tag}> ${s.w}x${s.h}  "${s.text}"`));
  }
  if (r.tiny.length) {
    console.log(`  text under ${MIN_TEXT}px (${r.tiny.length}+):`);
    r.tiny.forEach(s => console.log(`      <${s.tag}> ${s.fs}px  "${s.text}"`));
  }
  if (r.clipped.length) {
    console.log(`  TRUNCATED with ellipsis (${r.clipped.length}+):`);
    r.clipped.forEach(s => console.log(`      <${s.tag}> "${s.text}"`));
  }
  console.log(`  mobile beta banner  : ${r.beta ? 'SHOWN' : 'absent'}`);
  console.log(`  -> ${problems} problem(s)`);

  await ctx.close();
}

console.log(`\n========================================`);
console.log(` TOTAL PROBLEMS ACROSS PROFILES: ${totalProblems}`);
console.log(`========================================\n`);
await browser.close();

