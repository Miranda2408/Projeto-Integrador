import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permite abrir o site pelo endereço do GitHub Codespaces
    allowedHosts: ['.app.github.dev'],
    // Em desenvolvimento, tudo que começa com /api é encaminhado ao back-end local.
    // Assim o navegador conversa só com o front (sem problemas de CORS).
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
