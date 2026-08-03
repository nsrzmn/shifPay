import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "mobile-chromium", use: { ...devices["iPhone 13"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000/login",
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      APP_PASSCODE: "correct-horse-battery-staple",
      GOOGLE_SHEET_URL: "https://docs.google.com/spreadsheets/d/test-sheet-id/edit",
      GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify({
        type: "service_account",
        client_email: "shiftpay@test-project.iam.gserviceaccount.com",
        private_key: "test-key",
      }),
    },
  },
});
