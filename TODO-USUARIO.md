# TODO Usuario — Cosas que Giuliano tiene que hacer

Lista viva de todo lo que **Giuliano** tiene que hacer fuera del código (crear cuentas, conseguir assets, configurar servicios). Se va completando durante el desarrollo.

> Marcá con `[x]` cuando lo hagas.

---

## 📸 Assets gráficos

- [x] Foto profesional (`public/foto-giulianogerlo.webp`)
- [x] Screenshot proyecto: Inmobiliaria NZ (4 imágenes)
- [x] Screenshot proyecto: CloverTecno (4 imágenes)
- [x] Screenshot proyecto: Ecosistema RAMCC (4 imágenes)
- [x] Screenshot proyecto: Next — Tienda de Ropa (4 imágenes, datos ficticios)
- [x] Screenshot proyecto: Personal Gym Tracker (3 imágenes)
- [ ] Screenshot proyecto: Gestor de Finanzas (pendiente — único proyecto con `image: null`)
- [x] Logo/favicon personal
- [x] CV en PDF en `public/cv.pdf` + card "Descargar PDF" en la sección Contact (al final, debajo de GitHub).
- [x] **OG image** — `public/og-image.png` (1200x630). Imagen de preview al compartir el link.
- [ ] **OG image v2 (opcional)** — rediseñarla con el contenido (nombre, logo, rol) CENTRADO en la zona segura (cuadrado central ~630x630). WhatsApp recorta la imagen a un cuadrado en su preview compacto y corta lo que está en los bordes.

## 🏅 Certificados y títulos (PDFs)

Carpeta lista: `public/certs/`. Droppealos con estos nombres exactos para que el código los encuentre solo (el path queda servido en `https://giulianogerlo.vercel.app/certs/<nombre>.pdf`):

- [~] Brigadier López — Giuliano decidió NO subir certificado (no existe imagen clara del título, solo el listado de materias). El item queda en `education.js` sin link.
- [x] `public/certs/coderhouse-web.pdf` — CoderHouse · Desarrollo Web (ene-mar 2024)
- [x] `public/certs/coderhouse-js.pdf` — CoderHouse · JavaScript (ago-oct 2024)
- [ ] `public/certs/digitalhouse-react.pdf` — DigitalHouse · React Developer (cuando termine jun 2026)

Una vez que dropees el archivo, actualizá el campo `certUrl` del item correspondiente en [src/data/education.js](src/data/education.js):

```js
certUrl: '/certs/brigadier-lopez.pdf',  // antes era null
```

Si alguno no lo tenés en PDF y solo tenés URL externa (ej. CoderHouse a veces da link público), pegá la URL completa en `certUrl` directamente.

## 🔗 URLs reales

- [x] URL live: Inmobiliaria NZ (`https://nz-estudiojuridicoinmobiliario.com/`)
- [x] URL live: CloverTecno (`https://clovertecno.com/`)
- [x] URL live: RAMCC (`https://ramcc.net/`)
- [x] URL live: Personal Gym Tracker
- [x] URL repo: Next — Tienda de Ropa (`https://github.com/GiuGerlo/Next-Tienda`)
- [ ] URL repo: Gestor de Finanzas (si lo querés público)

> Notas:
> - **Next-Tienda** es un admin privado: `liveUrl: null` a propósito.
> - **ALPA, CenArb, Aula Virtual y Mi-Huella** quedaron unificados como subsistemas del proyecto `ramcc` (Ecosistema RAMCC), no son cards separadas.

## 🌐 Cuentas y servicios

### 1. Cuenta Vercel (hosting)
- [x] Cuenta creada, proyecto linkeado (`vercel dev` corriendo OK)
- [x] Proyecto renombrado a `giulianogerlo` → dominio `giulianogerlo.vercel.app`

### 2. Cuenta Resend (envío de emails del form)
- [x] Cuenta creada, API key generada y pasada
- [ ] **Verificar dominio propio en Resend** — mientras tanto el `from` usa `onboarding@resend.dev` (modo prueba: solo manda al email de TU cuenta Resend). Para producción: Resend → Domains → Add Domain → cargar registros DNS. Después cambiar `CONTACT_EMAIL_FROM` a algo como `contacto@tudominio`.

### 3. Cuenta Cloudflare Turnstile (anti-bot del form + chatbot)
- [x] Cuenta creada, widget creado, SITE + SECRET key pasadas
- [x] Hostnames del widget: `localhost` + `giulianogerlo.vercel.app`

### 4. Repositorio GitHub
- [x] Repo creado y conectado a Vercel

### 5. Upstash Redis (rate limiting del form + chatbot)
- [x] Store creado vía Marketplace de Vercel, env vars copiadas al `.env`

### 6. Google Gemini API (chatbot "Preguntale a Giuliano")
- [x] API key generada y cargada en Vercel + `.env`
- [x] Chatbot deshabilitado en local con aviso (el endpoint `/api/chat` solo corre en deploy de Vercel)

### 7. Supabase (Phase 12 — backend dinámico + admin)
- [x] Cuenta creada, proyecto `giulianogerlo-portfolio` en region South America (São Paulo)
- [x] Free tier, GitHub linkeado, framework: React
- [x] Security config: Data API ON / Auto-expose new tables OFF / Auto-RLS ON
- [x] 3 env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) cargadas en `.env` local
- [ ] 3 env vars cargadas en Vercel dashboard con scope **Production + Preview + Development**
- [ ] Branch `feature/phase-12-supabase` creada y pusheada para testing en preview antes de merge a master
- [ ] Auth Settings: allowlist de email (solo tu mail puede pedir magic link) — se configura en Task 12.2 vía MCP
- [ ] Auth Settings: Site URL + Redirect URLs para magic link callback — se configura en Task 12.2

## 🔐 Seguridad — rotar keys

- [ ] **Rotar las keys secretas** — `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` y la API key de Gemini se pegaron en texto plano en el chat en algún momento. Antes/después de deployar, generá nuevas desde los dashboards correspondientes y actualizá el `.env` + las env vars de Vercel. (La `VITE_TURNSTILE_SITE_KEY` es pública, esa no hace falta rotarla.)

## 📱 Datos de contacto a confirmar

- [x] Email mostrado: ggiuliano526@gmail.com
- [x] WhatsApp: +54 3468 53-6422
- [x] LinkedIn: https://www.linkedin.com/in/giuliano-gerlo-21a7b8221/
- [x] GitHub: https://github.com/GiuGerlo

## 🚀 Deploy (hecho)

- [x] Proyecto Vercel renombrado a `giulianogerlo`, dominio `giulianogerlo.vercel.app`
- [x] Env vars cargadas en el dashboard de Vercel
- [x] `giulianogerlo.vercel.app` agregado a los hostnames del widget Turnstile
- [x] Deploy inicial OK + form probado en producción (mail recibido)
- [x] Vercel Web Analytics activado

## 🔍 Post-deploy (SEO)

- [ ] Validar las tarjetas OG/Twitter con https://www.opengraph.xyz (pegar la URL del sitio)
- [ ] Dar de alta el sitio en Google Search Console y enviar el sitemap
- [ ] Correr Lighthouse (pestaña en DevTools) — apuntar a SEO + Performance 90+

---

**Notas de seguridad:**
- La API key de Resend y la de Gemini NUNCA van en código ni en GitHub. Solo en variables de entorno.
- El email mostrado en el sitio va a estar obfuscado (no plano en HTML) para evitar scrapers de spam.
- El form y el chatbot usan Cloudflare Turnstile (anti-bot invisible, gratis) + Upstash Redis para rate limiting.
