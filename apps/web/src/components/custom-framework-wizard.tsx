import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  VStack
} from '@chakra-ui/react';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BaselineLevel,
  CustomControlInput,
  FrameworkDetail,
  useCreateFrameworkMutation,
  useFrameworkDetail,
  usePublishFrameworkMutation,
  useUpdateFrameworkMutation,
  useUpsertControlsMutation
} from '../hooks/use-custom-frameworks';
import type { FrameworkSummary } from '../hooks/use-frameworks';
import useAuth from '../hooks/use-auth';

const STEPS = ['Framework Details', 'Controls', 'Review', 'Publish'];

const defaultDetails = {
  name: '',
  version: '',
  description: '',
  family: 'CUSTOM' as FrameworkDetail['family'],
  metadata: {} as Record<string, unknown>
};

const ALLOWED_CUSTOM_FAMILIES = ['NIST', 'CIS', 'PCI', 'CUSTOM'] as const;
type AllowedCustomFamily = (typeof ALLOWED_CUSTOM_FAMILIES)[number];

const toAllowedCustomFamily = (family: FrameworkDetail['family']): AllowedCustomFamily => {
  if (ALLOWED_CUSTOM_FAMILIES.some((allowed) => allowed === family)) {
    return family as AllowedCustomFamily;
  }
  return 'CUSTOM';
};

