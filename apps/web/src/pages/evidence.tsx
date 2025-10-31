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
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tag,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { FiDownload, FiEye, FiUpload } from 'react-icons/fi';
import { useMemo, useState } from 'react';
import { useCreateEvidence, useEvidence } from '../hooks/use-evidence';
import { useFrameworks } from '../hooks/use-frameworks';

const statusMeta: Record<
  'pending' | 'approved' | 'archived',
  { label: string; color: string }
> = {
  pending: { label: 'Pending review', color: 'yellow' },
  approved: { label: 'Approved', color: 'green' },
  archived: { label: 'Archived', color: 'gray' }
};

const formatSize = (kb: number) => {
  if (kb >= 1024 * 1024) {
    return `${(kb / (1024 * 1024)).toFixed(1)} GB`;
  }
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${kb.toFixed(0)} KB`;
};

const EvidencePage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: evidence } = useEvidence();
  const createEvidence = useCreateEvidence();
  const { data: frameworks } = useFrameworks();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'archived'>('all');
  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    controlIds: '',
    frameworkIds: [] as string[],
    uploadedBy: '',
    status: 'pending' as 'pending' | 'approved' | 'archived',
    fileType: 'pdf',
    sizeInKb: 1024
  });

  const resolveFrameworks = (ids: string[]) =>
    ids
      .map((id) => frameworks?.find((fw) => fw.id === id)?.name ?? id)
      .filter(Boolean);

  const stats = useMemo(() => {
    const counts = {
      total: evidence?.length ?? 0,
      pending: evidence?.filter((item) => item.status === 'pending').length ?? 0,
      approved: evidence?.filter((item) => item.status === 'approved').length ?? 0,
      archived: evidence?.filter((item) => item.status === 'archived').length ?? 0
    };
    return counts;
  }, [evidence]);

  const filteredEvidence = useMemo(() => {
    if (!evidence) {
      return [];
    }

    const term = search.trim().toLowerCase();

    return evidence.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const frameworkNames = resolveFrameworks(item.frameworkIds).join(' ').toLowerCase();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.controlIds.some((control) => control.toLowerCase().includes(term)) ||
        frameworkNames.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [evidence, statusFilter, search, frameworks]);

  const handleSubmit = async () => {
    if (!formState.name.trim()) {
      toast({ title: 'Evidence name required', status: 'warning' });
      return;
    }

    if (!formState.frameworkIds.length) {
      toast({ title: 'Select at least one framework', status: 'warning' });
      return;
    }

    try {
      await createEvidence.mutateAsync({
        name: formState.name.trim(),
        controlIds: formState.controlIds
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        frameworkIds: formState.frameworkIds,
        uploadedBy: formState.uploadedBy || 'unknown@example.com',
        status: formState.status,
        fileType: formState.fileType,
        sizeInKb: formState.sizeInKb
      });
      toast({ title: 'Evidence uploaded', status: 'success' });
      setFormState({
        name: '',
        controlIds: '',
        frameworkIds: [],
        uploadedBy: '',
        status: 'pending',
        fileType: 'pdf',
        sizeInKb: 1024
      });
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
      <HStack justify="space-between" align={{ base: 'stretch', md: 'center' }} flexDir={{ base: 'column', md: 'row' }} gap={4}>
        <Heading size="lg">Evidence Vault</Heading>
        <Button leftIcon={<Icon as={FiUpload} />} colorScheme="brand" onClick={onOpen} isLoading={createEvidence.isPending}>
          Upload Evidence
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Stat bg={useColorModeValue('white', 'gray.800')} borderRadius="lg" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
          <StatLabel>Total Items</StatLabel>
          <StatNumber>{stats.total}</StatNumber>
          <StatHelpText>Across all frameworks</StatHelpText>
        </Stat>
        <Stat bg={useColorModeValue('white', 'gray.800')} borderRadius="lg" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
          <StatLabel>Pending Review</StatLabel>
          <StatNumber>{stats.pending}</StatNumber>
          <StatHelpText>Awaiting assignment</StatHelpText>
        </Stat>
        <Stat bg={useColorModeValue('white', 'gray.800')} borderRadius="lg" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
          <StatLabel>Approved</StatLabel>
          <StatNumber>{stats.approved}</StatNumber>
          <StatHelpText>Ready for audit</StatHelpText>
        </Stat>
      </SimpleGrid>

      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} align={{ base: 'stretch', md: 'center' }}>
        <Input
          placeholder="Search by evidence, control, or framework..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          maxW={{ base: '100%', md: '320px' }}
        />
        <ButtonGroup size="sm" isAttached>
          {['all', 'pending', 'approved', 'archived'].map((status) => {
            const label = status === 'all' ? 'All' : statusMeta[status as keyof typeof statusMeta].label;
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
          const frameworksResolved = resolveFrameworks(item.frameworkIds);
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
                      Uploaded {new Date(item.uploadedAt).toLocaleString()} by {item.uploadedBy}
                    </Text>
                  </VStack>
                  <Badge colorScheme={meta.color}>{meta.label}</Badge>
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                  <Tag size="sm" colorScheme="blue">
                    {item.fileType.toUpperCase()} · {formatSize(item.sizeInKb)}
                  </Tag>
                  {item.reviewDue && (
                    <Tag size="sm" colorScheme="purple">
                      Review by {new Date(item.reviewDue).toLocaleDateString()}
                    </Tag>
                  )}
                  {item.lastReviewed && (
                    <Tag size="sm" colorScheme="gray">
                      Last reviewed {new Date(item.lastReviewed).toLocaleDateString()}
                    </Tag>
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.400">
                  Controls: {item.controlIds.join(', ')}
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  {frameworksResolved.map((framework) => (
                    <Tag key={framework} size="sm" variant="subtle" colorScheme="brand">
                      {framework}
                    </Tag>
                  ))}
                </HStack>
                {item.nextAction && (
                  <Box bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="md" p={3} fontSize="sm" color="gray.300">
                    {item.nextAction}
                  </Box>
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

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Evidence</ModalHeader>
          <ModalCloseButton disabled={createEvidence.isPending} />
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
                    {frameworks?.map((framework) => (
                      <Checkbox key={framework.id} value={framework.id}>
                        {framework.name}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Uploaded by</FormLabel>
                <Input
                  value={formState.uploadedBy}
                  onChange={(event) => setFormState((prev) => ({ ...prev, uploadedBy: event.target.value }))}
                  placeholder="analyst@example.com"
                />
              </FormControl>
              <HStack spacing={4} align="flex-start">
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, status: event.target.value as typeof prev.status }))
                    }
                  >
                    <option value="pending">Pending review</option>
                    <option value="approved">Approved</option>
                    <option value="archived">Archived</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>File type</FormLabel>
                  <Select
                    value={formState.fileType}
                    onChange={(event) => setFormState((prev) => ({ ...prev, fileType: event.target.value }))}
                  >
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="csv">CSV</option>
                    <option value="xlsx">XLSX</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Size (KB)</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={formState.sizeInKb}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, sizeInKb: Number(event.target.value) || prev.sizeInKb }))
                    }
                  />
                </FormControl>
              </HStack>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose} isDisabled={createEvidence.isPending}>
                Cancel
              </Button>
              <Button colorScheme="brand" onClick={handleSubmit} isLoading={createEvidence.isPending}>
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
