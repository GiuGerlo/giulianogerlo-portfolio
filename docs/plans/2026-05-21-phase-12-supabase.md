# Phase 12 — Backend dinámico + admin con Supabase

> **Fecha:** 2026-05-21
> **Scope v1:** Solo Projects. Resto de entidades (experience, education, skills) quedan en `src/data/*.js` y se migran en futuras phases siguiendo el mismo patrón.
> **Restricción:** Todo en tier gratis (Vercel + Supabase).
> **Pre-requisito duro:** Phases 0-11 cerradas, sitio deployado en `giulianogerlo.vercel.app`.

---

## Log de cambios

<!--
Patrón: una línea por task cerrada o desvío. Mismo formato que
docs/plans/2026-05-13-portfolio-implementation-plan.md. Mantener
sincronizado entre PCs vía git.
-->

- **2026-05-21**: Plan creado y commiteado al repo (Task 12.0). MCP de Supabase agregado a `.mcp.json`. Pendiente: reinicio de Claude Code + creación de proyecto Supabase para arrancar Task 12.1.
- **2026-05-21**: Task 12.1 cerrada. Proyecto Supabase `giulianogerlo-portfolio` creado en region `sa-east-1` (São Paulo), free tier, status `ACTIVE_HEALTHY`. MCP de Supabase verificado (`claude mcp list` → `supabase: ✓ Connected`). Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) cargadas en `.env` local. `.env.example` actualizado con las 3 vars Supabase documentadas. Pendiente operativo: cargar las 3 vars en Vercel dashboard (scope Production + Preview + Development) antes del primer preview deploy con runtime fetch (recordatorio en Task 12.5).
- **2026-05-21**: Task 12.2 cerrada. Migrations aplicadas vía MCP y versionadas en `supabase/migrations/`. **0001_projects_schema**: tabla `public.projects` (20 columnas, snake_case), índices (`order_index where published`, `slug`), trigger `set_updated_at`, RLS habilitada con 5 policies iniciales, bucket Storage `project-images` (public) + 4 policies. **0002_harden_security**: fix de `search_path` en función trigger; policies de mutación (projects + storage) lockeadas a `auth.jwt()->>'email' = 'ggiuliano526@gmail.com'` (defensa en profundidad); drop de policy SELECT del bucket público (URLs siguen funcionando via CDN, listado deshabilitado). Security advisor post-migrations limpio en lo nuestro — solo restan 3 warnings ajenos (Auto-RLS function de Supabase + leaked password protection N/A porque usamos magic link). Pendiente operativo: pasos manuales en Auth dashboard (crear user `ggiuliano526@gmail.com` vía Invite + desactivar "Allow new users to sign up"). Usuario confirmó pasos manuales hechos + signups desactivados + Site URL/Redirect URLs configuradas (incluyendo `http://localhost:5173`).
- **2026-05-21**: Task 12.3 cerrada. Instalada dep `@supabase/supabase-js@2.106.1`. Creado `src/lib/supabase.js` (singleton del cliente con `persistSession`, `autoRefreshToken`, `detectSessionInUrl` activos; fail-fast si faltan env vars). Creado `src/lib/projects-mapper.js` con `dbToProject(row)` (devuelve TODOS los campos en camelCase — sitio público ignora los que no usa, admin los necesita) y `projectToDb(project)` (omite id/timestamps managed por Postgres). Suite `src/lib/projects-mapper.test.js`: 8 tests covering renombrado snake↔camel, passthrough de arrays, null en columnas opcionales, defaults razonables, round-trip. `pnpm lint` clean, `pnpm test:run` 109/109 passing.
- **2026-05-26**: Task 12.4 cerrada. Creado `scripts/seed-projects.js` (idempotente vía `upsert` onConflict slug, usa `SUPABASE_SERVICE_ROLE_KEY` para bypassear RLS, lee `.env` con `node --env-file=.env`). Agregado script `pnpm seed:projects` en `package.json`. Bug surfaceado al primer run: `permission denied for table projects` — las migrations 0001/0002 corrieron via MCP con rol distinto de `postgres`, así que los default privileges de Supabase no se aplicaron a `anon`/`authenticated`/`service_role`. Fix: migration 0003_grant_table_privileges aplicada via MCP + versionada en `supabase/migrations/`. GRANT explícito: `service_role` ALL, `authenticated` SELECT/INSERT/UPDATE/DELETE, `anon` SELECT (RLS sigue siendo la capa de filtrado por fila). Post-fix: 6 proyectos sembrados con `order_index 0-5` y `published=true`.
- **2026-05-26**: Task 12.5 cerrada. Creados hooks `src/hooks/useProjects.js` (lista publicada, ordenada por `order_index`) y `src/hooks/useProject.js` (single by slug, con "stale check" en render porque React 19 prohibe `setState` sincrónico en effects — derivamos `loading: true` cuando el slug actual no matchea el guardado en el state, en lugar de setearlo en el effect). Creado `src/components/sections/ProjectCardSkeleton.jsx` con `animate-pulse`. Migrados `Projects.jsx` y `ProjectDetail.jsx` a runtime fetch desde Supabase, con 4 estados (loading/error/empty/data) y aria-busy/role=alert para a11y. `src/data/projects.js` mantenido como referencia hasta Task 12.12. Tests actualizados (mock de hooks): 8 en Projects, 5 en ProjectDetail. Total: 114/114 passing.
- **2026-05-26**: Pendiente operativo de Task 12.1 cerrado: las 3 env vars Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) ya están cargadas en Vercel dashboard con scope Production + Preview. Falta scope Development (no crítico — solo afecta a `vercel env pull` para clonar setup en PC nueva). Convención del proyecto: scope Prod+Preview+Dev en todas las vars para que `vercel env pull` funcione.
- **2026-05-26**: Task 12.6 cerrada. Creados `src/lib/admin-config.js` (constante `ADMIN_EMAIL`), `src/hooks/useAuth.js` (sesión + listener `onAuthStateChange` con cleanup), `src/components/admin/AdminRoute.jsx` (gatea por sesión + email allowlisteado, doble redirect: sin sesión o email no admin → /admin/login), `src/pages/admin/Login.jsx` (form magic link con `react-hook-form` + zod, `shouldCreateUser: false`, `useReducer` para 4 estados idle/sending/sent/error), `src/pages/admin/AuthCallback.jsx` (espera SIGNED_IN del cliente Supabase con `detectSessionInUrl`, timeout 5s para evitar limbo), `src/pages/admin/Dashboard.jsx` (STUB con logout). Todo lazy-loaded fuera del Layout público — admin chunks separados (Login 4.20kB, Dashboard 1.51kB, AdminRoute 0.85kB). Tests: 4 AdminRoute (loading/sin sesión/email no admin/admin OK), 4 Login (render/validación/success/error). Total: 122/122 passing. Pasos manuales Supabase Auth confirmados por usuario: Site URL `http://localhost:5173`, Redirect URLs con `http://localhost:5173/admin/auth/callback` + `https://giulianogerlo.vercel.app/admin/auth/callback`. Para previews de Vercel queda pendiente sumar wildcard `https://giulianogerlo-*-giugerlos-projects.vercel.app/admin/auth/callback`.

