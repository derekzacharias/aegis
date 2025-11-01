# Continuous Monitoring Scheduler

The scheduler coordinates recurring automation across the platform. It currently drives three baseline job types:

- Evidence review reminders
- Recurring assessment drafts
- Agent health checks

## Architecture

```
┌──────────────────┐     HTTP (REST)      ┌────────────────────────────────────┐
│  Web (React)     │ ───────────────────▶ │  API (/api/scheduler)              │
│  Chakra UI forms │                      │  Nest service + in-memory store*   │
└──────────────────┘                      └────────────────────────────────────┘
          ▲                                         │
          │                                         │ fetch definitions / updates
          │                                         ▼
┌──────────────────┐      schedules + handlers   ┌───────────────────────────────┐
│ Worker (Nest)    │ ◀────────────────────────── │ ScheduleRunner + handlers     │
│ ScheduleRunner   │                             │ (evidence, assessment, agent) │
└──────────────────┘                             └───────────────────────────────┘
```

> *The API keeps schedules in memory for the MVP. Prisma tables are defined and will back the same service during the
> persistence milestone.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `SCHEDULER_REFRESH_INTERVAL_MS` | `180000` (3 minutes) | How frequently the worker polls for new or changed schedules. |
| `SCHEDULER_API_BASE_URL` | unset | When provided, the worker fetches schedules from the API over HTTP instead of the in-memory fallback. |

## Local Usage

1. Start the API (`npm run dev:api`) and the worker (`nx serve worker` or `npx ts-node apps/worker/src/main.ts`).
2. Visit **Settings → Automation** to adjust cadence and pause schedules.
3. The worker logs queue new runs and stub outputs per handler. Replace the log statements with email/task integrations when ready.

## Testing

- `npm run test worker` covers schedule execution and refresh behaviour.
- `npm run test api` includes coverage for CRUD operations.

Extend tests with actual Prisma-backed assertions once the persistence layer is enabled.
