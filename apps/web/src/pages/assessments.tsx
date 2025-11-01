import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  MenuDivider,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Tag,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  Select,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { FiArrowRight, FiEdit2, FiMoreVertical, FiPlus, FiTrash2 } from 'react-icons/fi';
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessmentStatus,
  useAssessmentDetail,
  useUpdateAssessment,
  useUpdateAssessmentControl,
  useCreateAssessmentTask,
  useUpdateAssessmentTask,
  useDeleteAssessmentTask
} from '../hooks/use-assessments';
import { useAssessmentEvidenceReuse } from '../hooks/use-assessment-evidence-reuse';
import type { EvidenceReuseRecommendation } from '../hooks/use-assessment-evidence-reuse';
import type {
  AssessmentControl,
  AssessmentControlStatus,
  AssessmentSummary,
  AssessmentTask,
  AssessmentTaskPriority,
  AssessmentTaskStatus,
  CreateAssessmentTaskInput
} from '../hooks/use-assessments';
import { useFrameworks } from '../hooks/use-frameworks';

const statusColors: Record<string, string> = {
  draft: 'gray',
  'in-progress': 'yellow',
  complete: 'green'
};

const statusOptions: Array<'draft' | 'in-progress' | 'complete'> = [
  'draft',
  'in-progress',
  'complete'
];

const controlStatusOptions: Array<{ label: string; value: AssessmentControlStatus }> = [
  { value: 'unassessed', label: 'Unassessed' },
  { value: 'satisfied', label: 'Satisfied' },
  { value: 'partial', label: 'Partial' },
  { value: 'unsatisfied', label: 'Unsatisfied' },
  { value: 'not-applicable', label: 'Not applicable' }
];

const taskStatusOptions: Array<{ label: string; value: AssessmentTaskStatus }> = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'complete', label: 'Complete' }
];

const taskPriorityOptions: Array<{ label: string; value: AssessmentTaskPriority }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const taskStatusColor: Record<AssessmentTaskStatus, string> = {
  open: 'yellow',
  'in-progress': 'blue',
  blocked: 'orange',
  complete: 'green'
};

const taskPriorityColor: Record<AssessmentTaskPriority, string> = {
  low: 'gray',
  medium: 'blue',
  high: 'purple',
  critical: 'red'
};

type TaskFormState = {
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  status: AssessmentTaskStatus;
  priority: AssessmentTaskPriority;
  assessmentControlId: string;
};

const createInitialTaskForm = (): TaskFormState => ({
  title: '',
  description: '',
  owner: '',
  dueDate: '',
  status: 'open',
  priority: 'medium',
  assessmentControlId: ''
});

