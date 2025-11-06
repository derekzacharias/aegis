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
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tag,
  TagLabel,
  TagRightIcon,
  Text,
  Textarea,
  Tooltip,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import {
  EvidenceRecord,
  EvidenceScanStatus,
  EvidenceStatus
} from '@compliance/shared';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  FiDownload,
  FiArrowRight,
  FiEdit,
  FiEye,
  FiLink,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiX
} from 'react-icons/fi';
import {
  useDeleteEvidence,
  useEvidence,
  useEvidenceUpload,
  useUpdateEvidenceLinks,
  useUpdateEvidenceMetadata,
  useUpdateEvidenceStatus
} from '../hooks/use-evidence';
import { useFrameworks } from '../hooks/use-frameworks';
import { useAssessmentControls, useAssessments } from '../hooks/use-assessments';

const statusMeta: Record<
  EvidenceStatus,
  { label: string; color: string }
> = {
  PENDING: { label: 'Pending review', color: 'yellow' },
  APPROVED: { label: 'Approved', color: 'green' },
  ARCHIVED: { label: 'Archived', color: 'gray' },
  QUARANTINED: { label: 'Quarantined', color: 'red' }
};

const getStatusBadgeMeta = (status: EvidenceStatus | null): { label: string; color: string } => {
  if (!status) {
    return { label: 'New', color: 'gray' };
  }
  return statusMeta[status];
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

type EvidenceFormState = {
  name: string;
  controlIds: string;
  frameworkIds: string[];
  assessmentId: string;
  assessmentControlIds: string[];
  retentionPeriodDays: number;
  retentionReason: string;
  reviewDue: string;
  reviewerId: string;
  tags: string;
  categories: string;
  notes: string;
  nextAction: string;
  source: string;
  file: File | null;
};

const createDefaultFormState = (): EvidenceFormState => ({
  name: '',
  controlIds: '',
  frameworkIds: [],
  assessmentId: '',
  assessmentControlIds: [],
  retentionPeriodDays: 365,
  retentionReason: '',
  reviewDue: '',
  reviewerId: '',
  tags: '',
  categories: '',
  notes: '',
  nextAction: '',
  source: '',
  file: null
});

const splitCsv = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const EvidencePage = () => {
  const toast = useToast();
  const uploadModal = useDisclosure();
  const attachmentModal = useDisclosure();
  const metadataModal = useDisclosure();

  const { data: evidence = [] } = useEvidence();
  const { data: frameworks = [] } = useFrameworks();
  const { data: assessments = [] } = useAssessments();

  const uploadEvidence = useEvidenceUpload();
  const updateStatus = useUpdateEvidenceStatus();
  const updateMetadata = useUpdateEvidenceMetadata();
  const updateLinks = useUpdateEvidenceLinks();
  const deleteEvidence = useDeleteEvidence();

  const [statusFilter, setStatusFilter] = useState<'all' | EvidenceStatus>('all');
  const [search, setSearch] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formState, setFormState] = useState<EvidenceFormState>(createDefaultFormState);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [attachmentDraft, setAttachmentDraft] = useState<{
    evidence: EvidenceRecord | null;
    assessmentId: string;
    controlIds: string[];
  }>({
    evidence: null,
    assessmentId: '',
    controlIds: []
  });

  const [metadataDraft, setMetadataDraft] = useState<{
    evidence: EvidenceRecord | null;
    name: string;
    nextAction: string;
    notes: string;
    tags: string;
    categories: string;
    source: string;
  }>({
    evidence: null,
    name: '',
    nextAction: '',
    notes: '',
    tags: '',
    categories: '',
    source: ''
  });

  const { data: uploadAssessmentControls = [], isFetching: isUploadControlsLoading } =
    useAssessmentControls(formState.assessmentId || undefined);
  const { data: attachmentControls = [], isFetching: isAttachmentControlsLoading } =
    useAssessmentControls(attachmentDraft.assessmentId || undefined);

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const dropBorder = useColorModeValue('gray.300', 'gray.600');
  const dropActiveBorder = useColorModeValue('brand.500', 'brand.300');
  const noteBg = useColorModeValue('gray.100', 'gray.700');
  const noteText = useColorModeValue('gray.600', 'gray.200');

  useEffect(() => {
    if (!uploadModal.isOpen) {
      setUploadProgress(0);
      setIsDragging(false);
    }
  }, [uploadModal.isOpen]);

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
      const assessmentMatches = item.assessmentLinks.some(
        (link) =>
          link.assessmentName.toLowerCase().includes(term) ||
          link.controlId.toLowerCase().includes(term)
      );
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.controlIds.some((control) => control.toLowerCase().includes(term)) ||
        frameworkNames.includes(term) ||
        assessmentMatches;

      return matchesStatus && matchesSearch;
    });
  }, [evidence, statusFilter, search]);

  const handleFileSelection = useCallback((file: File | null) => {
    setFormState((prev) => ({
      ...prev,
      file
    }));
  }, []);

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      handleFileSelection(file);
    },
    [handleFileSelection]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0] ?? null;
      handleFileSelection(file);
    },
    [handleFileSelection]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const resetForm = useCallback(() => {
    setFormState(createDefaultFormState());
    setUploadProgress(0);
    setIsDragging(false);
  }, []);

  const handleUploadClose = useCallback(() => {
    if (uploadEvidence.isPending) {
      return;
    }
    resetForm();
    uploadModal.onClose();
  }, [resetForm, uploadEvidence.isPending, uploadModal]);

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
        assessmentControlIds: formState.assessmentControlIds,
        retentionPeriodDays: formState.retentionPeriodDays || undefined,
        retentionReason: formState.retentionReason || undefined,
        reviewDue: formState.reviewDue || undefined,
        reviewerId: formState.reviewerId || undefined,
        notes: formState.notes || undefined,
        tags: splitCsv(formState.tags),
        categories: splitCsv(formState.categories),
        nextAction: formState.nextAction || undefined,
        statusNote: 'Uploaded via console',
        source: formState.source || 'manual',
        onProgress: setUploadProgress
      });

      toast({ title: 'Evidence uploaded', status: 'success' });
      resetForm();
      uploadModal.onClose();
    } catch (error) {
      toast({
        title: 'Unable to upload evidence',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleStatusChange = async (record: EvidenceRecord, status: EvidenceStatus) => {
    if (record.status === status || updateStatus.isPending) {
      return;
    }

    try {
      await updateStatus.mutateAsync({ id: record.id, status });
      toast({
        title: `Status updated: ${statusMeta[status].label}`,
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleDeleteEvidence = async (record: EvidenceRecord) => {
    const confirmed = window.confirm(`Delete evidence "${record.name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteEvidence.mutateAsync(record.id);
      toast({ title: 'Evidence deleted', status: 'success' });
    } catch (error) {
      toast({
        title: 'Failed to delete evidence',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleDetachLink = async (record: EvidenceRecord, assessmentControlId: string) => {
    const remainingIds = record.assessmentLinks
      .filter((link) => link.assessmentControlId !== assessmentControlId)
      .map((link) => link.assessmentControlId);

    try {
      await updateLinks.mutateAsync({
        id: record.id,
        assessmentControlIds: remainingIds
      });
      toast({ title: 'Attachment removed', status: 'info' });
    } catch (error) {
      toast({
        title: 'Failed to update attachments',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const openAttachmentModal = (record: EvidenceRecord) => {
    const initialAssessmentId = record.assessmentLinks[0]?.assessmentId ?? '';
    const initialControls = initialAssessmentId
      ? record.assessmentLinks
          .filter((link) => link.assessmentId === initialAssessmentId)
          .map((link) => link.assessmentControlId)
      : [];

    setAttachmentDraft({
      evidence: record,
      assessmentId: initialAssessmentId,
      controlIds: initialControls
    });
    attachmentModal.onOpen();
  };

  const handleAttachmentAssessmentChange = (assessmentId: string) => {
    const existing = attachmentDraft.evidence?.assessmentLinks
      .filter((link) => link.assessmentId === assessmentId)
      .map((link) => link.assessmentControlId) ?? [];

    setAttachmentDraft((prev) => ({
      ...prev,
      assessmentId,
      controlIds: existing
    }));
  };

  const handleAttachmentSubmit = async () => {
    if (!attachmentDraft.evidence || !attachmentDraft.assessmentId) {
      toast({ title: 'Select an assessment to attach evidence', status: 'warning' });
      return;
    }

    const preservedIds = attachmentDraft.evidence.assessmentLinks
      .filter((link) => link.assessmentId !== attachmentDraft.assessmentId)
      .map((link) => link.assessmentControlId);

    const nextIds = Array.from(new Set([...preservedIds, ...attachmentDraft.controlIds]));

    try {
      await updateLinks.mutateAsync({
        id: attachmentDraft.evidence.id,
        assessmentControlIds: nextIds
      });
      toast({ title: 'Attachments updated', status: 'success' });
      setAttachmentDraft({
        evidence: null,
        assessmentId: '',
        controlIds: []
      });
      attachmentModal.onClose();
    } catch (error) {
      toast({
        title: 'Failed to update attachments',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleAttachmentClose = () => {
    if (updateLinks.isPending) {
      return;
    }
    setAttachmentDraft({
      evidence: null,
      assessmentId: '',
      controlIds: []
    });
    attachmentModal.onClose();
  };

  const openMetadataModal = (record: EvidenceRecord) => {
    const metadata = record.metadata ?? {};
    const tags = Array.isArray(metadata.tags) ? (metadata.tags as string[]).join(', ') : '';
    const categories = Array.isArray(metadata.categories)
      ? (metadata.categories as string[]).join(', ')
      : '';
    const notes = typeof metadata.notes === 'string' ? (metadata.notes as string) : '';
    const source = typeof metadata.source === 'string' ? (metadata.source as string) : '';

    setMetadataDraft({
      evidence: record,
      name: record.name,
      nextAction: record.nextAction ?? '',
      notes,
      tags,
      categories,
      source
    });
    metadataModal.onOpen();
  };

  const handleMetadataSubmit = async () => {
    if (!metadataDraft.evidence) {
      return;
    }

    try {
      await updateMetadata.mutateAsync({
        id: metadataDraft.evidence.id,
        payload: {
          name: metadataDraft.name.trim(),
          nextAction: metadataDraft.nextAction,
          notes: metadataDraft.notes,
          tags: splitCsv(metadataDraft.tags),
          categories: splitCsv(metadataDraft.categories),
          source: metadataDraft.source
        }
      });
      toast({ title: 'Metadata updated', status: 'success' });
      setMetadataDraft({
        evidence: null,
        name: '',
        nextAction: '',
        notes: '',
        tags: '',
        categories: '',
        source: ''
      });
      metadataModal.onClose();
    } catch (error) {
      toast({
        title: 'Failed to update metadata',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleMetadataClose = () => {
    if (updateMetadata.isPending) {
      return;
    }
    setMetadataDraft({
      evidence: null,
      name: '',
      nextAction: '',
      notes: '',
      tags: '',
      categories: '',
      source: ''
    });
    metadataModal.onClose();
  };

  const isEvidenceAccessible = useCallback(
    (record: EvidenceRecord) =>
      record.ingestionStatus !== 'QUARANTINED' &&
      record.status !== 'QUARANTINED' &&
      record.lastScanStatus !== EvidenceScanStatus.INFECTED,
    []
  );

  const openEvidenceUrl = useCallback((record: EvidenceRecord, action: 'preview' | 'download') => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = `/api/evidence/${record.id}/${action}`;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, []);

  const handlePreview = useCallback(
    (record: EvidenceRecord) => {
      if (!isEvidenceAccessible(record)) {
        toast({
          title: 'Preview unavailable',
          description:
            record.lastScanStatus === EvidenceScanStatus.INFECTED
              ? 'This file failed antivirus checks and cannot be opened.'
              : 'This evidence item is quarantined.',
          status: 'warning'
        });
        return;
      }

      openEvidenceUrl(record, 'preview');
    },
    [isEvidenceAccessible, openEvidenceUrl, toast]
  );

  const handleDownload = useCallback(
    (record: EvidenceRecord) => {
      if (!isEvidenceAccessible(record)) {
        toast({
          title: 'Download unavailable',
          description:
            record.lastScanStatus === EvidenceScanStatus.INFECTED
              ? 'This file failed antivirus checks and cannot be downloaded.'
              : 'This evidence item is quarantined.',
          status: 'warning'
        });
        return;
      }

      openEvidenceUrl(record, 'download');
    },
    [isEvidenceAccessible, openEvidenceUrl, toast]
  );

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
          onClick={uploadModal.onOpen}
          isLoading={uploadEvidence.isPending}
        >
          Upload Evidence
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Stat
          bg={cardBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={cardBorder}
          p={4}
        >
          <StatLabel>Total Items</StatLabel>
          <StatNumber>{stats.total}</StatNumber>
          <StatHelpText>Across all frameworks</StatHelpText>
        </Stat>
        <Stat
          bg={cardBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={cardBorder}
          p={4}
        >
          <StatLabel>Pending Review</StatLabel>
          <StatNumber>{stats.pending}</StatNumber>
          <StatHelpText>Awaiting assignment</StatHelpText>
        </Stat>
        <Stat
          bg={cardBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={cardBorder}
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
          placeholder="Search evidence, control, or assessment..."
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
          const isAccessible = isEvidenceAccessible(item);
          const accessBlockedReason =
            item.lastScanStatus === EvidenceScanStatus.INFECTED
              ? 'Blocked: failed antivirus scan.'
              : item.ingestionStatus === 'QUARANTINED' || item.status === 'QUARANTINED'
                ? 'Blocked: evidence is quarantined.'
                : '';
          return (
            <Box
              key={item.id}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={cardBorder}
              p={5}
              bg={cardBg}
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
                  <VStack align="flex-end" spacing={2}>
                    <Menu placement="bottom-end">
                      <MenuButton
                        as={IconButton}
                        aria-label="Manage evidence"
                        icon={<FiMoreVertical />}
                        size="sm"
                        variant="ghost"
                      />
                      <MenuList>
                        <MenuOptionGroup
                          title="Set status"
                          type="radio"
                          defaultValue={item.status}
                          onChange={(value) =>
                            handleStatusChange(item, value as EvidenceStatus)
                          }
                        >
                          {Object.entries(statusMeta).map(([status, statusInfo]) => (
                            <MenuItemOption key={status} value={status}>
                              {statusInfo.label}
                            </MenuItemOption>
                          ))}
                        </MenuOptionGroup>
                        <MenuDivider />
                        <MenuItem icon={<FiLink />} onClick={() => openAttachmentModal(item)}>
                          Attach to assessment
                        </MenuItem>
                        <MenuItem icon={<FiEdit />} onClick={() => openMetadataModal(item)}>
                          Edit metadata
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem
                          icon={<FiTrash2 />}
                          onClick={() => handleDeleteEvidence(item)}
                          color="red.500"
                        >
                          Delete evidence
                        </MenuItem>
                      </MenuList>
                    </Menu>
                    <Badge colorScheme={meta.color}>{meta.label}</Badge>
                  </VStack>
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  <Tag size="sm" colorScheme="blue">
                    {item.contentType.toUpperCase()} · {formatSize(item.fileSize)}
                  </Tag>
                  <Tag size="sm" colorScheme="purple">
                    Ingestion: {item.ingestionStatus}
                  </Tag>
                  {item.lastScanStatus && (
                    <Tag size="sm" colorScheme={scanStatusMeta[item.lastScanStatus].colorScheme}>
                      AV: {scanStatusMeta[item.lastScanStatus].label}
                    </Tag>
                  )}
                  {item.reviewDue && (
                    <Tag size="sm" colorScheme="teal">
                      Review by {new Date(item.reviewDue).toLocaleDateString()}
                    </Tag>
                  )}
                </HStack>
                <Box borderWidth="1px" borderColor={cardBorder} borderRadius="md" p={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xs" color="gray.500">
                      Antivirus scan history
                    </Text>
                    <HStack spacing={3} align="center" flexWrap="wrap">
                      <Text fontSize="sm">
                        Last scan:{' '}
                        <Text as="span" fontWeight="semibold">
                          {formatScanTimestamp(item.lastScanAt)}
                        </Text>
                      </Text>
                      {item.lastScanEngine && (
                        <Badge colorScheme="gray" fontSize="0.65rem">
                          Engine: {item.lastScanEngine}
                        </Badge>
                      )}
                      {typeof item.lastScanDurationMs === 'number' && (
                        <Badge colorScheme="gray" fontSize="0.65rem">
                          {item.lastScanDurationMs} ms
                        </Badge>
                      )}
                      {typeof item.lastScanBytes === 'number' && (
                        <Badge colorScheme="gray" fontSize="0.65rem">
                          {formatSize(item.lastScanBytes)}
                        </Badge>
                      )}
                    </HStack>
                    {item.lastScanSummary && (
                      <Text fontSize="sm" color="gray.600">
                        {item.lastScanSummary}
                      </Text>
                    )}
                    {!item.lastScanStatus && (
                      <Text fontSize="sm" color="gray.500">
                        Scan queued after upload – awaiting antivirus results.
                      </Text>
                    )}
                  </VStack>
                </Box>
                {item.statusHistory.length > 0 && (
                  <Box borderWidth="1px" borderColor={cardBorder} borderRadius="md" p={3}>
                    <VStack align="start" spacing={2} width="full">
                      <Text fontSize="xs" color="gray.500">
                        Status history
                      </Text>
                      <Stack spacing={3} width="100%">
                        {item.statusHistory.map((entry) => {
                          const fromMeta = entry.fromStatus ? getStatusBadgeMeta(entry.fromStatus) : null;
                          const toMeta = getStatusBadgeMeta(entry.toStatus);
                          const note =
                            entry.note?.trim() || `Status changed to ${toMeta.label}.`;
                          const actor =
                            entry.changedBy?.name ||
                            entry.changedBy?.email ||
                            'System automation';

                          return (
                            <Box key={entry.id}>
                              <HStack spacing={2} align="center" flexWrap="wrap">
                                {fromMeta && (
                                  <Badge colorScheme={fromMeta.color} fontSize="0.65rem">
                                    {fromMeta.label}
                                  </Badge>
                                )}
                                {fromMeta && <Icon as={FiArrowRight} boxSize={3} color="gray.400" />}
                                <Badge colorScheme={toMeta.color} fontSize="0.65rem">
                                  {toMeta.label}
                                </Badge>
                                <Text fontSize="xs" color="gray.500">
                                  {formatHistoryTimestamp(entry.changedAt)}
                                </Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.600" mt={1}>
                                {note}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {actor}
                              </Text>
                            </Box>
                          );
                        })}
                      </Stack>
                    </VStack>
                  </Box>
                )}
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
                {item.assessmentLinks.length > 0 && (
                  <Wrap spacing={2}>
                    {item.assessmentLinks.map((link) => (
                      <WrapItem key={link.assessmentControlId}>
                        <Tag size="sm" colorScheme="teal" borderRadius="full">
                          <TagLabel>
                            {link.assessmentName}: {link.controlId}
                          </TagLabel>
                          <Tooltip label="Remove attachment">
                            <TagRightIcon
                              as={FiX}
                              cursor="pointer"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDetachLink(item, link.assessmentControlId);
                              }}
                            />
                          </Tooltip>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
                {item.nextAction && (
                  <Box
                    bg={noteBg}
                    borderRadius="md"
                    p={3}
                    fontSize="sm"
                    color={noteText}
                  >
                    {item.nextAction}
                  </Box>
                )}
                {item.ingestionNotes && (
                  <Text fontSize="sm" color="gray.500">
                    Ingestion note: {item.ingestionNotes}
                  </Text>
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
                  <Button
                    leftIcon={<FiEye />}
                    onClick={() => handlePreview(item)}
                    isDisabled={!isAccessible}
                    title={!isAccessible ? accessBlockedReason : undefined}
                  >
                    Preview
                  </Button>
                  <Button
                    leftIcon={<FiDownload />}
                    onClick={() => handleDownload(item)}
                    isDisabled={!isAccessible}
                    title={!isAccessible ? accessBlockedReason : undefined}
                  >
                    Download
                  </Button>
                </ButtonGroup>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="brand"
                  leftIcon={<FiPlus />}
                  onClick={() => openAttachmentModal(item)}
                >
                  Manage links
                </Button>
              </HStack>
            </Box>
          );
        })}
      </SimpleGrid>

      <Modal isOpen={uploadModal.isOpen} onClose={handleUploadClose} size="lg">
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
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Access control attestation"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Evidence file</FormLabel>
                <Box
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderColor={isDragging ? dropActiveBorder : dropBorder}
                  borderRadius="md"
                  p={6}
                  textAlign="center"
                  cursor="pointer"
                  onClick={openFileDialog}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <VStack spacing={2}>
                    <Icon as={FiUpload} boxSize={6} color="brand.500" />
                    <Text fontSize="sm" color="gray.500">
                      {formState.file
                        ? formState.file.name
                        : 'Drag and drop a file, or click to browse'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Files upload via signed signed URLs and remain in secure storage.
                    </Text>
                  </VStack>
                </Box>
                <Input
                  ref={fileInputRef}
                  type="file"
                  display="none"
                  onChange={handleFileInputChange}
                />
                {uploadEvidence.isPending && <Progress value={uploadProgress} size="xs" mt={2} />}
              </FormControl>
              <FormControl>
                <FormLabel>Linked controls</FormLabel>
                <Input
                  value={formState.controlIds}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, controlIds: event.target.value }))
                  }
                  placeholder="ac-2, ac-17"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Frameworks</FormLabel>
                <CheckboxGroup
                  value={formState.frameworkIds}
                  onChange={(values) =>
                    setFormState((prev) => ({
                      ...prev,
                      frameworkIds: values as string[]
                    }))
                  }
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
                <FormLabel>Attach to assessment</FormLabel>
                <Select
                  placeholder="Optional"
                  value={formState.assessmentId}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      assessmentId: event.target.value,
                      assessmentControlIds: []
                    }))
                  }
                >
                  {assessments.map((assessment) => (
                    <option key={assessment.id} value={assessment.id}>
                      {assessment.name}
                    </option>
                  ))}
                </Select>
                <FormHelperText>
                  Automatically link this evidence to selected assessment controls.
                </FormHelperText>
              </FormControl>
              {formState.assessmentId && (
                <FormControl>
                  <FormLabel>Select controls</FormLabel>
                  {isUploadControlsLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <CheckboxGroup
                      value={formState.assessmentControlIds}
                      onChange={(values) =>
                        setFormState((prev) => ({
                          ...prev,
                          assessmentControlIds: values as string[]
                        }))
                      }
                    >
                      <Stack spacing={2} maxH="180px" overflowY="auto">
                        {uploadAssessmentControls.map((control) => (
                          <Checkbox key={control.id} value={control.id}>
                            {control.controlId} · {control.title}
                          </Checkbox>
                        ))}
                        {uploadAssessmentControls.length === 0 && (
                          <Text fontSize="xs" color="gray.500">
                            No controls available for this assessment.
                          </Text>
                        )}
                      </Stack>
                    </CheckboxGroup>
                  )}
                </FormControl>
              )}
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
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, retentionReason: event.target.value }))
                  }
                  placeholder="FedRAMP documentation retention"
                />
              </FormControl>
              <HStack spacing={4} align="flex-start" flexWrap="wrap">
                <FormControl>
                  <FormLabel>Review due</FormLabel>
                  <Input
                    type="date"
                    value={formState.reviewDue}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, reviewDue: event.target.value }))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Assign reviewer</FormLabel>
                  <Input
                    placeholder="Reviewer ID"
                    value={formState.reviewerId}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, reviewerId: event.target.value }))
                    }
                  />
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>Tags (comma separated)</FormLabel>
                <Input
                  value={formState.tags}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, tags: event.target.value }))
                  }
                  placeholder="access-control, quarterly"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Categories (comma separated)</FormLabel>
                <Input
                  value={formState.categories}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, categories: event.target.value }))
                  }
                  placeholder="policy, procedure"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Next action</FormLabel>
                <Input
                  value={formState.nextAction}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, nextAction: event.target.value }))
                  }
                  placeholder="Assign reviewer"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Source</FormLabel>
                <Input
                  value={formState.source}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, source: event.target.value }))
                  }
                  placeholder="manual"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formState.notes}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  placeholder="Provide context for reviewers"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleUploadClose} isDisabled={uploadEvidence.isPending}>
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

      <Modal isOpen={attachmentModal.isOpen} onClose={handleAttachmentClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage assessment attachments</ModalHeader>
          <ModalCloseButton disabled={updateLinks.isPending} />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Assessment</FormLabel>
                <Select
                  placeholder="Select assessment"
                  value={attachmentDraft.assessmentId}
                  onChange={(event) => handleAttachmentAssessmentChange(event.target.value)}
                >
                  {assessments.map((assessment) => (
                    <option key={assessment.id} value={assessment.id}>
                      {assessment.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {attachmentDraft.assessmentId && (
                <FormControl>
                  <FormLabel>Controls</FormLabel>
                  {isAttachmentControlsLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <CheckboxGroup
                      value={attachmentDraft.controlIds}
                      onChange={(values) =>
                        setAttachmentDraft((prev) => ({
                          ...prev,
                          controlIds: values as string[]
                        }))
                      }
                    >
                      <Stack spacing={2} maxH="220px" overflowY="auto">
                        {attachmentControls.map((control) => (
                          <Checkbox key={control.id} value={control.id}>
                            {control.controlId} · {control.title}
                          </Checkbox>
                        ))}
                        {attachmentControls.length === 0 && (
                          <Text fontSize="xs" color="gray.500">
                            No controls available for this assessment.
                          </Text>
                        )}
                      </Stack>
                    </CheckboxGroup>
                  )}
                </FormControl>
              )}
              <FormHelperText>
                Selecting controls replaces existing attachments for the chosen assessment.
              </FormHelperText>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleAttachmentClose} isDisabled={updateLinks.isPending}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleAttachmentSubmit}
                isLoading={updateLinks.isPending}
                isDisabled={!attachmentDraft.assessmentId}
              >
                Save attachments
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={metadataModal.isOpen} onClose={handleMetadataClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit evidence metadata</ModalHeader>
          <ModalCloseButton disabled={updateMetadata.isPending} />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={metadataDraft.name}
                  onChange={(event) =>
                    setMetadataDraft((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Next action</FormLabel>
                <Input
                  value={metadataDraft.nextAction}
                  onChange={(event) =>
                    setMetadataDraft((prev) => ({ ...prev, nextAction: event.target.value }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={metadataDraft.notes}
                  onChange={(event) =>
                    setMetadataDraft((prev) => ({ ...prev, notes: event.target.value }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Input
                  value={metadataDraft.tags}
                  onChange={(event) =>
                    setMetadataDraft((prev) => ({ ...prev, tags: event.target.value }))
                  }
                  placeholder="policy, quarterly"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Categories</FormLabel>
                <Input
                  value={metadataDraft.categories}
                  onChange={(event) =>
                    setMetadataDraft((prev) => ({ ...prev, categories: event.target.value }))
                  }
                  placeholder="procedure, evidence"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Source</FormLabel>
                <Input
                  value={metadataDraft.source}
                  onChange={(event) =>
                    setMetadataDraft((prev) => ({ ...prev, source: event.target.value }))
                  }
                  placeholder="manual"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleMetadataClose} isDisabled={updateMetadata.isPending}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleMetadataSubmit}
                isLoading={updateMetadata.isPending}
                isDisabled={!metadataDraft.evidence}
              >
                Save metadata
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default EvidencePage;
const scanStatusMeta: Record<
  EvidenceScanStatus,
  { label: string; colorScheme: string }
> = {
  PENDING: { label: 'Scan pending', colorScheme: 'gray' },
  RUNNING: { label: 'Scanning', colorScheme: 'yellow' },
  CLEAN: { label: 'Clean', colorScheme: 'green' },
  INFECTED: { label: 'Threat detected', colorScheme: 'red' },
  FAILED: { label: 'Scan failed', colorScheme: 'orange' }
};

const formatScanTimestamp = (value: string | null) => {
  if (!value) {
    return 'Not scanned yet';
  }
  return new Date(value).toLocaleString();
};

const formatHistoryTimestamp = (value: string) => {
  return new Date(value).toLocaleString();
};
