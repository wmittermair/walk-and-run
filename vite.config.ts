import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  base: '/walk-and-run/',  // Ihr Repository-Name
  server: {
    host: '0.0.0.0',  // Lauscht auf allen Netzwerk-Interfaces
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.loca.lt'  // Erlaubt alle Subdomains von loca.lt
    ]
  }
})
