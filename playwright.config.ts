import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath =
  process.env.CHROME_PATH ??
  (process.platform === "darwin" && existsSync(macChrome) ? macChrome : undefined);
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
    locale: "sk-SK",
    timezoneId: "Europe/Bratislava",
    launchOptions: {
      executablePath,
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  reporter: [["list"]],
});
