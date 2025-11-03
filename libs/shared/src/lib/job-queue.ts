export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobRecord<TPayload = unknown, TResult = unknown> {
  id: string;
  name: string;
  payload: TPayload;
  status: JobStatus;
  enqueuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  result: TResult | null;
  error: string | null;
}

export type JobProcessor<TPayload, TResult> = (
  job: JobRecord<TPayload>
) => Promise<TResult> | TResult;

const JOB_EVENTS = {
  created: 'job:created',
  updated: 'job:updated',
  completed: 'job:completed',
  failed: 'job:failed'
} as const;

export interface JobQueue {
  on(event: (typeof JOB_EVENTS)[keyof typeof JOB_EVENTS], listener: (job: JobRecord) => void): void;
  off(event: (typeof JOB_EVENTS)[keyof typeof JOB_EVENTS], listener: (job: JobRecord) => void): void;
  registerProcessor<TPayload, TResult>(name: string, processor: JobProcessor<TPayload, TResult>): void;
  unregisterProcessor(name: string): void;
  enqueue<TPayload>(name: string, payload: TPayload): Promise<JobRecord<TPayload>>;
  list<TPayload = unknown, TResult = unknown>(name?: string): Array<JobRecord<TPayload, TResult>>;
  get<TPayload = unknown, TResult = unknown>(id: string): JobRecord<TPayload, TResult> | null;
  reset(): void;
}

type JobListener = (job: JobRecord) => void;

const scheduleAsync = (callback: () => void) => {
  const asyncScheduler = (globalThis as { setImmediate?: (fn: () => void) => void }).setImmediate;
  if (typeof asyncScheduler === 'function') {
    asyncScheduler(callback);
  } else {
    void Promise.resolve().then(callback);
  }
};

type CryptoLike = { randomUUID?: () => string };

const generateId = (): string => {
  const cryptoApi = (globalThis as { crypto?: CryptoLike }).crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  return `job-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
};

class JobEventHub {
  private readonly listeners = new Map<string, Set<JobListener>>();

  on(event: string, listener: JobListener) {
    const handlers = this.listeners.get(event) ?? new Set<JobListener>();
    handlers.add(listener);
    this.listeners.set(event, handlers);
  }

  off(event: string, listener: JobListener) {
    const handlers = this.listeners.get(event);
    if (!handlers) {
      return;
    }
    handlers.delete(listener);
    if (handlers.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit(event: string, job: JobRecord) {
    const handlers = this.listeners.get(event);
    if (!handlers) {
      return;
    }
    for (const handler of handlers) {
      handler(job);
    }
  }

  removeAllListeners() {
    this.listeners.clear();
  }
}

export class InMemoryJobQueue implements JobQueue {
  private readonly jobs = new Map<string, JobRecord>();
  private readonly pending: string[] = [];
  private readonly processors = new Map<string, JobProcessor<unknown, unknown>>();
  private readonly events = new JobEventHub();
  private processing = false;

  on(event: (typeof JOB_EVENTS)[keyof typeof JOB_EVENTS], listener: (job: JobRecord) => void) {
    this.events.on(event, listener);
  }

  off(event: (typeof JOB_EVENTS)[keyof typeof JOB_EVENTS], listener: (job: JobRecord) => void) {
    this.events.off(event, listener);
  }

  registerProcessor<TPayload, TResult>(
    name: string,
    processor: JobProcessor<TPayload, TResult>
  ) {
    this.processors.set(name, processor as JobProcessor<unknown, unknown>);
    this.scheduleProcessing();
  }

  unregisterProcessor(name: string) {
    this.processors.delete(name);
  }

  async enqueue<TPayload>(name: string, payload: TPayload): Promise<JobRecord<TPayload>> {
    const job: JobRecord<TPayload> = {
      id: generateId(),
      name,
      payload,
      status: 'queued',
      enqueuedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null
    };

    this.jobs.set(job.id, job as JobRecord);
    this.pending.push(job.id);
    this.events.emit(JOB_EVENTS.created, this.clone(job));
    this.scheduleProcessing();
    return this.clone(job);
  }

  list<TPayload = unknown, TResult = unknown>(name?: string): Array<JobRecord<TPayload, TResult>> {
    const values = Array.from(this.jobs.values());
    const filtered = name ? values.filter((job) => job.name === name) : values;
    return filtered
      .map((job) => this.clone(job) as JobRecord<TPayload, TResult>)
      .sort((a, b) => b.enqueuedAt.localeCompare(a.enqueuedAt));
  }

  get<TPayload = unknown, TResult = unknown>(id: string): JobRecord<TPayload, TResult> | null {
    const job = this.jobs.get(id);
    return job ? (this.clone(job) as JobRecord<TPayload, TResult>) : null;
  }

  reset() {
    this.pending.splice(0, this.pending.length);
    this.jobs.clear();
    this.processors.clear();
    this.events.removeAllListeners();
    this.processing = false;
  }

  private scheduleProcessing() {
    if (this.processing) {
      return;
    }

    this.processing = true;
    scheduleAsync(async () => {
      try {
        await this.processJobs();
      } finally {
        this.processing = false;
        if (this.hasRunnableJobs()) {
          this.scheduleProcessing();
        }
      }
    });
  }

  private hasRunnableJobs(): boolean {
    return this.pending.some((id) => {
      const job = this.jobs.get(id);
      if (!job) {
        return false;
      }
      return job.status === 'queued' && this.processors.has(job.name);
    });
  }

  private async processJobs() {
    while (true) {
      const nextIndex = this.pending.findIndex((id) => {
        const job = this.jobs.get(id);
        return job && job.status === 'queued' && this.processors.has(job.name);
      });

      if (nextIndex === -1) {
        break;
      }

      const [jobId] = this.pending.splice(nextIndex, 1);
      const job = this.jobs.get(jobId);

      if (!job) {
        continue;
      }

      const processor = this.processors.get(job.name);
      if (!processor) {
        // Processor could have been removed after selection; requeue and exit.
        this.pending.unshift(jobId);
        break;
      }

      job.status = 'processing';
      job.startedAt = new Date().toISOString();
      this.events.emit(JOB_EVENTS.updated, this.clone(job));

      try {
        const result = await processor(job);
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.result = result;
        this.events.emit(JOB_EVENTS.completed, this.clone(job));
      } catch (error) {
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = error instanceof Error ? error.message : String(error);
        this.events.emit(JOB_EVENTS.failed, this.clone(job));
      } finally {
        this.events.emit(JOB_EVENTS.updated, this.clone(job));
      }
    }
  }

  private clone<TPayload, TResult>(job: JobRecord<TPayload, TResult>): JobRecord<TPayload, TResult> {
    return {
      ...job,
      payload: job.payload,
      result: job.result,
      error: job.error
    };
  }
}

export const jobQueue: JobQueue = new InMemoryJobQueue();

export const createJobQueue = () => new InMemoryJobQueue();
