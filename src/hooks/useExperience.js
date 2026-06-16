// Hook público del timeline de experiencia.
import { usePublicList } from './usePublicList.js';
import { dbToExperience } from '../lib/experience-mapper.js';

export function useExperience() {
  return usePublicList('experience', dbToExperience);
}
