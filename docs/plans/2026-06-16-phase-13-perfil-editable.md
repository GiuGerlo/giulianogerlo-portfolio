# Phase 13 — Sección "Perfil" editable desde /admin (foto + texto + chips del About)

> **Fecha:** 2026-06-16
> **Estado Phase 12:** CERRADA y en producción (master). Esta es una phase NUEVA.
> **Mensaje de arranque próxima sesión (pegar tal cual):**
> *"Arrancá Phase 13 según `docs/plans/2026-06-16-phase-13-perfil-editable.md`. Empezá por la Task 1 (la Task 0 ya está hecha: este plan está en el repo) y seguí task por task con el workflow de siempre (parada después de cada task para que yo testee y commitee)."*

---

## Log de cambios

<!-- Una línea por task cerrada o desvío. Mantener sincronizado entre PCs vía git. -->

- **2026-06-16**: Plan creado y persistido en el repo (Task 0). Puntero agregado en `CLAUDE.md`. Pendiente: arrancar Task 1 (migration `0004_profile_schema`).

---

## Context

Hoy la sección **"Sobre mí"** (`src/components/sections/About.jsx`) tiene TODO hardcodeado en el JSX: la foto (`/foto-giulianogerlo.webp|jpg` en `public/`), los 2 párrafos de bio (con palabras en **negrita**) y los 4 chips (Disponible / Rosario / Español / Cursando React Cert). Cambiar cualquier cosa hoy = editar código + commit + deploy.

Phase 12 ya dejó armado el patrón completo para contenido dinámico vía Supabase (tabla + RLS + Storage + hooks + `ImageUpload`). Phase 13 **replica ese patrón** para hacer el About 100% editable desde `/admin`, sin tocar código. Es la segunda entidad dinámica del portfolio (la primera fueron projects).

`src/data/bio.js` NO entra acá: solo alimenta el chatbot (`api/chat.js`), no la UI. Se deja como está.

---

## Decisiones de diseño (cerradas con el owner)

| Decisión | Elegido | Por qué |
|----------|---------|---------|
| Alcance | Foto + 2 párrafos + 4 chips | Pedido del owner: About 100% editable |
| Forma de la tabla | **Single-row** `profile` con columnas explícitas (no key-value) | Simple para principiante; matchea exacto los campos actuales |
| Texto de párrafos | **Markdown** renderizado con `react-markdown` (ya en stack, lo usa `Chat.jsx`) | Preserva las negritas actuales sin HTML/XSS. Admin escribe `**negrita**` |
| Chips | 4 campos fijos (cada uno mapea a su ícono lucide en código). Chip vacío = oculto | Los íconos quedan en código (no se pueden "subir"); 4 campos = los 4 actuales. Chips arbitrarios = futuro |
| Imagen | Reusar bucket `project-images` + `storage.js` + `ImageUpload` | Cero migration de Storage nueva. `uploadImage(file, 'about')` |
| Fallback | Si DB falla/vacía → contenido hardcodeado actual | El About nunca se ve roto |

---

## Schema — tabla `public.profile` (single row, id=1)

```sql
create table public.profile (
  id              int primary key default 1,
  about_image     text,                      -- URL Storage o null (fallback a /foto-giulianogerlo.*)
  about_p1        text not null default '',   -- párrafo 1 (markdown)
  about_p2        text not null default '',   -- párrafo 2 (markdown)
  chip_available  text not null default '',   -- "Disponible para proyectos" (variant dot)
  chip_location   text not null default '',   -- "Rosario, AR" (MapPin)
  chip_language   text not null default '',   -- "Español" (Languages)
  chip_education  text not null default '',   -- "Cursando React Cert · DigitalHouse" (GraduationCap)
  updated_at      timestamptz not null default now(),
  constraint profile_single_row check (id = 1)
);
```

**RLS** (espeja `projects`, ver `supabase/migrations/0002_harden_security.sql`):
- anon SELECT: `using (true)` — fila pública, siempre legible (no hay concepto "published").
- authenticated UPDATE (y INSERT para el seed inicial) lockeado a `auth.jwt() ->> 'email' = 'ggiuliano526@gmail.com'`.
- Trigger `set_updated_at` reusado (ya existe, `search_path=''`).
- GRANTs: `anon` SELECT, `authenticated` SELECT/UPDATE, `service_role` ALL (mirror de `0003_grant_table_privileges.sql`).

**Seed:** la migration inserta la fila id=1 con los valores ACTUALES exactos del JSX (los 2 párrafos en markdown con `**...**`, los 4 chips). Así el About se ve idéntico apenas se aplica.

---

## Tasks (1 dispatch + parada para test/commit por task)

### Task 0 — Persistir el plan en el repo ✅ (2026-06-16)
- [x] Crear `docs/plans/2026-06-16-phase-13-perfil-editable.md`.
- [x] Puntero en `CLAUDE.md` → "Source of truth" + "Log de cambios" inicializado.

### Task 1 — Migration `0004_profile_schema` (via MCP Supabase)
- Aplicar via `mcp__supabase__apply_migration` + versionar en `supabase/migrations/0004_profile_schema.sql`.
- Tabla + RLS + GRANTs + trigger + seed (valores actuales). Project id Supabase: `yyvchycnqhkzjuggbbtp`.
- Verificar con `get_advisors` (security) que no agrega warnings nuevos.

