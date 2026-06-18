/**
 * bio.js — datos extra de Giuliano para el chatbot IA. SOLO FALLBACK.
 *
 * DESDE 2026-06-18 esto NO es la fuente de verdad. El contexto extra del
 * chatbot ahora se edita desde /admin/sitio (columna
 * `site_settings.chatbot_context`) y `api/chat.js` lo lee de la DB en cada
 * request. Editar este archivo NO cambia lo que dice el bot en producción:
 * solo se usa si la DB falla o no está configurada (fail-open en
 * `fetchContent`). Para cambiar la bio del bot, editá /admin/sitio.
 *
 * Este archivo NO se importa en ningún componente del frontend; no se
 * renderiza en ninguna página. Su único consumidor es `api/chat.js`.
 *
 * Recordá: lo que pongas acá el chatbot lo va a poder decir a cualquier
 * visitante. No cargues nada que no quieras que sea público.
 */

export const bio = {
  // Actualizar manualmente cada cumpleaños.
  Edad: '22 años',
  Ubicación: 'Rosario, Santa Fe, Argentina',
  Idiomas: 'Español (nativo). Inglés: lectura técnica de documentación. Teniendo clases particulares',
  Disponibilidad: 'Abierto a propuestas laborales.',
  Modalidad: 'Trabajo remoto o presencial en Rosario.',
};