---

## Context

Hoy `src/data/projects.js` se hornea en el build → cada edición requiere `git commit + push + deploy`. El objetivo de Phase 12 es desacoplar el contenido del código: poder crear/editar/borrar proyectos desde un panel `/admin` protegido, subir imágenes desde el navegador y ver los cambios en producción sin redeploy.

Es la primera vez que el usuario usa Supabase, así que el plan prioriza **claridad, paso a paso y seguridad**. El plan se ejecuta task por task con paradas para validar visualmente (mismo patrón que Phases 0-11).

---

## Decisiones de diseño (cerradas en brainstorming 2026-05-21)

| Decisión | Elegido | Por qué |
|----------|---------|---------|
| Entidades v1 | Solo `projects` | Es la más compleja; resto = futuras features |
| Imágenes | Supabase Storage | Editar sin redeploy. Tier gratis 1GB + 5GB bandwidth/mes |
| Login admin | Magic link por email | Sin password. Sesión persiste ~1 semana (mail solo al inicio o tras expirar) |
| Data fetch público | Runtime fetch | Cambios visibles al recargar. Skeleton mientras llega |
| Features admin v1 | CRUD + upload imágenes + reorder drag-drop + toggle publicado/oculto + **seguridad** | Pedido del usuario |

---

## Stack nuevo

