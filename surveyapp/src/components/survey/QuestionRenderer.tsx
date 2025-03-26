import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Stack,
  Text
} from '@chakra-ui/react';
import { FHIRQuestionnaireItem, FHIRAnswer } from '../../fhir/types';

interface QuestionRendererProps {
  question: FHIRQuestionnaireItem;
  answer?: FHIRAnswer;
  onAnswer: (answer: FHIRAnswer) => void;
  error?: string;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answer,
  onAnswer,
  error
}) => {
  const handleChange = (value: any) => {
    let fhirAnswer: FHIRAnswer;

    switch (question.type) {
      case 'boolean':
        fhirAnswer = { valueBoolean: value === 'true' };
        break;
      case 'number':
        const numValue = parseFloat(value);
        if (Number.isInteger(numValue)) {
          fhirAnswer = { valueInteger: numValue };
        } else {
          fhirAnswer = { valueDecimal: numValue };
        }
        break;
      case 'text':
        fhirAnswer = { valueString: value };
        break;
      case 'choice':
      case 'snomed':
        if (question.answerOption) {
          const selectedOption = question.answerOption.find(
            opt => opt.valueCoding[0]?.code === value
          );
          fhirAnswer = {
            valueCoding: selectedOption?.valueCoding[0] || {
              system: question.answerOption[0]?.valueCoding[0]?.system || '',
              code: value,
              display: selectedOption?.valueCoding[0]?.display || value
            }
          };
        } else {
          fhirAnswer = { valueString: value };
        }
        break;
      default:
        fhirAnswer = { valueString: value };
    }

    onAnswer(fhirAnswer);
  };

  const renderInput = () => {
    switch (question.type) {
      case 'boolean':
        return (
          <RadioGroup
            onChange={handleChange}
            value={answer?.valueBoolean?.toString()}
          >
            <Stack direction="row">
              <Radio value="true">Yes</Radio>
              <Radio value="false">No</Radio>
            </Stack>
          </RadioGroup>
        );

      case 'choice':
      case 'snomed':
        if (question.answerOption) {
          return (
            <RadioGroup
              onChange={handleChange}
              value={answer?.valueCoding?.code}
            >
              <Stack>
                {question.answerOption.map((option, index) => (
                  <Radio
                    key={option.valueCoding[0]?.code || index}
                    value={option.valueCoding[0]?.code || ''}
                  >
                    {option.valueCoding[0]?.display || option.valueCoding[0]?.code}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          );
        }
        return (
          <Input
            value={answer?.valueString || ''}
            onChange={e => handleChange(e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            step="any"
            value={answer?.valueInteger || answer?.valueDecimal || ''}
            onChange={e => handleChange(e.target.value)}
          />
        );

      case 'text':
      default:
        return (
          <Input
            value={answer?.valueString || ''}
            onChange={e => handleChange(e.target.value)}
          />
        );
    }
  };

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel>
        {question.text}
        {question.required && (
          <Text as="span" color="red.500" ml={1}>
            *
          </Text>
        )}
      </FormLabel>
      {renderInput()}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default QuestionRenderer; 