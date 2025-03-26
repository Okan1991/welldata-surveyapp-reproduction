import React from 'react';
import { Input, Text, VStack, Box } from '@chakra-ui/react';
import { FHIRQuestionItem } from '../../../surveys/types';

interface SnomedQuestionProps {
  question: FHIRQuestionItem;
  answer: string | null;
  onAnswer: (value: string) => void;
  language: string;
}

const SnomedQuestion: React.FC<SnomedQuestionProps> = ({
  question,
  answer,
  onAnswer,
  language,
}) => {
  const questionId = question.linkId;

  return (
    <VStack spacing={4} align="stretch">
      <Input
        type="text"
        value={answer || ''}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder="Enter SNOMED code..."
        size="lg"
        aria-labelledby={`question-${questionId}`}
        aria-describedby={question.helpText ? `help-${questionId}` : undefined}
        aria-invalid={false}
        aria-required={question.required}
      />
      <Box role="note" aria-label="SNOMED code format">
        <Text fontSize="sm" color="gray.600">
          Enter a valid SNOMED code (e.g., 373066001)
        </Text>
      </Box>
    </VStack>
  );
};

export default SnomedQuestion; 