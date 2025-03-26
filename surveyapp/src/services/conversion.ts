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
   * @param responseUrl The URL of the response
   * @returns The RDF representation as a string
   */
  public static jsonToRdf(response: FHIRQuestionnaireResponse, responseUrl: string): any {
    if (!ConversionService.validateResponse(response)) {
      throw new Error('Invalid questionnaire response');
    }

    console.log('Starting RDF conversion with:', {
      responseId: response.id,
      responseUrl,
      itemCount: response.item.length
    });

    // Create a new dataset
    let dataset = createSolidDataset();

    // Create the main response thing
    const responseThing = buildThing(createThing({ name: response.id }))
      .addUrl(RDF_NAMESPACE('type'), FHIR_NAMESPACE('QuestionnaireResponse'))
      .addStringNoLocale(FHIR_NAMESPACE('id'), response.id)
      .addUrl(FHIR_NAMESPACE('questionnaire'), response.questionnaire)
      .addStringNoLocale(FHIR_NAMESPACE('status'), response.status)
      .addDatetime(FHIR_NAMESPACE('authored'), new Date(response.authored))
      .build();

    console.log('Created response thing:', {
      id: getStringNoLocale(responseThing, FHIR_NAMESPACE('id')),
      type: getUrl(responseThing, RDF_NAMESPACE('type')),
      questionnaire: getUrl(responseThing, FHIR_NAMESPACE('questionnaire')),
      status: getStringNoLocale(responseThing, FHIR_NAMESPACE('status'))
    });

    // Add the response thing to the dataset
    dataset = setThing(dataset, responseThing);

    // Add each item as a separate thing and link it to the response
    response.item.forEach((item: FHIRQuestionnaireResponseItem, itemIndex: number) => {
      console.log(`Processing item ${itemIndex + 1}/${response.item.length}:`, {
        linkId: item.linkId,
        answerCount: item.answer.length
      });

      const itemThing = buildThing(createThing({ name: `${response.id}-${item.linkId}` }))
        .addUrl(RDF_NAMESPACE('type'), FHIR_NAMESPACE('QuestionnaireResponseItem'))
        .addStringNoLocale(FHIR_NAMESPACE('linkId'), item.linkId)
        .addUrl(FHIR_NAMESPACE('partOf'), responseUrl)
        .build();

      console.log('Created item thing:', {
        linkId: getStringNoLocale(itemThing, FHIR_NAMESPACE('linkId')),
        type: getUrl(itemThing, RDF_NAMESPACE('type')),
        partOf: getUrl(itemThing, FHIR_NAMESPACE('partOf'))
      });

      // Add the item thing to the dataset first
      dataset = setThing(dataset, itemThing);

      // Add answer values
      item.answer.forEach((answer, answerIndex) => {
        const valueType = Object.keys(answer).find(key => key.startsWith('value'));
        console.log(`Processing answer ${answerIndex + 1}/${item.answer.length} for item ${item.linkId}:`, {
          valueType,
          value: valueType ? answer[valueType as keyof typeof answer] : undefined
        });

        let answerBuilder = buildThing(createThing({ name: `${response.id}-${item.linkId}-answer-${answerIndex}` }))
          .addUrl(RDF_NAMESPACE('type'), FHIR_NAMESPACE('Answer'))
          .addUrl(FHIR_NAMESPACE('partOf'), `${responseUrl}#${response.id}-${item.linkId}`);

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
          // For SNOMED codes, we need to prepend the SNOMED CT system URL
          const codeUrl = answer.valueCoding.system === 'http://snomed.info/sct' 
            ? `http://snomed.info/sct/${answer.valueCoding.code}`
            : answer.valueCoding.code;
          answerBuilder = answerBuilder.addUrl(FHIR_NAMESPACE('valueCoding'), codeUrl);
        }

        // Add timestamp if available
        if (answer.extension?.[0]?.valueDateTime) {
          answerBuilder = answerBuilder.addDatetime(
            FHIR_NAMESPACE('answerTime'),
            new Date(answer.extension[0].valueDateTime)
          );
        }

        const answerThing = answerBuilder.build();
        console.log('Created answer thing:', {
          type: getUrl(answerThing, RDF_NAMESPACE('type')),
          partOf: getUrl(answerThing, FHIR_NAMESPACE('partOf')),
          valueBoolean: getBoolean(answerThing, FHIR_NAMESPACE('valueBoolean')),
          valueString: getStringNoLocale(answerThing, FHIR_NAMESPACE('valueString')),
          valueInteger: getInteger(answerThing, FHIR_NAMESPACE('valueInteger')),
          valueDecimal: getDecimal(answerThing, FHIR_NAMESPACE('valueDecimal')),
          valueCoding: getUrl(answerThing, FHIR_NAMESPACE('valueCoding'))
        });

        // Add the answer thing to the dataset
        dataset = setThing(dataset, answerThing);
      });
    });

    console.log('Final dataset structure:', {
      thingCount: Object.keys(dataset.graphs.default).length,
      things: Object.keys(dataset.graphs.default).map(id => ({
        id,
        type: getUrl(dataset.graphs.default[id], RDF_NAMESPACE('type'))
      }))
    });

    return dataset;
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
        if (valueCoding !== undefined && valueCoding !== null) {
          // Check if this is a SNOMED code
          if (valueCoding.startsWith('http://snomed.info/sct/')) {
            answer.valueCoding = {
              system: 'http://snomed.info/sct',
              code: valueCoding.replace('http://snomed.info/sct/', ''),
              display: '' // We don't store the display text in RDF
            };
          } else {
            const urlParts = valueCoding.split('/');
            answer.valueCoding = {
              system: urlParts[0] + '//' + urlParts[2],
              code: urlParts[urlParts.length - 1] || '',
              display: '' // We don't store the display text in RDF
            };
          }
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