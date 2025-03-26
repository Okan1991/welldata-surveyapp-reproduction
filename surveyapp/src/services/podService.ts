import {
  createContainerAt,
  createSolidDataset,
  saveSolidDatasetAt,
  getSolidDataset,
  buildThing,
  createThing,
  setThing,
  getThing,
  getThingAll,
  Thing,
  getStringNoLocale,
} from '@inrupt/solid-client';
import { fetch, getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { FHIR_NAMESPACE } from '../fhir/namespaces';
import { FHIRQuestionnaire } from '../fhir/types';

interface PodServiceConfig {
  solidPodUrl: string;
}

interface SurveyStructureResult {
  success: boolean;
  surveyUrl: string;
  message: string;
}

/**
 * Service for managing SOLID pod interactions
 */
export class PodService {
  private config: PodServiceConfig;

  constructor(config: PodServiceConfig) {
    this.config = config;
  }

  /**
   * Checks if a resource exists at the given URL
   */
  private async resourceExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      // If we get a 404, the resource doesn't exist
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      // For other errors, we'll assume the resource exists to be safe
      return true;
    }
  }

  /**
   * Ensures the survey container structure exists in the pod
   */
  async ensureSurveyStructure(): Promise<SurveyStructureResult> {
    try {
      const session = getDefaultSession();
      if (!session.info.webId) {
        throw new Error('User must be logged in to ensure survey structure');
      }

      // Extract the pod URL from the WebID
      const webIdUrl = new URL(session.info.webId);
      const pathParts = webIdUrl.pathname.split('/').filter(Boolean);
      
      // The first part of the path is usually the username/pod name
      let podUrl = '';
      if (pathParts.length > 0) {
        podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
      } else {
        podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
      }

      // Create the welldata container URL and ensure it exists
      const welldataUrl = `${podUrl}welldata/`;
      if (!await this.resourceExists(welldataUrl)) {
        await createContainerAt(welldataUrl, { fetch });
      }

      // Create the data and metadata containers
      const dataUrl = `${welldataUrl}data/`;
      const metadataUrl = `${welldataUrl}metadata/`;
      
      if (!await this.resourceExists(dataUrl)) {
        await createContainerAt(dataUrl, { fetch });
      }
      if (!await this.resourceExists(metadataUrl)) {
        await createContainerAt(metadataUrl, { fetch });
      }

      // Create the surveys containers in both data and metadata
      const dataSurveysUrl = `${dataUrl}surveys/`;
      const metadataSurveysUrl = `${metadataUrl}surveys/`;
      const metadataDefinitionsUrl = `${metadataSurveysUrl}definitions/`;

      if (!await this.resourceExists(dataSurveysUrl)) {
        await createContainerAt(dataSurveysUrl, { fetch });
      }
      if (!await this.resourceExists(metadataSurveysUrl)) {
        await createContainerAt(metadataSurveysUrl, { fetch });
      }
      if (!await this.resourceExists(metadataDefinitionsUrl)) {
        await createContainerAt(metadataDefinitionsUrl, { fetch });
      }

      return {
        success: true,
        surveyUrl: dataSurveysUrl,
        message: 'Survey structure created successfully'
      };
    } catch (error) {
      console.error('Error ensuring survey structure:', error);
      return {
        success: false,
        surveyUrl: '',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      };
    }
  }

  /**
   * Stores a questionnaire in the pod
   */
  async storeQuestionnaire(questionnaire: FHIRQuestionnaire): Promise<boolean> {
    try {
      const session = getDefaultSession();
      if (!session.info.webId) {
        throw new Error('User must be logged in to store questionnaires');
      }

      // Ensure the survey structure exists
      const { success } = await this.ensureSurveyStructure();
      if (!success) {
        throw new Error('Failed to ensure survey structure');
      }

      // Extract the pod URL from the WebID
      const webIdUrl = new URL(session.info.webId);
      const pathParts = webIdUrl.pathname.split('/').filter(Boolean);
      
      // The first part of the path is usually the username/pod name
      let podUrl = '';
      if (pathParts.length > 0) {
        podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
      } else {
        podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
      }

      // Create the questionnaire URL in metadata/surveys/definitions
      const metadataDefinitionsUrl = `${podUrl}welldata/metadata/surveys/definitions/`;
      const questionnaireUrl = `${metadataDefinitionsUrl}${questionnaire.id}.ttl`;

      // Check if questionnaire already exists
      if (await this.resourceExists(questionnaireUrl)) {
        console.log('Questionnaire already exists, skipping storage');
        return true;
      }

      // Create a Thing for the questionnaire
      const questionnaireThing = buildThing(createThing())
        .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://hl7.org/fhir/Questionnaire')
        .addStringNoLocale('http://hl7.org/fhir/title', questionnaire.title)
        .addStringNoLocale('http://hl7.org/fhir/description', questionnaire.description)
        .addStringNoLocale('http://hl7.org/fhir/status', questionnaire.status)
        .build();

      // Create a dataset for the questionnaire
      let dataset = createSolidDataset();
      dataset = setThing(dataset, questionnaireThing);

      // Add each item as a separate thing with proper URL resolution
      questionnaire.item.forEach((item, index) => {
        const itemThing = buildThing(createThing({ name: `${questionnaire.id}-item-${index}` }))
          .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://hl7.org/fhir/QuestionnaireItem')
          .addStringNoLocale('http://hl7.org/fhir/linkId', item.linkId)
          .addStringNoLocale('http://hl7.org/fhir/text', item.text)
          .addStringNoLocale('http://hl7.org/fhir/type', item.type)
          .addBoolean('http://hl7.org/fhir/required', item.required || false)
          .build();

        dataset = setThing(dataset, itemThing);

        // Add answer options if present
        if (item.answerOption) {
          item.answerOption.forEach((option, optionIndex) => {
            const optionThing = buildThing(createThing({ name: `${questionnaire.id}-item-${index}-option-${optionIndex}` }))
              .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://hl7.org/fhir/AnswerOption')
              .addStringNoLocale('http://hl7.org/fhir/valueCoding', option.valueCoding[0]?.code || '')
              .build();

            dataset = setThing(dataset, optionThing);
          });
        }

        // Add answer value set if present
        if (item.answerValueSet) {
          const valueSetThing = buildThing(createThing({ name: `${questionnaire.id}-item-${index}-valueSet` }))
            .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://hl7.org/fhir/ValueSet')
            .addStringNoLocale('http://hl7.org/fhir/reference', item.answerValueSet)
            .build();

          dataset = setThing(dataset, valueSetThing);
        }
      });

      // Save the questionnaire
      await saveSolidDatasetAt(questionnaireUrl, dataset, { fetch });

      return true;
    } catch (error) {
      console.error('Error storing questionnaire:', error);
      return false;
    }
  }

  /**
   * Retrieves a questionnaire from the pod
   */
  async getQuestionnaire(questionnaireId: string): Promise<FHIRQuestionnaire | null> {
    try {
      const session = getDefaultSession();
      if (!session.info.webId) {
        throw new Error('User must be logged in to retrieve questionnaires');
      }

      // Ensure the survey structure exists
      const { surveyUrl, success } = await this.ensureSurveyStructure();
      if (!success) {
        throw new Error('Failed to ensure survey structure');
      }

      // Create the questionnaire URL
      const questionnairesUrl = `${surveyUrl}questionnaires/`;
      const questionnaireUrl = `${questionnairesUrl}${questionnaireId}.ttl`;

      // Get the questionnaire dataset
      const dataset = await getSolidDataset(questionnaireUrl, { fetch });
      const thing = getThing(dataset, questionnaireUrl);

      if (!thing) {
        return null;
      }

      // Convert the Thing back to a FHIR Questionnaire
      return {
        resourceType: 'Questionnaire',
        id: questionnaireId,
        title: getStringNoLocale(thing, 'http://hl7.org/fhir/title') || '',
        description: getStringNoLocale(thing, 'http://hl7.org/fhir/description') || '',
        status: getStringNoLocale(thing, 'http://hl7.org/fhir/status') as 'active' | 'draft' | 'retired' || 'draft',
        item: [] // TODO: Implement item conversion
      };
    } catch (error) {
      console.error('Error retrieving questionnaire:', error);
      return null;
    }
  }

  /**
   * Creates a WebID for the survey container
   */
  async createSurveyWebId(): Promise<string | null> {
    try {
      const session = getDefaultSession();
      if (!session.info.webId) {
        throw new Error('User must be logged in to create survey WebID');
      }

      // Extract the pod URL from the WebID
      const webIdUrl = new URL(session.info.webId);
      const pathParts = webIdUrl.pathname.split('/').filter(Boolean);
      
      // The first part of the path is usually the username/pod name
      let podUrl = '';
      if (pathParts.length > 0) {
        podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
      } else {
        podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
      }

      // Create the survey container URL
      const surveyUrl = `${podUrl}surveys/`;

      // Create a WebID for the survey container
      const surveyWebId = `${surveyUrl}#survey`;

      return surveyWebId;
    } catch (error) {
      console.error('Error creating survey WebID:', error);
      return null;
    }
  }
} 