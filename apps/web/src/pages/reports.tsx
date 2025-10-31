import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  List,
  ListItem,
  Text,
  useColorModeValue,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiDownloadCloud, FiRefreshCcw } from 'react-icons/fi';
import { useCreateReport, ReportJob } from '../hooks/use-reports';
import { useAssessments } from '../hooks/use-assessments';

const reports = [
  {
    id: 'fedramp-readiness',
    name: 'FedRAMP Moderate Readiness Package',
    format: 'HTML + PDF',
    generatedAt: '2024-02-02T17:38:00Z'
  },
  {
    id: 'nist-csf-quarterly',
    name: 'NIST CSF Quarterly Review',
    format: 'HTML',
    generatedAt: '2024-01-15T12:05:00Z'
  }
];

const ReportsPage = () => {
  const toast = useToast();
  const [queuedJob, setQueuedJob] = useState<ReportJob | null>(null);
  const createReport = useCreateReport();
  const { data: assessments } = useAssessments();

  const handleGenerateReport = async () => {
    const assessment = assessments?.[0];
    if (!assessment) {
      toast({
        title: 'No assessments available',
        description: 'Create an assessment before generating reports.',
        status: 'warning'
      });
      return;
    }

    try {
      const job = await createReport.mutateAsync({
        assessmentId: assessment.id,
        formats: ['html', 'pdf']
      });
      setQueuedJob(job);
      toast({
        title: 'Report queued',
        description: `Report job ${job.jobId} queued for ${assessment.name}`,
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Unable to queue report',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Heading size="lg">Reports & Exports</Heading>
        <Button
          leftIcon={<Icon as={FiRefreshCcw} />}
          colorScheme="brand"
          onClick={handleGenerateReport}
          isLoading={createReport.isPending}
        >
          Generate New Report
        </Button>
      </HStack>

      {queuedJob && (
        <Box
          borderWidth="1px"
          borderRadius="lg"
          borderColor={useColorModeValue('brand.200', 'brand.400')}
          bg={useColorModeValue('brand.50', 'rgba(26, 124, 255, 0.08)')}
          p={4}
        >
          <Text fontWeight="semibold">Queued Job: {queuedJob.jobId}</Text>
          <Text fontSize="sm" color="gray.400">
            Formats: {queuedJob.formats.join(', ')} | Status: {queuedJob.status}
          </Text>
        </Box>
      )}

      <List spacing={4}>
        {reports.map((report) => (
          <ListItem
            key={report.id}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            p={5}
            bg={useColorModeValue('white', 'gray.800')}
          >
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1}>
                <Heading size="sm">{report.name}</Heading>
                <Text fontSize="sm" color="gray.400">
                  Generated {new Date(report.generatedAt).toLocaleString()}
                </Text>
                <Badge colorScheme="purple">{report.format}</Badge>
              </VStack>
              <Button variant="outline" leftIcon={<Icon as={FiDownloadCloud} />} size="sm">
                Download
              </Button>
            </HStack>
          </ListItem>
        ))}
      </List>
    </VStack>
  );
};

export default ReportsPage;
