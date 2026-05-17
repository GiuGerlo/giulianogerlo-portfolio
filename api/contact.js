// api/contact.js — Vercel Serverless Function.
//
// Esto NO es código del frontend: corre en un servidor de Vercel, no en
// el browser. Vercel toma cualquier archivo dentro de /api y lo expone
// como endpoint HTTP — este se llama en POST /api/contact.
//
// Por qué backend y no mandar el email desde React:
//   - La RESEND_API_KEY y la TURNSTILE_SECRET_KEY son secretas. Si las
//     usáramos en el frontend, cualquiera las ve en el bundle del browser.
//   - La verificación de Turnstile DEBE ser server-side (el token del
//     widget solo prueba algo si Cloudflare lo confirma desde el server).
//
// Capas anti-spam que aplica (en orden):
//   1. Method check  — solo POST.
//   2. Honeypot      — si el campo trampa `website` viene lleno → bot.
//   3. Rate limit    — máx 3 envíos por hora por IP (Upstash Redis).
//   4. Turnstile     — verifica el token contra Cloudflare.
//   5. Validación    — re-valida los campos server-side (no confiar en
//                      el cliente: el frontend se puede saltear).
//   6. HTML escape   — escapa los inputs antes de meterlos en el email.

import { Resend } from 'resend';
import { Redis } from '@upstash/redis';

// Cliente de Resend. process.env lee las variables de entorno: en local
// salen del archivo .env; en producción, del dashboard de Vercel.
const resend = new Resend(process.env.RESEND_API_KEY);

// Cliente de Upstash Redis (rate limiting). Habla por REST API con las
// vars KV_REST_API_URL/TOKEN que inyecta la integración de Vercel.
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Tope de envíos: RATE_LIMIT_MAX por cada ventana de RATE_LIMIT_WINDOW
// segundos (3 por hora). Pasado el límite, la IP recibe un 429.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 3600;

/**
 * checkRateLimit — cuenta los envíos de una IP en la ventana actual.
 * Devuelve true si la IP TODAVÍA puede enviar, false si se pasó.
 *
 * INCR suma 1 a la clave (la crea en 0 si no existe) y devuelve el nuevo
 * valor. En el primer envío de la ventana le ponemos un TTL: la clave se
 * autoborra en 1h, así el contador se resetea solo sin tarea de limpieza.
 *
 * Fail-open: si Redis falla, devolvemos true (dejamos pasar). No
 * bloqueamos a un visitante legítimo por un problema de infraestructura.
 */
async function checkRateLimit(ip) {
  try {
    const key = `rate:contact:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }
    return count <= RATE_LIMIT_MAX;
  } catch (err) {
    console.error('Rate limit (Redis) falló, se deja pasar:', err);
    return true;
  }
}

/**
 * escapeHtml — reemplaza los caracteres con significado en HTML por sus
 * entidades. Sin esto, un atacante podría mandar en el mensaje algo como
 * `<img src=x onerror=...>` y ese HTML se ejecutaría al abrir el mail.
 * Escapando, el texto se muestra literal y nunca como markup.
 */
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * verifyTurnstile — le pregunta a Cloudflare si el token del widget es
 * válido. Devuelve true/false. La SECRET KEY nunca sale de este server.
 */
async function verifyTurnstile(token, ip) {
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      // URLSearchParams arma el body en formato form-urlencoded, que es
      // lo que espera el endpoint de Cloudflare.
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    },
  );
  const data = await res.json();
  return data.success === true;
}

// Handler principal. Vercel lo invoca con (req, res) estilo Node/Express.
export default async function handler(req, res) {
  // ── 1. Solo POST ──────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  // Vercel ya parsea el body JSON en req.body (content-type aplicado).
  const { nombre, email, mensaje, website, turnstileToken } =
    req.body ?? {};

  // x-forwarded-for trae la IP real del visitante (Vercel está delante).
  const ip = req.headers['x-forwarded-for'] ?? '';

  // ── 2. Honeypot ───────────────────────────────────────────────────
  // Un humano deja `website` vacío (no ve el campo). Si vino con algo,
  // es un bot. Respondemos 200 "ok" a propósito: si le devolviéramos un
  // error, el bot sabría que lo detectamos. Así cree que envió bien.
  if (website) {
    return res.status(200).json({ ok: true });
  }

  // ── 3. Rate limit ─────────────────────────────────────────────────
  // Frena el abuso del form (máx 3 envíos/hora por IP). Va ANTES de
  // Turnstile a propósito: así cada intento cuenta aunque después falle
  // el captcha, y no gastamos llamadas a Cloudflare en un IP abusivo.
  const dentroDelLimite = await checkRateLimit(ip);
  if (!dentroDelLimite) {
    return res.status(429).json({
      error: 'Demasiados envíos. Probá de nuevo en una hora.',
    });
  }

  // ── 4. Turnstile ──────────────────────────────────────────────────
  if (!turnstileToken) {
    return res
      .status(400)
      .json({ error: 'Falta la verificación anti-bot.' });
  }
  const humano = await verifyTurnstile(turnstileToken, ip);
  if (!humano) {
    return res
      .status(403)
      .json({ error: 'La verificación anti-bot falló.' });
  }

  // ── 5. Validación server-side ─────────────────────────────────────
  // El frontend ya valida con zod, pero un request se puede mandar sin
  // pasar por el frontend (curl, Postman). Re-validamos siempre acá.
  const nombreOk = typeof nombre === 'string' && nombre.trim().length >= 2;
  const emailOk =
    typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const mensajeOk =
    typeof mensaje === 'string' && mensaje.trim().length >= 10;

  if (!nombreOk || !emailOk || !mensajeOk) {
    return res.status(400).json({ error: 'Datos del formulario inválidos.' });
  }

  // ── 6. Enviar el email con Resend ─────────────────────────────────
  try {
    await resend.emails.send({
      from: process.env.CONTACT_EMAIL_FROM,
      to: process.env.CONTACT_EMAIL_TO,
      // replyTo: al apretar "Responder" en el mail, contesta directo al
      // visitante en vez de a la dirección de Resend.
      replyTo: email,
      subject: `Portfolio — nuevo mensaje de ${nombre.trim()}`,
      // Todos los inputs van escapados: el contenido del visitante nunca
      // se interpreta como HTML.
      html: `
        <h2>Nuevo mensaje desde el portfolio</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(nombre.trim())}</p>
        <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${escapeHtml(mensaje.trim()).replaceAll('\n', '<br>')}</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    // No filtramos el detalle del error al cliente; lo logueamos para
    // poder revisarlo en los logs de Vercel.
    console.error('Error enviando email con Resend:', err);
    return res
      .status(500)
      .json({ error: 'No se pudo enviar el mensaje. Probá más tarde.' });
  }
}
