import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { UserProfile, UserRole } from '@compliance/shared';
import { FiCopy, FiDownload, FiLock, FiRefreshCcw, FiTrash2, FiUserPlus } from 'react-icons/fi';
import useAuth from '../../hooks/use-auth';
import {
  CreateUserInput,
  useBulkUpdateRoles,
  useCreateInvite,
  useCreateUser,
  useExportUsersCsv,
  useForcePasswordReset,
  useRevokeInvite,
  useUserInvites,
  useUsers,
  useRefreshFailures
} from '../../hooks/use-users';
import { formatPhoneNumber } from '../../utils/phone';

const defaultForm: CreateUserInput = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  jobTitle: '',
  phoneNumber: '',
  role: 'ANALYST'
};

const defaultInviteForm = {
  email: '',
  role: 'ANALYST' as UserRole,
  expiresInHours: 72
};

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: 'Administrator', value: 'ADMIN' },
  { label: 'Analyst', value: 'ANALYST' },
  { label: 'Auditor', value: 'AUDITOR' },
  { label: 'Read Only', value: 'READ_ONLY' }
];

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return '—';
  }
  return dayjs(value).format('MMM D, YYYY');
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '—';
  }
  return dayjs(value).format('MMM D, YYYY h:mm A');
};

const formatMetadataValue = (value: unknown) => {
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

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseMessage = error.response?.data?.message;
    if (status === 404) {
      return 'User service is unavailable. Ensure the API is running and you have permission to create users.';
    }
    if (!error.response) {
      return 'Unable to reach the API. Confirm the backend service is running.';
    }
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
  return 'Unable to complete request. Please try again.';
};

