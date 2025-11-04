import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  Select,
  Divider
} from '@chakra-ui/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { UserProfile, UserRole } from '@compliance/shared';
import useProfile from '../../hooks/use-profile';
import useAuth from '../../hooks/use-auth';
import { formatPhoneNumber } from '../../utils/phone';
import { getDefaultTimezone, getTimezoneOptions } from '../../utils/timezones';

type ProfileFormState = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  phoneNumber: string;
  timezone: string;
  avatarUrl: string;
  bio: string;
};

type ProfileUpdatePayload = Partial<
  Pick<UserProfile, 'firstName' | 'lastName' | 'jobTitle' | 'phoneNumber' | 'timezone' | 'avatarUrl' | 'bio'>
>;

const toProfileUpdatePayload = (values: ProfileFormState): ProfileUpdatePayload =>
  (Object.entries(values) as Array<[keyof ProfileFormState, string]>).reduce<ProfileUpdatePayload>(
    (acc, [key, value]) => {
      const trimmed = value.trim();
      const fieldKey = key as keyof ProfileUpdatePayload;
      return {
        ...acc,
        [fieldKey]: trimmed.length === 0 ? null : trimmed
      };
    },
    {} as ProfileUpdatePayload
  );

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '—';
  }

  return dayjs(value).format('MMM D, YYYY h:mm A');
};

const formatChangeValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'string') {
    return value.length > 0 ? value : '—';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return '—';
  }
};

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: 'Administrator', value: 'ADMIN' },
  { label: 'Analyst', value: 'ANALYST' },
  { label: 'Auditor', value: 'AUDITOR' },
  { label: 'Read Only', value: 'READ_ONLY' }
];

