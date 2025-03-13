export const RDF_PREDICATES = {
  TYPE: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  LABEL: 'http://www.w3.org/2000/01/rdf-schema#label',
  COMMENT: 'http://www.w3.org/2000/01/rdf-schema#comment',
  ACTION: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#action',
  AUTHOR: 'http://purl.org/dc/terms/creator',
  GOAL: 'http://hl7.org/fhir/goal',
  TARGET: 'http://hl7.org/fhir/target',
  FREQUENCY: 'http://hl7.org/fhir/frequency',
  SNOMED_CODE: 'http://snomed.info/sct/'
};

export const FHIR_NAMESPACE = (predicate: string) => `http://hl7.org/fhir/${predicate}`; 