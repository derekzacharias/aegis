import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import type { AntivirusAutoReleaseStrategy } from '@compliance/shared';
import {
  AUTO_RELEASE_LABELS,
  useAntivirusSettings,
  useUpdateAntivirusSettings
} from '../../hooks/use-antivirus-settings';

const SecuritySettings = () => {
  const toast = useToast();
  const { data: antivirusSettings, isLoading: isAntivirusLoading } = useAntivirusSettings();
  const updateAntivirus = useUpdateAntivirusSettings();
  const [strategy, setStrategy] = useState<AntivirusAutoReleaseStrategy>('pending');

  useEffect(() => {
    if (antivirusSettings) {
      setStrategy(antivirusSettings.autoReleaseStrategy);
    }
  }, [antivirusSettings]);

  const isSavingAntivirus = updateAntivirus.isPending;
  const hasAntivirusChanged = useMemo(() => {
    if (!antivirusSettings) {
      return false;
    }
    return strategy !== antivirusSettings.autoReleaseStrategy;
  }, [antivirusSettings, strategy]);

  const lastUpdatedText = useMemo(() => {
    if (!antivirusSettings?.updatedAt) {
      return 'Not configured yet';
    }
    return new Date(antivirusSettings.updatedAt).toLocaleString();
  }, [antivirusSettings]);

  const handleAntivirusSave = async () => {
    try {
      const updated = await updateAntivirus.mutateAsync({
        autoReleaseStrategy: strategy
      });
      setStrategy(updated.autoReleaseStrategy);
      toast({
        title: 'Antivirus policy updated',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update antivirus policy';
      toast({
        title: 'Unable to update antivirus policy',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="md">Authentication & Access</Heading>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={5}>
        <GridItem borderWidth="1px" borderRadius="lg" p={5}>
          <Stack spacing={4}>
            <Heading size="sm">SSO Provider</Heading>
            <FormControl>
              <FormLabel>Metadata URL</FormLabel>
              <Input placeholder="https://idp.gov/saml/metadata" />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="enforce-sso" mb="0" fontWeight="semibold">
                Enforce SSO
              </FormLabel>
              <Switch id="enforce-sso" colorScheme="brand" />
            </FormControl>
            <Button colorScheme="brand">Save SSO Settings</Button>
          </Stack>
        </GridItem>
        <GridItem borderWidth="1px" borderRadius="lg" p={5}>
          <Stack spacing={4}>
            <Heading size="sm">Multi-factor Authentication</Heading>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="require-mfa" mb="0" fontWeight="semibold">
                Require MFA
              </FormLabel>
              <Switch id="require-mfa" colorScheme="brand" defaultChecked />
            </FormControl>
            <FormControl>
              <FormLabel>Timeout (hours)</FormLabel>
              <Input type="number" placeholder="12" />
            </FormControl>
            <Button colorScheme="brand">Update Policy</Button>
          </Stack>
        </GridItem>
      </Grid>

      <Heading size="md">Audit & Encryption</Heading>
      <Box borderWidth="1px" borderRadius="lg" p={5}>
        <Stack spacing={4}>
          <Text color="gray.400" fontSize="sm">
            Configure customer-managed encryption keys, audit log retention, and export controls to
            align with FedRAMP continuous monitoring requirements.
          </Text>
          <FormControl>
            <FormLabel>Customer-managed KMS ARN</FormLabel>
            <Input placeholder="arn:aws-us-gov:kms:region:account:key/uuid" />
          </FormControl>
          <FormControl>
            <FormLabel>Audit Log Retention (days)</FormLabel>
            <Input type="number" placeholder="365" />
          </FormControl>
          <Button colorScheme="brand">Apply Controls</Button>
        </Stack>
      </Box>

      <Heading size="md">Evidence Automation</Heading>
      <Box borderWidth="1px" borderRadius="lg" p={5}>
        <Stack spacing={4}>
          <Text color="gray.400" fontSize="sm">
            Control how quarantined evidence is released after a clean antivirus scan. Automatic
            releases notify reviewers in your configured evidence channel.
          </Text>
          <FormControl isDisabled={isAntivirusLoading || isSavingAntivirus}>
            <FormLabel>Auto-release strategy</FormLabel>
            <Select
              value={strategy}
              onChange={(event) => setStrategy(event.target.value as AntivirusAutoReleaseStrategy)}
            >
              {Object.entries(AUTO_RELEASE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <FormHelperText color="gray.400">
              Last updated: {lastUpdatedText}
            </FormHelperText>
          </FormControl>
          <Button
            colorScheme="brand"
            isDisabled={!hasAntivirusChanged}
            isLoading={isSavingAntivirus}
            onClick={handleAntivirusSave}
            alignSelf="flex-start"
          >
            Save Antivirus Policy
          </Button>
        </Stack>
      </Box>
    </VStack>
  );
};

export default SecuritySettings;
