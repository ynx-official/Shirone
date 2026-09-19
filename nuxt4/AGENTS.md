# Nuxt application

All changes for the migration stay in this directory. The parent Astro application is a read-only reference. This application uses Nuxt 4, Vue 3, TypeScript and Vite 8; Astro/Svelte commands, integration packaging and Swup contracts do not apply here. Do not create a nested Git repository or import parent source at runtime.

Preserve M3E tokens, layered components, accessibility, ten locales and disabled-feature zero-request/zero-DOM behavior. UI strings belong in app/i18n. Read docs/migration-plan.md and docs/data-contract.md before changing architecture. Use explicit imports between component layers. Atoms and molecules do not own persistence or fetch data. All filesystem access stays on the server/build side. User state must be request-scoped.

Use pnpm on macOS/Linux and pnpm.cmd on Windows. Validate with pnpm typecheck, pnpm test, pnpm lint, pnpm build and focused Playwright tests. Production disables mock admin unless explicitly enabled at build time. Never publish browser edits as real server changes. Do not commit without the user's instruction.
