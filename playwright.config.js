const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 60_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: [
        ['list'],
        ['html', { open: 'never' }]
    ],
    use: {
        baseURL: 'http://127.0.0.1:8765',
        headless: true,
        ignoreHTTPSErrors: true,
        viewport: { width: 1366, height: 900 }
    },
    webServer: {
        command: 'node tests/server.js',
        port: 8765,
        reuseExistingServer: true,
        timeout: 30_000
    },
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } }
    ]
});
