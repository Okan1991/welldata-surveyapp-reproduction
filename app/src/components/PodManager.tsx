import { createSignal, Show, For, onMount } from 'solid-js';
import {
  getSolidDataset,
  createContainerAt,
  getContainedResourceUrlAll,
  saveSolidDatasetAt,
  createSolidDataset,
  setThing,
  createThing,
  buildThing,
  getStringNoLocale,
  getThing,
  deleteFile as deleteResource,
  getSourceUrl,
} from '@inrupt/solid-client';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { DCTERMS } from '@inrupt/vocab-common-rdf';

export default function PodManager() {
  const [containers, setContainers] = createSignal<Array<{ url: string, name: string }>>([]);
  const [selectedContainer, setSelectedContainer] = createSignal('');
  const [newContainerName, setNewContainerName] = createSignal('');
  const [files, setFiles] = createSignal<Array<{ url: string; title?: string; description?: string }>>([]);
  const [newFileName, setNewFileName] = createSignal('');
  const [fileContent, setFileContent] = createSignal('');
  const [error, setError] = createSignal('');

  const session = getDefaultSession();

  // Watch for session changes
  onMount(() => {
    // Set up session change monitoring
    const checkSession = () => {
      if (session.info.isLoggedIn) {
        listContainers();
      }
    };

    // Check initial state
    checkSession();

    // Set up periodic checks while mounted
    const intervalId = setInterval(checkSession, 1000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  });

  // Extract container name from URL
  const getContainerName = (url: string) => {
    const parts = url.split('/');
    // Get the second to last part (container name)
    const name = parts[parts.length - 2] || '';
    return decodeURIComponent(name);
  };

  // List existing containers in the pod
  const listContainers = async () => {
    if (!session.info.isLoggedIn) {
      setError('Please log in first');
      return;
    }

    try {
      const podUrl = session.info.webId?.replace('/profile/card#me', '/');
      if (!podUrl) {
        setError('Could not determine Pod URL');
        return;
      }

      const podDataset = await getSolidDataset(podUrl, { fetch: session.fetch });
      const containerUrls = getContainedResourceUrlAll(podDataset)
        .filter(url => url.endsWith('/'));
      
      const containerDetails = containerUrls.map(url => ({
        url,
        name: getContainerName(url)
      }));
      
      setContainers(containerDetails);
      setError('');
    } catch (e) {
      setError(`Error listing containers: ${e}`);
    }
  };

  const createContainer = async () => {
    if (!session.info.isLoggedIn) {
      setError('Please log in first');
      return;
    }

    if (!newContainerName()) {
      setError('Please enter a container name');
      return;
    }

    try {
      const podUrl = session.info.webId?.replace('/profile/card#me', '/');
      if (!podUrl) {
        setError('Could not determine Pod URL');
        return;
      }

      const containerPath = `${podUrl}${newContainerName()}/`;
      await createContainerAt(containerPath, { fetch: session.fetch });
      setNewContainerName('');
      await listContainers();
      setSelectedContainer(containerPath);
      setError('');
    } catch (e) {
      setError(`Error creating container: ${e}`);
    }
  };

  const deleteContainer = async (containerUrl: string) => {
    try {
      // Ensure URL ends with a slash for container operations
      const normalizedUrl = containerUrl.endsWith('/') ? containerUrl : `${containerUrl}/`;
      
      await deleteResource(normalizedUrl, { fetch: session.fetch });
      if (selectedContainer() === containerUrl) {
        setSelectedContainer('');
        setFiles([]);
      }
      await listContainers();
      setError('');
    } catch (e) {
      setError(`Error deleting container: ${e}`);
      // If deletion fails, refresh the container list to ensure UI is in sync
      await listContainers();
    }
  };

  const listFiles = async () => {
    if (!selectedContainer()) {
      setError('Please select or create a container first');
      return;
    }

    try {
      const dataset = await getSolidDataset(selectedContainer(), { fetch: session.fetch });
      const fileUrls = getContainedResourceUrlAll(dataset);
      
      const fileDetails = await Promise.all(
        fileUrls.map(async (url) => {
          try {
            const fileDataset = await getSolidDataset(url, { fetch: session.fetch });
            const thing = getThing(fileDataset, url);
            const title = thing ? getStringNoLocale(thing, DCTERMS.title) : undefined;
            const description = thing ? getStringNoLocale(thing, DCTERMS.description) : undefined;
            return {
              url,
              ...(title && { title }),
              ...(description && { description })
            };
          } catch (e) {
            return { url };
          }
        })
      );
      
      setFiles(fileDetails);
      setError('');
    } catch (e) {
      setError(`Error listing files: ${e}`);
    }
  };

  const createFile = async () => {
    if (!selectedContainer() || !newFileName()) {
      setError('Please select a container and enter a file name');
      return;
    }

    try {
      const fileUrl = `${selectedContainer()}${encodeURIComponent(newFileName())}.ttl`;
      let dataset = createSolidDataset();
      
      const thing = buildThing(createThing({ name: newFileName() }))
        .addStringNoLocale(DCTERMS.title, newFileName())
        .addStringNoLocale(DCTERMS.description, fileContent())
        .build();

      dataset = setThing(dataset, thing);
      await saveSolidDatasetAt(fileUrl, dataset, { fetch: session.fetch });
      await listFiles();
      setNewFileName('');
      setFileContent('');
      setError('');
    } catch (e) {
      setError(`Error creating file: ${e}`);
    }
  };

  const deleteFile = async (fileUrl: string) => {
    try {
      await deleteResource(fileUrl, { fetch: session.fetch });
      await listFiles();
      setError('');
    } catch (e) {
      setError(`Error deleting file: ${e}`);
    }
  };

  return (
    <div class="pod-manager">
      <div class="info-section">
        <h2>About SOLID Data Storage</h2>
        <p>In SOLID, all data is stored as RDF (Resource Description Framework). This means:</p>
        <ul>
          <li>Files are created as .ttl (Turtle) files containing structured data</li>
          <li>Each file has properties like 'title' and 'description' defined using standard vocabularies</li>
          <li>We're using the Dublin Core Terms vocabulary (DCTERMS) to describe the files</li>
        </ul>
      </div>

      <Show when={error()}>
        <p class="error">{error()}</p>
      </Show>

      <div class="container-section">
        <h3>Step 1: Select or Create a Container</h3>
        <div class="container-list">
          <h4>Existing Containers:</h4>
          <Show 
            when={containers().length > 0}
            fallback={<p>No containers found. Create one below.</p>}
          >
            <ul>
              <For each={containers()}>
                {(container) => (
                  <li class={container.url === selectedContainer() ? 'selected' : ''}>
                    <div class="container-item">
                      <span>{container.name}</span>
                      <div class="container-actions">
                        <button 
                          onClick={() => setSelectedContainer(container.url)}
                          class={container.url === selectedContainer() ? 'selected' : ''}
                        >
                          {container.url === selectedContainer() ? 'Selected' : 'Select'}
                        </button>
                        <button 
                          onClick={() => deleteContainer(container.url)}
                          class="danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>

        <div class="create-container">
          <h4>Create New Container:</h4>
          <div class="input-group">
            <label>
              Container Name:
              <input
                type="text"
                value={newContainerName()}
                onInput={(e) => setNewContainerName(e.currentTarget.value)}
                placeholder="Enter container name (e.g., my-files)"
              />
            </label>
          </div>
          <button onClick={createContainer}>Create Container</button>
        </div>
      </div>

      <Show when={selectedContainer()}>
        <div class="files-section">
          <h3>Step 2: Manage Files</h3>
          <p>View and manage files in container: <strong>{selectedContainer()}</strong></p>
          <button onClick={listFiles}>Refresh Files List</button>
          <Show when={files().length > 0}>
            <ul>
              <For each={files()}>
                {(file) => (
                  <li>
                    <div class="file-item">
                      <div class="file-info">
                        <strong>File URL:</strong> {file.url}
                        <Show when={file.title}>
                          <br /><strong>Title:</strong> {file.title}
                        </Show>
                        <Show when={file.description}>
                          <br /><strong>Content:</strong> {file.description}
                        </Show>
                      </div>
                      <button 
                        onClick={() => deleteFile(file.url)}
                        class="danger"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </Show>

          <div class="create-file-section">
            <h4>Create New File:</h4>
            <div class="input-group">
              <label>
                File Title (will be stored as dcterms:title):
                <input
                  type="text"
                  value={newFileName()}
                  onInput={(e) => setNewFileName(e.currentTarget.value)}
                  placeholder="Enter file name"
                />
              </label>
            </div>
            <div class="input-group">
              <label>
                File Content (will be stored as dcterms:description):
                <textarea
                  value={fileContent()}
                  onInput={(e) => setFileContent(e.currentTarget.value)}
                  placeholder="Enter file content"
                />
              </label>
            </div>
            <button onClick={createFile}>Create File</button>
          </div>
        </div>
      </Show>
    </div>
  );
} 