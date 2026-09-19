import { defineConfig, devices } from "@playwright/test";
// Public UI regression against the built Node SSR artifact, without Vite/HMR.
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  timeout: 90000,
  grep: /theme panel|More menu|protected article decrypts|home has no serious|display preferences|without JavaScript|desktop shell|mobile retains|archive grouping/,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4323",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "NITRO_PORT=4323 NITRO_HOST=127.0.0.1 node .output/server/index.mjs",
    url: "http://127.0.0.1:4323/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  projects: [{ name: "chromium" }],
});
