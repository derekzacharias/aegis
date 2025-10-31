import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
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
  Stack,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { FormEvent, useMemo, useState } from 'react';
import { FiArrowRight, FiMoreVertical } from 'react-icons/fi';
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessmentStatus
} from '../hooks/use-assessments';
import type { AssessmentSummary } from '../hooks/use-assessments';
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

const AssessmentsPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: assessments } = useAssessments();
  const { data: frameworks } = useFrameworks();
  const createAssessment = useCreateAssessment();
  const updateStatus = useUpdateAssessmentStatus();
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

  const resetForm = () => {
    setFormState({
      name: '',
      owner: '',
      frameworkIds: []
    });
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  const handleCreateAssessment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      toast({
        title: 'Assessment name required',
        status: 'warning'
      });
      return;
    }

    if (!formState.owner.trim()) {
      toast({
        title: 'Owner email required',
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

    try {
      await createAssessment.mutateAsync({
        name: formState.name.trim(),
        owner: formState.owner.trim(),
        frameworkIds: formState.frameworkIds
      });
      toast({
        title: 'Assessment created',
        description: 'Assessment added to your workspace.',
        status: 'success'
      });
      handleCloseModal();
    } catch (error) {
      toast({
        title: 'Unable to create assessment',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error'
      });
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
            onClick={onOpen}
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
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              p={5}
              bg={useColorModeValue('white', 'gray.800')}
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
                <Button variant="outline" size="sm" colorScheme="brand">
                  Open Workspace
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleCreateAssessment}>
          <ModalHeader>Launch New Assessment</ModalHeader>
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
              <FormControl isRequired>
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
              <Button variant="ghost" onClick={handleCloseModal} isDisabled={createAssessment.isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={createAssessment.isPending}
                loadingText="Creating"
              >
                Create assessment
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AssessmentsPage;
