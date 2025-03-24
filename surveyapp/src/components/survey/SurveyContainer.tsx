import React from 'react';
import { Box, Heading, Text, VStack, useColorModeValue, Text as ChakraText } from '@chakra-ui/react';
import { SurveyDefinition } from '../../surveys/types';
import SurveyQuestion from './SurveyQuestion';
import SurveyNavigation from './SurveyNavigation';
import SurveyProgress from './SurveyProgress';
import { translateSurvey } from '../../utils/language';

interface SurveyContainerProps {
  survey: SurveyDefinition;
  currentLanguage: string;
  onComplete: (answers: any) => void;
}

const SurveyContainer: React.FC<SurveyContainerProps> = ({
  survey,
  currentLanguage,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [translatedSurvey, setTranslatedSurvey] = React.useState(() => translateSurvey(survey, currentLanguage));
  const bgColor = useColorModeValue('white', 'gray.800');
  const questionRef = React.useRef<HTMLDivElement>(null);

  // Update translations when language changes
  React.useEffect(() => {
    const newTranslatedSurvey = translateSurvey(survey, currentLanguage);
    setTranslatedSurvey(newTranslatedSurvey);
  }, [currentLanguage, survey]);

  const currentQuestion = translatedSurvey.item[currentQuestionIndex];
  const totalQuestions = translatedSurvey.item.length;

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setErrors(prev => ({ ...prev, [questionId]: '' }));
  };

  const handleNext = React.useCallback(() => {
    if (currentQuestion.required && !answers[currentQuestion.linkId]) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.linkId]: 'This question is required',
      }));
      return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  }, [currentQuestion, currentQuestionIndex, totalQuestions, answers, onComplete]);

  const handlePrevious = React.useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
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
  }, [handleNext, handlePrevious]);

  // Add and remove keyboard event listener
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management when question changes
  React.useEffect(() => {
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
          answer={answers[currentQuestion.linkId]}
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