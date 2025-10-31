import { Box, Grid, GridItem, Text, VStack } from '@chakra-ui/react';

const cells = [
  { label: 'Very Low', color: 'green.500', count: 6 },
  { label: 'Low', color: 'green.400', count: 14 },
  { label: 'Moderate', color: 'yellow.400', count: 19 },
  { label: 'High', color: 'orange.400', count: 7 },
  { label: 'Critical', color: 'red.500', count: 2 }
];

const RiskHeatmap = () => {
  return (
    <VStack align="stretch" spacing={3}>
      <Grid templateColumns="repeat(5, 1fr)" gap={3}>
        {cells.map((cell) => (
          <GridItem
            key={cell.label}
            bg={cell.color}
            borderRadius="lg"
            p={4}
            textAlign="center"
          >
            <Text fontWeight="bold">{cell.count}</Text>
            <Text fontSize="xs">{cell.label}</Text>
          </GridItem>
        ))}
      </Grid>
      <Box fontSize="sm" color="gray.400">
        High and Critical findings concentrated in FedRAMP AC, IR, and CM families. Prioritize
        remediation campaigns aligned with POA&M commitments.
      </Box>
    </VStack>
  );
};

export default RiskHeatmap;
