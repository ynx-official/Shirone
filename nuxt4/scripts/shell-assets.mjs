import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
export async function prepareShellAssets() {
  const dir = fileURLToPath(
    new URL("../.generated/shell-assets/", import.meta.url),
  );
  await mkdir(dir, { recursive: true });
  await sharp(
    fileURLToPath(new URL("../public/logo/icon.webp", import.meta.url)),
  )
    .resize(48, 48, { fit: "contain" })
    .png()
    .toFile(`${dir}favicon.png`);
  return dir;
}
