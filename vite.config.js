import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    // Genera sourcemaps en el build de producción: mapean el bundle
    // minificado al código original. Permite debuggear en prod y hace
    // que Lighthouse deje de marcar "no hay mapas de origen". El código
    // de un portfolio no es secreto, así que exponerlos no es problema.
    sourcemap: true,
  },
})
