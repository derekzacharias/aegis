import axios, { AxiosInstance } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { ScheduleDefinition, ScheduleExecutionResult } from '@compliance/shared';
import { ScheduleStore } from '../interfaces/schedule-store';

@Injectable()
export class HttpScheduleStore implements ScheduleStore {
  private readonly logger = new Logger(HttpScheduleStore.name);

  private readonly client: AxiosInstance;

  constructor(apiBaseUrl: string) {
    this.client = axios.create({
      baseURL: apiBaseUrl.replace(/\/$/, '')
    });
  }

  async listActiveSchedules(): Promise<ScheduleDefinition[]> {
    const response = await this.client.get<{ data: ScheduleDefinition[] }>('/scheduler');
    return response.data.data ?? response.data;
  }

  async markExecution(result: ScheduleExecutionResult, nextRun: string): Promise<ScheduleDefinition | null> {
    try {
      const response = await this.client.post<{ data: ScheduleDefinition }>(`/scheduler/${result.scheduleId}/executions`, {
        result,
        nextRun
      });
      return response.data.data ?? response.data;
    } catch (error) {
      this.logger.error(`Failed to mark execution for schedule ${result.scheduleId}`, error as Error);
      return null;
    }
  }

  async upsert(schedule: ScheduleDefinition): Promise<ScheduleDefinition> {
    const response = await this.client.put<{ data: ScheduleDefinition }>(`/scheduler/${schedule.id}`, schedule);
    return response.data.data ?? response.data;
  }

  async remove(scheduleId: string): Promise<void> {
    await this.client.delete(`/scheduler/${scheduleId}`);
  }
}
