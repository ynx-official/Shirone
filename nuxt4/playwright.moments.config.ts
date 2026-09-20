import config from "./playwright.config";
const baseURL = process.env.MOMENTS_TEST_URL || "http://localhost:4322";
const storage = config.use?.storageState;
// Run against an already managed dev or production server, including Windows.
export default {
  ...config,
  webServer: [],
  testMatch: /(?:moments|friends|album-viewer)\.spec\.ts$/,
  use: {
    ...config.use,
    baseURL,
    storageState:
      typeof storage === "object"
        ? {
            ...storage,
            cookies: storage.cookies.map((cookie) => ({
              ...cookie,
              domain: new URL(baseURL).hostname,
            })),
          }
        : storage,
  },
};
