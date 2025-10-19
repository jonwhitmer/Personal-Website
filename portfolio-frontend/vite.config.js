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
  assetsInclude: ['**/*.mov', '**/*.MOV']
})
