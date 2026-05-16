/**
 * obfuscate-email.js — utilidades anti-scraping para el email de contacto.
 *
 * Problema: los bots de spam scrapean el HTML buscando direcciones de
 * email en texto plano (`alguien@dominio.com`) para después spammearlas.
 *
 * Solución simple: NO poner el email en plano en el código/HTML. Se
 * guarda codificado en base64 y se decodifica recién en el navegador
 * cuando el usuario interactúa (click). El bot que solo lee el HTML
 * estático nunca ve la dirección real.
 *
 * No es seguridad fuerte (base64 se revierte trivialmente) — es solo
 * fricción suficiente para que los scrapers tontos no lo agarren.
 *
 * `btoa` / `atob` son funciones nativas del navegador:
 *  - btoa(texto)   → string en base64  ("ascii TO base64")
 *  - atob(base64)  → texto original    ("base64 TO ascii")
 */

/** Codifica un email a base64. Se usa una sola vez para generar la
 *  constante que guardamos en Contact.jsx (no se llama en runtime). */
export function obfuscateEmail(email) {
  return btoa(email);
}

/** Decodifica un email base64 de vuelta a texto plano. Se llama en el
 *  navegador cuando el usuario hace click en "ver email". */
export function decodeEmail(encoded) {
  return atob(encoded);
}
