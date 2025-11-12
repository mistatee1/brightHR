import { defineConfig, devices } from '@playwright/test';

const retries = process.env.PLAYWRIGHT_RETRIES ? Number(process.env.PLAYWRIGHT_RETRIES) : 1;

export default defineConfig({
    testDir: './tests',
    retries,
    timeout: 60_000,
    expect: {
        timeout: 5000
    },
    reporter: [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
    ],
    use: {
        headless: true,
        viewport: { width: 1280, height: 800 },
        actionTimeout: 10_000,
        ignoreHTTPSErrors: true,
        trace: 'on-first-retry'
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
    ]
});
