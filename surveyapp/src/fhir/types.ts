export interface FHIRValue {
  valueBoolean?: boolean;
  valueString?: string;
  valueInteger?: number;
  valueDecimal?: number;
  valueCoding?: {
    system: string;
    code: string;
    display: string;
  };
}

export interface FHIRAnswer {
  valueBoolean?: boolean;
  valueString?: string;
  valueInteger?: number;
  valueDecimal?: number;
  valueCoding?: {
    system: string;
    code: string;
    display: string;
  };
  extension?: Array<{
    url: string;
    valueDateTime: string;
  }>;
}

export interface FHIRQuestionnaireResponseItem {
  linkId: string;
  answer: FHIRAnswer[];
}

export interface FHIRQuestionnaireResponse {
  resourceType: 'QuestionnaireResponse';
  id: string;
  questionnaire: string;
  status: 'in-progress' | 'completed';
  authored: string;
  device?: {
    reference: string;
  };
  source: {
    reference: string;
    type: string;
    display: string;
    identifier: {
      system: string;
      value: string;
    };
  };
  item: FHIRQuestionnaireResponseItem[];
}

export interface FHIRQuestionnaireItem {
  linkId: string;
  text: string;
  type: 'boolean' | 'text' | 'number' | 'choice' | 'snomed';
  required?: boolean;
  helpText?: string;
  answerOption?: Array<{
    valueCoding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  answerValueSet?: string;
}

export interface FHIRQuestionnaire {
  resourceType: 'Questionnaire';
  id: string;
  title: string;
  description: string;
  status: 'active' | 'draft' | 'retired';
  item: FHIRQuestionnaireItem[];
} 