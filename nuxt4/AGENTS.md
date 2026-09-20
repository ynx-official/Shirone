# Nuxt application

All changes for the migration stay in this directory. The parent Astro application is a read-only reference. This application uses Nuxt 4, Vue 3, TypeScript and Vite 8; Astro/Svelte commands, integration packaging and Swup contracts do not apply here. Do not create a nested Git repository or import parent source at runtime.

Preserve M3E tokens, layered components, accessibility, ten locales and disabled-feature zero-request/zero-DOM behavior. UI strings belong in app/i18n. Read docs/migration-plan.md and docs/data-contract.md before changing architecture. Use explicit imports between component layers. Atoms and molecules do not own persistence or fetch data. All filesystem access stays on the server/build side. User state must be request-scoped.

Use pnpm on macOS/Linux and pnpm.cmd on Windows. Validate with pnpm typecheck, pnpm test, pnpm lint, pnpm build and focused Playwright tests. Production disables mock admin unless explicitly enabled at build time. Never publish browser edits as real server changes. Do not commit without the user's instruction.

## Admin UI

The user-approved admin structure uses a grouped sidebar, top breadcrumb, closable route tabs and a media card grid, with `antdv-next` via `@antdv-next/nuxt`. The supplied screenshot is a structural reference only. The user's 2026-09-20 revision supersedes shared M3E colors: admin uses a neutral grayscale visual system with independent light/dark appearance only, persisted in `shirone:admin:appearance`. Do not expose hue, palette or system-mode controls. This explicit visual direction supersedes generic catalog selection for admin. `/admin` and `/admin/**` use CSR when enabled; public pages retain SSR. See [admin UI contract](docs/admin-ui.md).
