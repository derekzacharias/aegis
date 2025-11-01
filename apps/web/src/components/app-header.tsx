import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorMode,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { FiBell, FiLogOut, FiMoon, FiSearch, FiSun } from 'react-icons/fi';
import { useMemo } from 'react';
import useAuth from '../hooks/use-auth';

const AppHeader = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.900');
  const toast = useToast();
  const { user, logout } = useAuth();

  const displayName = useMemo(() => {
    if (!user) {
      return 'Session';
    }

    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }

    return user.email;
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!user) {
      return 'Authenticated';
    }

    return user.role
      .toLowerCase()
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Signed out',
      status: 'info',
      duration: 2500,
      isClosable: true
    });
  };

  return (
    <Flex
      px={8}
      py={4}
      align="center"
      justify="space-between"
      borderBottomWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      bg={bg}
      position="sticky"
      top={0}
      zIndex={1}
    >
      <InputGroup maxW="420px">
        <InputLeftElement pointerEvents="none" color="gray.500">
          <FiSearch />
        </InputLeftElement>
        <Input placeholder="Search controls, evidence, assessments..." variant="filled" />
      </InputGroup>
      <HStack spacing={4}>
        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
          variant="ghost"
          onClick={toggleColorMode}
        />
        <IconButton aria-label="Notifications" icon={<FiBell />} variant="ghost" />
        <HStack spacing={3}>
          <Avatar size="sm" name={displayName} />
          <Box textAlign="left">
            <Text fontWeight="bold">{displayName}</Text>
            <Text fontSize="sm" color="gray.500">
              {roleLabel}
            </Text>
          </Box>
        </HStack>
        <Button
          leftIcon={<FiLogOut />}
          variant="ghost"
          onClick={handleLogout}
          size="sm"
        >
          Sign out
        </Button>
      </HStack>
    </Flex>
  );
};

export default AppHeader;
