# TerraInk Sticker Format Implementation Plan

**Date:** 2026-03-07  
**Author:** James (AI Assistant)  
**Feature:** RIMOWA-style Travel Sticker Format  
**Status:** DRAFT - Pending Steelman Review

---

## Executive Summary

Add a new "Sticker" export format to TerraInk that mimics the classic RIMOWA travel sticker aesthetic: a heraldic shield shape with city name overlay, gradient sky, and decorative border—but using actual OpenStreetMap data instead of illustrations.

**Visual Reference:** Zurich RIMOWA sticker with shield shape, mountain silhouette top edge, pastel gradient sky, vintage typography

**Estimated effort:** 6-8 hours

---

## Design Analysis

### RIMOWA Sticker Visual Elements

| Element | Description | TerraInk Implementation |
|---------|-------------|------------------------|
| **Shape** | Heraldic shield (rounded bottom, decorative top) | SVG clip-path + canvas masking |
| **Top Edge** | Mountain silhouette outline | Decorative SVG path (fixed or procedural) |
| **Sky Area** | Gradient (pink → blue) behind city name | Canvas gradient overlay in label zone |
| **City Name** | Large elegant serif typography | Custom text renderer using existing font system |
| **Subtitle** | "RIMOWA" branding (we use "TerraInk" or custom) | Configurable secondary text |
| **Border** | Thin dark line following shield contour | Canvas stroke following clip-path |
| **Content** | Illustrated cityscape | Actual map tiles (our differentiator!) |

### Sticker Dimensions (Physical)

| Size | Dimensions | Use Case |
|------|------------|----------|
| Small | 5 × 7 cm | Laptop, phone cases |
| Medium | 7 × 10 cm | Water bottles, notebooks |
| Large | 10 × 14 cm | Luggage, guitar cases |

---

## Architecture Approach

### Option A: Extend Layout System (Rejected)
Add sticker as a layout with special rendering flags.

**Problem:** Layouts are purely dimensional. Stickers need shape masking, special typography, borders—fundamentally different rendering logic.

### Option B: New "Format" Concept (Selected) ✓
Create a `format` property alongside `layout`:
- `format: "poster"` (default) - Current rectangular behavior
- `format: "sticker"` - Shield shape with RIMOWA styling

**Benefits:**
- Clean separation of concerns
- Format-specific rendering pipelines
- Extensible for future formats (circle badge, stamp, etc.)

---

## Technical Specification

### 1. Domain Layer

#### New Types (`src/features/sticker/domain/types.ts`)

```typescript
export type StickerShape = "shield" | "circle" | "hexagon";

export interface StickerStyle {
  shape: StickerShape;
  showMountainEdge: boolean;
  showGradientSky: boolean;
  showBorder: boolean;
  borderColor: string;
  borderWidth: number;
  labelPosition: "top" | "bottom";
  brandingText: string; // "TerraInk" or custom
}

export interface StickerLayout {
  id: string;
  name: string;
  description: string;
  widthCm: number;
  heightCm: number;
  style: StickerStyle;
}

export const STICKER_PRESETS: Record<string, StickerLayout> = {
  shield_small: {
    id: "sticker_shield_small",
    name: "Travel Sticker (Small)",
    description: "5×7 cm shield sticker for laptops and phones.",
    widthCm: 5,
    heightCm: 7,
    style: {
      shape: "shield",
      showMountainEdge: true,
      showGradientSky: true,
      showBorder: true,
      borderColor: "#4a3c31",
      borderWidth: 2,
      labelPosition: "top",
      brandingText: "TerraInk",
    },
  },
  shield_medium: { ... },
  shield_large: { ... },
};
```

### 2. Infrastructure Layer

#### Shield Shape Definition (`src/features/sticker/infrastructure/shapes.ts`)

