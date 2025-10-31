import {
  Box,
  Grid,
  GridItem,
  Heading,
  HStack,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack
} from '@chakra-ui/react';
import ComplianceGauge from '../widgets/compliance-gauge';
import RiskHeatmap from '../widgets/risk-heatmap';
import UpcomingActivities from '../widgets/upcoming-activities';

const DashboardPage = () => {
  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="lg">Operational Posture</Heading>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
        <Stat bg="gray.800" borderRadius="lg" p={4}>
          <StatLabel>Overall Compliance</StatLabel>
          <StatNumber>72%</StatNumber>
          <StatHelpText>+6% QoQ</StatHelpText>
        </Stat>
        <Stat bg="gray.800" borderRadius="lg" p={4}>
          <StatLabel>Open Gaps</StatLabel>
          <StatNumber>48</StatNumber>
          <StatHelpText>12 high risk</StatHelpText>
        </Stat>
        <Stat bg="gray.800" borderRadius="lg" p={4}>
          <StatLabel>Evidence Reviews</StatLabel>
          <StatNumber>19</StatNumber>
          <StatHelpText>Due this week</StatHelpText>
        </Stat>
        <Stat bg="gray.800" borderRadius="lg" p={4}>
          <StatLabel>FedRAMP Progress</StatLabel>
          <StatNumber>58%</StatNumber>
          <StatHelpText>Moderate baseline</StatHelpText>
        </Stat>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', xl: '2fr 3fr' }} gap={6}>
        <GridItem>
          <Box bg="gray.800" borderRadius="xl" p={6}>
            <Heading size="md" mb={4}>
              Compliance Trend
            </Heading>
            <ComplianceGauge />
          </Box>
        </GridItem>
        <GridItem>
          <Box bg="gray.800" borderRadius="xl" p={6}>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Risk Heatmap</Heading>
              <Text fontSize="sm" color="gray.400">
                Weighted by control criticality
              </Text>
            </HStack>
            <RiskHeatmap />
          </Box>
        </GridItem>
      </Grid>

      <UpcomingActivities />
    </VStack>
  );
};

export default DashboardPage;
