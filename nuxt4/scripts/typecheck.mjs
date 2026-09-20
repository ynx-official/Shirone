import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Validate optional admin source as well. Production builds exclude its layout,
// so their generated LayoutKey union intentionally contains only public layouts.
const result = spawnSync(
  process.execPath,
  [
    fileURLToPath(
      new URL("../node_modules/nuxt/bin/nuxt.mjs", import.meta.url),
    ),
    "typecheck",
  ],
  { stdio: "inherit", env: { ...process.env, NUXT_MOCK_ADMIN: "true" } },
);
if (result.error) console.error(result.error);
process.exit(result.status ?? 1);
