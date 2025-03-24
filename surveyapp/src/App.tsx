import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import SurveyTest from './pages/SurveyTest';

const App: React.FC = () => {
  return (
    <Router>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="2xl" mb={4}>
              Survey App
            </Heading>
            <Text fontSize="lg" color="gray.600" mb={4}>
              A FHIR-compliant survey application with accessibility and UX best practices.
            </Text>
            <Button as={Link} to="/test" colorScheme="blue" size="lg">
              Try the Survey
            </Button>
          </Box>

          <Routes>
            <Route path="/test" element={<SurveyTest />} />
          </Routes>
        </VStack>
      </Container>
    </Router>
  );
};

export default App; 