### Task 2 — Mapper + hook público
- `src/lib/profile-mapper.js`: `dbToProfile(row)` / `profileToDb(obj)` (snake↔camel). Espejo de `src/lib/projects-mapper.js`. + test `profile-mapper.test.js`.
- `src/hooks/useProfile.js`: fetch fila id=1, devuelve `{ data, loading, error }`. Espejo de `src/hooks/useProjects.js` (sin filtro published, `.eq('id', 1).single()`).

### Task 3 — Migrar `About.jsx` a runtime fetch
- `About.jsx` usa `useProfile()`. Render:
  - Foto: `aboutImage` presente → `<img src={aboutImage}>`; null → `<picture>` estático actual.
  - Párrafos: render markdown con `react-markdown` (ver uso en `src/components/ui/Chat.jsx`); fallback a texto hardcodeado si vacío.
  - Chips: cada campo no-vacío con su ícono (available=variant dot, location=MapPin, language=Languages, education=GraduationCap). Reusar `src/components/ui/Chip.jsx`.
- Degradación elegante: error/loading → mostrar contenido hardcodeado (no romper el About).
- Actualizar test de About si existe.

### Task 4 — Página admin `/admin/perfil` + nav
- `src/hooks/useAdminProfile.js`: fetch fila id=1 para el form (espejo de `useAdminProject.js`).
- `src/pages/admin/Profile.jsx`: `react-hook-form` + `zod`. Campos:
  - `ImageUpload` single (slug `'about'`) — reusa `src/components/admin/ImageUpload.jsx`.
  - 2 `Textarea` (about_p1/p2) con hint "podés usar **negrita** con `**texto**`".
  - 4 `Input` (los chips).
  - Botón guardar → `supabase.from('profile').update(profileToDb(values)).eq('id', 1)`. Al reemplazar foto, `removeImage(urlVieja)` (cleanup, ya existe en `storage.js`).
  - Reusar primitives `Input`/`Textarea`/`Button`/`SectionHeading`.
- Ruta lazy `/admin/perfil` en `src/App.jsx` (dentro de `<AdminRoute>` → `<AdminLayout>`, mismo patrón que `/admin/projects/*`).
- Nav admin: `src/components/admin/AdminLayout.jsx` hoy es solo topbar sin nav interna. Sumar links "Proyectos" (`/admin`) + "Perfil" (`/admin/perfil`) en la topbar para navegar entre secciones.
- Test de la página (mirror de `Login.test.jsx` / `Dashboard.test.jsx`).

### Task 5 — Verificación + cierre
- `pnpm lint` + `pnpm test:run` + `pnpm build` OK.
- Verificación end-to-end (abajo).
- Cerrar log del plan.

---

## Archivos

**Nuevos:** `supabase/migrations/0004_profile_schema.sql`, `src/lib/profile-mapper.js` (+test), `src/hooks/useProfile.js`, `src/hooks/useAdminProfile.js`, `src/pages/admin/Profile.jsx`, `docs/plans/2026-06-16-phase-13-perfil-editable.md`.
**Modificados:** `src/components/sections/About.jsx`, `src/components/admin/AdminLayout.jsx`, `src/App.jsx`, `CLAUDE.md`.
**Sin tocar:** `src/data/bio.js` (es del chatbot), `vercel.json` (CSP ya cubre el dominio Supabase para la foto).

**Reusos clave (NO reescribir):** `src/lib/supabase.js`, `src/lib/storage.js` (`uploadImage`/`removeImage`), `src/components/admin/ImageUpload.jsx`, `src/components/ui/Chip.jsx`, `src/components/ui/Reveal.jsx`, patrón de `src/hooks/useProjects.js` + `src/hooks/useAdminProject.js`, patrón RLS de `0002`/`0003`.

---

## Verificación end-to-end

1. **Migration:** `mcp__supabase__execute_sql` → `select * from profile;` devuelve 1 fila con los valores actuales.
2. **Público idéntico:** `pnpm dev` → home `/#about` se ve igual que antes (foto, párrafos con negritas, 4 chips).
3. **Admin:** login `/admin` → ir a `/admin/perfil` → cambiar un párrafo, un chip y subir una foto nueva → guardar → recargar `/` → cambios visibles sin redeploy.
4. **Foto >2MB** rechazada por `ImageUpload` (validación ya existe en `storage.js`).
5. **Fallback:** simular DB vacía / error de red → el About muestra el contenido hardcodeado, no se rompe.
6. **RLS:** anon puede SELECT la fila; INSERT/UPDATE anon → `permission denied` (mismo test curl que Task 12.10).
7. `pnpm test:run` + `pnpm lint` + `pnpm build` OK.

---

## MCPs disponibles para esta phase

- **Supabase MCP** (`mcp__supabase__*`): `apply_migration` + `execute_sql` para Task 1 (project id `yyvchycnqhkzjuggbbtp`), `get_advisors type=security` post-migration, `list_tables` para verificar. NO escribir SQL a mano en el dashboard — todo via MCP + versionado en `supabase/migrations/`.
- **Vercel MCP** (`mcp__plugin_vercel_vercel__*`): tras el deploy, `get_deployment` / `get_runtime_logs` para confirmar que la build pasó y no hay errores de runtime en `/admin/perfil`.

## Notas

- **Markdown seguro:** `react-markdown` no renderiza HTML crudo por default (sin `rehype-raw`) → no hay XSS aunque el único escritor es el admin.
- **Owner principiante React:** explicar en chat al introducir `react-markdown` para render de contenido y el patrón single-row + `.single()`.
- **Idea futura (no ahora):** chips arbitrarios con selector de ícono; hacer editable también `bio.js` del chatbot; sumar más secciones (experience/skills/education) con el mismo patrón.
