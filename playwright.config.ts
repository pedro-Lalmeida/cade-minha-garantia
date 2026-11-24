import { defineConfig, devices } from "@playwright/test"

const baseURL = "http://localhost:3000"

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 360_000,
  expect: { timeout: 30_000 },
  workers: 1,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    channel: process.env.PLAYWRIGHT_CHANNEL,
    locale: "pt-BR",
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: process.env.PLAYWRIGHT_PRODUCTION === "1"
      ? "npm start -- --hostname localhost"
      : "npm run dev -- --hostname localhost",
    url: `${baseURL}/login`,
    timeout: 180_000,
    reuseExistingServer: true,
  },
})
