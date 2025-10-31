import {
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack
} from '@chakra-ui/react';
import IntegrationsSettings from '../sections/settings/integrations-settings';
import TenancySettings from '../sections/settings/tenancy-settings';
import SecuritySettings from '../sections/settings/security-settings';

const SettingsPage = () => {
  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg">Settings</Heading>
        <Text color="gray.400">Manage tenancy, integrations, and platform security controls.</Text>
      </Box>
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>Tenant</Tab>
          <Tab>Integrations</Tab>
          <Tab>Security</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TenancySettings />
          </TabPanel>
          <TabPanel>
            <IntegrationsSettings />
          </TabPanel>
          <TabPanel>
            <SecuritySettings />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default SettingsPage;
