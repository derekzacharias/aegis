import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
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
  Radio,
  RadioGroup,
  Select,
  Spacer,
  Spinner,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import {
  FiDownload,
  FiEdit,
  FiFilePlus,
  FiFlag,
  FiPlus,
  FiShield,
  FiUsers
} from 'react-icons/fi';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  PolicySummary,
  PolicyVersionStatus,
  PolicyVersionView
} from '@compliance/shared';
import {
  useCreatePolicy,
  usePolicyDecision,
  usePolicyDetail,
  usePolicySummaries,
  useSubmitPolicyVersion,
  useUpdatePolicy,
  useUploadPolicyVersion
} from '../hooks/use-policies';
import { useFrameworks } from '../hooks/use-frameworks';
import { usePolicyActor } from '../policies/policy-actor-context';

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('MMM D, YYYY') : '—';

const statusColor: Record<PolicyVersionStatus, string> = {
  DRAFT: 'gray',
  IN_REVIEW: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
  ARCHIVED: 'purple'
};

const MAX_COMPARE = 2;

type NewPolicyFormState = {
  title: string;
  description: string;
  category: string;
  tags: string;
  reviewCadenceDays: string;
  ownerId: string;
  retentionPeriodDays: string;
  retentionReason: string;
  retentionExpiresAt: string;
};

type FrameworkMappingFormState = {
  frameworkId: string;
  controlFamilies: string;
  controlIds: string;
};

type NewVersionFormState = {
  label: string;
  notes: string;
  effectiveDate: string;
  supersedesVersionId: string;
  file: File | null;
  frameworkMappings: FrameworkMappingFormState[];
};

type SubmitVersionFormState = {
  approverIds: string[];
  message: string;
};

type EditPolicyFormState = {
  title: string;
  description: string;
  category: string;
  tags: string;
  reviewCadenceDays: string;
  ownerId: string;
  retentionPeriodDays: string;
  retentionReason: string;
  retentionExpiresAt: string;
};

type DecisionFormState = {
  decision: 'approve' | 'reject';
  comment: string;
  effectiveDate: string;
};

const normalizeTags = (tags: string) =>
  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const toIsoDate = (value: string) =>
  value ? new Date(`${value}T00:00:00Z`).toISOString() : undefined;

