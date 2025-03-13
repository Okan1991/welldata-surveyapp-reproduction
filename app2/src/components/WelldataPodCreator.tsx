import React, { useState } from 'react';
import {
  Box,
  Button,
  Progress,
  Text,
  VStack,
  useToast,
  Card,
  CardBody,
  Heading,
  Icon,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { createContainerAt } from '@inrupt/solid-client';
import { fetch, getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { createInitialFHIRPlan } from '../services/fhirService';

interface WelldataPodCreatorProps {
  onPodCreated: (podUrl: string) => void;
}

const WelldataPodCreator: React.FC<WelldataPodCreatorProps> = ({ onPodCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  const createWelldataPod = async () => {
    setIsCreating(true);
    setProgress(0);
    
    try {
      const session = getDefaultSession();
      if (!session.info.isLoggedIn || !session.info.webId) {
        throw new Error('User must be logged in to create a Pod');
      }

      // Extract the base URL from the WebID
      const webIdUrl = new URL(session.info.webId);
      const baseUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
      
      // Create the main welldata container within the user's Pod
      const welldataUrl = `${baseUrl}welldata/`;
      await createContainerAt(welldataUrl, { fetch });
      setProgress(20);

      // Create required subfolders
      const subfolders = ['config', 'data', 'logs', 'metadata'];
      for (const folder of subfolders) {
        await createContainerAt(`${welldataUrl}${folder}/`, { fetch });
        setProgress(20 + (subfolders.indexOf(folder) + 1) * 20);
      }

      // Create initial FHIR plan
      await createInitialFHIRPlan(welldataUrl);
      setProgress(100);

      toast({
        title: 'Success',
        description: 'Welldata container created successfully with initial FHIR plan',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onPodCreated(welldataUrl);
    } catch (error) {
      console.error('Error creating welldata container:', error);
      toast({
        title: 'Error',
        description: `Failed to create welldata container: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
      setProgress(0);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Create Welldata Container</Heading>
      <Text>
        Create a new welldata container in your Pod with the required structure and initial FHIR plan.
      </Text>
      
      <Button
        colorScheme="blue"
        onClick={createWelldataPod}
        isLoading={isCreating}
        loadingText="Creating Container..."
      >
        Create Welldata Container
      </Button>

      {isCreating && (
        <Box>
          <Progress value={progress} size="sm" colorScheme="blue" />
          <Text mt={2} fontSize="sm" color="gray.500">
            Creating container structure... {progress}%
          </Text>
        </Box>
      )}

      <Card variant="outline">
        <CardBody>
          <VStack align="start" spacing={2}>
            <Text fontWeight="medium">Container Structure:</Text>
            <HStack>
              <Icon viewBox="0 0 24 24" boxSize={5} color="brand.500">
                <path
                  fill="currentColor"
                  d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                />
              </Icon>
              <Text>welldata/</Text>
            </HStack>
            <Box pl={8}>
              <HStack>
                <Icon viewBox="0 0 24 24" boxSize={5} color="brand.500">
                  <path
                    fill="currentColor"
                    d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                  />
                </Icon>
                <Text>config/</Text>
              </HStack>
              <HStack>
                <Icon viewBox="0 0 24 24" boxSize={5} color="brand.500">
                  <path
                    fill="currentColor"
                    d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                  />
                </Icon>
                <Text>data/</Text>
                <Badge colorScheme="green">FHIR Plans</Badge>
              </HStack>
              <HStack>
                <Icon viewBox="0 0 24 24" boxSize={5} color="brand.500">
                  <path
                    fill="currentColor"
                    d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                  />
                </Icon>
                <Text>logs/</Text>
              </HStack>
              <HStack>
                <Icon viewBox="0 0 24 24" boxSize={5} color="brand.500">
                  <path
                    fill="currentColor"
                    d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                  />
                </Icon>
                <Text>metadata/</Text>
              </HStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default WelldataPodCreator; 