import type { ResolvedTheme } from "@/features/theme/domain/types";

/**
 * Parse a hex color into RGB components.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Lighten a color by mixing with white.
 */
function lightenColor(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);
  return `rgb(${newR}, ${newG}, ${newB})`;
}

/**
 * Create RGBA string from hex with alpha.
 */
function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Derive sticker gradient colors from theme palette.
 * Creates a harmonious gradient using the theme's background and accent colors.
 */
export function deriveGradientFromTheme(theme: ResolvedTheme): {
  top: string;
  bottom: string;
} {
  // Primary: use UI background, lightened
  const bgColor = theme.ui?.bg || "#1a1a2e";
  
  // Secondary: blend with water or land for interest
  const accentColor = theme.map?.water || theme.map?.land || bgColor;
  
  // Create a soft gradient:
  // Top: lightened bg with high opacity
  // Bottom: accent color fading to transparent
  const topColor = hexToRgba(lightenColor(bgColor, 0.6), 0.92);
  const bottomColor = hexToRgba(accentColor, 0.3);
  
  return { top: topColor, bottom: bottomColor };
}

/**
 * Draw the sticker header gradient overlay.
 */
export function drawStickerGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: ResolvedTheme,
): void {
  const labelHeight = height * 0.28;
  const { top, bottom } = deriveGradientFromTheme(theme);
  
  const gradient = ctx.createLinearGradient(0, 0, 0, labelHeight);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.6, bottom);
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, labelHeight);
}

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
