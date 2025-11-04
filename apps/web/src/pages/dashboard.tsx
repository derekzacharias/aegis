import {
  Box,
  Grid,
  GridItem,
  Heading,
  Icon,
  HStack,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack
} from '@chakra-ui/react';
import { FiArrowDownRight, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import ComplianceGauge from '../widgets/compliance-gauge';
import RiskHeatmap from '../widgets/risk-heatmap';
import UpcomingActivities from '../widgets/upcoming-activities';
import UpcomingSchedules from '../widgets/upcoming-schedules';
import { useDashboardOverview } from '../hooks/use-dashboard';
import { useSchedules } from '../hooks/use-schedules';
import { useMemo } from 'react';

const trendIconMap = {
  up: FiArrowUpRight,
  down: FiArrowDownRight,
  steady: FiArrowRight
} as const;

const DashboardPage = () => {
  const { data, isFetching } = useDashboardOverview();
  const { data: schedules = [] } = useSchedules();

  const stats = useMemo(() => data?.stats ?? [], [data]);
  const antivirus = data?.antivirus;
  const antivirusMetrics = useMemo(() => {
    if (!antivirus) {
      return null;
    }
    const average =
      typeof antivirus.averageScanDurationMs === 'number'
        ? `${(antivirus.averageScanDurationMs / 1000).toFixed(1)}s`
        : '—';
    const lastScan = antivirus.lastCompletedScanAt
      ? new Date(antivirus.lastCompletedScanAt).toLocaleString()
      : 'No scans recorded';

    return {
      average,
      lastScan,
      engine: antivirus.engine ?? 'Unknown'
    };
  }, [antivirus]);

  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="lg">Operational Posture</Heading>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
        {stats.map((stat) => (
          <Stat key={stat.id} bg="gray.800" borderRadius="lg" p={4} borderWidth="1px" borderColor="gray.700">
            <HStack justify="space-between" align="center">
              <StatLabel>{stat.label}</StatLabel>
              <Icon
                as={trendIconMap[stat.trend]}
                color={stat.trend === 'up' ? 'green.400' : stat.trend === 'down' ? 'red.400' : 'gray.400'}
              />
            </HStack>
            <StatNumber>{stat.value}</StatNumber>
            <StatHelpText>{stat.helper}</StatHelpText>
          </Stat>
        ))}
      </SimpleGrid>

      {antivirus && antivirusMetrics && (
        <Box bg="gray.800" borderRadius="xl" p={6}>
          <Heading size="md" mb={4}>
            Antivirus Health
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3, xl: 6 }} spacing={4}>
            <Stat>
              <StatLabel>Scans (24h)</StatLabel>
              <StatNumber>{antivirus.scansLast24h}</StatNumber>
              <StatHelpText>Engine: {antivirusMetrics.engine}</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Infected (7d)</StatLabel>
              <StatNumber color={antivirus.infectedLast7d > 0 ? 'red.300' : undefined}>
                {antivirus.infectedLast7d}
              </StatNumber>
              <StatHelpText>Quarantined automatically</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Failures (7d)</StatLabel>
              <StatNumber color={antivirus.failedLast7d > 0 ? 'orange.300' : undefined}>
                {antivirus.failedLast7d}
              </StatNumber>
              <StatHelpText>Requires analyst review</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Active Quarantine</StatLabel>
              <StatNumber color={antivirus.quarantinedEvidence > 0 ? 'yellow.300' : undefined}>
                {antivirus.quarantinedEvidence}
              </StatNumber>
              <StatHelpText>Evidence items isolated</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Avg Scan Duration</StatLabel>
              <StatNumber>{antivirusMetrics.average}</StatNumber>
              <StatHelpText>Last 7 days</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Last Completed Scan</StatLabel>
              <StatNumber fontSize="lg">{antivirusMetrics.lastScan}</StatNumber>
              <StatHelpText>Latest event</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>
      )}

      <Grid templateColumns={{ base: '1fr', xl: '2fr 3fr' }} gap={6}>
        <GridItem>
          <Box bg="gray.800" borderRadius="xl" p={6}>
            <Heading size="md" mb={4}>
              Compliance Trend
            </Heading>
            {data && (
              <ComplianceGauge
                current={data.compliance.current}
                target={data.compliance.target}
                quarters={data.compliance.quarters}
              />
            )}
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
            {data && <RiskHeatmap cells={data.riskMatrix} />}
          </Box>
        </GridItem>
      </Grid>

      {data && (
        <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={6} alignItems="stretch">
          <GridItem>
            <UpcomingActivities activities={data.activities} />
          </GridItem>
          <GridItem>
            <UpcomingSchedules schedules={schedules} />
          </GridItem>
        </Grid>
      )}
      {isFetching && (
        <Text fontSize="sm" color="gray.500">
          Refreshing metrics…
        </Text>
      )}
    </VStack>
  );
};

export default DashboardPage;
