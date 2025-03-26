import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Box, Heading, Text, VStack, useColorModeValue, Text as ChakraText } from '@chakra-ui/react';
import { FHIRQuestionnaire, FHIRQuestionnaireResponse, FHIRAnswer } from '../../fhir/types';
import { StorageService } from '../../services/storage';
import { PodService } from '../../services/podService';
import { deviceReference } from '../../fhir/device';
import QuestionRenderer from './QuestionRenderer';
import NavigationButtons from './NavigationButtons';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useTranslation } from '../../hooks/useTranslation';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';

interface SurveyContainerProps {
  survey: FHIRQuestionnaire;
  onComplete: (response: FHIRQuestionnaireResponse) => void;
  currentLanguage: string;
  storageService: StorageService;
  podService: PodService;
}

const SurveyContainer: React.FC<SurveyContainerProps> = ({
  survey,
  onComplete,
  currentLanguage,
  storageService,
  podService,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [response, setResponse] = useState<FHIRQuestionnaireResponse>({
    resourceType: 'QuestionnaireResponse',
    id: crypto.randomUUID(),
    questionnaire: survey.id,
    status: 'in-progress',
    authored: new Date().toISOString(),
    source: deviceReference,
    item: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [translatedSurvey, setTranslatedSurvey] = useState(survey);
  const bgColor = useColorModeValue('white', 'gray.800');
  const containerRef = useRef<HTMLDivElement>(null);

  const { handleKeyDown: handleKeyboardNav } = useKeyboardNavigation({
    onNext: () => handleNext(),
    onPrevious: () => handlePrevious(),
    isEnabled: true
  });

  // Translate the survey when language changes
  useEffect(() => {
    const translated = useTranslation(survey, currentLanguage);
    setTranslatedSurvey(translated);
  }, [survey, currentLanguage]);

  // Focus management
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [currentQuestionIndex]);

  // Store questionnaire on first use
  useEffect(() => {
    const storeQuestionnaire = async () => {
      try {
        const stored = await podService.storeQuestionnaire(survey);
        if (!stored) {
          console.error('Failed to store questionnaire');
        }
      } catch (error) {
        console.error('Error storing questionnaire:', error);
      }
    };
    storeQuestionnaire();
  }, [survey, podService]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    handleKeyboardNav(event);
  };

  const handleAnswer = (linkId: string, answer: FHIRAnswer) => {
    setResponse(prev => {
      const newResponse = { ...prev };
      const existingItemIndex = newResponse.item.findIndex(item => item.linkId === linkId);

      if (existingItemIndex >= 0) {
        newResponse.item[existingItemIndex] = {
          ...newResponse.item[existingItemIndex],
          answer: [answer]
        };
      } else {
        newResponse.item.push({
          linkId,
          answer: [answer]
        });
      }

      return newResponse;
    });

    // Clear any errors for this question
    if (errors[linkId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[linkId];
        return newErrors;
      });
    }
  };

  const validateCurrentQuestion = (): boolean => {
    const currentQuestion = translatedSurvey.item[currentQuestionIndex];
    if (!currentQuestion) return true;

    const currentAnswer = response.item.find(item => item.linkId === currentQuestion.linkId);
    
    if (currentQuestion.required && !currentAnswer) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.linkId]: 'This question is required'
      }));
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    // Get the questionnaire URL from the metadata folder
    const session = getDefaultSession();
    if (!session.info.webId) {
      throw new Error('User must be logged in to store responses');
    }

    // Extract the pod URL from the WebID
    const webIdUrl = new URL(session.info.webId);
    const pathParts = webIdUrl.pathname.split('/').filter(Boolean);
    
    // The first part of the path is usually the username/pod name
    let podUrl = '';
    if (pathParts.length > 0) {
      podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/${pathParts[0]}/`;
    } else {
      podUrl = `${webIdUrl.protocol}//${webIdUrl.hostname}${webIdUrl.port ? ':' + webIdUrl.port : ''}/`;
    }

    // Create the questionnaire URL in metadata/surveys/definitions
    const questionnaireUrl = `${podUrl}welldata/metadata/surveys/definitions/${survey.id}.ttl`;

    // Store current page response before proceeding
    try {
      const currentPageResponse = {
        ...response,
        status: 'in-progress' as const,
        questionnaire: questionnaireUrl,
        item: response.item.filter(item => 
          translatedSurvey.item.slice(0, currentQuestionIndex + 1)
            .some(q => q.linkId === item.linkId)
        )
      };
      
      const stored = await storageService.storeResponse(currentPageResponse);
      if (!stored) {
        console.error('Failed to store current page response');
        return;
      }
    } catch (error) {
      console.error('Error storing current page:', error);
      return;
    }

    if (currentQuestionIndex < translatedSurvey.item.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Update status to completed
      const completedResponse = {
        ...response,
        status: 'completed' as const,
        questionnaire: questionnaireUrl
      };

      try {
        // Store the response
        const stored = await storageService.storeResponse(completedResponse);
        if (!stored) {
          return;
        }

        // Call onComplete callback
        onComplete(completedResponse);
      } catch (error) {
        console.error('Error completing survey:', error);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentQuestion = translatedSurvey.item[currentQuestionIndex];
  const currentAnswer = response.item.find(item => item.linkId === currentQuestion?.linkId);

  // Get the appropriate shortcut text based on platform
  const shortcutText = React.useMemo(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? '⌘' : 'Ctrl';
    return `${modifier} + → (or ${modifier} + ↵) to continue, ${modifier} + ← (or ${modifier} + ⌫) to go back`;
  }, []);

  return (
    <VStack spacing={8} align="stretch" minH="calc(100vh - 200px)">
      {/* Survey Header */}
      <Box role="banner">
        <Heading as="h1" size="xl" mb={4}>
          {translatedSurvey.title}
        </Heading>
        {translatedSurvey.description && (
          <Text fontSize="lg" color="gray.600">
            {translatedSurvey.description}
          </Text>
        )}
      </Box>

      {/* Question Container */}
      <Box
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        outline="none"
        role="main"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Question ${currentQuestionIndex + 1} of ${translatedSurvey.item.length}`}
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minH="400px"
      >
        {currentQuestion && (
          <QuestionRenderer
            question={currentQuestion}
            answer={currentAnswer?.answer[0]}
            onAnswer={(answer: FHIRAnswer) => handleAnswer(currentQuestion.linkId, answer)}
            error={errors[currentQuestion.linkId]}
          />
        )}
        
        {/* Keyboard Shortcut Hint */}
        <ChakraText
          fontSize="sm"
          color="gray.500"
          mt={4}
          textAlign="center"
          role="note"
          aria-label={`Use ${shortcutText} for navigation`}
        >
          {shortcutText}
        </ChakraText>
      </Box>

      {/* Navigation */}
      <Box
        position="sticky"
        bottom={0}
        bg={bgColor}
        py={4}
        borderTop="1px"
        borderColor="gray.200"
      >
        <NavigationButtons
          currentIndex={currentQuestionIndex}
          totalQuestions={translatedSurvey.item.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </Box>
    </VStack>
  );
};

export default SurveyContainer; 