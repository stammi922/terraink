# TerraInk Editorial Redesign — Implementation Plan

> Applies the amber/navy editorial aesthetic from the Claude Design session.  
> Constraint: **zero changes to map functionality** — no domain/, application/, infrastructure/ touches.

---

## Source Reference

HTML prototype: `~/.openclaw/workspace/handoff-2026-05-04T05-28-07-034Z/terraink-travel-redesign/project/TerraInk.html` (not present — using description + codebase analysis)

Design key points:
- Dark navy base `#0a1824` (already present)
- Amber `#F59E0B` as primary CTA / accent
- Big Bebas Neue headline with Instrument Serif italic "map?" in amber
- 3-step stepper: Location → Customize → Download
- Poster preview with white paper frame + shadow
- Dedicated amber download CTA

---

## Phase 1: Implementation Plan

### Step 1 — Design Tokens (`src/styles/base.css`)

**What:** Add amber accent CSS variables and load Instrument Serif from Google Fonts.

**Changes:**
1. Add `&family=Instrument+Serif:ital@1` to the Google Fonts `@import` URL  
   (Instrument Serif italic is needed for the "map?" headline word)
2. Add to `:root`:
   ```css
   --accent: #F59E0B;
   --accent-muted: rgba(245, 158, 11, 0.18);
   --accent-glow: rgba(245, 158, 11, 0.32);
   --accent-border: rgba(245, 158, 11, 0.52);
   --accent-border-hover: rgba(245, 158, 11, 0.82);
   --paper-white: #f8f5ef;
   ```

**Files:** `src/styles/base.css`  
**Risk:** None — additive only.

---

### Step 2 — AppHeader Hero Redesign (`src/shared/ui/AppHeader.tsx` + `src/styles/layout.css`)

**What:** Replace the flat "TerraInk" h1 with a dramatic two-part headline in the style of the design:

```
WHERE DO YOU WANT YOUR
map?
```

Where "WHERE DO YOU WANT YOUR" is Bebas Neue (already loaded), and "map?" is Instrument Serif italic, colored amber.

**TSX changes (`AppHeader.tsx`):**
- Replace `<h1>TerraInk</h1>` with:
  ```tsx
  <h1 className="hero-headline">
    <span className="hero-headline__top">WHERE DO YOU WANT YOUR</span>
    <span className="hero-headline__word">map?</span>
  </h1>
  ```
- Keep the kicker text ("TerraInk: The Cartographic Poster Engine") above
- Keep the logo img
- Keep `<InstallPrompt />`
- Remove the `app-copy` paragraph (too much text in new hero style)

**CSS changes (`layout.css`):**
- Update `.app-header h1` → remove old rule, replaced by `.hero-headline`
- Add `.hero-headline`:
  ```css
  display: block;
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(2.6rem, 7vw, 5.4rem);
  line-height: 0.88;
  letter-spacing: 0.03em;
  color: #ecf5ff;
  margin: 4px 0 0;
  ```
- Add `.hero-headline__top`: inherits from parent (same font)
- Add `.hero-headline__word`:
  ```css
  display: block;
  font-family: "Instrument Serif", serif;
  font-style: italic;
  color: var(--accent);
  font-size: clamp(2.8rem, 8vw, 6rem);
  letter-spacing: 0;
  line-height: 1;
  ```

**Files:** `src/shared/ui/AppHeader.tsx`, `src/styles/layout.css`  
**Risk:** Low — only visual. AppHeader has no logic. No map functionality touched.

---

### Step 3 — StepIndicator Component (new file)

**What:** A horizontal "01 Location → 02 Customize → 03 Download" step indicator that shows the current step based on PosterContext state. Placed in `AppShell` between the header and the main grid.

**State logic:**
- Step 1 active: `form.location` is empty
- Step 2 active: `form.location` is set (user picked a place)
- Step 3 active: never explicitly; shows as the "destination"
  (Could add: step 3 shows a subtle amber pulse once export count > 0, but keep it simple for now)

