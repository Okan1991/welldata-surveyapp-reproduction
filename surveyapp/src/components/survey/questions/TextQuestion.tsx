import React from 'react';
import { Textarea, Text } from '@chakra-ui/react';
import { FHIRQuestionItem } from '../../../surveys/types';

interface TextQuestionProps {
  question: FHIRQuestionItem;
  answer: string | null;
  onAnswer: (value: string) => void;
  language: string;
}

const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  answer,
  onAnswer,
  language,
}) => {
  const questionId = question.linkId;

  return (
    <Textarea
      value={answer || ''}
      onChange={(e) => onAnswer(e.target.value)}
      placeholder="Enter your answer here..."
      size="lg"
      minH="100px"
      aria-labelledby={`question-${questionId}`}
      aria-describedby={question.helpText ? `help-${questionId}` : undefined}
      aria-invalid={false}
      aria-required={question.required}
    />
  );
};

export default TextQuestion; 