import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Spinner,
  useToast,
  Button,
} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { getSolidDataset, getThing, getStringNoLocale, getUrl, getThingAll } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

interface QuestionnaireItem {
  id: string;
  text: string;
  type: string;
  required: string;
  options: string;
}

interface QuestionnaireData {
  id: string;
  title: string;
  status: string;
  description: string;
  url: string;
  version: string;
  items: QuestionnaireItem[];
}

interface QuestionnaireViewerProps {
  questionnaireUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onPreviewUrl?: (url: string) => void;
}

interface TreeNodeProps {
  label: string;
  value: any;
  level?: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  onPreviewUrl?: (url: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  label, 
  value, 
  level = 0, 
  isExpanded = false, 
  onToggle,
  onPreviewUrl 
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.600');
  const isArray = Array.isArray(value);
  const hasChildren = typeof value === 'object' && value !== null && !isArray;
  const [expanded, setExpanded] = useState(isExpanded);

  const handleUrlClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('TreeNode handleUrlClick called with URL:', url);
    console.log('onPreviewUrl prop:', onPreviewUrl);
    if (onPreviewUrl) {
      console.log('Calling onPreviewUrl with:', url);
      onPreviewUrl(url);
    } else {
      console.log('onPreviewUrl is not defined');
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('TreeNode handleToggle called for:', label);
    setExpanded(!expanded);
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <Box>
      <HStack
        spacing={2}
        py={1}
        px={2}
        cursor={hasChildren || isArray ? 'pointer' : 'default'}
        onClick={hasChildren || isArray ? handleToggle : undefined}
        _hover={{ bg: hasChildren || isArray ? hoverBgColor : 'transparent' }}
        bg={expanded ? bgColor : 'transparent'}
        borderRadius="md"
      >
        {(hasChildren || isArray) && (
          <Icon as={expanded ? ChevronDownIcon : ChevronRightIcon} />
        )}
        <Text fontWeight="bold">{label}:</Text>
        {!hasChildren && !isArray && (
          <Text color="gray.600" fontSize="sm">
            {typeof value === 'string' && value.startsWith('http') ? (
              <Button
                variant="link"
                color="blue.500"
                onClick={(e) => handleUrlClick(e, value)}
                size="sm"
                p={0}
                height="auto"
                zIndex={1}
                position="relative"
              >
                {value}
              </Button>
            ) : (
              String(value)
            )}
          </Text>
        )}
      </HStack>
      {expanded && (hasChildren || isArray) && (
        <Box ml={4}>
          {isArray ? (
            value.map((item, index) => (
              <TreeNode
                key={index}
                label={`Item ${index + 1}`}
                value={item}
                level={level + 1}
                onPreviewUrl={onPreviewUrl}
              />
            ))
          ) : (
            Object.entries(value).map(([key, val]) => (
              <TreeNode
                key={key}
                label={key}
                value={val}
                level={level + 1}
                onPreviewUrl={onPreviewUrl}
              />
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

const QuestionnaireViewer: React.FC<QuestionnaireViewerProps> = ({
  questionnaireUrl,
  isOpen,
  onClose,
  onPreviewUrl,
}) => {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const loadQuestionnaire = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        // Get the dataset containing all things
        const dataset = await getSolidDataset(questionnaireUrl, { fetch });
        
        // Get all things from the dataset
        const things = getThingAll(dataset);
        
        // Find the main questionnaire thing
        const questionnaireThing = things.find(thing => {
          const type = getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
          return type === 'http://hl7.org/fhir/Questionnaire';
        });

        if (!questionnaireThing) {
          throw new Error('Questionnaire not found');
        }

        // Debug: Log all properties of the questionnaire thing
        console.log('Questionnaire Thing:', questionnaireThing);
        console.log('Questionnaire Thing Properties:', Object.keys(questionnaireThing));
        console.log('Questionnaire Thing Values:', {
          id: getStringNoLocale(questionnaireThing, 'http://hl7.org/fhir/id'),
          title: getStringNoLocale(questionnaireThing, 'http://hl7.org/fhir/title'),
          status: getStringNoLocale(questionnaireThing, 'http://hl7.org/fhir/status'),
          description: getStringNoLocale(questionnaireThing, 'http://hl7.org/fhir/description'),
          url: getUrl(questionnaireThing, 'http://hl7.org/fhir/url'),
          version: getStringNoLocale(questionnaireThing, 'http://hl7.org/fhir/version'),
        });

        // Find all questionnaire items
        const items = things.filter(thing => {
          const type = getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
          return type === 'http://hl7.org/fhir/QuestionnaireItem';
        });

        // Debug: Log the first item's properties
        if (items.length > 0) {
          console.log('First Questionnaire Item:', items[0]);
          console.log('First Item Properties:', Object.keys(items[0]));
          console.log('First Item Values:', {
            id: getStringNoLocale(items[0], 'http://hl7.org/fhir/id'),
            linkId: getStringNoLocale(items[0], 'http://hl7.org/fhir/linkId'),
            text: getStringNoLocale(items[0], 'http://hl7.org/fhir/text'),
            type: getStringNoLocale(items[0], 'http://hl7.org/fhir/type'),
            required: getStringNoLocale(items[0], 'http://hl7.org/fhir/required'),
            options: getUrl(items[0], 'http://hl7.org/fhir/options'),
          });
        }

        // Parse the questionnaire data
        const questionnaireData = {
          id: getStringNoLocale(questionnaireThing, 'http://hl7.org/fhir/id') || '',
          title: getStringNoLocale(questionnaireThing, 'http://hl7.org/fhir/title') || '',
          status: getStringNoLocale(questionnaireThing, 'http://hl7.org/fhir/status') || '',
          description: getStringNoLocale(questionnaireThing, 'http://hl7.org/fhir/description') || '',
          url: getUrl(questionnaireThing, 'http://hl7.org/fhir/url') || '',
          version: getStringNoLocale(questionnaireThing, 'http://hl7.org/fhir/version') || '',
          items: items.map(item => ({
            id: getStringNoLocale(item, 'http://hl7.org/fhir/id') || '',
            linkId: getStringNoLocale(item, 'http://hl7.org/fhir/linkId') || '',
            text: getStringNoLocale(item, 'http://hl7.org/fhir/text') || '',
            type: getStringNoLocale(item, 'http://hl7.org/fhir/type') || '',
            required: getStringNoLocale(item, 'http://hl7.org/fhir/required') || 'false',
            options: getUrl(item, 'http://hl7.org/fhir/options') || '',
          }))
        };

        setQuestionnaire(questionnaireData);
      } catch (error) {
        console.error('Error loading questionnaire:', error);
        toast({
          title: 'Error',
          description: 'Failed to load questionnaire data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestionnaire();
  }, [questionnaireUrl, isOpen, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Questionnaire Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold" mb={2}>Questionnaire URL:</Text>
              <Button
                variant="link"
                color="blue.500"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Questionnaire URL button clicked:', questionnaireUrl);
                  console.log('onPreviewUrl prop:', onPreviewUrl);
                  if (onPreviewUrl) {
                    console.log('Calling onPreviewUrl with:', questionnaireUrl);
                    onPreviewUrl(questionnaireUrl);
                  } else {
                    console.log('onPreviewUrl is not defined');
                  }
                }}
                size="sm"
                p={0}
                height="auto"
                zIndex={1}
                position="relative"
              >
                {questionnaireUrl}
              </Button>
            </Box>
            
            {loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="xl" />
              </Box>
            ) : questionnaire ? (
              <Box>
                <Text fontWeight="bold" mb={2}>Questionnaire Structure:</Text>
                <TreeNode 
                  label="Questionnaire" 
                  value={questionnaire} 
                  onPreviewUrl={onPreviewUrl}
                />
              </Box>
            ) : (
              <Text color="red.500">Failed to load questionnaire data</Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuestionnaireViewer; 