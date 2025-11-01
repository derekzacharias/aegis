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
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useFrameworks } from '../hooks/use-frameworks';
import {
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
  const [suggestionsOnly, setSuggestionsOnly] = useState(false);

  const targetFrameworkId = searchParams.get('targetFrameworkId') ?? undefined;
  const minConfidenceParam = searchParams.get('minConfidence');
  const minConfidence = minConfidenceParam ? Number.parseFloat(minConfidenceParam) : undefined;

  const filters: CrosswalkParams = useMemo(
    () => ({
      targetFrameworkId: targetFrameworkId || undefined,
      minConfidence:
        typeof minConfidence === 'number' && !Number.isNaN(minConfidence)
          ? minConfidence
          : undefined
    }),
    [targetFrameworkId, minConfidence]
  );

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

  const [confidenceDraft, setConfidenceDraft] = useState(
    filters.minConfidence ?? defaultMinConfidence
  );

  useEffect(() => {
    setConfidenceDraft(filters.minConfidence ?? defaultMinConfidence);
  }, [filters.minConfidence]);

  const { data, isLoading, isFetching, isError, error } = useCrosswalk(frameworkId, filters);
  const upsertMapping = useUpsertCrosswalkMapping(frameworkId);

  const matches = useMemo(() => {
    const all = data?.matches ?? [];
    return suggestionsOnly ? all.filter((match) => match.status === 'suggested') : all;
  }, [data?.matches, suggestionsOnly]);

  const updateSearchParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value && value.length > 0) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const handleTargetFrameworkChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateSearchParam('targetFrameworkId', event.target.value || null);
  };

  const handleConfidenceBlur = () => {
    const normalized = Number.isFinite(confidenceDraft)
      ? confidenceDraft
      : defaultMinConfidence;
    updateSearchParam('minConfidence', normalized.toFixed(2));
  };

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
  const suggestionsSwitchId = 'crosswalk-suggestions-only';

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

      <VStack align="stretch" spacing={2}>
        <Heading size="lg">Crosswalk Explorer</Heading>
        <Text color="gray.500">
          {currentFramework
            ? `Suggested mappings for ${currentFramework.name} (${currentFramework.version}).`
            : 'Review suggested cross-framework mappings and curate manual overrides.'}
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} alignItems="end">
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

        <FormControl display="flex" alignItems="center">
          <Switch
            id={suggestionsSwitchId}
            isChecked={suggestionsOnly}
            onChange={(event) => setSuggestionsOnly(event.target.checked)}
            mr={2}
          />
          <FormLabel htmlFor={suggestionsSwitchId} m={0}>
            Show suggestions only
          </FormLabel>
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
                matches.map((match) => (
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
                        {match.tags.map((tag) => (
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
                          match.evidenceHints.map((hint) => (
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
                        isDisabled={upsertMapping.isLoading}
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
      ) : null}

      <ManualMappingModal
        match={editingMatch}
        isOpen={disclosure.isOpen}
        onClose={() => {
          disclosure.onClose();
          setEditingMatch(null);
        }}
        onSubmit={handleManualSubmit}
        isSubmitting={upsertMapping.isLoading}
      />
    </VStack>
  );
};

export default FrameworkCrosswalkPage;
