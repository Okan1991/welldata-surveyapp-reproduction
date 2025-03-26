import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Heading,
  Text,
  VStack,
  HStack,
  List,
  ListItem,
  Divider,
  useToast,
  Spinner,
  Icon,
  Flex,
  Badge,
  IconButton,
  Card,
  CardBody,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  InputGroup,
  InputRightElement,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input as ChakraInput,
} from '@chakra-ui/react';
import {
  getSolidDataset,
  getContainedResourceUrlAll,
  getSourceUrl,
  createContainerAt,
  deleteContainer,
  deleteFile,
  FetchError,
  getFile,
  getFileWithAcl,
  getThingAll,
  getUrl,
  getDatetime,
} from '@inrupt/solid-client';
import { 
  fetch,
  getDefaultSession
} from '@inrupt/solid-client-authn-browser';
import { deleteContainerRecursively } from '../services/podService';
import { RepeatIcon, ChevronRightIcon, DeleteIcon, DownloadIcon, InfoIcon, CopyIcon, CheckIcon, ViewIcon } from '@chakra-ui/icons';
import { getFHIRPlan, downloadFHIRJSON } from '../services/fhirService';
import FhirPlanModal from './FhirPlanModal';
import QuestionnaireViewer from './QuestionnaireViewer';
import QuestionnaireResponseViewer from './QuestionnaireResponseViewer';

// Define the ContainerItem type
type ContainerItem = {
  url: string;
  name: string;
  metadata?: {
    questionnaireName?: string;
    authored?: string;
    answerCount?: number;
  };
};

// Simple icons using inline SVG
const FolderIcon = () => (
  <Icon viewBox="0 0 24 24" boxSize={5} color="brand.500">
    <path
      fill="currentColor"
      d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
    />
  </Icon>
);

const FileIcon = () => (
  <Icon viewBox="0 0 24 24" boxSize={5} color="gray.500">
    <path
      fill="currentColor"
      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
    />
  </Icon>
);

