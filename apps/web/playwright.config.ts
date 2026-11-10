import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3200);
export const TEST_DB = process.env.E2E_DATABASE_URL ?? 'postgresql://postgres@localhost:5432/atlas_test';

/** E2E runs against a production build labelled "preview" with SYNTHETIC data only. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-results.json' }]],
  globalSetup: './e2e/global-setup.ts',
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
    screenshot: 'only-on-failure',
    locale: 'en-GB',
    timezoneId: 'Asia/Jakarta',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      DATABASE_URL: TEST_DB,
      ATLAS_ENV: 'preview',
      ATLAS_CONTENT_MIN_REVIEW: 'agent_reviewed',
      NODE_ENV: 'production',
    },
  },
});
