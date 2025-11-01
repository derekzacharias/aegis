import { Box, Heading, HStack, Icon, Stack, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { FiClock } from 'react-icons/fi';
import { Schedule } from '../hooks/use-schedules';

const typeLabels: Record<Schedule['type'], string> = {
  'evidence-review-reminder': 'Evidence Review Reminder',
  'recurring-assessment': 'Recurring Assessment',
  'agent-health-check': 'Agent Health Check'
};

const UpcomingSchedules = ({ schedules }: { schedules: Schedule[] }) => {
  const upcoming = schedules.slice(0, 4);

  return (
    <Box bg="gray.800" borderRadius="xl" p={6} borderWidth="1px" borderColor="gray.700">
      <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
        <Icon as={FiClock} color="brand.300" /> Upcoming Automations
      </Heading>
      {upcoming.length === 0 ? (
        <Text fontSize="sm" color="gray.400">
          No automation schedules configured yet.
        </Text>
      ) : (
        <Stack spacing={4} divider={<Box borderBottomWidth="1px" borderColor="gray.700" />}> 
          {upcoming.map((schedule) => (
            <HStack key={schedule.id} justify="space-between" align="start">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">{schedule.name}</Text>
                <Text fontSize="sm" color="gray.400">
                  {typeLabels[schedule.type]}
                </Text>
              </VStack>
              <VStack align="end" spacing={1}>
                <Text fontSize="sm" color="gray.300">
                  {dayjs(schedule.nextRun).format('MMM D, YYYY h:mm A')}
                </Text>
                <Text fontSize="xs" color={schedule.isActive ? 'green.300' : 'gray.500'}>
                  {schedule.isActive ? 'Scheduled' : 'Paused'}
                </Text>
              </VStack>
            </HStack>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default UpcomingSchedules;
