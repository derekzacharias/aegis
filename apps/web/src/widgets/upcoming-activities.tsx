import {
  Badge,
  Box,
  Heading,
  HStack,
  List,
  ListItem,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';

const activities = [
  {
    title: 'FedRAMP Control AC-2 reauthorization',
    due: 'Due in 2 days',
    owner: 'Alex Smith',
    status: 'High Risk'
  },
  {
    title: 'CIS Control 4: Vulnerability scan import',
    due: 'Scheduled tomorrow',
    owner: 'Automation Agent',
    status: 'Ingest'
  },
  {
    title: 'PCI DSS Control 8 evidence review',
    due: 'Due in 5 days',
    owner: 'Maria Chen',
    status: 'Pending Review'
  }
];

const UpcomingActivities = () => {
  const bg = useColorModeValue('gray.100', 'gray.800');

  return (
    <Box bg={bg} borderRadius="xl" p={6}>
      <Heading size="md" mb={4}>
        Upcoming Activity
      </Heading>
      <List spacing={4}>
        {activities.map((activity) => (
          <ListItem
            key={activity.title}
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            borderRadius="md"
            p={4}
          >
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text fontWeight="semibold">{activity.title}</Text>
                <Badge colorScheme="purple">{activity.status}</Badge>
              </HStack>
              <HStack justify="space-between" fontSize="sm" color="gray.400">
                <Text>{activity.owner}</Text>
                <Text>{activity.due}</Text>
              </HStack>
            </VStack>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default UpcomingActivities;
