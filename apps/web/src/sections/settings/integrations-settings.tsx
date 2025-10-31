import {
  Badge,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spinner,
  Stack,
  Switch,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { FormEvent, useMemo, useState } from 'react';
import {
  IntegrationProvider,
  useConnectIntegration,
  useIntegrations
} from '../../hooks/use-integrations';

type IntegrationFormState = Record<
  IntegrationProvider,
  { baseUrl: string; clientId: string; clientSecret: string }
>;

const defaultState: IntegrationFormState = {
  JIRA: {
    baseUrl: 'https://your-domain.atlassian.net',
    clientId: '',
    clientSecret: ''
  },
  SERVICENOW: {
    baseUrl: 'https://instance.service-now.com',
    clientId: '',
    clientSecret: ''
  }
};

const IntegrationsSettings = () => {
  const toast = useToast();
  const { data: integrations, isLoading } = useIntegrations();
  const connectMutation = useConnectIntegration();
  const [formState, setFormState] = useState<IntegrationFormState>(defaultState);

  const integrationMap = useMemo(() => {
    const map = new Map<IntegrationProvider, typeof integrations[number]>();
    integrations?.forEach((integration) => map.set(integration.provider, integration));
    return map;
  }, [integrations]);

  const handleSubmit = async (
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
        clientSecret: payload.clientSecret
      });
      toast({
        title: `${provider} connected`,
        description: 'Credentials saved and integration queue initialized.',
        status: 'success'
      });
    } catch (error) {
      toast({
        title: `Failed to connect ${provider}`,
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const renderCard = (provider: IntegrationProvider, colorScheme: string) => {
    const integration = integrationMap.get(provider);
    const friendlyName = provider === 'JIRA' ? 'Jira' : 'ServiceNow';
    return (
      <Box flex="1" borderWidth="1px" borderRadius="lg" p={5}>
        <HStack justify="space-between" mb={4} align="start">
          <Heading size="sm">{friendlyName}</Heading>
          <Badge colorScheme={colorScheme}>
            {integration ? 'Connected' : 'Not connected'}
          </Badge>
        </HStack>
        <form onSubmit={(event) => handleSubmit(event, provider)}>
          <Stack spacing={4}>
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
      </Box>
    );
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="md">Ticketing & Workflow</Heading>
      {isLoading && (
        <HStack spacing={2}>
          <Spinner size="sm" />
          <Text color="gray.400">Loading existing integration settings…</Text>
        </HStack>
      )}
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={6}
        align={{ base: 'stretch', md: 'flex-start' }}
      >
        {renderCard('JIRA', 'green')}
        {renderCard('SERVICENOW', 'purple')}
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
            <Button variant="outline" colorScheme="brand">
              Download Agent Package
            </Button>
          </Stack>
        </Stack>
      </Box>
    </VStack>
  );
};

export default IntegrationsSettings;
