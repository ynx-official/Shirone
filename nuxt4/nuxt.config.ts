import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import { prepareFonts, checkFonts } from "./scripts/fonts.mjs";
import { prepareShellAssets } from "./scripts/shell-assets.mjs";
const systemFonts =
  JSON.parse(
    readFileSync(new URL("./mock/public/config.json", import.meta.url), "utf8"),
  ).font?.mode === "system";
const adminEnabled =
  process.env.NUXT_MOCK_ADMIN === "true" ||
  process.env.NODE_ENV === "development";
export default defineNuxtConfig({
  compatibilityDate: "2026-09-19",
  ssr: true,
  devtools: { enabled: false },
  experimental: {
    defaults: {
      nuxtLink: { prefetchOn: { visibility: false, interaction: true } },
    },
  },
  css: [
    "~/assets/styles/variables.styl",
    "~/assets/styles/main.css",
    "~/assets/styles/public.css",
    "~/assets/styles/settings.css",
    "~/assets/styles/entrance.css",
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
    // Keep the shared locale bridge inside Nitro instead of a dev-time file import.
    externals: {
      inline: [fileURLToPath(new URL("./app/i18n/", import.meta.url))],
    },
    compressPublicAssets: true,
    serverAssets: [
      {
        baseName: "content",
        ignore: [
          "fonts-*/**",
          "shell-assets/**",
          ...(adminEnabled ? [] : ["admin.json", "includes.json"]),
        ],
        dir: fileURLToPath(new URL("./.generated", import.meta.url)),
      },
    ],
  },
  typescript: { strict: true },
  app: {
    head: {
      htmlAttrs: { lang: "zh-CN" },
      link: [
        {
          rel: "icon",
          href: "/_site/favicon.png",
          type: "image/png",
          sizes: "48x48",
        },
        ...(!systemFonts
          ? [{ rel: "stylesheet" as const, href: "/fonts/outfit/font.css" }]
          : []),
        { rel: "stylesheet", href: "/fonts/yozai/font.css" },
      ],
    },
  },
  hooks: {
    async "nitro:config"(config) {
      const dir = await prepareFonts({ dev: Boolean(config.dev) });
      config.publicAssets ||= [];
      config.publicAssets.push({ dir, baseURL: "/fonts/yozai", maxAge: 0 });
      config.publicAssets.push({
        dir: await prepareShellAssets(),
        baseURL: "/_site",
        maxAge: 0,
      });
      if (!config.dev) {
        config.hooks ||= {};
        config.hooks.compiled = async (nitro) => {
          await checkFonts(nitro.options.output.publicDir);
        };
      }
    },
    "pages:extend"(pages) {
      if (!adminEnabled) {
        for (let i = pages.length - 1; i >= 0; i--) {
          if (pages[i]?.path.startsWith("/admin")) pages.splice(i, 1);
        }
      }
    },
  },
});
