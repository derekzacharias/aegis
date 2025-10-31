import {
  Badge,
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  VStack
} from '@chakra-ui/react';

const TenancySettings = () => {
  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="md">Tenant Profile</Heading>
      <Stack spacing={4} borderWidth="1px" borderRadius="lg" p={5}>
        <FormControl>
          <FormLabel>Organization Name</FormLabel>
          <Input placeholder="ACME Federal Cloud" />
        </FormControl>
        <FormControl>
          <FormLabel>FedRAMP Impact Level</FormLabel>
          <Select placeholder="Select level">
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Primary Contact</FormLabel>
          <Input placeholder="fedramp-lead@example.com" />
          <FormHelperText>
            Receives assessment notifications and POA&M escalations.
          </FormHelperText>
        </FormControl>
      </Stack>

      <Heading size="md">Deployment Preferences</Heading>
      <Stack spacing={4} borderWidth="1px" borderRadius="lg" p={5}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="multi-tenant" mb="0" fontWeight="semibold">
            Multi-tenant SaaS
          </FormLabel>
          <Switch id="multi-tenant" colorScheme="brand" defaultChecked />
        </FormControl>
        <Box>
          <Badge colorScheme="blue" mb={2}>
            Optional
          </Badge>
          <Text color="gray.400" fontSize="sm">
            Toggle off to export an infrastructure package (Terraform + Helm) for self-hosted
            deployments with customer-managed keys.
          </Text>
        </Box>
      </Stack>
    </VStack>
  );
};

export default TenancySettings;
