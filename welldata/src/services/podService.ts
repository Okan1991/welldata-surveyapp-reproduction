import {
  getSolidDataset,
  getContainedResourceUrlAll,
  deleteContainer,
  deleteFile,
  FetchError
} from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

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