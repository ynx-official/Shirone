export async function createPoster(
  title: string,
  description: string,
  url: string,
): Promise<Blob> {
  const { toCanvas } = await import("qrcode");
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 700;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw Error("Canvas unavailable");
  const styles = getComputedStyle(document.documentElement);
  const fontFamily =
    styles.getPropertyValue("--font-sans").trim() || "system-ui, sans-serif";
  ctx.fillStyle = styles.getPropertyValue("--surface-container-low").trim();
  ctx.fillRect(0, 0, 1000, 700);
  ctx.fillStyle = styles.getPropertyValue("--primary").trim();
  ctx.fillRect(60, 55, 64, 7);
  ctx.fillStyle = styles.getPropertyValue("--on-surface").trim();
  ctx.font = `600 42px ${fontFamily}`;
  let line = "",
    y = 145;
  for (const char of title) {
    if (ctx.measureText(line + char).width > 865) {
      ctx.fillText(line, 60, y);
      line = "";
      y += 58;
    }
    line += char;
  }
  ctx.fillText(line, 60, y);
  ctx.font = `24px ${fontFamily}`;
  ctx.fillStyle = styles.getPropertyValue("--on-surface-variant").trim();
  line = "";
  y += 70;
  for (const char of description.slice(0, 180)) {
    if (ctx.measureText(line + char).width > 700) {
      ctx.fillText(line, 60, y);
      line = "";
      y += 36;
    }
    line += char;
  }
  ctx.fillText(line, 60, y);
  const qr = document.createElement("canvas");
  await toCanvas(qr, url, {
    width: 160,
    margin: 1,
    color: {
      dark: styles.getPropertyValue("--on-surface").trim(),
      light: styles.getPropertyValue("--surface-container-low").trim(),
    },
  });
  ctx.drawImage(qr, 780, 480);
  ctx.font = `22px ${fontFamily}`;
  ctx.fillText(new URL(url).hostname, 60, 625);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(Error("Image export failed"))),
      "image/png",
    ),
  );
}
