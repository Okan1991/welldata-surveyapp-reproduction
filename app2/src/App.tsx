import { useState } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  VStack, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  useColorModeValue
} from '@chakra-ui/react';
import AuthManager from './components/AuthManager';
import PodManager from './components/PodManager';
import { SessionProvider } from '@inrupt/solid-client-authn-browser';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('purple.200', 'purple.700');

  return (
    <SessionProvider>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box 
            p={5} 
            bg={bgColor} 
            borderRadius="lg" 
            boxShadow="md" 
            borderLeft="4px solid" 
            borderColor="brand.500"
          >
            <Heading as="h1" size="xl" color="brand.700">
              Solid Pod Manager - Alternative UI
            </Heading>
            <Heading as="h2" size="md" color="gray.500" mt={2}>
              Manage your Solid Pod with a different look and feel
            </Heading>
          </Box>

          <AuthManager onLoginStatusChange={setIsLoggedIn} />

          {isLoggedIn && (
            <Box 
              p={5} 
              bg={bgColor} 
              borderRadius="lg" 
              boxShadow="md" 
              borderTop="4px solid" 
              borderColor={borderColor}
            >
              <Tabs colorScheme="purple" variant="enclosed">
                <TabList>
                  <Tab fontWeight="semibold">Pod Contents</Tab>
                  <Tab fontWeight="semibold">Upload Files</Tab>
                  <Tab fontWeight="semibold">Settings</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <PodManager />
                  </TabPanel>
                  <TabPanel>
                    <Box p={4} borderRadius="md" bg="gray.50">
                      <Heading as="h3" size="md" mb={4}>
                        File Upload Feature Coming Soon
                      </Heading>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box p={4} borderRadius="md" bg="gray.50">
                      <Heading as="h3" size="md" mb={4}>
                        Pod Settings Coming Soon
                      </Heading>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          )}
        </VStack>
      </Container>
    </SessionProvider>
  );
}

export default App; 