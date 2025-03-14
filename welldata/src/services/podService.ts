import {
  getSolidDataset,
  getContainedResourceUrlAll,
  createContainerAt,
  deleteContainer,
  deleteFile,
  FetchError,
  getSourceUrl,
  getFile,
  saveSolidDatasetAt,
  createSolidDataset,
  createThing,
  buildThing,
  setThing
} from '@inrupt/solid-client';
import { fetch, getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { createInitialFHIRPlan } from './fhirService';

/**
 * Recursively deletes a container and all its contents
 * @param containerUrl The URL of the container to delete
 * @returns Promise that resolves when deletion is complete
 * @throws Error with descriptive message if deletion fails
 */
export async function deleteContainerRecursively(containerUrl: string): Promise<void> {
  try {
    // First check if we have access to the container
    try {
      await getSolidDataset(containerUrl, { fetch });
    } catch (error) {
      const fetchError = error as FetchError;
      if (fetchError.statusCode === 403) {
        throw new Error(`Permission denied: You don't have access to delete this container. Please check your permissions.`);
      }
      throw error;
    }

    // Get all resources in the container
    const dataset = await getSolidDataset(containerUrl, { fetch });
    const containedResources = getContainedResourceUrlAll(dataset);

    // Delete all contained resources first
    for (const resourceUrl of containedResources) {
      try {
        if (resourceUrl.endsWith('/')) {
          // If it's a container, delete it recursively
          await deleteContainerRecursively(resourceUrl);
        } else {
          // If it's a file, delete it directly
          await deleteFile(resourceUrl, { fetch });
        }
      } catch (error) {
        const fetchError = error as FetchError;
        if (fetchError.statusCode === 403) {
          throw new Error(`Permission denied: Unable to delete resource ${resourceUrl}. Please check your permissions.`);
        }
        throw error;
      }
    }

    // After all contents are deleted, delete the container itself
    try {
      await deleteContainer(containerUrl, { fetch });
    } catch (error) {
      const fetchError = error as FetchError;
      if (fetchError.statusCode === 403) {
        throw new Error(`Permission denied: Unable to delete the container. Please check your permissions.`);
      }
      throw error;
    }
  } catch (error) {
    const fetchError = error as FetchError;
    if (fetchError.statusCode === 403) {
      throw new Error(`Permission denied: You don't have access to delete this container. Please check your permissions.`);
    }
    throw new Error(`Failed to delete container: ${fetchError.message}`);
  }
}

// Function to check if a resource exists
export async function resourceExists(url: string): Promise<boolean> {
  try {
    await getSolidDataset(url, { fetch });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to ensure the welldata container structure exists
export async function ensureWelldataStructure(
  podUrl: string, 
  options = { 
    debug: false,
    createWebId: true
  }
): Promise<{ success: boolean; welldataUrl: string; message: string }> {
  const { debug, createWebId } = options;
  
  try {
    if (debug) console.log('Starting welldata structure check...');
    
    // Get the session
    const session = getDefaultSession();
    if (!session.info.webId) {
      return { 
        success: false, 
        welldataUrl: '', 
        message: 'User not logged in' 
      };
    }
    
    // Extract the Pod container URL from the WebID
    // WebID format is typically: http://localhost:3000/alice/profile/card#me
    // Pod container is typically: http://localhost:3000/alice/
    let podContainerUrl = '';
    try {
      const webIdUrl = new URL(session.info.webId);
      const pathParts = webIdUrl.pathname.split('/').filter(Boolean);
      
      // The first part of the path is usually the username/pod name
      if (pathParts.length > 0) {
        podContainerUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
      } else {
        // Fallback to the provided podUrl if we can't extract from WebID
        podContainerUrl = podUrl;
      }
      
      if (debug) console.log('Extracted Pod container URL:', podContainerUrl);
    } catch (error) {
      console.error('Error extracting Pod container URL:', error);
      // Fallback to the provided podUrl
      podContainerUrl = podUrl;
    }
    
    // Determine the welldata container URL - now inside the Pod container
    const welldataContainerUrl = `${podContainerUrl}welldata/`;
    if (debug) console.log(`Checking welldata container at: ${welldataContainerUrl}`);
    
    // Step 1: Check if welldata container exists, create if not
    let welldataExists = await resourceExists(welldataContainerUrl);
    if (!welldataExists) {
      if (debug) console.log('Welldata container does not exist, creating it...');
      await createContainerAt(welldataContainerUrl, { fetch });
      if (debug) console.log('Welldata container created successfully');
    } else {
      if (debug) console.log('Welldata container already exists');
    }
    
    // Step 2: Check if data subdirectory exists, create if not
    const dataContainerUrl = `${welldataContainerUrl}data/`;
    let dataExists = await resourceExists(dataContainerUrl);
    if (!dataExists) {
      if (debug) console.log('Data container does not exist, creating it...');
      await createContainerAt(dataContainerUrl, { fetch });
      if (debug) console.log('Data container created successfully');
    } else {
      if (debug) console.log('Data container already exists');
    }
    
    // Step 3: Check if plans subdirectory exists, create if not
    const plansContainerUrl = `${dataContainerUrl}plans/`;
    let plansExists = await resourceExists(plansContainerUrl);
    if (!plansExists) {
      if (debug) console.log('Plans container does not exist, creating it...');
      await createContainerAt(plansContainerUrl, { fetch });
      if (debug) console.log('Plans container created successfully');
    } else {
      if (debug) console.log('Plans container already exists');
    }
    
    // Step 4: Check if initial plan exists, create if not
    const initialPlanUrl = `${plansContainerUrl}initial-plan.ttl`;
    let initialPlanExists = await resourceExists(initialPlanUrl);
    if (!initialPlanExists) {
      if (debug) console.log('Initial plan does not exist, creating it...');
      await createInitialFHIRPlan(welldataContainerUrl);
      if (debug) console.log('Initial plan created successfully');
    } else {
      if (debug) console.log('Initial plan already exists');
    }
    
    // Create WebID for the welldata container if requested
    if (createWebId) {
      const webIdUrl = `${welldataContainerUrl}.ttl`;
      let webIdExists = await resourceExists(webIdUrl);
      if (!webIdExists) {
        if (debug) console.log('WebID does not exist, creating it...');
        await createWelldataWebId(welldataContainerUrl);
        if (debug) console.log('WebID created successfully');
      } else {
        if (debug) console.log('WebID already exists');
      }
    }
    
    return {
      success: true,
      welldataUrl: welldataContainerUrl,
      message: 'Welldata structure verified and completed successfully'
    };
  } catch (error) {
    console.error('Error ensuring welldata structure:', error);
    return {
      success: false,
      welldataUrl: '',
      message: `Error: ${error.message}`
    };
  }
}

// Function to create a WebID for the welldata container
async function createWelldataWebId(containerUrl: string): Promise<string> {
  try {
    // Create a .ttl file for the WebID
    const webIdUrl = `${containerUrl}.ttl`;
    
    // Create a new dataset
    let dataset = createSolidDataset();
    
    // Create the WebID thing
    const webIdThing = buildThing(createThing({ url: containerUrl }))
      .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://xmlns.com/foaf/0.1/Agent')
      .addStringNoLocale('http://xmlns.com/foaf/0.1/name', 'Welldata Container')
      .addUrl('http://www.w3.org/ns/solid/terms#oidcIssuer', 'http://localhost:3000/')
      .addUrl('http://xmlns.com/foaf/0.1/isPrimaryTopicOf', webIdUrl)
      .build();
    
    // Add the thing to the dataset
    dataset = setThing(dataset, webIdThing);
    
    // Save the dataset
    await saveSolidDatasetAt(webIdUrl, dataset, { fetch });
    
    console.log('WebID created successfully at:', webIdUrl);
    return webIdUrl;
  } catch (error) {
    console.error('Error creating WebID:', error);
    throw error;
  }
} 