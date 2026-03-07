import type { ResolvedTheme } from "@/features/theme/domain/types";

/**
 * Draw sticker-specific text overlay (RIMOWA-style).
 *
 * Renders city name at top with "TerraInk" branding below.
 */
export function drawStickerOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: ResolvedTheme,
  cityName: string,
  fontFamily?: string,
): void {
  const textColor = theme.ui?.text || "#1a1a2e";

  // Typography settings (vintage sticker style)
  const cityFontFamily = fontFamily
    ? `"${fontFamily}", "Playfair Display", serif`
    : '"Playfair Display", "Georgia", serif';
  const brandingFontFamily = fontFamily
    ? `"${fontFamily}", "Raleway", sans-serif`
    : '"Raleway", "Helvetica Neue", sans-serif';

  // City name - large, centered at top
  const cityFontSize = height * 0.08;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${cityFontSize}px ${cityFontFamily}`;
  ctx.fillText(cityName.toUpperCase(), width / 2, height * 0.12);

  // Branding subtitle
  const brandingFontSize = cityFontSize * 0.35;
  ctx.font = `400 ${brandingFontSize}px ${brandingFontFamily}`;
  ctx.globalAlpha = 0.85;
  ctx.fillText("TerraInk", width / 2, height * 0.18);
  ctx.globalAlpha = 1;
}
