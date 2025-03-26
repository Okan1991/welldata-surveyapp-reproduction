import React from 'react';
import { Box, Progress, Text, HStack } from '@chakra-ui/react';

interface SurveyProgressProps {
  current: number;
  total: number;
  'aria-label': string;
}

const SurveyProgress: React.FC<SurveyProgressProps> = ({
  current,
  total,
  'aria-label': ariaLabel,
}) => {
  const percentage = (current / total) * 100;

  return (
    <Box role="progressbar" aria-label={ariaLabel}>
      <HStack spacing={4} mb={2}>
        <Text fontSize="sm" color="gray.600">
          Question {current} of {total}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {Math.round(percentage)}% complete
        </Text>
      </HStack>
      <Progress
        value={percentage}
        size="sm"
        colorScheme="blue"
        borderRadius="full"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </Box>
  );
};

export default SurveyProgress; 