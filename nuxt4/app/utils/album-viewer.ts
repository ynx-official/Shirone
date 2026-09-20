import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import "~/assets/styles/fancybox-custom.css";
import { zh_CN } from "@fancyapps/ui/dist/fancybox/l10n/zh_CN.js";
import { zh_TW } from "@fancyapps/ui/dist/fancybox/l10n/zh_TW.js";
import { en_EN } from "@fancyapps/ui/dist/fancybox/l10n/en_EN.js";
import { es_ES } from "@fancyapps/ui/dist/fancybox/l10n/es_ES.js";
import { tr_TR } from "@fancyapps/ui/dist/fancybox/l10n/tr_TR.js";
import { getDefaultFancyboxConfig } from "~/utils/album-viewer-config";

export interface AlbumPhoto {
  src: string;
  thumbnail?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export function openAlbumViewer(
  photos: AlbumPhoto[],
  startIndex: number,
  trigger: HTMLElement,
  locale: string,
  labels: Record<string, string>,
) {
  const config = getDefaultFancyboxConfig();
  const translations =
    (
      { zh_CN, zh_TW, en: en_EN, es: es_ES, tr: tr_TR } as Record<
        string,
        Record<string, string>
      >
    )[locale] || en_EN;
  const l10n = { ...translations, ...labels };
  // v6.1.15's runtime show() returns undefined despite its declaration.
  // Capture this viewer during synchronous initialization so owners can dispose it.
  let instance: ReturnType<typeof Fancybox.getInstance>;
  Fancybox.show(
    photos.map((photo) => ({
      src: photo.src,
      type: "image",
      thumb: photo.thumbnail || photo.src,
      caption: (photo.alt || "").replace(
        /[&<>"']/g,
        (character) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[character]!,
      ),
      triggerEl: trigger,
    })),
    {
      ...config,
      on: {
        init: (viewer) => {
          instance = viewer;
        },
      },
      l10n,
      triggerEl: trigger,
      startIndex,
      Carousel: { ...config.Carousel, l10n },
    },
  );
  const owned = instance;
  return (
    owned && {
      destroy() {
        // close() releases document listeners; destroy() removes the dialog now.
        owned.close();
        owned.destroy();
      },
    }
  );
}
