import React from 'react';
import { RadioGroup, Radio, Stack, Text } from '@chakra-ui/react';
import { FHIRQuestionItem } from '../../../surveys/types';

interface ChoiceQuestionProps {
  question: FHIRQuestionItem;
  answer: string | null;
  onAnswer: (value: string) => void;
  language: string;
}

const ChoiceQuestion: React.FC<ChoiceQuestionProps> = ({
  question,
  answer,
  onAnswer,
  language,
}) => {
  const questionId = question.linkId;

  return (
    <RadioGroup
      value={answer || ''}
      onChange={onAnswer}
      aria-labelledby={`question-${questionId}`}
    >
      <Stack spacing={4}>
        {question.answerOption?.map((option) => (
          <Radio
            key={option.valueString}
            value={option.valueString}
            size="lg"
            aria-label={option.valueCoding[0].display}
          >
            <Text fontSize="lg">{option.valueCoding[0].display}</Text>
          </Radio>
        ))}
      </Stack>
    </RadioGroup>
  );
};

export default ChoiceQuestion; 