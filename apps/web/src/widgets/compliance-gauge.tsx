import { Box, CircularProgress, CircularProgressLabel, Text, VStack } from '@chakra-ui/react';

const ComplianceGauge = () => {
  return (
    <VStack spacing={3}>
      <CircularProgress value={72} size="180px" thickness="12px" color="brand.400">
        <CircularProgressLabel fontSize="3xl" fontWeight="bold">
          72%
        </CircularProgressLabel>
      </CircularProgress>
      <Text color="gray.400" fontSize="sm">
        Target: 85% by Q4 FY24
      </Text>
      <Box
        w="100%"
        bg="gray.700"
        borderRadius="md"
        p={3}
        fontSize="sm"
        color="gray.200"
      >
        Latest improvements driven by CIS Control 6 automation and access review attestation.
      </Box>
    </VStack>
  );
};

export default ComplianceGauge;
