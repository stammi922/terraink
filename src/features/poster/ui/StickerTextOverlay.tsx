interface StickerTextOverlayProps {
  city: string;
  fontFamily: string;
  textColor: string;
}

/**
 * DOM-based sticker text overlay for shield/RIMOWA-style format.
 * Renders city name with gradient background and TerraInk branding.
 */
export default function StickerTextOverlay({
  city,
  fontFamily,
  textColor,
}: StickerTextOverlayProps) {
  const titleFont = fontFamily
    ? `"${fontFamily}", "Playfair Display", "Georgia", serif`
    : '"Playfair Display", "Georgia", serif';
  const brandingFont = fontFamily
    ? `"${fontFamily}", "Raleway", "Helvetica Neue", sans-serif`
    : '"Raleway", "Helvetica Neue", sans-serif';

  return (
    <div className="sticker-text-overlay">
      {/* Gradient background for label zone */}
      <div className="sticker-label-gradient" />

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