```typescript
export function createShieldPath(width: number, height: number): Path2D {
  const path = new Path2D();
  
  // Shield proportions (based on RIMOWA reference)
  const topRadius = width * 0.08;
  const bottomRadius = width * 0.45;
  const neckY = height * 0.15; // Where mountain edge ends
  const midY = height * 0.7;   // Where curve to point begins
  
  // Start top-left
  path.moveTo(topRadius, 0);
  
  // Top edge (with mountain silhouette)
  path.lineTo(width - topRadius, 0);
  
  // Top-right corner
  path.quadraticCurveTo(width, 0, width, topRadius);
  
  // Right edge down to curve start
  path.lineTo(width, midY);
  
  // Bottom curve to point
  path.quadraticCurveTo(width, height * 0.9, width * 0.5, height);
  path.quadraticCurveTo(0, height * 0.9, 0, midY);
  
  // Left edge up
  path.lineTo(0, topRadius);
  
  // Top-left corner
  path.quadraticCurveTo(0, 0, topRadius, 0);
  
  path.closePath();
  return path;
}

export function createMountainSilhouette(width: number): Path2D {
  // Decorative mountain outline for top edge
  const path = new Path2D();
  const y = 0;
  const peaks = [
    { x: 0.1, h: 0.02 },
    { x: 0.25, h: 0.05 },
    { x: 0.35, h: 0.03 },
    { x: 0.5, h: 0.08 },  // Main peak
    { x: 0.65, h: 0.04 },
    { x: 0.8, h: 0.06 },
    { x: 0.9, h: 0.02 },
  ];
  
  path.moveTo(0, y);
  for (const peak of peaks) {
    path.lineTo(peak.x * width, y - peak.h * width);
  }
  path.lineTo(width, y);
  
  return path;
}
```

#### Sticker Renderer (`src/features/sticker/infrastructure/stickerRenderer.ts`)

```typescript
export async function renderSticker(
  mapCanvas: HTMLCanvasElement,
  options: StickerRenderOptions,
): Promise<HTMLCanvasElement> {
  const { width, height, style, theme, cityName, countryName } = options;
  
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  
  // 1. Create shield clip path
  const shieldPath = createShieldPath(width, height);
  ctx.save();
  ctx.clip(shieldPath);
  
  // 2. Draw map (clipped to shield)
  ctx.drawImage(mapCanvas, 0, 0, width, height);
  
  // 3. Draw gradient sky overlay in label zone
  if (style.showGradientSky) {
    const labelHeight = height * 0.25;
    const gradient = ctx.createLinearGradient(0, 0, 0, labelHeight);
    gradient.addColorStop(0, "rgba(255, 182, 193, 0.85)"); // Soft pink
    gradient.addColorStop(1, "rgba(135, 206, 235, 0.6)");  // Sky blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, labelHeight);
  }
  
  // 4. Draw city name
  const fontSize = height * 0.08;
  ctx.font = `600 ${fontSize}px "Playfair Display", serif`;
  ctx.fillStyle = theme.ui.text;
  ctx.textAlign = "center";
  ctx.fillText(cityName.toUpperCase(), width / 2, height * 0.12);
  
  // 5. Draw branding subtitle
  const subFontSize = fontSize * 0.4;
  ctx.font = `400 ${subFontSize}px "Raleway", sans-serif`;
  ctx.fillStyle = theme.ui.text;
  ctx.fillText(style.brandingText, width / 2, height * 0.18);
  
  ctx.restore();
  
  // 6. Draw border (outside clip)
  if (style.showBorder) {
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = style.borderWidth;
    ctx.stroke(shieldPath);
  }
  
  // 7. Draw mountain silhouette at top
  if (style.showMountainEdge) {
    const mountainPath = createMountainSilhouette(width);
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = 1;
    ctx.stroke(mountainPath);
  }
  
  return canvas;
}
```

### 3. Application Layer

#### `useSticker` Hook (`src/features/sticker/application/useSticker.ts`)

```typescript
export function useSticker() {
  const { state, dispatch, mapRef, effectiveTheme } = usePosterContext();
  const [stickerPreset, setStickerPreset] = useState<string>("shield_medium");
  
  const exportSticker = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;
    
    dispatch({ type: "START_EXPORT" });
    
    try {
      const preset = STICKER_PRESETS[stickerPreset];
      const dpi = 300;
      const widthPx = Math.round((preset.widthCm / 2.54) * dpi);
      const heightPx = Math.round((preset.heightCm / 2.54) * dpi);
      
      // Capture map at sticker resolution
      const { canvas: mapCanvas } = await captureMapAsCanvas(
        map, widthPx, heightPx
      );
      
      // Render sticker with shield mask
      const stickerCanvas = await renderSticker(mapCanvas, {
        width: widthPx,
        height: heightPx,
        style: preset.style,
        theme: effectiveTheme,
        cityName: state.form.displayCity || state.form.location,
        countryName: state.form.displayCountry,
      });
      
      // Export as PNG with transparency
      const blob = await createPngBlob(stickerCanvas, dpi);
      const filename = `${state.form.displayCity || "sticker"}_terraink.png`;
      triggerDownloadBlob(blob, filename);
      
      dispatch({ type: "FINISH_EXPORT" });
    } catch (err) {
      dispatch({ type: "FAIL_EXPORT", error: err.message });
    }
  }, [mapRef, state, effectiveTheme, stickerPreset]);
  
  return { stickerPreset, setStickerPreset, exportSticker };
}
```

