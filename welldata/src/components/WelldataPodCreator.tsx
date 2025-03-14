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
import { 
  createContainerAt, 
  createSolidDataset, 
  saveSolidDatasetAt,
  createThing,
  buildThing,
  setThing
} from '@inrupt/solid-client';
import { fetch, getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { createInitialFHIRPlan } from '../services/fhirService';

interface WelldataPodCreatorProps {
  onPodCreated: (podUrl: string) => void;
}

const WelldataPodCreator: React.FC<WelldataPodCreatorProps> = ({ onPodCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  const createWelldataWebId = async (containerUrl: string) => {
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
  };

  const createWelldataContainer = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const session = getDefaultSession();
      if (!session.info.webId) {
        setError('You must be logged in to create a Welldata container');
        return;
      }
      
      // Use the current container URL instead of the root Pod URL
      // This will create the welldata container within the current container
      const currentContainerUrl = window.location.hash.substring(1) || '';
      
      // Create the welldata container in the current container
      const welldataContainerUrl = currentContainerUrl 
        ? `${currentContainerUrl}welldata/` 
        : `${session.info.webId?.split('/profile')[0]}/welldata/`;
      
      await createContainerAt(welldataContainerUrl, { fetch });
      
      // Create required subcontainers
      const dataContainerUrl = `${welldataContainerUrl}data/`;
      await createContainerAt(dataContainerUrl, { fetch });
      
      const plansContainerUrl = `${dataContainerUrl}plans/`;
      await createContainerAt(plansContainerUrl, { fetch });
      
      // Create a WebID for the welldata container
      await createWelldataWebId(welldataContainerUrl);
      
      // Create initial FHIR plan
      await createInitialFHIRPlan(welldataContainerUrl);
      
      toast({
        title: 'Success',
        description: 'Welldata container created successfully with initial FHIR plan',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onPodCreated(welldataContainerUrl);
    } catch (error) {
      console.error('Error creating Welldata container:', error);
      setError(`Failed to create Welldata container: ${error.message}`);
    } finally {
      setIsCreating(false);
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
        onClick={createWelldataContainer}
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

      {error && (
        <Text color="red.500">{error}</Text>
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