**New file: `src/shared/ui/StepIndicator.tsx`**
```tsx
import { usePosterContext } from "@/features/poster/ui/PosterContext";

const STEPS = [
  { n: "01", label: "Location" },
  { n: "02", label: "Customize" },
  { n: "03", label: "Download" },
] as const;

export default function StepIndicator() {
  const { state } = usePosterContext();
  const hasLocation = Boolean(state.form.location?.trim());
  const activeIndex = hasLocation ? 1 : 0; // 0-based

  return (
    <nav className="step-indicator" aria-label="Workflow steps">
      {STEPS.map((step, i) => (
        <div
          key={step.n}
          className={`step-indicator__step${i === activeIndex ? " is-active" : ""}${i < activeIndex ? " is-done" : ""}`}
        >
          <span className="step-indicator__number">{step.n}</span>
          <span className="step-indicator__label">{step.label}</span>
          {i < STEPS.length - 1 && <span className="step-indicator__arrow">→</span>}
        </div>
      ))}
    </nav>
  );
}
```

**New CSS: `src/styles/stepper.css`** (imported in index.css)
```css
.step-indicator {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 14px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(10, 20, 31, 0.6);
  border: 1px solid var(--line);
  backdrop-filter: blur(8px);
}

.step-indicator__step {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.42;
  transition: opacity 0.2s ease;
}

.step-indicator__step.is-active {
  opacity: 1;
}

.step-indicator__step.is-done {
  opacity: 0.7;
}

.step-indicator__number {
  font-family: "Spline Sans Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: var(--accent);
  min-width: 20px;
}

.step-indicator__step.is-active .step-indicator__number {
  color: var(--accent);
  text-shadow: 0 0 8px var(--accent-glow);
}

.step-indicator__label {
  font-family: "Instrument Sans", sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #c3d4e2;
  letter-spacing: 0.02em;
}

.step-indicator__step.is-active .step-indicator__label {
  color: #ecf5ff;
}

.step-indicator__arrow {
  margin: 0 12px;
  color: rgba(146, 176, 200, 0.3);
  font-size: 0.75rem;
}
```

**Changes to `App.tsx`:**
- Import StepIndicator
- Add `<StepIndicator />` between `<AppHeader />` and `<main className="app-grid">`

**Changes to `src/styles/index.css`:**
- Add `@import "./stepper.css";`

**Files:** `src/shared/ui/StepIndicator.tsx` (new), `src/styles/stepper.css` (new), `src/styles/index.css`, `src/App.tsx`  
**Risk:** Low. New component, reads context but doesn't modify it. No map logic touched.

---

### Step 4 — Amber Accent Pass in `forms.css`

**What:** Systematically replace teal/blue primary accent colors with amber throughout forms.css. This covers interactive states: selected, active, focused, primary buttons, sliders.

**Specific changes:**

| Target | Old color | New color |
|--------|-----------|-----------|
| `input:focus` box-shadow | `rgba(75, 149, 186, 0.24)` | `rgba(245, 158, 11, 0.24)` |
| `input:focus` border | `rgba(102, 174, 209, 0.82)` | `rgba(245, 158, 11, 0.75)` |
| `.theme-switch input:checked + .theme-switch-track` | `#5eaed4` | `var(--accent)` |
| `.theme-card.is-selected` border | `rgba(112, 184, 222, 0.8)` | `var(--accent-border-hover)` |
| `.theme-card.is-selected` box-shadow | `rgba(75, 149, 186, 0.22)` | `var(--accent-muted)` |
| `.layout-card.is-selected` border | same | amber equivalents |
| `.palette-color-item.is-active` border | same | amber |
| `.button[type="submit"]` bg | `linear-gradient(135deg, #1a6f8c, #2f8eaf)` | `linear-gradient(135deg, #d4850a, var(--accent))` |
| `.map-control-btn--primary` bg | `rgba(55, 171, 203, 0.22)` | `var(--accent-muted)` |
| `.map-control-btn--primary` border | `rgba(55, 171, 203, 0.55)` | `var(--accent-border)` |
| `.map-control-btn.is-active` bg | `rgba(55, 171, 203, 0.34)` | `rgba(245, 158, 11, 0.25)` |
| `.map-control-btn.is-active` border | `rgba(55, 171, 203, 0.8)` | `var(--accent-border-hover)` |
| `.shape-toggle-btn.active` bg | `rgba(55, 171, 203, 0.28)` | `rgba(245, 158, 11, 0.22)` |
| `.shape-toggle-btn.active` border | `rgba(55, 171, 203, 0.7)` | `var(--accent-border)` |
| `.export-map-btn` bg | green gradient | amber gradient |
| `.export-map-btn` border | green | amber |
| `.export-map-btn` color | `#effff5` | `#fff8ec` |
| `.distance-slider::-webkit-slider-thumb` bg | `radial-gradient(... #4ca9cd, #2a7fa0)` | `radial-gradient(... #f5a623, #d4850a)` |
| `.map-control-slider::-webkit-slider-thumb` | same teal → amber |
| `.marker-editor-card__size-slider::-webkit-slider-thumb` | same → amber |
| Focus-visible ring colors for `.theme-switch`, `.marker-picker__option.is-selected` etc. | teal → amber |
| `.color-grid-action.is-active` | teal → amber |
| `.marker-settings-toggle-btn.is-active` | teal → amber |
| `.marker-row__icon-btn` hover | teal → amber |
| `.marker-picker__option.is-selected` | teal → amber |

