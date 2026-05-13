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

## 🌐 Cuentas y servicios a crear

### 1. Cuenta Vercel (hosting)
- [ ] Ir a https://vercel.com
- [ ] Sign Up → continuar con tu cuenta de GitHub (GiuGerlo)
- [ ] Confirmar email
- [ ] No instalar nada local todavía — lo hacemos cuando deployemos

### 2. Cuenta Resend (envío de emails del form)
- [ ] Ir a https://resend.com
- [ ] Sign Up con email
- [ ] Confirmar email
- [ ] Settings → API Keys → Create API Key (nombre: "portfolio-prod", permission: "Sending access")
- [ ] **Copiar la API key** y guardarla — solo se ve UNA vez. Empieza con `re_...`
- [ ] (Pasarme la key cuando configuremos `.env.local` — NO la subas a GitHub)
- [ ] Verificar dominio (opcional, recién cuando tengas dominio propio)

### 3. Cuenta Cloudflare Turnstile (anti-bot del form)
- [ ] Ir a https://cloudflare.com → Sign Up (gratis)
- [ ] Confirmar email
- [ ] Dashboard → Turnstile → Add Site
- [ ] Domain: `giulianogerlo.vercel.app` (o el que tengas)
- [ ] Widget Mode: **Managed** (recomendado)
- [ ] **Copiar SITE KEY** (pública, va al front)
- [ ] **Copiar SECRET KEY** (privada, va al backend)
- [ ] Pasarme ambas para configurar `.env.local`

### 4. Repositorio GitHub
- [ ] Crear repo público en GitHub: `giulianogerlo-portfolio`
- [ ] (NO inicializar con README — el local ya tiene archivos)

## 📱 Datos de contacto a confirmar

- [x] Email mostrado: ggiuliano526@gmail.com
- [x] WhatsApp: +54 3468 53-6422
- [x] LinkedIn: https://www.linkedin.com/in/giuliano-gerlo-21a7b8221/
- [x] GitHub: https://github.com/GiuGerlo

## 🚀 Pre-deploy (cuando esté listo)

- [ ] Probar build local: `npm run build` y `npm run preview`
- [ ] Conectar repo GitHub a Vercel
- [ ] Configurar variables de entorno en Vercel dashboard:
  - `RESEND_API_KEY` = (tu key de Resend)
  - `CONTACT_EMAIL_TO` = ggiuliano526@gmail.com
- [ ] Verificar que llegue email de prueba al completar el form

---

**Notas de seguridad:**
- La API key de Resend NUNCA va en código ni en GitHub. Solo en variables de entorno.
- El email mostrado en el sitio va a estar obfuscado (no plano en HTML) para evitar scrapers de spam.
- El form usa Cloudflare Turnstile (anti-bot invisible, gratis) para que no te lleguen spam.
