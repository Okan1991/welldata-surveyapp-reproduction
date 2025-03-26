import { FHIRQuestionnaire } from '../fhir/types';

export const useTranslation = (
  survey: FHIRQuestionnaire,
  language: string
): FHIRQuestionnaire => {
  // For now, we'll just return the original survey
  // In the future, this can be expanded to handle translations
  // by looking for language-specific extensions in the FHIR resource
  return survey;
}; 