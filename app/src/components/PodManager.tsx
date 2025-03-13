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
  const [editingFile, setEditingFile] = createSignal<{ url: string; title: string; description: string; etag?: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);
  const [isEditLoading, setIsEditLoading] = createSignal(false);
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
    if (!content || content.trim() === '') {
      return { 
        isValid: false, 
        error: 'Content cannot be empty' 
      };
    }

    const parser = new N3Parser();
    try {
      // Try to parse the content as Turtle (TTL) format
      parser.parse(content);
      
      // Additional validation for common Turtle syntax issues
      if (content.includes('<>')) {
        return { 
          isValid: false, 
          error: 'Invalid RDF: Empty URI references (<>) are not allowed in Turtle syntax' 
        };
      }
      
      // Check for unbalanced quotes
      const singleQuotes = (content.match(/'/g) || []).length;
      const doubleQuotes = (content.match(/"/g) || []).length;
      if (singleQuotes % 2 !== 0) {
        return { 
          isValid: false, 
          error: 'Invalid RDF: Unbalanced single quotes in the content' 
        };
      }
      if (doubleQuotes % 2 !== 0) {
        return { 
          isValid: false, 
          error: 'Invalid RDF: Unbalanced double quotes in the content' 
        };
      }
      
      // Check for common predicate-object pattern issues
      if (content.includes('..')) {
        return { 
          isValid: false, 
          error: 'Invalid RDF: Double dots (..) are not valid in Turtle syntax' 
        };
      }
      
      return { isValid: true };
    } catch (error: any) {
      // Provide more user-friendly error messages for common syntax errors
      let errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('Expected')) {
        errorMessage = `Syntax error: ${errorMessage}`;
      }
      
      return { 
        isValid: false, 
        error: `Invalid RDF content: ${errorMessage}` 
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
      const isWelldataContainer = selectedContainer().includes('/welldata/');
      
      // Special case for welldata container
      if (isWelldataContainer) {
        console.debug('Using special approach for creating file in welldata container');
        try {
          // Create a simpler Turtle document for welldata files
          const simplifiedTurtle = `
@prefix dcterms: <http://purl.org/dc/terms/>.

<#${newFileName()}> 
    dcterms:title "${newFileName()}" ;
    dcterms:description """${fileContent().replace(/"/g, '\\"')}""" .
`;
          
          // Direct approach without using Solid Client library
          const response = await session.fetch(fileUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'text/turtle',
            },
            body: simplifiedTurtle
          });
          
          if (!response.ok) {
            console.error('Error response from welldata file creation:', response.status, response.statusText);
            const responseText = await response.text();
            console.error('Response body:', responseText);
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          
          console.debug('File created successfully in welldata container');
          await listFiles();
          setNewFileName('');
          setFileContent('');
          setError('');
          setRdfValidationError('');
          return;
        } catch (e: any) {
          console.error('Error creating file in welldata container:', e);
          throw e;
        }
      }
      
      // Standard approach for non-welldata containers
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

  const startEditing = async (file: { url: string; title?: string; description?: string }) => {
    console.debug('Starting edit for file:', file);
    
    // Set initial editing file with fallback values
    const editFile = {
      url: file.url,
      title: file.title || getFileName(file.url),
      description: "Loading content..." // Placeholder while loading
    };
    
    setEditingFile(editFile);
    setIsEditModalOpen(true);
    setIsEditLoading(true);
    console.debug('Edit modal opened with initial data, fetching content...');
    
    try {
      // Fetch the actual file content with raw response to access headers
      const response = await session.fetch(file.url);
      const etag = response.headers.get('ETag');
      if (etag) {
        console.debug('Got ETag:', etag);
      }
      
      const text = await response.text();
      console.debug('File content loaded successfully');
      
      // Update the editing file with the actual content and ETag
      setEditingFile({
        ...editFile,
        description: text,
        ...(etag && { etag })
      });
      
      // Validate the loaded content
      const validation = validateRdf(text);
      setRdfValidationError(validation.error || '');
      if (validation.error) {
        console.warn('Loaded content has RDF validation issues:', validation.error);
      }
    } catch (err) {
      console.error('Error loading file content for editing:', err);
      setEditingFile({
        ...editFile,
        description: `Error loading file content: ${err instanceof Error ? err.message : 'Unknown error'}`
      });
      setRdfValidationError('Could not load file content properly');
    } finally {
      setIsEditLoading(false);
    }
  };

  const cancelEditing = () => {
    console.debug('Canceling edit');
    setEditingFile(null);
    setIsEditModalOpen(false);
  };

  const saveFileChanges = async () => {
    if (!editingFile()) return;
    console.debug('Attempting to save file changes:', editingFile());

    // Validate RDF content before submission
    const validation = validateRdf(editingFile()!.description);
    if (!validation.isValid) {
      console.error('RDF validation failed:', validation.error);
      setError(validation.error || 'Invalid RDF content');
      return;
    }

    try {
      const file = editingFile()!;
      console.debug('Saving changes to file:', file.url);
      
      // Check if this is a welldata file (special case)
      const isWelldataFile = file.url.includes('/welldata/');
      const isInitialPlanFile = file.url.includes('initial-plan.ttl');
      console.debug('Is welldata file:', isWelldataFile);
      console.debug('Is initial-plan.ttl file:', isInitialPlanFile);
      
      // Special case for initial-plan.ttl
      if (isInitialPlanFile) {
        console.debug('Using special approach for initial-plan.ttl file');
        try {
          // For initial-plan.ttl, we'll try a completely different approach
          // Create a simpler Turtle document that might be more compatible
          const simplifiedTurtle = `
@prefix dcterms: <http://purl.org/dc/terms/>.
@prefix fhir: <http://hl7.org/fhir/>.

<#initial-plan> 
    dcterms:title "initial-plan" ;
    dcterms:description """${file.description.replace(/"/g, '\\"')}""" .
`;
          
          console.debug('Using simplified Turtle for initial-plan.ttl:', simplifiedTurtle);
          
          // Direct approach without ETag for initial-plan.ttl
          const response = await session.fetch(file.url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'text/turtle',
              // No If-Match header to bypass ETag checks
            },
            body: simplifiedTurtle
          });
          
          if (!response.ok) {
            console.error('Error response from initial-plan PUT:', response.status, response.statusText);
            const responseText = await response.text();
            console.error('Response body:', responseText);
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          
          console.debug('initial-plan.ttl file saved successfully using direct fetch PUT');
          setIsEditModalOpen(false);
          setEditingFile(null);
          await listFiles();
          setError('');
          return;
        } catch (e: any) {
          console.error('Error saving initial-plan.ttl file with direct fetch:', e);
          throw e;
        }
      }
      // For welldata files (but not initial-plan.ttl), we'll use a different approach
      else if (isWelldataFile) {
        console.debug('Using special approach for welldata file');
        try {
          // Direct approach: Use fetch with text/turtle content type
          const response = await session.fetch(file.url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'text/turtle',
              // Skip If-Match header for welldata files to bypass ETag checks
            },
            body: file.description
          });
          
          if (!response.ok) {
            console.error('Error response from welldata PUT:', response.status, response.statusText);
            const responseText = await response.text();
            console.error('Response body:', responseText);
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          
          console.debug('Welldata file saved successfully using direct fetch PUT');
          setIsEditModalOpen(false);
          setEditingFile(null);
          await listFiles();
          setError('');
          return;
        } catch (e: any) {
          console.error('Error saving welldata file with direct fetch:', e);
          throw e;
        }
      }
      
      // For non-welldata files, try the standard approaches
      
      // Use the stored ETag if available, otherwise fetch it
      let etag = file.etag;
      if (!etag) {
        try {
          console.debug('Fetching current version of file to get ETag');
          const response = await session.fetch(file.url, { method: 'HEAD' });
          const responseEtag = response.headers.get('ETag');
          if (responseEtag) {
            console.debug('Got ETag:', responseEtag);
            etag = responseEtag;
          }
        } catch (err) {
          console.warn('Could not fetch ETag:', err);
        }
      }
      
      // First attempt: Try using the Solid Client library
      try {
        console.debug('Attempting to save using saveSolidDatasetAt');
        
        // Create new dataset with updated content
        let dataset = createSolidDataset();
        const thing = buildThing(createThing({ name: getFileName(file.url) }))
          .addStringNoLocale(DCTERMS.title, file.title)
          .addStringNoLocale(DCTERMS.description, file.description)
          .build();

        dataset = setThing(dataset, thing);
        
        // Prepare options with ETag if available
        const options = etag 
          ? { fetch: session.fetch, conditions: { ifMatch: etag } }
          : { fetch: session.fetch };
        
        // Save the updated dataset with the ETag condition if available
        await saveSolidDatasetAt(file.url, dataset, options);
        
        console.debug('File saved successfully using saveSolidDatasetAt');
        setIsEditModalOpen(false);
        setEditingFile(null);
        await listFiles();
        setError('');
        return; // Exit if successful
      } catch (e: any) {
        console.error('Error saving file with saveSolidDatasetAt:', e);
        
        // If it's not a 412 error, rethrow to be handled by the outer catch
        if (e.statusCode !== 412) {
          throw e;
        }
        
        // If it's a 412 error, try the fallback approach
        console.debug('Got 412 error, trying fallback approach with direct fetch');
      }
      
      // Fallback approach: Try using direct fetch with PUT
      try {
        console.debug('Attempting to save using direct fetch PUT');
        
        // Prepare headers
        const headers: HeadersInit = {
          'Content-Type': 'text/turtle',
        };
        
        // Add If-Match header if we have an ETag
        if (etag) {
          headers['If-Match'] = etag;
        }
        
        // Make the PUT request
        const response = await session.fetch(file.url, {
          method: 'PUT',
          headers,
          body: file.description
        });
        
        if (!response.ok) {
          console.error('Error response from PUT:', response.status, response.statusText);
          const responseText = await response.text();
          console.error('Response body:', responseText);
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        
        console.debug('File saved successfully using direct fetch PUT');
        setIsEditModalOpen(false);
        setEditingFile(null);
        await listFiles();
        setError('');
      } catch (e: any) {
        console.error('Error saving file with direct fetch PUT:', e);
        throw e; // Rethrow to be handled by the outer catch
      }
    } catch (e: any) {
      console.error('Error saving file (all methods failed):', e);
      
      // Provide more detailed error messages for common save errors
      if (e.statusCode === 412) {
        setError(`Error saving file: Precondition Failed (412). The file may have been modified by another user or you don't have write permissions. Try refreshing and editing again.`);
      } else if (e.statusCode === 401 || e.statusCode === 403) {
        setError(`Error saving file: You don't have permission to modify this file (${e.statusCode}).`);
      } else {
        setError(`Error saving file: ${e.message || e}`);
      }
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
      {/* Compact header with info button */}
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 1.5rem;">SOLID Pod Manager</h2>
        <button 
          class="info-button"
          onClick={() => setShowInfo(!showInfo())}
          title="About SOLID Data Storage"
          style="width: 24px; height: 24px; border-radius: 50%; background: #f0f0f0; border: none; cursor: pointer;"
        >
          i
        </button>
      </div>

      <Show when={showInfo()}>
        <div class="info-dialog" style="background: #f9f9f9; padding: 12px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #eee;">
          <h3 style="margin-top: 0;">About SOLID Data Storage</h3>
          <p>In SOLID, all data is stored as RDF (Resource Description Framework). This means:</p>
          <ul>
            <li>Files are created as .ttl (Turtle) files containing structured data</li>
            <li>Each file has properties like 'title' and 'description' defined using standard vocabularies</li>
            <li>We're using the Dublin Core Terms vocabulary (DCTERMS) to describe the files</li>
          </ul>
        </div>
      </Show>

      {/* Improved breadcrumb navigation */}
      <div class="breadcrumbs" style="margin-bottom: 16px; display: flex; align-items: center; background: #f5f5f5; padding: 8px; border-radius: 4px;">
        <div 
          class="breadcrumb-item" 
          onClick={() => {
            setCurrentStep(1);
            setSelectedContainer('');
            setFiles([]);
          }}
          style={{ 
            cursor: 'pointer',
            padding: '4px 8px',
            'background-color': currentStep() === 1 ? '#e0e0e0' : 'transparent',
            'border-radius': '4px',
            'font-weight': currentStep() === 1 ? 'bold' : 'normal'
          }}
        >
          Root
        </div>
        
        {selectedContainer() && (
          <>
            <span style="margin: 0 8px; color: #666;">/</span>
            <div 
              class="breadcrumb-item active"
              style={{
                padding: '4px 8px',
                'background-color': '#e0e0e0',
                'border-radius': '4px',
                'font-weight': 'bold'
              }}
            >
              {getContainerName(selectedContainer())}
            </div>
            <button 
              onClick={listFiles} 
              style="margin-left: 8px; background: none; border: none; cursor: pointer; color: #0066cc;"
              title="Refresh"
            >
              ↻
            </button>
          </>
        )}
      </div>

      <Show when={error()}>
        <p class="error" style="color: #d32f2f; background: #ffebee; padding: 8px; border-radius: 4px;">{error()}</p>
      </Show>

      <Show 
        when={currentStep() !== 1}
        fallback={
          <div class="container-section">
            <div class="container-list" style="margin-bottom: 24px;">
              <h3 style="margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 8px;">Container Management</h3>
              <Show 
                when={containers().length > 0}
                fallback={<p style="color: #666; font-style: italic;">No containers found. Create one below.</p>}
              >
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <For each={containers()}>{(container) => (
                    <li style="margin-bottom: 8px;">
                      <div
                        class="container-item"
                        onClick={() => loadContainer(container.url)}
                        style="cursor: pointer; padding: 10px; display: flex; align-items: center; justify-content: space-between; background: #f5f5f5; border-radius: 4px; transition: background 0.2s; border: 1px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#ddd'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                      >
                        <span>{container.name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteContainer(container.url); }}
                          class="danger"
                          style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;"
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
              <h4 style="margin-top: 0;">Create New Container</h4>
              <div class="input-group" style="display: flex; margin-bottom: 12px;">
                <input
                  type="text"
                  value={newContainerName()}
                  onInput={(e) => setNewContainerName(e.currentTarget.value)}
                  placeholder="Enter container name (e.g., my-files)"
                  style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px 0 0 4px;"
                />
                <button 
                  onClick={async () => {
                    await createContainer();
                    setCurrentStep(2);
                  }}
                  style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 0 4px 4px 0; cursor: pointer;"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        }
      >
        <div class="files-section">
          <h3 style="margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 8px;">
            {selectedContainer() 
              ? `Files in ${getContainerName(selectedContainer())}` 
              : 'Container Management'}
          </h3>
          <Show when={files().length > 0}>
            <ul style="list-style: none; padding: 0; margin: 0 0 24px 0;">
              <For each={files()}>{(file) => (
                <li style="margin-bottom: 8px;">
                  <div
                    onClick={() => handleItemClick(file)}
                    style={file.url.endsWith('/')
                      ? "cursor: pointer; padding: 10px; display: flex; align-items: center; justify-content: space-between; background: #f5f5f5; border-radius: 4px; border: 1px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"
                      : "cursor: pointer; padding: 10px; display: flex; align-items: center; justify-content: space-between; background: white; border-radius: 4px; border: 1px solid #ddd;"}
                  >
                    <div class="file-info">
                      {file.url.endsWith('/')
                        ? <span>{getContainerName(file.url)}</span>
                        : <span>{(file.title && file.title.trim().length > 0) ? file.title : getFileName(file.url)}</span>
                      }
                    </div>
                    <Show when={!file.url.endsWith('/')}>{
                      <div class="file-actions">
                        <button 
                          onClick={(e) => { e.stopPropagation(); startEditing(file); }} 
                          style="margin-right: 8px; background: #2196f3; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteFile(file.url); }}
                          style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;"
                        >
                          Delete
                        </button>
                      </div>
                    }</Show>
                  </div>
                </li>
              )}</For>
            </ul>
          </Show>
          <div class="create-file-section">
            <h4 style="margin-top: 0;">Create New File</h4>
            <div class="input-group" style="margin-bottom: 12px;">
              <input
                type="text"
                value={newFileName()}
                onInput={(e) => setNewFileName(e.currentTarget.value)}
                placeholder="Enter file name"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px;"
              />
            </div>
            <div class="input-group" style="margin-bottom: 12px;">
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
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 120px; font-family: monospace;"
              />
              <Show when={rdfValidationError()}>
                <p style="color: #d32f2f; margin: 4px 0 0 0; font-size: 0.9em;">{rdfValidationError()}</p>
              </Show>
            </div>
            <button 
              onClick={createFile}
              disabled={!!rdfValidationError()}
              style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;"
            >
              Create File
            </button>
          </div>
        </div>
      </Show>

      {/* File Preview Modal */}
      <Show when={previewFileItem()}>
        <div class="modal-overlay" onClick={() => setPreviewFileItem(null)} style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index: 1000;">
          <div class="modal-content" onClick={(e) => e.stopPropagation()} style="background:white; padding:24px; border-radius:8px; min-width:300px; max-width:80%; max-height:80%; overflow:auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="margin: 0;">{previewFileItem()?.title}</h3>
              <button 
                onClick={() => setPreviewFileItem(null)} 
                style="background: none; border: none; font-size: 1.5rem; cursor: pointer; line-height: 1;"
              >
                ×
              </button>
            </div>
            <Show when={previewLoading()} fallback={
              <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow: auto; max-height: 400px;">{previewContent()}</pre>
            }>
               <p style="text-align: center; padding: 24px;">Loading preview...</p>
            </Show>
          </div>
        </div>
      </Show>

      {/* File Edit Modal */}
      <Show when={isEditModalOpen() && editingFile()}>
        <div class="modal-overlay" onClick={cancelEditing} style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index: 1000;">
          <div class="modal-content" onClick={(e) => e.stopPropagation()} style="background:white; padding:24px; border-radius:8px; width:90%; max-width:800px; max-height:90%; overflow:auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="margin: 0;">Edit File: {editingFile()?.title}</h3>
              <button 
                onClick={cancelEditing} 
                style="background: none; border: none; font-size: 1.5rem; cursor: pointer; line-height: 1;"
              >
                ×
              </button>
            </div>
            
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold;">Title:</label>
              <input 
                type="text" 
                value={editingFile()?.title} 
                onInput={(e) => {
                  const file = editingFile();
                  if (file) {
                    console.debug('Title changed:', e.currentTarget.value);
                    setEditingFile({...file, title: e.currentTarget.value});
                  }
                }}
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
              />
            </div>
            
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold;">Content (RDF Turtle format):</label>
              <Show when={isEditLoading()} fallback={
                <>
                  <textarea 
                    value={editingFile()?.description} 
                    onInput={(e) => {
                      const file = editingFile();
                      if (file) {
                        console.debug('Content changed, validating...');
                        const newContent = e.currentTarget.value;
                        setEditingFile({...file, description: newContent});
                        
                        // Validate RDF content
                        const validation = validateRdf(newContent);
                        setRdfValidationError(validation.error || '');
                      }
                    }}
                    style={`width: 100%; padding: 8px; border: 1px solid ${rdfValidationError() ? '#d32f2f' : '#ddd'}; border-radius: 4px; min-height: 200px; font-family: monospace; resize: vertical;`}
                    placeholder={`Enter valid Turtle (TTL) syntax here. Example:
@prefix dc: <http://purl.org/dc/elements/1.1/>.
@prefix ex: <http://example.org/>.

<#resource>
    dc:title "Example Resource";
    dc:description "This is an example resource in Turtle format.";
    ex:status "active".`}
                  />
                  <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.85em; color: #666;">
                      <span>Syntax: Turtle (TTL)</span>
                      <span style="margin-left: 16px;">Status: 
                        <span style={`font-weight: bold; color: ${rdfValidationError() ? '#d32f2f' : '#4caf50'};`}>
                          {rdfValidationError() ? 'Invalid' : 'Valid'}
                        </span>
                      </span>
                    </div>
                    <a 
                      href="https://www.w3.org/TR/turtle/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style="font-size: 0.85em; color: #2196f3; text-decoration: none;"
                    >
                      Turtle Syntax Reference
                    </a>
                  </div>
                </>
              }>
                <div style="text-align: center; padding: 24px; background: #f5f5f5; border-radius: 4px; min-height: 200px; display: flex; align-items: center; justify-content: center;">
                  <div>
                    <div class="spinner" style="width: 40px; height: 40px; border: 3px solid #ddd; border-top: 3px solid #2196f3; border-radius: 50%; margin: 0 auto 16px;"></div>
                    <p style="margin: 0; color: #666;">Loading file content...</p>
                  </div>
                </div>
                <style>
                  {`
                    .spinner {
                      animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                </style>
              </Show>
              <Show when={rdfValidationError()}>
                <div style="background-color: #ffebee; border-left: 4px solid #d32f2f; padding: 8px 12px; margin-top: 8px; border-radius: 0 4px 4px 0;">
                  <p style="color: #d32f2f; margin: 0; font-size: 0.9em; font-weight: bold;">Validation Error</p>
                  <p style="color: #d32f2f; margin: 4px 0 0 0; font-size: 0.9em;">{rdfValidationError()}</p>
                </div>
              </Show>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 8px;">
              <button 
                onClick={cancelEditing}
                style="padding: 8px 16px; background: #f5f5f5; color: #333; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;"
              >
                Cancel
              </button>
              <button 
                onClick={saveFileChanges}
                disabled={!!rdfValidationError() || isEditLoading()}
                style={`padding: 8px 16px; background: ${rdfValidationError() || isEditLoading() ? '#cccccc' : '#4caf50'}; color: white; border: none; border-radius: 4px; cursor: ${rdfValidationError() || isEditLoading() ? 'not-allowed' : 'pointer'};`}
              >
                Save Changes
              </button>
            </div>
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