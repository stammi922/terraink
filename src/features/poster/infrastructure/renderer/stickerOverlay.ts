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
 * Creates a dark, dramatic gradient using the theme's background color (V3 style).
 */
export function deriveGradientFromTheme(theme: ResolvedTheme): {
  top: string;
  mid: string;
  bottom: string;
} {
  // Use UI background as primary color
  const bgColor = theme.ui?.bg || "#1a1a2e";
  const { r, g, b } = hexToRgb(bgColor);
  
  // Slightly adjust for visual depth (shift toward blue-ish tones)
  const topR = Math.min(255, r + 10);
  const topG = Math.min(255, g + 20);
  const topB = Math.min(255, b + 30);
  
  // Create a dark, dramatic gradient (V3 style)
  const topColor = `rgba(${topR}, ${topG}, ${topB}, 0.95)`;
  const midColor = `rgba(${r}, ${g + 10}, ${b + 20}, 0.85)`;
  const bottomColor = "transparent";
  
  return { top: topColor, mid: midColor, bottom: bottomColor };
}

/**
 * Draw the sticker header gradient overlay (V3 dark style).
 */
export function drawStickerGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: ResolvedTheme,
): void {
  const labelHeight = height * 0.32;
  const { top, mid, bottom } = deriveGradientFromTheme(theme);
  
  const gradient = ctx.createLinearGradient(0, 0, 0, labelHeight);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.5, mid);
  gradient.addColorStop(1, bottom);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, labelHeight);
}

/**
 * Format coordinates as degrees with direction (e.g., "47.3769° N / 8.5417° E").
 */
function formatCoords(center: { lng: number; lat: number }): string {
  const latDir = center.lat >= 0 ? "N" : "S";
  const lngDir = center.lng >= 0 ? "E" : "W";
  const lat = Math.abs(center.lat).toFixed(4);
  const lng = Math.abs(center.lng).toFixed(4);
  return `${lat}° ${latDir} / ${lng}° ${lngDir}`;
}

/**
 * Draw sticker-specific text overlay (RIMOWA-style).
 *
 * Renders city name at top with country and coordinates below.
 */
export function drawStickerOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: ResolvedTheme,
  cityName: string,
  countryName: string,
  center: { lng: number; lat: number },
  fontFamily?: string,
): void {
  // Use light text for dark header (V3 style)
  // Check if theme bg is dark - if so use theme text, otherwise use light color
  const bgColor = theme.ui?.bg || "#1a1a2e";
  const { r, g, b } = hexToRgb(bgColor);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // For dark backgrounds, use light text; for light backgrounds, use the theme's adjusted text
  const textColor = luminance < 0.5 
    ? "#e8e0d8"  // Light cream for dark headers
    : lightenColor(theme.ui?.text || "#1a1a2e", -0.3);  // Darken for light headers

  // Typography settings (vintage sticker style)
  const cityFontFamily = fontFamily
    ? `"${fontFamily}", "Playfair Display", serif`
    : '"Playfair Display", "Georgia", serif';
  const subtitleFontFamily = fontFamily
    ? `"${fontFamily}", "Raleway", sans-serif`
    : '"Raleway", "Helvetica Neue", sans-serif';
  const monoFontFamily = '"Spline Sans Mono", monospace';

  // City name - large, centered at top
  const cityFontSize = height * 0.07;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${cityFontSize}px ${cityFontFamily}`;
  ctx.fillText(cityName.toUpperCase(), width / 2, height * 0.10);

  // Country name - smaller, below city
  const countryFontSize = cityFontSize * 0.38;
  ctx.font = `300 ${countryFontSize}px ${subtitleFontFamily}`;
  ctx.globalAlpha = 0.9;
  ctx.fillText(countryName.toUpperCase(), width / 2, height * 0.155);

  // Coordinates - monospace, below country
  const coordsFontSize = cityFontSize * 0.28;
  ctx.font = `400 ${coordsFontSize}px ${monoFontFamily}`;
  ctx.globalAlpha = 0.75;
  ctx.fillText(formatCoords(center), width / 2, height * 0.195);
  ctx.globalAlpha = 1;
}
