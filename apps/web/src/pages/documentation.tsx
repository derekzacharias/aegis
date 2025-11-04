import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Heading,
  HStack,
  Icon,
  OrderedList,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  UnorderedList,
  Wrap,
  useColorModeValue
} from '@chakra-ui/react';
import { useMemo, useRef, useState } from 'react';
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClipboard,
  FiDownload,
  FiHelpCircle,
  FiEye,
  FiLayers,
  FiSettings,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiActivity,
  FiEdit,
  FiBell,
  FiZap
} from 'react-icons/fi';
// eslint-disable-next-line @nx/enforce-module-boundaries
import userGuideMarkdown from '../../../../docs/policies-user-guide.md?raw';
// eslint-disable-next-line @nx/enforce-module-boundaries
import adminGuideMarkdown from '../../../../docs/policies-admin-guide.md?raw';

type GuideSection = {
  title: string;
  description?: string;
  items: string[];
  ordered?: boolean;
};

type GuideDefinition = {
  key: 'user' | 'admin';
  title: string;
  subtitle: string;
  icon: typeof FiHelpCircle;
  accent: string;
  badges: string[];
  markdownFilename: string;
  markdownContent: string;
  sections: GuideSection[];
};

const guides: GuideDefinition[] = [
  {
    key: 'user',
    title: 'Policy User Guide',
    subtitle: 'Hands-on walkthrough for authors and approvers managing day-to-day policy workflows.',
    icon: FiBookOpen,
    accent: 'brand.500',
    badges: [
      'Get Oriented',
      'Create a Policy',
      'Upload Versions',
      'Submit for Approval',
      'Review & Decisions',
      'Compare Versions',
      'Download Artifacts',
      'Troubleshooting Tips'
    ],
    markdownFilename: 'policies-user-guide.md',
    markdownContent: userGuideMarkdown,
    sections: [
      {
        title: 'Get Oriented',
        items: [
          'Open Policies from the sidebar to access the two-pane workspace.',
          'Use the “Acting as” selector to switch between author and approver personas.',
          'Browse the inventory on the left and inspect version history, retention, and framework coverage on the right.'
        ]
      },
      {
        title: 'Create a Policy',
        ordered: true,
        items: [
          'Switch to an Administrator or Analyst actor.',
          'Click New Policy and complete required metadata.',
          'Define optional retention controls (period, reason, expiration) and assign the owner.',
          'Save to create the policy and appear in the inventory.'
        ]
      },
      {
        title: 'Upload Policy Versions',
        ordered: true,
        items: [
          'Select the policy and choose Upload version.',
          'Attach the artifact (PDF, DOCX, TXT, Markdown, HTML, PNG, JPG).',
          'Add optional metadata—label, release notes, effective date, superseded version.',
          'Select relevant frameworks, then map comma-separated families and control IDs.',
          'Submit to store the draft in version history.'
        ]
      },
      {
        title: 'Submit for Approval',
        ordered: true,
        items: [
          'Locate the draft version and click Submit, or use Submit draft in the header.',
          'Pick at least one Admin or Auditor as an approver.',
          'Include a reviewer message where additional context helps.',
          'Confirm submission to move the version into “In Review”.'
        ]
      },
      {
        title: 'Review & Decisions',
        items: [
          'Approvers open Record decision to approve or reject.',
          'Approvals may set an effective date when the version activates.',
          'Rejections close remaining approvals and revert the version to the owner.',
          'When all approvals complete, the version becomes Current automatically.'
        ]
      },
      {
        title: 'Compare Versions',
        ordered: true,
        items: [
          'Select up to two versions using the checkboxes.',
          'Click Compare selected to see side-by-side metadata, approvals, notes, and framework coverage.'
        ]
      },
      {
        title: 'Download Artifacts',
        items: [
          'Use Download beside a version to fetch the stored document.',
          'Links open in a new tab and respect the acting user’s permissions.'
        ]
      },
      {
        title: 'Troubleshooting Tips',
        items: [
          'Refresh the actor list if personas disappear.',
          'Ensure a file is attached and the actor has author permissions before uploading.',
          'Only draft versions can be submitted and must include at least one approver.',
          'Switch to the assigned approver persona before recording a decision.'
        ]
      }
    ]
  },
  {
    key: 'admin',
    title: 'Policy Admin Guide',
    subtitle: 'Operational reference for administrators governing retention policies, approvals, and audits.',
    icon: FiSettings,
    accent: 'purple.500',
    badges: [
      'Role Overview',
      'Initial Setup Checklist',
      'Manage Ownership & Actors',
      'Enforce Retention Policies',
      'Framework Mapping Governance',
      'Approval Workflow Policy',
      'Audit Trail & Monitoring',
      'API & Automation',
      'Operational Best Practices'
    ],
    markdownFilename: 'policies-admin-guide.md',
    markdownContent: adminGuideMarkdown,
    sections: [
      {
        title: 'Role Overview',
        items: [
          'Administrators author, approve, reassign ownership, and manage retention.',
          'Analysts create and update the policies they own.',
          'Auditors review and approve assigned versions; Read Only users observe.'
        ]
      },
      {
        title: 'Initial Setup Checklist',
        ordered: true,
        items: [
          'Verify seeded actors exist with expected roles for the tenant.',
          'Populate frameworks so policies can map compliant controls.',
          'Align on review cadence expectations with authors and approvers.'
        ]
      },
      {
        title: 'Manage Ownership & Actors',
        items: [
          'Use Edit policy to reassign owners (administrators only).',
          'Troubleshoot by impersonating personas via the “Acting as” selector.',
          'The /policies/actors endpoint powers participant lists—keep user roles accurate.'
        ]
      },
      {
        title: 'Enforce Retention Policies',
        ordered: true,
        items: [
          'Set retention period, reason, and optional expiration in Edit policy.',
          'Saving applies the rules and logs a RETENTION_UPDATED audit entry.',
          'Retention metadata appears in the policy detail pane for visibility.'
        ]
      },
      {
        title: 'Framework Mapping Governance',
        items: [
          'Require authors to map frameworks and controls during uploads.',
          'Mappings validate against tenant frameworks and appear across the UI.',
          'Encourage consistent control IDs (for example, AC-2, ID.AM-1).'
        ]
      },
      {
        title: 'Approval Workflow Policy',
        items: [
          'Favor separation of duties between owners and approvers.',
          'Drafts need at least one valid approver before submission.',
          'Rejections trigger VERSION_ARCHIVED; promotions record VERSION_PUBLISHED.'
        ]
      },
      {
        title: 'Audit Trail & Monitoring',
        items: [
          'POLICY_CREATED, VERSION_CREATED, VERSION_SUBMITTED, APPROVAL_RECORDED, VERSION_PUBLISHED, VERSION_ARCHIVED, RETENTION_UPDATED, and DOCUMENT_DOWNLOADED events populate PolicyAuditLog.',
          'Use audit entries to investigate incidents or confirm compliance workflows.'
        ]
      },
      {
        title: 'API & Automation Entry Points',
        ordered: true,
        items: [
          'Use GET /policies for inventory and review counts.',
          'Retrieve full history with GET /policies/:policyId.',
          'Create or update with POST /policies and PATCH /policies/:policyId.',
          'Manage versions using /versions, /submit, /decision, and /download endpoints.',
          'Always include X-Actor headers when automating interactions.'
        ]
      },
      {
        title: 'Operational Best Practices',
        items: [
          'Review cadences quarterly and remind owners about upcoming updates.',
          'Compare framework mappings against authoritative catalogs for drift.',
          'Back up the policy artifact bucket for production environments.',
          'Extend the policy service test suite when adjusting workflows.',
          'Use audit logs to reconstruct timelines during incidents.'
        ]
      }
    ]
  }
];

