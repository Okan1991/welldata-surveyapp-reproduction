import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  HStack,
  useToast,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import QuestionnaireViewer from './QuestionnaireViewer';

interface SurveyListProps {
  surveys: Array<{
    id: string;
    title?: string;
    url: string;
    itemCount?: number;
  }>;
  onSelectSurvey: (survey: { id: string; title?: string; url: string }) => void;
}

const SurveyList: React.FC<SurveyListProps> = ({ surveys, onSelectSurvey }) => {
  const [selectedQuestionnaireUrl, setSelectedQuestionnaireUrl] = useState<string | null>(null);
  const toast = useToast();

  const handleInspect = (surveyUrl: string) => {
    setSelectedQuestionnaireUrl(surveyUrl);
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {surveys.map((survey) => (
          <Box
            key={survey.id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            _hover={{ shadow: 'md' }}
          >
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                  {survey.title || 'Untitled Survey'}
                </Text>
                <HStack>
                  <Tooltip label="Inspect Questionnaire">
                    <IconButton
                      aria-label="Inspect questionnaire"
                      icon={<ViewIcon />}
                      onClick={() => handleInspect(survey.url)}
                      colorScheme="blue"
                      variant="ghost"
                    />
                  </Tooltip>
                  <Button
                    colorScheme="blue"
                    onClick={() => onSelectSurvey(survey)}
                  >
                    Start Survey
                  </Button>
                </HStack>
              </HStack>
              <Text color="gray.600" fontSize="sm">
                Questionnaire URL: {survey.url}
              </Text>
              <Text color="gray.600" fontSize="sm">
                Questions: {survey.itemCount || 0}
              </Text>
            </VStack>
          </Box>
        ))}
      </VStack>

      {selectedQuestionnaireUrl && (
        <QuestionnaireViewer
          questionnaireUrl={selectedQuestionnaireUrl}
          isOpen={!!selectedQuestionnaireUrl}
          onClose={() => setSelectedQuestionnaireUrl(null)}
        />
      )}
    </Box>
  );
};

export default SurveyList; 