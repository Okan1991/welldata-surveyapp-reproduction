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
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { FHIRQuestionItem } from '../../surveys/types';
import { FHIRAnswer } from '../../fhir/types';

interface QuestionRendererProps {
  question: FHIRQuestionItem;
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
  const questionId = question.linkId;
  const isRequired = question.required;
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)');

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
            <Stack direction="row" spacing={4}>
              <Radio value="true" size="lg">
                <Text fontSize="lg">Yes</Text>
              </Radio>
              <Radio value="false" size="lg">
                <Text fontSize="lg">No</Text>
              </Radio>
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
              <Stack spacing={4}>
                {question.answerOption.map((option, index) => (
                  <Radio
                    key={option.valueCoding[0]?.code || index}
                    value={option.valueCoding[0]?.code || ''}
                    size="lg"
                  >
                    <Text fontSize="lg">
                      {option.valueCoding[0]?.display || option.valueCoding[0]?.code}
                    </Text>
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
            size="lg"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            step="any"
            value={answer?.valueInteger || answer?.valueDecimal || ''}
            onChange={e => handleChange(e.target.value)}
            size="lg"
          />
        );

      case 'text':
      default:
        return (
          <Input
            value={answer?.valueString || ''}
            onChange={e => handleChange(e.target.value)}
            size="lg"
          />
        );
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
          {renderInput()}
        </Box>

        <FormErrorMessage mt={2}>{error}</FormErrorMessage>
      </FormControl>
    </Box>
  );
};

export default QuestionRenderer; 