const quickHighlights = [
  {
    title: 'Audience',
    icon: FiUsers,
    description:
      'Guide authors, approvers, and administrators through their policy responsibilities with curated workflows.'
  },
  {
    title: 'Outcomes',
    icon: FiTarget,
    description:
      'Standardize version control, approvals, and retention decisions to deliver a repeatable compliance posture.'
  },
  {
    title: 'Exports',
    icon: FiClipboard,
    description:
      'Download Markdown or CSV exports to share updates with stakeholders or archive governance artifacts.'
  }
];

const implementationNotes = [
  {
    icon: FiLayers,
    title: 'Policy service deep dive',
    description: (
      <>
        Explore API surfaces, storage layout, and RBAC helpers in <code>docs/policies.md</code>.
      </>
    ),
    accent: 'brand.500'
  },
  {
    icon: FiCheckCircle,
    title: 'Test coverage',
    description: (
      <>
        Extend <code>apps/api/src/policy/policy.service.spec.ts</code> when you adjust approval
        workflows.
      </>
    ),
    accent: 'green.500'
  },
  {
    icon: FiArrowRight,
    title: 'Tenant onboarding',
    description: (
      <>
        Seed default actors via <code>apps/api/prisma/seed.ts</code> to mirror the guides.
      </>
    ),
    accent: 'purple.500'
  }
];

