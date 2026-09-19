import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { mkdir, stat } from "node:fs/promises";
const publicRoot = resolve("public");
export async function prepareImage(value, thumbnail = false) {
  const image =
    typeof value === "string" ? { src: value, alt: "" } : { ...value };
  if (
    typeof image.src !== "string" ||
    !image.src.startsWith("/") ||
    image.src.startsWith("//")
  )
    return image;
  const source = resolve("public", "." + image.src);
  if (!source.startsWith(publicRoot + "/"))
    throw Error("Image path outside public directory");
  try {
    const meta = await sharp(source).metadata();
    image.width ||= meta.width;
    image.height ||= meta.height;
    if (image.src.startsWith("/images/moments/")) {
      const stem = image.src
        .slice("/images/moments/".length)
        .replace(/\.[^.]+$/, "");
      image.thumbnail = `/assets/moments/thumbnails/${stem}-640.webp`;
      image.srcset = [192, 384, 640]
        .map((w) => `/assets/moments/thumbnails/${stem}-${w}.webp ${w}w`)
        .join(", ");
    } else if (thumbnail) {
      const target = `/assets/album-thumbnails/${image.src.slice("/images/albums/".length).replace(/\.[^.]+$/, "")}-640.webp`;
      const output = resolve("public", "." + target);
      await mkdir(dirname(output), { recursive: true });
      const sourceStat = await stat(source);
      const outputStat = await stat(output).catch(() => null);
      if (!outputStat || outputStat.mtimeMs < sourceStat.mtimeMs)
        await sharp(source)
          .rotate()
          .resize({ width: 640, withoutEnlargement: true })
          .webp({ quality: 64, effort: 5, smartSubsample: true })
          .toFile(output);
      image.thumbnail = target;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return image;
}
