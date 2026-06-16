// Hook público de los grupos de skills (Stack Técnico).
import { usePublicList } from './usePublicList.js';
import { dbToSkillGroup } from '../lib/skill-groups-mapper.js';

export function useSkillGroups() {
  return usePublicList('skill_groups', dbToSkillGroup);
}
