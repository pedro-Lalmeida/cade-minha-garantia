import { defineConfig, devices } from "@playwright/test"

const port = process.env.PLAYWRIGHT_PORT ?? "3000"
const baseURL = `http://localhost:${port}`

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
      ? `npm start -- --hostname localhost --port ${port}`
      : `npm run dev -- --hostname localhost --port ${port}`,
    url: `${baseURL}/login`,
    timeout: 180_000,
    reuseExistingServer: !process.env.PLAYWRIGHT_PORT,
  },
})
