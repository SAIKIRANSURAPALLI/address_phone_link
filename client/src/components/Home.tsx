import React from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <Box textAlign="center" py={10}>
      <Heading as="h1" size="2xl" mb={4}>
        Web3 Address to Web2 Phone Link
      </Heading>
      <Text fontSize="xl" mb={6}>
        Link your Web3 address with your phone number securely.
      </Text>
      <Button as={Link} to="/dashboard" colorScheme="blue" size="lg">
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default Home;