const UsersSettings = () => {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [form, setForm] = useState<CreateUserInput>(defaultForm);
  const [inviteForm, setInviteForm] = useState(defaultInviteForm);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState<UserRole>('ANALYST');
  const tokenModal = useDisclosure();
  const [tokenDetails, setTokenDetails] = useState<{
    token: string;
    title: string;
    subtitle: string;
  } | null>(null);
  const { data: users = [], isLoading, isFetching, error } = useUsers(isAdmin);
  const { data: invites = [], isLoading: isInvitesLoading, isFetching: isInvitesFetching } =
    useUserInvites(isAdmin);
  const {
    data: refreshFailures = [],
    isLoading: isRefreshLoading,
    isFetching: isRefreshFetching,
    error: refreshFailuresError
  } = useRefreshFailures(isAdmin, 20);
  const createUser = useCreateUser();
  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();
  const forcePasswordReset = useForcePasswordReset();
  const bulkUpdateRoles = useBulkUpdateRoles();
  const exportCsv = useExportUsersCsv();

  useEffect(() => {
    if (!isAdmin) {
      setForm(defaultForm);
      setInviteForm(defaultInviteForm);
      setSelectedUserIds([]);
    }
  }, [isAdmin]);

  const hasRequiredFields = useMemo(
    () => form.email.trim().length > 0 && form.password.trim().length >= 12,
    [form.email, form.password]
  );

  const handleFieldChange =
    (field: keyof CreateUserInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [field]:
          field === 'role'
            ? (value as UserRole)
            : field === 'phoneNumber'
              ? formatPhoneNumber(value)
              : value
      }));
    };

  const handleInviteChange =
    (field: keyof typeof inviteForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setInviteForm((prev) => ({
        ...prev,
        [field]:
          field === 'role'
            ? (value as UserRole)
            : field === 'expiresInHours'
              ? Number.parseInt(value, 10) || prev.expiresInHours
              : value
      }));
    };

  const resetInviteForm = () => {
    setInviteForm(defaultInviteForm);
  };

  const resetForm = () => {
    setForm({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      jobTitle: '',
      phoneNumber: '',
      role: 'ANALYST'
    });
  };

  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()-_=+[]{}<>?';
    const all = upper + lower + numbers + symbols;

    const pick = (source: string) => source[Math.floor(Math.random() * source.length)];

    let value =
      pick(upper) +
      pick(lower) +
      pick(numbers) +
      pick(symbols);

    for (let i = value.length; i < 16; i += 1) {
      value += pick(all);
    }

    return value
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  };

  const handleGeneratePassword = () => {
    const generated = generatePassword();
    setForm((prev) => ({
      ...prev,
      password: generated
    }));
    toast({
      title: 'Temporary password generated',
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasRequiredFields || createUser.isPending) {
      return;
    }

    try {
      await createUser.mutateAsync({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName?.trim() || undefined,
        lastName: form.lastName?.trim() || undefined,
        jobTitle: form.jobTitle?.trim() || undefined,
        phoneNumber: form.phoneNumber?.trim() || undefined,
        role: form.role
      });

      toast({
        title: 'User created',
        description: `${form.email.trim()} can now sign in with the provided password.`,
        status: 'success',
        duration: 4000,
        isClosable: true
      });
      resetForm();
    } catch (err) {
      const message = getErrorMessage(err);
      toast({
        title: 'Unable to create user',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleInviteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (createInvite.isPending) {
      return;
    }

    try {
      const result = await createInvite.mutateAsync({
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        expiresInHours: inviteForm.expiresInHours
      });

      resetInviteForm();

      if (result.token) {
        setTokenDetails({
          token: result.token,
          title: 'Invite Token Generated',
          subtitle: `Share this one-time token with ${result.email} to complete their account setup.`
        });
        tokenModal.onOpen();
      }

      toast({
        title: 'Invite created',
        description: `An invite token for ${result.email} has been generated.`,
        status: 'success',
        duration: 4000,
        isClosable: true
      });
    } catch (err) {
      toast({
        title: 'Unable to create invite',
        description: getErrorMessage(err),
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (revokeInvite.isPending) {
      return;
    }

    try {
      await revokeInvite.mutateAsync(inviteId);
      toast({
        title: 'Invite revoked',
        status: 'info',
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      toast({
        title: 'Unable to revoke invite',
        description: getErrorMessage(err),
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleForceReset = async (userId: string) => {
    if (forcePasswordReset.isPending) {
      return;
    }

    try {
      const result = await forcePasswordReset.mutateAsync({ userId });
      setTokenDetails({
        token: result.token,
        title: 'Forced password reset',
        subtitle: 'Provide this token to the user so they can set a new password.'
      });
      tokenModal.onOpen();
      toast({
        title: 'Password reset required',
        description: 'Existing sessions were revoked.',
        status: 'info',
        duration: 4000,
        isClosable: true
      });
    } catch (err) {
      toast({
        title: 'Unable to trigger password reset',
        description: getErrorMessage(err),
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUserIds((prev) => {
      if (checked) {
        if (prev.includes(userId)) {
          return prev;
        }
        return [...prev, userId];
      }
      return prev.filter((id) => id !== userId);
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users.map((item) => item.id));
      return;
    }
    setSelectedUserIds([]);
  };

  const handleBulkRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setBulkRole(event.target.value as UserRole);
  };

  const handleBulkRoleUpdate = async () => {
    if (!selectedUserIds.length || bulkUpdateRoles.isPending) {
      return;
    }

    try {
      await bulkUpdateRoles.mutateAsync({ userIds: selectedUserIds, role: bulkRole });
      toast({
        title: 'Roles updated',
        description: `${selectedUserIds.length} user(s) now have the ${bulkRole.replace('_', ' ')} role.`,
        status: 'success',
        duration: 4000,
        isClosable: true
      });
      setSelectedUserIds([]);
    } catch (err) {
      toast({
        title: 'Unable to update roles',
        description: getErrorMessage(err),
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleExportCsv = async () => {
    if (exportCsv.isPending) {
      return;
    }

    try {
      const data = await exportCsv.mutateAsync();
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-${dayjs().format('YYYYMMDD-HHmmss')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: 'Export started',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      toast({
        title: 'Unable to export users',
        description: getErrorMessage(err),
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast({
        title: 'Token copied',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    } catch {
      toast({
        title: 'Unable to copy token',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleTokenModalClose = () => {
    tokenModal.onClose();
    setTokenDetails(null);
  };

  const allSelected = useMemo(
    () => selectedUserIds.length > 0 && selectedUserIds.length === users.length,
    [selectedUserIds, users.length]
  );

  const isBulkDisabled = selectedUserIds.length === 0 || bulkUpdateRoles.isPending;
  const canInvite = inviteForm.email.trim().length > 0;

  if (!isAdmin) {
    return (
      <Card>
        <CardBody>
          <Heading size="md" mb={3}>
            User management
          </Heading>
          <Text color="gray.500">
            Only administrators can provision or manage tenant users. Contact an administrator if you
            need account changes.
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Card>
        <CardHeader display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Heading size="md">Refresh token failures</Heading>
            <Text color="gray.500" fontSize="sm">
              Investigate recent refresh token invalidations for users and service accounts.
            </Text>
          </Box>
          {isRefreshFetching ? <Spinner size="sm" /> : null}
        </CardHeader>
        <CardBody>
          {isRefreshLoading ? (
            <Box display="flex" alignItems="center" justifyContent="center" py={6}>
              <Spinner />
            </Box>
          ) : refreshFailuresError ? (
            <Text color="red.500">{getErrorMessage(refreshFailuresError)}</Text>
          ) : refreshFailures.length === 0 ? (
            <Text color="gray.500">No refresh failures recorded in the latest activity window.</Text>
          ) : (
            <Stack spacing={3}>
              {refreshFailures.map((failure) => (
                <Box key={failure.id} borderWidth="1px" borderRadius="md" p={4}>
                  <HStack justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Text fontWeight="semibold">{failure.email}</Text>
                      {failure.name ? (
                        <Text fontSize="sm" color="gray.500">
                          {failure.name}
                        </Text>
                      ) : null}
                    </Box>
                    <HStack spacing={2}>
                      <Badge colorScheme={failure.isServiceUser ? 'purple' : 'gray'}>
                        {failure.isServiceUser ? 'Service user' : 'User'}
                      </Badge>
                      <Badge colorScheme="red">{failure.reason ?? 'unknown'}</Badge>
                    </HStack>
                  </HStack>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    {formatDateTime(failure.occurredAt)}
                  </Text>
                  {Object.keys(failure.metadata).length > 0 ? (
                    <Stack spacing={1} mt={2} fontSize="sm">
                      {Object.entries(failure.metadata).map(([key, value]) => (
                        <Text key={`${failure.id}-${key}`}>
                          <Text as="span" fontWeight="semibold">
                            {key}:
                          </Text>{' '}
                          {formatMetadataValue(value)}
                        </Text>
                      ))}
                    </Stack>
                  ) : null}
                </Box>
              ))}
            </Stack>
          )}
        </CardBody>
      </Card>

      <Card as="form" onSubmit={handleSubmit}>
        <CardHeader>
          <Heading size="md">Create User</Heading>
          <Text color="gray.500" fontSize="sm">
            Provision new accounts for your tenant. Passwords must be at least 12 characters and include upper, lower, number, and special symbols.
          </Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={form.email}
                onChange={handleFieldChange('email')}
                placeholder="new.user@example.com"
                autoComplete="off"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Temporary Password</FormLabel>
              <InputGroup>
                <Input
                  type="text"
                  value={form.password}
                  onChange={handleFieldChange('password')}
                  placeholder="Generated password"
                  autoComplete="new-password"
                />
                <InputRightElement width="7.5rem">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    isDisabled={createUser.isPending}
                  >
                    Generate
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl>
              <FormLabel>First Name</FormLabel>
              <Input value={form.firstName} onChange={handleFieldChange('firstName')} />
            </FormControl>
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input value={form.lastName} onChange={handleFieldChange('lastName')} />
            </FormControl>
            <FormControl>
              <FormLabel>Job Title</FormLabel>
              <Input value={form.jobTitle} onChange={handleFieldChange('jobTitle')} />
            </FormControl>
            <FormControl>
              <FormLabel>Phone Number</FormLabel>
              <Input value={form.phoneNumber} onChange={handleFieldChange('phoneNumber')} />
            </FormControl>
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select value={form.role} onChange={handleFieldChange('role')}>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>
          <Button
            mt={6}
            colorScheme="brand"
            type="submit"
            isLoading={createUser.isPending}
            isDisabled={!hasRequiredFields || createUser.isPending}
          >
            Create User
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading size="md">User Directory</Heading>
          <Text color="gray.500" fontSize="sm">
            Manage user roles and monitor activity. Last login values include service accounts and automations.
          </Text>
        </CardHeader>
        <CardBody>
          {isLoading && (
            <Box display="flex" alignItems="center" justifyContent="center" py={10}>
              <Spinner size="lg" />
            </Box>
          )}
          {!isLoading && error && (
            <Text color="red.500">{getErrorMessage(error)}</Text>
          )}
          {!isLoading && !error && (
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>Role</Th>
                    <Th>Last Login</Th>
                    <Th>Created</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.length === 0 && (
                    <Tr>
                      <Td colSpan={6}>
                        <Text color="gray.500">No users found for this tenant.</Text>
                      </Td>
                    </Tr>
                  )}
                  {users.map((item: UserProfile) => {
                    const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ');
                    const formattedPhone = formatPhoneNumber(item.phoneNumber ?? '');
                    return (
                      <Tr key={item.id}>
                        <Td>{fullName || '—'}</Td>
                        <Td>{item.email}</Td>
                        <Td>{formattedPhone || '—'}</Td>
                        <Td>{item.role.replace('_', ' ')}</Td>
                        <Td>{formatDate(item.lastLoginAt)}</Td>
                        <Td>{formatDate(item.createdAt)}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
              {isFetching && users.length > 0 && (
                <Text mt={2} color="gray.400" fontSize="sm">
                  Refreshing…
                </Text>
              )}
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default UsersSettings;
