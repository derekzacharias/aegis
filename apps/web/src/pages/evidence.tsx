import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import { useEvidence } from '../hooks/use-evidence';
import { useFrameworks } from '../hooks/use-frameworks';

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending review', color: 'yellow' },
  approved: { label: 'Approved', color: 'green' },
  archived: { label: 'Archived', color: 'gray' }
};

const EvidencePage = () => {
  const { data: evidence } = useEvidence();
  const { data: frameworks } = useFrameworks();

  const resolveFrameworks = (ids: string[]) =>
    ids.map((id) => frameworks?.find((fw) => fw.id === id)?.name ?? id).join(', ');

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Heading size="lg">Evidence Vault</Heading>
        <Button leftIcon={<Icon as={FiUpload} />} colorScheme="brand">
          Upload Evidence
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
        {evidence?.map((item) => {
          const status = statusMap[item.status];
          return (
            <Box
              key={item.id}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              p={5}
              bg={useColorModeValue('white', 'gray.800')}
            >
              <Stack spacing={3}>
                <Heading size="sm">{item.name}</Heading>
                <Text fontSize="sm" color="gray.400">
                  Linked Controls: {item.controlIds.join(', ')}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Frameworks: {resolveFrameworks(item.frameworkIds)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Uploaded by {item.uploadedBy} on{' '}
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </Text>
                {status && (
                  <Badge colorScheme={status.color}>
                    {status.label}
                    {item.reviewDue ? ` · Review by ${item.reviewDue}` : ''}
                  </Badge>
                )}
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
};

export default EvidencePage;