| Paquete | Para qué | Dónde |
|---------|----------|-------|
| `@supabase/supabase-js` | Cliente Supabase (auth + db + storage) | Frontend + serverless functions |
| `@dnd-kit/core` + `@dnd-kit/sortable` | Drag-drop reorder de proyectos | Solo `/admin` (lazy-loaded) |
| `react-dropzone` | UI drag-drop para subir imágenes | Solo `/admin` |

Ya en stack y se reusan: `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, primitives `Input`/`Textarea`/`Button`/`SectionHeading`.

---

## Schema de DB (Postgres en Supabase)

Tabla única `projects`, espejo del shape actual de `src/data/projects.js` + columnas nuevas (`id`, `published`, `order_index`, timestamps).

```sql
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  category    text not null,
  role        text not null,
  my_role     text not null,
  summary     text not null,
  description text not null,
  stack       text[] not null default '{}',
  image       text,           -- URL pública de Supabase Storage o null
  gallery     text[] not null default '{}',
  live_url    text,
  repo_url    text,
  date_start  text not null,  -- 'YYYY-MM'
  date_end    text,           -- 'YYYY-MM' o null = en curso
  challenges  text[] not null default '{}',
  published   boolean not null default false,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index on public.projects (order_index) where published = true;
create index on public.projects (slug);
```

**Snake_case en DB, camelCase en JS.** Mapeo en `src/lib/projects-mapper.js` (helper `dbToProject`/`projectToDb`).

---

## Seguridad — Row Level Security (RLS)

**Modelo:** la `anon key` de Supabase es **pública por diseño** (va en el frontend). La que protege es RLS.

```sql
alter table public.projects enable row level security;

-- Lectura pública: solo proyectos publicados
create policy "public read published"
  on public.projects for select
  to anon
  using (published = true);

-- Lectura admin: ve todo (incluso drafts)
create policy "admin read all"
  on public.projects for select
  to authenticated
  using (true);

