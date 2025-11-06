import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react';
import type { DocSection } from '@compliance/shared';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark-dimmed.css';
import { iconFor } from './utils';

export interface DocViewerProps {
  section?: DocSection | null;
  categoryTitle?: string;
  updatedAt?: string;
  onCopyLink?: (slug: string) => void;
}

const DocViewer = ({ section, categoryTitle, updatedAt, onCopyLink }: DocViewerProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const surfaceBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const proseBg = useColorModeValue('gray.50', 'blackAlpha.400');
  const muted = useColorModeValue('gray.600', 'gray.300');
  const subtle = useColorModeValue('gray.500', 'gray.400');

  const Icon = section?.icon ? iconFor(section.icon) : undefined;

  const components = useMemo(
    () => ({
      h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <Heading as="h1" size="lg" mt={8} mb={4} {...props} />
      ),
      h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <Heading as="h2" size="md" mt={8} mb={3} {...props} />
      ),
      h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <Heading as="h3" size="sm" mt={6} mb={3} {...props} />
      ),
      p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <Text mb={4} lineHeight={1.7} {...props} />
      ),
      ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <Box as="ul" pl={6} mb={4} listStyleType="disc" {...props} />
      ),
      ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
        <Box as="ol" pl={6} mb={4} listStyleType="decimal" {...props} />
      ),
      li: (props: React.HTMLAttributes<HTMLLIElement>) => <Box as="li" mb={2} {...props} />,
      code: (props: React.HTMLAttributes<HTMLElement>) => (
        <Box
          as="code"
          px={1.5}
          py={0.5}
          borderRadius="md"
          bg={surfaceBg}
          fontFamily="mono"
          fontSize="sm"
          {...props}
        />
      ),
      pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
        <Box
          as="pre"
          mb={4}
          px={4}
          py={3}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          overflowX="auto"
          fontSize="sm"
          bg={proseBg}
          {...props}
        />
      ),
      blockquote: ({ children }: React.PropsWithChildren) => (
        <Box
          as="blockquote"
          borderLeftWidth="4px"
          borderLeftColor="brand.500"
          pl={4}
          py={1}
          mb={4}
          fontStyle="italic"
        >
          {children}
        </Box>
      ),
      table: (props: React.HTMLAttributes<HTMLTableElement>) => (
        <Box overflowX="auto" mb={4}>
          <Table size="sm" variant="striped" {...props} />
        </Box>
      ),
      thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => <Thead {...props} />,
      tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => <Tbody {...props} />,
      tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => <Tr {...props} />,
      th: (props: React.HTMLAttributes<HTMLTableCellElement>) => <Th fontWeight="semibold" {...props} />,
      td: (props: React.HTMLAttributes<HTMLTableCellElement>) => <Td {...props} />
    }),
    [borderColor, proseBg, surfaceBg]
  );

  if (!section) {
    return (
      <Card variant="outline" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Select a topic to begin</Heading>
        </CardHeader>
        <CardBody>
          <Text color={muted}>
            Use the navigation on the left or the search field to explore AegisGRC documentation.
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card variant="outline" borderColor={borderColor}>
      <CardHeader pb={0}>
        <Stack spacing={4}>
          <HStack spacing={3}>
            <Badge borderRadius="full" px={3} py={1} colorScheme="brand" variant="subtle">
              {categoryTitle ?? 'Documentation'}
            </Badge>
            {updatedAt ? (
              <Text fontSize="xs" color={subtle}>
                Updated {new Date(updatedAt).toLocaleDateString()}
              </Text>
            ) : null}
          </HStack>
          <HStack spacing={3} align="center">
            {Icon ? <Icon size={22} /> : null}
            <Heading size="lg">{section.title}</Heading>
            <Button size="sm" variant="outline" onClick={() => onCopyLink?.(section.slug)}>
              Copy link
            </Button>
          </HStack>
          {section.summary ? (
            <Text color={muted} maxW="4xl">
              {section.summary}
            </Text>
          ) : null}
        </Stack>
      </CardHeader>
      <CardBody>
        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>Content</Tab>
            <Tab>Details</Tab>
          </TabList>
          <TabPanels pt={4}>
            <TabPanel px={0}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={components}
              >
                {section.content}
              </ReactMarkdown>
            </TabPanel>
            <TabPanel px={0}>
              <Stack spacing={4} fontSize="sm">
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" color={subtle}>
                    Category
                  </Text>
                  <Text fontWeight="medium">{categoryTitle}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" color={subtle}>
                    Slug
                  </Text>
                  <Badge fontFamily="mono" colorScheme="brand">
                    {section.slug}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" color={subtle}>
                    Order
                  </Text>
                  <Text>#{section.order}</Text>
                </Box>
                {section.tags?.length ? (
                  <Box>
                    <Text fontSize="xs" textTransform="uppercase" color={subtle}>
                      Tags
                    </Text>
                  <Stack direction="row" spacing={2} mt={1} flexWrap="wrap">
                    {section.tags.map((tag) => (
                      <Badge key={tag} colorScheme="brand" variant="subtle">
                        {tag}
                      </Badge>
                    ))}
                  </Stack>
                  </Box>
                ) : null}
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default DocViewer;
