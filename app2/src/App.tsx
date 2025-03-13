import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  useColorModeValue,
  Flex,
  Spacer,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { HamburgerIcon, SettingsIcon } from '@chakra-ui/icons';
import AuthManager from './components/AuthManager';
import PodManager from './components/PodManager';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <ChakraProvider>
      <Box bg={bgColor} color={textColor} minH="100vh">
        {/* Compact Header */}
        <Flex 
          as="header" 
          bg="purple.600" 
          color="white" 
          p={3} 
          alignItems="center" 
          boxShadow="md"
        >
          <Heading as="h1" size="md">Solid Pod Manager</Heading>
          <Spacer />
          <Popover isOpen={isOpen} onClose={onClose} placement="bottom-end">
            <PopoverTrigger>
              <IconButton
                aria-label="User settings"
                icon={<SettingsIcon />}
                variant="ghost"
                colorScheme="whiteAlpha"
                onClick={onOpen}
              />
            </PopoverTrigger>
            <PopoverContent width="300px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody p={4}>
                <AuthManager 
                  onLogin={(webId) => setIsLoggedIn(true)} 
                  onLogout={() => setIsLoggedIn(false)} 
                />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>

        {/* Main Content */}
        <Container maxW="container.lg" py={6}>
          {isLoggedIn && <PodManager />}
          {!isLoggedIn && (
            <Box textAlign="center" mt={10}>
              <Heading as="h2" size="lg" mb={4}>
                Welcome to Solid Pod Manager
              </Heading>
              <Text fontSize="md" mb={6}>
                Please log in using the settings icon in the top right corner to manage your Solid Pod.
              </Text>
            </Box>
          )}
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 