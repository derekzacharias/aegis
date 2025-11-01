import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tag,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { EvidenceStatus } from '@compliance/shared';
import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiEye, FiUpload } from 'react-icons/fi';
import { useEvidence, useEvidenceUpload } from '../hooks/use-evidence';
import { useFrameworks } from '../hooks/use-frameworks';

const statusMeta: Record<EvidenceStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending review', color: 'yellow' },
  APPROVED: { label: 'Approved', color: 'green' },
  ARCHIVED: { label: 'Archived', color: 'gray' },
  QUARANTINED: { label: 'Quarantined', color: 'red' }
};

const formatSize = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes.toFixed(0)} B`;
};

const EvidencePage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: evidence = [] } = useEvidence();
  const { data: frameworks = [] } = useFrameworks();
  const uploadEvidence = useEvidenceUpload();
  const [statusFilter, setStatusFilter] = useState<'all' | EvidenceStatus>('all');
  const [search, setSearch] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formState, setFormState] = useState({
    name: '',
    controlIds: '',
    frameworkIds: [] as string[],
    retentionPeriodDays: 365,
    retentionReason: '',
    reviewDue: '',
    reviewerId: '',
    tags: '',
    categories: '',
    notes: '',
    nextAction: '',
    file: null as File | null
  });

  useEffect(() => {
    if (!isOpen) {
      setUploadProgress(0);
    }
  }, [isOpen]);

  const stats = useMemo(() => {
    const counts = {
      total: evidence.length,
      pending: evidence.filter((item) => item.status === 'PENDING').length,
      approved: evidence.filter((item) => item.status === 'APPROVED').length,
      archived: evidence.filter((item) => item.status === 'ARCHIVED').length
    };
    return counts;
  }, [evidence]);

  const filteredEvidence = useMemo(() => {
    const term = search.trim().toLowerCase();

    return evidence.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const frameworkNames = item.frameworks.map((framework) => framework.name).join(' ').toLowerCase();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.controlIds.some((control) => control.toLowerCase().includes(term)) ||
        frameworkNames.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [evidence, statusFilter, search]);

  const resetForm = () => {
    setFormState({
      name: '',
      controlIds: '',
      frameworkIds: [],
      retentionPeriodDays: 365,
      retentionReason: '',
      reviewDue: '',
      reviewerId: '',
      tags: '',
      categories: '',
      notes: '',
      nextAction: '',
      file: null
    });
    setUploadProgress(0);
  };

  const handleClose = () => {
    if (uploadEvidence.isPending) {
      return;
    }
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!formState.name.trim()) {
      toast({ title: 'Evidence name required', status: 'warning' });
      return;
    }

    if (!formState.frameworkIds.length) {
      toast({ title: 'Select at least one framework', status: 'warning' });
      return;
    }

    if (!formState.file) {
      toast({ title: 'Select a file to upload', status: 'warning' });
      return;
    }

    try {
      setUploadProgress(0);
      await uploadEvidence.mutateAsync({
        file: formState.file,
        name: formState.name.trim(),
        frameworkIds: formState.frameworkIds,
        controlIds: formState.controlIds
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        retentionPeriodDays: formState.retentionPeriodDays || undefined,
        retentionReason: formState.retentionReason || undefined,
        reviewDue: formState.reviewDue || undefined,
        reviewerId: formState.reviewerId || undefined,
        notes: formState.notes || undefined,
        tags: formState.tags
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        categories: formState.categories
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        nextAction: formState.nextAction || undefined,
        statusNote: 'Uploaded via console',
        onProgress: setUploadProgress
      });

      toast({ title: 'Evidence uploaded', status: 'success' });
      resetForm();
      onClose();
    } catch (error) {
      toast({
        title: 'Unable to upload evidence',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <HStack
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        flexDir={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Heading size="lg">Evidence Vault</Heading>
        <Button
          leftIcon={<Icon as={FiUpload} />}
          colorScheme="brand"
          onClick={onOpen}
          isLoading={uploadEvidence.isPending}
        >
          Upload Evidence
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Stat
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          p={4}
        >
          <StatLabel>Total Items</StatLabel>
          <StatNumber>{stats.total}</StatNumber>
          <StatHelpText>Across all frameworks</StatHelpText>
        </Stat>
        <Stat
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          p={4}
        >
          <StatLabel>Pending Review</StatLabel>
          <StatNumber>{stats.pending}</StatNumber>
          <StatHelpText>Awaiting assignment</StatHelpText>
        </Stat>
        <Stat
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          p={4}
        >
          <StatLabel>Approved</StatLabel>
          <StatNumber>{stats.approved}</StatNumber>
          <StatHelpText>Ready for audit</StatHelpText>
        </Stat>
      </SimpleGrid>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        align={{ base: 'stretch', md: 'center' }}
      >
        <Input
          placeholder="Search by evidence, control, or framework..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          maxW={{ base: '100%', md: '320px' }}
        />
        <ButtonGroup size="sm" isAttached>
          {['all', 'PENDING', 'APPROVED', 'ARCHIVED', 'QUARANTINED'].map((status) => {
            const isAll = status === 'all';
            const label = isAll ? 'All' : statusMeta[status as EvidenceStatus].label;
            const isActive = statusFilter === status;
            return (
              <Button
                key={status}
                onClick={() => setStatusFilter(status as typeof statusFilter)}
                variant={isActive ? 'solid' : 'outline'}
                colorScheme="brand"
              >
                {label}
              </Button>
            );
          })}
        </ButtonGroup>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
        {filteredEvidence.map((item) => {
          const meta = statusMeta[item.status];
          return (
            <Box
              key={item.id}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              p={5}
              bg={useColorModeValue('white', 'gray.800')}
              display="flex"
              flexDirection="column"
              gap={3}
            >
              <VStack align="stretch" spacing={2} flex="1">
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex="1">
                    <Heading size="sm">{item.name}</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Uploaded {new Date(item.uploadedAt).toLocaleString()} by{' '}
                      {item.uploadedBy?.name ?? 'Unknown'}
                    </Text>
                  </VStack>
                  <Badge colorScheme={meta.color}>{meta.label}</Badge>
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  <Tag size="sm" colorScheme="blue">
                    {item.contentType.toUpperCase()} · {formatSize(item.fileSize)}
                  </Tag>
                  <Tag size="sm" colorScheme="purple">
                    Ingestion: {item.ingestionStatus}
                  </Tag>
                  {item.reviewDue && (
                    <Tag size="sm" colorScheme="teal">
                      Review by {new Date(item.reviewDue).toLocaleDateString()}
                    </Tag>
                  )}
                </HStack>
                {item.controlIds.length > 0 && (
                  <Text fontSize="sm" color="gray.400">
                    Controls: {item.controlIds.join(', ')}
                  </Text>
                )}
                <HStack spacing={2} flexWrap="wrap">
                  {item.frameworks.map((framework) => (
                    <Tag key={framework.id} size="sm" variant="subtle" colorScheme="brand">
                      {framework.name}
                    </Tag>
                  ))}
                </HStack>
                {item.nextAction && (
                  <Box
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    borderRadius="md"
                    p={3}
                    fontSize="sm"
                    color="gray.300"
                  >
                    {item.nextAction}
                  </Box>
                )}
                {item.retention.periodDays && (
                  <Text fontSize="xs" color="gray.500">
                    Retention: {item.retention.periodDays} days
                    {item.retention.expiresAt
                      ? ` · Expires ${new Date(item.retention.expiresAt).toLocaleDateString()}`
                      : ''}
                    {item.retention.reason ? ` · ${item.retention.reason}` : ''}
                  </Text>
                )}
              </VStack>
              <HStack justify="space-between">
                <ButtonGroup size="sm" variant="ghost" colorScheme="brand">
                  <Button leftIcon={<FiEye />}>Preview</Button>
                  <Button leftIcon={<FiDownload />}>Download</Button>
                </ButtonGroup>
                <Button size="sm" variant="outline" colorScheme="brand">
                  Request Review
                </Button>
              </HStack>
            </Box>
          );
        })}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Evidence</ModalHeader>
          <ModalCloseButton disabled={uploadEvidence.isPending} />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Evidence name</FormLabel>
                <Input
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Access control attestation"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Evidence file</FormLabel>
                <Input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setFormState((prev) => ({ ...prev, file }));
                  }}
                />
                <FormHelperText>
                  Files upload via signed PUT URLs and remain in secure storage.
                </FormHelperText>
                {uploadEvidence.isPending && <Progress value={uploadProgress} size="xs" mt={2} />}
              </FormControl>
              <FormControl>
                <FormLabel>Linked controls</FormLabel>
                <Input
                  value={formState.controlIds}
                  onChange={(event) => setFormState((prev) => ({ ...prev, controlIds: event.target.value }))}
                  placeholder="ac-2, ac-17"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Frameworks</FormLabel>
                <CheckboxGroup
                  value={formState.frameworkIds}
                  onChange={(values) => setFormState((prev) => ({ ...prev, frameworkIds: values as string[] }))}
                >
                  <Stack spacing={2} direction={{ base: 'column', md: 'row' }} flexWrap="wrap">
                    {frameworks.map((framework) => (
                      <Checkbox key={framework.id} value={framework.id}>
                        {framework.name}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Retention (days)</FormLabel>
                <Input
                  type="number"
                  min={0}
                  value={formState.retentionPeriodDays}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      retentionPeriodDays: Number(event.target.value) || 0
                    }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Retention reason</FormLabel>
                <Input
                  value={formState.retentionReason}
                  onChange={(event) => setFormState((prev) => ({ ...prev, retentionReason: event.target.value }))}
                  placeholder="FedRAMP documentation retention"
                />
              </FormControl>
              <HStack spacing={4} align="flex-start" flexWrap="wrap">
                <FormControl>
                  <FormLabel>Review due</FormLabel>
                  <Input
                    type="date"
                    value={formState.reviewDue}
                    onChange={(event) => setFormState((prev) => ({ ...prev, reviewDue: event.target.value }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Assign reviewer</FormLabel>
                  <Input
                    placeholder="Reviewer ID"
                    value={formState.reviewerId}
                    onChange={(event) => setFormState((prev) => ({ ...prev, reviewerId: event.target.value }))}
                  />
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>Tags (comma separated)</FormLabel>
                <Input
                  value={formState.tags}
                  onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="access-control, quarterly"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Categories (comma separated)</FormLabel>
                <Input
                  value={formState.categories}
                  onChange={(event) => setFormState((prev) => ({ ...prev, categories: event.target.value }))}
                  placeholder="policy, procedure"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Next action</FormLabel>
                <Input
                  value={formState.nextAction}
                  onChange={(event) => setFormState((prev) => ({ ...prev, nextAction: event.target.value }))}
                  placeholder="Assign reviewer"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formState.notes}
                  onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Provide context for reviewers"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose} isDisabled={uploadEvidence.isPending}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleSubmit}
                isLoading={uploadEvidence.isPending}
                isDisabled={!formState.file}
              >
                Save evidence
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default EvidencePage;