const ProfileSettings = () => {
  const toast = useToast();
  const { profile, updateProfile, changePassword, loadAudits, audits, isUpdating, updateRole } = useProfile();
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileFormState>(() => ({
    firstName: '',
    lastName: '',
    jobTitle: '',
    phoneNumber: '',
    timezone: getDefaultTimezone(),
    avatarUrl: '',
    bio: ''
  }));
  const [roleValue, setRoleValue] = useState<UserRole>('ANALYST');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingAudits, setLoadingAudits] = useState(false);
  const { isOpen, onToggle } = useDisclosure();

  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        jobTitle: profile.jobTitle ?? '',
        phoneNumber: formatPhoneNumber(profile.phoneNumber ?? ''),
        timezone: profile.timezone ?? getDefaultTimezone(),
        avatarUrl: profile.avatarUrl ?? '',
        bio: profile.bio ?? ''
      });
      setRoleValue(profile.role);
    }
  }, [profile]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement | HTMLDivElement>) => {
    event.preventDefault();
    setProfileError(null);

    try {
      const payload = toProfileUpdatePayload(form);
      await updateProfile(payload);
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update profile', error);
      setProfileError('We could not save your profile changes. Please try again.');
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement | HTMLDivElement>) => {
    event.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password confirmation does not match.');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast({
        title: 'Password updated',
        description: 'You will be asked to log in again on other devices.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to change password', error);
      setPasswordError('Unable to change password. Verify your current password and try again.');
    }
  };

  const handleRoleChange = async (nextRole: UserRole) => {
    if (nextRole === roleValue) {
      return;
    }

    try {
      const updated = await updateRole(nextRole);
      setRoleValue(updated.role);
      toast({
        title: 'Role updated',
        description: `Role set to ${nextRole.replace('_', ' ')}`,
        status: 'info',
        duration: 2500,
        isClosable: true
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update role', error);
      toast({
        title: 'Unable to update role',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const canManageRoles = useMemo(() => user?.role === 'ADMIN', [user?.role]);

  useEffect(() => {
    if (!profile || !isOpen) {
      return;
    }

    setLoadingAudits(true);
    loadAudits()
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load profile audits', error);
      })
      .finally(() => setLoadingAudits(false));
  }, [isOpen, loadAudits, profile]);

  if (!profile) {
    return (
      <Card>
        <CardBody>
          <Text color="gray.500">Loading profile details...</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Stack spacing={6} align="stretch">
      <Card as="form" onSubmit={handleProfileSubmit}>
        <CardHeader>
          <Heading size="md">Profile</Heading>
          <Text color="gray.500">Update your contact information and display preferences.</Text>
        </CardHeader>
        <CardBody as={Stack} spacing={4}>
          {profileError ? (
            <Alert status="error">
              <AlertDescription>{profileError}</AlertDescription>
            </Alert>
          ) : null}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>First name</FormLabel>
              <Input
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Last name</FormLabel>
              <Input
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Job title</FormLabel>
              <Input
                value={form.jobTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, jobTitle: event.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Phone number</FormLabel>
              <Input
                value={form.phoneNumber}
                onChange={(event) => {
                  const nextValue = formatPhoneNumber(event.target.value);
                  setForm((prev) => ({ ...prev, phoneNumber: nextValue }));
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Timezone</FormLabel>
              <Select
                placeholder="Select timezone"
                value={form.timezone}
                onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))}
              >
                {timezoneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Avatar URL</FormLabel>
              <Input
                value={form.avatarUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))}
              />
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Textarea
              value={form.bio}
              onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
              rows={3}
            />
          </FormControl>
          {canManageRoles ? (
            <FormControl id="profile-role" maxW={{ base: '100%', md: '240px' }}>
              <FormLabel>Role</FormLabel>
              <Select
                data-testid="role-select"
                id="profile-role"
                value={roleValue}
                onChange={(event) => handleRoleChange(event.target.value as UserRole)}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box>
              <Text fontSize="sm" color="gray.500">
                Role: {roleOptions.find((option) => option.value === profile.role)?.label ?? profile.role}
              </Text>
            </Box>
          )}
          <Button type="submit" colorScheme="brand" alignSelf="flex-start" isLoading={isUpdating}>
            Save changes
          </Button>
          <Divider />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} color="gray.500" fontSize="sm">
            <Box>
              <Text fontWeight="medium">Last login</Text>
              <Text>{formatDateTime(profile.lastLoginAt)}</Text>
            </Box>
            <Box>
              <Text fontWeight="medium">Created</Text>
              <Text>{formatDateTime(profile.createdAt)}</Text>
            </Box>
            <Box>
              <Text fontWeight="medium">Updated</Text>
              <Text>{formatDateTime(profile.updatedAt)}</Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      <Card as="form" onSubmit={handlePasswordSubmit}>
        <CardHeader>
          <Heading size="md">Change password</Heading>
          <Text color="gray.500">Use a strong passphrase that meets the configured complexity policy.</Text>
        </CardHeader>
        <CardBody as={Stack} spacing={4}>
          {passwordError ? (
            <Alert status="error">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          ) : null}
          <FormControl isRequired>
            <FormLabel>Current password</FormLabel>
            <Input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
            />
          </FormControl>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>New password</FormLabel>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Confirm new password</FormLabel>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <Button
            type="submit"
            colorScheme="brand"
            alignSelf="flex-start"
            isDisabled={passwordForm.newPassword.length === 0}
          >
            Update password
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Heading size="md">Recent profile activity</Heading>
            <Text color="gray.500">An audit trail of profile updates and administrative changes.</Text>
          </Box>
          <Button variant="ghost" onClick={onToggle}>
            {isOpen ? 'Hide' : 'Show'} audit history
          </Button>
        </CardHeader>
        {isOpen ? (
          <CardBody>
            {loadingAudits ? (
              <Text color="gray.500">Loading activity…</Text>
            ) : audits.length === 0 ? (
              <Text color="gray.500">No profile changes recorded yet.</Text>
            ) : (
              <Stack spacing={4}>
                {audits.map((entry) => (
                  <Box key={entry.id} borderLeftWidth="2px" borderLeftColor="brand.500" pl={4}>
                    <Text fontSize="sm" color="gray.500">
                      {formatDateTime(entry.createdAt)}
                    </Text>
                    <Text fontWeight="semibold">
                      {(entry.actorName ?? entry.actorEmail ?? 'System')} updated:
                    </Text>
                    <Stack spacing={1} mt={1} fontSize="sm">
                      {Object.entries(entry.changes).map(([field, change]) => (
                        <Text key={field}>
                          <Text as="span" fontWeight="semibold">
                            {field}:
                          </Text>{' '}
                          {formatChangeValue(change.previous)} → {formatChangeValue(change.current)}
                        </Text>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardBody>
        ) : null}
      </Card>
    </Stack>
  );
};

export default ProfileSettings;
