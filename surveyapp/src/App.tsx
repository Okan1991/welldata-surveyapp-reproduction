import React from 'react'
import { Box, Container, Heading, Text } from '@chakra-ui/react'

const App: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <Heading as="h1" size="2xl" mb={4}>
          Health Survey App
        </Heading>
        <Text fontSize="xl">
          Welcome to the WellData Health Survey Application
        </Text>
      </Box>
    </Container>
  )
}

export default App 