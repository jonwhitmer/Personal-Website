// Runs the whole QA suite with one command and totals the result.
//
// Before this existed, running the tests meant remembering nine separate `node qa/...`
// commands and adding up the results by eye across nine scrollbacks. That is the kind of
// procedure that quietly stops happening.
//
//   npm run qa                 reuse a running site, or start one, run everything
//   npm run qa -- --built      serve the production build instead of the dev server
//   npm run qa -- --only=theme,responsive
//   SITE_URL=https://www.jonwhitmer.com npm run qa -- --no-server
//
// Two rules this obeys, both learned the hard way:
//   1. It NEVER kills a server it did not start. A previous harness took over the port a
//      running app was using. If :5173 already answers, that server is used as-is and left
//      running afterwards.
//   2. Every wait has a deadline. Nothing here polls forever; on expiry it reports what it
//      actually saw rather than hanging silently.

import { spawn, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IS_WINDOWS = process.platform === 'win32';
const NPM = IS_WINDOWS ? 'npm.cmd' : 'npm';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];

const BASE = process.env.SITE_URL || 'http://127.0.0.1:5173';
const USE_BUILT = flag('built') || process.env.CI === 'true';
const MANAGE_SERVER = !flag('no-server') && !process.env.SITE_URL;
const BROWSER_ONLY = flag('browser-only');
const ONLY = value('only')?.split(',').map((s) => s.trim()).filter(Boolean);

// Server readiness. Generous because a cold Vite start on Windows genuinely takes a while,
// but finite, because a wait with no deadline is how a hung job looks identical to a slow one.
const SERVER_READY_TIMEOUT_MS = 120_000;
const SERVER_POLL_MS = 1_000;
const SUITE_TIMEOUT_MS = 300_000;

// The browser suites, in the order that fails fastest and most informatively.
// repo-health is deliberately separate: it needs no browser and no server.
const BROWSER_SUITES = [
  ['site-content', 'Content, header, resume and the Lowe\'s role'],
  ['contact-address', 'One contact address, from configuration, and the right one'],
  ['theme', 'Dark mode and theme persistence'],
  ['projects-grid', 'The projects grid and its detail panel'],
  ['project-videos', 'The five demo videos actually decode and play'],
  ['console-clean', 'No console errors or failed requests'],
  ['responsive', 'Layout at 320 / 390 / 768 / 1280 / 2560'],
  ['width-sweep', 'A fine-grained sweep for layout defects'],
  ['fullscreen-only-by-icon', 'Fullscreen opens only from its icon'],
];

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Ask the site if it is up, the same way Coaster's health probe does.
 *
 * Deliberately requests /index.html rather than /. Vite's dev server only falls back to
 * index.html when the request carries `Accept: text/html`, so a bare GET of / returns 404
 * while the site is perfectly healthy. Asking for the file by name skips that logic
 * entirely. This exact trap once made Coaster kill a working site every 90 seconds.
 */
