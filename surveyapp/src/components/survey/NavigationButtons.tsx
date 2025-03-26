import React from 'react';
import { ButtonGroup, Button, Box, Text } from '@chakra-ui/react';

interface NavigationButtonsProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <Box mt={6}>
      <ButtonGroup spacing={4} width="100%" justifyContent="space-between">
        <Button
          onClick={onPrevious}
          isDisabled={isFirst}
          variant="outline"
          leftIcon={<Text>←</Text>}
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          colorScheme="blue"
          rightIcon={<Text>→</Text>}
        >
          {isLast ? 'Complete' : 'Next'}
        </Button>
      </ButtonGroup>
      <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
        Question {currentIndex + 1} of {totalQuestions}
      </Text>
    </Box>
  );
};

export default NavigationButtons; 