import {
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FiBarChart2,
  FiBookOpen,
  FiCheckSquare,
  FiFileText,
  FiFolder,
  FiSettings
} from 'react-icons/fi';
import { NavLink, useLocation } from 'react-router-dom';

type NavItem = {
  label: string;
  icon: typeof FiBarChart2;
  path: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: FiBarChart2, path: '/dashboard' },
  { label: 'Frameworks', icon: FiBookOpen, path: '/frameworks' },
  { label: 'Assessments', icon: FiCheckSquare, path: '/assessments' },
  { label: 'Evidence', icon: FiFolder, path: '/evidence' },
  { label: 'Reports', icon: FiFileText, path: '/reports' },
  { label: 'Settings', icon: FiSettings, path: '/settings' }
];

const AppSidebar = () => {
  const location = useLocation();
  const bg = useColorModeValue('gray.100', 'gray.800');
  const accent = useColorModeValue('brand.500', 'brand.400');

  return (
    <Box
      as="nav"
      w="260px"
      bg={bg}
      borderRightWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="sticky"
      top={0}
      h="100vh"
      px={6}
      py={8}
    >
      <Flex align="center" mb={10} gap={3}>
        <Box w={2} h={10} bg={accent} borderRadius="full" />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" fontSize="lg">
            Aegis
          </Text>
          <Text fontSize="sm" color="gray.500">
            Compliance Control Center
          </Text>
        </VStack>
      </Flex>
      <VStack align="stretch" spacing={2}>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink to={item.path} key={item.path}>
              <HStack
                px={3}
                py={2.5}
                borderRadius="md"
                transition="background 0.2s"
                bg={isActive ? 'brand.500' : 'transparent'}
                color={isActive ? 'white' : undefined}
                _hover={{
                  bg: isActive ? 'brand.500' : useColorModeValue('gray.200', 'gray.700')
                }}
              >
                <Icon as={item.icon} boxSize={5} />
                <Text fontWeight={isActive ? 'semibold' : 'medium'}>{item.label}</Text>
              </HStack>
            </NavLink>
          );
        })}
      </VStack>
    </Box>
  );
};

export default AppSidebar;
