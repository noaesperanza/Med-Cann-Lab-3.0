import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001
  },
  optimizeDeps: {
    include: ['@xenova/transformers']
  },
  define: {
    global: 'globalThis',
  }
})