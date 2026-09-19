# Critical UI fonts

Outfit 400 Latin and Latin Extended WOFF2 files and LICENSE are copied from
`@fontsource/outfit@5.3.0`. `font.css` embeds the Latin WOFF2 as base64, keeps the
extended face as a local URL, and references the existing bundled Yozai font.
When updating Outfit, replace both binaries and regenerate the Latin data URL
from `outfit-latin-400-normal.woff2`.

Load this stylesheet from the document head, outside Vite's injected CSS graph.
The small Latin face arrives with the render-blocking stylesheet; font declarations
and the font stack stay stable during development hydration. Optional display
avoids delayed fallback replacement on slow connections. `html:root` keeps the
font stack above Tailwind's default root declaration without `!important`.
