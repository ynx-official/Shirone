import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testMatch: [
    "admin-ui.spec.ts",
    "site.spec.ts",
    "features.spec.ts",
    "theme-settings.spec.ts",
  ],
  grep: /admin |navigation, tabs|media |local edit|invalid JSON|local Markdown|theme panel preserves/,
  webServer: {
    command: "pnpm dev --host 127.0.0.1",
    url: "http://127.0.0.1:4322",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
