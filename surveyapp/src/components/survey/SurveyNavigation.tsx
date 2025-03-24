import React from 'react';
import { Box, Button, HStack } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface SurveyNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  'aria-label': string;
}

const SurveyNavigation: React.FC<SurveyNavigationProps> = ({
  onNext,
  onPrevious,
  isFirst,
  isLast,
  'aria-label': ariaLabel,
}) => {
  return (
    <Box role="navigation" aria-label={ariaLabel}>
      <HStack spacing={4} justify="space-between">
        <Button
          onClick={onPrevious}
          isDisabled={isFirst}
          leftIcon={<ChevronLeftIcon />}
          size="lg"
          aria-label="Previous question"
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          rightIcon={<ChevronRightIcon />}
          size="lg"
          colorScheme="blue"
          aria-label={isLast ? "Complete survey" : "Next question"}
        >
          {isLast ? 'Complete' : 'Next'}
        </Button>
      </HStack>
    </Box>
  );
};

export default SurveyNavigation; 