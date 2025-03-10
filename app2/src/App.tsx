import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import AuthManager from './components/AuthManager';
import PodManager from './components/PodManager';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <ChakraProvider>
      <Box bg={bgColor} color={textColor} minH="100vh" py={10}>
        <Container maxW="container.lg">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center" mb={8}>
              <Heading as="h1" size="2xl" mb={2} color="purple.600">
                Solid Pod Manager
              </Heading>
              <Text fontSize="lg">
                Alternative UI for managing your Solid Pod
              </Text>
            </Box>
            
            <AuthManager onLoginStatusChange={setIsLoggedIn} />
            
            <Divider my={6} />
            
            {isLoggedIn && <PodManager />}
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 