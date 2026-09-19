import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    // Existing interaction regressions explicitly use English; Chinese defaults
    // are checked in chinese-mock.spec.ts with this preference cleared.
    storageState: {
      cookies: [
        {
          name: "shirone-locale",
          value: "en",
          domain: "127.0.0.1",
          path: "/",
          expires: -1,
          httpOnly: false,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    },
    baseURL: "http://127.0.0.1:4322",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm dev --host 127.0.0.1",
      url: "http://127.0.0.1:4322",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command:
        "NITRO_PORT=4323 NITRO_HOST=127.0.0.1 node .output/server/index.mjs",
      url: "http://127.0.0.1:4323/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