const currentCapabilities = [
  {
    icon: FiShield,
    title: 'Policy Orchestration',
    description:
      'Draft, version, approve, and publish governed policies with full retention controls and audit history.',
    accent: 'brand.500'
  },
  {
    icon: FiLayers,
    title: 'Framework Library',
    description:
      'Map controls across NIST, ISO, CIS, PCI, and custom frameworks to keep evidence and policies aligned.',
    accent: 'purple.500'
  },
  {
    icon: FiClipboard,
    title: 'Evidence Automation',
    description:
      'Route requests, store artifacts, and link policy obligations directly to evidence collections.',
    accent: 'teal.500'
  }
];

const upcomingCapabilities = [
  {
    icon: FiActivity,
    title: 'Continuous Monitoring',
    description: 'Stream live control telemetry to surface drifts and policy exceptions in real time.',
    accent: 'orange.400'
  },
  {
    icon: FiEdit,
    title: 'AI Policy Assistant',
    description: 'Draft and redline updates with contextual suggestions grounded in your control inventory.',
    accent: 'pink.400'
  },
  {
    icon: FiBell,
    title: 'Regulatory Change Alerts',
    description: 'Track regulatory bulletins and flag impacted policies the moment frameworks evolve.',
    accent: 'yellow.400'
  },
  {
    icon: FiZap,
    title: 'Workflow Automations',
    description: 'Trigger downstream reviews, evidence pulls, and ticketing actions when a policy shifts.',
    accent: 'cyan.400'
  }
];

const insightCards = [
  {
    icon: FiTrendingUp,
    title: 'Operational Focus',
    description:
      'Pair the guides with operational metrics to maintain visibility into policy review cadence, outstanding approvals, and mapping coverage.'
  },
  {
    icon: FiClipboard,
    title: 'Governance Ready',
    description:
      'Consolidate retention updates, audit events, and framework mappings in one place to accelerate auditor reviews.'
  },
  {
    icon: FiCheckCircle,
    title: 'Integrated Workflow',
    description:
      'Guides reference the same guardrails and APIs powering the UI, so automation or training stays aligned with production behavior.'
  }
];

const renderGuideSections = (sections: GuideSection[]) => (
  <Accordion allowMultiple>
    {sections.map((section) => (
      <AccordionItem key={section.title}>
        <h3>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="semibold">
              {section.title}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h3>
        <AccordionPanel pb={4}>
          {section.description ? (
            <Text color="gray.600" mb={3}>
              {section.description}
            </Text>
          ) : null}
          {section.ordered ? (
            <OrderedList spacing={2} pl={5}>
              {section.items.map((item) => (
                <li key={item}>
                  <Text>{item}</Text>
                </li>
              ))}
            </OrderedList>
          ) : (
            <UnorderedList spacing={2} pl={5}>
              {section.items.map((item) => (
                <li key={item}>
                  <Text>{item}</Text>
                </li>
              ))}
            </UnorderedList>
          )}
        </AccordionPanel>
      </AccordionItem>
    ))}
  </Accordion>
);

