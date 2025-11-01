import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Select,
  SimpleGrid,
  Spinner,
  Skeleton,
  SkeletonText,
  Stack,
  StackDivider,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import {
  AssessmentStatus,
  ControlCatalogItem,
  ControlCatalogParams,
  ControlCatalogResponse,
  ControlPriority,
  ControlStatus,
  EvidenceStatus,
  useControlCatalog
} from '../hooks/use-control-catalog';

const priorityLabels: Record<ControlPriority, string> = {
  P0: 'Foundational',
  P1: 'High',
  P2: 'Moderate',
  P3: 'Low'
};

const statusLabels: Record<ControlStatus, string> = {
  SATISFIED: 'Satisfied',
  PARTIAL: 'Partially Implemented',
  UNSATISFIED: 'Not Implemented',
  NOT_APPLICABLE: 'Not Applicable',
  UNASSESSED: 'Unassessed'
};

const statusColors: Record<ControlStatus, string> = {
  SATISFIED: 'green',
  PARTIAL: 'yellow',
  UNSATISFIED: 'red',
  NOT_APPLICABLE: 'gray',
  UNASSESSED: 'purple'
};

const assessmentStatusLabels: Record<AssessmentStatus, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  COMPLETE: 'Complete'
};

const evidenceStatusColors: Record<EvidenceStatus, string> = {
  APPROVED: 'green',
  PENDING: 'yellow',
  ARCHIVED: 'gray',
  QUARANTINED: 'red'
};

