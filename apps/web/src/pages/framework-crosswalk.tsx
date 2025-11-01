import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiDownload, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useFrameworks } from '../hooks/use-frameworks';
import {
  EvidenceReuseHint,
  CrosswalkMatch,
  CrosswalkParams,
  useCrosswalk
} from '../hooks/use-crosswalk';
import {
  EvidenceHintInput,
  UpsertCrosswalkPayload,
  useUpsertCrosswalkMapping
} from '../hooks/use-upsert-crosswalk-mapping';

type EvidenceHintDraft = EvidenceHintInput & { id?: string };

const defaultMinConfidence = 0.4;

const ManualMappingModal = ({
  match,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}: {
  match: CrosswalkMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: UpsertCrosswalkPayload) => void;
  isSubmitting: boolean;
}) => {
  const [confidence, setConfidence] = useState(0.9);
  const [rationale, setRationale] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [evidenceHints, setEvidenceHints] = useState<EvidenceHintDraft[]>([]);
  const hintBorderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (!match) {
      setConfidence(0.9);
      setRationale('');
      setTagsInput('');
      setEvidenceHints([]);
      return;
    }

    setConfidence(Number(match.confidence.toFixed(2)));
    setRationale(match.rationale ?? '');
    setTagsInput(match.tags.join(', '));
    setEvidenceHints(
      match.evidenceHints.length
        ? match.evidenceHints.map((hint) => ({
            id: hint.id,
            summary: hint.summary,
            rationale: hint.rationale,
            evidenceId: hint.evidenceId,
            score: hint.score
          }))
        : []
    );
  }, [match]);

  if (!match) {
    return null;
  }

  const handleSubmit = () => {
    const normalizedTags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag, index, all) => tag.length > 0 && all.indexOf(tag) === index);

    const preparedHints = evidenceHints
      .map((hint) => ({
        evidenceId: hint.evidenceId || undefined,
        summary: hint.summary.trim(),
        rationale: hint.rationale?.trim() || undefined,
        score:
          typeof hint.score === 'number' && !Number.isNaN(hint.score)
            ? Math.min(Math.max(hint.score, 0), 1)
            : undefined
      }))
      .filter((hint) => hint.summary.length > 0);

    onSubmit({
      sourceControlId: match.source.id,
      targetControlId: match.target.id,
      confidence: Number.isNaN(confidence) ? undefined : confidence,
      rationale: rationale.trim() || undefined,
      tags: normalizedTags,
      evidenceHints: preparedHints
    });
  };

  const updateEvidenceHint = (index: number, updated: Partial<EvidenceHintDraft>) => {
    setEvidenceHints((prev) =>
      prev.map((hint, idx) => (idx === index ? { ...hint, ...updated } : hint))
    );
  };

  const removeEvidenceHint = (index: number) => {
    setEvidenceHints((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addEvidenceHint = () => {
    setEvidenceHints((prev) => [...prev, { summary: '', score: 0.75 }]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manual Crosswalk Mapping</ModalHeader>
        <ModalCloseButton disabled={isSubmitting} />
        <ModalBody>
          <Stack spacing={4}>
            <Box>
              <Text fontWeight="semibold">Source Control</Text>
              <Text fontSize="sm" color="gray.500">
                {match.source.id} · {match.source.title}
              </Text>
            </Box>
            <Box>
              <Text fontWeight="semibold">Target Control</Text>
              <Text fontSize="sm" color="gray.500">
                {match.target.id} · {match.target.title}
              </Text>
            </Box>

            <FormControl>
              <FormLabel>Confidence (0 - 1)</FormLabel>
              <NumberInput
                value={confidence}
                min={0}
                max={1}
                step={0.05}
                precision={2}
                onChange={(_, valueAsNumber) => setConfidence(valueAsNumber)}
              >
                <NumberInputField />
              </NumberInput>
              <FormHelperText>Use a higher confidence for well-substantiated mappings.</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Rationale</FormLabel>
              <Textarea
                placeholder="Explain why these controls align or how the mapping should be used."
                value={rationale}
                onChange={(event) => setRationale(event.target.value)}
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tags</FormLabel>
                <Textarea
                  placeholder="Comma-separated keywords (e.g. identity, mfa, audit)"
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.target.value)}
                  rows={2}
                />
              <FormHelperText>Tags help analysts filter and reuse mappings in future crosswalks.</FormHelperText>
            </FormControl>

            <Stack spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Evidence Hints</Text>
                <Button
                  size="sm"
                  leftIcon={<Icon as={FiPlus} />}
                  variant="ghost"
                  onClick={addEvidenceHint}
                  isDisabled={evidenceHints.length >= 5}
                >
                  Add Hint
                </Button>
              </HStack>
              {evidenceHints.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  Provide optional evidence summaries that support reuse across frameworks.
                </Text>
              ) : null}
              {evidenceHints.map((hint, index) => (
                <Box
                  key={hint.id ?? `hint-${index}`}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={hintBorderColor}
                  p={3}
                >
                  <Stack spacing={2}>
                    <FormControl>
                      <FormLabel fontSize="sm">Summary</FormLabel>
                      <Textarea
                        value={hint.summary}
                        onChange={(event) =>
                          updateEvidenceHint(index, { summary: event.target.value })
                        }
                        rows={2}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Rationale (optional)</FormLabel>
                      <Textarea
                        value={hint.rationale ?? ''}
                        onChange={(event) =>
                          updateEvidenceHint(index, { rationale: event.target.value })
                        }
                        rows={2}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Confidence Score (0 - 1)</FormLabel>
                      <NumberInput
                        value={hint.score ?? 0.75}
                        min={0}
                        max={1}
                        step={0.05}
                        precision={2}
                        onChange={(_, valueAsNumber) =>
                          updateEvidenceHint(index, { score: valueAsNumber })
                        }
                      >
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                    <HStack justify="flex-end">
                      <IconButton
                        aria-label="Remove evidence hint"
                        icon={<Icon as={FiTrash2} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeEvidenceHint(index)}
                      />
                    </HStack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button colorScheme="brand" onClick={handleSubmit} isLoading={isSubmitting}>
            Save Mapping
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const FrameworkCrosswalkPage = () => {
  const navigate = useNavigate();
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const disclosure = useDisclosure();
  const [editingMatch, setEditingMatch] = useState<CrosswalkMatch | null>(null);

  const targetFrameworkId = searchParams.get('targetFrameworkId') ?? undefined;
  const minConfidenceParam = searchParams.get('minConfidence');
  const statusParam = searchParams.get('status');
  const rawSearchParam = searchParams.get('search') ?? '';
  const pageParam = searchParams.get('page');
  const pageSizeParam = searchParams.get('pageSize');

  const parsedMinConfidence = minConfidenceParam ? Number.parseFloat(minConfidenceParam) : undefined;
  const normalizedMinConfidence =
    typeof parsedMinConfidence === 'number' && !Number.isNaN(parsedMinConfidence)
      ? Math.min(Math.max(parsedMinConfidence, 0), 1)
      : undefined;

  const matchStatus: CrosswalkParams['status'] =
    statusParam === 'mapped' || statusParam === 'suggested' ? statusParam : 'all';

  const normalizedSearchValue = rawSearchParam.trim();

  const parsedPage = pageParam ? Number.parseInt(pageParam, 10) : NaN;
  const parsedPageSize = pageSizeParam ? Number.parseInt(pageSizeParam, 10) : NaN;
  const sanitizedPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const sanitizedPageSize = Number.isNaN(parsedPageSize) || parsedPageSize < 1 ? 25 : parsedPageSize;

  const [searchDraft, setSearchDraft] = useState<string>(rawSearchParam);

  useEffect(() => {
    setSearchDraft(rawSearchParam);
  }, [rawSearchParam]);

  const filters: CrosswalkParams = useMemo(
    () => ({
      targetFrameworkId: targetFrameworkId || undefined,
      minConfidence: normalizedMinConfidence ?? defaultMinConfidence,
      search: normalizedSearchValue ? normalizedSearchValue : undefined,
      status: matchStatus,
      page: sanitizedPage,
      pageSize: sanitizedPageSize
    }),
    [
      targetFrameworkId,
      normalizedMinConfidence,
      normalizedSearchValue,
      matchStatus,
      sanitizedPage,
      sanitizedPageSize
    ]
  );

  const setParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams);
      mutator(next);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const normalizedDraft = searchDraft.trim();

    if (normalizedDraft === normalizedSearchValue) {
      return;
    }

    const handle = window.setTimeout(() => {
      setParams((next) => {
        if (normalizedDraft) {
          next.set('search', normalizedDraft);
        } else {
          next.delete('search');
        }
        next.delete('page');
      });
    }, 300);

    return () => {
      window.clearTimeout(handle);
    };
  }, [searchDraft, normalizedSearchValue, setParams]);

  const { data: frameworks } = useFrameworks();
  const currentFramework = useMemo(
    () => frameworks?.find((item) => item.id === frameworkId),
    [frameworkId, frameworks]
  );

  const availableTargets = useMemo(() => {
    if (!frameworks || !frameworkId) {
      return [];
    }
    return frameworks.filter((fw) => fw.id !== frameworkId);
  }, [frameworkId, frameworks]);

  const minConfidenceValue = filters.minConfidence ?? defaultMinConfidence;
  const [confidenceDraft, setConfidenceDraft] = useState<number>(minConfidenceValue);

  useEffect(() => {
    setConfidenceDraft(minConfidenceValue);
  }, [minConfidenceValue]);

  const { data, isLoading, isFetching, isError, error } = useCrosswalk(frameworkId, filters);
  const upsertMapping = useUpsertCrosswalkMapping(frameworkId);

  const matches: CrosswalkMatch[] = data?.matches ?? [];

  const handleTargetFrameworkChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setParams((next) => {
      if (value) {
        next.set('targetFrameworkId', value);
      } else {
        next.delete('targetFrameworkId');
      }
      next.delete('page');
    });
  };

  const handleConfidenceBlur = () => {
    const normalized = Number.isFinite(confidenceDraft)
      ? confidenceDraft
      : defaultMinConfidence;
    const clamped = Math.min(Math.max(normalized, 0), 1);
    setConfidenceDraft(clamped);
    setParams((next) => {
      if (clamped === defaultMinConfidence) {
        next.delete('minConfidence');
      } else {
        next.set('minConfidence', clamped.toFixed(2));
      }
      next.delete('page');
    });
  };

  const handleMatchTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as 'all' | 'mapped' | 'suggested';
    setParams((next) => {
      if (value === 'all') {
        next.delete('status');
      } else {
        next.set('status', value);
      }
      next.delete('page');
    });
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const parsed = Number.parseInt(event.target.value, 10);
    const normalized = Number.isNaN(parsed) || parsed < 1 ? 25 : parsed;
    setParams((next) => {
      next.set('pageSize', normalized.toString());
      next.delete('page');
    });
  };

  const appliedPage = data?.page ?? sanitizedPage;
  const appliedPageSize = data?.pageSize ?? sanitizedPageSize;
  const totalMatches = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalMatches / appliedPageSize));
  const canGoPrevious = appliedPage > 1;
  const canGoNext = data ? data.hasNextPage : appliedPage < totalPages;

  const goToPrevious = () => {
    if (!canGoPrevious) {
      return;
    }
    const nextPage = appliedPage - 1;
    setParams((next) => {
      if (nextPage <= 1) {
        next.delete('page');
      } else {
        next.set('page', nextPage.toString());
      }
    });
  };

  const goToNext = () => {
    if (!canGoNext) {
      return;
    }
    const nextPage = appliedPage + 1;
    setParams((next) => {
      next.set('page', nextPage.toString());
    });
  };

  const firstItemIndex =
    totalMatches === 0 ? 0 : (appliedPage - 1) * appliedPageSize + 1;
  const lastItemIndex =
    totalMatches === 0 ? 0 : firstItemIndex + matches.length - 1;

  const handleExport = useCallback(
    (format: 'csv' | 'json') => {
      if (!data || typeof window === 'undefined') {
        return;
      }

      const exportMatches = data.matches;
      const timestamp = (() => {
        const generated = new Date(data.generatedAt);
        return Number.isNaN(generated.getTime())
          ? new Date().toISOString()
          : generated.toISOString();
      })();
      const dateStamp = timestamp.split('T')[0];
      const filenameBase = `crosswalk-${data.frameworkId}-${dateStamp}`;

      if (format === 'json') {
        const payload = {
          frameworkId: data.frameworkId,
          generatedAt: data.generatedAt,
          filters: data.filters,
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          matches: exportMatches
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${filenameBase}.json`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }

      const escapeCsv = (value: string) =>
        `"${value.replace(/"/g, '""')}"`;

      const header = [
        'Source Control',
        'Source Title',
        'Target Control',
        'Target Title',
        'Confidence',
        'Origin',
        'Status',
        'Tags',
        'Rationale',
        'Evidence Hints'
      ];

      const rows = exportMatches.map((match: CrosswalkMatch) => {
        const evidence = match.evidenceHints
          .map(
            (hint: EvidenceReuseHint) =>
              `${hint.summary} (${Math.round(hint.score * 100)}%)${
                hint.rationale ? ` - ${hint.rationale}` : ''
              }`
          )
          .join(' | ');

        return [
          match.source.id,
          match.source.title,
          match.target.id,
          match.target.title,
          match.confidence.toFixed(2),
          match.origin,
          match.status,
          match.tags.join('|'),
          match.rationale ?? '',
          evidence
        ]
          .map((value) => escapeCsv(String(value ?? '')))
          .join(',');
      });

      const csvContent = [header.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${filenameBase}.csv`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    [data]
  );

  const exportDisabled = !data || data.total === 0;

  const openManualModal = (match: CrosswalkMatch) => {
    setEditingMatch(match);
    disclosure.onOpen();
  };

  const handleManualSubmit = (payload: UpsertCrosswalkPayload) => {
    upsertMapping.mutate(payload, {
      onSuccess: () => {
        toast({
          title: 'Crosswalk updated',
          description: 'Mapping saved successfully.',
          status: 'success',
          duration: 4000,
          isClosable: true
        });
        disclosure.onClose();
        setEditingMatch(null);
      },
      onError: (mutationError: unknown) => {
        toast({
          title: 'Unable to save mapping',
          description:
            mutationError instanceof Error
              ? mutationError.message
              : 'Unexpected error while saving the mapping.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    });
  };

  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const tableStriped = useColorModeValue('gray.50', 'gray.800');
  const suggestionBg = useColorModeValue('yellow.50', 'gray.900');

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        {isFetching && !isLoading ? (
          <HStack spacing={2}>
            <Spinner size="sm" />
            <Text fontSize="sm" color="gray.500">
              Refreshing suggestions…
            </Text>
          </HStack>
        ) : null}
      </HStack>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        spacing={3}
      >
        <VStack align="flex-start" spacing={1}>
          <Heading size="lg">Crosswalk Explorer</Heading>
          <Text color="gray.500">
            {currentFramework
              ? `Suggested mappings for ${currentFramework.name} (${currentFramework.version}).`
              : 'Review suggested cross-framework mappings and curate manual overrides.'}
          </Text>
        </VStack>
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<Icon as={FiDownload} />}
            colorScheme="brand"
            variant="outline"
            isDisabled={exportDisabled}
          >
            Export
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleExport('csv')} isDisabled={exportDisabled}>
              Download CSV
            </MenuItem>
            <MenuItem onClick={() => handleExport('json')} isDisabled={exportDisabled}>
              Download JSON
            </MenuItem>
          </MenuList>
        </Menu>
      </Stack>

      <FormControl>
        <FormLabel>Search Mappings</FormLabel>
        <Input
          placeholder="Search by control ID, title, tags, or rationale…"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
        />
        <FormHelperText>
          Search applies to both source and target controls as well as mapping tags.
        </FormHelperText>
      </FormControl>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4} alignItems="end">
        <FormControl>
          <FormLabel>Target Framework</FormLabel>
          <Select value={targetFrameworkId ?? ''} onChange={handleTargetFrameworkChange}>
            <option value="">All frameworks</option>
            {availableTargets.map((framework) => (
              <option key={framework.id} value={framework.id}>
                {framework.name} ({framework.version})
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Minimum Confidence</FormLabel>
          <NumberInput
            value={Number.isFinite(confidenceDraft) ? confidenceDraft : ''}
            min={0}
            max={1}
            step={0.05}
            precision={2}
            onChange={(_, valueAsNumber) =>
              setConfidenceDraft(Number.isNaN(valueAsNumber) ? 0 : valueAsNumber)
            }
            onBlur={handleConfidenceBlur}
          >
            <NumberInputField />
          </NumberInput>
          <FormHelperText>Set a floor for suggested mapping similarity scores.</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Match Type</FormLabel>
          <Select value={matchStatus} onChange={handleMatchTypeChange}>
            <option value="all">All matches</option>
            <option value="mapped">Mapped only</option>
            <option value="suggested">Suggestions only</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Results Per Page</FormLabel>
          <Select value={appliedPageSize.toString()} onChange={handlePageSizeChange}>
            {[10, 25, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </Select>
        </FormControl>
      </SimpleGrid>

      {isLoading ? (
        <HStack spacing={3}>
          <Spinner />
          <Text>Loading crosswalk recommendations…</Text>
        </HStack>
      ) : null}

      {isError ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Unable to load crosswalk data</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : 'Unexpected error retrieving crosswalk suggestions.'}
            </AlertDescription>
          </Box>
        </Alert>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <Box borderWidth="1px" borderRadius="lg" borderColor={cardBorder} overflow="hidden">
            <Table size="sm" variant="simple">
              <Thead bg={tableStriped}>
                <Tr>
                  <Th>Source Control</Th>
                  <Th>Target Control</Th>
                  <Th>Confidence</Th>
                  <Th>Origin</Th>
                  <Th>Tags</Th>
                  <Th>Evidence</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {matches.length === 0 ? (
                  <Tr>
                    <Td colSpan={7}>
                      <Text fontSize="sm" color="gray.500">
                        No crosswalk matches found for the selected filters.
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                matches.map((match: CrosswalkMatch) => (
                    <Tr key={match.id} bg={match.status === 'suggested' ? suggestionBg : undefined}>
                      <Td>
                        <Stack spacing={1}>
                          <Text fontWeight="semibold">{match.source.id}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {match.source.title}
                          </Text>
                          <Badge variant="subtle" width="fit-content">
                            {match.source.family}
                          </Badge>
                        </Stack>
                      </Td>
                      <Td>
                        <Stack spacing={1}>
                          <Text fontWeight="semibold">{match.target.id}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {match.target.title}
                          </Text>
                          <Badge variant="subtle" width="fit-content">
                            {match.target.family}
                          </Badge>
                        </Stack>
                      </Td>
                      <Td>
                        <Stack spacing={1}>
                          <Text fontWeight="semibold">{Math.round(match.confidence * 100)}%</Text>
                          {match.similarityBreakdown?.matchedTerms?.length ? (
                            <Text fontSize="xs" color="gray.500">
                              Keywords: {match.similarityBreakdown.matchedTerms.join(', ')}
                            </Text>
                          ) : null}
                        </Stack>
                      </Td>
                      <Td>
                        <Stack spacing={1}>
                          <Badge colorScheme={match.status === 'suggested' ? 'yellow' : 'green'}>
                            {match.status === 'suggested' ? 'Suggested' : 'Mapped'}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            Origin: {match.origin}
                          </Text>
                        </Stack>
                      </Td>
                      <Td>
                        <HStack spacing={1} flexWrap="wrap">
                        {match.tags.map((tag: string) => (
                            <Badge key={tag} colorScheme="purple" variant="subtle">
                              {tag}
                            </Badge>
                          ))}
                          {match.tags.length === 0 ? (
                            <Text fontSize="xs" color="gray.400">
                              —
                            </Text>
                          ) : null}
                        </HStack>
                      </Td>
                      <Td>
                        <Stack spacing={1}>
                        {match.evidenceHints.length ? (
                          match.evidenceHints.map((hint: EvidenceReuseHint) => (
                              <Box key={hint.id}>
                                <Text fontSize="sm">{hint.summary}</Text>
                                <Text fontSize="xs" color="gray.500">
                                  Score: {Math.round(hint.score * 100)}%
                                  {hint.rationale ? ` · ${hint.rationale}` : ''}
                                </Text>
                              </Box>
                            ))
                          ) : (
                            <Text fontSize="xs" color="gray.400">
                              None provided
                            </Text>
                          )}
                        </Stack>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme={match.status === 'suggested' ? 'brand' : 'gray'}
                          onClick={() => openManualModal(match)}
                        isDisabled={upsertMapping.isPending}
                        >
                          {match.status === 'suggested' ? 'Review & save' : 'Edit mapping'}
                        </Button>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
          <HStack justify="space-between" align={{ base: 'flex-start', md: 'center' }} spacing={3}>
            <Text fontSize="sm" color="gray.500">
              {totalMatches === 0
                ? 'No matches to display.'
                : `Showing ${firstItemIndex}-${lastItemIndex} of ${totalMatches} matches`}
            </Text>
            <HStack spacing={2}>
              <Button size="sm" onClick={goToPrevious} isDisabled={!canGoPrevious}>
                Previous
              </Button>
              <Text fontSize="sm" color="gray.500">
                Page {appliedPage} of {totalPages}
              </Text>
              <Button size="sm" onClick={goToNext} isDisabled={!canGoNext}>
                Next
              </Button>
            </HStack>
          </HStack>
        </>
      ) : null}

      <ManualMappingModal
        match={editingMatch}
        isOpen={disclosure.isOpen}
        onClose={() => {
          disclosure.onClose();
          setEditingMatch(null);
        }}
        onSubmit={handleManualSubmit}
        isSubmitting={upsertMapping.isPending}
      />
    </VStack>
  );
};

export default FrameworkCrosswalkPage;