async function siteAnswers(base) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3_000);
  try {
    const res = await fetch(`${base}/index.html`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function waitForSite(base, deadlineMs) {
  const startedAt = Date.now();
  let attempts = 0;
  while (Date.now() - startedAt < deadlineMs) {
    attempts += 1;
    if (await siteAnswers(base)) {
      return { ready: true, waitedMs: Date.now() - startedAt, attempts };
    }
    await sleep(SERVER_POLL_MS);
  }
  return { ready: false, waitedMs: Date.now() - startedAt, attempts };
}

function runSuite(name, extraEnv = {}) {
  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, [join(REPO, 'qa', `${name}.mjs`)], {
      cwd: REPO,
      env: { ...process.env, ...extraEnv },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let out = '';
    const capture = (chunk) => { out += chunk.toString(); };
    child.stdout.on('data', capture);
    child.stderr.on('data', capture);

    // A suite that hangs must not hang the run. Killing it is a FAILURE, reported as one.
    const killer = setTimeout(() => {
      child.kill('SIGKILL');
      out += `\n[run-all] Timed out after ${SUITE_TIMEOUT_MS / 1000}s and was killed.\n`;
    }, SUITE_TIMEOUT_MS);

    child.on('close', (code) => {
      clearTimeout(killer);
      resolveRun({ code: code ?? 1, out });
    });
    child.on('error', (err) => {
      clearTimeout(killer);
      resolveRun({ code: 1, out: `${out}\n[run-all] Could not start the suite: ${err.message}\n` });
    });
  });
}

/** Pull the numbers out of a suite's own summary so the totals are the suite's, not a guess. */
function readCounts(out) {
  const passFail = out.match(/PASSED:\s*(\d+)\s+FAILED:\s*(\d+)/);
  if (passFail) return { passed: Number(passFail[1]), failed: Number(passFail[2]) };

  const problems = out.match(/(?:CONSOLE PROBLEMS|TOTAL PROBLEMS ACROSS PROFILES|DISTINCT DEFECTS):\s*(\d+)/);
  if (problems) return { passed: null, failed: Number(problems[1]) };

  const health = out.match(/(\d+) passing, (\d+) failing/);
  if (health) return { passed: Number(health[1]), failed: Number(health[2]) };

  return { passed: null, failed: null };
}

// ---------------------------------------------------------------------------

console.log(c.bold('\njonwhitmer.com — full QA run'));
console.log(c.dim(`  target        ${BASE}`));
console.log(c.dim(`  server        ${MANAGE_SERVER ? (USE_BUILT ? 'production build (vite preview)' : 'dev server (vite)') : 'external, not managed by this script'}`));
console.log(c.dim(`  node          ${process.version}\n`));

const results = [];

// --- Stage 1: repo health. No browser, no server, so it runs first and fails fastest. ---
if (!BROWSER_ONLY) {
  process.stdout.write(`  ${'repo-health'.padEnd(26)}`);
  const r = await runSuite('repo-health');
  const counts = readCounts(r.out);
  results.push({ name: 'repo-health', ...r, counts, desc: 'Git hygiene, CI readiness, branch structure' });
  console.log(r.code === 0 ? c.green('PASS') : c.red('FAIL'));
}

// --- Stage 2: bring a site up, or find one already up. ---
let serverProcess = null;
let serverWasAlreadyUp = false;

if (MANAGE_SERVER) {
  serverWasAlreadyUp = await siteAnswers(BASE);

  if (serverWasAlreadyUp) {
    console.log(c.dim(`\n  A site is already answering on ${BASE} — reusing it and leaving it running.`));
  } else {
    if (USE_BUILT) {
      console.log(c.dim('\n  Building the frontend…'));
      try {
        execSync(`${NPM} run build`, { cwd: join(REPO, 'portfolio-frontend'), stdio: 'inherit' });
      } catch {
        console.log(c.red('\n  The frontend build failed. Nothing further can be tested.\n'));
        process.exit(1);
      }
    }

    console.log(c.dim(`  Starting the ${USE_BUILT ? 'preview' : 'dev'} server…`));
    serverProcess = spawn(NPM, ['run', USE_BUILT ? 'preview' : 'dev'], {
      cwd: join(REPO, 'portfolio-frontend'),
      env: {
        ...process.env,
        VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:8080',
        // Required by the build. Without it Contact.jsx throws rather than shipping
        // `mailto:undefined`, so the suite would fail on a configuration gap that has
        // nothing to do with the code under test.
        VITE_CONTACT_EMAIL: process.env.VITE_CONTACT_EMAIL || 'jonmwhitmer@gmail.com',
      },
      stdio: ['ignore', 'ignore', 'pipe'],
      detached: false,
    });

    let serverStderr = '';
    serverProcess.stderr.on('data', (chunk) => { serverStderr += chunk.toString(); });

    const { ready, waitedMs, attempts } = await waitForSite(BASE, SERVER_READY_TIMEOUT_MS);

    if (!ready) {
      // Report what was actually observed. "It didn't start" with no evidence is useless.
      console.log(c.red(`\n  The site never answered on ${BASE}.`));
      console.log(c.dim(`  Waited ${Math.round(waitedMs / 1000)}s across ${attempts} probes of /index.html.`));
      if (serverStderr.trim()) console.log(c.dim(`  Server stderr:\n${serverStderr.trim().split('\n').slice(-15).map((l) => `    ${l}`).join('\n')}`));
      console.log(c.dim('  Common causes: port 5173 already owned by another process, or a build error above.\n'));
      serverProcess.kill();
      process.exit(1);
    }

    console.log(c.dim(`  Ready in ${(waitedMs / 1000).toFixed(1)}s.\n`));
  }
}

// --- Stage 3: the browser suites. ---
const suitesToRun = BROWSER_SUITES.filter(([name]) => !ONLY || ONLY.includes(name));

if (suitesToRun.length < BROWSER_SUITES.length) {
  const skipped = BROWSER_SUITES.filter(([n]) => !suitesToRun.some(([s]) => s === n)).map(([n]) => n);
  console.log(c.yellow(`  Running ${suitesToRun.length} of ${BROWSER_SUITES.length} suites. NOT RUN: ${skipped.join(', ')}\n`));
}

for (const [name, desc] of suitesToRun) {
  if (!existsSync(join(REPO, 'qa', `${name}.mjs`))) {
    results.push({ name, code: 1, out: 'Suite file not found.', counts: { passed: null, failed: null }, desc });
    console.log(`  ${name.padEnd(26)}${c.red('MISSING')}`);
    continue;
  }
  process.stdout.write(`  ${name.padEnd(26)}`);
  const started = Date.now();
  const r = await runSuite(name, { SITE_URL: BASE });
  const counts = readCounts(r.out);
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  results.push({ name, ...r, counts, desc });
  const detail = counts.passed !== null
    ? c.dim(`  ${counts.passed} passed, ${counts.failed} failed  (${secs}s)`)
    : counts.failed !== null
      ? c.dim(`  ${counts.failed} problems  (${secs}s)`)
      : c.dim(`  (${secs}s)`);
  console.log((r.code === 0 ? c.green('PASS') : c.red('FAIL')) + detail);
}

// --- Stage 4: clean up only what this script started. ---
if (serverProcess && !serverWasAlreadyUp) {
  serverProcess.kill();
  // Vite spawns children; on Windows kill() does not reliably take the tree with it.
  if (IS_WINDOWS && serverProcess.pid) {
    try { execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' }); } catch { /* already gone */ }
  }
  console.log(c.dim('\n  Stopped the server this run started.'));
} else if (serverWasAlreadyUp) {
  console.log(c.dim('\n  Left the pre-existing server running — this script did not start it.'));
}

// --- Stage 5: the verdict. ---
const failed = results.filter((r) => r.code !== 0);

console.log(`\n${'='.repeat(64)}`);
if (failed.length === 0) {
  const totalPassed = results.reduce((n, r) => n + (r.counts.passed ?? 0), 0);
  console.log(c.green(c.bold(`  ALL ${results.length} SUITES PASSED`)) + c.dim(`  (${totalPassed} assertions)`));
  console.log(`${'='.repeat(64)}\n`);
  process.exit(0);
}

console.log(c.red(c.bold(`  ${failed.length} of ${results.length} SUITES FAILED`)));
console.log(`${'='.repeat(64)}\n`);

for (const r of failed) {
  console.log(c.red(c.bold(`--- ${r.name} `)) + c.dim(`— ${r.desc}`));
  const lines = r.out.split('\n');
  const interesting = lines.filter((l) => /FAIL|Error|error|✗|problem|Timed out/i.test(l));
  const show = interesting.length ? interesting : lines.slice(-25);
  console.log(show.slice(0, 40).map((l) => `    ${l}`).join('\n'));
  if (show.length > 40) console.log(c.dim(`    … ${show.length - 40} more lines. Run \`node qa/${r.name}.mjs\` for the full output.`));
  console.log('');
}

process.exit(1);
