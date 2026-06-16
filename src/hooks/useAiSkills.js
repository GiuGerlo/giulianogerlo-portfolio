// Hook público de las skills de IA (AI Integration).
import { usePublicList } from './usePublicList.js';
import { dbToAiSkill } from '../lib/ai-skills-mapper.js';

export function useAiSkills() {
  return usePublicList('ai_skills', dbToAiSkill);
}