Also update the `.generate-btn` (the main download button referenced in exportButtons `className: "generate-btn download-format-btn"` for PNG):
```css
.generate-btn {
  border: 1px solid var(--accent-border-hover);
  background: linear-gradient(135deg, rgba(213, 133, 10, 0.96), rgba(245, 158, 11, 0.96));
  color: #fff8ec;
}
.generate-btn:not(:disabled):hover,
.generate-btn:focus-visible {
  border-color: var(--accent);
  background: linear-gradient(135deg, rgba(213, 133, 10, 1), rgba(245, 158, 11, 1));
}
```
(Note: `.generate-btn` may not exist in forms.css yet — add it. Check if it's there or elsewhere.)

**Files:** `src/styles/forms.css`  
**Risk:** Moderate — many touch points but all CSS-only. No functionality affected. Key to verify no teal remains in primary-action states.

---

### Step 5 — Amber Accent Pass in `layout.css`

**What:** Update install prompt button from blue to amber; adjust map-control-slider track.

**Changes:**
- `.install-prompt-btn` bg: `linear-gradient(135deg, rgba(38, 112, 158, 0.95)...)` → `linear-gradient(135deg, rgba(213, 133, 10, 0.95), rgba(180, 110, 8, 0.95))`
- `.install-prompt-btn` border: blue → `var(--accent-border)`  
- `.install-prompt-btn` hover border/shadow → amber
- `.map-control-slider` (the zoom slider track): keep the gradient but update to amber:
  ```css
  background: linear-gradient(90deg, rgba(213, 133, 10, 0.65), rgba(245, 158, 11, 0.9));
  ```
- `.map-control-slider::-webkit-slider-thumb` border/bg → amber

**Files:** `src/styles/layout.css`  
**Risk:** Low — cosmetic only.

---

### Step 6 — Poster Paper Frame (`src/styles/preview.css`)

**What:** Add white paper border + floating shadow to `.poster-frame` using `box-shadow`, giving the "framed poster on a table" look.

**Approach:** Pure CSS `box-shadow` layering — no DOM changes, no React changes.

**Changes to `.poster-frame`:**
```css
.poster-frame {
  /* existing: aspect-ratio, width, max-width, max-height, overflow, border-radius, border */
  /* CHANGE: add white paper surround via box-shadow layers */
  box-shadow:
    0 0 0 14px var(--paper-white),       /* white paper border */
    0 0 0 15px rgba(0, 0, 0, 0.12),      /* thin edge shadow */
    0 32px 64px rgba(0, 0, 0, 0.55),     /* main drop shadow */
    0 8px 22px rgba(0, 0, 0, 0.38);      /* close shadow */
  border: 1px solid rgba(255, 255, 255, 0.12);
}
```

**Changes to `.poster-viewport`:**
- Add extra padding to ensure the shadow isn't clipped:
  ```css
  padding: 20px;
  overflow: visible;  /* allow shadow to extend */
  ```
- Update the viewport background to a slightly warmer dark to contrast against the white paper:
  ```css
  background: linear-gradient(180deg, rgba(255,255,255,0.04), transparent 28%),
    radial-gradient(...existing gradient...),
    linear-gradient(145deg, rgba(12, 24, 36, 0.98), rgba(8, 18, 28, 0.94));
  ```

**Shield shape note:** `.poster-frame.shield-shape` uses mask-image. The box-shadow still renders outside the mask, so the paper effect applies to the bounding box but not the shield shape. Add a conditional: **only apply white paper frame to non-shield frames**. Use:
```css
.poster-frame:not(.shield-shape) {
  box-shadow: 0 0 0 14px var(--paper-white), ...;
}
.poster-frame.shield-shape {
  /* keep original shadow */
  box-shadow: 0 24px 34px rgba(0,0,0,0.5), 0 8px 14px rgba(0,0,0,0.42);
}
```

**Files:** `src/styles/preview.css`  
**Risk:** Low — pure CSS, no DOM or logic changes. Shield shape handled separately.

---

### Step 7 — Download CTA Visual Upgrade (`src/styles/forms.css` + `src/features/poster/ui/SettingsPanel.tsx`)

**What:** Make the PNG export button the hero CTA with an amber style that reads "Your poster is ready" once location is set. Update the label above the download buttons.

**Changes:**
- In `SettingsPanel.tsx`: change the export label from "Export Map" to "Download your poster" (already in the `action-row`)
  - The `export-map-label` paragraph: keep the class, change text content

Wait — the label is hardcoded in TSX as `<p className="export-map-label">Export Map</p>`. We can update the text to "Download Your Poster" which matches the design aesthetic.

- Update `.export-map-label` in forms.css:
  ```css
  .export-map-label {
    font-family: "Bebas Neue", sans-serif;  /* upgrade from Spline Sans Mono */
    font-size: 1.1rem;
    letter-spacing: 0.08em;
    color: var(--accent);
    text-shadow: 0 0 12px var(--accent-glow);
  }
  ```

- The `.action-row` gets a subtle amber top border:
  ```css
  .action-row {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--accent-muted);
  }
  ```

- The PNG button (`.generate-btn`) becomes the big amber CTA (see Step 4).

**Files:** `src/styles/forms.css`, `src/features/poster/ui/SettingsPanel.tsx`  
**Risk:** Low — text change + CSS upgrade. No functional logic changed.

---

### Step 8 — Typography Cleanup (`src/styles/base.css`, `src/styles/forms.css`, `src/styles/info.css`)

**What:** Ensure Bebas Neue is on section headings, amber is used for section labels, and the panel block headers are more editorial.

**Changes:**
- `.panel-block h2` in forms.css: upgrade color to use `--accent` at low opacity: `color: rgba(245, 158, 11, 0.7)` (more amber than the current muted teal `#88b7d5`)
- `.inspector-card h3`, `.info-panel-section h3` in info.css: same upgrade → `color: rgba(245, 158, 11, 0.65)`
- `.export-map-label` (see Step 7) gets Bebas Neue treatment.

**Files:** `src/styles/forms.css`, `src/styles/info.css`  
**Risk:** Low — color-only changes to section labels.

---

### Step 9 — Build Verification

```bash
cd ~/GitProjects/terraink && npm run build
```

Fix any TypeScript errors. Likely issues:
- Missing import for `StepIndicator` in `App.tsx`
- StepIndicator.tsx needing to export default correctly
- The `stepper.css` import path in `index.css`

---

### Summary: Files Changed

| File | Change Type |
|------|-------------|
| `src/styles/base.css` | Add design tokens + Instrument Serif font import |
| `src/styles/layout.css` | Hero headline CSS + install prompt amber + slider amber |
| `src/styles/forms.css` | Amber accent sweep (all interactive states, download CTA) |
| `src/styles/preview.css` | Paper frame on poster-frame (box-shadow) |
| `src/styles/info.css` | Section label color → amber |
| `src/styles/stepper.css` | NEW — step indicator styles |
| `src/styles/index.css` | Import stepper.css |
| `src/shared/ui/AppHeader.tsx` | New hero headline JSX |
| `src/shared/ui/StepIndicator.tsx` | NEW — step indicator component |
| `src/App.tsx` | Add StepIndicator between header and grid |
| `src/features/poster/ui/SettingsPanel.tsx` | Update export label text |

**Files NOT touched (functional layers):**
- All `domain/`, `application/`, `infrastructure/` files
- `PosterContext.tsx` (only read from, never written to)
- MapPreview, map logic, export logic, geocoding
- Any `.env` / config

---

## Steelman Review

### Step 1 (Design Tokens)
**Could go wrong:** Instrument Serif might fail to load (blocked by CSP or font API change). Fallback to `serif` is acceptable — it'll still show in italic. **Simpler alternative:** Inline the amber hex directly. **Verdict:** Tokens are strictly better. **MUST-DO.**

### Step 2 (AppHeader Hero)
**Could go wrong:** Removing `app-copy` paragraph might break layout expectations. The kicker text might be too long at small breakpoints. **Functional risk:** Zero. AppHeader has no logic. **Simpler:** Just change the h1 text + add a color span. **Verdict:** MUST-DO. Add mobile media query to shrink font at <760px.

### Step 3 (StepIndicator)
**Could go wrong:** `usePosterContext()` throws if not in PosterProvider scope. **Verified:** PosterProvider IS the root provider in AppProviders (checked `AppProviders.tsx`). AppShell is wrapped by AppProviders — confirmed safe. **Simpler:** Make it a static visual with no state. **Does it risk map functionality?** No — read-only context access. **Verdict:** MUST-DO. Use real state for the live "active step" behavior.

### Step 4 (Amber in forms.css)
**Could go wrong:** Missing a teal reference somewhere that looks inconsistent. Some teal was used for slider fills (`rgba(43, 95, 126, ...)`) in moz-range-progress — need to catch those too. **Risk:** CSS-only, zero functional risk. **Effort vs visual:** HIGH value — amber interactive states transform the entire feel. **Verdict:** MUST-DO. Be systematic — search for `203, 0.` patterns.

### Step 5 (Amber in layout.css)
**Could go wrong:** Install prompt is a separate React component with its own inline styling. Check `src/features/install/ui/InstallPrompt.tsx` — if it uses inline styles, CSS changes won't apply. **Mitigation:** Also update inline styles if needed. **MUST-DO.**

### Step 6 (Paper Frame)
**Could go wrong:** The `overflow: visible` change on `.poster-viewport` might cause the paper shadow to render outside the panel border, looking messy. **Fix:** Use `overflow: hidden` on `.preview-panel` instead, keep `overflow: visible` on viewport. Or just clip at the panel level. **Shield shape:** Handled separately. **Visual impact:** EXTREMELY HIGH — this is the signature "framed poster" look. **MUST-DO.**

### Step 7 (Download CTA)
**Could go wrong:** The `.generate-btn` class may not be defined anywhere in CSS yet — it's used as className in SettingsPanel.tsx but may rely on the forms.css `button` base style. Need to ADD the `.generate-btn` rule. **Functional risk:** Zero. Changing text from "Export Map" to "Download Your Poster" doesn't affect the export logic. **MUST-DO.**

### Step 8 (Typography section headings)
**Could go wrong:** Making section labels amber might clash with existing teal accents if any remain. But since we're doing a full amber sweep, they should be consistent. **Low effort, high cohesion.** **MUST-DO.**

### What I Removed (NICE-TO-HAVE, not executing):
- **Destination chips** (Tokyo, Cape Town, etc.) — would need static data + possible hero section restructure. Doesn't add functionality. Skip.
- **Panel accordion** — too risky, changes interaction patterns, possibly breaks keyboard navigation.
- **Full vertical layout restructure** — the 2-col grid is well-tuned for side-by-side map editing. Keep it.
- **Separate "Your poster is ready" hero block** — the download is already at the bottom of settings panel. A separate block would require major layout restructure. Instead, we upgrade the existing download area visually.

---

## Revised Execution Order (Post-Steelman)

1. `base.css` — tokens + Instrument Serif ✅ MUST-DO
2. `stepper.css` + `StepIndicator.tsx` ✅ MUST-DO (new files first)
3. `index.css` — import stepper.css ✅ MUST-DO
4. `App.tsx` — add StepIndicator ✅ MUST-DO
5. `AppHeader.tsx` — hero headline ✅ MUST-DO
6. `layout.css` — hero CSS + install prompt + sliders ✅ MUST-DO
7. `forms.css` — full amber sweep + paper frame CTA ✅ MUST-DO
8. `preview.css` — paper frame ✅ MUST-DO
9. `info.css` — section label amber ✅ MUST-DO
10. `SettingsPanel.tsx` — update export label text ✅ MUST-DO
11. `npm run build` — verify ✅

*Check `src/features/install/ui/InstallPrompt.tsx` for inline styles that need amber update.*
