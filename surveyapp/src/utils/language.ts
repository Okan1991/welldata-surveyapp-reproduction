import { SurveyDefinition } from '../surveys/types';
import { en } from '../i18n/en';
import { nl } from '../i18n/nl';

const LANGUAGE_STORAGE_KEY = 'survey_language';

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
];

export const getStoredLanguage = (): string => {
  const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
  console.log('🔍 getStoredLanguage:', {
    storedLang,
    allStorage: Object.entries(localStorage).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  });
  return storedLang;
};

export const setStoredLanguage = (language: string): void => {
  console.log('💾 setStoredLanguage:', { newLanguage: language });
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

const translations = {
  en,
  nl,
};

export const translateSurvey = (survey: SurveyDefinition, language: string): SurveyDefinition => {
  console.log('🔄 translateSurvey called with:', { language });

  const t = translations[language as keyof typeof translations];
  if (!t) {
    console.warn('⚠️ No translations found for language:', language);
    return survey;
  }

  console.log('📚 Available translations:', {
    survey: t.survey,
    questions: t.questions,
    answers: t.answers,
    ui: t.ui
  });

  // Create a deep copy of the survey
  const translatedSurvey = JSON.parse(JSON.stringify(survey));

  // Translate title and description
  translatedSurvey.title = t.survey.title;
  translatedSurvey.description = t.survey.description;

  // Translate questions
  translatedSurvey.item = translatedSurvey.item.map((item: any) => {
    const translatedItem = { ...item };

    // Translate question text
    if (item.linkId in t.questions) {
      console.log(`📝 Translating question ${item.linkId}:`, {
        original: item.text,
        translated: t.questions[item.linkId as keyof typeof t.questions]
      });
      translatedItem.text = t.questions[item.linkId as keyof typeof t.questions];
    }

    // Translate help text if present
    if (item.helpText) {
      translatedItem.helpText = t.survey.helpText;
    }

    // Translate answer options if present
    if (item.answerOption) {
      translatedItem.answerOption = item.answerOption.map((option: any) => {
        const translatedOption = { ...option };
        
        // Translate the display text based on the valueString
        if (translatedOption.valueString) {
          const answerKey = translatedOption.valueString as keyof typeof t.answers;
          if (answerKey in t.answers) {
            translatedOption.display = t.answers[answerKey];
            console.log(`🔤 Translated answer option:`, {
              valueString: translatedOption.valueString,
              original: option.display,
              translated: translatedOption.display
            });
          }
        }

        // If there's a valueCoding array, translate those as well
        if (translatedOption.valueCoding && Array.isArray(translatedOption.valueCoding)) {
          translatedOption.valueCoding = translatedOption.valueCoding.map((coding: any) => {
            const translatedCoding = { ...coding };
            if (translatedOption.valueString) {
              const answerKey = translatedOption.valueString as keyof typeof t.answers;
              if (answerKey in t.answers) {
                translatedCoding.display = t.answers[answerKey];
              }
            }
            return translatedCoding;
          });
        }

        return translatedOption;
      });
    }

    return translatedItem;
  });

  return translatedSurvey;
};

export const translateUI = (language: string) => {
  console.log('🎨 translateUI called with:', { language });
  const t = translations[language as keyof typeof translations] || en;
  console.log('🎨 UI translations:', t.ui);
  return t.ui;
}; 