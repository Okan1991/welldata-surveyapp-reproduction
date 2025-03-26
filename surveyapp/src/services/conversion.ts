import { FHIRQuestionnaireResponse, FHIRQuestionnaireResponseItem, FHIRValue } from '../fhir/types';
import { 
  createThing, 
  buildThing, 
  setThing, 
  createSolidDataset, 
  getThing, 
  getStringNoLocale, 
  getUrl, 
  getDatetime,
  getBoolean,
  getInteger,
  getDecimal,
  ThingLocal 
} from '@inrupt/solid-client';
import { FHIR_NAMESPACE, RDF_NAMESPACE } from '../fhir/namespaces';
import { deviceReference } from '../fhir/device';

/**
 * Service for converting between FHIR JSON and RDF formats
 */
export class ConversionService {
  /**
   * Converts a FHIR QuestionnaireResponse from JSON to RDF
   * @param response The FHIR QuestionnaireResponse in JSON format
   * @returns The RDF representation as a string
   */
  public static jsonToRdf(response: FHIRQuestionnaireResponse): any {
    if (!ConversionService.validateResponse(response)) {
      throw new Error('Invalid questionnaire response');
    }

    // Create a new dataset
    const dataset = createSolidDataset();

    // Create the main response thing
    const responseThing = buildThing(createThing({ name: response.id }))
      .addUrl(RDF_NAMESPACE('type'), FHIR_NAMESPACE('QuestionnaireResponse'))
      .addStringNoLocale(FHIR_NAMESPACE('id'), response.id)
      .addUrl(FHIR_NAMESPACE('questionnaire'), response.questionnaire)
      .addStringNoLocale(FHIR_NAMESPACE('status'), response.status)
      .addDatetime(FHIR_NAMESPACE('authored'), new Date(response.authored))
      .build();

    // Add the response thing to the dataset
    const updatedDataset = setThing(dataset, responseThing);

    // Add each item as a separate thing
    response.item.forEach((item: FHIRQuestionnaireResponseItem) => {
      const itemThing = buildThing(createThing({ name: `${response.id}-${item.linkId}` }))
        .addUrl(RDF_NAMESPACE('type'), FHIR_NAMESPACE('QuestionnaireResponseItem'))
        .addStringNoLocale(FHIR_NAMESPACE('linkId'), item.linkId)
        .build();

      // Add answer values
      item.answer.forEach((answer, index) => {
        let answerBuilder = buildThing(createThing({ name: `${response.id}-${item.linkId}-answer-${index}` }))
          .addUrl(RDF_NAMESPACE('type'), FHIR_NAMESPACE('Answer'));

        // Add value based on type
        if (answer.valueBoolean !== undefined) {
          answerBuilder = answerBuilder.addBoolean(FHIR_NAMESPACE('valueBoolean'), answer.valueBoolean);
        }
        if (answer.valueString !== undefined) {
          answerBuilder = answerBuilder.addStringNoLocale(FHIR_NAMESPACE('valueString'), answer.valueString);
        }
        if (answer.valueInteger !== undefined) {
          answerBuilder = answerBuilder.addInteger(FHIR_NAMESPACE('valueInteger'), answer.valueInteger);
        }
        if (answer.valueDecimal !== undefined) {
          answerBuilder = answerBuilder.addDecimal(FHIR_NAMESPACE('valueDecimal'), answer.valueDecimal);
        }
        if (answer.valueCoding !== undefined) {
          answerBuilder = answerBuilder.addUrl(FHIR_NAMESPACE('valueCoding'), answer.valueCoding.code);
        }

        // Add timestamp if available
        if (answer.extension?.[0]?.valueDateTime) {
          answerBuilder = answerBuilder.addDatetime(
            FHIR_NAMESPACE('answerTime'),
            new Date(answer.extension[0].valueDateTime)
          );
        }

        // Build and add the answer thing to the dataset
        setThing(updatedDataset, answerBuilder.build());
      });

      // Add the item thing to the dataset
      setThing(updatedDataset, itemThing);
    });

    return updatedDataset;
  }

  /**
   * Converts RDF data back to a FHIR QuestionnaireResponse
   * @param dataset The RDF data as a string
   * @returns The FHIR QuestionnaireResponse object
   */
  public static rdfToJson(dataset: any): FHIRQuestionnaireResponse {
    // Get the main response thing
    const responseThing = getThing(dataset, dataset.type);
    if (!responseThing) {
      throw new Error('No response thing found in dataset');
    }

    // Build the response object
    const response: FHIRQuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      id: getStringNoLocale(responseThing, FHIR_NAMESPACE('id')) || '',
      questionnaire: getUrl(responseThing, FHIR_NAMESPACE('questionnaire')) || '',
      status: getStringNoLocale(responseThing, FHIR_NAMESPACE('status')) as 'in-progress' | 'completed',
      authored: getDatetime(responseThing, FHIR_NAMESPACE('authored'))?.toISOString() || new Date().toISOString(),
      source: deviceReference,
      item: []
    };

    // Get all items
    const items = dataset.filter((thing: any) => 
      getUrl(thing, RDF_NAMESPACE('type')) === FHIR_NAMESPACE('QuestionnaireResponseItem')
    );

    // Process each item
    items.forEach((itemThing: any) => {
      const item: FHIRQuestionnaireResponseItem = {
        linkId: getStringNoLocale(itemThing, FHIR_NAMESPACE('linkId')) || '',
        answer: []
      };

      // Get all answers for this item
      const answers = dataset.filter((thing: any) => 
        getUrl(thing, RDF_NAMESPACE('type')) === FHIR_NAMESPACE('Answer') &&
        thing.name.startsWith(`${response.id}-${item.linkId}-answer-`)
      );

      // Process each answer
      answers.forEach((answerThing: any) => {
        const answer: any = {};

        // Add value based on type
        const valueBoolean = getBoolean(answerThing, FHIR_NAMESPACE('valueBoolean'));
        if (valueBoolean !== undefined) {
          answer.valueBoolean = valueBoolean;
        }

        const valueString = getStringNoLocale(answerThing, FHIR_NAMESPACE('valueString'));
        if (valueString !== undefined) {
          answer.valueString = valueString;
        }

        const valueInteger = getInteger(answerThing, FHIR_NAMESPACE('valueInteger'));
        if (valueInteger !== undefined) {
          answer.valueInteger = valueInteger;
        }

        const valueDecimal = getDecimal(answerThing, FHIR_NAMESPACE('valueDecimal'));
        if (valueDecimal !== undefined) {
          answer.valueDecimal = valueDecimal;
        }

        const valueCoding = getUrl(answerThing, FHIR_NAMESPACE('valueCoding'));
        if (valueCoding !== undefined) {
          answer.valueCoding = { code: valueCoding };
        }

        // Add timestamp if available
        const answerTime = getDatetime(answerThing, FHIR_NAMESPACE('answerTime'));
        if (answerTime) {
          answer.extension = [{
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaireresponse-answer-time',
            valueDateTime: answerTime.toISOString()
          }];
        }

        item.answer.push(answer);
      });

      response.item.push(item);
    });

    return response;
  }

  /**
   * Validates a FHIR QuestionnaireResponse
   * @param response The response to validate
   * @returns Whether the response is valid
   */
  public static validateResponse(response: FHIRQuestionnaireResponse): boolean {
    return (
      response.resourceType === 'QuestionnaireResponse' &&
      !!response.id &&
      !!response.questionnaire &&
      !!response.status &&
      Array.isArray(response.item)
    );
  }
} 