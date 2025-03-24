// FHIR Questionnaire types
export type QuestionType = 'boolean' | 'choice' | 'text' | 'number' | 'snomed';

export interface FHIRChoice {
  valueString: string;
  valueCoding: {
    system: string;
    code: string;
    display: string;
  }[];
}

export interface FHIRQuestionItem {
  linkId: string;
  type: QuestionType;
  required?: boolean;
  text: string;
  helpText?: string;
  answerOption?: FHIRChoice[];
  answerValueSet?: string; // Reference to a ValueSet
  validation?: Validation;
  item?: FHIRQuestionItem[]; // For nested questions
  extension?: any[];
}

export interface Validation {
  min?: number;
  max?: number;
  pattern?: string;
  step?: number;
  unit?: string;
}

export interface FHIRQuestionnaire {
  resourceType: 'Questionnaire';
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  date: string;
  meta?: {
    tag?: {
      system: string;
      code: string;
      display: string;
    }[];
  };
  item: FHIRQuestionItem[];
}

// Translation types for UI
export interface QuestionTranslation {
  linkId: string;
  text: string;
  helpText?: string;
  answerOption?: {
    valueString: string;
    display: string;
  }[];
}

export interface QuestionnaireTranslation {
  language: string;
  title: string;
  description?: string;
  questions: QuestionTranslation[];
}

// Helper types for our application
export interface SurveyDefinition extends FHIRQuestionnaire {
  translations?: SurveyTranslation[];
}

export interface SurveyTranslation {
  language: string;
  title: string;
  description?: string;
  item: {
    linkId: string;
    text: string;
    helpText?: string;
  }[];
} 