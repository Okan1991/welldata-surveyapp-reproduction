export interface FHIRQuestionnaire {
  resourceType: 'Questionnaire';
  id: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  item?: FHIRQuestionnaireItem[];
  meta?: {
    profile?: string[];
    tag?: FHIRCoding[];
  };
}

export interface FHIRQuestionnaireItem {
  linkId: string;
  text?: string;
  type: 'group' | 'display' | 'boolean' | 'decimal' | 'integer' | 'date' | 'dateTime' | 'time' | 'string' | 'text' | 'url' | 'choice' | 'open-choice' | 'attachment' | 'reference' | 'quantity';
  required?: boolean;
  repeats?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  answerValueSet?: string;
  answerOption?: FHIRAnswerOption[];
  item?: FHIRQuestionnaireItem[];
  enableWhen?: FHIREnableWhen[];
  enableBehavior?: 'all' | 'any';
  definition?: string;
  prefix?: string;
  initial?: FHIRAnswer[];
}

export interface FHIRAnswerOption {
  valueCoding?: FHIRCoding;
  valueString?: string;
  valueInteger?: number;
  valueDate?: string;
  valueTime?: string;
  valueReference?: FHIRReference;
}

export interface FHIREnableWhen {
  question: string;
  operator: 'exists' | '=' | '!=' | '>' | '<' | '>=' | '<=';
  answerBoolean?: boolean;
  answerDecimal?: number;
  answerInteger?: number;
  answerDate?: string;
  answerDateTime?: string;
  answerTime?: string;
  answerString?: string;
  answerCoding?: FHIRCoding;
  answerQuantity?: FHIRQuantity;
  answerReference?: FHIRReference;
}

export interface FHIRAnswer {
  valueBoolean?: boolean;
  valueDecimal?: number;
  valueInteger?: number;
  valueDate?: string;
  valueDateTime?: string;
  valueTime?: string;
  valueString?: string;
  valueUri?: string;
  valueAttachment?: FHIRAttachment;
  valueCoding?: FHIRCoding;
  valueQuantity?: FHIRQuantity;
  valueReference?: FHIRReference;
}

export interface FHIRCoding {
  system?: string;
  version?: string;
  code: string;
  display?: string;
  userSelected?: boolean;
}

export interface FHIRQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRReference {
  reference: string;
  display?: string;
}

export interface FHIRAttachment {
  contentType?: string;
  language?: string;
  data?: string;
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: string;
} 