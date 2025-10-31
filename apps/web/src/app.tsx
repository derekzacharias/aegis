import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/dashboard';
import FrameworksPage from './pages/frameworks';
import FrameworkControlCatalogPage from './pages/framework-control-catalog';
import AssessmentsPage from './pages/assessments';
import EvidencePage from './pages/evidence';
import ReportsPage from './pages/reports';
import SettingsPage from './pages/settings';
import AppSidebar from './components/app-sidebar';
import AppHeader from './components/app-header';

const App = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex minH="100vh" bg={bg}>
      <AppSidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <AppHeader />
        <Box as="main" flex="1" px={8} py={6} overflowY="auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/frameworks" element={<FrameworksPage />} />
            <Route path="/frameworks/:frameworkId/catalog" element={<FrameworkControlCatalogPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Routes>
        </Box>
      </Box>
    </Flex>
  );
};

export default App;
