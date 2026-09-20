import { defineConfig, devices } from "@playwright/test";
// Public UI regression against the built Node SSR artifact, without Vite/HMR.
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  timeout: 90000,
  grep: /album detail|album external|album uses|mobile viewer|album original|article sidebars|short viewports|annotations open|annotations work|option group|mobile tab keyboard|abbreviation|trees retain|switching files|Mermaid diagrams|article (header|code|headings|content|controls)|homepage resources|all public route|Chinese mock|language switch|refresh entrance|route progress|theme panel|Theme Color|More menu|protected article decrypts|home has no serious|display preferences|without JavaScript|desktop shell|mobile retains|archive grouping/,
  use: {
    ...devices["Desktop Chrome"],
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
