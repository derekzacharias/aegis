import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { UserProfile, UserRole } from '@compliance/shared';
import useAuth from '../../hooks/use-auth';
import { CreateUserInput, useCreateUser, useUsers } from '../../hooks/use-users';

const defaultForm: CreateUserInput = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  jobTitle: '',
  phoneNumber: '',
  role: 'ANALYST'
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

const getErrorMessage = (error: unknown): string => {
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
  return 'Unable to complete request. Please try again.';
};

const UsersSettings = () => {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [form, setForm] = useState<CreateUserInput>(defaultForm);
  const { data: users = [], isLoading, isFetching, error } = useUsers(isAdmin);
  const createUser = useCreateUser();

  useEffect(() => {
    if (!isAdmin) {
      setForm(defaultForm);
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
        [field]: field === 'role' ? (value as UserRole) : value
      }));
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
              <Input
                type="password"
                value={form.password}
                onChange={handleFieldChange('password')}
                placeholder="Generated password"
                autoComplete="new-password"
              />
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
          <Heading size="md">Team Directory</Heading>
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
                    <Th>Role</Th>
                    <Th>Last Login</Th>
                    <Th>Created</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.length === 0 && (
                    <Tr>
                      <Td colSpan={5}>
                        <Text color="gray.500">No users found for this tenant.</Text>
                      </Td>
                    </Tr>
                  )}
                  {users.map((item: UserProfile) => {
                    const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ');
                    return (
                      <Tr key={item.id}>
                        <Td>{fullName || '—'}</Td>
                        <Td>{item.email}</Td>
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
