import { applyFades } from "./layers";
import { drawPosterText } from "./typography";
import { drawStickerOverlay } from "./stickerOverlay";
import { drawMarkersOnCanvas } from "@/features/markers/infrastructure/rendering";
import { createShieldPath } from "@/features/export/infrastructure/shapes";
import type { ExportOptions, CanvasSize } from "../../domain/types";

/**
 * Composites a final poster from a MapLibre snapshot canvas.
 *
 * 1. Draws the captured map image.
 * 2. Applies gradient fades (top + bottom).
 * 3. Draws poster text (city, country, coords, attribution).
 *
 * Returns the composited canvas + its size metadata.
 */
export async function compositeExport(
  mapCanvas: HTMLCanvasElement,
  options: ExportOptions,
): Promise<{ canvas: HTMLCanvasElement; size: CanvasSize }> {
  const {
    theme,
    center,
    widthInches: _wi,
    heightInches: _hi,
    displayCity,
    displayCountry,
    fontFamily,
    showPosterText = true,
    showOverlay = true,
    includeCredits = true,
    markers = [],
    markerIcons = [],
    markerProjection,
    markerScaleX = 1,
    markerScaleY = 1,
    markerSizeScale = 1,
    exportShape = "rectangle",
  } = options;

  const width = mapCanvas.width;
  const height = mapCanvas.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas rendering is not available.");

  const isShield = exportShape === "shield";

  if (isShield) {
    // Shield/sticker format: clip map to shield shape
    const shieldPath = createShieldPath(width, height);
    ctx.save();
    ctx.clip(shieldPath);

    // Draw map snapshot (clipped to shield)
    ctx.drawImage(mapCanvas, 0, 0);

    // Draw gradient overlay in label zone (top 25%)
    const labelHeight = height * 0.25;
    const gradient = ctx.createLinearGradient(0, 0, 0, labelHeight);
    gradient.addColorStop(0, "rgba(255, 182, 193, 0.85)"); // Soft pink
    gradient.addColorStop(1, "rgba(135, 206, 235, 0.6)"); // Sky blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, labelHeight);

    ctx.restore();

    // Draw sticker text overlay (city name + branding)
    drawStickerOverlay(ctx, width, height, theme, displayCity, fontFamily);

    // Draw shield border (outside clip)
    ctx.strokeStyle = theme.ui?.text || "#4a3c31";
    ctx.lineWidth = Math.max(2, width * 0.004);
    ctx.stroke(shieldPath);
  } else {
    // Standard poster format
    // 1. Draw map snapshot
    ctx.drawImage(mapCanvas, 0, 0);

    // 2. Gradient fades
    if (showOverlay) {
      applyFades(ctx, width, height, theme.ui.bg);
    }

    // 3. Markers
    if (markers.length > 0 && markerIcons.length > 0 && markerProjection) {
      await drawMarkersOnCanvas(
        ctx,
        markers,
        markerIcons,
        markerProjection,
        markerScaleX,
        markerScaleY,
        markerSizeScale,
      );
    }

    // 4. Poster text
    drawPosterText(
      ctx,
      width,
      height,
      theme,
      center,
      displayCity,
      displayCountry,
      fontFamily,
      showPosterText,
      showOverlay,
      includeCredits,
    );
  }

  const size: CanvasSize = {
    width,
    height,
    requestedWidth: width,
    requestedHeight: height,
    downscaleFactor: 1,
  };

  return { canvas, size };
}

export { resolveCanvasSize } from "./canvas";
export { applyFades } from "./layers";
export { drawPosterText } from "./typography";
