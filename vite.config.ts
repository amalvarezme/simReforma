import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://amalvarezme.github.io/simReforma/
export default defineConfig({
  base: '/simReforma/',
  plugins: [react()],
})
