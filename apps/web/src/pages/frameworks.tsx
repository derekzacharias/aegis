import axios from 'axios';
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDeleteFramework, useFrameworks } from '../hooks/use-frameworks';
import type { FrameworkSummary } from '../hooks/use-frameworks';
import CustomFrameworkWizard from '../components/custom-framework-wizard';
import { FiMoreVertical } from 'react-icons/fi';

const FrameworksPage = () => {
  const { data, isLoading, isError } = useFrameworks();
  const deleteFramework = useDeleteFramework();
  const toast = useToast();
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

  const handleDeleteFramework = async (framework: FrameworkSummary) => {
    const confirmed = window.confirm(
      `Remove ${framework.name}? This will delete its controls and crosswalk entries.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteFramework.mutateAsync(framework.id);
      toast({
        title: 'Framework removed',
        description: `${framework.name} has been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400) {
          toast({
            title: 'Framework still in use',
            description:
              'Remove this framework from assessments and detach evidence references before deleting it.',
            status: 'warning',
            duration: 5000,
            isClosable: true
          });
          return;
        }
        if (status === 404) {
          toast({
            title: 'Framework cannot be removed',
            description:
              'Only custom frameworks without assessment or evidence links can be deleted.',
            status: 'warning',
            duration: 5000,
            isClosable: true
          });
          return;
        }
      }
      toast({
        title: 'Unable to remove framework',
        description:
          error instanceof Error ? error.message : 'Unexpected error deleting framework.',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
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
                <VStack align="flex-end" spacing={2}>
                  <Menu placement="bottom-end">
                    <MenuButton
                      as={IconButton}
                      aria-label="Framework options"
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                      isDisabled={deleteFramework.isPending}
                    />
                    <MenuList>
                      {framework.isCustom && framework.status === 'DRAFT' ? (
                        <MenuItem onClick={() => resumeDraft(framework)}>Resume draft</MenuItem>
                      ) : null}
                      <MenuItem as={RouterLink} to={`/frameworks/${framework.id}/catalog`}>
                        Open control catalog
                      </MenuItem>
                      <MenuItem as={RouterLink} to={`/frameworks/${framework.id}/crosswalk`}>
                        Open crosswalk explorer
                      </MenuItem>
                      {framework.isCustom ? <MenuDivider /> : null}
                      <MenuItem
                        onClick={() => handleDeleteFramework(framework)}
                        isDisabled={!framework.isCustom || deleteFramework.isPending}
                      >
                        Remove framework
                      </MenuItem>
                    </MenuList>
                  </Menu>
                  <VStack spacing={1} align="flex-end">
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
