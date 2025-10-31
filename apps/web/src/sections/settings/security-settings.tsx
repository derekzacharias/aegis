import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Stack,
  Switch,
  Text,
  VStack
} from '@chakra-ui/react';

const SecuritySettings = () => {
  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="md">Authentication & Access</Heading>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={5}>
        <GridItem borderWidth="1px" borderRadius="lg" p={5}>
          <Stack spacing={4}>
            <Heading size="sm">SSO Provider</Heading>
            <FormControl>
              <FormLabel>Metadata URL</FormLabel>
              <Input placeholder="https://idp.gov/saml/metadata" />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="enforce-sso" mb="0" fontWeight="semibold">
                Enforce SSO
              </FormLabel>
              <Switch id="enforce-sso" colorScheme="brand" />
            </FormControl>
            <Button colorScheme="brand">Save SSO Settings</Button>
          </Stack>
        </GridItem>
        <GridItem borderWidth="1px" borderRadius="lg" p={5}>
          <Stack spacing={4}>
            <Heading size="sm">Multi-factor Authentication</Heading>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="require-mfa" mb="0" fontWeight="semibold">
                Require MFA
              </FormLabel>
              <Switch id="require-mfa" colorScheme="brand" defaultChecked />
            </FormControl>
            <FormControl>
              <FormLabel>Timeout (hours)</FormLabel>
              <Input type="number" placeholder="12" />
            </FormControl>
            <Button colorScheme="brand">Update Policy</Button>
          </Stack>
        </GridItem>
      </Grid>

      <Heading size="md">Audit & Encryption</Heading>
      <Box borderWidth="1px" borderRadius="lg" p={5}>
        <Stack spacing={4}>
          <Text color="gray.400" fontSize="sm">
            Configure customer-managed encryption keys, audit log retention, and export controls to
            align with FedRAMP continuous monitoring requirements.
          </Text>
          <FormControl>
            <FormLabel>Customer-managed KMS ARN</FormLabel>
            <Input placeholder="arn:aws-us-gov:kms:region:account:key/uuid" />
          </FormControl>
          <FormControl>
            <FormLabel>Audit Log Retention (days)</FormLabel>
            <Input type="number" placeholder="365" />
          </FormControl>
          <Button colorScheme="brand">Apply Controls</Button>
        </Stack>
      </Box>
    </VStack>
  );
};

export default SecuritySettings;
