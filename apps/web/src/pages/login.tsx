import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/use-auth';

const LoginPage = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      toast({
        title: 'Welcome back',
        description: 'You are now signed in to Aegis.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      let message = 'Unable to sign in with the provided credentials.';

      if (axios.isAxiosError(error)) {
        const responseMessage = (error.response?.data as { message?: string })?.message;
        if (responseMessage) {
          message = responseMessage;
        }
      }

      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Flex minH="100vh" align="center" justify="center" bg={pageBg} px={4}>
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg={cardBg}
        p={10}
        borderRadius="xl"
        boxShadow="xl"
        maxW="420px"
        w="full"
      >
        <Stack spacing={6}>
          <Stack spacing={2} textAlign="center">
            <Heading size="lg">Sign in to Aegis</Heading>
            <Text color="gray.500">Access your compliance control center</Text>
          </Stack>
          {formError ? (
            <Alert status="error" borderRadius="md">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="brand"
            isLoading={isSubmitting}
            isDisabled={!email || !password}
          >
            Sign in
          </Button>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Use your organization credentials or contact an administrator for access.
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
};

export default LoginPage;
