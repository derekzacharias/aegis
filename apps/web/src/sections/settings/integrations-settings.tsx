import { AddIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Code,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Switch,
  Tag,
  Text,
  Tooltip,
  useToast,
  VStack
} from '@chakra-ui/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  IntegrationProvider,
  IntegrationSummary,
  OAuthInitiationResponse,
  useCompleteIntegrationOAuth,
  useConnectIntegration,
  useInitiateIntegrationOAuth,
  useIntegrations,
  useUpdateIntegrationMapping
} from '../../hooks/use-integrations';

type MappingEntry = {
  id: string;
  from: string;
  to: string;
};

type IntegrationFormState = Record<
  IntegrationProvider,
  { baseUrl: string; clientId: string; clientSecret: string; scopes: string }
>;

type MappingFormState = Record<
  IntegrationProvider,
  {
    projectKey: string;
    defaultIssueType: string;
    assessmentTagField: string;
    statusMapping: MappingEntry[];
    priorityMapping: MappingEntry[];
  }
>;

type OAuthFormState = Record<
  IntegrationProvider,
  {
    redirectUri: string;
    authorizationCode: string;
    initiation?: OAuthInitiationResponse | null;
  }
>;

const PROVIDERS: IntegrationProvider[] = ['JIRA', 'SERVICENOW'];

const defaultCredentials: IntegrationFormState = {
  JIRA: {
    baseUrl: 'https://your-domain.atlassian.net',
    clientId: '',
    clientSecret: '',
    scopes: 'read:jira-work write:jira-work'
  },
  SERVICENOW: {
    baseUrl: 'https://instance.service-now.com',
    clientId: '',
    clientSecret: '',
    scopes: 'ticket.read ticket.write'
  }
};

const defaultMapping: MappingFormState = {
  JIRA: {
    projectKey: 'FEDRAMP',
    defaultIssueType: 'Task',
    assessmentTagField: 'labels',
    statusMapping: [
      { id: 'todo', from: 'ToDo', to: 'backlog' },
      { id: 'progress', from: 'In Progress', to: 'in-progress' },
      { id: 'done', from: 'Done', to: 'complete' },
      { id: 'default', from: 'default', to: 'backlog' }
    ],
    priorityMapping: [
      { id: 'highest', from: 'Highest', to: 'critical' },
      { id: 'high', from: 'High', to: 'high' },
      { id: 'medium', from: 'Medium', to: 'medium' },
      { id: 'low', from: 'Low', to: 'low' },
      { id: 'default', from: 'default', to: 'medium' }
    ]
  },
  SERVICENOW: {
    projectKey: 'SN-SECOPS',
    defaultIssueType: 'incident',
    assessmentTagField: 'u_assessment_reference',
    statusMapping: [
      { id: 'new', from: 'New', to: 'backlog' },
      { id: 'progress', from: 'In Progress', to: 'in-progress' },
      { id: 'resolved', from: 'Resolved', to: 'complete' },
      { id: 'closed', from: 'Closed', to: 'complete' },
      { id: 'default', from: 'default', to: 'backlog' }
    ],
    priorityMapping: [
      { id: 'critical', from: 'Critical', to: 'critical' },
      { id: 'high', from: 'High', to: 'high' },
      { id: 'moderate', from: 'Moderate', to: 'medium' },
      { id: 'low', from: 'Low', to: 'low' },
      { id: 'default', from: 'default', to: 'medium' }
    ]
  }
};

const defaultOAuth: OAuthFormState = {
  JIRA: {
    redirectUri: 'https://app.local/oauth/jira',
    authorizationCode: ''
  },
  SERVICENOW: {
    redirectUri: 'https://app.local/oauth/servicenow',
    authorizationCode: ''
  }
};

