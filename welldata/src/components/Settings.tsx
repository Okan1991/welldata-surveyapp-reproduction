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
  Divider,
  Flex,
  Image,
  Spacer
} from '@chakra-ui/react';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import ContainerManager from './ContainerManager';
import AuthManager from './AuthManager';

// Logo path
const interRegLogoPath = '/images/InterRegVLNL.png';

const Settings: React.FC = () => {
  const session = getDefaultSession();
  const webId = session.info.webId || '';
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');

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
    </Box>
  );
};

export default Settings; 