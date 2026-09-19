export function prepareFonts(options?: {
  dev?: boolean;
  root?: string;
}): Promise<string>;
export function collectFontText(
  root: string,
  options?: Record<string, boolean>,
): Promise<string>;
export function checkFonts(
  directory: string,
  budget?: { maxFamilyBytes?: number; maxTotalBytes?: number },
): Promise<void>;
