import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Text,
  Heading,
  useToast,
  List,
  ListItem,
  IconButton,
  Flex,
  Spacer,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import {
  getSolidDataset,
  getContainedResourceUrlAll,
  createContainerAt,
  deleteContainer,
  getSourceUrl,
  FetchError
} from '@inrupt/solid-client';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';

const ContainerManager: React.FC = () => {
  const [podUrl, setPodUrl] = useState('');
  const [containers, setContainers] = useState<string[]>([]);
  const [newContainerName, setNewContainerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const session = getDefaultSession();
    if (session.info.isLoggedIn && session.info.webId) {
      // Extract the Pod URL from the WebID
      // Typically, the WebID is in the format: http://localhost:3000/[podname]/profile/card#me
      const webIdUrl = session.info.webId;
      const podUrlFromWebId = webIdUrl.split('/profile')[0];
      setPodUrl(podUrlFromWebId);
      fetchContainers(podUrlFromWebId);
    }
  }, []);

  const fetchContainers = async (url: string) => {
    if (!url) return;
    
    setLoading(true);
    setError('');
    
    try {
      const dataset = await getSolidDataset(url, { fetch: getDefaultSession().fetch });
      const containerUrls = getContainedResourceUrlAll(dataset)
        .filter(url => url.endsWith('/'));
      
      setContainers(containerUrls);
    } catch (e) {
      console.error('Error fetching containers:', e);
      const fetchError = e as FetchError;
      setError(`Failed to fetch containers: ${fetchError.message}`);
      toast({
        title: 'Error',
        description: `Failed to fetch containers: ${fetchError.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const createContainer = async () => {
    if (!podUrl || !newContainerName) {
      setError('Pod URL and container name are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const containerUrl = `${podUrl}/${newContainerName}/`;
      await createContainerAt(containerUrl, { fetch: getDefaultSession().fetch });
      
      toast({
        title: 'Success',
        description: `Container ${newContainerName} created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setNewContainerName('');
      fetchContainers(podUrl);
    } catch (e) {
      console.error('Error creating container:', e);
      const fetchError = e as FetchError;
      setError(`Failed to create container: ${fetchError.message}`);
      toast({
        title: 'Error',
        description: `Failed to create container: ${fetchError.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const removeContainer = async (containerUrl: string) => {
    setLoading(true);
    setError('');
    
    try {
      await deleteContainer(containerUrl, { fetch: getDefaultSession().fetch });
      
      toast({
        title: 'Success',
        description: `Container deleted successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      fetchContainers(podUrl);
    } catch (e) {
      console.error('Error deleting container:', e);
      const fetchError = e as FetchError;
      setError(`Failed to delete container: ${fetchError.message}`);
      toast({
        title: 'Error',
        description: `Failed to delete container: ${fetchError.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bg={cardBg} shadow="md" width="100%">
      <CardHeader>
        <Heading size="md">Container Management</Heading>
        <Text fontSize="sm" color="gray.500">
          Create and manage containers in your Solid Pod
        </Text>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Create Container Form */}
          <Box>
            <FormControl>
              <FormLabel>Pod URL</FormLabel>
              <Input
                value={podUrl}
                onChange={(e) => setPodUrl(e.target.value)}
                placeholder="Your Pod URL"
                isReadOnly
              />
            </FormControl>
            
            <HStack mt={4}>
              <FormControl>
                <FormLabel>New Container Name</FormLabel>
                <Input
                  value={newContainerName}
                  onChange={(e) => setNewContainerName(e.target.value)}
                  placeholder="Enter container name"
                />
              </FormControl>
              <Button
                colorScheme="blue"
                onClick={createContainer}
                isLoading={loading}
                mt={8}
                leftIcon={<AddIcon />}
              >
                Create
              </Button>
            </HStack>
          </Box>
          
          <Divider my={4} />
          
          {/* Container List */}
          <Box>
            <Heading size="sm" mb={2}>Your Containers</Heading>
            {containers.length === 0 ? (
              <Text>No containers found. Create one to get started.</Text>
            ) : (
              <List spacing={2}>
                {containers.map((containerUrl) => (
                  <ListItem key={containerUrl} p={2} borderWidth="1px" borderRadius="md">
                    <Flex align="center">
                      <Text fontSize="sm" isTruncated>
                        {containerUrl.replace(podUrl, '')}
                      </Text>
                      <Spacer />
                      <IconButton
                        aria-label="Delete container"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeContainer(containerUrl)}
                      />
                    </Flex>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          
          {error && (
            <Box mt={4}>
              <Text color="red.500">{error}</Text>
            </Box>
          )}
        </VStack>
      </CardBody>
      
      <CardFooter>
        <Button 
          width="100%" 
          onClick={() => fetchContainers(podUrl)} 
          isLoading={loading}
        >
          Refresh Containers
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContainerManager; 