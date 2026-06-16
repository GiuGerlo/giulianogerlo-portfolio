/**
 * Tests de los mappers de contenido (Phase 13 cont.): site_settings,
 * skill_groups, ai_skills, experience, education.
 *
 * Foco: renombrado snake↔camel correcto + arrays passthrough + omisión de
 * campos managed (id/order_index/timestamps) en los *ToDb.
 */

import { describe, it, expect } from 'vitest';
import { dbToSiteSettings, siteSettingsToDb } from './site-settings-mapper.js';
import { dbToSkillGroup, skillGroupToDb } from './skill-groups-mapper.js';
import { dbToAiSkill, aiSkillToDb } from './ai-skills-mapper.js';
import { dbToExperience, experienceToDb } from './experience-mapper.js';
import { dbToEducation, educationToDb } from './education-mapper.js';

describe('site-settings-mapper', () => {
  const row = {
    id: 1,
    hero_name: 'Giuliano Gerlo',
    hero_tagline: 'Full-Stack',
    hero_location: 'Rosario',
    footer_tagline: 'tagline',
    cv_url: null,
    social_github: 'gh',
    social_linkedin: 'li',
    social_email: 'mail',
    social_whatsapp: '549',
    social_location: 'Rosario, AR',
    updated_at: '2026-06-16T00:00:00Z',
  };

  it('dbToSiteSettings renombra a camelCase', () => {
    const s = dbToSiteSettings(row);
    expect(s.heroName).toBe('Giuliano Gerlo');
    expect(s.socialWhatsapp).toBe('549');
    expect(s.cvUrl).toBeNull();
  });

  it('siteSettingsToDb omite id/updatedAt y mapea a snake', () => {
    const db = siteSettingsToDb(dbToSiteSettings(row));
    expect(db).not.toHaveProperty('id');
    expect(db).not.toHaveProperty('updated_at');
    expect(db.hero_name).toBe('Giuliano Gerlo');
    expect(db.cv_url).toBeNull();
  });
});

describe('skill-groups-mapper', () => {
  it('round-trip preserva campos no-managed', () => {
    const row = { id: 'a', title: 'Frontend', icon: 'Layout', items: ['React', 'CSS'], order_index: 0 };
    const g = dbToSkillGroup(row);
    expect(g.items).toEqual(['React', 'CSS']);
    const db = skillGroupToDb(g);
    expect(db).toEqual({ title: 'Frontend', icon: 'Layout', items: ['React', 'CSS'] });
  });

  it('items null → array vacío', () => {
    expect(dbToSkillGroup({ items: null }).items).toEqual([]);
  });
});

describe('ai-skills-mapper', () => {
  it('round-trip', () => {
    const row = { id: 'a', title: 'mcp', status: 'active', description: 'd', items: [], order_index: 1 };
    const a = dbToAiSkill(row);
    expect(a.status).toBe('active');
    expect(aiSkillToDb(a)).toEqual({ title: 'mcp', status: 'active', description: 'd', items: [] });
  });
});

describe('experience-mapper', () => {
  it('renombra y normaliza vacíos a null', () => {
    const row = {
      id: 'a', date_label: 'NOV', date_start: '2024-11', date_end: null,
      role: 'Dev', company: 'RAMCC', description: 'd', current: true,
      project_slug: 'ramcc', order_index: 0,
    };
    const e = dbToExperience(row);
    expect(e.dateLabel).toBe('NOV');
    expect(e.projectSlug).toBe('ramcc');
    const db = experienceToDb(e);
    expect(db.date_end).toBeNull();
    expect(db.project_slug).toBe('ramcc');
    // strings vacíos → null en campos opcionales.
    expect(experienceToDb({ projectSlug: '', dateEnd: '' }).project_slug).toBeNull();
    expect(experienceToDb({ projectSlug: '', dateEnd: '' }).date_end).toBeNull();
  });
});

describe('education-mapper', () => {
  it('round-trip + certUrl vacío → null', () => {
    const row = { id: 'a', date_label: '2024', title: 'T', org: 'O', status: 'completed', cert_url: '/c.pdf', order_index: 0 };
    const e = dbToEducation(row);
    expect(e.certUrl).toBe('/c.pdf');
    expect(educationToDb(e)).toEqual({ date_label: '2024', title: 'T', org: 'O', status: 'completed', cert_url: '/c.pdf' });
    expect(educationToDb({ certUrl: '' }).cert_url).toBeNull();
  });
});
