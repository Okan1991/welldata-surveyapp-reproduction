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
} from '@chakra-ui/react';
import {
  getSolidDataset,
  getContainedResourceUrlAll,
  getSourceUrl,
  createContainerAt,
  deleteContainer,
  deleteFile,
  FetchError
} from '@inrupt/solid-client';
import { 
  fetch,
  getDefaultSession
} from '@inrupt/solid-client-authn-browser';
import WelldataPodCreator from './WelldataPodCreator';
import { deleteContainerRecursively } from '../services/podService';
import { RepeatIcon } from '@chakra-ui/icons';

// Define the ContainerItem type
type ContainerItem = string;

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

const DeleteIcon = () => (
  <Icon viewBox="0 0 24 24" boxSize={4} color="red.500">
    <path
      fill="currentColor"
      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
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
  
  const toast = useToast();

  useEffect(() => {
    const session = getDefaultSession();
    if (session.info.isLoggedIn && session.info.webId) {
      // Extract the pod URL from the WebID
      const webIdUrl = new URL(session.info.webId);
      const podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
      setCurrentUrl(podUrl);
      loadContainer(podUrl);
    }
  }, []);

  const loadContainer = async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dataset = await getSolidDataset(url, { fetch });
      const containedUrls = getContainedResourceUrlAll(dataset);
      setContainerItems(containedUrls);
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

  const handleItemClick = (url: string) => {
    if (url.endsWith('/')) {
      loadContainer(url);
    } else {
      // For files, we could implement a preview or download feature
      window.open(url, '_blank');
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

  return (
    <Box>
      {/* Welldata Pod Creator */}
      <Card mb={6}>
        <CardBody>
          <WelldataPodCreator onPodCreated={(podUrl) => loadContainer(podUrl)} />
        </CardBody>
      </Card>

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
          <List spacing={2}>
            {containerItems.map((url) => (
              <ListItem key={url} p={2} bg="white" borderRadius="md" boxShadow="sm">
                <Flex justify="space-between" align="center">
                  <HStack spacing={3} flex="1" onClick={() => handleItemClick(url)} cursor="pointer">
                    {url.endsWith('/') ? <FolderIcon /> : <FileIcon />}
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">
                        {url.split('/').filter(Boolean).pop()}
                        {url.endsWith('/') && (
                          <Badge ml={2} colorScheme="purple" fontSize="xs">
                            Container
                          </Badge>
                        )}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {url}
                      </Text>
                    </VStack>
                  </HStack>
                  <IconButton
                    aria-label="Delete resource"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={async () => {
                      if (url.endsWith('/')) {
                        try {
                          const dataset = await getSolidDataset(url, { fetch });
                          const contents = getContainedResourceUrlAll(dataset);
                          handleDeleteClick(url, contents.length > 0);
                        } catch (error) {
                          handleDeleteClick(url, false);
                        }
                      } else {
                        handleDeleteClick(url, false);
                      }
                    }}
                  />
                </Flex>
              </ListItem>
            ))}
          </List>
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
    </Box>
  );
};

export default PodManager; 