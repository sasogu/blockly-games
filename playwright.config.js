// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 60 * 1000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:8321',
    // Locally you can point to a system browser: CHROMIUM_PATH=/usr/bin/chromium
    launchOptions: process.env.CHROMIUM_PATH ?
        { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'python3 -m http.server 8321 --directory appengine',
    url: 'http://localhost:8321/index.html',
    reuseExistingServer: !process.env.CI,
  },
});
