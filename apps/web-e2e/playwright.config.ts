import { defineConfig, devices } from '@playwright/test';

const baseUrl = process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://127.0.0.1:4300';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  retries: process.env['CI'] ? 1 : 0,
  use: {
    baseURL: baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: `npx nx serve web --port 4300 --host 0.0.0.0`,
    url: baseUrl,
    reuseExistingServer: true,
    timeout: 120_000
  }
});