-- Write: solo authenticated (= Giuliano logueado)
create policy "admin insert" on public.projects for insert to authenticated with check (true);
create policy "admin update" on public.projects for update to authenticated using (true);
create policy "admin delete" on public.projects for delete to authenticated using (true);
```

**Allowlist de email en Auth:** Supabase Auth → Authentication → Settings → "Restrict signups to allowed emails" → solo el mail del usuario. Si un atacante intercepta el endpoint de signup, no puede crearse cuenta.

**Service role key:** se usa SOLO en serverless functions `api/*.js` y scripts (`scripts/seed-projects.js`) para operaciones admin server-side. Nunca en bundle del frontend.

---

## Supabase Storage

Bucket `project-images` (público de lectura, escritura autenticada).

```sql
-- Bucket: project-images (creado desde dashboard o MCP)
-- Public bucket = URLs accesibles sin token

-- Policies de Storage
create policy "public read images"
  on storage.objects for select
  to anon
  using (bucket_id = 'project-images');

create policy "admin upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

create policy "admin delete images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');
```

**Validación client + server:**
- Mime type debe matchear `image/(jpeg|png|webp)`.
- Max size 2 MB.
- Nombre de archivo: `${slug}-${timestamp}-${random}.${ext}` para evitar colisiones.

---

## Arquitectura de archivos

### Cliente Supabase

```
src/lib/supabase.js          # createClient(url, anonKey) singleton
src/lib/projects-mapper.js   # dbToProject / projectToDb (snake↔camel)
```

### Hook de data público

```
src/hooks/useProjects.js     # fetch publicados, ordenados por order_index
src/hooks/useProject.js      # fetch single by slug
```

Reemplaza el `import { projects }` directo en `Projects.jsx` y `ProjectDetail.jsx`. Maneja loading + error con skeleton/fallback.

### Rutas admin

```
src/pages/admin/Login.jsx        # form de magic link
src/pages/admin/AuthCallback.jsx # recibe el token del link, lo intercambia por sesión
src/pages/admin/Dashboard.jsx    # lista de proyectos + drag-drop reorder + toggle published
src/pages/admin/ProjectForm.jsx  # crear/editar (reusa el mismo componente)
```

Wrapper `src/components/admin/AdminRoute.jsx`: lee sesión de Supabase, si no hay → `<Navigate to="/admin/login" />`.

### Componentes admin

```
src/components/admin/ImageUpload.jsx       # react-dropzone + supabase.storage.upload
src/components/admin/StackEditor.jsx       # array de chips editables (add/remove)
src/components/admin/ChallengesEditor.jsx
src/components/admin/SortableList.jsx      # dnd-kit wrapper
```

### Routing

`src/App.jsx` suma:

```jsx
<Route path="/admin/login" element={<Login />} />
<Route path="/admin/auth/callback" element={<AuthCallback />} />
<Route element={<AdminRoute />}>
  <Route path="/admin" element={<Dashboard />} />
  <Route path="/admin/projects/new" element={<ProjectForm />} />
  <Route path="/admin/projects/:id" element={<ProjectForm />} />
</Route>
```

Todo bajo `/admin/*` se lazy-loadea (no entra al bundle público).

---

## Migración de data

1. Script `scripts/seed-projects.js` lee `src/data/projects.js` y hace `INSERT` en Supabase usando service role key (bypassa RLS).
2. Se corre 1 vez con `node scripts/seed-projects.js`.
3. `src/data/projects.js` se mantiene commiteado como referencia/backup hasta verificar que el sitio público lee correctamente desde DB y todo se ve igual.
4. Una vez verificado en deploy, `src/data/projects.js` se borra y se actualiza `CLAUDE.md`.

---

## Variables de entorno nuevas

```bash
# .env (gitignored) + Vercel dashboard
VITE_SUPABASE_URL=https://xxxx.supabase.co        # pública (frontend)
VITE_SUPABASE_ANON_KEY=eyJ...                     # pública (frontend, RLS protege)
SUPABASE_SERVICE_ROLE_KEY=eyJ...                  # SOLO server-side (scripts + api/)
```

`.env.example` se actualiza con placeholders.

---

## Critical files a modificar

- **Nuevos:** `src/lib/supabase.js`, `src/lib/projects-mapper.js`, `src/hooks/useProjects.js`, `src/hooks/useProject.js`, `src/pages/admin/*`, `src/components/admin/*`, `scripts/seed-projects.js`, `supabase/migrations/0001_projects.sql`.
- **Modificados:** `src/components/sections/Projects.jsx` (usa hook), `src/pages/ProjectDetail.jsx` (usa hook), `src/App.jsx` (rutas admin), `.env.example`, `CLAUDE.md`, `package.json`.
- **Eventualmente borrado:** `src/data/projects.js` (después de verificar migración).

---

## Plan de implementación (tasks de alto nivel)

Cada task = 1 dispatch de subagent + parada para que el usuario teste y commitee.

**Mantenimiento del log:** después de cada task cerrada, agregar entrada al "Log de cambios" arriba.

### Task 12.0 — Documentar el plan en el repo ✅ (2026-05-21)

- [x] Crear `docs/plans/2026-05-21-phase-12-supabase.md` con copia fiel del plan.
- [x] Sección "Log de cambios" inicializada.
- [x] Referencia agregada en `CLAUDE.md` → "Source of truth for the project".
- [ ] Usuario commitea y pushea a `master`.

### Task 12.1 — Setup Supabase ✅ (2026-05-21)

- [x] Usuario: crear proyecto en supabase.com (free tier), elegir región `South America (São Paulo)`.
- [x] Reiniciar Claude Code para que cargue MCP de Supabase (`mcp__supabase__*` tools).
- [x] Cargar env vars en `.env`.
- [ ] Cargar env vars en Vercel dashboard (Production + Preview + Development). **Pendiente — recordatorio en Task 12.5.**

### Task 12.2 — Schema + RLS + Storage (via MCP) ✅ (2026-05-21)

- [x] Migration `0001_projects_schema` aplicada via MCP + versionada en `supabase/migrations/0001_projects_schema.sql`.
- [x] Migration `0002_harden_security` aplicada via MCP + versionada en `supabase/migrations/0002_harden_security.sql` (search_path fix + email lock en policies + drop bucket listing).
- [x] Bucket `project-images` (public) creado.
- [x] Security advisor verificado: 0 warnings relevantes (Auto-RLS function de Supabase + leaked-password N/A magic link).
- [ ] **Pendiente manual del usuario en Supabase Dashboard:**
  - Authentication → Users → "Add user" → "Send invite" a `ggiuliano526@gmail.com`.
  - Authentication → Sign In / Providers → Email → desactivar "Allow new users to sign up".

### Task 12.3 — Cliente Supabase + mapper ✅ (2026-05-21)

- [x] `@supabase/supabase-js@2.106.1` instalada.
- [x] `src/lib/supabase.js` (singleton).
- [x] `src/lib/projects-mapper.js` (`dbToProject` + `projectToDb`).
- [x] `src/lib/projects-mapper.test.js` (8 tests, passing).
- [x] `pnpm lint` + `pnpm test:run` OK.

### Task 12.4 — Seed inicial ✅ (2026-05-26)

- [x] `scripts/seed-projects.js` migra `src/data/projects.js` → DB.
- [x] Verificar en MCP/dashboard que entraron los 6 proyectos.
- [x] Marcar todos `published=true` (orden = índice del array).
- [x] Migration 0003: GRANT privileges para los 3 roles managed (bug surfaceado al primer run).

### Task 12.5 — Hooks públicos + switch del sitio ✅ (2026-05-26)

- [x] `useProjects` + `useProject` con loading/error.
- [x] Skeleton component para cards mientras carga.
- [x] `Projects.jsx` y `ProjectDetail.jsx` migran al hook.
- [x] Verificar visualmente: home + detalle se ven idénticos a hoy.

### Task 12.6 — Auth + AdminRoute ✅ (2026-05-26)

- [x] `Login.jsx` (form magic link) + `AuthCallback.jsx` + `AdminRoute.jsx` wrapper.
- [x] Rutas en `App.jsx` (todas lazy, fuera del Layout público).
- [x] Test: link a `/admin` sin sesión → redirect a `/admin/login`. Click link del mail → adentro.
- [x] Dashboard STUB (placeholder hasta Task 12.7).

### Task 12.7 — Dashboard (list + toggle publicado + drag-drop reorder)

- Lista de proyectos con thumbnail, título, estado (published/draft).
- Toggle published inline.
- Drag-drop con `@dnd-kit` → actualiza `order_index` en batch.

### Task 12.8 — ProjectForm (crear/editar)

- Form con todos los campos. Validación zod.
- Editores custom para arrays (`stack`, `challenges`).
- ImageUpload para `image` (cover) y `gallery`.
- Slug autogenerado del título pero editable.
- Botón delete con confirm.

### Task 12.9 — Image upload + Storage

- `ImageUpload.jsx` con react-dropzone.
- Validación mime + size client.
- Subir a `project-images` bucket.
- Guardar URL pública en el campo correspondiente.
- Borrar imagen del bucket al desasociarla del proyecto (cleanup).

### Task 12.10 — Hardening de seguridad

- Verificar RLS con curl/Postman: anon NO puede insertar/update/delete.
- Verificar que anon solo ve `published=true`.
- Auditoría: revisar que `SUPABASE_SERVICE_ROLE_KEY` no esté en bundle (`pnpm build && grep -r "service_role" dist/`).
- CSP/headers: confirmar que Supabase domain no rompe nada.

### Task 12.11 — Deploy + verificación

- Push a `master`, Vercel auto-deploy.
- Login en `/admin` desde producción.
- Crear proyecto de prueba, subir imagen, publicar, ver en home.
- Borrar el de prueba.

### Task 12.12 — Cleanup

- Borrar `src/data/projects.js` (después de 1 semana en prod sin issues).
- Actualizar `CLAUDE.md` (nuevo source of truth = Supabase) y `docs/dependencias.md`.
- Actualizar el plan principal (`docs/plans/2026-05-13-portfolio-implementation-plan.md`) cerrando Phase 12.1 (Projects). Las otras entidades quedan como Phase 12.2/12.3/12.4 futuras.

---

## Verificación end-to-end

Después de Task 12.11, correr este flow manual en producción:

1. **Lectura pública**: visitar `/` sin login → ver los 6 proyectos. Visitar `/proyectos/<slug>` → detalle correcto.
2. **Auth**: visitar `/admin` sin sesión → redirect a `/admin/login`. Ingresar email permitido → llega mail → click → entra al dashboard.
3. **Auth negativo**: pedir magic link a un email no allowlisteado → Supabase rechaza (no llega mail / error).
4. **CRUD**: crear proyecto draft, verificar que NO aparece en `/`. Marcar published → aparece. Editar título → recargar `/` → cambio visible. Borrar → ya no aparece.
5. **Storage**: subir imagen >2MB → rechazado. Subir PNG válido → URL en el form. Borrar proyecto → imagen del bucket también borrada (manual o trigger).
6. **Reorder**: drag-drop 2 proyectos en dashboard → recargar `/` → orden nuevo respetado.
7. **RLS**: desde DevTools con anon key intentar `INSERT` en projects → Supabase devuelve `permission denied`.
8. **Bundle audit**: `pnpm build && grep -r "service_role" dist/` → cero matches.
9. **Tests**: `pnpm test:run` sigue passing. `pnpm lint` sin errores. `pnpm build` OK.

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| RLS mal configurada → data leak o admin bloqueado | Tests explícitos con anon vs authenticated antes de deploy. Task 12.10 es bloqueante. |
| Service role key filtrada en bundle | Grep en `dist/` antes de cada deploy. Nunca importar en archivos `src/*`. |
| Free tier de Supabase se queda corto | 500MB DB + 1GB storage + 50k MAU es de sobra para un portfolio. Monitorear desde dashboard. Si pasa, downgrade a SSG (Task futura). |
| Magic link no llega (spam folder) | Configurar SMTP custom en Supabase Auth (gratis con Resend, que ya está en stack). Documentar en `TODO-USUARIO.md`. |
| Bundle del admin se mete en chunk público | Lazy-load todo `/admin/*` con `React.lazy()`. Verificar con `vite-bundle-visualizer`. |
| Drag-drop en mobile inutilizable | `@dnd-kit` soporta touch out-of-the-box. Verificar en device real Task 12.7. |

---

## Definition of Done — Phase 12 (Projects)

- [ ] Supabase project creado, schema aplicado, RLS activa
- [ ] 6 proyectos seedeados, sitio público lee desde DB
- [ ] `/admin` protegido, magic link funciona
- [ ] CRUD completo desde el admin
- [ ] Upload de imágenes a Storage
- [ ] Drag-drop reorder
- [ ] Toggle published/draft
- [ ] Tests + lint + build OK
- [ ] Bundle audit sin service role key
- [ ] Verificado end-to-end en producción
- [ ] `src/data/projects.js` borrado
- [ ] `CLAUDE.md` y plan principal actualizados
