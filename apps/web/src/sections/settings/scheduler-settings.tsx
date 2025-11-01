import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Select,
  Spinner,
  Stack,
  Switch,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { Schedule, useSchedules, useUpdateSchedule } from '../../hooks/use-schedules';

const frequencyLabels: Record<Schedule['frequency'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  custom: 'Custom'
};

const formatNextRun = (isoDate: string) => dayjs(isoDate).format('MMM D, YYYY h:mm A');

const toInputValue = (isoDate: string) => dayjs(isoDate).format('YYYY-MM-DDTHH:mm');

const fromInputValue = (value: string) => dayjs(value).toISOString();

const ScheduleList = ({
  schedules,
  selectedId,
  onSelect
}: {
  schedules: Schedule[];
  selectedId?: string;
  onSelect: (scheduleId: string) => void;
}) => {
  if (schedules.length === 0) {
    return (
      <Alert status="info" borderRadius="lg">
        <AlertIcon />
        <AlertDescription>No schedules defined yet. Create one using the form.</AlertDescription>
      </Alert>
    );
  }

  return (
    <VStack align="stretch" spacing={3}>
      {schedules.map((schedule) => {
        const isSelected = schedule.id === selectedId;
        return (
          <Box
            key={schedule.id}
            borderWidth="1px"
            borderColor={isSelected ? 'brand.400' : 'gray.700'}
            borderRadius="lg"
            p={4}
            bg={isSelected ? 'gray.800' : 'transparent'}
            cursor="pointer"
            onClick={() => onSelect(schedule.id)}
            transition="border-color 0.2s ease"
          >
            <HStack justify="space-between" align="start">
              <Box>
                <Heading size="sm" mb={1}>
                  {schedule.name}
                </Heading>
                <Text fontSize="sm" color="gray.400">
                  {frequencyLabels[schedule.frequency]} • Next run {formatNextRun(schedule.nextRun)}
                </Text>
              </Box>
              <Box as="span" px={2} py={1} borderRadius="md" bg={schedule.isActive ? 'green.900' : 'gray.700'}>
                <Text fontSize="xs" color={schedule.isActive ? 'green.200' : 'gray.300'}>
                  {schedule.isActive ? 'Active' : 'Paused'}
                </Text>
              </Box>
            </HStack>
            {schedule.description && (
              <Text mt={2} fontSize="sm" color="gray.300">
                {schedule.description}
              </Text>
            )}
          </Box>
        );
      })}
    </VStack>
  );
};

const SchedulerSettings = () => {
  const toast = useToast();
  const { data: schedules = [], isLoading, isFetching } = useSchedules();
  const [selectedId, setSelectedId] = useState<string>();
  const [formState, setFormState] = useState({
    frequency: 'weekly' as Schedule['frequency'],
    nextRun: dayjs().add(1, 'day').toISOString(),
    isActive: true
  });

  const updateMutation = useUpdateSchedule();

  const selectedSchedule = useMemo(() => {
    if (schedules.length === 0) {
      return undefined;
    }

    if (selectedId) {
      return schedules.find((schedule) => schedule.id === selectedId) ?? schedules[0];
    }

    return schedules[0];
  }, [schedules, selectedId]);

  useEffect(() => {
    if (!selectedId && schedules.length > 0) {
      setSelectedId(schedules[0].id);
    }
  }, [selectedId, schedules]);

  useEffect(() => {
    if (!selectedSchedule) {
      return;
    }

    setFormState({
      frequency: selectedSchedule.frequency,
      nextRun: selectedSchedule.nextRun,
      isActive: selectedSchedule.isActive
    });
  }, [selectedSchedule]);

  const handleSubmit = async () => {
    if (!selectedSchedule) {
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedSchedule.id,
      organizationId: selectedSchedule.organizationId,
      payload: {
        frequency: formState.frequency,
        nextRun: formState.nextRun,
        isActive: formState.isActive
      }
    });

    toast({
      title: 'Schedule updated',
      description: `${selectedSchedule.name} will now run ${frequencyLabels[formState.frequency].toLowerCase()}.`,
      status: 'success',
      duration: 4000,
      isClosable: true
    });
  };

  if (isLoading && schedules.length === 0) {
    return (
      <HStack justify="center" py={12}>
        <Spinner />
        <Text color="gray.400">Loading schedules…</Text>
      </HStack>
    );
  }

  return (
    <Stack spacing={6} align="stretch">
      <Box>
        <Heading size="md">Automation Schedules</Heading>
        <Text color="gray.400">Review cadence definitions and adjust frequency or pause automations.</Text>
      </Box>
      <Grid templateColumns={{ base: '1fr', xl: '2fr 3fr' }} gap={6} alignItems="start">
        <GridItem>
          <ScheduleList schedules={schedules} selectedId={selectedSchedule?.id} onSelect={setSelectedId} />
        </GridItem>
        <GridItem>
          {selectedSchedule ? (
            <Box borderWidth="1px" borderColor="gray.700" borderRadius="lg" p={6}>
              <Heading size="sm" mb={4}>
                {selectedSchedule.name}
              </Heading>
              <VStack align="stretch" spacing={4} as="form" onSubmit={(event) => event.preventDefault()}>
                <FormControl>
                  <FormLabel>Frequency</FormLabel>
                  <Select
                    value={formState.frequency}
                    onChange={(event) =>
                      setFormState((state) => ({
                        ...state,
                        frequency: event.target.value as Schedule['frequency']
                      }))
                    }
                  >
                    {Object.entries(frequencyLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Next Scheduled Run</FormLabel>
                  <Input
                    type="datetime-local"
                    value={toInputValue(formState.nextRun)}
                    onChange={(event) =>
                      setFormState((state) => ({
                        ...state,
                        nextRun: fromInputValue(event.target.value)
                      }))
                    }
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Active</FormLabel>
                  <Switch
                    colorScheme="brand"
                    isChecked={formState.isActive}
                    onChange={(event) =>
                      setFormState((state) => ({
                        ...state,
                        isActive: event.target.checked
                      }))
                    }
                  />
                </FormControl>
                <Button
                  colorScheme="brand"
                  alignSelf="flex-start"
                  isLoading={updateMutation.isPending}
                  onClick={handleSubmit}
                  isDisabled={updateMutation.isPending || isFetching}
                >
                  Save Changes
                </Button>
              </VStack>
            </Box>
          ) : (
            <Alert status="info" variant="left-accent" borderRadius="lg">
              <AlertIcon />
              <AlertDescription>Select a schedule to edit its cadence.</AlertDescription>
            </Alert>
          )}
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default SchedulerSettings;
