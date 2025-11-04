# Testing Environments

Our Jest suites now distinguish between Node-backed unit tests and browser-like DOM tests powered by `jest-environment-jsdom`. This document captures when to reach for each environment, how the shared configuration works, and practical debugging tips for contributors.

## Environment selection

- **Node** – default for back-end services (`apps/api`, `apps/worker`) and shared libraries. Provides fast execution with access to native Node APIs (crypto, filesystem, timers). Jest configs call `withNodeEnvironment` from `tools/testing/jest-config.ts`.
- **jsdom** – opt-in for UI-oriented code that touches the DOM (React components, hooks). Projects wrap their config with `withJsdomEnvironment` to automatically inject `jest-environment-jsdom` plus polyfills defined in `tools/testing/setup-jsdom.ts`.

When creating a new project, choose the helper that matches the code under test. Swapping environments later is as simple as switching helpers in the generated `jest.config.ts`.

## Shared polyfills and globals

- `tools/testing/setup-jsdom.ts` standardises DOM shims (`matchMedia`, `ResizeObserver`, `scrollTo`, `crypto.randomUUID`) and ensures `TextEncoder/TextDecoder` are present during tests.
- TypeScript automatically loads `types/jest-dom.d.ts` and `types/dom-polyfills.d.ts`, so custom jest-dom matchers and DOM shims are available without editing local `tsconfig` files.
- Project-specific setup (e.g. adding testing-library helpers) still lives under `<project>/src/test-setup.ts` and is appended after the shared jsdom setup.

## Scripts and Nx targets

- `npm run test` – full test sweep (all environments).
- `npm run test:node` – only Node-based projects (`api`, `worker`, `shared`).
- `npm run test:dom` – all jsdom consumers (currently `web`).
- `npm run affected:test` / `npm run affected:lint` – Nx-aware CI commands that respect changed files.

CI pipelines invoking `nx run-many --target test --all` inherit these environment changes automatically; no workflow updates are required.

## Debugging DOM test failures

- Run a focused suite in-band to see real-time console output: `nx test web --runInBand --watch`.
- Use `--testNamePattern "<regex>"` to narrow to a single case.
- Inspect the DOM tree via [Testing Library debugging helpers](https://testing-library.com/docs/dom-testing-library/api-debugging/); `screen.debug()` now works out of the box because jsdom is registered before project-specific setup runs.
- If a browser API is still missing, extend `tools/testing/setup-jsdom.ts` with the required shim and document the addition.

## Playwright smoke coverage

We now ship a light Playwright harness under `apps/web-e2e` that exercises the sign-in screen end to end. The config starts the Vite dev server automatically and targets Chromium for quick feedback.

- `npm run test:e2e` (or `nx run web-e2e:e2e`) runs the Playwright suite. Install browsers the first time with `npx playwright install`.
- Customize base URL by exporting `PLAYWRIGHT_BASE_URL` before running the tests. The web server starts on port `4300` by default.
- Test files live in `apps/web-e2e/tests`. Add additional specs alongside `smoke.spec.ts` to cover other flows.

> Heads up: the CI environment still requires pseudo-IPC socket support. Once build agents permit that, wire `npm run test:e2e` into the pipelines so the cache includes Playwright traces.