const defaultControl: CustomControlInput = {
  family: '',
  title: '',
  description: '',
  priority: 'P2',
  kind: 'base'
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

interface CustomFrameworkWizardProps {
  isOpen: boolean;
  onClose: () => void;
  framework?: FrameworkSummary;
}

const CustomFrameworkWizard = ({ isOpen, onClose, framework }: CustomFrameworkWizardProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [details, setDetails] = useState(defaultDetails);
  const [controls, setControls] = useState<CustomControlInput[]>([]);
  const [currentControl, setCurrentControl] = useState<CustomControlInput>(defaultControl);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [frameworkId, setFrameworkId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  const { data: existingDetail, isFetching: isLoadingDetail } = useFrameworkDetail(
    framework?.id
  );
  const createFramework = useCreateFrameworkMutation();
  const updateFramework = useUpdateFrameworkMutation();
  const upsertControls = useUpsertControlsMutation();
  const publishFramework = usePublishFrameworkMutation();

  const isEditingDraft = Boolean(framework?.id && framework?.status === 'DRAFT');
  const modalBg = useColorModeValue('white', 'gray.900');
  const tableHeaderBg = useColorModeValue('gray.100', 'gray.700');

  const buildMetadata = useCallback(
    (
      existing: Record<string, unknown> | null | undefined,
      wizardPatch: Record<string, unknown>
    ): Record<string, unknown> => {
      const next: Record<string, unknown> = { ...(existing ?? {}) };

      const owner = isRecord(next.owner)
        ? { ...(next.owner as Record<string, unknown>) }
        : {};
      if (user?.id) {
        owner.userId = user.id;
      }
      if (user?.email) {
        owner.email = user.email;
      }
      if (user?.organizationId) {
        owner.organizationId = user.organizationId;
      }
      next.owner = owner;

      const source = isRecord(next.source)
        ? { ...(next.source as Record<string, unknown>) }
        : {};
      source.type = 'wizard';
      next.source = source;

      const wizard = isRecord(next.wizard)
        ? { ...(next.wizard as Record<string, unknown>) }
        : {};
      Object.assign(wizard, wizardPatch);
      next.wizard = wizard;

      return next;
    },
    [user?.email, user?.id, user?.organizationId]
  );

  useEffect(() => {
    if (!isOpen) {
      resetWizard();
      return;
    }

    if (framework && existingDetail) {
      setFrameworkId(existingDetail.id);
      setDetails({
        name: existingDetail.name,
        version: existingDetail.version,
        description: existingDetail.description,
        family: existingDetail.family,
        metadata: existingDetail.metadata ?? {}
      });
      setControls(existingDetail.controls ?? []);
      setActiveStep(0);
    } else if (!framework) {
      resetWizard();
    }
  }, [framework, existingDetail, isOpen]);

  const canProceedFromDetails = useMemo(() => {
    return Boolean(
      details.name.trim() && details.version.trim() && details.description.trim() && details.family
    );
  }, [details]);

  const handleDetailChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFamilyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDetails((prev) => ({ ...prev, family: event.target.value as FrameworkDetail['family'] }));
  };

  const handleControlFieldChange = (key: keyof CustomControlInput, value: string | string[]) => {
    setCurrentControl((prev) => {
      if (key === 'baselines') {
        const list = Array.isArray(value) ? value : splitList(value);
        return {
          ...prev,
          baselines: toBaselineLevels(list)
        };
      }

      if (key === 'keywords' || key === 'references' || key === 'tags' || key === 'relatedControls') {
        const list = Array.isArray(value) ? value : splitList(value);
        return {
          ...prev,
          [key]: normalizeList(list)
        } as CustomControlInput;
      }

      if (key === 'priority') {
        return {
          ...prev,
          priority: value as CustomControlInput['priority']
        };
      }

      if (key === 'kind') {
        return {
          ...prev,
          kind: value as CustomControlInput['kind']
        };
      }

      return {
        ...prev,
        [key]: value
      } as CustomControlInput;
    });
  };

  const addOrUpdateControl = () => {
    if (!currentControl.family.trim() || !currentControl.title.trim() || !currentControl.description.trim()) {
      setErrorMessage('Family, title, and description are required for each control.');
      return;
    }

    const normalized: CustomControlInput = {
      ...currentControl,
      family: currentControl.family.trim(),
      title: currentControl.title.trim(),
      description: currentControl.description.trim(),
      priority: currentControl.priority,
      kind: currentControl.kind ?? 'base',
      baselines: currentControl.baselines && currentControl.baselines.length > 0 ? currentControl.baselines : undefined,
      keywords: normalizeList(currentControl.keywords),
      references: normalizeList(currentControl.references),
      relatedControls: normalizeList(currentControl.relatedControls),
      tags: normalizeList(currentControl.tags)
    };

    setControls((prev) => {
      if (editingIndex !== null) {
        const updated = [...prev];
        updated[editingIndex] = normalized;
        return updated;
      }
      return [...prev, normalized];
    });

    setCurrentControl(defaultControl);
    setEditingIndex(null);
    setErrorMessage(null);
  };

  const editControl = (index: number) => {
    setCurrentControl(controls[index]);
    setEditingIndex(index);
  };

  const removeControl = (index: number) => {
    setControls((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);

    try {
      const text = await file.text();
      let importedControls: CustomControlInput[] = [];

      if (file.name.endsWith('.json')) {
        importedControls = parseControlsFromJson(text);
      } else if (file.name.endsWith('.csv')) {
        importedControls = parseControlsFromCsv(text);
      } else {
        throw new Error('Unsupported file type. Please upload a CSV or JSON file.');
      }

      if (!importedControls.length) {
        throw new Error('No controls were detected in the import file.');
      }

      setControls(importedControls);
      toast({
        title: 'Controls imported',
        description: `Successfully imported ${importedControls.length} controls.`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to import controls.';
      setErrorMessage(message);
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleDetailsNext = async () => {
    if (!canProceedFromDetails) {
      setErrorMessage('Please complete all required framework fields.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const metadataPayload = buildMetadata(details.metadata, {
        step: 'controls'
      });

      if (frameworkId) {
        await updateFramework.mutateAsync({
          frameworkId,
          payload: {
            name: details.name.trim(),
            version: details.version.trim(),
            description: details.description.trim(),
            family: toAllowedCustomFamily(details.family),
            metadata: metadataPayload
          }
        });
      } else {
        const created = await createFramework.mutateAsync({
          name: details.name.trim(),
          version: details.version.trim(),
          description: details.description.trim(),
          family: toAllowedCustomFamily(details.family),
          metadata: metadataPayload
        });
        setFrameworkId(created.id);
      }

      setDetails((prev) => ({
        ...prev,
        metadata: metadataPayload
      }));
      setActiveStep(1);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save framework details.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleControlsNext = async () => {
    if (!frameworkId) {
      setErrorMessage('Create framework details before adding controls.');
      return;
    }

    if (!controls.length) {
      setErrorMessage('Add at least one control to continue.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await upsertControls.mutateAsync({
        frameworkId,
        payload: {
          controls
        }
      });

      setActiveStep(2);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save controls.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!frameworkId) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const metadataPayload = buildMetadata(details.metadata, {
        completedAt: new Date().toISOString()
      });

      await publishFramework.mutateAsync({
        frameworkId,
        payload: {
          metadata: metadataPayload
        }
      });
      toast({
        title: 'Framework published',
        description: `${details.name} is now available to your organization.`,
        status: 'success',
        duration: 6000,
        isClosable: true
      });
      setDetails((prev) => ({
        ...prev,
        metadata: metadataPayload
      }));
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to publish the framework. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetWizard = () => {
    setActiveStep(0);
    setDetails(defaultDetails);
    setControls([]);
    setCurrentControl(defaultControl);
    setEditingIndex(null);
    setFrameworkId(null);
    setErrorMessage(null);
  };

  const closeModal = () => {
    onClose();
    resetWizard();
  };

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={details.name} onChange={handleDetailChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Version</FormLabel>
            <Input name="version" value={details.version} onChange={handleDetailChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea name="description" value={details.description} onChange={handleDetailChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Framework Family</FormLabel>
            <Select value={details.family} onChange={handleFamilyChange}>
              <option value="NIST">NIST</option>
              <option value="CIS">CIS</option>
              <option value="PCI">PCI</option>
              <option value="CUSTOM">Custom</option>
            </Select>
          </FormControl>
        </Stack>
      );
    }

    if (activeStep === 1) {
      return (
        <Stack spacing={6}>
          <Box>
            <Text fontWeight="semibold" mb={2}>
              Add a control manually
            </Text>
            <Stack spacing={3}>
              <FormControl id="control-family" isRequired>
                <FormLabel>Control Family</FormLabel>
                <Input
                  value={currentControl.family}
                  onChange={(event) => handleControlFieldChange('family', event.target.value)}
                />
              </FormControl>
              <FormControl id="control-title" isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  data-testid="control-title-input"
                  value={currentControl.title}
                  onChange={(event) => handleControlFieldChange('title', event.target.value)}
                />
              </FormControl>
              <FormControl id="control-description" isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  data-testid="control-description-input"
                  value={currentControl.description}
                  onChange={(event) => handleControlFieldChange('description', event.target.value)}
                />
              </FormControl>
              <HStack spacing={3}>
                <FormControl id="control-priority">
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={currentControl.priority}
                    onChange={(event) =>
                      handleControlFieldChange('priority', event.target.value as CustomControlInput['priority'])
                    }
                  >
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                  </Select>
                </FormControl>
                <FormControl id="control-kind">
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={currentControl.kind ?? 'base'}
                    onChange={(event) =>
                      handleControlFieldChange('kind', (event.target.value || 'base') as string)
                    }
                  >
                    <option value="base">Base</option>
                    <option value="enhancement">Enhancement</option>
                  </Select>
                </FormControl>
              </HStack>
              <HStack spacing={3} align="start">
                <FormControl id="control-baselines">
                  <FormLabel>Baselines (comma separated)</FormLabel>
                  <Input
                    value={(currentControl.baselines ?? []).join(', ')}
                    onChange={(event) => handleControlFieldChange('baselines', splitList(event.target.value))}
                  />
                </FormControl>
                <FormControl id="control-keywords">
                  <FormLabel>Keywords</FormLabel>
                  <Input
                    value={(currentControl.keywords ?? []).join(', ')}
                    onChange={(event) => handleControlFieldChange('keywords', splitList(event.target.value))}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={3} align="start">
                <FormControl id="control-references">
                  <FormLabel>References</FormLabel>
                  <Input
                    value={(currentControl.references ?? []).join(', ')}
                    onChange={(event) => handleControlFieldChange('references', splitList(event.target.value))}
                  />
                </FormControl>
                <FormControl id="control-tags">
                  <FormLabel>Tags</FormLabel>
                  <Input
                    value={(currentControl.tags ?? []).join(', ')}
                    onChange={(event) => handleControlFieldChange('tags', splitList(event.target.value))}
                  />
                </FormControl>
              </HStack>
              <HStack spacing={3}>
                <Button colorScheme="brand" onClick={addOrUpdateControl}>
                  {editingIndex !== null ? 'Update Control' : 'Add Control'}
                </Button>
                {editingIndex !== null && (
                  <Button
                    onClick={() => {
                      setCurrentControl(defaultControl);
                      setEditingIndex(null);
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </HStack>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Text fontWeight="semibold" mb={2}>
              Import controls from CSV or JSON
            </Text>
            <Input type="file" accept=".csv,.json" onChange={handleFileImport} isDisabled={isImporting} />
            {isImporting && (
              <Text fontSize="sm" color="gray.500" mt={2}>
                Processing import...
              </Text>
            )}
          </Box>

          {controls.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={2}>
                {controls.length} controls in draft
              </Text>
              <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                <Table size="sm">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Family</Th>
                      <Th>Title</Th>
                      <Th>Priority</Th>
                      <Th>Type</Th>
                      <Th textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {controls.map((control, index) => (
                      <Tr key={`${control.title}-${index}`}>
                        <Td>{control.family}</Td>
                        <Td>{control.title}</Td>
                        <Td>{control.priority}</Td>
                        <Td>{(control.kind ?? 'base').toUpperCase()}</Td>
                        <Td>
                          <HStack justify="flex-end" spacing={2}>
                            <Button size="xs" variant="link" onClick={() => editControl(index)}>
                              Edit
                            </Button>
                            <Button size="xs" variant="link" colorScheme="red" onClick={() => removeControl(index)}>
                              Remove
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          )}
        </Stack>
      );
    }

    if (activeStep === 2) {
      return (
        <Stack spacing={4}>
          <Box>
            <Text fontWeight="bold">Framework Summary</Text>
            <Text>Name: {details.name}</Text>
            <Text>Version: {details.version}</Text>
            <Text>Family: {details.family}</Text>
            <Text>Description: {details.description}</Text>
          </Box>
          <Divider />
          <Box>
            <Text fontWeight="bold" mb={2}>
              Controls ({controls.length})
            </Text>
            <Box borderWidth="1px" borderRadius="md" maxH="240px" overflowY="auto">
              <Table size="sm">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>Family</Th>
                    <Th>Title</Th>
                    <Th>Priority</Th>
                    <Th>Baselines</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {controls.map((control, index) => (
                    <Tr key={`${control.title}-${index}`}>
                      <Td>{control.family}</Td>
                      <Td>{control.title}</Td>
                      <Td>{control.priority}</Td>
                      <Td>{(control.baselines ?? []).join(', ') || '—'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Stack>
      );
    }

    return (
      <Stack spacing={4}>
        <Text>
          Publishing your custom framework will make it available across catalog, crosswalk, and
          assessment workflows for your organization.
        </Text>
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            You can publish now or close the wizard to keep working on this draft later.
          </AlertDescription>
        </Alert>
      </Stack>
    );
  };

  return (
    <Modal size="4xl" isOpen={isOpen} onClose={closeModal} isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={modalBg}>
        <ModalHeader>
          {isEditingDraft ? `Edit Draft: ${framework?.name}` : 'Add Custom Framework'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4} mb={4}>
            <HStack spacing={3} align="center">
              {STEPS.map((label, index) => (
                <StepIndicator key={label} label={label} isActive={index === activeStep} isComplete={index < activeStep} />
              ))}
            </HStack>
            <Divider />
            {errorMessage && (
              <Alert status="error">
                <AlertIcon />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            {isLoadingDetail && isEditingDraft ? (
              <Text>Loading draft framework…</Text>
            ) : (
              renderStepContent()
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3} justify="space-between" w="100%">
            <Button variant="ghost" onClick={closeModal} isDisabled={isSaving}>
              Cancel
            </Button>
            <HStack spacing={3}>
              {activeStep > 0 && (
                <Button onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))} isDisabled={isSaving}>
                  Back
                </Button>
              )}
              {activeStep === 0 && (
                <Button colorScheme="brand" onClick={handleDetailsNext} isLoading={isSaving}>
                  Continue
                </Button>
              )}
              {activeStep === 1 && (
                <Button colorScheme="brand" onClick={handleControlsNext} isLoading={isSaving}>
                  Review Controls
                </Button>
              )}
              {activeStep === 2 && (
                <Button colorScheme="brand" onClick={() => setActiveStep(3)}>
                  Continue
                </Button>
              )}
              {activeStep === 3 && (
                <Button colorScheme="green" onClick={handlePublish} isLoading={isSaving}>
                  Publish Framework
                </Button>
              )}
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const StepIndicator = ({
  label,
  isActive,
  isComplete
}: {
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  const completeColor = useColorModeValue('green.500', 'green.300');

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      px={4}
      py={2}
      borderColor={isActive ? activeColor : borderColor}
      bg={isComplete ? completeColor : isActive ? activeColor : 'transparent'}
      color={isActive || isComplete ? 'white' : undefined}
      transition="all 0.2s"
    >
      <Text fontWeight={isActive ? 'bold' : 'medium'} fontSize="sm">
        {label}
      </Text>
    </Box>
  );
};

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const BASELINE_VALUES: BaselineLevel[] = ['low', 'moderate', 'high', 'privacy'];
const BASELINE_SET = new Set(BASELINE_VALUES);

const normalizeList = (value?: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const list = value
      .map((item) => (typeof item === 'string' ? item : String(item)))
      .map((item) => item.trim())
      .filter(Boolean);
    return list.length ? list : undefined;
  }
  if (typeof value === 'string') {
    const list = splitList(value);
    return list.length ? list : undefined;
  }
  return undefined;
};

const toBaselineLevels = (value?: string[] | string): BaselineLevel[] | undefined => {
  const list = normalizeList(value);
  if (!list?.length) {
    return undefined;
  }
  const normalized = list
    .map((entry) => entry.toLowerCase())
    .filter((entry): entry is BaselineLevel => BASELINE_SET.has(entry as BaselineLevel));
  return normalized.length ? normalized : undefined;
};

const parseControlsFromJson = (input: string): CustomControlInput[] => {
  const raw = JSON.parse(input);
  if (!Array.isArray(raw)) {
    throw new Error('JSON import must contain an array of controls.');
  }

      return raw.map((item) => ({
        family: String(item.family ?? ''),
        title: String(item.title ?? ''),
        description: String(item.description ?? ''),
        priority: (item.priority ?? 'P2') as CustomControlInput['priority'],
        kind: (item.kind ?? 'base') as CustomControlInput['kind'],
        parentId: item.parentId ?? undefined,
        baselines: toBaselineLevels(item.baselines) ?? undefined,
        keywords: normalizeList(item.keywords) ?? undefined,
        references: normalizeList(item.references) ?? undefined,
        relatedControls: normalizeList(item.relatedControls) ?? undefined,
        tags: normalizeList(item.tags) ?? undefined,
        metadata: typeof item.metadata === 'object' ? item.metadata : undefined
      }));
};

const parseControlsFromCsv = (input: string): CustomControlInput[] => {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(',').map((header) => header.trim().toLowerCase());

  const requiredColumns = ['family', 'title', 'description'];
  const missing = requiredColumns.filter((column) => !headers.includes(column));
  if (missing.length) {
    throw new Error(`CSV is missing required columns: ${missing.join(', ')}`);
  }

  return rows.map((row) => {
    const values = row.split(',').map((value) => value.trim());
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? '';
    });

    const priority = (record.priority ?? '').toUpperCase();
    const allowedPriorities: Array<CustomControlInput['priority']> = ['P0', 'P1', 'P2', 'P3'];

    return {
      family: record.family ?? '',
      title: record.title ?? '',
      description: record.description ?? '',
      priority: allowedPriorities.includes(priority as CustomControlInput['priority'])
        ? (priority as CustomControlInput['priority'])
        : 'P2',
      kind: (record.kind?.toLowerCase() === 'enhancement' ? 'enhancement' : 'base') as CustomControlInput['kind'],
      parentId: record.parentid || undefined,
      baselines: toBaselineLevels(record.baselines) ?? undefined,
      keywords: normalizeList(record.keywords) ?? undefined,
      references: normalizeList(record.references) ?? undefined,
      relatedControls: normalizeList(record.relatedcontrols) ?? undefined,
      tags: normalizeList(record.tags) ?? undefined
    };
  });
};

export default CustomFrameworkWizard;
