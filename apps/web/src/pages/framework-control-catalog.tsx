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
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import {
  AssessmentStatus,
  ControlCatalogItem,
  ControlCatalogParams,
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

const controlFamilyNames: Record<string, string> = {
  AC: 'Access Control',
  AT: 'Awareness and Training',
  AU: 'Audit and Accountability',
  CA: 'Assessment, Authorization, and Monitoring',
  CM: 'Configuration Management',
  CP: 'Contingency Planning',
  IA: 'Identification and Authentication',
  IR: 'Incident Response',
  MA: 'Maintenance',
  MP: 'Media Protection',
  PE: 'Physical and Environmental Protection',
  PL: 'Planning',
  PM: 'Program Management',
  PS: 'Personnel Security',
  PT: 'Personally Identifiable Information Processing and Transparency',
  RA: 'Risk Assessment',
  SA: 'System and Services Acquisition',
  SC: 'System and Communications Protection',
  SI: 'System and Information Integrity',
  SR: 'Supply Chain Risk Management'
};

const controlFamilyLookup = Object.entries(controlFamilyNames).reduce<Record<string, string>>(
  (acc, [code, name]) => {
    acc[code.toUpperCase()] = code;
    acc[name.toUpperCase()] = code;
    return acc;
  },
  {}
);

const formatControlFamily = (family: string): string => {
  const normalized = family.trim();
  const key = normalized.toUpperCase();
  const code = controlFamilyLookup[key];
  if (!code) {
    return normalized;
  }
  const name = controlFamilyNames[code];
  return name ? `${code}: ${name}` : normalized;
};

const evidenceStatusColors: Record<EvidenceStatus, string> = {
  APPROVED: 'green',
  PENDING: 'yellow',
  ARCHIVED: 'gray',
  QUARANTINED: 'red'
};

const resolveClause = (metadata?: Record<string, unknown> | null): string | undefined => {
  if (!metadata || typeof metadata !== 'object') {
    return undefined;
  }
  const clause = metadata['clause'];
  return typeof clause === 'string' && clause.trim().length > 0 ? clause : undefined;
};

const resolveDomain = (metadata?: Record<string, unknown> | null): string | undefined => {
  if (!metadata || typeof metadata !== 'object') {
    return undefined;
  }
  const domain = metadata['domain'];
  return typeof domain === 'string' && domain.trim().length > 0 ? domain : undefined;
};

const FrameworkControlCatalogPage = () => {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParamSignature = searchParams.toString();
  const pageSize = Math.max(parseInt(searchParams.get('pageSize') ?? '25', 10), 1);
  const filters = useMemo<ControlCatalogParams>(() => {
    const snapshot = new URLSearchParams(searchParamSignature);
    return {
      search: snapshot.get('search') ?? undefined,
      family: snapshot.get('family') ?? undefined,
      priority: (snapshot.get('priority') as ControlPriority | null) ?? undefined,
      type: (snapshot.get('type') as 'base' | 'enhancement' | null) ?? undefined,
      status: (snapshot.get('status') as ControlStatus | null) ?? undefined,
      pageSize
    };
  }, [pageSize, searchParamSignature]);

  const catalogQuery = useControlCatalog(frameworkId, filters);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error
  } = catalogQuery;
  const {
    isOpen: isDetailOpen,
    onOpen: openDetail,
    onClose: closeDetail
  } = useDisclosure();
  const [selectedControl, setSelectedControl] = useState<ControlCatalogItem | null>(null);
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const pages = data?.pages ?? [];
  const items = useMemo(() => pages.flatMap((pageData) => pageData.items), [pages]);
  const firstPage = pages[0];
  const families = firstPage?.facets.families ?? [];
  const types = firstPage?.facets.types ?? [];
  const statuses = firstPage?.facets.statuses ?? [];
  const total = firstPage?.total ?? 0;
  const currentFramework = firstPage?.framework;
  const hasMore = Boolean(hasNextPage);
  const loadedCount = items.length;

  useEffect(() => {
    setSearchInput(filters.search ?? '');
  }, [filters.search]);

  useEffect(() => {
    if (!selectedControl) {
      return;
    }

    if (!items.some((item) => item.id === selectedControl.id)) {
      setSelectedControl(null);
      closeDetail();
    }
  }, [closeDetail, items, selectedControl]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParamSignature]);

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const node = loadMoreRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !isFetchingNextPage) {
          observer.unobserve(entry.target);
          fetchNextPage();
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasMore, isFetchingNextPage, loadedCount]);

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
    });
  };

  const handleClearFilters = () => {
    const retained = new URLSearchParams();
    setSearchParams(retained, { replace: true });
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
              placeholder="e.g. AC-2, A.5.1, account management"
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
                {formatControlFamily(family.value)} ({family.count})
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
            {filters.family && <Badge colorScheme="teal">Family: {formatControlFamily(filters.family)}</Badge>}
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

      {!isLoading && !isError && total === 0 && (
        <Box borderWidth="1px" borderRadius="lg" p={6} textAlign="center">
          <Heading size="md" mb={2}>
            No controls match your filters
          </Heading>
          <Text color="gray.500">Try adjusting your search terms or clearing filters to see more results.</Text>
        </Box>
      )}

      {items.length > 0 && (
        <>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
            {items.map((control) => {
              const displayCode = (resolveClause(control.metadata) ?? control.id).toUpperCase();
              const clauseDomain = resolveDomain(control.metadata);
              return (
                <Box
                  key={control.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor={cardBorder}
                  bg={cardBg}
                  p={5}
                >
                  <Stack spacing={3}>
                    <HStack justify="space-between" align="start" spacing={3}>
                      <VStack align="start" spacing={1}>
                        <Heading size="sm">
                          {displayCode} — {control.title}
                        </Heading>
                        <Text color="gray.500">{formatControlFamily(control.family)}</Text>
                        {control.kind === 'enhancement' && control.parentId && (
                          <Badge colorScheme="cyan" variant="subtle">
                            Enhancement of {control.parentId.toUpperCase()}
                          </Badge>
                        )}
                        {clauseDomain && clauseDomain !== control.family && (
                          <Badge colorScheme="purple" variant="subtle">
                            {clauseDomain}
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
              );
            })}
          </SimpleGrid>

          <VStack align="stretch" spacing={3}>
            <Divider />
            <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
              <Text fontSize="sm" color="gray.500" aria-live="polite">
                Loaded {loadedCount.toLocaleString()} of {total.toLocaleString()} controls
              </Text>
              <HStack spacing={3}>
                {isFetchingNextPage ? (
                  <HStack spacing={2}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color="gray.500">
                      Loading more controls…
                    </Text>
                  </HStack>
                ) : hasMore ? (
                  <Button variant="outline" colorScheme="brand" size="sm" onClick={() => fetchNextPage()}>
                    Load more
                  </Button>
                ) : (
                  <Text fontSize="sm" color="gray.400">
                    All controls loaded
                  </Text>
                )}
              </HStack>
            </Flex>
            {hasMore && (
              <Box ref={loadMoreRef} height="1px" width="100%" aria-hidden="true" pointerEvents="none" />
            )}
          </VStack>
        </>
      )}

      <Drawer isOpen={isDetailOpen} placement="right" size="lg" onClose={handleCloseDetails}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {selectedControl ? (
              <VStack align="start" spacing={2}>
                <Heading size="md">
                  {(resolveClause(selectedControl.metadata) ?? selectedControl.id).toUpperCase()}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  {selectedControl.title}
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  <Badge colorScheme="blue">{formatControlFamily(selectedControl.family)}</Badge>
                  {resolveDomain(selectedControl.metadata) &&
                    resolveDomain(selectedControl.metadata) !== selectedControl.family && (
                    <Badge colorScheme="purple" variant="subtle">
                      {resolveDomain(selectedControl.metadata) as string}
                    </Badge>
                  )}
                </HStack>
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
                    <Badge colorScheme="blue">{formatControlFamily(selectedControl.family)}</Badge>
                    <Badge colorScheme="cyan">
                      {selectedControl.kind === 'enhancement' ? 'Enhancement control' : 'Base control'}
                    </Badge>
                    <Badge colorScheme="orange">
                      Priority: {selectedControl.priority} ({priorityLabels[selectedControl.priority]})
                    </Badge>
                    {resolveClause(selectedControl.metadata) && (
                      <Badge colorScheme="purple" variant="outline">
                        Clause {resolveClause(selectedControl.metadata)}
                      </Badge>
                    )}
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
