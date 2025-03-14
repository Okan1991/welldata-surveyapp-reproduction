import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Container,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Flex,
  Image,
  Spacer,
  Switch,
  FormControl,
  FormLabel,
  Button,
  useToast,
  HStack,
  Badge,
  CardFooter
} from '@chakra-ui/react';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import ContainerManager from './ContainerManager';
import AuthManager from './AuthManager';

// Logo path
const interRegLogoPath = '/images/InterRegVLNL.png';

const Settings: React.FC = () => {
  const [webId, setWebId] = useState<string>('');
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const toast = useToast();
  const session = getDefaultSession();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    // Get the current session
    if (session.info.isLoggedIn) {
      setWebId(session.info.webId || '');
    }

    // Load settings from localStorage
    const savedDebugMode = localStorage.getItem('welldata_debug_mode');
    if (savedDebugMode) {
      setDebugMode(savedDebugMode === 'true');
    }
  }, [session.info.isLoggedIn]);

  const handleDebugModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setDebugMode(newValue);
    localStorage.setItem('welldata_debug_mode', newValue.toString());
    
    toast({
      title: newValue ? 'Debug Mode Enabled' : 'Debug Mode Disabled',
      description: newValue 
        ? 'Detailed logs will be shown in the browser console.' 
        : 'Detailed logs are now hidden.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: 'Storage Cleared',
      description: 'Local storage has been cleared. Please refresh the page.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Container maxW="container.lg" py={6}>
        <Heading as="h1" size="lg" mb={6}>
          Settings
        </Heading>
        
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Profile</Tab>
            <Tab>Container Management</Tab>
            <Tab>Authentication</Tab>
          </TabList>
          
          <TabPanels>
            {/* Profile Tab */}
            <TabPanel>
              <Card bg={cardBg} shadow="md">
                <CardHeader>
                  <Heading size="md">User Profile</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="bold">WebID:</Text>
                      <Text wordBreak="break-all">{webId}</Text>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Text fontWeight="bold">Login Status:</Text>
                      <Text>{session.info.isLoggedIn ? 'Logged In' : 'Not Logged In'}</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
            
            {/* Container Management Tab */}
            <TabPanel>
              <ContainerManager />
            </TabPanel>
            
            {/* Authentication Tab */}
            <TabPanel>
              <Box maxW="md" mx="auto">
                <AuthManager 
                  onLogin={() => {}} 
                  onLogout={() => {}}
                />
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
      
      {/* Footer with funding agency logo */}
      <Box as="footer" bg="eu.blue" color="white" p={4} mt={8}>
        <Container maxW="container.lg">
          <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between">
            <Text fontSize="sm">© {new Date().getFullYear()} WellData Project</Text>
            
            <Flex align="center" mt={{ base: 4, md: 0 }}>
              
              <Image 
                src={interRegLogoPath} 
                alt="InterReg Vlaanderen-Nederland Logo" 
                height="50px"
              />
            </Flex>
          </Flex>
        </Container>
      </Box>
      
      <Card>
        <CardHeader>
          <Heading size="md">Application Settings</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="debug-mode" mb="0">
                Debug Mode
              </FormLabel>
              <Switch 
                id="debug-mode" 
                isChecked={debugMode} 
                onChange={handleDebugModeChange} 
              />
            </FormControl>
            
            <Text fontSize="sm" color="gray.500">
              When debug mode is enabled, detailed logs will be shown in the browser console.
              This can help troubleshoot issues with your Solid Pod.
            </Text>
          </VStack>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <Heading size="md">Data Management</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Text>
              Clear local storage to reset the application state. This will log you out.
            </Text>
            <Button colorScheme="red" onClick={clearLocalStorage}>
              Clear Local Storage
            </Button>
          </VStack>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <Heading size="md">About</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="start" spacing={4}>
            <Text>
              WellData is an application for managing health data in Solid Pods.
            </Text>
            <HStack>
              <Badge colorScheme="blue">Version 1.0.0</Badge>
              <Badge colorScheme="green">Solid Pod Compatible</Badge>
            </HStack>
          </VStack>
        </CardBody>
        <CardFooter>
          <Flex direction="column" align="center" width="100%">
            <Text fontSize="sm" mb={2}>Funded by:</Text>
            <Image 
              src={interRegLogoPath} 
              alt="InterReg Vlaanderen-Nederland Logo" 
              height="50px"
            />
          </Flex>
        </CardFooter>
      </Card>
    </Box>
  );
};

export default Settings; 