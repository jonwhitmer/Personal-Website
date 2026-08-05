import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Variables the site cannot function without, checked HERE rather than in a component.
 *
 * This started as a `throw` at the top of Contact.jsx, which was the wrong place and CI
 * proved it: `import.meta.env` is substituted at build time, so the check ran in the
 * browser at module load. A missing address therefore took down the ENTIRE PAGE — every
 * test reported "no header exists" against a white screen — instead of failing the one
 * feature that needed it.
 *
 * A missing build input should break the build, loudly, on the machine doing the building.
 * It should never be something a visitor discovers.
 */
const REQUIRED_ENV = {
  VITE_CONTACT_EMAIL: {
    describe: 'the address the Copy / Gmail / Outlook buttons point at',
    valid: (v) => v.includes('@') && v.includes('.'),
    hint: 'Must match the backend MY_EMAIL. See .env.example at the repo root.',
  },
}

function assertRequiredEnv(mode) {
  // loadEnv reads .env files; process.env carries anything the CI or Coaster passed in.
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env }
  const problems = []

  for (const [name, spec] of Object.entries(REQUIRED_ENV)) {
    const value = env[name]
    if (!value) problems.push(`  ${name} is not set — ${spec.describe}.\n    ${spec.hint}`)
    else if (!spec.valid(value)) problems.push(`  ${name} is set to "${value}", which is not valid.\n    ${spec.hint}`)
  }

  if (problems.length) {
    throw new Error(
      `\n\nBuild stopped: required environment variable(s) missing.\n\n${problems.join('\n\n')}\n`,
    )
  }
}

export default defineConfig(({ mode }) => {
  assertRequiredEnv(mode)

  return {
  plugins: [react()],
  server: {
    host: true,         // listen on all interfaces automatically
    port: 5173,
    strictPort: true,   // fail if 5173 is taken
    hmr: true,          // let Vite detect the host automatically
  },
  preview: {
    host: true,
    port: 5173,
  },
  assetsInclude: ['**/*.mov', '**/*.MOV'],
  build: {
    // Raised from the 500 kB default purely so the build output stays clean and
    // a real regression is not lost in a warning that is expected.
    //
    // The only chunk over the default is `PortraitFieldScene`, which is three.js
    // itself (~825 kB raw, ~222 kB gzipped). It cannot be tree-shaken because
    // react-three-fiber registers the whole THREE namespace as its element
    // catalogue. It is already behind a dynamic import and is only fetched on a
    // desktop that has WebGL and has not asked for reduced motion, so a phone
    // never downloads a byte of it.
    //
    // If a chunk ever exceeds this, that IS worth investigating - do not raise
    // the number again without knowing what grew.
    chunkSizeWarningLimit: 900,
  },
  }
})
