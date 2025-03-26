import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import { FHIRQuestionnaire, FHIRQuestionnaireResponse, FHIRAnswer } from '../../fhir/types';
import { StorageService } from '../../services/storage';
import { PodService } from '../../services/podService';
import { deviceReference } from '../../fhir/device';
import QuestionRenderer from './QuestionRenderer';
import NavigationButtons from './NavigationButtons';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useTranslation } from '../../hooks/useTranslation';

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
  const toast = useToast();

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
      toast({
        title: 'Validation Error',
        description: 'Please answer the required question before proceeding.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Store current page response before proceeding
    try {
      const currentPageResponse = {
        ...response,
        status: 'in-progress' as const,
        item: response.item.filter(item => 
          translatedSurvey.item.slice(0, currentQuestionIndex + 1)
            .some(q => q.linkId === item.linkId)
        )
      };
      
      const stored = await storageService.storeResponse(currentPageResponse);
      if (!stored) {
        toast({
          title: 'Storage Error',
          description: 'Failed to store current page. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    } catch (error) {
      console.error('Error storing current page:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving your responses. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (currentQuestionIndex < translatedSurvey.item.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Update status to completed
      const completedResponse = {
        ...response,
        status: 'completed' as const
      };

      try {
        // Store the response
        const stored = await storageService.storeResponse(completedResponse);
        if (!stored) {
          toast({
            title: 'Storage Error',
            description: 'Failed to store survey response. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        // Call onComplete callback
        onComplete(completedResponse);

        toast({
          title: 'Survey Completed',
          description: 'Your responses have been saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error completing survey:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while saving your responses. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
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

  return (
    <Box
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      outline="none"
      p={4}
    >
      {currentQuestion && (
        <QuestionRenderer
          question={currentQuestion}
          answer={currentAnswer?.answer[0]}
          onAnswer={(answer: FHIRAnswer) => handleAnswer(currentQuestion.linkId, answer)}
          error={errors[currentQuestion.linkId]}
        />
      )}

      <NavigationButtons
        currentIndex={currentQuestionIndex}
        totalQuestions={translatedSurvey.item.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </Box>
  );
};

export default SurveyContainer; 