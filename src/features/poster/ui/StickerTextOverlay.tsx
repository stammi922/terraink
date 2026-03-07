interface StickerTextOverlayProps {
  city: string;
  fontFamily: string;
  textColor: string;
  bgColor: string;
  accentColor: string;
}

/**
 * Parse hex to RGB for gradient creation.
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
  return `rgba(${newR}, ${newG}, ${newB}, 0.92)`;
}

/**
 * DOM-based sticker text overlay for shield/RIMOWA-style format.
 * Renders city name with gradient background and TerraInk branding.
 */
export default function StickerTextOverlay({
  city,
  fontFamily,
  textColor,
  bgColor,
  accentColor,
}: StickerTextOverlayProps) {
  const titleFont = fontFamily
    ? `"${fontFamily}", "Playfair Display", "Georgia", serif`
    : '"Playfair Display", "Georgia", serif';
  const brandingFont = fontFamily
    ? `"${fontFamily}", "Raleway", "Helvetica Neue", sans-serif`
    : '"Raleway", "Helvetica Neue", sans-serif';

  // Derive dark gradient colors from theme (V3 style)
  const { r, g, b } = hexToRgb(bgColor);
  const topR = Math.min(255, r + 10);
  const topG = Math.min(255, g + 20);
  const topB = Math.min(255, b + 30);
  
  const topColor = `rgba(${topR}, ${topG}, ${topB}, 0.95)`;
  const midColor = `rgba(${r}, ${g + 10}, ${b + 20}, 0.85)`;
  
  const gradientStyle = {
    background: `linear-gradient(to bottom, ${topColor} 0%, ${midColor} 50%, transparent 100%)`,
  };

  return (
    <div className="sticker-text-overlay">
      {/* Theme-aware gradient background for label zone */}
      <div className="sticker-label-gradient" style={gradientStyle} />

      {/* City name */}
      <p
        className="sticker-city"
        style={{
          fontFamily: titleFont,
          color: textColor,
        }}
      >
        {city.toUpperCase()}
      </p>

      {/* Branding */}
      <p
        className="sticker-branding"
        style={{
          fontFamily: brandingFont,
          color: textColor,
        }}
      >
        TerraInk
      </p>
    </div>
  );
}