### 4. UI Layer

#### Sticker Section in Settings Panel (`src/features/sticker/ui/StickerSection.tsx`)

```typescript
export default function StickerSection() {
  const { stickerPreset, setStickerPreset, exportSticker } = useSticker();
  
  return (
    <section className="settings-section sticker-section">
      <h3>Travel Sticker</h3>
      
      <div className="sticker-presets">
        {Object.entries(STICKER_PRESETS).map(([id, preset]) => (
          <button
            key={id}
            className={`sticker-preset-btn ${stickerPreset === id ? "active" : ""}`}
            onClick={() => setStickerPreset(id)}
          >
            <StickerPreviewIcon shape={preset.style.shape} />
            <span>{preset.name}</span>
            <small>{preset.widthCm}×{preset.heightCm} cm</small>
          </button>
        ))}
      </div>
      
      <button 
        className="btn btn-primary sticker-export-btn"
        onClick={exportSticker}
      >
        <DownloadIcon /> Download Sticker
      </button>
    </section>
  );
}
```

---

## File Structure

```
src/features/sticker/
├── domain/
│   ├── types.ts              # StickerStyle, StickerLayout, presets
│   └── ports.ts              # IStickerRenderer interface
├── application/
│   └── useSticker.ts         # Hook for sticker export
├── infrastructure/
│   ├── shapes.ts             # Shield path generators
│   ├── stickerRenderer.ts    # Canvas rendering logic
│   └── index.ts              # Exports
└── ui/
    ├── StickerSection.tsx    # Settings panel section
    ├── StickerPreview.tsx    # Live preview component
    └── StickerPresetIcon.tsx # Icon for preset buttons
```

---

## Implementation Steps

### Phase 1: Core Infrastructure (2-3 hours)
1. [ ] Create `src/features/sticker/` directory structure
2. [ ] Define domain types and sticker presets
3. [ ] Implement `createShieldPath()` and `createMountainSilhouette()`
4. [ ] Implement `renderSticker()` with clipping and compositing
5. [ ] Add Google Fonts for vintage typography (Playfair Display, Raleway)

### Phase 2: Application & Export (1-2 hours)
1. [ ] Create `useSticker` hook
2. [ ] Wire up export pipeline to create PNG with transparency
3. [ ] Test export at different DPI values
4. [ ] Verify shield proportions match reference

### Phase 3: UI Integration (2-3 hours)
1. [ ] Create `StickerSection` component
2. [ ] Add preset selection buttons with icons
3. [ ] Add sticker preview in preview panel
4. [ ] Style with CSS (match existing patterns)
5. [ ] Add to SettingsPanel.tsx

### Phase 4: Polish & Testing (1 hour)
1. [ ] Test with various cities/locations
2. [ ] Verify typography scaling across sizes
3. [ ] Test PNG transparency
4. [ ] Add to README/docs
5. [ ] Commit with proper message

---

## Acceptance Criteria

- [ ] Sticker section visible in settings panel
- [ ] 3 size presets available (small/medium/large)
- [ ] Export produces PNG with shield shape
- [ ] City name displayed with vintage typography
- [ ] Gradient sky overlay visible in label zone
- [ ] Border follows shield contour
- [ ] Mountain silhouette decorates top edge
- [ ] PNG has transparency outside shield
- [ ] Works with all existing themes

---

## Visual Mockup (ASCII)

```
     _________
    /  ZÜRICH  \
   /  TerraInk  \
  |              |
  |   [MAP]      |
  |   [DATA]     |
  |              |
   \            /
    \__________/
```

---

## Dependencies

- Existing: MapLibre, Canvas API, Google Fonts
- New fonts: Playfair Display (city name), Raleway (branding)
- No new npm packages required

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Shield path looks wrong | Medium | High | Use reference image, iterate on bezier curves |
| Typography doesn't scale | Low | Medium | Use relative font sizes (% of height) |
| Transparency fails | Low | High | Test PNG export early, fallback to white bg |
| Performance issues | Low | Low | Sticker is small, canvas ops are fast |

---

*Plan generated by James • 2026-03-07*
