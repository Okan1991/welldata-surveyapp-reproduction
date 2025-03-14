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
  CardFooter,
  Link,
  Tooltip
} from '@chakra-ui/react';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { ExternalLinkIcon, InfoIcon } from '@chakra-ui/icons';
import ContainerManager from './ContainerManager';
import AuthManager from './AuthManager';

// Import package.json for version info
// @ts-ignore
import packageInfo from '../../package.json';

// Logo path
const interRegLogoPath = '/images/InterRegVLNL.png';

const Settings: React.FC = () => {
  const [webId, setWebId] = useState<string>('');
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [gitCommit, setGitCommit] = useState<string>('');
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
    
    // Try to fetch the Git commit hash
    fetchGitCommitInfo();
  }, [session.info.isLoggedIn]);
  
  const fetchGitCommitInfo = async () => {
    try {
      // This file will be created during the build process or can be fetched from a server endpoint
      const response = await fetch('/git-info.json');
      if (response.ok) {
        const data = await response.json();
        setGitCommit(data.commit || '');
      } else {
        console.log('Could not fetch Git info');
      }
    } catch (error) {
      console.error('Error fetching Git info:', error);
      // Fallback to package version if Git info is not available
    }
  };

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

  // Format the version display
  const getVersionDisplay = () => {
    const baseVersion = packageInfo.version;
    if (gitCommit) {
      return `${baseVersion} (${gitCommit.substring(0, 7)})`;
    }
    return baseVersion;
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
            <Tab>Application Settings</Tab>
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
            
            {/* Application Settings Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} shadow="md">
                  <CardHeader>
                    <Heading size="md">Debug Options</Heading>
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
                
                <Card bg={cardBg} shadow="md">
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
                
                <Card bg={cardBg} shadow="md">
                  <CardHeader>
                    <Heading size="md">About</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={4} width="100%">
                      <Text>
                        WellData is an application for managing health data in Solid Pods.
                      </Text>
                      <HStack>
                        <Tooltip label={gitCommit ? `Full commit: ${gitCommit}` : "Version from package.json"}>
                          <Badge colorScheme="blue">Version {getVersionDisplay()}</Badge>
                        </Tooltip>
                        <Badge colorScheme="green">Solid Pod Compatible</Badge>
                      </HStack>
                      
                      <Divider />
                      
                      <Box width="100%">
                        <Link 
                          href="https://github.com/pvgorp/solid-local-fresh" 
                          isExternal 
                          color="blue.500"
                          fontWeight="medium"
                        >
                          GitHub Repository <ExternalLinkIcon mx="2px" />
                        </Link>
                      </Box>
                      
                      <Box width="100%" fontSize="sm" color="gray.600">
                        <Text fontWeight="medium" mb={1}>License</Text>
                        <Text>
                          Copyright 2024 Pieter Van Gorp
                        </Text>
                        <Text>
                          Licensed under the Apache License, Version 2.0
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default Settings; 