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
import type { FrameworkSummary } from '../hooks/use-frameworks';
import CustomFrameworkWizard from '../components/custom-framework-wizard';

const FrameworksPage = () => {
  const { data, isLoading, isError } = useFrameworks();
  const [search, setSearch] = useState('');
  const [isWizardOpen, setWizardOpen] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<FrameworkSummary | undefined>(undefined);

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
  const openNewFrameworkWizard = () => {
    setSelectedFramework(undefined);
    setWizardOpen(true);
  };

  const resumeDraft = (framework: (typeof filtered)[number]) => {
    setSelectedFramework(framework);
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setSelectedFramework(undefined);
  };

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Heading size="lg">Framework Library</Heading>
        <Button colorScheme="brand" onClick={openNewFrameworkWizard}>
          Add Custom Framework
        </Button>
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
                <VStack align="end" spacing={1}>
                  <Badge fontSize="0.75rem" px={3} py={1} bg={badgeColor}>
                    {formatFamily(framework.family)}
                  </Badge>
                  <Badge
                    fontSize="0.65rem"
                    px={2}
                    py={0.5}
                    colorScheme={framework.status === 'PUBLISHED' ? 'green' : 'yellow'}
                  >
                    {framework.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </Badge>
                </VStack>
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
                {framework.isCustom && framework.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="orange"
                    onClick={() => resumeDraft(framework)}
                  >
                    Resume draft
                  </Button>
                )}
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
      <CustomFrameworkWizard
        isOpen={isWizardOpen}
        onClose={closeWizard}
        framework={selectedFramework}
      />
    </VStack>
  );
};

const formatFamily = (family: string) => {
  if (family === 'CUSTOM') {
    return 'Custom';
  }
  return family;
};

export default FrameworksPage;
