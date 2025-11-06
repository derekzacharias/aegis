import {
  Box,
  Collapse,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import type { DocCategory } from '@compliance/shared';
import { ChevronDown, ChevronRight, Moon, Search, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';
import { iconFor } from './utils';

export interface SidebarProps {
  categories: DocCategory[];
  activeSlug?: string;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSelectSection: (slug: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const DocsSidebar = ({
  categories,
  activeSlug,
  searchTerm,
  onSearchTermChange,
  onSelectSection,
  isDarkMode,
  onToggleTheme
}: SidebarProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const summaryColor = useColorModeValue('gray.500', 'gray.400');
  const activeSummaryColor = useColorModeValue('whiteAlpha.800', 'whiteAlpha.700');

  const openState = useMemo(() => {
    if (searchTerm.trim()) {
      return categories.reduce<Record<string, boolean>>((acc, category) => {
        acc[category.id] = true;
        return acc;
      }, {});
    }
    return expanded;
  }, [categories, expanded, searchTerm]);

  return (
    <Stack spacing={4} h="100%">
      <Flex
        align="center"
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        bg={cardBg}
        px={4}
        py={3}
        shadow="sm"
      >
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Search size={16} />
          </InputLeftElement>
          <Input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search documentation"
            variant="filled"
            borderRadius="full"
          />
        </InputGroup>
        <IconButton
          ml={3}
          aria-label="Toggle color mode"
          icon={isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          variant="ghost"
          onClick={onToggleTheme}
        />
      </Flex>
      <Box
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        bg={cardBg}
        flex="1"
        overflow="hidden"
        shadow="sm"
      >
        <Box h="100%" overflowY="auto" px={1} py={2}>
          <Stack spacing={2}>
            {categories.map((category) => {
              const isExpanded = openState[category.id] ?? true;
              const toggle = () =>
                setExpanded((prev) => ({
                  ...prev,
                  [category.id]: !(prev[category.id] ?? true)
                }));

              return (
                <Box key={category.id} borderRadius="lg" overflow="hidden">
                  <Flex
                    align="flex-start"
                    justify="space-between"
                    px={4}
                    py={3}
                    cursor="pointer"
                    onClick={toggle}
                    _hover={{ bg: hoverBg }}
                  >
                    <Box>
                      <Text fontWeight="semibold" fontSize="sm">
                        {category.title}
                      </Text>
                      {category.description ? (
                        <Text fontSize="xs" color={summaryColor}>
                          {category.description}
                        </Text>
                      ) : null}
                    </Box>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </Flex>
                  <Collapse in={isExpanded} animateOpacity>
                    <Stack spacing={0} pb={2}>
                      {category.sections.map((section) => {
                        const Icon = iconFor(section.icon);
                        const isActive = activeSlug === section.slug;
                        return (
                          <HStack
                            key={section.id}
                            align="start"
                            spacing={3}
                            px={4}
                            py={2}
                            bg={isActive ? 'brand.500' : undefined}
                            color={isActive ? 'white' : undefined}
                            _hover={{ bg: isActive ? 'brand.500' : hoverBg }}
                            cursor="pointer"
                            onClick={() => onSelectSection(section.slug)}
                          >
                            {Icon ? <Icon size={16} /> : null}
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">
                                {section.title}
                              </Text>
                              {section.summary ? (
                                <Text fontSize="xs" color={isActive ? activeSummaryColor : summaryColor}>
                                  {section.summary}
                                </Text>
                              ) : null}
                            </Box>
                          </HStack>
                        );
                      })}
                    </Stack>
                  </Collapse>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
};

export default DocsSidebar;
