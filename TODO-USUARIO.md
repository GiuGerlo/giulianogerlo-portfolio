# TODO Usuario — Cosas que Giuliano tiene que hacer

Lista viva de todo lo que **Giuliano** tiene que hacer fuera del código (crear cuentas, conseguir assets, configurar servicios). Se va completando durante el desarrollo.

> Marcá con `[x]` cuando lo hagas.

---

## 📸 Assets gráficos

- [ ] Foto profesional (cuadrada, mínimo 600x600px, PNG/JPG)
- [ ] Screenshot proyecto: Inmobiliaria NZ (1280x800 aprox.)
- [ ] Screenshot proyecto: Clovertecno
- [ ] Screenshot proyecto: RAMCC
- [ ] Screenshot proyecto: ALPA
- [ ] Screenshot proyecto: CENARB (web y móvil si tenés)
- [ ] Logo/favicon personal (puede ser "GG" en SVG simple, o algo más elaborado)
- [ ] CV en PDF actualizado (para botón "Descargar CV")
- [x] **OG image** — `public/og-image.png` (1200x630). Imagen de preview al compartir el link. (Task 8.2)
- [ ] **OG image v2 (opcional)** — rediseñarla con el contenido (nombre, logo, rol) CENTRADO en la zona segura (cuadrado central ~630x630). WhatsApp recorta la imagen a un cuadrado en su preview compacto y corta lo que está en los bordes.

## 🏅 Certificados y títulos (URLs o PDFs)

- [ ] Título Brigadier López — Técnico Superior en Desarrollo de Software
- [ ] Certificado CoderHouse — JavaScript (ago-oct 2024)
- [ ] Certificado CoderHouse — Desarrollo Web (ene-mar 2024)
- [ ] Certificado DigitalHouse — React Developer (cuando termine jun 2026)

Opciones para hostearlos:
- Subir PDFs a `public/certs/` del repo
- O pegar URLs públicas de Google Drive / institución emisora

## 🔗 URLs reales

- [ ] URL live: Inmobiliaria NZ
- [ ] URL live: Clovertecno
- [ ] URL live: RAMCC
- [ ] URL live: ALPA
- [ ] URL live: CENARB
- [ ] URL repo GitHub: Inmobiliaria NZ (si es público)

## 🌐 Cuentas y servicios

### 1. Cuenta Vercel (hosting)
- [x] Cuenta creada, proyecto linkeado (`vercel dev` corriendo OK)
- [x] Proyecto renombrado a `giulianogerlo` → dominio `giulianogerlo.vercel.app`

### 2. Cuenta Resend (envío de emails del form)
- [x] Cuenta creada, API key generada y pasada
- [ ] **Verificar dominio propio en Resend** — mientras tanto el `from` usa `onboarding@resend.dev` (modo prueba: solo manda al email de TU cuenta Resend). Para producción: Resend → Domains → Add Domain → cargar registros DNS. Después cambiar `CONTACT_EMAIL_FROM` a algo como `contacto@tudominio`.

### 3. Cuenta Cloudflare Turnstile (anti-bot del form)
- [x] Cuenta creada, widget creado, SITE + SECRET key pasadas
- [x] Hostnames del widget: `localhost` + `giulianogerlo.vercel.app`

### 4. Repositorio GitHub
- [x] Repo creado y conectado a Vercel

### 5. Upstash Redis (rate limiting del form)
- [x] Store creado vía Marketplace de Vercel, env vars copiadas al `.env`

## 🔐 Seguridad — rotar keys

- [ ] **Rotar las keys secretas** — `TURNSTILE_SECRET_KEY` y `RESEND_API_KEY` se pegaron en texto plano en el chat. Antes/después de deployar, generá nuevas desde los dashboards de Cloudflare y Resend, y actualizá el `.env` + las env vars de Vercel. (La `VITE_TURNSTILE_SITE_KEY` es pública, esa no hace falta rotarla.)

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
- La API key de Resend NUNCA va en código ni en GitHub. Solo en variables de entorno.
- El email mostrado en el sitio va a estar obfuscado (no plano en HTML) para evitar scrapers de spam.
- El form usa Cloudflare Turnstile (anti-bot invisible, gratis) para que no te lleguen spam.