const IntegrationsSettings = () => {
  const toast = useToast();
  const { data: integrations, isLoading } = useIntegrations();
  const connectMutation = useConnectIntegration();
  const updateMappingMutation = useUpdateIntegrationMapping();
  const initiateOAuthMutation = useInitiateIntegrationOAuth();
  const completeOAuthMutation = useCompleteIntegrationOAuth();

  const [formState, setFormState] = useState<IntegrationFormState>(defaultCredentials);
  const [mappingState, setMappingState] = useState<MappingFormState>(defaultMapping);
  const [oauthState, setOauthState] = useState<OAuthFormState>(defaultOAuth);

  useEffect(() => {
    if (!integrations) {
      return;
    }

    setFormState((prev) => {
      const next = { ...prev };
      integrations.forEach((integration) => {
        next[integration.provider] = {
          baseUrl: integration.baseUrl,
          clientId: integration.clientId,
          clientSecret: '',
          scopes: integration.oauth.scopes.join(' ')
        };
      });
      return next;
    });

    setMappingState(() => {
      const next: Partial<MappingFormState> = {};
      integrations.forEach((integration) => {
        next[integration.provider] = {
          projectKey: integration.mapping.projectKey ?? '',
          defaultIssueType: integration.mapping.defaultIssueType,
          assessmentTagField: integration.mapping.assessmentTagField ?? '',
          statusMapping: recordToEntries(integration.mapping.statusMapping),
          priorityMapping: recordToEntries(integration.mapping.priorityMapping)
        };
      });
      return { ...defaultMapping, ...next } as MappingFormState;
    });

    setOauthState((prev) => {
      const next = { ...prev };
      integrations.forEach((integration) => {
        next[integration.provider] = {
          redirectUri: prev[integration.provider]?.redirectUri ?? defaultOAuth[integration.provider].redirectUri,
          authorizationCode: '',
          initiation: undefined
        };
      });
      return next;
    });
  }, [integrations]);

  const integrationMap = useMemo(() => {
    const map = new Map<IntegrationProvider, IntegrationSummary>();
    integrations?.forEach((integration) => map.set(integration.provider, integration));
    return map;
  }, [integrations]);

  const statusBadge: Record<IntegrationSummary['status'], { label: string; color: string }> = {
    connected: { label: 'Connected', color: 'green' },
    pending: { label: 'Pending', color: 'yellow' },
    error: { label: 'Error', color: 'red' }
  };

  const handleCredentialsSubmit = async (
    event: FormEvent<HTMLFormElement>,
    provider: IntegrationProvider
  ) => {
    event.preventDefault();
    const payload = formState[provider];
    try {
      await connectMutation.mutateAsync({
        provider,
        baseUrl: payload.baseUrl,
        clientId: payload.clientId,
        clientSecret: payload.clientSecret,
        scopes: payload.scopes.split(/\s+/).filter(Boolean)
      });
      toast({
        title: `${provider} credentials saved`,
        description: 'Credentials stored and OAuth scopes updated.',
        status: 'success'
      });
      setFormState((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          clientSecret: ''
        }
      }));
    } catch (error) {
      toast({
        title: `Failed to connect ${provider}`,
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleMappingChange = (
    provider: IntegrationProvider,
    type: 'statusMapping' | 'priorityMapping',
    index: number,
    field: 'from' | 'to',
    value: string
  ) => {
    setMappingState((prev) => {
      const entries = [...prev[provider][type]];
      entries[index] = { ...entries[index], [field]: value };
      return {
        ...prev,
        [provider]: {
          ...prev[provider],
          [type]: entries
        }
      };
    });
  };

  const addMappingRow = (provider: IntegrationProvider, type: 'statusMapping' | 'priorityMapping') => {
    setMappingState((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [type]: [
          ...prev[provider][type],
          {
            id: `new-${Date.now()}`,
            from: '',
            to: ''
          }
        ]
      }
    }));
  };

  const removeMappingRow = (
    provider: IntegrationProvider,
    type: 'statusMapping' | 'priorityMapping',
    entry: MappingEntry
  ) => {
    if (entry.from === 'default') {
      toast({
        title: 'Cannot remove default mapping',
        description: 'Use the default row to control fallback behaviour.',
        status: 'warning'
      });
      return;
    }

    setMappingState((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [type]: prev[provider][type].filter((item) => item.id !== entry.id)
      }
    }));
  };

  const handleSaveMapping = async (provider: IntegrationProvider) => {
    const mapping = mappingState[provider];
    try {
      await updateMappingMutation.mutateAsync({
        provider,
        mapping: {
          projectKey: mapping.projectKey || null,
          defaultIssueType: mapping.defaultIssueType,
          assessmentTagField: mapping.assessmentTagField || null,
          statusMapping: entriesToRecord(mapping.statusMapping, provider === 'JIRA' ? 'backlog' : 'backlog'),
          priorityMapping: entriesToRecord(mapping.priorityMapping, 'medium')
        }
      });
      toast({
        title: `Mapping saved for ${provider}`,
        status: 'success'
      });
    } catch (error) {
      toast({
        title: `Failed to save mapping for ${provider}`,
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleCopy = async (value: string | null) => {
    if (!value) {
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      } else {
        throw new Error('clipboard unavailable');
      }
      toast({
        title: 'Copied to clipboard',
        status: 'success',
        duration: 1500
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: value,
        status: 'warning'
      });
    }
  };

  const handleInitiateOAuth = async (provider: IntegrationProvider) => {
    const scopes = formState[provider].scopes.split(/\s+/).filter(Boolean);
    const redirectUri = oauthState[provider].redirectUri;

    try {
      const response = await initiateOAuthMutation.mutateAsync({
        provider,
        redirectUri,
        scopes
      });
      setOauthState((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          initiation: response,
          authorizationCode: ''
        }
      }));
      toast({
        title: `OAuth started for ${provider}`,
        description: 'Open the authorization URL to complete the consent flow.',
        status: 'info'
      });
    } catch (error) {
      toast({
        title: `OAuth initiation failed for ${provider}`,
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleCompleteOAuth = async (provider: IntegrationProvider) => {
    const initiation = oauthState[provider].initiation;
    const code = oauthState[provider].authorizationCode;

    if (!initiation) {
      toast({
        title: 'Initiate OAuth first',
        description: 'Start the OAuth flow to obtain a state token.',
        status: 'warning'
      });
      return;
    }

    try {
      await completeOAuthMutation.mutateAsync({
        provider,
        state: initiation.state,
        code
      });
      toast({
        title: `${provider} authorized`,
        description: 'Tokens stored and ready for synchronization.',
        status: 'success'
      });
      setOauthState((prev) => ({
        ...prev,
        [provider]: {
          redirectUri: prev[provider].redirectUri,
          authorizationCode: '',
          initiation: undefined
        }
      }));
    } catch (error) {
      toast({
        title: `OAuth completion failed for ${provider}`,
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const renderMappingGrid = (
    provider: IntegrationProvider,
    entries: MappingEntry[],
    type: 'statusMapping' | 'priorityMapping'
  ) => (
    <Stack spacing={2}>
      {entries.map((entry, index) => (
        <HStack key={entry.id} spacing={3} align="flex-end">
          <FormControl flex="1">
            <FormLabel fontSize="xs" color="gray.400">
              External
            </FormLabel>
            <Input
              value={entry.from}
              placeholder="Status key"
              onChange={(event) =>
                handleMappingChange(provider, type, index, 'from', event.target.value)
              }
            />
          </FormControl>
          <FormControl flex="1">
            <FormLabel fontSize="xs" color="gray.400">
              Internal
            </FormLabel>
            <Input
              value={entry.to}
              placeholder="Internal value"
              onChange={(event) =>
                handleMappingChange(provider, type, index, 'to', event.target.value)
              }
            />
          </FormControl>
          <Tooltip label="Remove mapping">
            <IconButton
              aria-label="Remove mapping"
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              onClick={() => removeMappingRow(provider, type, entry)}
            />
          </Tooltip>
        </HStack>
      ))}
      <Button
        size="sm"
        alignSelf="flex-start"
        leftIcon={<AddIcon />}
        variant="outline"
        onClick={() => addMappingRow(provider, type)}
      >
        Add mapping
      </Button>
    </Stack>
  );

  const renderCard = (provider: IntegrationProvider, colorScheme: string) => {
    const integration = integrationMap.get(provider);
    const friendlyName = provider === 'JIRA' ? 'Jira' : 'ServiceNow';
    const status = integration ? statusBadge[integration.status] : null;
    const currentOAuth = integration?.oauth;
    const metrics = integration?.metrics;

    return (
      <Box flex="1" borderWidth="1px" borderRadius="lg" p={5}>
        <HStack justify="space-between" mb={4} align="start">
          <VStack align="start" spacing={0}>
            <Heading size="sm">{friendlyName}</Heading>
            {integration?.lastSyncedAt && (
              <Text fontSize="xs" color="gray.500">
                Last sync {new Date(integration.lastSyncedAt).toLocaleString()}
              </Text>
            )}
            {integration?.statusMessage && (
              <Text fontSize="xs" color="orange.300">
                {integration.statusMessage}
              </Text>
            )}
          </VStack>
          <Badge colorScheme={status?.color ?? colorScheme}>
            {status?.label ?? 'Not connected'}
          </Badge>
        </HStack>

        <form onSubmit={(event) => handleCredentialsSubmit(event, provider)}>
          <Stack spacing={4}>
            <Heading size="xs" textTransform="uppercase" color="gray.500">
              Credentials
            </Heading>
            <FormControl isRequired>
              <FormLabel>Base URL</FormLabel>
              <Input
                placeholder="https://"
                value={formState[provider].baseUrl}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    [provider]: {
                      ...prev[provider],
                      baseUrl: event.target.value
                    }
                  }))
                }
              />
              {integration && (
                <FormHelperText>
                  Connected to <strong>{integration.baseUrl}</strong>
                </FormHelperText>
              )}
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Client ID</FormLabel>
                <Input
                  placeholder="client-id"
                  value={formState[provider].clientId}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      [provider]: {
                        ...prev[provider],
                        clientId: event.target.value
                      }
                    }))
                  }
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Client Secret</FormLabel>
                <Input
                  placeholder="client-secret"
                  type="password"
                  value={formState[provider].clientSecret}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      [provider]: {
                        ...prev[provider],
                        clientSecret: event.target.value
                      }
                    }))
                  }
                />
              </FormControl>
            </SimpleGrid>
            <FormControl>
              <FormLabel>Requested Scopes</FormLabel>
              <Input
                placeholder="space separated scopes"
                value={formState[provider].scopes}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    [provider]: {
                      ...prev[provider],
                      scopes: event.target.value
                    }
                  }))
                }
              />
              {currentOAuth?.expiresAt && (
                <FormHelperText>
                  Access token expires{' '}
                  {currentOAuth.expiresAt ? new Date(currentOAuth.expiresAt).toLocaleString() : ''}
                </FormHelperText>
              )}
            </FormControl>
            {metrics && (
              <HStack spacing={3} fontSize="sm">
                <Tag colorScheme="blue">Projects mapped: {metrics.projectsMapped}</Tag>
                <Tag colorScheme="purple">Issues linked: {metrics.issuesLinked}</Tag>
              </HStack>
            )}
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={connectMutation.isPending}
              loadingText="Saving"
            >
              {integration ? 'Update Connection' : `Connect ${friendlyName}`}
            </Button>
          </Stack>
        </form>

        <Divider my={6} />

        <Stack spacing={4}>
          <Heading size="xs" textTransform="uppercase" color="gray.500">
            Webhook
          </Heading>
          <FormControl>
            <FormLabel>Webhook URL</FormLabel>
            <Input value={integration?.webhook.url ?? ''} isReadOnly />
          </FormControl>
          <FormControl>
            <FormLabel>Shared Secret</FormLabel>
            <HStack>
              <Input value={integration?.webhook.secret ?? ''} isReadOnly />
              <Button onClick={() => handleCopy(integration?.webhook.secret)}>Copy</Button>
            </HStack>
            <FormHelperText>
              Last delivery:{' '}
              {integration?.webhook.lastReceivedAt
                ? new Date(integration.webhook.lastReceivedAt).toLocaleString()
                : 'Never'}
            </FormHelperText>
          </FormControl>
        </Stack>

        <Divider my={6} />

        <Stack spacing={4}>
          <Heading size="xs" textTransform="uppercase" color="gray.500">
            OAuth Flow
          </Heading>
          <FormControl>
            <FormLabel>Redirect URI</FormLabel>
            <Input
              value={oauthState[provider].redirectUri}
              onChange={(event) =>
                setOauthState((prev) => ({
                  ...prev,
                  [provider]: {
                    ...prev[provider],
                    redirectUri: event.target.value
                  }
                }))
              }
            />
          </FormControl>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={() => handleInitiateOAuth(provider)}
              isLoading={initiateOAuthMutation.isPending}
            >
              Start OAuth
            </Button>
            {oauthState[provider].initiation && (
              <Button
                as="a"
                href={oauthState[provider].initiation?.authorizationUrl}
                target="_blank"
                rel="noreferrer"
                leftIcon={<ExternalLinkIcon />}
                variant="ghost"
              >
                Open authorization URL
              </Button>
            )}
          </HStack>
          {oauthState[provider].initiation && (
            <Box borderWidth="1px" borderRadius="md" p={3} fontSize="sm">
              <Text>Authorization URL:</Text>
              <Code display="block" whiteSpace="pre-wrap" mt={2}>
                {oauthState[provider].initiation?.authorizationUrl}
              </Code>
              <Text mt={2}>
                State token: <Code>{oauthState[provider].initiation?.state}</Code>
              </Text>
              <Text mt={1} color="gray.400">
                {oauthState[provider].initiation?.expiresAt
                  ? `Expires ${new Date(oauthState[provider].initiation?.expiresAt).toLocaleString()}`
                  : 'Pending authorization'}
              </Text>
            </Box>
          )}
          <FormControl>
            <FormLabel>Authorization Code</FormLabel>
            <Input
              value={oauthState[provider].authorizationCode}
              placeholder="Paste the code returned by the provider"
              onChange={(event) =>
                setOauthState((prev) => ({
                  ...prev,
                  [provider]: {
                    ...prev[provider],
                    authorizationCode: event.target.value
                  }
                }))
              }
            />
          </FormControl>
          <Button
            variant="solid"
            colorScheme="brand"
            onClick={() => handleCompleteOAuth(provider)}
            isLoading={completeOAuthMutation.isPending}
          >
            Complete OAuth
          </Button>
        </Stack>

        <Divider my={6} />

        <Stack spacing={4}>
          <Heading size="xs" textTransform="uppercase" color="gray.500">
            Mapping
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Project/Assignment</FormLabel>
              <Input
                value={mappingState[provider].projectKey}
                onChange={(event) =>
                  setMappingState((prev) => ({
                    ...prev,
                    [provider]: {
                      ...prev[provider],
                      projectKey: event.target.value
                    }
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Default Issue Type</FormLabel>
              <Input
                value={mappingState[provider].defaultIssueType}
                onChange={(event) =>
                  setMappingState((prev) => ({
                    ...prev,
                    [provider]: {
                      ...prev[provider],
                      defaultIssueType: event.target.value
                    }
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel>Assessment Tag Field</FormLabel>
            <Input
              value={mappingState[provider].assessmentTagField}
              onChange={(event) =>
                setMappingState((prev) => ({
                  ...prev,
                  [provider]: {
                    ...prev[provider],
                    assessmentTagField: event.target.value
                  }
                }))
              }
            />
          </FormControl>
          <Stack spacing={3}>
            <Heading size="xs" color="gray.400">
              Status Mapping
            </Heading>
            {renderMappingGrid(provider, mappingState[provider].statusMapping, 'statusMapping')}
          </Stack>
          <Stack spacing={3}>
            <Heading size="xs" color="gray.400">
              Priority Mapping
            </Heading>
            {renderMappingGrid(provider, mappingState[provider].priorityMapping, 'priorityMapping')}
          </Stack>
          <Button
            alignSelf="flex-start"
            variant="solid"
            colorScheme="brand"
            onClick={() => handleSaveMapping(provider)}
            isLoading={updateMappingMutation.isPending}
          >
            Save Mapping
          </Button>
        </Stack>
      </Box>
    );
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="md">Ticketing & Workflow</Heading>
      {isLoading && (
        <HStack spacing={2}>
          <Spinner size="sm" />
          <Text color="gray.400">Loading integration settings…</Text>
        </HStack>
      )}
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={6}
        align={{ base: 'stretch', md: 'flex-start' }}
      >
        {PROVIDERS.map((provider) =>
          renderCard(provider, provider === 'JIRA' ? 'green' : 'purple')
        )}
      </Stack>

      <Heading size="md">Automation Agents</Heading>
      <Box borderWidth="1px" borderRadius="lg" p={5}>
        <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" spacing={4}>
          <Box>
            <Heading size="sm">CIS Benchmark Agent</Heading>
            <Text color="gray.400" fontSize="sm">
              Deploy lightweight agent scripts to gather CIS compliance evidence from GovCloud
              workloads on a recurring cadence.
            </Text>
          </Box>
          <Stack spacing={2} align="flex-end">
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="cis-agent" mb="0" fontWeight="semibold">
                Enable
              </FormLabel>
              <Switch id="cis-agent" colorScheme="brand" defaultChecked />
            </FormControl>
            <Button
              as="a"
              href="/downloads/cis-benchmark-agent.tar.gz"
              download
              variant="outline"
              colorScheme="brand"
            >
              Download Agent Package
            </Button>
          </Stack>
        </Stack>
      </Box>
    </VStack>
  );
};

function recordToEntries(record: Record<string, string>): MappingEntry[] {
  return Object.entries(record).map(([from, to]) => ({
    id: `${from}-${to}`.toLowerCase(),
    from,
    to
  }));
}

function entriesToRecord(entries: MappingEntry[], fallback: string): Record<string, string> {
  const filtered = entries.filter((entry) => entry.from.trim().length > 0);
  const record = filtered.reduce<Record<string, string>>((acc, entry) => {
    acc[entry.from] = entry.to || fallback;
    return acc;
  }, {});

  if (!record.default) {
    record.default = fallback;
  }

  return record;
}

export default IntegrationsSettings;
