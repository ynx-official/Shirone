import config from "./playwright.moments.config";
export default { ...config, testMatch: /(?:discovery|friends|moments)\.spec\.ts$/ };
