import {
  Avatar,
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
import { FiBell, FiMoon, FiSearch, FiSun } from 'react-icons/fi';

const AppHeader = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.900');

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
          <Avatar size="sm" name="Jordan Compliance" />
          <Box textAlign="left">
            <Text fontWeight="bold">Jordan Compliance</Text>
            <Text fontSize="sm" color="gray.500">
              FedRAMP Program Lead
            </Text>
          </Box>
        </HStack>
      </HStack>
    </Flex>
  );
};

export default AppHeader;
