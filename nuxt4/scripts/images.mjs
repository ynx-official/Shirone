import sharp from "sharp";
import { resolve, dirname, sep } from "node:path";
import { mkdir, stat, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const publicRoot = resolve("public");
export async function responsiveImage(src, widths, quality = 72) {
  if (!src?.startsWith("/") || src.startsWith("//")) return { src };
  const source = resolve(publicRoot, "." + src);
  if (!source.startsWith(publicRoot + sep))
    throw Error("Image path outside public directory");
  try {
    await stat(source);
  } catch (error) {
    if (error.code === "ENOENT") return { src };
    throw error;
  }
  const metadata = await sharp(source).metadata();
  if (metadata.pages > 1 || !metadata.width) return { src };
  const hash = createHash("sha256")
    .update(await readFile(source))
    .update(`:${quality}:v1`)
    .digest("hex")
    .slice(0, 16);
  const candidates = [];
  for (const width of [
    ...new Set(widths.map((w) => Math.min(w, metadata.width))),
  ]) {
    const url = `/assets/optimized/${hash}-${width}.webp`;
    const output = resolve(publicRoot, "." + url);
    await mkdir(dirname(output), { recursive: true });
    if (!(await stat(output).catch(() => null))) {
      await sharp(source)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 5, smartSubsample: true })
        .toFile(output);
    }
    candidates.push({ url, width });
  }
  return {
    src: candidates.at(-1).url,
    srcset: candidates.map(({ url, width }) => `${url} ${width}w`).join(", "),
  };
}
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
  if (!source.startsWith(publicRoot + sep))
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
