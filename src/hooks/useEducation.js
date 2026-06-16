// Hook público de educación + certificaciones.
import { usePublicList } from './usePublicList.js';
import { dbToEducation } from '../lib/education-mapper.js';

export function useEducation() {
  return usePublicList('education', dbToEducation);
}
