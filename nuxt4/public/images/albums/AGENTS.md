# Nuxt album media

Album metadata is stored in `mock/admin/albums.json`, outside the public directory. Never copy password-bearing info.json files here. Preserve layout and columns when encrypting metadata. Known media files remain directly addressable: local encryption is a browser content gate, not server authentication. Build thumbnails with `pnpm content:build`; validate public and encrypted album routes with Nuxt browser tests.
