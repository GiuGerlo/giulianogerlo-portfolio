---
description: Checklist de onboarding del proyecto en una PC nueva
---

Guiá el setup de este repo en una PC nueva, paso a paso. Verificá cada paso antes de
seguir al siguiente y avisame si algo falla.

## 1. Repo + branch

```bash
git clone <repo> giulianogerlo-portfolio
cd giulianogerlo-portfolio
git checkout feature/phase-12-supabase   # o la branch en curso
git pull
```

## 2. Dependencias

```bash
pnpm install
```

## 3. `.env` local (NO se sincroniza por git — está gitignoreado)

```bash
copy .env.example .env   # luego completar valores reales
```

Valores: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Supabase dashboard → Settings →
API), `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role, revelar), + resto
(Turnstile/Resend/Upstash/Gemini). Copiar entre PCs por gestor de passwords / pendrive
cifrado, **NUNCA por chat/mail**. Alternativa: `vercel env pull` si están las 3 vars con
scope Development en Vercel.

## 4. CodeGraph (recomendado)

Seguir [.claude/rules/codegraph-setup.md](../rules/codegraph-setup.md):
`npm i -g @colbymchenry/codegraph` → `codegraph init` → `codegraph install -t claude -l local -y`
→ reiniciar Claude Code → `claude mcp list` (debe decir `codegraph: ✓ Connected`).

## 5. Skills — ya vienen por git

Las skills viven como carpetas REALES en `.claude/skills/` y están commiteadas, así que
`git pull` ya las trae — NO hay que reinstalar nada en la PC nueva. (El store interno de
skills.sh en `.agents/` está gitignored; solo hace falta si querés `npx skills update`.)

Para AGREGAR una skill nueva: `npx skills add <owner/repo@skill>` crea un symlink en
`.claude/skills/`; convertilo a carpeta real (copiá el contenido de `.agents/skills/<skill>`
a `.claude/skills/<skill>`) antes de commitear — git en Windows no versiona symlinks
(core.symlinks=false).

## 6. MCP servers + plugins

```bash
claude mcp list   # esperado conectados: codegraph, supabase, context7, playwright, vercel
```

Si falta `context7`/`playwright`: instalar plugins con `/plugin` y `/reload-plugins`.
Supabase + CodeGraph: ver pasos 4 y la entrada de `.mcp.json` (commiteada).

## 7. Sanity checks

```bash
pnpm lint        # sin errores
pnpm test:run    # todos passing
pnpm dev         # levanta en http://localhost:5173, home OK
```

Si `pnpm dev` crashea con "Faltan VITE_SUPABASE_URL…" → `.env` mal configurado, volver al
paso 3.

## 8. Contexto

Branch en curso, Phase activa y tasks cerradas: ver el "Log de cambios" del plan activo
en `docs/plans/*.md`.
