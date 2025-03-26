import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Box, Container, Heading, Text, Button, VStack, HStack, useColorModeValue } from '@chakra-ui/react';
import SurveyTest from './pages/SurveyTest';
import Auth from './components/common/Auth';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = getDefaultSession();
  if (!session.info.isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Box minH="100vh" bg={bgColor}>
        <Box
          as="header"
          borderBottom="1px"
          borderColor={borderColor}
          py={4}
          mb={8}
        >
          <Container maxW="container.xl">
            <HStack justify="space-between">
              <Link to="/">
                <Heading as="h1" size="lg">
                  Survey App
                </Heading>
              </Link>
              <Auth />
            </HStack>
          </Container>
        </Box>

        <Container maxW="container.xl" py={8}>
          <Routes>
            <Route
              path="/"
              element={
                <VStack spacing={8} align="stretch">
                  <Box>
                    <Heading as="h2" size="xl" mb={4}>
                      Welcome to the Survey App
                    </Heading>
                    <Text fontSize="lg" color="gray.600" mb={4}>
                      A FHIR-compliant survey application with accessibility and UX best practices.
                    </Text>
                    <Text fontSize="md" color="gray.500" mb={6}>
                      Please log in with your SOLID account to access the survey.
                    </Text>
                  </Box>
                </VStack>
              }
            />
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <SurveyTest />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
};

export default App; 