import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useFrameworks } from '../hooks/use-frameworks';

const FrameworksPage = () => {
  const { data, isLoading, isError } = useFrameworks();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.filter((framework) => {
      const term = search.toLowerCase();
      return (
        framework.name.toLowerCase().includes(term) ||
        framework.description.toLowerCase().includes(term) ||
        framework.family.toLowerCase().includes(term)
      );
    });
  }, [data, search]);

  const badgeColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Heading size="lg">Framework Library</Heading>
        <Button colorScheme="brand">Add Custom Framework</Button>
      </HStack>
      <Input
        placeholder="Search frameworks by name, family, or description..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {isLoading && (
        <HStack spacing={3}>
          <Spinner />
          <Text>Loading frameworks…</Text>
        </HStack>
      )}

      {isError && (
        <Box borderWidth="1px" borderRadius="md" borderColor="red.400" p={4}>
          <Text color="red.300">
            Unable to load frameworks from the API. Displaying placeholder content.
          </Text>
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
        {filtered.map((framework) => (
          <Box
            key={framework.id}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            p={5}
            bg={useColorModeValue('white', 'gray.800')}
          >
            <Stack spacing={3}>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <Heading size="md">{framework.name}</Heading>
                  <Text color="gray.500">{framework.description}</Text>
                </VStack>
                <Badge fontSize="0.75rem" px={3} py={1} bg={badgeColor}>
                  {framework.family}
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.400">
                  Version {framework.version}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {framework.controlCount} controls
                </Text>
              </HStack>
              <HStack spacing={3} justify="flex-end">
                <Button
                  as={RouterLink}
                  to={`/frameworks/${framework.id}/crosswalk`}
                  colorScheme="brand"
                  size="sm"
                >
                  Crosswalk Explorer
                </Button>
                <Button
                  as={RouterLink}
                  to={`/frameworks/${framework.id}/catalog`}
                  variant="outline"
                  colorScheme="brand"
                  size="sm"
                >
                  Explore Control Catalog
                </Button>
              </HStack>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
};

export default FrameworksPage;
