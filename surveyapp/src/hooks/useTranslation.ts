import { FHIRQuestionnaire, FHIRQuestionnaireItem } from '../fhir/types';
import { translateSurvey } from '../utils/language';

export const useTranslation = (
  survey: FHIRQuestionnaire,
  language: string
): FHIRQuestionnaire => {
  return translateSurvey(survey, language);
}; 