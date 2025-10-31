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

export type Activity = {
  id: string;
  title: string;
  due: string;
  owner: string;
  status: string;
};

interface UpcomingActivitiesProps {
  activities: Activity[];
}

const UpcomingActivities = ({ activities }: UpcomingActivitiesProps) => {
  const bg = useColorModeValue('gray.100', 'gray.800');

  return (
    <Box bg={bg} borderRadius="xl" p={6}>
      <Heading size="md" mb={4}>
        Upcoming Activity
      </Heading>
      <List spacing={4}>
        {activities.map((activity) => (
          <ListItem
            key={activity.id}
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
