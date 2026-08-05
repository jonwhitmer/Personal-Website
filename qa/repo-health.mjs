// Repo health + CI readiness gate.
//
// Written BEFORE the branch/CI work, and run first to watch it fail.
// This asserts the things that were silently untrue on 2026-08-04:
//
//   - the QA suite and coaster.yaml were NOT in git at all (one copy, no history)
//   - every browser test imported Playwright from ANOTHER repo by absolute path,
//     so the suite could never run in CI or on a clean checkout
//   - there was no root package.json, no `npm run qa`, and no CI workflow
//   - `main` and `dev` held tutorial content with no portfolio-frontend/ directory,
//     so merging either one would publish someone else's portfolio
//   - nothing documented the nine environment variables the three services need
//
// This script needs no dependencies on purpose: it has to be runnable on a clean
// checkout before `npm install` has ever been run.
//
// Run:  node qa/repo-health.mjs

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');

let pass = 0, fail = 0;
const ok = (n) => { console.log(`  PASS  ${n}`); pass++; };
const bad = (n, d = '') => { console.log(`  FAIL  ${n}\n        -> ${d}`); fail++; };
const assert = (n, cond, detail) => (cond ? ok(n) : bad(n, detail));

// git, but never throwing — a failed command is data, not a crash.
const git = (args) => {
  try {
    return execSync(`git ${args}`, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
};

const read = (rel) => (existsSync(join(REPO, rel)) ? readFileSync(join(REPO, rel), 'utf8') : '');

console.log('\n=== 1. Nothing that matters is missing from git ===');

const tracked = git('ls-files').split('\n').filter(Boolean);

const qaFiles = tracked.filter((f) => f.startsWith('qa/'));
assert(
  'The qa/ suite is tracked in git',
  qaFiles.length > 0,
  'git ls-files qa/ returned nothing — the tests exist only on this disk, with no history and no backup',
);

assert(
  'Every qa/ script on disk is tracked',
  (() => {
    const onDisk = readdirSync(join(REPO, 'qa')).filter((f) => /\.(mjs|ps1|json)$/.test(f));
    const missing = onDisk.filter((f) => !tracked.includes(`qa/${f}`));
    return missing.length === 0 ? true : missing.join(', ');
  })() === true,
  'some qa/ files are on disk but untracked',
);

assert(
  'coaster.yaml is tracked in git',
  tracked.includes('coaster.yaml'),
  'the file that puts this site on the Coaster dashboard is untracked',
);

console.log('\n=== 2. The test suite can run on a machine that is not Jon\'s ===');

const browserTests = readdirSync(join(REPO, 'qa')).filter((f) => f.endsWith('.mjs') && f !== 'repo-health.mjs');

const withAbsoluteImports = browserTests.filter((f) => {
  const src = read(`qa/${f}`);
  return /from\s+['"]file:\/\/\//.test(src);
});
assert(
  'No qa/ script imports a dependency by absolute file path',
  withAbsoluteImports.length === 0,
  `these import from a hardcoded path outside this repo: ${withAbsoluteImports.join(', ')}`,
);

const rootPkgRaw = read('package.json');
assert('A root package.json exists', rootPkgRaw !== '', 'there is no package.json at the repo root');

let rootPkg = {};
try { rootPkg = JSON.parse(rootPkgRaw || '{}'); } catch { /* handled by the assertion below */ }

assert(
  'Playwright is declared as a devDependency of THIS repo',
  Boolean(rootPkg.devDependencies?.playwright),
  'playwright is not in the root package.json, so a clean checkout cannot run the browser tests',
);

assert(
  'A single `npm run qa` command runs the whole suite',
  Boolean(rootPkg.scripts?.qa),
  'no `qa` script — running the tests means remembering nine separate node commands',
);

assert(
  'There is a runner that executes every suite and totals the result',
  existsSync(join(REPO, 'qa', 'run-all.mjs')),
  'qa/run-all.mjs is missing, so results have to be totalled by eye across nine scrollbacks',
);

console.log('\n=== 3. CI exists and has something to check ===');

assert(
  'A GitHub Actions workflow exists',
  existsSync(join(REPO, '.github', 'workflows', 'ci.yml')),
  'no .github/workflows/ci.yml — the "always check CI after a push" rule has nothing to check',
);

const ci = read('.github/workflows/ci.yml');
assert('CI builds the frontend', /npm run build|vite build/.test(ci), 'the workflow never builds the site');
assert('CI runs the QA suite', /npm run qa|run-all/.test(ci), 'the workflow never runs the browser tests');
assert('CI builds the backend', /mvn|maven/i.test(ci), 'the workflow never compiles the Spring backend');
assert(
  'CI guards the branches that deploy',
  /dev/.test(ci) && /stage/.test(ci) && /master/.test(ci),
  'the workflow does not name dev, stage and master',
);

console.log('\n=== 4. The three-branch structure exists, and every branch is the REAL site ===');

for (const branch of ['dev', 'stage', 'master']) {
  const exists = git(`rev-parse --verify --quiet refs/heads/${branch}`) !== '';
  assert(`Branch \`${branch}\` exists locally`, exists, `refs/heads/${branch} not found`);

  if (exists) {
    const files = git(`ls-tree -r --name-only ${branch}`).split('\n').filter(Boolean);
    assert(
      `Branch \`${branch}\` contains the real site, not the tutorial`,
      files.some((f) => f.startsWith('portfolio-frontend/')),
      `${branch} has no portfolio-frontend/ directory — merging it would publish the JavaScript Mastery tutorial`,
    );
    assert(
      `Branch \`${branch}\` carries the QA suite`,
      files.some((f) => f.startsWith('qa/')),
      `${branch} has no qa/ directory, so CI on that branch has no tests to run`,
    );
  }
}

console.log('\n=== 5. Nothing secret, nothing junk ===');

// A real environment file is `.env`, `.env.production`, `portfolio-backend/.env` and so on.
// A template — `.env.example`, `.env.template`, `.env.sample` — is SUPPOSED to be tracked:
// it carries variable names with no values, which is the whole point of section 6 below.
// The exclusion is narrow and named, so a file called `.env.prod` still fails this.
const IS_ENV_TEMPLATE = /\.(example|template|sample)$/;
const trackedEnvFiles = tracked.filter((f) => /(^|\/)\.env($|\.)/.test(f) && !IS_ENV_TEMPLATE.test(f));
assert(
  'No real .env file is tracked',
  trackedEnvFiles.length === 0,
  `these environment files are committed: ${trackedEnvFiles.join(', ')}`,
);

// And prove the template is genuinely value-free rather than trusting its name.
const templates = tracked.filter((f) => /(^|\/)\.env\./.test(f) && IS_ENV_TEMPLATE.test(f));
const templatesWithSecrets = [];
for (const f of templates) {
  for (const line of read(f).split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (!m) continue;
    const [, name, val] = m;
    const looksSensitive = /(KEY|SECRET|TOKEN|PASSWORD)$/.test(name);
    const looksPlaceholder = /^(|<.*>|your[-_ ].*|change[-_ ]?me|xxx+|\.\.\.)$/i.test(val);
    if (looksSensitive && !looksPlaceholder) templatesWithSecrets.push(`${f}: ${name} has a value`);
  }
}
assert(
  'The .env template carries variable names only, never values',
  templatesWithSecrets.length === 0,
  templatesWithSecrets.join('\n        -> '),
);

const SECRET_SHAPES = [
  [/xkeysib-[A-Za-z0-9]{10,}/, 'a Brevo API key'],
  [/gsk_[A-Za-z0-9]{20,}/, 'a Groq API key'],
  [/sk-[A-Za-z0-9]{20,}/, 'an OpenAI-style key'],
  [/AIza[A-Za-z0-9_-]{20,}/, 'a Google API key'],
  [/ghp_[A-Za-z0-9]{20,}/, 'a GitHub token'],
  [/password\s*=\s*(?!\$\{)(?!\s*$)\S+/i, 'a literal password (not a ${VAR} reference)'],
];

const scannable = tracked.filter((f) => /\.(js|jsx|mjs|java|py|properties|ya?ml|json|conf|md|html)$/.test(f) && !f.includes('package-lock'));
const secretHits = [];
for (const f of scannable) {
  const src = read(f);
  if (!src) continue;
  for (const [re, what] of SECRET_SHAPES) {
    const m = src.match(re);
    if (m && !m[0].includes('${')) secretHits.push(`${f}: ${what}`);
  }
}
assert('No secret literals in any tracked file', secretHits.length === 0, secretHits.join('\n        -> '));

assert(
  'Vite build junk cannot be committed',
  /timestamp-/.test(read('.gitignore')),
  'vite.config.js.timestamp-*.mjs is not gitignored and would be committed as source',
);

console.log('\n=== 6. Someone else could actually run this ===');

assert('A README exists', existsSync(join(REPO, 'README.md')), 'the repo is public and has zero markdown files');

const envExample = read('.env.example') || read('portfolio-backend/.env.example');
assert(
  'An .env.example documents the required environment variables',
  envExample !== '',
  'nine environment variables across three services are documented nowhere',
);
assert(
  '.env.example names the variables the backend cannot boot without',
  /GMAIL_APP_PASSWORD/.test(envExample) && /MY_EMAIL/.test(envExample),
  'the example is missing the variables that actually block startup',
);

console.log(`\n${'='.repeat(60)}`);
console.log(`  ${pass} passing, ${fail} failing`);
console.log(`${'='.repeat(60)}\n`);

process.exit(fail === 0 ? 0 : 1);
