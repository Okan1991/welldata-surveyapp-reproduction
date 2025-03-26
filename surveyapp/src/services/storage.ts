import { PodService } from './podService';
import { ConversionService } from './conversion';
import { FHIRQuestionnaireResponse } from '../fhir/types';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { createSolidDataset, saveSolidDatasetAt, getSolidDataset } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';
import { getUrl } from '@inrupt/solid-client';
import { RDF_NAMESPACE, FHIR_NAMESPACE } from '../fhir/namespaces';

export interface StorageServiceConfig {
  solidPodUrl: string;
}

/**
 * Service for managing survey response storage
 */
export class StorageService {
  private config: StorageServiceConfig;
  private surveyUrl: string | null = null;
  private podService: PodService;

  constructor(config: StorageServiceConfig) {
    this.config = config;
    this.podService = new PodService(config);
  }

  private async ensureSurveyContainer(): Promise<string> {
    if (this.surveyUrl) {
      return this.surveyUrl;
    }

    const session = getDefaultSession();
    if (!session.info.webId) {
      throw new Error('User must be logged in to store survey responses');
    }

    const result = await this.podService.ensureSurveyStructure();
    if (!result.success) {
      throw new Error(`Failed to ensure survey container: ${result.message}`);
    }

    this.surveyUrl = result.surveyUrl;
    return this.surveyUrl;
  }

  /**
   * Stores a survey response
   * @param response The response to store
   * @returns Whether the storage was successful
   */
  async storeResponse(response: FHIRQuestionnaireResponse): Promise<boolean> {
    try {
      // Ensure the survey container exists
      const surveyUrl = await this.ensureSurveyContainer();
      const responsesUrl = `${surveyUrl}responses/`;

      // Save the response to the responses container
      const responseUrl = `${responsesUrl}${response.id}.ttl`;
      console.log('Attempting to store at:', responseUrl);

      // Convert the response to RDF
      const rdfData = ConversionService.jsonToRdf(response, responseUrl);
      console.log('Converting to RDF:', {
        response,
        rdfData: JSON.stringify(rdfData, null, 2),
        defaultGraph: JSON.stringify(rdfData.graphs.default, null, 2),
        thingCount: Object.keys(rdfData.graphs.default).length,
        things: Object.keys(rdfData.graphs.default).map(id => ({
          id,
          type: getUrl(rdfData.graphs.default[id], RDF_NAMESPACE('type')),
          partOf: getUrl(rdfData.graphs.default[id], FHIR_NAMESPACE('partOf'))
        }))
      });
      
      try {
        // Try to get the existing dataset first
        const existingDataset = await getSolidDataset(responseUrl, { fetch });
        console.log('Found existing dataset:', {
          url: existingDataset.internal_resourceInfo.sourceIri,
          graphs: Object.keys(existingDataset.graphs),
          defaultGraph: JSON.stringify(existingDataset.graphs.default, null, 2),
          thingCount: Object.keys(existingDataset.graphs.default).length,
          things: Object.keys(existingDataset.graphs.default).map(id => ({
            id,
            type: getUrl(existingDataset.graphs.default[id], RDF_NAMESPACE('type')),
            partOf: getUrl(existingDataset.graphs.default[id], FHIR_NAMESPACE('partOf'))
          }))
        });
        
        // Merge the new data with the existing dataset
        const mergedDataset = {
          ...existingDataset,
          graphs: {
            ...existingDataset.graphs,
            default: {
              ...existingDataset.graphs.default,
              ...rdfData.graphs.default
            }
          }
        };
        
        // Save the merged dataset
        await saveSolidDatasetAt(responseUrl, mergedDataset, { fetch });
        console.log('Successfully updated existing dataset with merged structure:', {
          url: mergedDataset.internal_resourceInfo.sourceIri,
          graphs: Object.keys(mergedDataset.graphs),
          defaultGraph: JSON.stringify(mergedDataset.graphs.default, null, 2),
          thingCount: Object.keys(mergedDataset.graphs.default).length,
          things: Object.keys(mergedDataset.graphs.default).map(id => ({
            id,
            type: getUrl(mergedDataset.graphs.default[id], RDF_NAMESPACE('type')),
            partOf: getUrl(mergedDataset.graphs.default[id], FHIR_NAMESPACE('partOf'))
          }))
        });
      } catch (error: any) {
        // If the error is 404, the dataset doesn't exist yet, so we can create it
        if (error.statusCode === 404) {
          console.log('No existing dataset found, creating new one with structure:', {
            url: responseUrl,
            graphs: Object.keys(rdfData.graphs),
            defaultGraph: JSON.stringify(rdfData.graphs.default, null, 2),
            thingCount: Object.keys(rdfData.graphs.default).length,
            things: Object.keys(rdfData.graphs.default).map(id => ({
              id,
              type: getUrl(rdfData.graphs.default[id], RDF_NAMESPACE('type')),
              partOf: getUrl(rdfData.graphs.default[id], FHIR_NAMESPACE('partOf'))
            }))
          });
          await saveSolidDatasetAt(responseUrl, rdfData, { fetch });
          console.log('Successfully created new dataset');
        } else {
          // For any other error, rethrow it
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error('Error storing survey response:', error);
      return false;
    }
  }

  /**
   * Retrieves a survey response by ID
   * @param responseId The response ID
   * @returns The response or null if not found
   */
  async getResponse(responseId: string): Promise<FHIRQuestionnaireResponse | null> {
    try {
      // Ensure the survey container exists
      const surveyUrl = await this.ensureSurveyContainer();
      const responsesUrl = `${surveyUrl}responses/`;

      // Get the response dataset
      const responseUrl = `${responsesUrl}${responseId}.ttl`;
      const dataset = await getSolidDataset(responseUrl, { fetch });

      // Convert the RDF data back to JSON
      const response = ConversionService.rdfToJson(dataset);

      return response;
    } catch (error) {
      console.error('Error retrieving survey response:', error);
      return null;
    }
  }

  async getAllResponses(): Promise<FHIRQuestionnaireResponse[]> {
    try {
      // Ensure the survey container exists
      const surveyUrl = await this.ensureSurveyContainer();
      const responsesUrl = `${surveyUrl}responses/`;

      // Get all response datasets
      const dataset = await getSolidDataset(responsesUrl, { fetch });
      const responses: FHIRQuestionnaireResponse[] = [];

      // Convert each response from RDF to JSON
      const things = dataset.graphs.default;
      for (const thing of Object.values(things)) {
        if (thing.type === 'Subject') {
          const jsonResponse = ConversionService.rdfToJson(thing);
          responses.push(jsonResponse);
        }
      }

      return responses;
    } catch (error) {
      console.error('Error retrieving all survey responses:', error);
      return [];
    }
  }
} 