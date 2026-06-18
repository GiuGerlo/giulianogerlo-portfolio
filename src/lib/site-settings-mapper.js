/**
 * site-settings-mapper.js — traducción snake↔camel para la tabla singleton
 * `site_settings` (Hero/Footer/CV/redes). Mismo patrón que profile-mapper.
 */

/**
 * Convierte la fila DB (snake_case) a objeto SiteSettings (camelCase).
 * @param {object} row
 * @returns {object}
 */
export function dbToSiteSettings(row) {
  return {
    id: row.id,
    heroName: row.hero_name,
    heroTagline: row.hero_tagline,
    heroLocation: row.hero_location,
    footerTagline: row.footer_tagline,
    cvUrl: row.cv_url,
    socialGithub: row.social_github,
    socialLinkedin: row.social_linkedin,
    socialEmail: row.social_email,
    socialWhatsapp: row.social_whatsapp,
    socialLocation: row.social_location,
    // Texto libre que SOLO usa el chatbot (api/chat.js) como contexto extra.
    // No se renderiza en ninguna sección pública.
    chatbotContext: row.chatbot_context,
    updatedAt: row.updated_at,
  };
}

/**
 * Convierte el objeto del form (camelCase) al shape DB. Omite id/updatedAt
 * (los gestiona Postgres).
 * @param {object} s
 * @returns {object}
 */
export function siteSettingsToDb(s) {
  return {
    hero_name: s.heroName ?? '',
    hero_tagline: s.heroTagline ?? '',
    hero_location: s.heroLocation ?? '',
    footer_tagline: s.footerTagline ?? '',
    cv_url: s.cvUrl ?? null,
    social_github: s.socialGithub ?? '',
    social_linkedin: s.socialLinkedin ?? '',
    social_email: s.socialEmail ?? '',
    social_whatsapp: s.socialWhatsapp ?? '',
    social_location: s.socialLocation ?? '',
    chatbot_context: s.chatbotContext ?? '',
  };
}