const FrameworkControlCatalogPage = () => {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParamSignature = searchParams.toString();
  const page = Math.max(parseInt(searchParams.get('page') ?? '1', 10), 1);
  const pageSize = Math.max(parseInt(searchParams.get('pageSize') ?? '25', 10), 1);
  const filters = useMemo<ControlCatalogParams>(() => {
    const snapshot = new URLSearchParams(searchParamSignature);
    return {
      search: snapshot.get('search') ?? undefined,
      family: snapshot.get('family') ?? undefined,
      priority: (snapshot.get('priority') as ControlPriority | null) ?? undefined,
      type: (snapshot.get('type') as 'base' | 'enhancement' | null) ?? undefined,
      page,
      pageSize
    };
  }, [page, pageSize, searchParamSignature]);

  const catalogQuery = useControlCatalog(frameworkId, filters);
  const { isLoading, isFetching, isError, error } = catalogQuery;
  const data = catalogQuery.data as ControlCatalogResponse | undefined;
  const {
    isOpen: isDetailOpen,
    onOpen: openDetail,
    onClose: closeDetail
  } = useDisclosure();
  const [selectedControl, setSelectedControl] = useState<ControlCatalogItem | null>(null);
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  useEffect(() => {
    setSearchInput(filters.search ?? '');
  }, [filters.search]);

  useEffect(() => {
    if (!data || !selectedControl) {
      return;
    }

    if (!data.items.some((item) => item.id === selectedControl.id)) {
      setSelectedControl(null);
      closeDetail();
    }
  }, [closeDetail, data, selectedControl]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next, { replace: true });
  };

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateSearchParams((params) => {
      if (searchInput.trim()) {
        params.set('search', searchInput.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '1');
    });
  };

  const handleFamilyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    updateSearchParams((params) => {
      if (value) {
        params.set('family', value);
      } else {
        params.delete('family');
      }
      params.set('page', '1');
    });
  };

  const handlePriorityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as ControlPriority | '';
    updateSearchParams((params) => {
      if (value) {
        params.set('priority', value);
      } else {
        params.delete('priority');
      }
      params.set('page', '1');
    });
  };

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as 'base' | 'enhancement' | '';
    updateSearchParams((params) => {
      if (value) {
        params.set('type', value);
      } else {
        params.delete('type');
      }
      params.set('page', '1');
    });
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as ControlStatus | '';
    updateSearchParams((params) => {
      if (value) {
        params.set('status', value);
      } else {
        params.delete('status');
      }
      params.set('page', '1');
    });
  };

  const handleClearFilters = () => {
    const retained = new URLSearchParams();
    setSearchParams(retained, { replace: true });
  };

  const handlePageChange = (nextPage: number) => {
    updateSearchParams((params) => {
      params.set('page', String(Math.max(1, nextPage)));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const trackControlOpen = (control: ControlCatalogItem) => {
    if (typeof window === 'undefined') {
      return;
    }
    const analytics = (window as typeof window & {
      analytics?: { track: (event: string, payload: Record<string, unknown>) => void };
    }).analytics;
    analytics?.track('control_catalog_control_opened', {
      frameworkId: control.frameworkId,
      controlId: control.id,
      priority: control.priority,
      evidenceCount: control.evidence.length,
      mappingCount: control.mappings.length
    });
  };

  const handleOpenDetails = (control: ControlCatalogItem) => {
    setSelectedControl(control);
    trackControlOpen(control);
    openDetail();
  };

  const handleCloseDetails = () => {
    closeDetail();
    setSelectedControl(null);
  };

  const families = data?.facets.families ?? [];
  const types = data?.facets.types ?? [];
  const statuses = data?.facets.statuses ?? [];
  const total = data?.total ?? 0;
  const currentFramework = data?.framework;
  const currentPage = filters.page ?? 1;
  const currentPageSize = filters.pageSize ?? 25;
  const startIndex = total === 0 ? 0 : (currentPage - 1) * currentPageSize + 1;
  const endIndex = data ? Math.min(total, currentPage * currentPageSize) : 0;
  const statusValue = filters.status ?? '';

  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const drawerDivider = useColorModeValue('gray.100', 'gray.700');

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Button leftIcon={<Icon as={FiArrowLeft} />} variant="ghost" onClick={() => navigate(-1)}>
          Back
        </Button>
        {isFetching && !isLoading && (
          <HStack spacing={2}>
            <Spinner size="sm" />
            <Text fontSize="sm" color="gray.500">
              Updating…
            </Text>
          </HStack>
        )}
      </HStack>

      <VStack align="stretch" spacing={3}>
        <Heading size="lg">Control Catalog</Heading>
        {currentFramework && (
          <Text color="gray.500">
            Showing controls for <strong>{currentFramework.name}</strong> ({currentFramework.version}) —{' '}
            {currentFramework.description}
          </Text>
        )}
      </VStack>

      <Stack
        as="form"
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        align="stretch"
        onSubmit={handleSearchSubmit}
      >
        <FormControl>
          <FormLabel fontSize="sm" color="gray.500">
            Search by control ID, title, or description
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="e.g. AC-2, account management, remote access"
              value={searchInput}
              onChange={handleSearchChange}
              aria-label="Search controls"
            />
          </InputGroup>
        </FormControl>
        <Button type="submit" colorScheme="brand">
          Search
        </Button>
        <Button variant="outline" onClick={handleClearFilters}>
          Reset
        </Button>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 5 }} spacing={4}>
        <FormControl>
          <FormLabel fontSize="sm" color="gray.500">
            Control Family
          </FormLabel>
          <Select placeholder="All families" value={filters.family ?? ''} onChange={handleFamilyChange}>
            {families.map((family) => (
              <option key={family.value} value={family.value}>
                {family.value} ({family.count})
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" color="gray.500">
            Priority
          </FormLabel>
          <Select placeholder="All priorities" value={filters.priority ?? ''} onChange={handlePriorityChange}>
            {(Object.keys(priorityLabels) as ControlPriority[]).map((priority) => (
              <option key={priority} value={priority}>
                {priority} — {priorityLabels[priority]}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" color="gray.500">
            Control Type
          </FormLabel>
          <Select placeholder="Base and enhancements" value={filters.type ?? ''} onChange={handleTypeChange}>
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.value === 'base' ? 'Base Control' : 'Control Enhancement'} ({type.count})
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" color="gray.500">
            Assessment Status
          </FormLabel>
          <Select placeholder="All statuses" value={statusValue} onChange={handleStatusChange}>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {statusLabels[status.value]} ({status.count})
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm" color="gray.500">
            Active Filters
          </FormLabel>
          <HStack spacing={2} flexWrap="wrap">
            <Badge colorScheme="blue" variant="subtle">
              Total: {total.toLocaleString()}
            </Badge>
            {filters.search && <Badge colorScheme="purple">Search: {filters.search}</Badge>}
            {filters.family && <Badge colorScheme="teal">Family: {filters.family}</Badge>}
            {filters.priority && (
              <Badge colorScheme="orange">
                Priority: {filters.priority} ({priorityLabels[filters.priority]})
              </Badge>
            )}
            {filters.type && (
              <Badge colorScheme="cyan">
                Type: {filters.type === 'base' ? 'Base Control' : 'Enhancement'}
              </Badge>
            )}
            {filters.status && (
              <Badge colorScheme={statusColors[filters.status]}>
                Status: {statusLabels[filters.status]}
              </Badge>
            )}
            {!filters.search &&
              !filters.family &&
              !filters.priority &&
              !filters.type &&
              !filters.status && (
              <Text fontSize="sm" color="gray.400">
                No additional filters applied
              </Text>
            )}
          </HStack>
        </FormControl>
      </SimpleGrid>

      {isLoading && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} aria-live="polite">
          {Array.from({ length: 4 }).map((_, index) => (
            <Box key={index} borderWidth="1px" borderRadius="lg" borderColor={cardBorder} bg={cardBg} p={5}>
              <Skeleton height="18px" mb={3} />
              <SkeletonText mt="4" noOfLines={4} spacing="3" />
            </Box>
          ))}
        </SimpleGrid>
      )}

      {isError && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Unable to load controls</AlertTitle>
            <AlertDescription>{error instanceof Error ? error.message : 'Unexpected error occurred.'}</AlertDescription>
          </Box>
        </Alert>
      )}

      {data && data.items.length === 0 && !isLoading && !isError && (
        <Box borderWidth="1px" borderRadius="lg" p={6} textAlign="center">
          <Heading size="md" mb={2}>
            No controls match your filters
          </Heading>
          <Text color="gray.500">Try adjusting your search terms or clearing filters to see more results.</Text>
        </Box>
      )}

      {data && data.items.length > 0 && (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          {data.items.map((control) => (
            <Box key={control.id} borderWidth="1px" borderRadius="lg" borderColor={cardBorder} bg={cardBg} p={5}>
              <Stack spacing={3}>
                <HStack justify="space-between" align="start" spacing={3}>
                  <VStack align="start" spacing={1}>
                    <Heading size="sm">
                      {control.id.toUpperCase()} — {control.title}
                    </Heading>
                    <Text color="gray.500">{control.family}</Text>
                    {control.kind === 'enhancement' && control.parentId && (
                      <Badge colorScheme="cyan" variant="subtle">
                        Enhancement of {control.parentId.toUpperCase()}
                      </Badge>
                    )}
                  </VStack>
                  <Badge px={3} py={1} bg={badgeBg}>
                    {control.priority} · {priorityLabels[control.priority]}
                  </Badge>
                </HStack>
                <Text noOfLines={3}>{control.description}</Text>
                {control.statusSummary.length > 0 && (
                  <HStack spacing={2} flexWrap="wrap">
                    {control.statusSummary.map((status) => (
                      <Badge key={status.status} colorScheme={statusColors[status.status]}>
                        {statusLabels[status.status]} ({status.count})
                      </Badge>
                    ))}
                  </HStack>
                )}
                <HStack spacing={4} fontSize="sm" color="gray.500">
                  <HStack spacing={1}>
                    <Badge variant="outline" colorScheme="green">
                      {control.evidence.length}
                    </Badge>
                    <Text>Evidence</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Badge variant="outline" colorScheme="purple">
                      {control.mappings.length}
                    </Badge>
                    <Text>Crosswalk links</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Badge variant="outline" colorScheme="blue">
                      {control.assessments.length}
                    </Badge>
                    <Text>Assessments</Text>
                  </HStack>
                </HStack>
                <Flex justify="flex-end">
                  <Button
                    variant="outline"
                    colorScheme="brand"
                    size="sm"
                    onClick={() => handleOpenDetails(control)}
                    aria-label={`View details for control ${control.id}`}
                  >
                    View details
                  </Button>
                </Flex>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {data && data.total > 0 && (
        <VStack align="stretch" spacing={3}>
          <Divider />
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <Text fontSize="sm" color="gray.500" aria-live="polite">
              Showing {startIndex}-{endIndex} of {total.toLocaleString()} controls
            </Text>
            <HStack spacing={3}>
              <IconButton
                aria-label="Previous page"
                icon={<Icon as={FiArrowLeft} />}
                onClick={() => handlePageChange(page - 1)}
                isDisabled={page <= 1}
              />
              <Text fontSize="sm" color="gray.500">
                Page {page}
              </Text>
              <IconButton
                aria-label="Next page"
                icon={<Icon as={FiArrowLeft} transform="rotate(180deg)" />}
                onClick={() => handlePageChange(page + 1)}
                isDisabled={!data.hasNextPage}
              />
            </HStack>
          </Flex>
        </VStack>
      )}

      <Drawer isOpen={isDetailOpen} placement="right" size="lg" onClose={handleCloseDetails}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {selectedControl ? (
              <VStack align="start" spacing={1}>
                <Heading size="md">{selectedControl.id.toUpperCase()}</Heading>
                <Text fontSize="sm" color="gray.500">
                  {selectedControl.title}
                </Text>
              </VStack>
            ) : (
              'Control details'
            )}
          </DrawerHeader>
          <DrawerBody>
            {selectedControl ? (
              <Stack spacing={6} divider={<StackDivider borderColor={drawerDivider} />}>
                <Stack spacing={2}>
                  <Heading size="sm">Overview</Heading>
                  <Text>{selectedControl.description}</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge colorScheme="blue">{selectedControl.family}</Badge>
                    <Badge colorScheme="cyan">
                      {selectedControl.kind === 'enhancement' ? 'Enhancement control' : 'Base control'}
                    </Badge>
                    <Badge colorScheme="orange">
                      Priority: {selectedControl.priority} ({priorityLabels[selectedControl.priority]})
                    </Badge>
                  </HStack>
                  {selectedControl.baselines && selectedControl.baselines.length > 0 && (
                    <HStack spacing={2} flexWrap="wrap">
                      {selectedControl.baselines.map((baseline) => (
                        <Badge key={baseline} colorScheme="green">
                          {baseline.toUpperCase()}
                        </Badge>
                      ))}
                    </HStack>
                  )}
                  {selectedControl.keywords && selectedControl.keywords.length > 0 && (
                    <HStack spacing={2} flexWrap="wrap">
                      {selectedControl.keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" colorScheme="gray">
                          {keyword}
                        </Badge>
                      ))}
                    </HStack>
                  )}
                </Stack>

                {selectedControl.statusSummary.length > 0 && (
                  <Stack spacing={2}>
                    <Heading size="sm">Assessment status</Heading>
                    <HStack spacing={2} flexWrap="wrap">
                      {selectedControl.statusSummary.map((status) => (
                        <Badge key={status.status} colorScheme={statusColors[status.status]}>
                          {statusLabels[status.status]} ({status.count})
                        </Badge>
                      ))}
                    </HStack>
                  </Stack>
                )}

                {selectedControl.assessments.length > 0 && (
                  <Stack spacing={2}>
                    <Heading size="sm">Linked assessments</Heading>
                    <List spacing={3}>
                      {selectedControl.assessments.map((assessment) => (
                        <ListItem key={`${assessment.id}-${assessment.controlStatus}`}>
                          <Stack spacing={1}>
                            <HStack justify="space-between" align="start">
                              <Text fontWeight="semibold">{assessment.name}</Text>
                              <Badge colorScheme={statusColors[assessment.controlStatus]}>
                                {statusLabels[assessment.controlStatus]}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.500">
                              Assessment status: {assessmentStatusLabels[assessment.status]}
                            </Text>
                            {assessment.dueDate && (
                              <Text fontSize="sm" color="gray.500">
                                Due {new Date(assessment.dueDate).toLocaleDateString()}
                              </Text>
                            )}
                          </Stack>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                )}

                {selectedControl.evidence.length > 0 && (
                  <Stack spacing={2}>
                    <Heading size="sm">Evidence</Heading>
                    <List spacing={3}>
                      {selectedControl.evidence.map((evidence) => (
                        <ListItem key={evidence.id}>
                          <Stack spacing={1}>
                            <HStack justify="space-between" align="start">
                              <Text fontWeight="semibold">{evidence.name}</Text>
                              <Badge colorScheme={evidenceStatusColors[evidence.status]}>
                                {evidence.status.toLowerCase()}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.500">
                              Uploaded {new Date(evidence.uploadedAt).toLocaleDateString()}
                            </Text>
                            {evidence.frameworks.length > 0 && (
                              <HStack spacing={2} flexWrap="wrap">
                                {evidence.frameworks.map((framework) => (
                                  <Badge key={`${evidence.id}-${framework.id}`} variant="outline" colorScheme="blue">
                                    {framework.name} {framework.version}
                                  </Badge>
                                ))}
                              </HStack>
                            )}
                            {evidence.tags.length > 0 && (
                              <HStack spacing={2} flexWrap="wrap">
                                {evidence.tags.map((tag) => (
                                  <Badge key={`${evidence.id}-${tag}`} variant="outline" colorScheme="gray">
                                    {tag}
                                  </Badge>
                                ))}
                              </HStack>
                            )}
                          </Stack>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                )}

                {selectedControl.mappings.length > 0 && (
                  <Stack spacing={2}>
                    <Heading size="sm">Crosswalk mappings</Heading>
                    <List spacing={3}>
                      {selectedControl.mappings.map((mapping) => (
                        <ListItem key={mapping.id}>
                          <Stack spacing={1}>
                            <HStack justify="space-between" align="start">
                              <Text fontWeight="semibold">
                                {mapping.targetFramework.name} ({mapping.targetFramework.version}) ·{' '}
                                {mapping.targetControlId.toUpperCase()}
                              </Text>
                              <Badge colorScheme="purple">
                                {Math.round(mapping.confidence * 100)}% confidence
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.500">
                              {mapping.targetControlTitle}
                            </Text>
                            <Badge variant="subtle" colorScheme="gray" width="fit-content">
                              Origin: {mapping.origin}
                            </Badge>
                            {mapping.evidenceHints.length > 0 && (
                              <Stack spacing={1}>
                                {mapping.evidenceHints.map((hint) => (
                                  <Text key={hint.id} fontSize="sm">
                                    • {hint.summary}
                                  </Text>
                                ))}
                              </Stack>
                            )}
                          </Stack>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                )}

                {selectedControl.references && selectedControl.references.length > 0 && (
                  <Stack spacing={2}>
                    <Heading size="sm">References</Heading>
                    <List spacing={1}>
                      {selectedControl.references.map((reference) => (
                        <ListItem key={reference}>
                          <Text fontSize="sm" color="gray.500">
                            • {reference}
                          </Text>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                )}

                {selectedControl.relatedControls && selectedControl.relatedControls.length > 0 && (
                  <Stack spacing={2}>
                    <Heading size="sm">Related controls</Heading>
                    <HStack spacing={2} flexWrap="wrap">
                      {selectedControl.relatedControls.map((related) => (
                        <Badge key={related} variant="outline" colorScheme="purple">
                          {related.toUpperCase()}
                        </Badge>
                      ))}
                    </HStack>
                  </Stack>
                )}
              </Stack>
            ) : (
              <Text color="gray.500">Select a control to view details.</Text>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={handleCloseDetails}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </VStack>
  );
};

export default FrameworkControlCatalogPage;