const PoliciesPage = () => {
  const toast = useToast();
  const accent = useColorModeValue('brand.500', 'brand.300');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { actor, setActor, participants, refreshParticipants } = usePolicyActor();
  const actorId = actor?.id;
  const { data: frameworks = [] } = useFrameworks();

  const {
    isOpen: isCreateOpen,
    onOpen: onOpenCreate,
    onClose: onCloseCreate
  } = useDisclosure();
  const {
    isOpen: isUploadOpen,
    onOpen: onOpenUpload,
    onClose: onCloseUpload
  } = useDisclosure();
  const {
    isOpen: isSubmitOpen,
    onOpen: onOpenSubmit,
    onClose: onCloseSubmit
  } = useDisclosure();
  const {
    isOpen: isDecisionOpen,
    onOpen: onOpenDecision,
    onClose: onCloseDecision
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onOpenEdit,
    onClose: onCloseEdit
  } = useDisclosure();
  const {
    isOpen: isCompareOpen,
    onOpen: onOpenCompare,
    onClose: onCloseCompare
  } = useDisclosure();

  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [selectedVersionForSubmit, setSelectedVersionForSubmit] = useState<PolicyVersionView | null>(null);
  const [selectedVersionForDecision, setSelectedVersionForDecision] = useState<PolicyVersionView | null>(null);

  const [newPolicyForm, setNewPolicyForm] = useState<NewPolicyFormState>({
    title: '',
    description: '',
    category: '',
    tags: '',
    reviewCadenceDays: '365',
    ownerId: '',
    retentionPeriodDays: '',
    retentionReason: '',
    retentionExpiresAt: ''
  });

  const [newVersionForm, setNewVersionForm] = useState<NewVersionFormState>({
    label: '',
    notes: '',
    effectiveDate: '',
    supersedesVersionId: '',
    file: null,
    frameworkMappings: []
  });

  const [submitVersionForm, setSubmitVersionForm] = useState<SubmitVersionFormState>({
    approverIds: [],
    message: ''
  });

  const [decisionForm, setDecisionForm] = useState<DecisionFormState>({
    decision: 'approve',
    comment: '',
    effectiveDate: ''
  });

  const [editPolicyForm, setEditPolicyForm] = useState<EditPolicyFormState | null>(null);

  const {
    data: policies,
    isLoading: isPoliciesLoading,
    isFetching: isPoliciesFetching
  } = usePolicySummaries(actorId);

  useEffect(() => {
    if (!selectedPolicyId && policies && policies.length > 0) {
      setSelectedPolicyId(policies[0].id);
    }
  }, [policies, selectedPolicyId]);

  useEffect(() => {
    setCompareSelection([]);
  }, [selectedPolicyId]);

  const {
    data: policyDetail,
    isFetching: isDetailFetching
  } = usePolicyDetail(selectedPolicyId ?? undefined, actorId);

  useEffect(() => {
    if (participants && !newPolicyForm.ownerId) {
      const defaultOwner = participants.authors[0];
      if (defaultOwner) {
        setNewPolicyForm((prev) => ({ ...prev, ownerId: defaultOwner.id }));
      }
    }
  }, [participants, newPolicyForm.ownerId]);

  const createPolicy = useCreatePolicy(actorId);
  const uploadVersion = useUploadPolicyVersion(actorId);
  const submitVersion = useSubmitPolicyVersion(actorId);
  const policyDecision = usePolicyDecision(actorId);
  const updatePolicy = useUpdatePolicy(actorId);

  const combinedActors = useMemo(() => {
    if (!participants) {
      return [];
    }
    const seen = new Set<string>();
    return [...participants.authors, ...participants.approvers].filter((user) => {
      if (seen.has(user.id)) {
        return false;
      }
      seen.add(user.id);
      return true;
    });
  }, [participants]);

  const approverOptions = participants?.approvers ?? [];

  const handleActorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value;
    const match = combinedActors.find((option) => option.id === nextId);
    if (match) {
      setActor(match);
      void refreshParticipants();
    }
  };

  const resetNewPolicyForm = () => {
    setNewPolicyForm({
      title: '',
      description: '',
      category: '',
      tags: '',
      reviewCadenceDays: '365',
      ownerId: participants?.authors[0]?.id ?? '',
      retentionPeriodDays: '',
      retentionReason: '',
      retentionExpiresAt: ''
    });
  };

  const handleCreatePolicy = async () => {
    if (!actorId) {
      toast({ title: 'Select an actor to create policies.', status: 'warning' });
      return;
    }

    if (!newPolicyForm.title.trim()) {
      toast({ title: 'Title is required.', status: 'warning' });
      return;
    }

    try {
      const reviewCadence = newPolicyForm.reviewCadenceDays
        ? Number(newPolicyForm.reviewCadenceDays)
        : undefined;

      if (reviewCadence !== undefined && Number.isNaN(reviewCadence)) {
        toast({ title: 'Review cadence must be a number.', status: 'warning' });
        return;
      }

      const retentionPeriod = newPolicyForm.retentionPeriodDays
        ? Number(newPolicyForm.retentionPeriodDays)
        : undefined;

      if (retentionPeriod !== undefined && Number.isNaN(retentionPeriod)) {
        toast({ title: 'Retention period must be a number.', status: 'warning' });
        return;
      }

      const payload = {
        title: newPolicyForm.title.trim(),
        description: newPolicyForm.description.trim() || undefined,
        category: newPolicyForm.category.trim() || undefined,
        tags: normalizeTags(newPolicyForm.tags),
        reviewCadenceDays: reviewCadence,
        ownerId: newPolicyForm.ownerId || undefined,
        retentionPeriodDays: retentionPeriod,
        retentionReason: newPolicyForm.retentionReason.trim() || undefined,
        retentionExpiresAt: newPolicyForm.retentionExpiresAt
          ? toIsoDate(newPolicyForm.retentionExpiresAt)
          : undefined
      };

      const created = await createPolicy.mutateAsync(payload);
      toast({ title: 'Policy created', status: 'success' });
      setSelectedPolicyId(created.id);
      resetNewPolicyForm();
      onCloseCreate();
    } catch (error) {
      toast({
        title: 'Unable to create policy',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const closeUploadModal = () => {
    onCloseUpload();
    setNewVersionForm({
      label: '',
      notes: '',
      effectiveDate: '',
      supersedesVersionId: '',
      file: null,
      frameworkMappings: []
    });
  };

  const handleUploadVersion = async () => {
    if (!selectedPolicyId || !newVersionForm.file) {
      toast({ title: 'Upload requires a document.', status: 'warning' });
      return;
    }

    try {
      const frameworksPayload =
        newVersionForm.frameworkMappings.length > 0
          ? newVersionForm.frameworkMappings.map((mapping) => ({
              frameworkId: mapping.frameworkId,
              controlFamilies: splitList(mapping.controlFamilies),
              controlIds: splitList(mapping.controlIds)
            }))
          : undefined;

      await uploadVersion.mutateAsync({
        policyId: selectedPolicyId,
        file: newVersionForm.file,
        payload: {
          label: newVersionForm.label.trim() || undefined,
          notes: newVersionForm.notes.trim() || undefined,
          effectiveAt: toIsoDate(newVersionForm.effectiveDate),
          supersedesVersionId: newVersionForm.supersedesVersionId || undefined,
          frameworks: frameworksPayload
        }
      });
      toast({ title: 'Version uploaded', status: 'success' });
      closeUploadModal();
    } catch (error) {
      toast({
        title: 'Unable to upload version',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleSubmitVersion = async () => {
    if (!selectedPolicyId || !selectedVersionForSubmit) {
      return;
    }

    if (submitVersionForm.approverIds.length === 0) {
      toast({ title: 'Select at least one approver.', status: 'warning' });
      return;
    }

    try {
      await submitVersion.mutateAsync({
        policyId: selectedPolicyId,
        versionId: selectedVersionForSubmit.id,
        payload: {
          approverIds: submitVersionForm.approverIds,
          message: submitVersionForm.message.trim() || undefined
        }
      });
      toast({ title: 'Version sent for approval', status: 'success' });
      setSubmitVersionForm({ approverIds: [], message: '' });
      setSelectedVersionForSubmit(null);
      onCloseSubmit();
    } catch (error) {
      toast({
        title: 'Unable to submit version',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleDecision = async () => {
    if (!selectedPolicyId || !selectedVersionForDecision) {
      return;
    }

    try {
      await policyDecision.mutateAsync({
        policyId: selectedPolicyId,
        versionId: selectedVersionForDecision.id,
        payload: {
          decision: decisionForm.decision,
          comment: decisionForm.comment.trim() || undefined,
          effectiveAt:
            decisionForm.decision === 'approve'
              ? toIsoDate(decisionForm.effectiveDate)
              : undefined
        }
      });
      toast({
        title:
          decisionForm.decision === 'approve'
            ? 'Version approved'
            : 'Version rejected',
        status: 'success'
      });
      setDecisionForm({ decision: 'approve', comment: '', effectiveDate: '' });
      setSelectedVersionForDecision(null);
      onCloseDecision();
    } catch (error) {
      toast({
        title: 'Unable to record decision',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const toggleFrameworkSelection = (frameworkId: string, isSelected: boolean) => {
    setNewVersionForm((prev) => {
      if (isSelected) {
        if (prev.frameworkMappings.some((mapping) => mapping.frameworkId === frameworkId)) {
          return prev;
        }
        return {
          ...prev,
          frameworkMappings: [
            ...prev.frameworkMappings,
            {
              frameworkId,
              controlFamilies: '',
              controlIds: ''
            }
          ]
        };
      }

      return {
        ...prev,
        frameworkMappings: prev.frameworkMappings.filter(
          (mapping) => mapping.frameworkId !== frameworkId
        )
      };
    });
  };

  const updateFrameworkMappingField = (
    frameworkId: string,
    field: 'controlFamilies' | 'controlIds',
    value: string
  ) => {
    setNewVersionForm((prev) => ({
      ...prev,
      frameworkMappings: prev.frameworkMappings.map((mapping) =>
        mapping.frameworkId === frameworkId ? { ...mapping, [field]: value } : mapping
      )
    }));
  };

  const handleOpenEditPolicy = () => {
    if (!policyDetail) {
      return;
    }

    setEditPolicyForm({
      title: policyDetail.title,
      description: policyDetail.description ?? '',
      category: policyDetail.category ?? '',
      tags: policyDetail.tags.join(', '),
      reviewCadenceDays: policyDetail.reviewCadenceDays?.toString() ?? '',
      ownerId: policyDetail.owner.id,
      retentionPeriodDays: policyDetail.retention.periodDays?.toString() ?? '',
      retentionReason: policyDetail.retention.reason ?? '',
      retentionExpiresAt: policyDetail.retention.expiresAt
        ? dayjs(policyDetail.retention.expiresAt).format('YYYY-MM-DD')
        : ''
    });
    onOpenEdit();
  };

  const handleUpdatePolicy = async () => {
    if (!selectedPolicyId || !editPolicyForm) {
      return;
    }

    if (!editPolicyForm.title.trim()) {
      toast({ title: 'Title is required.', status: 'warning' });
      return;
    }

    const reviewCadence = editPolicyForm.reviewCadenceDays
      ? Number(editPolicyForm.reviewCadenceDays)
      : undefined;

    if (reviewCadence !== undefined && Number.isNaN(reviewCadence)) {
      toast({ title: 'Review cadence must be a number.', status: 'warning' });
      return;
    }

    const retentionPeriod = editPolicyForm.retentionPeriodDays
      ? Number(editPolicyForm.retentionPeriodDays)
      : undefined;

    if (retentionPeriod !== undefined && Number.isNaN(retentionPeriod)) {
      toast({ title: 'Retention period must be a number.', status: 'warning' });
      return;
    }

    try {
      await updatePolicy.mutateAsync({
        id: selectedPolicyId,
        payload: {
          title: editPolicyForm.title.trim(),
          description: editPolicyForm.description.trim() || undefined,
          category: editPolicyForm.category.trim() || undefined,
          tags: normalizeTags(editPolicyForm.tags),
          reviewCadenceDays: reviewCadence,
          ownerId: editPolicyForm.ownerId || undefined,
          retentionPeriodDays: retentionPeriod,
          retentionReason: editPolicyForm.retentionReason.trim() || undefined,
          retentionExpiresAt: editPolicyForm.retentionExpiresAt
            ? toIsoDate(editPolicyForm.retentionExpiresAt)
            : undefined
        }
      });
      toast({ title: 'Policy updated', status: 'success' });
      closeEditModal();
    } catch (error) {
      toast({
        title: 'Unable to update policy',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const closeEditModal = () => {
    onCloseEdit();
    setEditPolicyForm(null);
  };

  const toggleCompare = (versionId: string) => {
    setCompareSelection((current) => {
      if (current.includes(versionId)) {
        return current.filter((id) => id !== versionId);
      }
      if (current.length >= MAX_COMPARE) {
        return [current[1], versionId];
      }
      return [...current, versionId];
    });
  };

  const selectedForCompare = useMemo(() => {
    if (!policyDetail) {
      return [];
    }
    return policyDetail.versions.filter((version) =>
      compareSelection.includes(version.id)
    );
  }, [policyDetail, compareSelection]);

  const canDownload = Boolean(actor?.id && selectedPolicyId);

  const handleDownload = (version: PolicyVersionView) => {
    if (!selectedPolicyId || !actor?.id) {
      toast({ title: 'Select an actor to download documents.', status: 'info' });
      return;
    }

    const link = `/api/policies/${selectedPolicyId}/versions/${version.id}/download?actorId=${encodeURIComponent(actor.id)}`;
    window.open(link, '_blank', 'noopener');
  };

  const renderPolicyCard = (policy: PolicySummary) => {
    const isActive = policy.id === selectedPolicyId;
    return (
      <Box
        key={policy.id}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={isActive ? accent : borderColor}
        bg={cardBg}
        p={4}
        cursor="pointer"
        onClick={() => setSelectedPolicyId(policy.id)}
        transition="all 0.2s"
        boxShadow={isActive ? 'lg' : 'sm'}
      >
        <HStack justify="space-between" mb={2}>
          <Heading size="sm">{policy.title}</Heading>
          {policy.currentVersion ? (
            <Badge colorScheme={statusColor[policy.currentVersion.status]}>
              v{policy.currentVersion.versionNumber} · {policy.currentVersion.status.replace('_', ' ')}
            </Badge>
          ) : (
            <Badge colorScheme="gray">No versions</Badge>
          )}
        </HStack>
        <Text fontSize="sm" color="gray.500">
          Owner: {policy.owner.name}
        </Text>
        <HStack spacing={2} mt={3} flexWrap="wrap">
          {policy.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} colorScheme="cyan" variant="subtle">
              {tag}
            </Badge>
          ))}
          {policy.tags.length > 3 && (
            <Badge variant="outline">+{policy.tags.length - 3}</Badge>
          )}
        </HStack>
        <HStack mt={4} justify="space-between">
          <Text fontSize="xs" color="gray.500">
            Updated {formatDate(policy.lastUpdated)}
          </Text>
          {policy.pendingReviewCount > 0 && (
            <Badge colorScheme="orange">
              {policy.pendingReviewCount} pending approvals
            </Badge>
          )}
        </HStack>
      </Box>
    );
  };

  const renderTimeline = (version: PolicyVersionView) => {
    const entries = [
      {
        label: 'Drafted',
        value: formatDate(version.createdAt),
        actor: version.createdBy.name
      },
      version.submittedAt && {
        label: 'Submitted',
        value: formatDate(version.submittedAt),
        actor: version.submittedBy?.name ?? '—'
      },
      version.approvedAt && {
        label: 'Approved',
        value: formatDate(version.approvedAt),
        actor: version.approvedBy?.name ?? '—'
      },
      version.effectiveAt && {
        label: 'Effective',
        value: formatDate(version.effectiveAt),
        actor: version.approvedBy?.name ?? '—'
      }
    ].filter(Boolean) as Array<{ label: string; value: string; actor: string }>;

    return (
      <Stack spacing={2} fontSize="sm">
        {entries.map((entry) => (
          <HStack key={entry.label} spacing={3} align="flex-start">
            <Box w={24} color="gray.500">
              {entry.label}
            </Box>
            <Text fontWeight="medium">{entry.value}</Text>
            <Text color="gray.500">{entry.actor}</Text>
          </HStack>
        ))}
      </Stack>
    );
  };

  const renderApprovals = (version: PolicyVersionView) => (
    <Stack spacing={3} mt={3} fontSize="sm">
      {version.approvals.length === 0 ? (
        <Text color="gray.500">No approvers assigned.</Text>
      ) : (
        version.approvals.map((approval) => (
          <Flex key={approval.id} align="center" gap={3}>
            <Badge colorScheme={statusColor[approval.status]}>{approval.status}</Badge>
            <Text flex="1">{approval.approver.name}</Text>
            <Text color="gray.500">{formatDate(approval.decidedAt)}</Text>
          </Flex>
        ))
      )}
    </Stack>
  );

  const isActorApproverForVersion = (version: PolicyVersionView) =>
    !!actor && version.approvals.some((approval) => approval.approver.id === actor.id && approval.status === 'PENDING');

  const compareReady = selectedForCompare.length === MAX_COMPARE;

  return (
    <Stack spacing={6} align="stretch">
      <Flex align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Heading size="lg">Policy & Procedure Management</Heading>
        <Spacer />
        <HStack spacing={3} align="center">
          <FormControl maxW="260px">
            <FormLabel fontSize="xs" textTransform="uppercase" color="gray.500" mb={1}>
              Acting as
            </FormLabel>
            <HStack spacing={2}>
              <Icon as={FiUsers} color="gray.500" />
              <Select
                placeholder="Select actor"
                size="sm"
                value={actor?.id ?? ''}
                onChange={handleActorChange}
              >
                {combinedActors.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.role})
                  </option>
                ))}
              </Select>
            </HStack>
          </FormControl>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="brand"
            onClick={onOpenCreate}
            isDisabled={!actorId}
          >
            New Policy
          </Button>
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: '1fr', xl: '360px 1fr' }} gap={6} alignItems="flex-start">
        <GridItem>
          <Stack spacing={4}>
            <Heading size="sm">Policies</Heading>
            {isPoliciesLoading || isPoliciesFetching ? (
              <Flex justify="center" py={10}>
                <Spinner />
              </Flex>
            ) : policies && policies.length > 0 ? (
              <Stack spacing={3}>
                {policies.map(renderPolicyCard)}
              </Stack>
            ) : (
              <Box borderWidth="1px" borderRadius="lg" p={6} textAlign="center">
                <Icon as={FiShield} boxSize={10} color="gray.400" mb={3} />
                <Heading size="sm" mb={2}>
                  No policies yet
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Create your first policy to start managing versions and approvals.
                </Text>
              </Box>
            )}
          </Stack>
        </GridItem>

        <GridItem>
          {selectedPolicyId && policyDetail ? (
            <Stack spacing={5}>
              <Box borderWidth="1px" borderRadius="lg" p={6} bg={cardBg} borderColor={borderColor}>
                <Flex align="flex-start" justify="space-between" mb={4} gap={4}>
                  <Box>
                    <Heading size="md" mb={1}>
                      {policyDetail.title}
                    </Heading>
                    <Text color="gray.500">Owner: {policyDetail.owner.name}</Text>
                    {policyDetail.description && (
                      <Text mt={3} fontSize="sm">
                        {policyDetail.description}
                      </Text>
                    )}
                    <HStack spacing={2} mt={3} flexWrap="wrap">
                      {policyDetail.tags.map((tag) => (
                        <Badge key={tag} variant="subtle" colorScheme="teal">
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                  <Stack spacing={3} minW="220px" align="flex-end">
                    <ButtonGroup size="sm" variant="outline">
                      <Button leftIcon={<Icon as={FiFilePlus} />} onClick={onOpenUpload} isDisabled={!actorId}>
                        Upload version
                      </Button>
                      <Button
                        leftIcon={<Icon as={FiFlag} />}
                        onClick={() => {
                          const draftVersion = policyDetail.versions.find((version) => version.status === 'DRAFT');
                          if (!draftVersion) {
                            toast({ title: 'No draft versions to submit.', status: 'info' });
                            return;
                          }
                          setSelectedVersionForSubmit(draftVersion);
                          onOpenSubmit();
                        }}
                        isDisabled={!actorId}
                      >
                        Submit draft
                      </Button>
                    </ButtonGroup>
                    <Text fontSize="sm" color="gray.500">
                      Review cadence: {policyDetail.reviewCadenceDays ? `${policyDetail.reviewCadenceDays} days` : '—'}
                    </Text>
                  </Stack>
                </Flex>

                <Divider my={4} />

                <Stack spacing={4}>
                  <Flex justify="space-between" align="center">
                    <Heading size="sm">Version history</Heading>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="brand"
                      onClick={onOpenCompare}
                      isDisabled={!compareReady}
                    >
                      Compare selected
                    </Button>
                  </Flex>

                  <Stack spacing={4}>
                    {policyDetail.versions.map((version) => (
                      <Box
                        key={version.id}
                        borderWidth="1px"
                        borderRadius="md"
                        p={4}
                        borderColor={borderColor}
                      >
                        <Flex direction={{ base: 'column', md: 'row' }} gap={4} justify="space-between">
                          <Stack spacing={2} flex="1">
                            <HStack spacing={3} align="center">
                              <Checkbox
                                isChecked={compareSelection.includes(version.id)}
                                onChange={() => toggleCompare(version.id)}
                                colorScheme="brand"
                              />
                              <Heading size="sm">
                                Version {version.versionNumber}
                              </Heading>
                              <Badge colorScheme={statusColor[version.status]}>
                                {version.status.replace('_', ' ')}
                              </Badge>
                              {version.isCurrent && <Badge colorScheme="green">Current</Badge>}
                            </HStack>
                            {version.label && (
                              <Text fontSize="sm" fontWeight="medium">
                                {version.label}
                              </Text>
                            )}
                            {version.notes && (
                              <Text fontSize="sm" color="gray.600">
                                {version.notes}
                              </Text>
                            )}
                            {renderTimeline(version)}
                          </Stack>
                          <Stack spacing={3} minW={{ base: 'auto', md: '220px' }}>
                            <ButtonGroup size="sm" variant="outline">
                              <Button
                                leftIcon={<Icon as={FiDownload} />}
                                onClick={() => handleDownload(version)}
                                isDisabled={!canDownload}
                              >
                                Download
                              </Button>
                              {version.status === 'DRAFT' && (
                                <Button
                                  onClick={() => {
                                    setSelectedVersionForSubmit(version);
                                    setSubmitVersionForm({ approverIds: [], message: '' });
                                    onOpenSubmit();
                                  }}
                                >
                                  Submit
                                </Button>
                              )}
                              {version.status === 'IN_REVIEW' && isActorApproverForVersion(version) && (
                                <Button
                                  colorScheme="green"
                                  onClick={() => {
                                    setSelectedVersionForDecision(version);
                                    onOpenDecision();
                                  }}
                                >
                                  Record decision
                                </Button>
                              )}
                            </ButtonGroup>
                            {renderApprovals(version)}
                          </Stack>
                        </Flex>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          ) : isDetailFetching ? (
            <Flex justify="center" align="center" py={12}>
              <Spinner />
            </Flex>
          ) : (
            <Box borderWidth="1px" borderRadius="lg" p={6} textAlign="center">
              <Heading size="sm">Select a policy to view its versions</Heading>
            </Box>
          )}
        </GridItem>
      </Grid>

      {/* Create policy modal */}
      <Modal isOpen={isCreateOpen} onClose={() => { onCloseCreate(); resetNewPolicyForm(); }} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new policy</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={newPolicyForm.title}
                  onChange={(event) => setNewPolicyForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={newPolicyForm.description}
                  onChange={(event) => setNewPolicyForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={3}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Input
                  value={newPolicyForm.category}
                  onChange={(event) => setNewPolicyForm((prev) => ({ ...prev, category: event.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Input
                  placeholder="Comma separated"
                  value={newPolicyForm.tags}
                  onChange={(event) => setNewPolicyForm((prev) => ({ ...prev, tags: event.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Review cadence (days)</FormLabel>
                <Input
                  type="number"
                  min={30}
                  value={newPolicyForm.reviewCadenceDays}
                  onChange={(event) => setNewPolicyForm((prev) => ({ ...prev, reviewCadenceDays: event.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Retention period (days)</FormLabel>
                <Input
                  type="number"
                  min={30}
                  placeholder="Optional"
                  value={newPolicyForm.retentionPeriodDays}
                  onChange={(event) =>
                    setNewPolicyForm((prev) => ({ ...prev, retentionPeriodDays: event.target.value }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Retention reason</FormLabel>
                <Textarea
                  rows={2}
                  placeholder="Why is this retention period enforced?"
                  value={newPolicyForm.retentionReason}
                  onChange={(event) =>
                    setNewPolicyForm((prev) => ({ ...prev, retentionReason: event.target.value }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Retention expiration</FormLabel>
                <Input
                  type="date"
                  value={newPolicyForm.retentionExpiresAt}
                  onChange={(event) =>
                    setNewPolicyForm((prev) => ({ ...prev, retentionExpiresAt: event.target.value }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Owner</FormLabel>
                <Select
                  value={newPolicyForm.ownerId}
                  onChange={(event) => setNewPolicyForm((prev) => ({ ...prev, ownerId: event.target.value }))}
                >
                  {participants?.authors.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { onCloseCreate(); resetNewPolicyForm(); }}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleCreatePolicy} isLoading={createPolicy.isPending}>
              Create policy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upload version modal */}
      <Modal isOpen={isUploadOpen} onClose={closeUploadModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload new version</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Document file</FormLabel>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.html,.png,.jpg,.jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setNewVersionForm((prev) => ({ ...prev, file }));
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Label</FormLabel>
                <Input
                  value={newVersionForm.label}
                  onChange={(event) => setNewVersionForm((prev) => ({ ...prev, label: event.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Effective date</FormLabel>
                <Input
                  type="date"
                  value={newVersionForm.effectiveDate}
                  onChange={(event) => setNewVersionForm((prev) => ({ ...prev, effectiveDate: event.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Supersedes</FormLabel>
                <Select
                  placeholder="Auto select current version"
                  value={newVersionForm.supersedesVersionId}
                  onChange={(event) => setNewVersionForm((prev) => ({ ...prev, supersedesVersionId: event.target.value }))}
                >
                  {policyDetail?.versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      Version {version.versionNumber} {version.label ? `- ${version.label}` : ''}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Release notes</FormLabel>
                <Textarea
                  rows={3}
                  value={newVersionForm.notes}
                  onChange={(event) => setNewVersionForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Framework mappings</FormLabel>
                {frameworks.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No frameworks available. Map policies after you create frameworks for this organization.
                  </Text>
                ) : (
                  <Stack spacing={3} maxH="260px" overflowY="auto">
                    {frameworks.map((framework) => {
                      const frameworkName =
                        (framework as { name?: string; title?: string; slug?: string }).name ??
                        (framework as { name?: string; title?: string; slug?: string }).title ??
                        (framework as { name?: string; title?: string; slug?: string }).slug ??
                        'Framework';
                      const mapping = newVersionForm.frameworkMappings.find(
                        (item) => item.frameworkId === framework.id
                      );
                      const isSelected = Boolean(mapping);

                      return (
                        <Box key={framework.id} borderWidth="1px" borderRadius="md" p={3} borderColor={borderColor}>
                          <Checkbox
                            isChecked={isSelected}
                            onChange={(event) =>
                              toggleFrameworkSelection(framework.id, event.target.checked)
                            }
                            colorScheme="brand"
                          >
                            {frameworkName}
                          </Checkbox>
                          {isSelected && mapping && (
                            <Stack spacing={2} mt={3} pl={6}>
                              <FormControl>
                                <FormLabel fontSize="xs">Control families</FormLabel>
                                <Input
                                  placeholder="Comma-separated families (e.g. AC, AT)"
                                  value={mapping.controlFamilies}
                                  onChange={(event) =>
                                    updateFrameworkMappingField(
                                      framework.id,
                                      'controlFamilies',
                                      event.target.value
                                    )
                                  }
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="xs">Control IDs</FormLabel>
                                <Input
                                  placeholder="Comma-separated control IDs"
                                  value={mapping.controlIds}
                                  onChange={(event) =>
                                    updateFrameworkMappingField(
                                      framework.id,
                                      'controlIds',
                                      event.target.value
                                    )
                                  }
                                />
                              </FormControl>
                            </Stack>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeUploadModal}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleUploadVersion}
              isLoading={uploadVersion.isPending}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit policy modal */}
      <Modal isOpen={isEditOpen} onClose={closeEditModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit policy</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editPolicyForm ? (
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={editPolicyForm.title}
                    onChange={(event) =>
                      setEditPolicyForm((prev) =>
                        prev ? { ...prev, title: event.target.value } : prev
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    rows={3}
                    value={editPolicyForm.description}
                    onChange={(event) =>
                      setEditPolicyForm((prev) =>
                        prev ? { ...prev, description: event.target.value } : prev
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Input
                    value={editPolicyForm.category}
                    onChange={(event) =>
                      setEditPolicyForm((prev) =>
                        prev ? { ...prev, category: event.target.value } : prev
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Tags</FormLabel>
                  <Input
                    placeholder="Comma separated"
                    value={editPolicyForm.tags}
                    onChange={(event) =>
                      setEditPolicyForm((prev) =>
                        prev ? { ...prev, tags: event.target.value } : prev
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Review cadence (days)</FormLabel>
                  <Input
                    type="number"
                    min={30}
                    value={editPolicyForm.reviewCadenceDays}
                    onChange={(event) =>
                      setEditPolicyForm((prev) =>
                        prev ? { ...prev, reviewCadenceDays: event.target.value } : prev
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Retention period (days)</FormLabel>
                  <Input
                    type="number"
                    min={30}
                    placeholder="Optional"
                    value={editPolicyForm.retentionPeriodDays}
                    onChange={(event) =>
                      setEditPolicyForm((prev) =>
                        prev ? { ...prev, retentionPeriodDays: event.target.value } : prev
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Retention reason</FormLabel>
                  <Textarea
                    rows={2}
                    placeholder="Why is this retention period enforced?"
                    value={editPolicyForm.retentionReason}
                    onChange={(event) =>
                      setEditPolicyForm((prev) =>
                        prev ? { ...prev, retentionReason: event.target.value } : prev
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Retention expiration</FormLabel>
                  <Input
                    type="date"
                    value={editPolicyForm.retentionExpiresAt}
                    onChange={(event) =>
                      setEditPolicyForm((prev) =>
                        prev ? { ...prev, retentionExpiresAt: event.target.value } : prev
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Owner</FormLabel>
                  <Select
                    value={editPolicyForm.ownerId}
                    onChange={(event) =>
                      setEditPolicyForm((prev) =>
                        prev ? { ...prev, ownerId: event.target.value } : prev
                      )
                    }
                  >
                    {participants?.authors.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            ) : (
              <Flex justify="center" py={6}>
                <Spinner />
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeEditModal}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleUpdatePolicy}
              isLoading={updatePolicy.isPending}
              isDisabled={!editPolicyForm}
            >
              Save changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Submit version modal */}
      <Modal isOpen={isSubmitOpen} onClose={() => { onCloseSubmit(); setSelectedVersionForSubmit(null); }} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit for approval</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Text fontSize="sm" color="gray.500">
                Select approvers to review version {selectedVersionForSubmit?.versionNumber}.
              </Text>
              <FormControl isRequired>
                <FormLabel>Approvers</FormLabel>
                <CheckboxGroup
                  value={submitVersionForm.approverIds}
                  onChange={(value) => setSubmitVersionForm((prev) => ({ ...prev, approverIds: value as string[] }))}
                >
                  <Stack spacing={2}>
                    {approverOptions.map((approver) => (
                      <Checkbox key={approver.id} value={approver.id}>
                        {approver.name} ({approver.role})
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Message</FormLabel>
                <Textarea
                  rows={3}
                  value={submitVersionForm.message}
                  onChange={(event) => setSubmitVersionForm((prev) => ({ ...prev, message: event.target.value }))}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { onCloseSubmit(); setSelectedVersionForSubmit(null); }}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSubmitVersion}
              isLoading={submitVersion.isPending}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Decision modal */}
      <Modal isOpen={isDecisionOpen} onClose={() => { onCloseDecision(); setSelectedVersionForDecision(null); }} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Record decision</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl as="fieldset">
                <FormLabel as="legend">Decision</FormLabel>
                <RadioGroup
                  value={decisionForm.decision}
                  onChange={(value) => setDecisionForm((prev) => ({ ...prev, decision: value as 'approve' | 'reject' }))}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="approve" colorScheme="green">
                      Approve
                    </Radio>
                    <Radio value="reject" colorScheme="red">
                      Reject
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
              {decisionForm.decision === 'approve' && (
                <FormControl>
                  <FormLabel>Effective date</FormLabel>
                  <Input
                    type="date"
                    value={decisionForm.effectiveDate}
                    onChange={(event) => setDecisionForm((prev) => ({ ...prev, effectiveDate: event.target.value }))}
                  />
                </FormControl>
              )}
              <FormControl>
                <FormLabel>Comment</FormLabel>
                <Textarea
                  rows={3}
                  value={decisionForm.comment}
                  onChange={(event) => setDecisionForm((prev) => ({ ...prev, comment: event.target.value }))}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { onCloseDecision(); setSelectedVersionForDecision(null); }}>
              Cancel
            </Button>
            <Button
              colorScheme={decisionForm.decision === 'approve' ? 'green' : 'red'}
              onClick={handleDecision}
              isLoading={policyDecision.isPending}
            >
              {decisionForm.decision === 'approve' ? 'Approve version' : 'Reject version'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Compare modal */}
      <Modal isOpen={isCompareOpen} onClose={onCloseCompare} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Compare versions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
              {selectedForCompare.map((version) => (
                <Box key={version.id} borderWidth="1px" borderRadius="md" p={4}>
                  <HStack justify="space-between" mb={3}>
                    <Heading size="sm">Version {version.versionNumber}</Heading>
                    <Badge colorScheme={statusColor[version.status]}>{version.status}</Badge>
                  </HStack>
                  <Stack spacing={3} fontSize="sm">
                    <Box>
                      <Text fontWeight="medium">Label</Text>
                      <Text>{version.label ?? '—'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium">Created</Text>
                      <Text>{formatDate(version.createdAt)} by {version.createdBy.name}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium">Submitted</Text>
                      <Text>
                        {formatDate(version.submittedAt)} by {version.submittedBy?.name ?? '—'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium">Approved</Text>
                      <Text>
                        {formatDate(version.approvedAt)} by {version.approvedBy?.name ?? '—'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium">Effective</Text>
                      <Text>{formatDate(version.effectiveAt)}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium">Notes</Text>
                      <Text whiteSpace="pre-wrap">{version.notes ?? '—'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium">Approvals</Text>
                      <Stack spacing={2} mt={1}>
                        {version.approvals.map((approval) => (
                          <HStack key={approval.id} spacing={3}>
                            <Badge colorScheme={statusColor[approval.status]}>{approval.status}</Badge>
                            <Text>{approval.approver.name}</Text>
                            <Text color="gray.500">{formatDate(approval.decidedAt)}</Text>
                          </HStack>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onCloseCompare}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export default PoliciesPage;
