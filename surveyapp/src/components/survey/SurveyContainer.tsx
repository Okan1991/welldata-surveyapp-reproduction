import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, useColorModeValue, Text as ChakraText } from '@chakra-ui/react';
import { SurveyDefinition } from '../../surveys/types';
import SurveyQuestion from './SurveyQuestion';
import SurveyNavigation from './SurveyNavigation';
import SurveyProgress from './SurveyProgress';
import { translateSurvey } from '../../utils/language';
import { deviceReference } from '../../fhir/device';
import { FHIRQuestionnaireResponse, FHIRQuestionnaireResponseItem, FHIRValue } from '../../fhir/types';

interface SurveyContainerProps {
  survey: SurveyDefinition;
  currentLanguage: string;
  onComplete: (response: FHIRQuestionnaireResponse) => void;
}

const SurveyContainer: React.FC<SurveyContainerProps> = ({
  survey,
  currentLanguage,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionnaireResponse, setQuestionnaireResponse] = useState<FHIRQuestionnaireResponse>({
    resourceType: 'QuestionnaireResponse',
    id: `qr-${survey.id}-${new Date().toISOString()}`,
    questionnaire: `Questionnaire/${survey.id}`,
    status: 'in-progress',
    authored: new Date().toISOString(),
    source: deviceReference,
    item: []
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [translatedSurvey, setTranslatedSurvey] = useState(() => translateSurvey(survey, currentLanguage));
  const bgColor = useColorModeValue('white', 'gray.800');
  const questionRef = React.useRef<HTMLDivElement>(null);

  // Update translations when language changes
  useEffect(() => {
    const newTranslatedSurvey = translateSurvey(survey, currentLanguage);
    setTranslatedSurvey(newTranslatedSurvey);
  }, [currentLanguage, survey]);

  const currentQuestion = translatedSurvey.item[currentQuestionIndex];
  const totalQuestions = translatedSurvey.item.length;

  const getFHIRValue = (value: any, type: string): FHIRValue => {
    switch (type) {
      case 'boolean':
        return { valueBoolean: value };
      case 'text':
        return { valueString: value };
      case 'number':
        return { valueDecimal: value };
      case 'choice':
      case 'snomed':
        const selectedOption = currentQuestion.answerOption?.find(
          (opt: { valueCoding: Array<{ system: string; code: string; display: string }> }) => opt.valueCoding?.[0]?.code === value
        );
        return {
          valueCoding: selectedOption?.valueCoding?.[0] || {
            system: currentQuestion.answerOption?.[0]?.valueCoding?.[0]?.system || '',
            code: value,
            display: selectedOption?.valueCoding?.[0]?.display || ''
          }
        };
      default:
        return { valueString: String(value) };
    }
  };

  const insertAnswerWithTimestamp = (newItem: FHIRQuestionnaireResponseItem) => {
    const timestamp = new Date(newItem.answer[0].extension?.[0].valueDateTime || '').getTime();
    
    setQuestionnaireResponse(prev => {
      const newItems = [...prev.item];
      let insertIndex = 0;
      
      // Find the correct position based on timestamp
      while (insertIndex < newItems.length) {
        const existingTimestamp = new Date(newItems[insertIndex].answer[0].extension?.[0].valueDateTime || '').getTime();
        if (timestamp < existingTimestamp) {
          break;
        }
        insertIndex++;
      }
      
      // Insert the new item at the correct position
      newItems.splice(insertIndex, 0, newItem);
      
      return {
        ...prev,
        item: newItems
      };
    });
  };

  const handleAnswer = (questionId: string, value: any) => {
    const timestamp = new Date().toISOString();
    const fhirValue = getFHIRValue(value, currentQuestion.type);
    
    setQuestionnaireResponse(prev => {
      // Remove any existing answer for this question
      const filteredItems = prev.item.filter(item => item.linkId !== questionId);
      
      // Create new answer item
      const newItem: FHIRQuestionnaireResponseItem = {
        linkId: questionId,
        answer: [{
          value: fhirValue,
          extension: [{
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaireresponse-answer-time',
            valueDateTime: timestamp
          }]
        }]
      };

      // Insert new answer at the correct position based on timestamp
      const newItems = [...filteredItems];
      let insertIndex = 0;
      
      while (insertIndex < newItems.length) {
        const existingTimestamp = new Date(newItems[insertIndex].answer[0].extension?.[0].valueDateTime || '').getTime();
        const newTimestamp = new Date(timestamp).getTime();
        if (newTimestamp < existingTimestamp) {
          break;
        }
        insertIndex++;
      }
      
      newItems.splice(insertIndex, 0, newItem);
      
      const updatedResponse = {
        ...prev,
        item: newItems
      };

      // Debug output when answer is submitted or updated
      console.log('Survey State Update:', {
        questionnaire: {
          resourceType: 'Questionnaire',
          id: survey.id,
          title: translatedSurvey.title,
          description: translatedSurvey.description,
          status: 'active',
          item: translatedSurvey.item.map(item => ({
            linkId: item.linkId,
            text: item.text,
            type: item.type,
            required: item.required,
            answerOption: item.answerOption,
            validation: item.validation
          }))
        },
        questionnaireResponse: updatedResponse
      });

      return updatedResponse;
    });

    setErrors(prev => ({ ...prev, [questionId]: '' }));
  };

  const handleNext = () => {
    const currentAnswer = questionnaireResponse.item.find(item => item.linkId === currentQuestion.linkId);
    
    if (currentQuestion.required && !currentAnswer) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.linkId]: 'This question is required',
      }));
      return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuestionnaireResponse(prev => ({ ...prev, status: 'completed' }));
      onComplete(questionnaireResponse);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? event.metaKey : event.ctrlKey;
    
    // Handle arrow key navigation with Command/Ctrl modifier
    if ((event.key === 'ArrowLeft' || event.key === 'Backspace') && modifierKey) {
      event.preventDefault();
      handlePrevious();
    } else if ((event.key === 'ArrowRight' || event.key === 'Enter') && modifierKey) {
      event.preventDefault();
      handleNext();
    }
  };

  // Add and remove keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management when question changes
  useEffect(() => {
    // Use a small delay to ensure the new question is rendered
    const timer = setTimeout(() => {
      if (questionRef.current) {
        // Find the first interactive element within the question
        const firstInteractive = questionRef.current.querySelector(
          'input[type="radio"], input[type="checkbox"], input[type="text"], select, button'
        ) as HTMLElement;
        
        if (firstInteractive) {
          firstInteractive.focus();
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentQuestionIndex]);

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

      {/* Progress Indicator */}
      <SurveyProgress
        current={currentQuestionIndex + 1}
        total={totalQuestions}
        aria-label="Survey progress"
      />

      {/* Question Container */}
      <Box
        ref={questionRef}
        role="main"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minH="400px"
      >
        <SurveyQuestion
          question={currentQuestion}
          answer={(() => {
            const currentAnswer = questionnaireResponse.item.find(item => item.linkId === currentQuestion.linkId);
            if (!currentAnswer) return null;
            
            switch (currentQuestion.type) {
              case 'boolean':
                return currentAnswer.answer[0].value.valueBoolean;
              case 'choice':
              case 'snomed':
                return currentAnswer.answer[0].value.valueCoding?.code;
              case 'text':
                return currentAnswer.answer[0].value.valueString;
              case 'number':
                return currentAnswer.answer[0].value.valueDecimal;
              default:
                return null;
            }
          })()}
          error={errors[currentQuestion.linkId]}
          onAnswer={handleAnswer}
          language={currentLanguage}
        />
        
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
        <SurveyNavigation
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentQuestionIndex === 0}
          isLast={currentQuestionIndex === totalQuestions - 1}
          aria-label="Survey navigation"
        />
      </Box>
    </VStack>
  );
};

export default SurveyContainer; 