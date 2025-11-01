import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import theme from './theme';
import App from './app';
import { AuthProvider } from './auth/auth-context';
import { ProfileProvider } from './profile/profile-context';
import { PolicyActorProvider } from './policies/policy-actor-context';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find root element');
}

const queryClient = new QueryClient();

createRoot(container).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ProfileProvider>
              <PolicyActorProvider>
                <App />
              </PolicyActorProvider>
            </ProfileProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  </StrictMode>
);