const PodManager = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [containerItems, setContainerItems] = useState<ContainerItem[]>([]);
  const [newContainerName, setNewContainerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [isRecursiveDelete, setIsRecursiveDelete] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [hasWelldataContainer, setHasWelldataContainer] = useState<boolean>(false);
  const [welldataUrl, setWelldataUrl] = useState<string | null>(null);
  const [isCopyingUrl, setIsCopyingUrl] = useState(false);
  const { isOpen: isUrlModalOpen, onOpen: onUrlModalOpen, onClose } = useDisclosure();
  const [previewFileData, setPreviewFileData] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedQuestionnaireUrl, setSelectedQuestionnaireUrl] = useState<string | null>(null);
  const [selectedResponseUrl, setSelectedResponseUrl] = useState<string | null>(null);
  
  const toast = useToast();

  // Add sorting and filtering state
  const [sortField, setSortField] = useState<keyof ContainerItem>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const session = getDefaultSession();
    if (session.info.isLoggedIn && session.info.webId) {
      // Extract the pod URL from the WebID
      const webIdUrl = new URL(session.info.webId);
      
      // Extract the Pod container URL from the WebID
      // WebID format is typically: http://localhost:3000/alice/profile/card#me
      // Pod container is typically: http://localhost:3000/alice/
      const pathParts = webIdUrl.pathname.split('/').filter(Boolean);
      
      let podUrl = '';
      // The first part of the path is usually the username/pod name
      if (pathParts.length > 0) {
        podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
      } else {
        // Fallback to the root URL if we can't extract from WebID
        podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
      }
      
      // Debug logging
      const debugMode = localStorage.getItem('welldata_debug_mode') === 'true';
      if (debugMode) {
        console.log('WebID:', session.info.webId);
        console.log('Extracted Pod URL for PodManager:', podUrl);
      }
      
      setCurrentUrl(podUrl);
      loadContainer(podUrl);
      // Check for welldata container in the Pod container
      checkWelldataContainer(podUrl);
    }
  }, []);

  // Add a useEffect to check for welldata container when the current URL changes
  useEffect(() => {
    if (currentUrl) {
      // Only check for welldata container if we're at the root level of the user's pod
      const webIdUrl = new URL(getDefaultSession().info.webId || '');
      const pathParts = webIdUrl.pathname.split('/').filter(Boolean);
      const userPodRoot = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
      
      if (currentUrl === userPodRoot) {
        checkWelldataContainer(currentUrl);
      }
    }
  }, [currentUrl]);

  const loadContainer = async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dataset = await getSolidDataset(url, { fetch });
      const containedUrls = getContainedResourceUrlAll(dataset);
      
      // Process items and fetch metadata for questionnaire responses
      const processedItems = await Promise.all(containedUrls.map(async (url) => {
        const item: ContainerItem = { 
          url, 
          name: url.split('/').filter(Boolean).pop() || '' 
        };

        // If this is a questionnaire response, fetch its metadata
        if (url.endsWith('.ttl') && url.includes('/data/surveys/responses/')) {
          try {
            const responseDataset = await getSolidDataset(url, { fetch });
            const things = getThingAll(responseDataset);
            
            // Find the main response thing
            const responseThing = things.find(thing => {
              const type = getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
              return type === 'http://hl7.org/fhir/QuestionnaireResponse';
            });

            if (responseThing) {
              // Get the questionnaire URL and extract its name
              const questionnaireUrl = getUrl(responseThing, 'http://hl7.org/fhir/questionnaire');
              if (questionnaireUrl) {
                const questionnaireName = questionnaireUrl.split('/').pop()?.replace('.ttl', '') || '';
                
                // Count answer items
                const answerItems = things.filter(thing => {
                  const type = getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                  return type === 'http://hl7.org/fhir/QuestionnaireResponseItem';
                });

                item.metadata = {
                  questionnaireName,
                  authored: getDatetime(responseThing, 'http://hl7.org/fhir/authored')?.toISOString() || '',
                  answerCount: answerItems.length
                };
              }
            }
          } catch (e) {
            console.error('Error fetching response metadata:', e);
          }
        }

        return item;
      }));

      setContainerItems(processedItems);
      setCurrentUrl(url);
      
      // Update breadcrumbs
      const baseUrl = new URL(url);
      const path = baseUrl.pathname;
      const segments = path.split('/').filter(Boolean);
      
      const newBreadcrumbs: string[] = [];
      let currentPath = `${baseUrl.protocol}//${baseUrl.hostname}${baseUrl.port ? ':' + baseUrl.port : ''}/`;
      newBreadcrumbs.push(currentPath);
      
      for (const segment of segments) {
        currentPath += `${segment}/`;
        newBreadcrumbs.push(currentPath);
      }
      
      setBreadcrumbs(newBreadcrumbs);
    } catch (e) {
      const fetchError = e as FetchError;
      setError(`Error loading container: ${fetchError.message}`);
      toast({
        title: 'Error',
        description: `Failed to load container: ${fetchError.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (file) => {
    if (file.url.endsWith('/')) {
      loadContainer(file.url);
    } else {
      previewFile(file);
    }
  };

  const createNewContainer = async () => {
    if (!newContainerName) {
      toast({
        title: 'Error',
        description: 'Please enter a container name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const containerUrl = `${currentUrl}${newContainerName}/`;
      await createContainerAt(containerUrl, { fetch });
      setNewContainerName('');
      loadContainer(currentUrl); // Refresh the current container
      
      toast({
        title: 'Success',
        description: `Container "${newContainerName}" created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      const fetchError = e as FetchError;
      setError(`Error creating container: ${fetchError.message}`);
      toast({
        title: 'Error',
        description: `Failed to create container: ${fetchError.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async (url: string, hasContents: boolean) => {
    setResourceToDelete(url);
    setIsRecursiveDelete(hasContents);
    setIsDeleteDialogOpen(true);
  };

  const deleteResource = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (url.endsWith('/')) {
        const dataset = await getSolidDataset(url, { fetch });
        const contents = getContainedResourceUrlAll(dataset);
        
        if (contents.length > 0 && isRecursiveDelete) {
          await deleteContainerRecursively(url);
        } else if (contents.length === 0) {
          await deleteContainer(url, { fetch });
        } else {
          throw new Error('Cannot delete non-empty container without confirmation');
        }
      } else {
        await deleteFile(url, { fetch });
      }
      
      loadContainer(currentUrl); // Refresh the current container
      
      toast({
        title: 'Success',
        description: `Resource deleted successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      const fetchError = e as FetchError;
      setError(`Error deleting resource: ${fetchError.message}`);
      toast({
        title: 'Error',
        description: `Failed to delete resource: ${fetchError.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setResourceToDelete(null);
      setIsRecursiveDelete(false);
    }
  };

  const navigateToBreadcrumb = (url: string) => {
    loadContainer(url);
  };

  const refreshContainer = async () => {
    if (!currentUrl) return;
    setIsRefreshing(true);
    try {
      await loadContainer(currentUrl);
      setLastRefreshTime(new Date());
      toast({
        title: 'Container Refreshed',
        description: 'Contents have been updated.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error refreshing container:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Could not refresh container contents.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add useEffect to periodically refresh
  useEffect(() => {
    if (!currentUrl) return;
    
    const refreshInterval = setInterval(() => {
      refreshContainer();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [currentUrl]);

  const handleDownloadFHIRJSON = async (url: string) => {
    try {
      const plan = await getFHIRPlan(url);
      if (plan) {
        const filename = `${plan.id || 'plan'}.json`;
        downloadFHIRJSON(plan, filename);
      } else {
        toast({
          title: 'Error',
          description: 'Could not retrieve plan data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error downloading FHIR JSON:', error);
      toast({
        title: 'Error',
        description: `Failed to download FHIR JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const checkWelldataContainer = async (podUrl: string) => {
    try {
      // Debug logging
      const debugMode = localStorage.getItem('welldata_debug_mode') === 'true';
      if (debugMode) {
        console.log('Checking for welldata container in:', podUrl);
      }
      
      const dataset = await getSolidDataset(podUrl, { fetch });
      const containedUrls = getContainedResourceUrlAll(dataset);
      
      // Check if welldata container exists in the current container
      const welldataUrl = containedUrls.find(url => url.endsWith('welldata/'));
      
      if (welldataUrl) {
        if (debugMode) {
          console.log('Found welldata container at:', welldataUrl);
        }
        
        setHasWelldataContainer(true);
        setWelldataUrl(welldataUrl);
        
        // Check if the data/plans/initial-plan.ttl exists
        try {
          const initialPlanUrl = `${welldataUrl}data/plans/initial-plan.ttl`;
          await getSolidDataset(initialPlanUrl, { fetch });
          
          // If we get here, the initial plan exists
          toast({
            title: 'WellData Container Ready',
            description: 'Your WellData container is properly set up with an initial plan.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } catch (error) {
          // Initial plan might not exist, but that's okay - it will be created automatically
          console.log('Initial plan not found, it will be created automatically if needed.');
        }
      } else {
        if (debugMode) {
          console.log('No welldata container found in:', podUrl);
        }
        
        setHasWelldataContainer(false);
        setWelldataUrl(null);
      }
    } catch (error) {
      console.error('Error checking for welldata container:', error);
      setHasWelldataContainer(false);
      setWelldataUrl(null);
    }
  };

  const handleCopyUrl = async () => {
    if (!welldataUrl) return;
    
    setIsCopyingUrl(true);
    try {
      await navigator.clipboard.writeText(welldataUrl);
      toast({
        title: 'Copied',
        description: 'Container URL copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error copying URL:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy URL',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsCopyingUrl(false);
    }
  };

  const previewFile = async (file) => {
    console.log('previewFile called with:', file);
    // Check if this is a questionnaire file
    if (file.url.endsWith('.ttl') && file.url.includes('/metadata/surveys/definitions/')) {
      console.log('Setting selectedQuestionnaireUrl to:', file.url);
      setSelectedQuestionnaireUrl(file.url);
      return;
    }

    // For FHIR plan files, use the same approach as FhirPlanModal
    if (file.url.endsWith('.ttl') && file.url.includes('/plans/')) {
      console.log('Loading FHIR plan from:', file.url);
      const plan = await getFHIRPlan(file.url);
      if (plan) {
        setPreviewFileData({...file, content: JSON.stringify(plan, null, 2), isPlan: true});
      } else {
        setPreviewFileData({...file, content: "Could not load FHIR plan data", isPlan: true});
      }
    } else {
      // For other files, fetch and display raw content
      console.log('Loading raw content from:', file.url);
      const response = await getFile(file.url, { fetch });
      const text = await response.text();
      setPreviewFileData({...file, content: text});
    }
    console.log('Setting isPreviewModalOpen to true');
    setIsPreviewModalOpen(true);
  };

  // Add sorting function
  const sortItems = (items: ContainerItem[]) => {
    return [...items].sort((a, b) => {
      if (sortField === 'metadata') {
        const aValue = a.metadata?.authored || '';
        const bValue = b.metadata?.authored || '';
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortDirection === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  // Add filtering function
  const filterItems = (items: ContainerItem[]) => {
    return items.filter(item => {
      const matchesType = filterType === 'all' || 
        (filterType === 'response' && item.url.includes('/data/surveys/responses/')) ||
        (filterType === 'questionnaire' && item.url.includes('/metadata/surveys/definitions/')) ||
        (filterType === 'plan' && item.url.includes('/plans/'));
      
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.metadata?.questionnaireName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  };

  // Add a function to check if container contains questionnaire responses
  const hasQuestionnaireResponses = (items: ContainerItem[]) => {
    return items.some(item => 
      item.url.endsWith('.ttl') && 
      item.url.includes('/data/surveys/responses/')
    );
  };

  return (
    <Box>
      {/* Breadcrumb navigation */}
      <Flex wrap="wrap" mb={4} alignItems="center">
        {breadcrumbs.map((url, index) => (
          <HStack key={url} spacing={1}>
            {index > 0 && <Text color="gray.500">/</Text>}
            <Button
              size="sm"
              variant="link"
              colorScheme="purple"
              onClick={() => navigateToBreadcrumb(url)}
            >
              {index === 0 ? 'Root' : url.split('/').filter(Boolean).pop()}
            </Button>
          </HStack>
        ))}
      </Flex>

      {/* Create new container */}
      <Box mb={6} p={4} borderRadius="md" bg="gray.50">
        <Heading as="h3" size="md" mb={4}>
          Create New Container
        </Heading>
        <HStack>
          <Input
            value={newContainerName}
            onChange={(e) => setNewContainerName(e.target.value)}
            placeholder="Enter container name"
            bg="white"
          />
          <Button
            colorScheme="purple"
            onClick={createNewContainer}
            isLoading={isLoading}
            loadingText="Creating..."
          >
            Create
          </Button>
        </HStack>
      </Box>

      {/* Container contents */}
      <Box p={4} borderRadius="md" bg="gray.50">
        <Heading as="h3" size="md" mb={4}>
          Container Contents
        </Heading>
        
        {isLoading ? (
          <Flex justify="center" align="center" p={8}>
            <Spinner size="xl" color="purple.500" />
          </Flex>
        ) : containerItems.length > 0 ? (
          <>
            {/* Only show filters and table for containers with questionnaire responses */}
            {hasQuestionnaireResponses(containerItems) && (
              <>
                <HStack spacing={4} mb={4}>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    width="200px"
                  >
                    <option value="all">All Items</option>
                    <option value="response">Responses</option>
                    <option value="questionnaire">Questionnaires</option>
                    <option value="plan">Plans</option>
                  </Select>
                  <ChakraInput
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    width="300px"
                  />
                </HStack>
                
                <Box overflowX="auto">
                  <Table variant="simple" bg="white" borderRadius="md">
                    <Thead>
                      <Tr>
                        <Th cursor="pointer" onClick={() => {
                          setSortField('name');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}>
                          Name
                        </Th>
                        <Th>Type</Th>
                        <Th cursor="pointer" onClick={() => {
                          setSortField('metadata');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}>
                          Submitted
                        </Th>
                        <Th>Questionnaire</Th>
                        <Th>Answers</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filterItems(sortItems(containerItems)).map((item) => {
                        const isPlan = item.url.endsWith('.ttl') && item.url.includes('/plans/');
                        const isQuestionnaire = item.url.endsWith('.ttl') && item.url.includes('/metadata/surveys/definitions/');
                        const isResponse = item.url.endsWith('.ttl') && item.url.includes('/data/surveys/responses/');
                        const isContainer = item.url.endsWith('/');
                        
                        return (
                          <Tr key={item.url} _hover={{ bg: 'gray.50' }}>
                            <Td>
                              <HStack>
                                {isContainer ? <FolderIcon /> : <FileIcon />}
                                <Text>{item.name}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              {isPlan && <Badge colorScheme="green">FHIR Plan</Badge>}
                              {isQuestionnaire && <Badge colorScheme="blue">Questionnaire</Badge>}
                              {isResponse && <Badge colorScheme="purple">Response</Badge>}
                            </Td>
                            <Td>
                              {item.metadata?.authored && 
                                new Date(item.metadata.authored).toLocaleString()}
                            </Td>
                            <Td>{item.metadata?.questionnaireName || '-'}</Td>
                            <Td>{item.metadata?.answerCount || '-'}</Td>
                            <Td>
                              <HStack spacing={2}>
                                {isPlan && (
                                  <IconButton
                                    aria-label="Download FHIR JSON"
                                    icon={<DownloadIcon />}
                                    size="sm"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadFHIRJSON(item.url);
                                    }}
                                  />
                                )}
                                {isQuestionnaire && (
                                  <IconButton
                                    aria-label="View questionnaire"
                                    icon={<ViewIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedQuestionnaireUrl(item.url);
                                    }}
                                  />
                                )}
                                {isResponse && (
                                  <IconButton
                                    aria-label="View response"
                                    icon={<ViewIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="purple"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedResponseUrl(item.url);
                                    }}
                                  />
                                )}
                                <IconButton
                                  aria-label="Delete"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(item.url, false);
                                  }}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              </>
            )}

            {/* Show list view for containers without questionnaire responses */}
            {!hasQuestionnaireResponses(containerItems) && (
              <List spacing={2}>
                {containerItems.map((item) => {
                  const isPlan = item.url.endsWith('.ttl') && item.url.includes('/plans/');
                  const isQuestionnaire = item.url.endsWith('.ttl') && item.url.includes('/metadata/surveys/definitions/');
                  const isResponse = item.url.endsWith('.ttl') && item.url.includes('/data/surveys/responses/');
                  const isContainer = item.url.endsWith('/');
                  
                  return (
                    <ListItem key={item.url}>
                      <HStack justify="space-between" w="100%" p={2} _hover={{ bg: 'gray.50' }} borderRadius="md">
                        <HStack flex={1} cursor="pointer" onClick={() => handleItemClick(item)}>
                          {isContainer ? <FolderIcon /> : <FileIcon />}
                          <Text>{item.name}</Text>
                          {isPlan && <Badge colorScheme="green">FHIR Plan</Badge>}
                          {isQuestionnaire && <Badge colorScheme="blue">Questionnaire</Badge>}
                          {isResponse && <Badge colorScheme="purple">Response</Badge>}
                        </HStack>
                        <HStack>
                          {isPlan && (
                            <IconButton
                              aria-label="Download FHIR JSON"
                              icon={<DownloadIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFHIRJSON(item.url);
                              }}
                            />
                          )}
                          {isQuestionnaire && (
                            <IconButton
                              aria-label="View questionnaire"
                              icon={<ViewIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQuestionnaireUrl(item.url);
                              }}
                            />
                          )}
                          {isResponse && (
                            <IconButton
                              aria-label="View response"
                              icon={<ViewIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="purple"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedResponseUrl(item.url);
                              }}
                            />
                          )}
                          <IconButton
                            aria-label="Delete"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(item.url, false);
                            }}
                          />
                        </HStack>
                      </HStack>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </>
        ) : (
          <Box p={4} textAlign="center" bg="white" borderRadius="md">
            <Text color="gray.500">This container is empty</Text>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setResourceToDelete(null);
          setIsRecursiveDelete(false);
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Resource
            </AlertDialogHeader>

            <AlertDialogBody>
              {isRecursiveDelete ? (
                <>
                  <Text mb={4}>
                    This container is not empty. Deleting it will also delete all its contents.
                  </Text>
                  <Text fontWeight="bold">Are you sure you want to delete this container and all its contents?</Text>
                </>
              ) : (
                <Text>Are you sure you want to delete this resource?</Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => {
                setIsDeleteDialogOpen(false);
                setResourceToDelete(null);
                setIsRecursiveDelete(false);
              }}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => resourceToDelete && deleteResource(resourceToDelete)}
                ml={3}
                isLoading={isLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Container URL Modal */}
      <Modal isOpen={isUrlModalOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Welldata Container URL</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>This is the URL of your Welldata container:</Text>
              <InputGroup>
                <Input
                  value={welldataUrl || ''}
                  readOnly
                  pr="4.5rem"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={handleCopyUrl}
                    isLoading={isCopyingUrl}
                    loadingText="Copying..."
                  >
                    {isCopyingUrl ? <CheckIcon /> : <CopyIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <VStack spacing={4} align="stretch" mt={4}>
        <HStack justify="space-between">
          <Heading size="md">Pod Manager</Heading>
          <HStack>
            {currentUrl && (
              <Button
                leftIcon={<RepeatIcon />}
                onClick={refreshContainer}
                isLoading={isRefreshing}
                size="sm"
                colorScheme="blue"
                variant="outline"
              >
                Refresh
              </Button>
            )}
            {lastRefreshTime && (
              <Text fontSize="sm" color="gray.500">
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </Text>
            )}
          </HStack>
        </HStack>
      </VStack>

      <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>
            {previewFileData?.isPlan ? 'FHIR Plan: ' : 'File: '}
            {previewFileData?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {previewFileData?.content ? (
              <Box 
                as="pre" 
                p={3} 
                bg="gray.50" 
                borderRadius="md" 
                fontSize="sm" 
                overflowX="auto"
                whiteSpace="pre-wrap"
              >
                {previewFileData.content}
              </Box>
            ) : (
              <Spinner />
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add QuestionnaireViewer modal */}
      {selectedQuestionnaireUrl && (
        <QuestionnaireViewer
          questionnaireUrl={selectedQuestionnaireUrl}
          isOpen={!!selectedQuestionnaireUrl}
          onClose={() => setSelectedQuestionnaireUrl(null)}
        />
      )}

      {selectedResponseUrl && (
        <QuestionnaireResponseViewer
          responseUrl={selectedResponseUrl}
          isOpen={!!selectedResponseUrl}
          onClose={() => setSelectedResponseUrl(null)}
        />
      )}
    </Box>
  );
};

export default PodManager; 