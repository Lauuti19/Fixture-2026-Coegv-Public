import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mundial/',
  server: { port: 5173 }
})

//npm run build:web para subir al hosting