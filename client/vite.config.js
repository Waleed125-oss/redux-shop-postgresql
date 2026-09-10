import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    legacy({
      targets: ['Chrome >= 64', 'Android >= 5', 'iOS >= 12', 'not IE 11'],
    }),
  ],
})
