/**
 * bio.js — datos extra de Giuliano SOLO para el chatbot IA.
 *
 * IMPORTANTE: este archivo NO se importa en ningún componente del
 * frontend. No se renderiza en ninguna página. Su único consumidor es
 * `api/chat.js` (función buildContext), que lo inyecta en el contexto
 * que recibe Gemini.
 *
 * Para qué sirve: hay datos personales/profesionales que no van en la
 * UI pública (edad, disponibilidad, preferencias) pero que ayudan al
 * asistente a responder mejor preguntas de visitantes/reclutadores.
 *
 * Cómo extenderlo: agregá pares clave-valor al objeto. La clave es la
 * etiqueta del dato, el valor es el texto. buildContext los serializa
 * automáticamente — no hay que tocar api/chat.js al sumar un campo.
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
