import { defineConfig, devices } from '@playwright/test';

const isGithubPagesPath = '/music-catalog-editor/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:4173${isGithubPagesPath}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: `http://127.0.0.1:4173${isGithubPagesPath}`,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_BASE_PATH: isGithubPagesPath,
      PLAYWRIGHT_BASE_PATH: isGithubPagesPath,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});