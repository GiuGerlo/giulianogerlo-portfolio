# CodeGraph — setup en PC nueva

Este proyecto usa **CodeGraph** ([colbymchenry/codegraph](https://github.com/colbymchenry/codegraph))
como MCP server: índice AST (tree-sitter) de todos los símbolos del codebase. Permite
responder preguntas estructurales ("qué llama a X", "qué se rompe si cambio Y", "dónde
está Z") en milisegundos, sin grep ni reads múltiples.

> El uso de las tools `codegraph_*` (cuándo preferirlas sobre grep/read) está en
> [.claude/CLAUDE.md](../CLAUDE.md), que se auto-carga en cada sesión.

## Setup si `codegraph` NO está instalado

Ejecutar **en este orden**:

```bash
# 1. Instalar el binario CLI + MCP server (excepción a la regla pnpm).
#    Va con npm global porque better-sqlite3 11.x no tiene prebuild para Node 24,
#    y compilarlo local requiere VS C++ Build Tools en Windows.
#    Riesgo de supply chain: cero — codegraph NO está en package.json, no se deploya,
#    no corre en CI/CD ni Vercel build. Es solo herramienta dev local.
npm i -g @colbymchenry/codegraph

# 2. Construir el índice (crea `.codegraph/codegraph.db`; `.codegraph/` está en gitignore).
codegraph init

# 3. Registrar el MCP server en Claude Code a nivel proyecto (crea/actualiza .mcp.json).
codegraph install -t claude -l local -y

# 4. Reiniciar Claude Code (las tools MCP se cargan al iniciar).

# 5. Verificar:
claude mcp list   # debe mostrar: codegraph: ✓ Connected
```

## Si las tools no aparecen

- `claude mcp list` no muestra `codegraph` → `codegraph install -t claude -l local -y`.
- Muestra `✗ Failed` → `codegraph status` (verifica binary + índice). Índice corrupto →
  `codegraph uninit && codegraph init`.
- Las tools `codegraph_*` no aparecen → reiniciar Claude Code.
