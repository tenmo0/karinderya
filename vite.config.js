import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/APP-KARINDERYA/", // your repo name
  plugins: [react()],
});