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
import { getSolidDataset, getThing, getStringNoLocale, getUrl, getThingAll, getBoolean, getInteger, getDecimal, getDatetime } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

interface QuestionnaireResponseItem {
  linkId: string;
  answer: Array<{
    valueBoolean?: boolean;
    valueString?: string;
    valueInteger?: number;
    valueDecimal?: number;
    valueCoding?: {
      system: string;
      code: string;
      display: string;
    };
  }>;
}

interface QuestionnaireResponseData {
  id: string;
  questionnaire: string;
  status: string;
  authored: string;
  source: {
    reference: string;
    type: string;
    display: string;
    identifier: {
      system: string;
      value: string;
    };
  };
  item: QuestionnaireResponseItem[];
}

interface QuestionnaireResponseViewerProps {
  responseUrl: string;
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
    if (onPreviewUrl) {
      onPreviewUrl(url);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

const QuestionnaireResponseViewer: React.FC<QuestionnaireResponseViewerProps> = ({
  responseUrl,
  isOpen,
  onClose,
  onPreviewUrl,
}) => {
  const [response, setResponse] = useState<QuestionnaireResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const loadResponse = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        // Get the dataset containing all things
        const dataset = await getSolidDataset(responseUrl, { fetch });
        
        // Get all things from the dataset
        const things = getThingAll(dataset);
        
        // Find the main response thing
        const responseThing = things.find(thing => {
          const type = getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
          return type === 'http://hl7.org/fhir/QuestionnaireResponse';
        });

        if (!responseThing) {
          throw new Error('QuestionnaireResponse not found');
        }

        // Find all response items
        const items = things.filter(thing => {
          const type = getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
          return type === 'http://hl7.org/fhir/QuestionnaireResponseItem';
        });

        // Parse the response data
        const responseData = {
          id: getStringNoLocale(responseThing, 'http://hl7.org/fhir/id') || '',
          questionnaire: getUrl(responseThing, 'http://hl7.org/fhir/questionnaire') || '',
          status: getStringNoLocale(responseThing, 'http://hl7.org/fhir/status') || '',
          authored: getDatetime(responseThing, 'http://hl7.org/fhir/authored')?.toISOString() || '',
          source: {
            reference: getStringNoLocale(responseThing, 'http://hl7.org/fhir/source') || '',
            type: 'Device',
            display: 'Device',
            identifier: {
              system: 'http://hl7.org/fhir/device',
              value: getStringNoLocale(responseThing, 'http://hl7.org/fhir/source') || ''
            }
          },
          item: items.map(item => {
            const linkId = getStringNoLocale(item, 'http://hl7.org/fhir/linkId') || '';
            const answers = things.filter(thing => {
              const type = getUrl(thing, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
              return type === 'http://hl7.org/fhir/Answer' && 
                     getUrl(thing, 'http://hl7.org/fhir/partOf')?.includes(linkId);
            });

            return {
              linkId,
              answer: answers.map(answer => {
                const answerData: any = {};
                
                const valueBoolean = getBoolean(answer, 'http://hl7.org/fhir/valueBoolean');
                if (valueBoolean !== undefined) answerData.valueBoolean = valueBoolean;
                
                const valueString = getStringNoLocale(answer, 'http://hl7.org/fhir/valueString');
                if (valueString !== undefined) answerData.valueString = valueString;
                
                const valueInteger = getInteger(answer, 'http://hl7.org/fhir/valueInteger');
                if (valueInteger !== undefined) answerData.valueInteger = valueInteger;
                
                const valueDecimal = getDecimal(answer, 'http://hl7.org/fhir/valueDecimal');
                if (valueDecimal !== undefined) answerData.valueDecimal = valueDecimal;
                
                const valueCoding = getUrl(answer, 'http://hl7.org/fhir/valueCoding');
                if (valueCoding !== undefined && valueCoding !== null) {
                  const code = valueCoding.split('/').pop() || '';
                  answerData.valueCoding = {
                    system: valueCoding.startsWith('http://snomed.info/sct/') ? 'http://snomed.info/sct' : '',
                    code,
                    display: code
                  };
                }

                return answerData;
              })
            };
          })
        };

        setResponse(responseData);
      } catch (error) {
        console.error('Error loading questionnaire response:', error);
        toast({
          title: 'Error',
          description: 'Failed to load questionnaire response data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadResponse();
  }, [responseUrl, isOpen, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Questionnaire Response Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold" mb={2}>Response URL:</Text>
              <Button
                variant="link"
                color="blue.500"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onPreviewUrl) {
                    onPreviewUrl(responseUrl);
                  }
                }}
                size="sm"
                p={0}
                height="auto"
                zIndex={1}
                position="relative"
              >
                {responseUrl}
              </Button>
            </Box>
            
            {loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="xl" />
              </Box>
            ) : response ? (
              <Box>
                <Text fontWeight="bold" mb={2}>Response Structure:</Text>
                <TreeNode 
                  label="QuestionnaireResponse" 
                  value={response} 
                  onPreviewUrl={onPreviewUrl}
                />
              </Box>
            ) : (
              <Text color="red.500">Failed to load questionnaire response data</Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuestionnaireResponseViewer; 