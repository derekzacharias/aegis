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
import axios from 'axios';
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TenantImpactLevel } from '@compliance/shared';
import { useTenantProfile, useUpdateTenantProfile } from '../../hooks/use-tenant-profile';

interface TenantProfileFormState {
  organizationName: string;
  impactLevel: TenantImpactLevel;
  primaryContact: string;
}

interface DeploymentPreferencesState {
  multiTenant: boolean;
}

const DEFAULT_PROFILE: TenantProfileFormState = {
  organizationName: '',
  impactLevel: 'MODERATE',
  primaryContact: ''
};

const DEFAULT_DEPLOYMENT: DeploymentPreferencesState = {
  multiTenant: true
};

const DEPLOYMENT_STORAGE_KEY = 'tenancy.deployment';

const loadDeployment = (): DeploymentPreferencesState => {
  if (typeof window === 'undefined') {
    return DEFAULT_DEPLOYMENT;
  }

  const raw = window.localStorage.getItem(DEPLOYMENT_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_DEPLOYMENT;
  }

  try {
    const parsed = JSON.parse(raw) as DeploymentPreferencesState;
    return { ...DEFAULT_DEPLOYMENT, ...parsed };
  } catch {
    return DEFAULT_DEPLOYMENT;
  }
};

const persistDeployment = (settings: DeploymentPreferencesState) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(DEPLOYMENT_STORAGE_KEY, JSON.stringify(settings));
};

const impactLevelOptions: Array<{ label: string; value: TenantImpactLevel }> = [
  { label: 'Low', value: 'LOW' },
  { label: 'Moderate', value: 'MODERATE' },
  { label: 'High', value: 'HIGH' }
];

const getProfileErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (Array.isArray(responseMessage)) {
      return responseMessage.join(', ');
    }
    if (typeof responseMessage === 'string') {
      return responseMessage;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unable to update tenant profile. Please try again.';
};

const TenancySettings = () => {
  const toast = useToast();
  const { data: tenantProfile, isLoading: isProfileLoading, isFetching: isProfileFetching, error: profileError } =
    useTenantProfile();
  const updateProfile = useUpdateTenantProfile();
  const [profile, setProfile] = useState<TenantProfileFormState>(DEFAULT_PROFILE);
  const initialProfileRef = useRef<TenantProfileFormState | null>(null);
  const initialDeploymentRef = useRef<DeploymentPreferencesState>(loadDeployment());
  const [deployment, setDeployment] = useState<DeploymentPreferencesState>(initialDeploymentRef.current);
  const [isSavingDeployment, setIsSavingDeployment] = useState(false);

  useEffect(() => {
    if (tenantProfile) {
      const mapped: TenantProfileFormState = {
        organizationName: tenantProfile.organizationName,
        impactLevel: tenantProfile.impactLevel,
        primaryContact: tenantProfile.primaryContactEmail ?? ''
      };
      setProfile(mapped);
      initialProfileRef.current = mapped;
    }
  }, [tenantProfile]);

  useEffect(() => {
    if (profileError) {
      toast({
        title: 'Unable to load tenant profile',
        description: getProfileErrorMessage(profileError),
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  }, [profileError, toast]);

  const hasProfileChanged = useMemo(() => {
    const initial = initialProfileRef.current;
    if (!initial) {
      return false;
    }

    return (
      profile.organizationName !== initial.organizationName ||
      profile.impactLevel !== initial.impactLevel ||
      profile.primaryContact !== initial.primaryContact
    );
  }, [profile]);

  const isSavingProfile = updateProfile.isPending;
  const canSaveProfile =
    hasProfileChanged && profile.organizationName.trim().length > 0 && !isProfileLoading;

  const hasDeploymentChanged = useMemo(() => {
    const initial = initialDeploymentRef.current;
    return deployment.multiTenant !== initial.multiTenant;
  }, [deployment]);

  const handleProfileChange = useCallback(
    (field: keyof TenantProfileFormState) =>
      (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value } = event.target;
        setProfile((prev) => ({
          ...prev,
          [field]: field === 'impactLevel' ? (value as TenantImpactLevel) : value
        }));
      },
    []
  );

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const payload = {
        organizationName: profile.organizationName.trim(),
        impactLevel: profile.impactLevel,
        primaryContactEmail: profile.primaryContact.trim() || undefined
      };

      const updated = await updateProfile.mutateAsync(payload);
      const mapped: TenantProfileFormState = {
        organizationName: updated.organizationName,
        impactLevel: updated.impactLevel,
        primaryContact: updated.primaryContactEmail ?? ''
      };
      setProfile(mapped);
      initialProfileRef.current = mapped;
      toast({
        title: 'Tenant profile saved',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Unable to save tenant profile',
        description: getProfileErrorMessage(error),
        status: 'error',
        duration: 5000,
        isClosable: true
      });
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
      persistDeployment(deployment);
      initialDeploymentRef.current = deployment;
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
          <FormControl isRequired>
            <FormLabel>Organization Name</FormLabel>
            <Input
              placeholder="ACME Corp"
              value={profile.organizationName}
              onChange={handleProfileChange('organizationName')}
              isDisabled={isProfileLoading || isProfileFetching || isSavingProfile}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Impact Level</FormLabel>
            <Select
              value={profile.impactLevel}
              onChange={handleProfileChange('impactLevel')}
              isDisabled={isProfileLoading || isProfileFetching || isSavingProfile}
            >
              {impactLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Primary Contact</FormLabel>
            <Input
              type="email"
              placeholder="fedramp-lead@example.com"
              value={profile.primaryContact}
              onChange={handleProfileChange('primaryContact')}
              isDisabled={isProfileLoading || isProfileFetching || isSavingProfile}
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
            isDisabled={!canSaveProfile || isProfileFetching}
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