const AssessmentsPage = () => {
  const toast = useToast();
  const createModal = useDisclosure();
  const evidenceModal = useDisclosure();
  const workspaceModal = useDisclosure();
  const { data: assessments } = useAssessments();
  const { data: frameworks } = useFrameworks();
  const createAssessment = useCreateAssessment();
  const updateStatus = useUpdateAssessmentStatus();
  const updateAssessment = useUpdateAssessment();
  const updateControl = useUpdateAssessmentControl();
  const createTask = useCreateAssessmentTask();
  const updateTask = useUpdateAssessmentTask();
  const deleteTask = useDeleteAssessmentTask();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'in-progress' | 'complete'>('all');
  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState<{
    name: string;
    owner: string;
    frameworkIds: string[];
  }>({
    name: '',
    owner: '',
    frameworkIds: []
  });
  const [editingAssessment, setEditingAssessment] = useState<AssessmentSummary | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentSummary | null>(null);
  const [workspaceAssessmentId, setWorkspaceAssessmentId] = useState<string | null>(null);
  const [pendingControlId, setPendingControlId] = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<TaskFormState>(() => createInitialTaskForm());

  const {
    data: evidenceReuse,
    isLoading: isEvidenceLoading,
    isError: isEvidenceError,
    error: evidenceError
  } = useAssessmentEvidenceReuse(selectedAssessment?.id, evidenceModal.isOpen);

  const {
    data: activeAssessment,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching
  } = useAssessmentDetail(workspaceAssessmentId ?? undefined);

  const cardBorderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBackground = useColorModeValue('white', 'gray.800');
  const suggestionBorderColor = useColorModeValue('gray.200', 'gray.700');
  const evidenceSuggestions: EvidenceReuseRecommendation[] = Array.isArray(evidenceReuse)
    ? (evidenceReuse as EvidenceReuseRecommendation[])
    : [];

  const resolveFramework = (id: string) => frameworks?.find((fw) => fw.id === id)?.name ?? id;

  const frameworkOptions = useMemo(
    () =>
      frameworks?.map((framework) => ({
        id: framework.id,
        label: `${framework.name} · ${framework.version}`
      })) ?? [],
    [frameworks]
  );

  const filteredAssessments = useMemo(() => {
    if (!assessments) {
      return [];
    }

    const term = search.trim().toLowerCase();
    return assessments.filter((assessment) => {
      const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
      const matchesSearch =
        !term ||
        assessment.name.toLowerCase().includes(term) ||
        assessment.owner.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [assessments, search, statusFilter]);

  const renderProgress = (progress: AssessmentSummary['progress']) => {
    const total = progress.total || 1;
    const satisfiedWidth = (progress.satisfied / total) * 100;
    const partialWidth = (progress.partial / total) * 100;
    const unsatisfiedWidth = (progress.unsatisfied / total) * 100;

    return (
      <VStack align="stretch" spacing={2} mt={2} fontSize="xs" color="gray.400">
        <HStack justify="space-between">
          <Text>
            {progress.satisfied} / {progress.total} controls satisfied
          </Text>
          <Text>{Math.round((progress.satisfied / total) * 100)}%</Text>
        </HStack>
        <HStack spacing={0} borderRadius="full" overflow="hidden" h={2} bg="gray.700">
          <Box w={`${satisfiedWidth}%`} h="100%" bg="green.400" />
          <Box w={`${partialWidth}%`} h="100%" bg="yellow.400" />
          <Box w={`${unsatisfiedWidth}%`} h="100%" bg="red.400" />
        </HStack>
        <HStack spacing={4} color="gray.500">
          <HStack spacing={1}>
            <Box w={2} h={2} borderRadius="full" bg="green.400" />
            <Text>Satisfied</Text>
          </HStack>
          <HStack spacing={1}>
            <Box w={2} h={2} borderRadius="full" bg="yellow.400" />
            <Text>Partial</Text>
          </HStack>
          <HStack spacing={1}>
            <Box w={2} h={2} borderRadius="full" bg="red.400" />
            <Text>Gap</Text>
          </HStack>
        </HStack>
      </VStack>
    );
  };

  const isEditMode = formMode === 'edit';
  const assessmentModalTitle = isEditMode ? 'Edit Assessment' : 'Launch New Assessment';
  const workspaceLoading = isDetailLoading || isDetailFetching || !activeAssessment;

  const resetForm = () => {
    setFormState({
      name: '',
      owner: '',
      frameworkIds: []
    });
    setEditingAssessment(null);
  };

  const handleCloseModal = () => {
    resetForm();
    setFormMode('create');
    createModal.onClose();
  };

  const handleEvidenceModalOpen = (assessment: AssessmentSummary) => {
    setSelectedAssessment(assessment);
    evidenceModal.onOpen();
  };

  const handleEvidenceModalClose = () => {
    evidenceModal.onClose();
    setSelectedAssessment(null);
  };

  const handleSubmitAssessment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formState.name.trim();

    if (!trimmedName) {
      toast({
        title: 'Assessment name required',
        status: 'warning'
      });
      return;
    }

    if (!formState.frameworkIds.length) {
      toast({
        title: 'Select at least one framework',
        status: 'warning'
      });
      return;
    }

    const ownerEmail = formState.owner.trim();

    try {
      if (formMode === 'edit' && editingAssessment) {
        await updateAssessment.mutateAsync({
          id: editingAssessment.id,
          payload: {
            name: trimmedName,
            owner: ownerEmail,
            frameworkIds: formState.frameworkIds
          }
        });
        toast({
          title: 'Assessment updated',
          description: 'Changes saved successfully.',
          status: 'success'
        });
      } else {
        if (!ownerEmail) {
          toast({
            title: 'Owner email required',
            status: 'warning'
          });
          return;
        }

        await createAssessment.mutateAsync({
          name: trimmedName,
          owner: ownerEmail,
          frameworkIds: formState.frameworkIds
        });
        toast({
          title: 'Assessment created',
          description: 'Assessment added to your workspace.',
          status: 'success'
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        title: formMode === 'edit' ? 'Unable to update assessment' : 'Unable to create assessment',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error'
      });
    }
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setFormMode('create');
    createModal.onOpen();
  };

  const handleEditAssessment = (assessment: AssessmentSummary) => {
    setFormMode('edit');
    setEditingAssessment(assessment);
    setFormState({
      name: assessment.name,
      owner: assessment.owner === 'unassigned' ? '' : assessment.owner,
      frameworkIds: assessment.frameworkIds
    });
    createModal.onOpen();
  };

  const handleOpenWorkspace = (assessment: AssessmentSummary) => {
    setWorkspaceAssessmentId(assessment.id);
    setTaskForm(createInitialTaskForm());
    workspaceModal.onOpen();
  };

  const handleCloseWorkspace = () => {
    setWorkspaceAssessmentId(null);
    setTaskForm(createInitialTaskForm());
    setPendingControlId(null);
    setPendingTaskId(null);
    workspaceModal.onClose();
  };

  const handleControlStatusChange = async (
    control: AssessmentControl,
    status: AssessmentControlStatus
  ) => {
    if (!workspaceAssessmentId || status === control.status) {
      return;
    }

    setPendingControlId(control.id);
    const label = controlStatusOptions.find((option) => option.value === status)?.label ?? status;
    try {
      await updateControl.mutateAsync({
        assessmentId: workspaceAssessmentId,
        controlId: control.id,
        payload: { status }
      });
      toast({
        title: 'Control updated',
        description: `${control.controlId} marked as ${label}.`,
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Unable to update control',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error'
      });
    } finally {
      setPendingControlId(null);
    }
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!workspaceAssessmentId) {
      return;
    }

    const title = taskForm.title.trim();
    if (!title) {
      toast({
        title: 'Task title required',
        status: 'warning'
      });
      return;
    }

    const payload: CreateAssessmentTaskInput = {
      assessmentId: workspaceAssessmentId,
      title,
      status: taskForm.status,
      priority: taskForm.priority
    };

    if (taskForm.description.trim()) {
      payload.description = taskForm.description.trim();
    }
    if (taskForm.owner.trim()) {
      payload.owner = taskForm.owner.trim();
    }
    if (taskForm.dueDate) {
      payload.dueDate = taskForm.dueDate;
    }
    if (taskForm.assessmentControlId) {
      payload.assessmentControlId = taskForm.assessmentControlId;
    }

    try {
      await createTask.mutateAsync(payload);
      toast({
        title: 'Task created',
        status: 'success'
      });
      setTaskForm(createInitialTaskForm());
    } catch (error) {
      toast({
        title: 'Unable to create task',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error'
      });
    }
  };

  const handleTaskStatusChange = async (task: AssessmentTask, status: AssessmentTaskStatus) => {
    if (!workspaceAssessmentId || status === task.status) {
      return;
    }

    setPendingTaskId(task.id);
    const label = taskStatusOptions.find((option) => option.value === status)?.label ?? status;
    try {
      await updateTask.mutateAsync({
        assessmentId: workspaceAssessmentId,
        taskId: task.id,
        payload: { status }
      });
      toast({
        title: 'Task updated',
        description: `${task.title} marked as ${label}.`,
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Unable to update task',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error'
      });
    } finally {
      setPendingTaskId(null);
    }
  };

  const handleTaskPriorityChange = async (
    task: AssessmentTask,
    priority: AssessmentTaskPriority
  ) => {
    if (!workspaceAssessmentId || priority === task.priority) {
      return;
    }

    setPendingTaskId(task.id);
    const label = taskPriorityOptions.find((option) => option.value === priority)?.label ?? priority;
    try {
      await updateTask.mutateAsync({
        assessmentId: workspaceAssessmentId,
        taskId: task.id,
        payload: { priority }
      });
      toast({
        title: 'Task priority updated',
        description: `${task.title} set to ${label}.`,
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Unable to update task',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error'
      });
    } finally {
      setPendingTaskId(null);
    }
  };

  const handleDeleteTask = async (task: AssessmentTask) => {
    if (!workspaceAssessmentId) {
      return;
    }

    setPendingTaskId(task.id);
    try {
      await deleteTask.mutateAsync({
        assessmentId: workspaceAssessmentId,
        taskId: task.id
      });
      toast({
        title: 'Task removed',
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Unable to remove task',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error'
      });
    } finally {
      setPendingTaskId(null);
    }
  };

  const handleStatusChange = async (id: string, status: 'draft' | 'in-progress' | 'complete') => {
    setPendingStatusId(id);
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({
        title: 'Assessment updated',
        description: `Marked as ${status}.`,
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Unable to update status',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error'
      });
    } finally {
      setPendingStatusId(null);
    }
  };

  return (
    <>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading size="lg">Assessments</Heading>
          <Button
            rightIcon={<Icon as={FiArrowRight} />}
            colorScheme="brand"
            onClick={handleOpenCreateModal}
            isDisabled={createAssessment.isPending}
          >
            Launch Assessment
          </Button>
        </HStack>

        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} align={{ base: 'stretch', md: 'center' }}>
          <Input
            placeholder="Search by assessment or owner..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            maxW={{ base: '100%', md: '320px' }}
          />
          <ButtonGroup size="sm" isAttached>
            {['all', 'draft', 'in-progress', 'complete'].map((status) => {
              const label = status === 'all' ? 'All' : status.replace('-', ' ');
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

        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
          {filteredAssessments.map((assessment) => (
            <Box
              key={assessment.id}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={cardBorderColor}
              p={5}
              bg={cardBackground}
            >
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{assessment.name}</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Updated {new Date(assessment.updatedAt).toLocaleString()}
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
                    <Badge colorScheme={statusColors[assessment.status] ?? 'gray'}>
                      {assessment.status}
                    </Badge>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Change assessment status"
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                        isDisabled={pendingStatusId === assessment.id && updateStatus.isPending}
                      />
                      <MenuList>
                        <MenuItem icon={<FiEdit2 />} onClick={() => handleEditAssessment(assessment)}>
                          Edit assessment
                        </MenuItem>
                        <MenuDivider />
                        {statusOptions.map((status) => (
                          <MenuItem
                            key={status}
                            onClick={() => handleStatusChange(assessment.id, status)}
                            isDisabled={assessment.status === status || updateStatus.isPending}
                          >
                            Mark as {status}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </HStack>
                </HStack>
                <VStack align="stretch" spacing={1}>
                  <Text fontSize="sm" color="gray.400">
                    Owner: {assessment.owner}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Frameworks:{' '}
                    {assessment.frameworkIds.map((id) => resolveFramework(id)).join(', ')}
                  </Text>
                  {renderProgress(assessment.progress)}
                </VStack>
                <HStack spacing={3} pt={1} flexWrap="wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="brand"
                    onClick={() => handleOpenWorkspace(assessment)}
                  >
                    Open Workspace
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    colorScheme="purple"
                    onClick={() => handleEvidenceModalOpen(assessment)}
                  >
                    Evidence suggestions
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>

      <Modal isOpen={createModal.isOpen} onClose={handleCloseModal} size="lg">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmitAssessment}>
          <ModalHeader>{assessmentModalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Assessment name</FormLabel>
                <Input
                  placeholder="FedRAMP Moderate POA&M"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      name: event.target.value
                    }))
                  }
                />
              </FormControl>
              <FormControl isRequired={!isEditMode}>
                <FormLabel>Owner email</FormLabel>
                <Input
                  type="email"
                  placeholder="analyst@example.com"
                  value={formState.owner}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      owner: event.target.value
                    }))
                  }
                />
                {isEditMode ? (
                  <FormHelperText>Leave blank to unassign this assessment.</FormHelperText>
                ) : null}
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Included frameworks</FormLabel>
                <CheckboxGroup
                  value={formState.frameworkIds}
                  onChange={(values) =>
                    setFormState((prev) => ({
                      ...prev,
                      frameworkIds: values as string[]
                    }))
                  }
                >
                  <Stack spacing={2}>
                    {frameworkOptions.map((framework) => (
                      <Checkbox key={framework.id} value={framework.id}>
                        {framework.label}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={handleCloseModal}
                isDisabled={createAssessment.isPending || updateAssessment.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={isEditMode ? updateAssessment.isPending : createAssessment.isPending}
                loadingText={isEditMode ? 'Saving' : 'Creating'}
              >
                {isEditMode ? 'Save changes' : 'Create assessment'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={workspaceModal.isOpen} onClose={handleCloseWorkspace} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assessment Workspace</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {workspaceLoading ? (
              <HStack spacing={3} py={6} align="center">
                <Spinner />
                <Text>Loading assessment workspace…</Text>
              </HStack>
            ) : activeAssessment ? (
              <Stack spacing={6} pb={4}>
                <VStack align="stretch" spacing={2}>
                  <Heading size="md">{activeAssessment.name}</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Owner: {activeAssessment.owner}
                  </Text>
                  <HStack spacing={6} fontSize="sm" color="gray.500" flexWrap="wrap">
                    <Text>Created {new Date(activeAssessment.createdAt).toLocaleString()}</Text>
                    <Text>Updated {new Date(activeAssessment.updatedAt).toLocaleString()}</Text>
                  </HStack>
                  <HStack spacing={2} flexWrap="wrap">
                    {activeAssessment.frameworks.map((framework) => (
                      <Badge key={framework.id} colorScheme="blue" variant="subtle">
                        {framework.name} · {framework.version}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>

                <Box>
                  <Heading size="sm" mb={2}>
                    Progress overview
                  </Heading>
                  {renderProgress(activeAssessment.progress)}
                </Box>

                <Box>
                  <Heading size="sm" mb={3}>
                    Controls
                  </Heading>
                  {activeAssessment.controls.length ? (
                    <TableContainer>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Control</Th>
                            <Th>Status</Th>
                            <Th>Owner</Th>
                            <Th>Last updated</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {activeAssessment.controls.map((control) => (
                            <Tr key={control.id}>
                              <Td>
                                <VStack align="stretch" spacing={0} fontSize="sm">
                                  <Text fontWeight="semibold">{control.controlId}</Text>
                                  <Text color="gray.500">{control.title}</Text>
                                </VStack>
                              </Td>
                              <Td>
                                <Select
                                  size="sm"
                                  value={control.status}
                                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                    handleControlStatusChange(
                                      control,
                                      event.target.value as AssessmentControlStatus
                                    )
                                  }
                                  isDisabled={pendingControlId === control.id || updateControl.isPending}
                                >
                                  {controlStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </Select>
                              </Td>
                              <Td>
                                <Text fontSize="sm">{control.owner}</Text>
                              </Td>
                              <Td>
                                <Text fontSize="sm">
                                  {control.updatedAt
                                    ? new Date(control.updatedAt).toLocaleString()
                                    : '—'}
                                </Text>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      Controls will appear here once frameworks are loaded for this assessment.
                    </Text>
                  )}
                </Box>

                <Box>
                  <Heading size="sm" mb={3}>
                    Tasks
                  </Heading>
                  <Box
                    as="form"
                    onSubmit={handleCreateTask}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={cardBorderColor}
                    p={4}
                  >
                    <Stack spacing={3}>
                      <FormControl isRequired>
                        <FormLabel>Task title</FormLabel>
                        <Input
                        placeholder="Remediate outstanding gap"
                        value={taskForm.title}
                        onChange={(event) =>
                          setTaskForm((prev) => ({
                            ...prev,
                            title: event.target.value
                          }))
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Details</FormLabel>
                      <Textarea
                        placeholder="Add context or acceptance criteria"
                        value={taskForm.description}
                        onChange={(event) =>
                          setTaskForm((prev) => ({
                            ...prev,
                            description: event.target.value
                          }))
                        }
                        rows={3}
                      />
                    </FormControl>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <FormControl>
                        <FormLabel>Owner</FormLabel>
                        <Input
                          placeholder="analyst@example.com"
                          value={taskForm.owner}
                          onChange={(event) =>
                            setTaskForm((prev) => ({
                              ...prev,
                              owner: event.target.value
                            }))
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Due date</FormLabel>
                        <Input
                          type="date"
                          value={taskForm.dueDate}
                          onChange={(event) =>
                            setTaskForm((prev) => ({
                              ...prev,
                              dueDate: event.target.value
                            }))
                          }
                        />
                      </FormControl>
                    </SimpleGrid>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select
                          value={taskForm.status}
                          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                            setTaskForm((prev) => ({
                              ...prev,
                              status: event.target.value as AssessmentTaskStatus
                            }))
                          }
                        >
                          {taskStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          value={taskForm.priority}
                          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                            setTaskForm((prev) => ({
                              ...prev,
                              priority: event.target.value as AssessmentTaskPriority
                            }))
                          }
                        >
                          {taskPriorityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                    <FormControl>
                      <FormLabel>Linked control</FormLabel>
                      <Select
                        placeholder="None"
                        value={taskForm.assessmentControlId}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          setTaskForm((prev) => ({
                            ...prev,
                            assessmentControlId: event.target.value
                          }))
                        }
                      >
                        {activeAssessment.controls.map((control) => (
                          <option key={control.id} value={control.id}>
                            {control.controlId} · {control.title}
                          </option>
                        ))}
                      </Select>
                      <FormHelperText>
                        Link a control to keep remediation aligned with assessment gaps.
                      </FormHelperText>
                    </FormControl>
                    <HStack justify="flex-end">
                      <Button
                        type="submit"
                        size="sm"
                        colorScheme="brand"
                        leftIcon={<FiPlus />}
                        isLoading={createTask.isPending}
                        loadingText="Adding"
                      >
                        Add task
                      </Button>
                    </HStack>
                    </Stack>
                  </Box>

                  <Stack spacing={3} mt={4}>
                    {activeAssessment.tasks.length ? (
                      activeAssessment.tasks.map((task: AssessmentTask) => {
                        const isTaskPending =
                          pendingTaskId === task.id && (updateTask.isPending || deleteTask.isPending);
                        const statusLabel =
                          taskStatusOptions.find((option) => option.value === task.status)?.label ??
                          task.status;
                        const priorityLabel =
                          taskPriorityOptions.find((option) => option.value === task.priority)?.label ??
                          task.priority;
                        return (
                          <Box
                            key={task.id}
                            borderWidth="1px"
                            borderRadius="md"
                            borderColor={cardBorderColor}
                            p={4}
                          >
                            <VStack align="stretch" spacing={3}>
                              <Flex justify="space-between" align="start" gap={3}>
                                <VStack align="stretch" spacing={1} flex="1">
                                  <Text fontWeight="semibold">{task.title}</Text>
                                  {task.description ? (
                                    <Text fontSize="sm" color="gray.500">
                                      {task.description}
                                    </Text>
                                  ) : null}
                                  {task.owner && task.owner !== 'unassigned' ? (
                                    <Text fontSize="sm" color="gray.500">
                                      Owner: {task.owner}
                                    </Text>
                                  ) : null}
                                  <HStack spacing={2} flexWrap="wrap">
                                    <Tag colorScheme={taskStatusColor[task.status]}>
                                      {statusLabel}
                                    </Tag>
                                    <Tag variant="subtle" colorScheme={taskPriorityColor[task.priority]}>
                                      Priority: {priorityLabel}
                                    </Tag>
                                    {task.dueDate ? (
                                      <Tag variant="outline" colorScheme="gray">
                                        Due {new Date(task.dueDate).toLocaleDateString()}
                                      </Tag>
                                    ) : null}
                                    {task.assessmentControlId ? (
                                      <Tag variant="outline" colorScheme="purple">
                                        Linked: {task.assessmentControlId}
                                      </Tag>
                                    ) : null}
                                  </HStack>
                                </VStack>
                                <HStack spacing={2}>
                                  <Menu>
                                    <MenuButton
                                      as={Button}
                                      size="sm"
                                      variant="ghost"
                                      isDisabled={isTaskPending}
                                    >
                                      Update
                                    </MenuButton>
                                    <MenuList>
                                      <MenuGroup title="Status">
                                        {taskStatusOptions.map((option) => (
                                          <MenuItem
                                            key={option.value}
                                            onClick={() => handleTaskStatusChange(task, option.value)}
                                            isDisabled={option.value === task.status}
                                          >
                                            {option.label}
                                          </MenuItem>
                                        ))}
                                      </MenuGroup>
                                      <MenuDivider />
                                      <MenuGroup title="Priority">
                                        {taskPriorityOptions.map((option) => (
                                          <MenuItem
                                            key={option.value}
                                            onClick={() => handleTaskPriorityChange(task, option.value)}
                                            isDisabled={option.value === task.priority}
                                          >
                                            {option.label}
                                          </MenuItem>
                                        ))}
                                      </MenuGroup>
                                    </MenuList>
                                  </Menu>
                                  <IconButton
                                    aria-label="Delete task"
                                    icon={<FiTrash2 />}
                                    variant="ghost"
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleDeleteTask(task)}
                                    isDisabled={isTaskPending}
                                  />
                                </HStack>
                              </Flex>
                              <Text fontSize="xs" color="gray.500">
                                Created {new Date(task.createdAt).toLocaleString()}
                                {task.updatedAt !== task.createdAt
                                  ? ` • Updated ${new Date(task.updatedAt).toLocaleString()}`
                                  : ''}
                              </Text>
                            </VStack>
                          </Box>
                        );
                      })
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No tasks yet. Capture remediation work to track progress.
                      </Text>
                    )}
                  </Stack>
                </Box>
              </Stack>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleCloseWorkspace}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={evidenceModal.isOpen} onClose={handleEvidenceModalClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Evidence reuse suggestions
            {selectedAssessment ? ` • ${selectedAssessment.name}` : ''}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isEvidenceLoading ? (
              <HStack spacing={3} py={4}>
                <Spinner />
                <Text>Loading evidence recommendations…</Text>
              </HStack>
            ) : null}

            {isEvidenceError ? (
              <Alert status="error" borderRadius="md" mb={4}>
                <AlertIcon />
                <Box>
                  <AlertTitle>Unable to fetch recommendations</AlertTitle>
                  <AlertDescription>
                    {evidenceError instanceof Error
                      ? evidenceError.message
                      : 'Unexpected error retrieving evidence suggestions.'}
                  </AlertDescription>
                </Box>
              </Alert>
            ) : null}

            {!isEvidenceLoading && !isEvidenceError ? (
              evidenceSuggestions.length ? (
                <Stack spacing={4}>
                  {evidenceSuggestions.map((recommendation) => (
                      <Box
                        key={`${recommendation.mappingId}:${recommendation.hint.id}`}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor={suggestionBorderColor}
                        p={4}
                      >
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between" align={{ base: 'stretch', md: 'center' }}>
                            <VStack align="start" spacing={0} flex="1">
                              <Text fontWeight="semibold">{recommendation.evidence.name}</Text>
                              <Text fontSize="sm" color="gray.500">
                                Uploaded {new Date(recommendation.evidence.uploadedAt).toLocaleDateString()}
                              </Text>
                            </VStack>
                            <VStack align="end" spacing={1} minW={{ base: 'auto', md: '140px' }}>
                              <Badge colorScheme="green" textTransform="capitalize">
                                {recommendation.evidence.status.toLowerCase()}
                              </Badge>
                              <Badge colorScheme="blue">
                                Confidence {Math.round(recommendation.confidence * 100)}%
                              </Badge>
                              <Badge variant="subtle" colorScheme="purple">
                                Origin {recommendation.mappingOrigin.toLowerCase()}
                              </Badge>
                            </VStack>
                          </HStack>

                          <Divider />

                          <Stack spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              Mapping
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {recommendation.sourceControl.id} → {recommendation.targetControl.id}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {recommendation.sourceControl.title}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {recommendation.targetControl.title}
                            </Text>
                          </Stack>

                          <Stack spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              Evidence hint
                            </Text>
                            <Text fontSize="sm">{recommendation.hint.summary}</Text>
                            {recommendation.hint.rationale ? (
                              <Text fontSize="xs" color="gray.500">
                                {recommendation.hint.rationale}
                              </Text>
                            ) : null}
                          </Stack>

                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            {recommendation.tags.map((tag) => (
                              <Badge key={tag} colorScheme="purple" variant="subtle">
                                {tag}
                              </Badge>
                            ))}
                            <Badge colorScheme="teal" variant="subtle">
                              Hint score {Math.round(recommendation.hint.score * 100)}%
                            </Badge>
                          </Stack>

                          <Stack spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              Framework coverage
                            </Text>
                            <HStack spacing={2} flexWrap="wrap">
                              {recommendation.evidence.frameworks.map((framework) => (
                                <Badge key={framework.id} variant="outline">
                                  {framework.name} ({framework.version})
                                </Badge>
                              ))}
                            </HStack>
                          </Stack>

                          <Text fontSize="xs" color="gray.400">
                            Storage URI: {recommendation.evidence.uri}
                          </Text>
                        </VStack>
                      </Box>
                  ))}
                </Stack>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  No evidence reuse recommendations yet. Accept crosswalk mappings or attach
                  evidence hints to surface reuse candidates.
                </Text>
              )
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleEvidenceModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AssessmentsPage;
