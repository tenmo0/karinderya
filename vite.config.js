import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/karinderya/",
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ← Add this: Accept connections from any IP
    port: 5173,
    strictPort: true
  }
})