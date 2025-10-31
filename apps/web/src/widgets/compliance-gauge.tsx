import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  HStack,
  Progress,
  Text,
  VStack
} from '@chakra-ui/react';

export type ComplianceGaugeProps = {
  current: number;
  target: number;
  quarters: Array<{
    period: string;
    percentage: number;
  }>;
};

const ComplianceGauge = ({ current, target, quarters }: ComplianceGaugeProps) => {
  return (
    <VStack spacing={3}>
      <CircularProgress value={current} size="180px" thickness="12px" color="brand.400">
        <CircularProgressLabel fontSize="3xl" fontWeight="bold">
          {current}%
        </CircularProgressLabel>
      </CircularProgress>
      <Text color="gray.400" fontSize="sm">
        Target: {target}% by FY24 Q4
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
      <VStack align="stretch" spacing={2} w="100%">
        {quarters.map((quarter) => (
          <Box key={quarter.period}>
            <HStack justify="space-between" fontSize="xs" color="gray.400" mb={1}>
              <Text>{quarter.period}</Text>
              <Text>{quarter.percentage}%</Text>
            </HStack>
            <Progress value={quarter.percentage} colorScheme="brand" size="sm" bg="gray.600" />
          </Box>
        ))}
      </VStack>
    </VStack>
  );
};

export default ComplianceGauge;
