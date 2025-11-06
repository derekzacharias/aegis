import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Center,
  Flex,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import useAuth from './hooks/use-auth';
import DashboardPage from './pages/dashboard';
import FrameworksPage from './pages/frameworks';
import FrameworkControlCatalogPage from './pages/framework-control-catalog';
import FrameworkCrosswalkPage from './pages/framework-crosswalk';
import AssessmentsPage from './pages/assessments';
import EvidencePage from './pages/evidence';
import ReportsPage from './pages/reports';
import SettingsPage from './pages/settings';
import PoliciesPage from './pages/policies';
import DocsPage from './pages/docs';
import LoginPage from './pages/login';
import AppSidebar from './components/app-sidebar';
import AppHeader from './components/app-header';

const LoadingScreen = () => (
  <Center minH="100vh">
    <Spinner size="xl" thickness="4px" speed="0.65s" />
  </Center>
);

const RequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AppShell = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const { authError, clearAuthError } = useAuth();

  useEffect(() => {
    if (!authError) {
      return;
    }

    const timer = window.setTimeout(() => clearAuthError(), 6000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [authError, clearAuthError]);

  return (
    <Flex minH="100vh" bg={bg}>
      <AppSidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <AppHeader />
        {authError ? (
          <Alert status="error" borderRadius="none">
            <AlertIcon />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        ) : null}
        <Box as="main" flex="1" px={8} py={6} overflowY="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/frameworks" element={<FrameworksPage />} />
          <Route
            path="/frameworks/:frameworkId/catalog"
            element={<FrameworkControlCatalogPage />}
          />
          <Route
            path="/frameworks/:frameworkId/crosswalk"
            element={<FrameworkCrosswalkPage />}
          />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/evidence" element={<EvidencePage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/documentation" element={<Navigate to="/docs" replace />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/settings/*" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
