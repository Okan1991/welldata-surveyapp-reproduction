import React from 'react';
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
  Divider
} from '@chakra-ui/react';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import ContainerManager from './ContainerManager';
import AuthManager from './AuthManager';

const Settings: React.FC = () => {
  const session = getDefaultSession();
  const webId = session.info.webId || '';
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');

  return (
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
  );
};

export default Settings; 