const downloadGuide = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const DocumentationPage = () => {
  const tileBg = useColorModeValue('white', 'gray.800');
  const tileBorder = useColorModeValue('gray.200', 'gray.700');
  const tileSubtitleColor = useColorModeValue('gray.600', 'gray.400');
  const tileTextColor = useColorModeValue('gray.700', 'gray.300');
  const quickHeadingColor = useColorModeValue('gray.500', 'gray.400');
  const quickTextColor = useColorModeValue('gray.600', 'gray.400');
  const heroGradient = useColorModeValue(
    'linear(to-r, brand.500, purple.500)',
    'linear(to-r, brand.400, purple.400)'
  );
  const heroBorder = useColorModeValue('brand.600', 'purple.300');

  const guideCards = useMemo(() => guides, []);
  const [tabIndex, setTabIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const activeGuide = guideCards[tabIndex];

  const handleJumpToGuide = (index: number) => {
    setTabIndex(index);
    window.setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <Stack spacing={10} align="stretch">
      <Box
        borderRadius="2xl"
        bgGradient={heroGradient}
        px={{ base: 6, md: 10 }}
        py={{ base: 6, md: 8 }}
        color="white"
        boxShadow="lg"
        borderWidth="1px"
        borderColor={heroBorder}
      >
        <Stack spacing={5}>
          <HStack spacing={4} align="flex-start">
            <Box
              bg="whiteAlpha.200"
              borderRadius="full"
              boxSize={12}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiHelpCircle} boxSize={6} />
            </Box>
            <Stack spacing={2} flex="1">
              <Heading size="lg">Documentation Hub</Heading>
              <Text color="whiteAlpha.800">
                Explore how Aegis powers governance today and where we are headed next. Launch the
                interactive guides, export Markdown for handoffs, and align teams around the evolving
                compliance operating model.
              </Text>
            </Stack>
          </HStack>
          <Wrap spacing={3}>
            <Tag bg="whiteAlpha.200" color="white" borderRadius="full" px={4} py={1}>
              Policy Authors
            </Tag>
            <Tag bg="whiteAlpha.200" color="white" borderRadius="full" px={4} py={1}>
              Approvers & Admins
            </Tag>
            <Tag bg="whiteAlpha.200" color="white" borderRadius="full" px={4} py={1}>
              Audit Readiness
            </Tag>
          </Wrap>
          <ButtonGroup size="sm" variant="solid">
            <Button
              leftIcon={<FiEye />}
              bg="white"
              color="brand.600"
              _hover={{ bg: 'whiteAlpha.900' }}
              onClick={() => handleJumpToGuide(0)}
            >
              Open User Guide
            </Button>
            <Button
              leftIcon={<FiEye />}
              bg="whiteAlpha.200"
              color="white"
              _hover={{ bg: 'whiteAlpha.300' }}
              onClick={() => handleJumpToGuide(1)}
            >
              Open Admin Guide
            </Button>
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              borderColor="whiteAlpha.600"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              onClick={() =>
                downloadGuide(guideCards[tabIndex].markdownFilename, guideCards[tabIndex].markdownContent)
              }
            >
              Download Markdown
            </Button>
          </ButtonGroup>
        </Stack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
        {quickHighlights.map((item) => (
          <Card
            key={item.title}
            borderWidth="1px"
            borderColor={tileBorder}
            bg={tileBg}
            borderRadius="xl"
            px={5}
            py={6}
            boxShadow="sm"
          >
            <Stack spacing={3}>
              <HStack spacing={3}>
                <Box
                  borderRadius="full"
                  bg="brand.500"
                  color="white"
                  boxSize={10}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={item.icon} boxSize={5} />
                </Box>
                <Heading size="sm">{item.title}</Heading>
              </HStack>
              <Text color={tileSubtitleColor} fontSize="sm">
                {item.description}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <Stack spacing={3} align="start">
        <Heading size="md">Current Platform Capabilities</Heading>
        <Text color={tileSubtitleColor} maxW="720px">
          Aegis today centralizes your governance program—from policy orchestration and framework
          mapping to evidence lifecycle management—so every control stays traceable.
        </Text>
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {currentCapabilities.map((capability) => (
          <Card
            key={capability.title}
            borderWidth="1px"
            borderColor={tileBorder}
            bg={tileBg}
            borderRadius="xl"
            px={5}
            py={6}
            boxShadow="sm"
          >
            <Stack spacing={3}>
              <HStack spacing={3} align="flex-start">
                <Box
                  borderRadius="full"
                  bg={capability.accent}
                  color="white"
                  boxSize={10}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={capability.icon} boxSize={5} />
                </Box>
                <Heading size="sm">{capability.title}</Heading>
              </HStack>
              <Text color={tileSubtitleColor} fontSize="sm">
                {capability.description}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <Stack spacing={3} align="start">
        <Heading size="md">Next on the Roadmap</Heading>
        <Text color={tileSubtitleColor} maxW="720px">
          We are extending Aegis beyond point-in-time reviews to continuous monitoring, AI-assisted
          authoring, and automated downstream workflows. Here is what’s coming soon.
        </Text>
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {upcomingCapabilities.map((capability) => (
          <Card
            key={capability.title}
            borderWidth="1px"
            borderColor={tileBorder}
            bg={tileBg}
            borderRadius="xl"
            px={5}
            py={6}
            boxShadow="sm"
          >
            <Stack spacing={3}>
              <HStack spacing={3} align="flex-start">
                <Box
                  borderRadius="full"
                  bg={`${capability.accent}1A`}
                  color={capability.accent}
                  boxSize={10}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={capability.icon} boxSize={5} />
                </Box>
                <Heading size="sm">{capability.title}</Heading>
              </HStack>
              <Text color={tileSubtitleColor} fontSize="sm">
                {capability.description}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {guideCards.map((guide, index) => {
          const isActive = tabIndex === index;

          return (
            <Card
              key={guide.key}
              borderWidth="1px"
              borderColor={isActive ? guide.accent : tileBorder}
              bg={tileBg}
              borderRadius="xl"
              height="100%"
              boxShadow={isActive ? 'md' : 'sm'}
              transition="transform 0.2s ease, box-shadow 0.2s ease"
              _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
            >
              <CardHeader pb={3}>
                <Stack spacing={3}>
                  <HStack spacing={3} align="flex-start">
                    <Box
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="full"
                      bg={`${guide.accent}1A`}
                      color={guide.accent}
                      boxSize={10}
                    >
                      <Icon as={guide.icon} boxSize={5} />
                    </Box>
                    <Stack spacing={1}>
                      <Heading size="md">{guide.title}</Heading>
                      <Text fontSize="sm" color={tileSubtitleColor}>
                        {guide.subtitle}
                      </Text>
                    </Stack>
                  </HStack>
                </Stack>
              </CardHeader>
              <CardBody pt={0} pb={3}>
                <Stack spacing={2.5}>
                  {guide.badges.map((badge) => (
                    <HStack key={badge} spacing={3} align="center">
                      <Box
                        w="10px"
                        h="10px"
                        borderRadius="full"
                        bg={guide.accent}
                        opacity={0.8}
                        flexShrink={0}
                      />
                      <Text color={tileTextColor} fontWeight="medium">
                        {badge}
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              </CardBody>
              <CardFooter justifyContent="space-between" flexWrap="wrap" gap={3} pt={0}>
                <ButtonGroup size="sm">
                  <Button
                    leftIcon={<FiEye />}
                    colorScheme={isActive ? 'brand' : 'gray'}
                    variant={isActive ? 'solid' : 'outline'}
                    onClick={() => handleJumpToGuide(index)}
                  >
                    View Guide
                  </Button>
                  <Button
                    leftIcon={<FiDownload />}
                    variant="ghost"
                    onClick={() => downloadGuide(guide.markdownFilename, guide.markdownContent)}
                  >
                    Download
                  </Button>
                </ButtonGroup>
              </CardFooter>
            </Card>
          );
        })}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {insightCards.map((card) => (
          <Card
            key={card.title}
            borderWidth="1px"
            borderColor={tileBorder}
            bg={tileBg}
            borderRadius="xl"
            p={5}
            boxShadow="sm"
          >
            <Stack spacing={3}>
              <HStack spacing={3}>
                <Box
                  borderRadius="full"
                  bg="gray.700"
                  color="white"
                  boxSize={10}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={card.icon} boxSize={5} />
                </Box>
                <Heading size="sm">{card.title}</Heading>
              </HStack>
              <Text color={tileSubtitleColor} fontSize="sm">
                {card.description}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card
          borderWidth="1px"
          borderColor={tileBorder}
          bg={tileBg}
          borderRadius="xl"
          boxShadow="sm"
          transition="transform 0.2s ease, box-shadow 0.2s ease"
          _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
        >
          <CardHeader pb={2}>
            <Heading size="sm" textTransform="uppercase" color={quickHeadingColor}>
              Quick Links
            </Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Stack spacing={3}>
              {implementationNotes.map((note) => (
                <HStack align="flex-start" spacing={3} key={note.title}>
                  <Icon as={note.icon} color={note.accent} mt={1} />
                  <Box>
                    <Text fontWeight="semibold" color={tileTextColor}>
                      {note.title}
                    </Text>
                    <Text fontSize="sm" color={quickTextColor}>
                      {note.description}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </Stack>
          </CardBody>
        </Card>

        <Card
          borderWidth="1px"
          borderColor={tileBorder}
          bg={tileBg}
          borderRadius="xl"
          boxShadow="sm"
          transition="transform 0.2s ease, box-shadow 0.2s ease"
          _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
        >
          <CardHeader pb={2}>
            <Heading size="sm" textTransform="uppercase" color={quickHeadingColor}>
              Implementation Notes
            </Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Stack spacing={3} fontSize="sm" color={quickTextColor}>
              <Text>
                Policy artifacts are stored under <code>tmp/policy-artifacts</code> until a remote
                bucket is configured. Ensure backups for production workloads.
              </Text>
              <Text>
                Approval guardrails hinge on the <code>PolicyActorGuard</code>; integrations must set the{' '}
                <code>X-Actor-Id</code> and <code>X-Actor-Email</code> headers.
              </Text>
              <Text>
                Retention updates and approvals generate audit events that surface in the UI and API,
                making compliance reporting straightforward.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card
        ref={contentRef}
        borderWidth="1px"
        borderColor={tileBorder}
        bg={tileBg}
        borderRadius="xl"
        boxShadow="md"
      >
        <CardHeader borderBottomWidth="1px" borderColor={tileBorder}>
          <Stack spacing={4}>
            <HStack justify="space-between" align="flex-start" spacing={4} flexWrap="wrap">
              <Stack spacing={1} flex="1" minW="240px">
                <Heading size="md">{activeGuide.title}</Heading>
                <Text color={tileSubtitleColor}>{activeGuide.subtitle}</Text>
              </Stack>
              <ButtonGroup size="sm" spacing={2} mt={{ base: 3, md: 0 }}>
                <Button leftIcon={<FiDownload />} variant="ghost" onClick={() => downloadGuide(activeGuide.markdownFilename, activeGuide.markdownContent)}>
                  Download Markdown
                </Button>
              </ButtonGroup>
            </HStack>
            <Divider />
            <Tabs
              index={tabIndex}
              onChange={setTabIndex}
              variant="enclosed"
              colorScheme="brand"
              isFitted
            >
              <TabList>
                {guideCards.map((guide) => (
                  <Tab key={guide.key} fontWeight="semibold">
                    {guide.title}
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {guideCards.map((guide) => (
                  <TabPanel key={guide.key} px={0}>
                    <Stack spacing={4}>
                      <Text color={tileSubtitleColor}>{guide.subtitle}</Text>
                      {renderGuideSections(guide.sections)}
                    </Stack>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </Stack>
        </CardHeader>
      </Card>
    </Stack>
  );
};

export default DocumentationPage;
