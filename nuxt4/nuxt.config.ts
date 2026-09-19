import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
const adminEnabled =
  process.env.NUXT_MOCK_ADMIN === "true" ||
  process.env.NODE_ENV === "development";
export default defineNuxtConfig({
  compatibilityDate: "2026-09-19",
  ssr: true,
  devtools: { enabled: false },
  css: [
    "~/assets/styles/variables.styl",
    "~/assets/styles/main.css",
    "~/assets/styles/public.css",
  ],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    public: {
      mockAdmin: adminEnabled,
      remoteFeatures: process.env.NUXT_REMOTE_FEATURES === "true",
    },
  },
  nitro: {
    preset: "node-server",
    serverAssets: [
      {
        baseName: "content",
        ignore: adminEnabled ? [] : ["admin.json", "includes.json"],
        dir: fileURLToPath(new URL("./.generated", import.meta.url)),
      },
    ],
  },
  typescript: { strict: true },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [{ rel: "icon", href: "/logo/icon.webp" }],
    },
  },
  hooks: {
    "pages:extend"(pages) {
      if (!adminEnabled) {
        for (let i = pages.length - 1; i >= 0; i--) {
          if (pages[i]?.path.startsWith("/admin")) pages.splice(i, 1);
        }
      }
    },
  },
});
