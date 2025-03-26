import React from 'react';
import { Box, FormControl, FormLabel, FormErrorMessage, Text, useColorModeValue } from '@chakra-ui/react';
import { FHIRQuestionItem } from '../../surveys/types';
import BooleanQuestion from './questions/BooleanQuestion';
import ChoiceQuestion from './questions/ChoiceQuestion';
import TextQuestion from './questions/TextQuestion';
import NumberQuestion from './questions/NumberQuestion';
import SnomedQuestion from './questions/SnomedQuestion';

interface SurveyQuestionProps {
  question: FHIRQuestionItem;
  answer: any;
  error?: string;
  onAnswer: (questionId: string, answer: any) => void;
  language: string;
}

const SurveyQuestion: React.FC<SurveyQuestionProps> = ({
  question,
  answer,
  error,
  onAnswer,
  language,
}) => {
  const questionId = question.linkId;
  const isRequired = question.required;
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)');

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'boolean':
        return (
          <BooleanQuestion
            question={question}
            answer={answer}
            onAnswer={(value) => onAnswer(questionId, value)}
            language={language}
          />
        );
      case 'choice':
        return (
          <ChoiceQuestion
            question={question}
            answer={answer}
            onAnswer={(value) => onAnswer(questionId, value)}
            language={language}
          />
        );
      case 'text':
        return (
          <TextQuestion
            question={question}
            answer={answer}
            onAnswer={(value) => onAnswer(questionId, value)}
            language={language}
          />
        );
      case 'number':
        return (
          <NumberQuestion
            question={question}
            answer={answer}
            onAnswer={(value) => onAnswer(questionId, value)}
            language={language}
          />
        );
      case 'snomed':
        return (
          <SnomedQuestion
            question={question}
            answer={answer}
            onAnswer={(value) => onAnswer(questionId, value)}
            language={language}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow={`0 4px 6px ${shadowColor}`}
      transition="all 0.2s"
      _hover={{
        boxShadow: `0 6px 8px ${shadowColor}`,
        transform: 'translateY(-2px)',
      }}
    >
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        <FormLabel
          as="legend"
          fontSize="xl"
          fontWeight="medium"
          mb={2}
          id={`question-${questionId}`}
          color={useColorModeValue('gray.800', 'white')}
        >
          {question.text}
        </FormLabel>
        
        {question.helpText && (
          <Text
            color="gray.600"
            fontSize="md"
            mb={4}
            role="note"
            aria-labelledby={`question-${questionId}`}
            bg={useColorModeValue('gray.50', 'gray.700')}
            p={3}
            borderRadius="md"
          >
            {question.helpText}
          </Text>
        )}

        <Box 
          role="group" 
          aria-labelledby={`question-${questionId}`}
          mt={4}
        >
          {renderQuestionInput()}
        </Box>

        <FormErrorMessage mt={2}>{error}</FormErrorMessage>
      </FormControl>
    </Box>
  );
};

export default SurveyQuestion; 