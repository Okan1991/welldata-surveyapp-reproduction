import { SurveyDefinition, QuestionTranslation } from '../surveys/types';
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
  return localStorage.getItem('selectedLanguage') || 'en';
};

export const setStoredLanguage = (language: string): void => {
  localStorage.setItem('selectedLanguage', language);
};

export const translateSurvey = (survey: SurveyDefinition, language: string): SurveyDefinition => {
  const t = translations[language] || translations['en'];
  
  const translatedSurvey: SurveyDefinition = {
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
          display: t.answers[option.valueString] || option.valueCoding[0].display
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