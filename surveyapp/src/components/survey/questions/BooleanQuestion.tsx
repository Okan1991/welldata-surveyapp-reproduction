import React from 'react';
import { RadioGroup, Radio, Stack, Text } from '@chakra-ui/react';
import { FHIRQuestionItem } from '../../../surveys/types';

interface BooleanQuestionProps {
  question: FHIRQuestionItem;
  answer: boolean | null;
  onAnswer: (value: boolean) => void;
  language: string;
}

const BooleanQuestion: React.FC<BooleanQuestionProps> = ({
  question,
  answer,
  onAnswer,
  language,
}) => {
  const questionId = question.linkId;

  return (
    <RadioGroup
      value={answer === null ? '' : answer.toString()}
      onChange={(value) => onAnswer(value === 'true')}
      aria-labelledby={`question-${questionId}`}
    >
      <Stack spacing={4} direction="row">
        <Radio
          value="true"
          size="lg"
          aria-label="Yes"
        >
          <Text fontSize="lg">Yes</Text>
        </Radio>
        <Radio
          value="false"
          size="lg"
          aria-label="No"
        >
          <Text fontSize="lg">No</Text>
        </Radio>
      </Stack>
    </RadioGroup>
  );
};

export default BooleanQuestion; 