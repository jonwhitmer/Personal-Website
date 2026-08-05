// The contact address is ONE value, it comes from configuration, and it is the right one.
//
// Written BEFORE the change and run first to watch it fail.
//
// Why this test exists. On 2026-08-04 the site and the API disagreed about where a
// visitor's message should go:
//
//   the page's Copy / Gmail / Outlook buttons   ->  jonwhitmer23@gmail.com
//   the API's MY_EMAIL, and so every delivery   ->  jonmwhitmer@gmail.com
//
// A visitor who used the form and a visitor who used the Copy button reached two different
// inboxes, and the form told everyone "Message sent successfully!" either way. Jon has since
// confirmed jonmwhitmer@gmail.com is the correct address.
//
// Two hardcoded copies of a value is what let one of them rot. So this asserts both that the
// address is correct AND that the component no longer contains a literal at all.
//
// It also pins the property the component was carefully built to have: the address is never
// rendered as text, a title, an alt, an aria-label, a placeholder or a tooltip, so scrapers
// that harvest visible addresses find nothing. Fixing the address must not cost that.
//
// Run:  node qa/contact-address.mjs        (site must be running on :5173)

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.SITE_URL || 'http://localhost:5173';

const CORRECT = 'jonmwhitmer@gmail.com';
const WRONG = 'jonwhitmer23@gmail.com';

let pass = 0, fail = 0;
const ok = (n) => { console.log(`  PASS  ${n}`); pass++; };
const bad = (n, d = '') => { console.log(`  FAIL  ${n}\n        -> ${d}`); fail++; };
const assert = (n, cond, detail) => (cond ? ok(n) : bad(n, detail));

const read = (rel) => readFileSync(join(REPO, rel), 'utf8');

console.log('\n=== 1. The component holds no literal address ===');

const contactSrc = read('portfolio-frontend/src/components/Contact.jsx');

// The address was deliberately assembled from parts to keep it out of the markup, so a
// naive search for the whole string would miss it. Look for the local part instead, which
// survives every assembly trick used here.
assert(
  'Contact.jsx contains no hardcoded address local-part',
  !/jonwhitmer23|jonmwhitmer/.test(contactSrc),
  'the address is still written into the component; it must come from configuration',
);

assert(
  'Contact.jsx reads the address from build configuration',
  /import\.meta\.env\.VITE_CONTACT_EMAIL/.test(contactSrc),
  'no VITE_CONTACT_EMAIL reference found',
);

assert(
  'The build fails loudly if the address is not configured',
  /throw new Error/.test(contactSrc),
  'an unset address must stop the build, not silently ship a broken or empty mailto',
);

console.log('\n=== 2. No stale address anywhere in the frontend ===');

const FRONTEND_FILES = [
  'portfolio-frontend/src/components/Contact.jsx',
  'portfolio-frontend/src/components/Portfolio.jsx',
  'portfolio-frontend/src/components/Footer.jsx',
  'portfolio-frontend/src/components/Header.jsx',
  'portfolio-frontend/index.html',
];
const stale = FRONTEND_FILES.filter((f) => {
  try { return /jonwhitmer23/.test(read(f)); } catch { return false; }
});
assert('The old jonwhitmer23 address appears in no frontend file', stale.length === 0, stale.join(', '));

console.log('\n=== 3. The backend does not hardcode it either ===');

const controllerSrc = read('portfolio-backend/src/main/java/com/jonwhitmer/portfolio/controller/ContactController.java');
assert(
  'ContactController does not paste the address into its error message',
  !/@gmail\.com/.test(controllerSrc),
  'the 500 response contains a literal address, which is a second copy that can rot',
);

const emailServiceSrc = read('portfolio-backend/src/main/java/com/jonwhitmer/portfolio/service/EmailService.java');
assert(
  'EmailService has no silent fallback address',
  !/\$\{contact\.email:[^}]+\}/.test(emailServiceSrc),
  'a default value means an unset MY_EMAIL boots anyway and delivers somewhere unintended',
);

console.log('\n=== 4. What the live page actually does ===');

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await context.newPage();
await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(4000);

const hrefs = await page.evaluate(() =>
  [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));

const mailish = hrefs.filter((h) => /mailto:|mail\.google\.com|outlook\.live\.com/.test(h));
assert('The page offers at least one direct-mail route', mailish.length > 0, 'no mailto or webmail links found');

const wrongLinks = mailish.filter((h) => decodeURIComponent(h).includes(WRONG));
assert(`No link points at ${WRONG}`, wrongLinks.length === 0, wrongLinks.join('\n        -> '));

const rightLinks = mailish.filter((h) => decodeURIComponent(h).includes(CORRECT));
assert(
  `Every direct-mail route points at ${CORRECT}`,
  rightLinks.length === mailish.length,
  `${rightLinks.length} of ${mailish.length} do:\n        -> ${mailish.join('\n        -> ')}`,
);

console.log('\n=== 5. The Copy button copies the right address ===');

const copyButton = page.locator('button', { hasText: /copy my address/i }).first();
assert('A "Copy my address" button exists', await copyButton.count() > 0, 'button not found');

if (await copyButton.count() > 0) {
  await copyButton.scrollIntoViewIfNeeded();
  await copyButton.click();
  await page.waitForTimeout(500);
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  assert(`The clipboard receives ${CORRECT}`, clipboard.trim() === CORRECT, `clipboard held: "${clipboard}"`);
}

console.log('\n=== 6. The anti-scraper property still holds ===');

// The whole design of this component is that the address never reaches the DOM as anything
// a harvester reads. Changing the address must not quietly cost that.
const exposure = await page.evaluate((addr) => {
  const found = [];
  if (document.body.innerText.includes(addr)) found.push('visible page text');
  const ATTRS = ['title', 'alt', 'aria-label', 'placeholder', 'data-email', 'value'];
  for (const el of document.querySelectorAll('*')) {
    for (const a of ATTRS) {
      const v = el.getAttribute?.(a);
      if (v && v.includes(addr)) found.push(`${el.tagName.toLowerCase()}[${a}]`);
    }
  }
  return found;
}, CORRECT);

assert(
  'The address is never rendered as text or in a scrapeable attribute',
  exposure.length === 0,
  `exposed in: ${exposure.join(', ')}`,
);

await browser.close();

console.log('\n----------------------------------------');
console.log(` PASSED: ${pass}   FAILED: ${fail}`);
console.log('----------------------------------------\n');

process.exit(fail > 0 ? 1 : 0);
