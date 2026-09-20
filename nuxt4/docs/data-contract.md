# Data contract v1

PublicRepository uses `GET /api/mock/site` and `GET /api/mock/page?path=...&page=...&tag=...&category=...&q=...`. Responses are typed Site and PageData. Summary responses omit article bodies and encryption envelopes. PageData.post contains either compiled HTML/TOC/styles/syntaxes or an AES-GCM envelope. Unknown pages and invalid/out-of-range pagination return 404. Routes are canonicalized from the generated URL index.

Public records are build artifacts stored in Nitro server assets, not client imports. Drafts never enter public artifacts. Feeds/search/llms omit protected articles. Album metadata is kept outside public resources. Build outputs are bundled into .output, so the production service needs no source tree.

AdminRepository loads `/api/mock/admin` only when mockAdmin was enabled at build time. The response contains a v1 Snapshot, collections keyed by Domain, and Entity records. Storage key: `shirone:admin:v1`. A save validates before writing; failures do not update live state. Public SSR does not read this key. Imports are all-or-nothing and reject unknown envelope fields, duplicate IDs and secret fields. Taxonomy renames propagate to local posts; referenced taxonomy deletion is blocked.

Images use IndexedDB `shirone-media-v1` / `media`; records contain id/name/type/size/blob. References use `media:<id>` and are resolved only in local preview. Object URLs are revoked. JSON exports contain structured data, not binary files; media export is a separate remaining task (see progress). No real server publication or authentication exists.

Admin routes render on the client when enabled; public routes retain SSR. Admin
appearance uses independent neutral light/dark Ant Design tokens and
`shirone:admin:appearance` persistence; see [admin UI contract](admin-ui.md). Media cleanup excludes
referenced items and deletes the confirmed unused set in one IndexedDB transaction.

Future adapters must preserve DTOs, asynchronous repository signatures, validation and failure behavior. Credentials belong to future private server configuration, never public DTOs or browser storage.

Theme preferences remain in `shirone:palette` and `shirone:theme`. The derived
`shirone:palette-cache:v1` stores a resolved color map with a signature of
`[hue, style, spec, effectiveDark]`, solely for pre-hydration paint. It is not
content or an authoritative preference. The head bootstrap only restores matching
signatures and hex color values; invalid/unavailable storage falls back to SSR
colors. Bump the cache version when changing the palette engine contract.

UI locale preference uses the `shirone-locale` cookie (path `/`, SameSite=Lax,
one-year lifetime). `useCopy` validates it against the ten existing locales and
falls back to site configuration for SSR. State is request-scoped; switching does
not change content, translate article bodies, or introduce locale-prefixed URLs.

The i18n plugin initializes the active dictionary through `/api/i18n?lang=...`
and serializes it under the `translations` SSR payload key. Only the server
imports all locale modules. Language switches fetch the next dictionary before
updating the locale/cookie; stale responses cannot overwrite a newer selection.
Post summaries may include `imageSrcset`, and site data may include
`bannerSrcset`, `bannerMobileSrcset`, and `avatarSrcset`. Original content images
remain available; these fields point to generated local WebP candidates.

Post metadata may include `updated` (ISO date). Site data carries the existing
`license` and `article.share` / `article.lastUpdated` settings. Disabled footer
features render no placeholder; last-updated notices use build-time `site.today`
and UTC calendar dates to preserve identical SSR and client output.

Moments render one complete collection per route. `q` and `tag` are applied
locally for SSR and client navigation, preserving all available tag choices and
empty-result controls. Ordering is pinned first, then publication descending;
the client reveals ten items per batch. `Site.timeZone` carries the configured
IANA time zone (default `Asia/Shanghai`) for identical server/client timestamps.
`MomentData` and `MomentImage` are defined in `shared/types/moments.ts`; images
retain original links plus optional thumbnail/srcset/dimensions. Images use an
inline viewer before the on-demand Fancybox viewer; owners dispose the viewer
on unmount, including pending async loads.

Anime and compass also retain complete route collections for local filters.
Anime uses `q` (title/description/studio/year/genres) and `status`; compass uses
`q` (entry label/note/hostname) and shelf `group`. Empty shelves are omitted
from results, but all original filter choices remain available. SSR applies
the same predicates. `shared/types/discovery.ts` describes both domain payloads.
Anime reveals twelve items per batch and resets the batch on filter changes.
Its independent `shirone:anime-layout-mode` preference accepts `grid` or `list`,
defaults to grid, and gracefully tolerates unavailable browser storage. This
migration retains local mock data and does not enable remote anime providers.
