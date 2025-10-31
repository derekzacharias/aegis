import { Box, Grid, GridItem, Text, VStack } from '@chakra-ui/react';

export type RiskHeatmapCell = {
  label: string;
  count: number;
  severity: 'very-low' | 'low' | 'moderate' | 'high' | 'critical';
};

const severityToColor: Record<RiskHeatmapCell['severity'], string> = {
  'very-low': 'green.500',
  low: 'green.400',
  moderate: 'yellow.400',
  high: 'orange.400',
  critical: 'red.500'
};

interface RiskHeatmapProps {
  cells: RiskHeatmapCell[];
}

const RiskHeatmap = ({ cells }: RiskHeatmapProps) => {
  return (
    <VStack align="stretch" spacing={3}>
      <Grid templateColumns="repeat(5, 1fr)" gap={3}>
        {cells.map((cell) => (
          <GridItem
            key={cell.label}
            bg={severityToColor[cell.severity]}
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
