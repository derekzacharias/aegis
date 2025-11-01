import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  List,
  ListItem,
  Tag,
  Text,
  useColorModeValue,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiDownloadCloud, FiRefreshCcw } from 'react-icons/fi';
import { useCreateReport, useReportJobs } from '../hooks/use-reports';
import type { ReportJobView } from '@compliance/shared';
import { useAssessments } from '../hooks/use-assessments';

const statusBadge: Record<ReportJobView['status'], { label: string; color: string }> = {
  queued: { label: 'Queued', color: 'yellow' },
  processing: { label: 'Generating', color: 'blue' },
  completed: { label: 'Ready', color: 'green' },
  failed: { label: 'Failed', color: 'red' }
};

const ReportsPage = () => {
  const toast = useToast();
  const [queuedJob, setQueuedJob] = useState<ReportJobView | null>(null);
  const createReport = useCreateReport();
  const { data: assessments } = useAssessments();
  const {
    data: jobs = [],
    isFetching,
    refetch
  } = useReportJobs();

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
      refetch();
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
        {jobs.map((job) => {
          const meta = statusBadge[job.status];
          return (
          <ListItem
            key={job.jobId}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            p={5}
            bg={useColorModeValue('white', 'gray.800')}
          >
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1}>
                <Heading size="sm">Assessment {job.assessmentId}</Heading>
                <Text fontSize="sm" color="gray.400">
                  Requested {new Date(job.createdAt).toLocaleString()} by {job.requestedBy}
                </Text>
                {job.error && (
                  <Text fontSize="sm" color="red.400">
                    Error: {job.error}
                  </Text>
                )}
                <HStack spacing={2}>
                  {job.formats.map((format) => (
                    <Tag key={`${job.jobId}-${format}`} size="sm" colorScheme="purple">
                      {format.toUpperCase()}
                    </Tag>
                  ))}
                </HStack>
              </VStack>
              <VStack align="end" spacing={2}>
                <Badge colorScheme={meta.color}>{meta.label}</Badge>
                <Button
                  variant="outline"
                  leftIcon={<Icon as={FiDownloadCloud} />}
                  size="sm"
                  isDisabled={!job.downloadUrl || job.status !== 'completed'}
                  onClick={() => {
                    if (job.downloadUrl) {
                      if (typeof window !== 'undefined') {
                        window.open(job.downloadUrl, '_blank', 'noopener');
                      }
                      toast({
                        title: 'Download started',
                        description: job.downloadUrl,
                        status: 'success'
                      });
                    } else {
                      toast({
                        title: 'Report still processing',
                        status: 'info'
                      });
                    }
                  }}
                >
                  Download
                </Button>
              </VStack>
            </HStack>
          </ListItem>
        );
        })}
      </List>
      <HStack spacing={3}>
        <Button
          variant="ghost"
          leftIcon={<Icon as={FiRefreshCcw} />}
          onClick={() => refetch()}
          isLoading={isFetching}
        >
          Refresh jobs
        </Button>
        {jobs.length === 0 && !isFetching && (
          <Text fontSize="sm" color="gray.500">
            No report jobs yet. Queue one to see status here.
          </Text>
        )}
      </HStack>
    </VStack>
  );
};

export default ReportsPage;
