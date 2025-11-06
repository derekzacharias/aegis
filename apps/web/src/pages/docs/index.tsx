import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Spinner,
  Stack,
  Text,
  useColorMode
} from '@chakra-ui/react';
import type { DocCategory, DocSection, DocsResponse } from '@compliance/shared';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDocs } from '../../hooks/use-docs';
import BackToTop from './components/back-to-top';
import Breadcrumbs from './components/breadcrumbs';
import DocViewer from './doc-viewer';
import DocsSidebar from './sidebar';

const DocsPage = () => {
  const { data, isLoading, isError } = useDocs();
  const { colorMode, toggleColorMode } = useColorMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSlug, setActiveSlug] = useState<string | undefined>(() =>
    typeof window !== 'undefined' ? window.location.hash.replace('#', '') || undefined : undefined
  );
  const location = useLocation();
  const navigate = useNavigate();

  const safeData: DocsResponse | undefined = data;

  useEffect(() => {
    if (!safeData || activeSlug) {
      return;
    }
    const fallback = safeData.categories[0]?.sections[0]?.slug;
    if (fallback) {
      setActiveSlug(fallback);
    }
  }, [safeData, activeSlug]);

  useEffect(() => {
    if (!activeSlug) {
      return;
    }
    const currentHash = location.hash.replace('#', '');
    if (currentHash !== activeSlug) {
      navigate(`${location.pathname}#${activeSlug}`, { replace: true });
    }
  }, [activeSlug, location.hash, location.pathname, navigate]);

  const filteredCategories = useMemo<DocCategory[]>(() => {
    if (!safeData) {
      return [];
    }
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return safeData.categories;
    }

    return safeData.categories
      .map((category) => {
        const sections = category.sections.filter((section) => {
          const haystack = `${section.title} ${section.summary ?? ''} ${section.content}`.toLowerCase();
          return haystack.includes(term);
        });
        return { ...category, sections };
      })
      .filter((category) => category.sections.length > 0);
  }, [safeData, searchTerm]);

  const allSections = useMemo<DocSection[]>(() => {
    if (!safeData) {
      return [];
    }
    return safeData.categories.flatMap((category) => category.sections);
  }, [safeData]);

  const activeSection = useMemo<DocSection | undefined>(() => {
    if (!activeSlug) {
      return undefined;
    }
    return allSections.find((section) => section.slug === activeSlug);
  }, [activeSlug, allSections]);

  const activeCategoryTitle = useMemo(() => {
    if (!activeSlug || !safeData) {
      return undefined;
    }
    const category = safeData.categories.find((cat) =>
      cat.sections.some((section) => section.slug === activeSlug)
    );
    return category?.title;
  }, [activeSlug, safeData]);

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}${location.pathname}#${slug}`;
    void navigator.clipboard.writeText(url);
  };

  if (isLoading) {
    return (
      <Flex minH="480px" align="center" justify="center">
        <HStack
          spacing={3}
          borderWidth="1px"
          borderRadius="full"
          px={6}
          py={3}
          shadow="sm"
          bg="card"
        >
          <Spinner size="sm" color="brand.500" />
          <Text fontSize="sm" fontWeight="medium">
            Loading documentation…
          </Text>
        </HStack>
      </Flex>
    );
  }

  if (isError || !safeData) {
    return (
      <Alert
        status="error"
        variant="left-accent"
        borderRadius="xl"
        flexDirection="column"
        alignItems="flex-start"
        gap={3}
        p={6}
      >
        <HStack spacing={3}>
          <AlertIcon boxSize={6} mr={0} />
          <AlertTitle fontSize="lg">Unable to load documentation</AlertTitle>
        </HStack>
        <AlertDescription maxW="lg">
          Check your network connection or contact your AegisGRC administrator. You can retry the
          request below.
        </AlertDescription>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box position="relative">
      <Grid
        templateColumns={{ base: '1fr', xl: '320px 1fr' }}
        gap={{ base: 6, md: 8 }}
        alignItems="start"
      >
        <Box
          position={{ base: 'static', xl: 'sticky' }}
          top={0}
          h={{ base: 'auto', xl: 'calc(100vh - 120px)' }}
          overflowY={{ base: 'visible', xl: 'auto' }}
        >
          <DocsSidebar
            categories={filteredCategories.length ? filteredCategories : safeData.categories}
            activeSlug={activeSlug}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onSelectSection={(slug) => setActiveSlug(slug)}
            isDarkMode={colorMode === 'dark'}
            onToggleTheme={toggleColorMode}
          />
        </Box>
        <Stack spacing={6}>
          <Breadcrumbs
            items={[
              { label: 'Documentation', href: safeData.categories[0]?.sections[0]?.slug ?? '' },
              ...(activeCategoryTitle
                ? [{ label: activeCategoryTitle, href: activeSlug }]
                : []),
              ...(activeSection ? [{ label: activeSection.title }] : [])
            ]}
            onNavigate={(slug) => slug && setActiveSlug(slug)}
          />
          <DocViewer
            section={activeSection}
            categoryTitle={activeCategoryTitle}
            updatedAt={safeData.updatedAt}
            onCopyLink={handleCopyLink}
          />
        </Stack>
      </Grid>
      <BackToTop />
    </Box>
  );
};

export default DocsPage;
