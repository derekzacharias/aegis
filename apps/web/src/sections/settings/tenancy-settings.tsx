import {
  Badge,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'tenancy.settings';

interface TenantProfileState {
  organizationName: string;
  impactLevel: string;
  primaryContact: string;
}

interface DeploymentPreferencesState {
  multiTenant: boolean;
}

const DEFAULT_PROFILE: TenantProfileState = {
  organizationName: '',
  impactLevel: '',
  primaryContact: ''
};

const DEFAULT_DEPLOYMENT: DeploymentPreferencesState = {
  multiTenant: true
};

type StoredSettings = {
  profile: TenantProfileState;
  deployment: DeploymentPreferencesState;
};

const loadSettings = (): StoredSettings => {
  if (typeof window === 'undefined') {
    return { profile: DEFAULT_PROFILE, deployment: DEFAULT_DEPLOYMENT };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { profile: DEFAULT_PROFILE, deployment: DEFAULT_DEPLOYMENT };
  }

  try {
    const parsed = JSON.parse(raw) as StoredSettings;
    return {
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
      deployment: { ...DEFAULT_DEPLOYMENT, ...(parsed.deployment ?? {}) }
    };
  } catch {
    return { profile: DEFAULT_PROFILE, deployment: DEFAULT_DEPLOYMENT };
  }
};

const persistSettings = (settings: StoredSettings) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const TenancySettings = () => {
  const toast = useToast();
  const initialSettingsRef = useRef<StoredSettings | null>(null);
  const [profile, setProfile] = useState<TenantProfileState>(DEFAULT_PROFILE);
  const [deployment, setDeployment] = useState<DeploymentPreferencesState>(DEFAULT_DEPLOYMENT);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingDeployment, setIsSavingDeployment] = useState(false);

  useEffect(() => {
    const stored = loadSettings();
    initialSettingsRef.current = stored;
    setProfile(stored.profile);
    setDeployment(stored.deployment);
  }, []);

  const hasProfileChanged = useMemo(() => {
    const initial = initialSettingsRef.current;
    if (!initial) {
      return JSON.stringify(profile) !== JSON.stringify(DEFAULT_PROFILE);
    }
    return JSON.stringify(profile) !== JSON.stringify(initial.profile);
  }, [profile]);

  const hasDeploymentChanged = useMemo(() => {
    const initial = initialSettingsRef.current;
    if (!initial) {
      return JSON.stringify(deployment) !== JSON.stringify(DEFAULT_DEPLOYMENT);
    }
    return JSON.stringify(deployment) !== JSON.stringify(initial.deployment);
  }, [deployment]);

  const handleProfileChange = useCallback(
    (field: keyof TenantProfileState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setProfile((prev) => ({
        ...prev,
        [field]: value
      }));
    },
    []
  );

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    setIsSavingProfile(true);

    try {
      const nextSettings: StoredSettings = { profile, deployment };
      persistSettings(nextSettings);
      initialSettingsRef.current = nextSettings;
      toast({
        title: 'Tenant profile saved',
        description: 'Settings are stored locally until backend integration is enabled.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeploymentToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setDeployment((prev) => ({ ...prev, multiTenant: checked }));
  };

  const handleDeploymentSave = async (event: FormEvent) => {
    event.preventDefault();
    setIsSavingDeployment(true);

    try {
      const nextSettings: StoredSettings = { profile, deployment };
      persistSettings(nextSettings);
      initialSettingsRef.current = nextSettings;
      toast({
        title: 'Deployment preferences saved',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsSavingDeployment(false);
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="md">Tenant Profile</Heading>
      <Box as="form" onSubmit={handleProfileSave}>
        <Stack spacing={4} borderWidth="1px" borderRadius="lg" p={5}>
          <FormControl>
            <FormLabel>Organization Name</FormLabel>
            <Input
              placeholder="ACME Corp"
              value={profile.organizationName}
              onChange={handleProfileChange('organizationName')}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Impact Level</FormLabel>
            <Select
              placeholder="Select level"
              value={profile.impactLevel}
              onChange={handleProfileChange('impactLevel')}
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Primary Contact</FormLabel>
            <Input
              placeholder="fedramp-lead@example.com"
              value={profile.primaryContact}
              onChange={handleProfileChange('primaryContact')}
            />
            <FormHelperText>
              Receives assessment notifications and POA&amp;M escalations.
            </FormHelperText>
          </FormControl>
          <Button
            alignSelf="flex-start"
            colorScheme="brand"
            type="submit"
            isLoading={isSavingProfile}
            loadingText="Saving"
            isDisabled={!hasProfileChanged}
          >
            Save Tenant Profile
          </Button>
        </Stack>
      </Box>

      <Heading size="md">Deployment Preferences</Heading>
      <Box as="form" onSubmit={handleDeploymentSave}>
        <Stack spacing={4} borderWidth="1px" borderRadius="lg" p={5}>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="multi-tenant" mb="0" fontWeight="semibold">
              Multi-tenant SaaS
            </FormLabel>
            <Switch
              id="multi-tenant"
              colorScheme="brand"
              isChecked={deployment.multiTenant}
              onChange={handleDeploymentToggle}
            />
          </FormControl>
          <Box>
            <Badge colorScheme="blue" mb={2}>
              Optional
            </Badge>
            <Text color="gray.400" fontSize="sm">
              Toggle off to export an infrastructure package (Terraform + Helm) for self-hosted
              deployments with customer-managed keys.
            </Text>
          </Box>
          <Button
            alignSelf="flex-start"
            colorScheme="brand"
            type="submit"
            isLoading={isSavingDeployment}
            loadingText="Saving"
            isDisabled={!hasDeploymentChanged}
          >
            Save Deployment Preferences
          </Button>
        </Stack>
      </Box>
    </VStack>
  );
};

export default TenancySettings;
