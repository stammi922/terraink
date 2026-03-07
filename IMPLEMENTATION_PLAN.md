# TerraInk Implementation Plan

**Date:** 2026-03-07  
**Author:** James (AI Assistant)  
**Status:** DRAFT - Pending Steelman Review

---

## Executive Summary

TerraInk is a production-ready cartographic poster generator. The codebase follows a clean hexagonal architecture with clear separation of concerns. This plan identifies **6 high-impact improvements** based on open GitHub issues, code analysis, and UX patterns.

**Total estimated effort:** 20-25 hours across 6 workstreams

---

## Current State Analysis

### Strengths
- ✅ Clean hexagonal architecture (domain/application/infrastructure/ui layers)
- ✅ Well-documented agent.md and CONTRIBUTING.md
- ✅ Port/adapter pattern for services (ICache, IHttp, IGeocodePort)
- ✅ Single source of truth via PosterContext
- ✅ Working Vercel deployment at https://terraink-theta.vercel.app

### Areas for Improvement
- 🔶 No persistence (users lose work on refresh)
- 🔶 Fixed DPI export (no resolution control)
- 🔶 No onboarding for new users
- 🔶 Large CSS files need refactoring (#76)
- 🔶 No test coverage (#37)
- 🔶 Marker system could support custom uploads (#78)

---

## Implementation Workstreams

### 1. Project Persistence (Issue #81) 
**Priority:** 🔴 CRITICAL  
**Effort:** 5-6 hours  
**Impact:** HIGH - Users lose all work on page refresh

#### Objective
Save/load poster configurations to localStorage with optional export/import as JSON.

#### Technical Approach

```
src/features/persistence/
├── domain/
│   ├── types.ts           # SavedProject, ProjectMetadata
│   └── ports.ts           # IProjectStorage interface
├── application/
│   ├── useAutoSave.ts     # Debounced auto-save on form changes
│   └── useProjectManager.ts # Load, save, delete, export, import
├── infrastructure/
│   └── localStorageAdapter.ts # Implements IProjectStorage
└── ui/
    ├── ProjectsDrawer.tsx  # List saved projects
    └── ProjectActions.tsx  # Save/Load/Export buttons
```

#### Implementation Steps
1. Define `SavedProject` type (extends `PosterForm` + metadata)
2. Create `IProjectStorage` port with CRUD methods
3. Implement localStorage adapter with 5MB quota handling
4. Add `useAutoSave` hook with 2-second debounce
5. Create `ProjectsDrawer` UI component
6. Add keyboard shortcut: `Cmd/Ctrl + S` to save
7. Add export/import as `.terraink.json` files

#### Acceptance Criteria
- [ ] Projects persist across browser sessions
- [ ] Auto-save triggers on form changes (debounced)
- [ ] Users can name, rename, delete projects
- [ ] Export downloads `.terraink.json` file
- [ ] Import restores full project state

---

### 2. DPI/Resolution Selector (Issues #80, #48, #63)
**Priority:** 🟠 HIGH  
**Effort:** 3-4 hours  
**Impact:** HIGH - Export quality is most-requested feature

#### Objective
Add resolution presets (2K, 4K, 8K) and custom DPI selector for print-quality exports.

#### Technical Approach

```
src/features/export/domain/types.ts
  + ExportResolution: { label, dpi, maxDimension }
  + ExportPreset: '2K' | '4K' | '8K' | 'custom'

src/features/export/infrastructure/resolutionCalculator.ts
  + calculateExportDimensions(posterCm, dpi): { width, height }
  + estimateFileSize(dimensions): string

src/features/export/ui/ResolutionPicker.tsx
  - Preset buttons: 2K (150 DPI), 4K (300 DPI), 8K (600 DPI)
  - Custom DPI slider: 72-1200 DPI
  - Live file size estimate
```

#### Resolution Presets
| Preset | DPI | 30x40cm Output | Est. File Size |
|--------|-----|----------------|----------------|
| 2K     | 150 | 1772 × 2362 px | ~2-4 MB |
| 4K     | 300 | 3543 × 4724 px | ~8-12 MB |
| 8K     | 600 | 7087 × 9449 px | ~25-40 MB |

#### Implementation Steps
1. Add resolution types to export domain
2. Create resolution calculator utility
3. Update `useExport` hook to accept DPI parameter
4. Create `ResolutionPicker` component
5. Add memory warning for 8K exports (>100MB canvas)
6. Update export progress UI with resolution info

#### Acceptance Criteria
- [ ] Users can select 2K/4K/8K presets
- [ ] Custom DPI slider (72-1200)
- [ ] File size estimate shown before export
- [ ] Memory warning for very large exports
- [ ] Export respects selected resolution

---

### 3. Quick Start Tutorial (Issue #51)
**Priority:** 🟡 MEDIUM  
**Effort:** 3-4 hours  
**Impact:** MEDIUM - Reduces bounce rate for new users

#### Objective
Guided onboarding highlighting key features with skip option.

#### Technical Approach

```
src/features/onboarding/
├── domain/
│   ├── types.ts           # TutorialStep, OnboardingState
│   └── steps.ts           # Step definitions
├── application/
│   └── useOnboarding.ts   # Step navigation, completion tracking
├── infrastructure/
│   └── onboardingStorage.ts # Remember completion in localStorage
└── ui/
    ├── TutorialOverlay.tsx # Spotlight + tooltip component
    └── StepIndicator.tsx   # Progress dots
```

#### Tutorial Steps (5 total)
1. **Search Location** - Highlight search bar, explain geocoding
2. **Choose Theme** - Show theme picker, explain customization
3. **Adjust Map** - Demonstrate zoom/pan controls
4. **Add Markers** - Optional marker placement
5. **Export** - Download button, resolution options

#### Implementation Steps
1. Define tutorial steps with target selectors
2. Create spotlight overlay component (CSS clip-path)
3. Add `useOnboarding` hook with step state
4. Store completion status in localStorage
5. Add "Skip Tutorial" and "Show Tutorial" buttons
6. Trigger on first visit only

#### Acceptance Criteria
- [ ] Tutorial shows on first visit
- [ ] Users can skip at any time
- [ ] Progress indicator shows current step
- [ ] Tutorial can be replayed from settings
- [ ] Completion persists across sessions

---

### 4. Theme Import/Export (Issue #25)
**Priority:** 🟡 MEDIUM  
**Effort:** 2-3 hours  
**Impact:** MEDIUM - Enables theme sharing community

#### Objective
Download themes as JSON, upload custom themes.

#### Technical Approach

```
src/features/theme/domain/types.ts
  + ThemeFile: { name, version, colors, author? }

src/features/theme/infrastructure/themeSerializer.ts
  + exportTheme(theme): ThemeFile
  + importTheme(file): Theme | ValidationError

src/features/theme/ui/ThemeImportExport.tsx
  - "Export Theme" button → downloads .theme.json
  - "Import Theme" button → file picker + validation
```

#### Theme File Format
```json
{
  "name": "Midnight Ocean",
  "version": "1.0",
  "author": "username",
  "colors": {
    "background": "#0a1628",
    "water": "#1e3a5f",
    "land": "#0d1f33",
    "roads": "#2d4a6f",
    "labels": "#e0e6ed"
  }
}
```

#### Implementation Steps
1. Define `ThemeFile` schema with validation
2. Create serializer/deserializer utilities
3. Add export button to theme picker
4. Add import button with file validation
5. Store imported themes in localStorage
6. Add "Custom" section to theme picker

#### Acceptance Criteria
- [ ] Export downloads valid `.theme.json`
- [ ] Import validates schema before applying
- [ ] Invalid files show user-friendly error
- [ ] Imported themes appear in "Custom" section
- [ ] Custom themes persist across sessions

---

### 5. CSS Refactoring (Issue #76)
**Priority:** 🟢 LOW (but good housekeeping)  
**Effort:** 3-4 hours  
**Impact:** LOW immediate, HIGH long-term maintainability

#### Objective
Break large CSS files into feature-scoped modules.

#### Current State
```
src/styles/
├── controls.css    (large)
├── forms.css       (large)
├── index.css
├── layout.css
├── modal.css
├── preview.css
├── responsive.css
└── variables.css
```

#### Target State
```
src/styles/
├── base/
│   ├── variables.css
│   └── reset.css
├── components/
│   ├── buttons.css
│   ├── inputs.css
│   ├── modals.css
│   └── cards.css
├── features/
│   ├── settings-panel.css
│   ├── preview-panel.css
│   ├── theme-picker.css
│   └── export.css
├── layout/
│   ├── grid.css
│   └── responsive.css
└── index.css (imports only)
```

#### Implementation Steps
1. Audit current CSS for unused rules (PurgeCSS)
2. Extract variables into dedicated file
3. Split by component (buttons, inputs, modals)
4. Split by feature (settings, preview, theme)
5. Update imports in main index.css
6. Verify no visual regressions

#### Acceptance Criteria
- [ ] No CSS file > 200 lines
- [ ] Variables centralized in one file
- [ ] No visual regressions
- [ ] Build size unchanged or smaller

---

### 6. Test Infrastructure (Issue #37)
**Priority:** 🟢 LOW (but critical for stability)  
**Effort:** 4-5 hours initial, ongoing
**Impact:** LOW immediate, HIGH long-term quality

#### Objective
Establish testing patterns for critical paths.

#### Technical Approach

```
tests/
├── unit/
│   ├── domain/          # Pure function tests
│   └── infrastructure/  # Adapter tests (mocked I/O)
├── integration/
│   └── hooks/           # React hook tests
└── e2e/
    └── workflows/       # Playwright tests
```

#### Priority Test Targets
1. **Domain logic** - Layout matching, coordinate parsing, theme validation
2. **Export pipeline** - Canvas rendering, resolution calculation
3. **Geocoding** - Search, autocomplete, error handling
4. **E2E** - Full poster creation flow

#### Implementation Steps
1. Add Vitest + Testing Library
2. Add Playwright for E2E
3. Write domain unit tests (pure functions)
4. Write hook integration tests
5. Write 1-2 critical E2E flows
6. Add to CI pipeline

#### Acceptance Criteria
- [ ] Vitest configured with coverage
- [ ] Domain tests at >80% coverage
- [ ] E2E tests for export flow
- [ ] CI runs tests on PR

---

## Execution Order

| Phase | Workstream | Effort | Dependencies |
|-------|------------|--------|--------------|
| 1 | Project Persistence (#1) | 5-6h | None |
| 2 | DPI/Resolution (#2) | 3-4h | None |
| 3 | Quick Start Tutorial (#3) | 3-4h | None |
| 4 | Theme Import/Export (#4) | 2-3h | None |
| 5 | CSS Refactoring (#5) | 3-4h | None |
| 6 | Test Infrastructure (#6) | 4-5h | After #1-4 |

**Phases 1-4 can run in parallel** (no interdependencies).

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| localStorage quota exceeded | Medium | High | Implement quota check, warn user at 4MB |
| 8K export crashes browser | High | Medium | Memory check before export, show warning |
| Tutorial blocks UI interaction | Low | High | Ensure escape key and click-outside work |
| CSS refactor breaks layout | Medium | High | Visual regression testing, incremental PRs |

---

## Success Metrics

- **Persistence:** <1% data loss reports
- **Export:** 8K exports succeed on 8GB+ RAM devices
- **Tutorial:** 60%+ first-time users complete tutorial
- **Theme sharing:** 10+ community themes within 30 days

---

## Next Steps

1. **Steelman this plan** - Identify weaknesses, alternatives
2. **Prioritize with Jonas** - Confirm execution order
3. **Create branches** - One feature branch per workstream
4. **Execute via Opus subagent** - Parallel implementation

---

*Plan generated by James • 2026-03-07*
