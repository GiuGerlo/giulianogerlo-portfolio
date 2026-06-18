import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // Las serverless functions de /api y los scripts de build corren en
  // Node (no en el browser): usan globals de Node como `process`. Este
  // bloque sobrescribe los globals para esos archivos.
  // `src/lib/supabase-server.js` también es código server-only (lo importa
  // api/chat.js) → usa `process.env`, va acá y no en el bloque browser.
  {
    files: ['api/**/*.js', 'scripts/**/*.js', 'src/lib/supabase-server.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
