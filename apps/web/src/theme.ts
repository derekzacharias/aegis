import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'gray.100'
      }
    }
  },
  semanticTokens: {
    colors: {
      brand: {
        50: '#f5faff',
        100: '#d1e5ff',
        200: '#a3cbff',
        300: '#75b0ff',
        400: '#4796ff',
        500: '#1a7cff',
        600: '#005fde',
        700: '#0048ad',
        800: '#00317c',
        900: '#001a4b'
      }
    }
  }
});

export default theme;
