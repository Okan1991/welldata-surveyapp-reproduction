import React from 'react';
import { Input, Text, HStack } from '@chakra-ui/react';
import { FHIRQuestionItem } from '../../../surveys/types';

interface NumberQuestionProps {
  question: FHIRQuestionItem;
  answer: number | null;
  onAnswer: (value: number) => void;
  language: string;
}

const NumberQuestion: React.FC<NumberQuestionProps> = ({
  question,
  answer,
  onAnswer,
  language,
}) => {
  const questionId = question.linkId;
  const validation = question.validation;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onAnswer(0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onAnswer(numValue);
      }
    }
  };

  return (
    <HStack spacing={4}>
      <Input
        type="number"
        value={answer === null ? '' : answer}
        onChange={handleChange}
        size="lg"
        min={validation?.min}
        max={validation?.max}
        step={validation?.step || 1}
        aria-labelledby={`question-${questionId}`}
        aria-describedby={question.helpText ? `help-${questionId}` : undefined}
        aria-invalid={false}
        aria-required={question.required}
      />
      {validation?.unit && (
        <Text fontSize="lg" color="gray.600">
          {validation.unit}
        </Text>
      )}
    </HStack>
  );
};

export default NumberQuestion; 