import { usePosterContext } from "@/features/poster/ui/PosterContext";

const STEPS = [
  { n: "01", label: "Location" },
  { n: "02", label: "Customize" },
  { n: "03", label: "Download" },
] as const;

/**
 * Horizontal 3-step workflow indicator.
 * Derives active step from PosterContext:
 *   - Step 1 (Location) active when no location is set
 *   - Step 2 (Customize) active when location is set
 *   - Step 3 shown as destination goal
 */
export default function StepIndicator() {
  const { state } = usePosterContext();
  const hasLocation = Boolean(state.form.location?.trim());
  // 0-based index of the currently active step
  const activeIndex = hasLocation ? 1 : 0;

  return (
    <nav className="step-indicator" aria-label="Workflow steps">
      {STEPS.map((step, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        let className = "step-indicator__step";
        if (isActive) className += " is-active";
        if (isDone) className += " is-done";

        return (
          <div key={step.n} className={className}>
            <span className="step-indicator__number">{step.n}</span>
            <span className="step-indicator__label">{step.label}</span>
            {i < STEPS.length - 1 && (
              <span className="step-indicator__arrow" aria-hidden="true">
                →
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
