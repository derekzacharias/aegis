import { Injectable, Logger } from '@nestjs/common';

export type MetricLabels = Record<string, string | number | boolean>;

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  incrementCounter(name: string, amount = 1, labels: MetricLabels = {}): void {
    this.logger.log(
      JSON.stringify({
        metric: name,
        type: 'counter',
        value: amount,
        labels
      })
    );
  }

  recordDuration(name: string, durationMs: number, labels: MetricLabels = {}): void {
    this.logger.log(
      JSON.stringify({
        metric: name,
        type: 'timer',
        value: durationMs,
        labels
      })
    );
  }
}
