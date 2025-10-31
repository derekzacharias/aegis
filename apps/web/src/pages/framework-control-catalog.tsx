import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
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
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import {
  ControlCatalogParams,
  ControlPriority,
  useControlCatalog
} from '../hooks/use-control-catalog';

const priorityLabels: Record<ControlPriority, string> = {
  P0: 'Foundational',
  P1: 'High',
  P2: 'Moderate',
  P3: 'Low'
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

  const { data, isLoading, isFetching, isError, error } = useControlCatalog(frameworkId, filters);
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  useEffect(() => {
    setSearchInput(filters.search ?? '');
  }, [filters.search]);

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

  const families = data?.facets.families ?? [];
  const types = data?.facets.types ?? [];
  const total = data?.total ?? 0;
  const currentFramework = data?.framework;
  const currentPage = filters.page ?? 1;
  const currentPageSize = filters.pageSize ?? 25;
  const startIndex = total === 0 ? 0 : (currentPage - 1) * currentPageSize + 1;
  const endIndex = data ? Math.min(total, currentPage * currentPageSize) : 0;

  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');

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

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
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
            {!filters.search && !filters.family && !filters.priority && !filters.type && (
              <Text fontSize="sm" color="gray.400">
                No additional filters applied
              </Text>
            )}
          </HStack>
        </FormControl>
      </SimpleGrid>

      {isLoading && (
        <HStack spacing={3}>
          <Spinner />
          <Text>Loading control catalog…</Text>
        </HStack>
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

      <VStack align="stretch" spacing={4}>
        {data?.items.map((control) => (
          <Box key={control.id} borderWidth="1px" borderRadius="lg" borderColor={cardBorder} p={5}>
            <Stack spacing={3}>
              <HStack justify="space-between" align="start">
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
              <Text>{control.description}</Text>
              {(control.baselines?.length ?? 0) > 0 && (
                <HStack spacing={2}>
                  <Text fontWeight="medium" fontSize="sm">
                    Baselines:
                  </Text>
                  {control.baselines?.map((baseline) => (
                    <Badge key={baseline} colorScheme="green">
                      {baseline.toUpperCase()}
                    </Badge>
                  ))}
                </HStack>
              )}
              {(control.keywords?.length ?? 0) > 0 && (
                <HStack spacing={2} wrap="wrap">
                  <Text fontWeight="medium" fontSize="sm">
                    Keywords:
                  </Text>
                  {control.keywords?.map((keyword) => (
                    <Badge key={keyword} variant="outline" colorScheme="gray">
                      {keyword}
                    </Badge>
                  ))}
                </HStack>
              )}
              {(control.references?.length ?? 0) > 0 && (
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" fontSize="sm">
                    References
                  </Text>
                  <Stack spacing={1}>
                    {control.references?.map((reference) => (
                      <Text key={reference} fontSize="sm" color="gray.500">
                        • {reference}
                      </Text>
                    ))}
                  </Stack>
                </VStack>
              )}
              {control.relatedControls && control.relatedControls.length > 0 && (
                <HStack spacing={2} wrap="wrap">
                  <Text fontWeight="medium" fontSize="sm">
                    Related:
                  </Text>
                  {control.relatedControls.map((related) => (
                    <Badge key={related} colorScheme="purple" variant="subtle">
                      {related.toUpperCase()}
                    </Badge>
                  ))}
                </HStack>
              )}
            </Stack>
          </Box>
        ))}
      </VStack>

      {data && data.total > 0 && (
        <VStack align="stretch" spacing={3}>
          <Divider />
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <Text fontSize="sm" color="gray.500">
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
    </VStack>
  );
};

export default FrameworkControlCatalogPage;
