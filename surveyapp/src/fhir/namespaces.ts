// FHIR namespace function
export function FHIR_NAMESPACE(term: string): string {
  return `http://hl7.org/fhir/${term}`;
}

// RDF namespace function
export function RDF_NAMESPACE(term: string): string {
  return `http://www.w3.org/1999/02/22-rdf-syntax-ns#${term}`;
}

// FOAF namespace function
export function FOAF_NAMESPACE(term: string): string {
  return `http://xmlns.com/foaf/0.1/${term}`;
}

// SOLID namespace function
export function SOLID_NAMESPACE(term: string): string {
  return `http://www.w3.org/ns/solid/terms#${term}`;
} 