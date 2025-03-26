import { FHIRQuestionnaire, FHIRQuestionnaireItem } from '../fhir/types';
import { en } from '../i18n/en';
import { nl } from '../i18n/nl';

interface Translation {
  survey: {
    title: string;
    description: string;
    helpText: string;
  };
  questions: {
    [key: string]: string;
  };
  answers: {
    [key: string]: string;
  };
  ui: {
    [key: string]: string | ((current: number, total: number) => string);
  };
}

const translations: Record<string, Translation> = {
  en,
  nl,
};

const LANGUAGE_STORAGE_KEY = 'survey_language';

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
];

export const getStoredLanguage = (): string => {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
};

export const setStoredLanguage = (language: string): void => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

export const translateSurvey = (survey: FHIRQuestionnaire, language: string): FHIRQuestionnaire => {
  const t = translations[language] || translations['en'];
  
  const translatedSurvey: FHIRQuestionnaire = {
    ...survey,
    title: t.survey.title,
    description: t.survey.description,
    item: survey.item.map(item => ({
      ...item,
      text: t.questions[item.linkId] || item.text,
      helpText: item.helpText ? t.survey.helpText : undefined,
      answerOption: item.answerOption?.map(option => ({
        ...option,
        valueCoding: [{
          ...option.valueCoding[0],
          display: t.answers[option.valueCoding[0].code] || option.valueCoding[0].display
        }]
      }))
    }))
  };

  return translatedSurvey;
};

export const translateUI = (language: string) => {
  const t = translations[language] || translations['en'];
  return t.ui;
}; 