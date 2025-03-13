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
  getFile
} from '@inrupt/solid-client';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { DCTERMS } from '@inrupt/vocab-common-rdf';
import { Parser as N3Parser } from 'n3';

export default function PodManager() {
  const [containers, setContainers] = createSignal<Array<{ url: string, name: string }>>([]);
  const [selectedContainer, setSelectedContainer] = createSignal('');
  const [newContainerName, setNewContainerName] = createSignal('');
  const [files, setFiles] = createSignal<Array<{ url: string; title?: string; description?: string }>>([]);
  const [newFileName, setNewFileName] = createSignal('');
  const [fileContent, setFileContent] = createSignal('');
  const [error, setError] = createSignal('');
  const [showInfo, setShowInfo] = createSignal(false);
  const [currentStep, setCurrentStep] = createSignal(1);
  const [editingFile, setEditingFile] = createSignal<{ url: string; title: string; description: string } | null>(null);
  const [rdfValidationError, setRdfValidationError] = createSignal('');
  const [previewFileItem, setPreviewFileItem] = createSignal<{ url: string; title: string; description?: string } | null>(null);
  const [previewContent, setPreviewContent] = createSignal('');
  const [previewLoading, setPreviewLoading] = createSignal(false);

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

  const validateRdf = (content: string): { isValid: boolean; error?: string } => {
    const parser = new N3Parser();
    try {
      // Try to parse the content as Turtle (TTL) format
      parser.parse(content);
      return { isValid: true };
    } catch (error: any) {
      return { 
        isValid: false, 
        error: `Invalid RDF content: ${error.message || 'Unknown error'}` 
      };
    }
  };

  const createFile = async () => {
    if (!selectedContainer() || !newFileName()) {
      setError('Please select a container and enter a file name');
      return;
    }

    // Validate RDF content before submission
    const validation = validateRdf(fileContent());
    if (!validation.isValid) {
      setError(validation.error || 'Invalid RDF content');
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
      setRdfValidationError('');
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

  const startEditing = (file: { url: string; title?: string; description?: string }) => {
    setEditingFile({
      url: file.url,
      title: file.title || getFileName(file.url),
      description: file.description || ''
    });
  };

  const cancelEditing = () => {
    setEditingFile(null);
  };

  const saveFileChanges = async () => {
    if (!editingFile()) return;

    // Validate RDF content before submission
    const validation = validateRdf(editingFile()!.description);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid RDF content');
      return;
    }

    try {
      const file = editingFile()!;
      
      // Get the current dataset
      const currentDataset = await getSolidDataset(file.url, { fetch: session.fetch });
      
      // Create new dataset with updated content
      let dataset = createSolidDataset();
      const thing = buildThing(createThing({ name: getFileName(file.url) }))
        .addStringNoLocale(DCTERMS.title, file.title)
        .addStringNoLocale(DCTERMS.description, file.description)
        .build();

      dataset = setThing(dataset, thing);
      
      // Save the updated dataset
      await saveSolidDatasetAt(
        file.url, 
        dataset,
        { fetch: session.fetch }
      );
      
      await listFiles();
      setEditingFile(null);
      setError('');
      setRdfValidationError('');
    } catch (e) {
      setError(`Error updating file: ${e}`);
    }
  };

  const handleItemClick = (item: { url: string; title?: string; description?: string }) => {
    if (item.url.endsWith('/')) {
      // For directories, navigate to children
      loadContainer(item.url);
    } else {
      // For files, open preview modal
      previewFile(item);
    }
  };

  const previewFile = async (file: { url: string; title?: string; description?: string }) => {
    // Set preview item with fallback title
    setPreviewFileItem({
      url: file.url,
      title: (file.title && file.title.trim().length > 0) ? file.title : getFileName(file.url),
      description: file.description
    });
    setPreviewLoading(true);
    try {
      const response = await getFile(file.url, { fetch: session.fetch });
      const text = await response.text();
      setPreviewContent(text);
    } catch (err) {
      setPreviewContent('Error loading file content.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const loadContainer = async (url: string) => {
    setSelectedContainer(url);
    await listFiles();
    setCurrentStep(2);
  };

  return (
    <div class="pod-manager">
      <button 
        class="info-button"
        onClick={() => setShowInfo(!showInfo())}
        title="About SOLID Data Storage"
      >
        i
      </button>

      <Show when={showInfo()}>
        <div class="info-dialog">
          <h3>About SOLID Data Storage</h3>
          <p>In SOLID, all data is stored as RDF (Resource Description Framework). This means:</p>
          <ul>
            <li>Files are created as .ttl (Turtle) files containing structured data</li>
            <li>Each file has properties like 'title' and 'description' defined using standard vocabularies</li>
            <li>We're using the Dublin Core Terms vocabulary (DCTERMS) to describe the files</li>
          </ul>
        </div>
      </Show>

      <div class="breadcrumbs">
        <div 
          class="breadcrumb-item" 
          onClick={() => {
            if (selectedContainer()) {
              setCurrentStep(1);
              setSelectedContainer('');
              setFiles([]);
            }
          }}
          style={{ cursor: selectedContainer() ? 'pointer' : 'default' }}
        >
          Container Selection
        </div>
        <Show when={selectedContainer()}>
          <div class="breadcrumb-item active">{getContainerName(selectedContainer())}</div>
        </Show>
      </div>

      <Show when={error()}>
        <p class="error">{error()}</p>
      </Show>

      <Show 
        when={currentStep() !== 1}
        fallback={
          <div class="container-section">
            <h3>Container Management</h3>
            <div class="container-list">
              <h4>Existing Containers:</h4>
              <Show 
                when={containers().length > 0}
                fallback={<p>No containers found. Create one below.</p>}
              >
                <ul>
                  <For each={containers()}>{(container) => (
                    <li>
                      <div
                        class="container-item"
                        onClick={() => loadContainer(container.url)}
                        style="cursor: pointer; padding: 8px; margin-bottom:4px; display: flex; align-items: center; justify-content: space-between; background: #f5f5f5;"
                      >
                        <span>{container.name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteContainer(container.url); }}
                          class="danger"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  )}</For>
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
              <button onClick={async () => {
                await createContainer();
                setCurrentStep(2);
              }}>Create Container</button>
            </div>
          </div>
        }
      >
        <div class="files-section">
          <div style="margin-bottom: 16px;">
            <button onClick={() => { setCurrentStep(1); setSelectedContainer(''); }} style="margin-right: 16px;">Back to Containers</button>
            <span><strong>Files in:</strong> {selectedContainer()}</span>
            <button onClick={listFiles} style="margin-left: 16px;">Refresh Files List</button>
          </div>
          <h3>File Management</h3>
          <Show when={files().length > 0}>
            <ul>
              <For each={files()}>{(file) => (
                <li>
                  <div
                    onClick={() => handleItemClick(file)}
                    style={file.url.endsWith('/')
                      ? "cursor: pointer; padding: 8px; margin-bottom:4px; display: flex; align-items: center; justify-content: space-between; background: #f5f5f5;"
                      : "cursor: pointer; padding: 8px; margin-bottom:4px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #ddd;"
                    }
                  >
                    <div class="file-info">
                      {file.url.endsWith('/')
                        ? <span>{getContainerName(file.url)}</span>
                        : <span>{(file.title && file.title.trim().length > 0) ? file.title : getFileName(file.url)}</span>
                      }
                    </div>
                    <Show when={!file.url.endsWith('/')}>{
                      <div class="file-actions">
                        <button onClick={(e) => { e.stopPropagation(); startEditing(file); }} style="margin-right: 8px;">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteFile(file.url); }}>Delete</button>
                      </div>
                    }</Show>
                  </div>
                </li>
              )}</For>
            </ul>
          </Show>
          <div class="create-file-section">
            <h4>Create New File:</h4>
            <div class="input-group">
              <label>
                File Title:
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
                RDF Content (Turtle format):
                <textarea
                  value={fileContent()}
                  onInput={(e) => {
                    const newContent = e.currentTarget.value;
                    setFileContent(newContent);
                    const validation = validateRdf(newContent);
                    setRdfValidationError(validation.error || '');
                  }}
                  placeholder="Enter valid RDF content in Turtle format, e.g.:
@prefix dc: <http://purl.org/dc/elements/1.1/>.
@prefix : <#>.
:document
    dc:title 'Example';
    dc:description 'This is an example.'."
                />
              </label>
              <Show when={rdfValidationError()}>
                <p class="validation-error">{rdfValidationError()}</p>
              </Show>
            </div>
            <button 
              onClick={createFile}
              disabled={!!rdfValidationError()}
            >
              Create File
            </button>
          </div>
        </div>
      </Show>

      <Show when={previewFileItem()}>
        <div class="modal-overlay" onClick={() => setPreviewFileItem(null)} style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center;">
          <div class="modal-content" onClick={(e) => e.stopPropagation()} style="background:white; padding:16px; border-radius:8px; min-width:300px; max-width:80%; max-height:80%; overflow:auto;">
            <button onClick={() => setPreviewFileItem(null)} style="float:right;">Close</button>
            <h3>{previewFileItem()?.title}</h3>
            <Show when={previewLoading()} fallback={<pre>{previewContent()}</pre>}>
               <p>Loading preview...</p>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}

// Helper function to extract file name from URL
function getFileName(url: string): string {
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  return decodeURIComponent(fileName.replace('.ttl', ''));
} 