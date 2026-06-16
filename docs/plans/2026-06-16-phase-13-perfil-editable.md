# Phase 13 — Sección "Perfil" editable desde /admin (foto + texto + chips del About)

> **Fecha:** 2026-06-16
> **Estado Phase 12:** CERRADA y en producción (master). Esta es una phase NUEVA.
> **Mensaje de arranque próxima sesión (pegar tal cual):**
> *"Arrancá Phase 13 según `docs/plans/2026-06-16-phase-13-perfil-editable.md`. Empezá por la Task 1 (la Task 0 ya está hecha: este plan está en el repo) y seguí task por task con el workflow de siempre (parada después de cada task para que yo testee y commitee)."*

---

## Log de cambios

<!-- Una línea por task cerrada o desvío. Mantener sincronizado entre PCs vía git. -->

- **2026-06-16**: Plan creado y persistido en el repo (Task 0). Puntero agregado en `CLAUDE.md`. Pendiente: arrancar Task 1 (migration `0004_profile_schema`).
- **2026-06-16**: Task 1 cerrada. Migration `0004_profile_schema` aplicada via MCP (project `yyvchycnqhkzjuggbbtp`) + copia versionada en `supabase/migrations/0004_profile_schema.sql`. Tabla `public.profile` single-row (id=1, check), RLS (anon SELECT, authenticated SELECT/INSERT/UPDATE lockeado al email), GRANTs por rol, trigger `set_updated_at` reusado, seed con valores actuales del JSX. Verificado: `select * from profile` → 1 fila; `get_advisors security` sin warnings nuevos (3 WARN pre-existentes ajenos a profile); `list_tables` muestra las 9 columnas. Next: Task 2 (mapper + hook `useProfile`).
- **2026-06-16**: Task 2 cerrada. `src/lib/profile-mapper.js` (`dbToProfile`/`profileToDb`, espejo de projects-mapper) + `profile-mapper.test.js` (6 tests, incluye round-trip) + `src/hooks/useProfile.js` (fetch fila id=1 con `.eq('id',1).single()`, shape `{data,loading,error}`). `pnpm test:run` del mapper 6/6 OK + `pnpm lint` limpio. Next: Task 3 (migrar `About.jsx` a runtime fetch con fallback hardcodeado).
- **2026-06-16**: Brainstorming de 3 mejoras al form `/admin/perfil` (preview cuadrado, WebP en upload, editor WYSIWYG TipTap). Aprobado por el owner → agregadas como Tasks 6-8.
- **2026-06-16**: Task 6 cerrada. Prop `previewAspect` (`'video'` default | `'square'`) en `ImageUpload.jsx`, threaded a `Thumb`/`SortableThumb` (img + placeholder usan `aspect-square` cuando corresponde). `Profile.jsx` pasa `previewAspect="square"` → preview matchea el About. Proyectos sin cambios (default video). Lint + Profile tests OK.
- **2026-06-16**: Task 7 cerrada. `fileToWebp(file, {maxWidth=1600, quality=0.82})` en `storage.js` (canvas API nativa, guard `getContext('2d')` null → fallback al original sin colgar/tirar). `uploadImage(file, slug, opts)` convierte tras validar; nombre por el type del archivo final. `ImageUpload` prop `uploadOpts` → `Profile` pasa `{maxWidth:800}`. `storage.test.js` +1 test (fallback). 10/10 + lint OK. Aplica a TODOS los uploads (perfil + proyectos).
- **2026-06-16**: Task 8 cerrada. Editor WYSIWYG TipTap v3. Deps: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`, `@tiptap/extension-link`, `@tiptap/markdown` (oficial v3 — NO el comunitario `tiptap-markdown` que es v2). `RichTextEditor.jsx`: controlado en markdown (`getMarkdown`/`setContent contentType:'markdown'`), StarterKit solo-inline (negrita/itálica, sin bloques), toolbar + link via prompt. `Profile.jsx`: las 2 textareas → `Controller`+`RichTextEditor`. `About.jsx`: wrapper párrafos suma `[&_em]`/`[&_a]`. Tests: `RichTextEditor.test.jsx` (smoke, TipTap monta en jsdom) + `Profile.test.jsx` mockea RichTextEditor (textarea stand-in). 172/172 + lint + build OK. Bundle: chunk `Profile` lazy 485kB/151kB gz (TipTap) — público intacto. Deps documentadas en `docs/dependencias.md`.
- **2026-06-16**: Continuación de Phase 13 aprobada (Tasks 9-18): TODO el sitio editable. Plan + decisiones cerradas (site_settings singleton, CRUD inline, icon picker curado, bucket documents).
- **2026-06-16**: Task 9 cerrada. Migration `0005_site_settings` aplicada vía MCP + versionada. Tabla singleton id=1 (hero_name/tagline/location, footer_tagline, cv_url, social_*), RLS/grants/trigger mirror de 0004, seed con valores actuales de Hero/Footer/socials. Verificado: fila id=1 OK; `get_advisors` sin warnings nuevos. Next: Task 10 (migration 0006 listas).
- **2026-06-16**: Task 10 cerrada. Migration `0006_content_lists` aplicada vía MCP + versionada. 4 tablas (`skill_groups`, `ai_skills`, `experience`, `education`) con `order_index`, RLS/grants/trigger (loop `do $$` para no repetir el bloque 4x, incluye DELETE policy), seed desde `data/*.js`. Verificado: counts 5/6/6/4; `get_advisors` sin warnings nuevos. Next: Task 11 (migration 0007 bucket documents + storage.js).
- **2026-06-16**: Task 11 cerrada. Migration `0007_documents_bucket` (bucket público + policies admin por email, mirror project-images) aplicada + versionada. `storage.js` generalizado: `DOCUMENTS_BUCKET`/`DOCUMENT_ACCEPTED_MIME` (img+pdf)/`MAX_DOC_SIZE_BYTES` (8MB), `uploadDocument` (sin webp), `pathFromPublicUrl` detecta bucket → `removeFile` genérico, `removeImage` = alias de `removeFile` (back-compat ImageUpload). `DocumentUpload.jsx` (single, PDF/imagen, link "Ver" + reemplazo). `storage.test.js` +7 tests (uploadDocument + removeFile multi-bucket) → 17/17. Lint OK. Bucket verificado. Next: Task 12 (capa de datos: mappers + hooks + useAdminList + skill-icons + IconPicker).
- **2026-06-16**: Task 12 cerrada. Capa de datos completa. Mappers: `site-settings`/`skill-groups`/`ai-skills`/`experience`/`education` (+`content-mappers.test.js`, 7 tests). Hooks públicos: `useSiteSettings` (singleton) + `usePublicList` genérico con wrappers `useSkillGroups`/`useAiSkills`/`useExperience`/`useEducation`. `useAdminList(table,{dbTo,toDb})` genérico (CRUD + `move` por swap de order_index, refetch tras mutación). `skill-icons.js` (26 íconos lucide curados) + `IconPicker.jsx`. Suite 186/186 + lint OK. Next: Task 13 (Hero+Footer+redes → site_settings + /admin/sitio).
- **2026-06-16**: Task 6.1 (ajuste post-uso) — preview `square` capado a `max-w-[280px]` en `ImageUpload` (sino una foto 3000x3000 llenaba la columna del form). Lint OK.
- **2026-06-16**: Task 5 cerrada → **PHASE 13 CERRADA**. Verificación end-to-end OK: fila profile presente; público idéntico + admin editable (confirmado por el owner en navegador); RLS verificada vía SQL (`set local role anon`: SELECT count=1 ✓, INSERT → `permission denied for table profile` ✓); `pnpm test:run` 172/172 + `pnpm lint` + `pnpm build` OK. Foto >2MB rechazada por validación existente; fallback hardcodeado cubierto por tests de About. About 100% editable desde `/admin/perfil` sin redeploy.
- **2026-06-16**: Task 4 cerrada. Página admin `/admin/perfil` (`src/pages/admin/Profile.jsx`, RHF+zod, `ImageUpload` single slug `'about'`, 2 Textarea con hint markdown, 4 Input chips, submit → `update(profileToDb).eq('id',1)`). Ruta lazy en `App.jsx`. Nav en `AdminLayout.jsx`: links NavLink "Proyectos"/"Perfil" (reemplazan el span `// admin`). `Profile.test.jsx` (4 tests: loading/error/populate/submit). Full suite 170/170 + lint + build OK. **DESVÍO**: el plan pedía crear `useAdminProfile.js` espejo de `useAdminProject.js`; se reusó `useProfile` en su lugar — la fila profile es pública e idéntica para anon/authenticated (RLS `using(true)` ambos, sin drafts ni filtro published), así que un segundo hook sería duplicado muerto. Archivo `useAdminProfile.js` NO creado. Next: Task 5 (verificación end-to-end + cierre).
- **2026-06-16**: Task 3 cerrada. `About.jsx` migrado a `useProfile()` runtime fetch con degradación elegante: const `FALLBACK` (= seed) cubre loading/error/null; fila OK usa DB y respeta campos vacíos (chip vacío oculto). Párrafos con `react-markdown` (`[&_strong]` para negritas), foto = `aboutImage` o `<picture>` estático. `About.test.jsx` reescrito mockeando `useProfile` (7 tests: fallback + DB-driven + chip vacío + img URL). Tests 7/7 + lint OK. Next: Task 4 (página admin `/admin/perfil` + nav).

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

## Tasks de mejora (brainstorming 2026-06-16, aprobadas por el owner)

> 3 mejoras al form `/admin/perfil` surgidas del primer uso. Independientes entre sí,
> cada una con parada para test/commit. NO tocan schema/migration/mapper/hook ni el
> render público base (sigue react-markdown).

### Task 6 — Preview de foto cuadrado en `ImageUpload`
- `src/components/admin/ImageUpload.jsx`: prop nueva `previewAspect` (`'video'` default | `'square'`). El `<Thumb>` usa `aspect-square` cuando corresponde (matchea el `aspect-square object-cover` del About público). Default `'video'` → proyectos NO cambian.
- `src/pages/admin/Profile.jsx`: pasar `previewAspect="square"` al `ImageUpload`.
- Sin tests nuevos (cambio visual). Verificar en `/admin/perfil` que la preview se ve como el About.

### Task 7 — Conversión a WebP + resize en todos los uploads del admin
- `src/lib/storage.js`: función nueva `fileToWebp(file, { maxWidth = 1600, quality = 0.82 })` con **canvas API nativa** (sin deps): `Image` → `<canvas>` redimensionado → `canvas.toBlob('image/webp', quality)`. Devuelve un `File`/`Blob` `.webp`.
  - `uploadImage(file, slug, opts)` la llama antes de subir; nombre final siempre `.webp` (ajustar `buildFileName`/`extFromMime` para forzar webp).
  - **Fallback robusto:** si canvas/`toBlob` falla o no soporta webp → sube el archivo crudo (no rompe el upload). Mantiene la validación mime+tamaño existente sobre el archivo ORIGINAL.
  - Descarta EXIF (privacidad) y achica fotos pesadas de celular.
- `src/pages/admin/Profile.jsx`: pasa `maxWidth: 800` (la foto se ve a 280px). Proyectos usan el default 1600.
- Test: `storage.test.js` — sumar caso de `fileToWebp` (mock canvas/`toBlob`) + que `uploadImage` cae a crudo si la conversión falla.

### Task 8 — Editor WYSIWYG (TipTap) para los párrafos del About
- Deps (pnpm): `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`, `tiptap-markdown`.
- `src/components/admin/RichTextEditor.jsx` (nuevo): editor controlado (`value`/`onChange` en **markdown** via `tiptap-markdown`), encaja con `Controller` igual que `ImageUpload`.
  - Toolbar: Negrita, Itálica, Link (botones lucide). StarterKit configurado para **solo inline** — sin headings/listas/blockquote (romperían el layout del About).
  - Estilo del área editable consistente con `Textarea` (border, focus accent, min-h).
- `src/pages/admin/Profile.jsx`: reemplazar las 2 `<Textarea>` (about_p1/p2) por `<Controller>` + `<RichTextEditor>`. El hint "podés usar **negrita**" se saca (ahora es visual).
- `src/components/sections/About.jsx`: sumar `[&_em]` (itálica) y `[&_a]:text-accent [&_a]:underline` (links) al wrapper de los párrafos.
- Test: `RichTextEditor` mínimo (render + que onChange emite markdown). Actualizar `Profile.test.jsx` (el query de los párrafos cambia de `<textarea>` a contenteditable).

---

## Tasks de continuación — TODO el sitio editable (aprobado 2026-06-16)

> El owner pidió que toda la info de la web sea editable con CRUD (Hero, Stack Técnico,
> AI Integration, Experiencia, Educación+certs, CV, Footer/redes). Decisiones cerradas:
> tabla singleton `site_settings` (no extender profile); CRUD inline (1 página por
> entidad, reorder con botones ↑/↓); selector curado de íconos lucide; bucket `documents`
> (PDF+imágenes). Render público sin cambios visuales (fallback como About). Detalle
> completo en el plan de trabajo de la sesión.

- **Task 9 — Migration 0005 `site_settings`** (singleton: Hero/Footer/CV/redes). ✅
- **Task 10 — Migration 0006 listas**: `skill_groups`, `ai_skills`, `experience`, `education` (con `order_index`) + seed desde `data/*.js`. ✅
- **Task 11 — Migration 0007 bucket `documents`** + `storage.js` (`uploadDocument`/`removeFile` con detección de bucket) + `DocumentUpload`. ✅
- **Task 12 — Capa de datos**: 5 mappers (+tests) + hooks públicos + `useAdminList` genérico + `skill-icons.js` + `IconPicker.jsx`. ✅
- **Task 13 — Hero + Footer + redes** → `useSiteSettings` con fallback + página `/admin/sitio` (incluye CV upload).
- **Task 14 — Stack Técnico** → `Skills.jsx` runtime + `/admin/skills` (CRUD inline + IconPicker + ChipsEditor).
- **Task 15 — AI Integration** → `AISection.jsx` runtime + `/admin/ai`.
- **Task 16 — Experiencia** → `Experience.jsx` runtime + `/admin/experiencia` (`project_slug` dropdown).
- **Task 17 — Educación + certificados** → `Education.jsx` runtime + `/admin/educacion` (DocumentUpload del cert).
- **Task 18 — Verificación + cierre**: lint/test/build, RLS anon por tabla, recorrido completo, limpiar `data/*.js` sin consumidores.

---

## Archivos

**Nuevos:** `supabase/migrations/0004_profile_schema.sql`, `src/lib/profile-mapper.js` (+test), `src/hooks/useProfile.js`, `src/pages/admin/Profile.jsx` (+test), `src/components/admin/RichTextEditor.jsx` (Task 8), `docs/plans/2026-06-16-phase-13-perfil-editable.md`.
**Modificados:** `src/components/sections/About.jsx`, `src/components/admin/AdminLayout.jsx`, `src/App.jsx`, `src/lib/storage.js` (Task 7), `src/components/admin/ImageUpload.jsx` (Task 6), `CLAUDE.md`.
**NO creado (desvío Task 4):** `src/hooks/useAdminProfile.js` — se reusó `useProfile` (fila pública, sin drafts).
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
