import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  useToast,
  IconButton,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Progress,
  HStack,
  Icon
} from '@chakra-ui/react';
import {
  createContainerAt,
  getSolidDataset,
  FetchError
} from '@inrupt/solid-client';
import {
  fetch,
  getDefaultSession
} from '@inrupt/solid-client-authn-browser';

interface WelldataPodCreatorProps {
  onPodCreated: (podUrl: string) => void;
}

export const WelldataPodCreator: React.FC<WelldataPodCreatorProps> = ({ onPodCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [podExists, setPodExists] = useState(false);
  const toast = useToast();

  useEffect(() => {
    checkPodExists();
  }, []);

  const checkPodExists = async () => {
    try {
      const session = getDefaultSession();
      if (!session.info.isLoggedIn || !session.info.webId) {
        return;
      }

      const webIdUrl = new URL(session.info.webId);
      const baseUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
      const welldataUrl = `${baseUrl}welldata/`;
      
      await getSolidDataset(welldataUrl, { fetch });
      setPodExists(true);
    } catch (error) {
      // If we get a 404, the Pod doesn't exist yet
      setPodExists(false);
    }
  };

  const createWelldataPod = async () => {
    setIsCreating(true);
    setProgress(0);
    
    try {
      const session = getDefaultSession();
      if (!session.info.isLoggedIn || !session.info.webId) {
        throw new Error('User must be logged in to create a Pod');
      }

      // Extract base URL from WebID
      const webIdUrl = new URL(session.info.webId);
      const baseUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
      
      // Create main welldata container
      const welldataUrl = `${baseUrl}welldata/`;
      await createContainerAt(welldataUrl, { fetch });
      setProgress(25);

      // Create subfolders
      const folders = ['metadata/', 'data/', 'logs/', 'config/'];
      for (const [index, folder] of folders.entries()) {
        await createContainerAt(`${welldataUrl}${folder}`, { fetch });
        setProgress(25 + ((index + 1) * 25));
      }

      setPodExists(true);
      toast({
        title: 'Success',
        description: 'Welldata Pod structure created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onPodCreated(welldataUrl);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create Welldata Pod: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (podExists) {
    return null;
  }

  return (
    <Box p={4} borderRadius="lg" borderWidth="1px" bg="white">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="md">Create Welldata Pod</Heading>
          <Popover placement="right">
            <PopoverTrigger>
              <IconButton
                aria-label="Learn more about Welldata Pod structure"
                icon={<Icon viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></Icon>}
                variant="ghost"
                size="sm"
              />
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Pod Structure:</Text>
                  <Text>• /welldata/</Text>
                  <Text ml={4}>• data/ - For storing well data</Text>
                  <Text ml={4}>• metadata/ - For schemas and metadata</Text>
                  <Text ml={4}>• logs/ - For activity logs</Text>
                  <Text ml={4}>• config/ - For configuration files</Text>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </HStack>
        <Button
          colorScheme="blue"
          onClick={createWelldataPod}
          isLoading={isCreating}
          loadingText="Creating Pod..."
        >
          Create Welldata Pod
        </Button>
        {isCreating && (
          <Progress value={progress} size="sm" colorScheme="blue" />
        )}
      </VStack>
    </Box>
  );
};

export default WelldataPodCreator; 