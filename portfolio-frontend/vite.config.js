import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
})
