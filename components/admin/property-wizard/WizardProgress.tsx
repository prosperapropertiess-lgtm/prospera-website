const STEPS = [
  { num: 1, label: "Basics", icon: "🏠" },
  { num: 2, label: "Lease & Move-In", icon: "📋" },
  { num: 3, label: "Features", icon: "✨" },
  { num: 4, label: "Policies", icon: "📝" },
  { num: 5, label: "Utilities", icon: "⚡" },
  { num: 6, label: "Neighbourhood", icon: "📍" },
  { num: 7, label: "Photos & Media", icon: "📷" },
  { num: 8, label: "Preview & Publish", icon: "🚀" },
];

const SURFACE = "#111C27";
const BORDER = "rgba(255,255,255,0.08)";
const BORDER_HI = "rgba(255,255,255,0.14)";
const TEXT = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const ACCENT = "#C4374A";

interface Props {
  currentStep: number;
  highestStep: number;
  onStepClick: (step: number) => void;
  isSaving: boolean;
  status: string;
}

export default function WizardProgress({ currentStep, highestStep, onStepClick, isSaving, status }: Props) {
  return (
    <div className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-6 rounded-xl border p-5 space-y-1" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase tracking-widest font-medium" style={{ color: TEXT_MUT }}>Steps</span>
          {isSaving && (
            <span className="text-xs flex items-center gap-1.5" style={{ color: TEXT_MUT }}>
              <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
              Saving...
            </span>
          )}
          {!isSaving && status === "draft" && (
            <span className="text-xs" style={{ color: "#fbbf24" }}>Draft</span>
          )}
          {!isSaving && status === "published" && (
            <span className="text-xs" style={{ color: "#4ade80" }}>Published</span>
          )}
        </div>

        {STEPS.map((step) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < highestStep;
          const isReachable = step.num <= highestStep + 1;

          return (
            <button
              key={step.num}
              onClick={() => isReachable && onStepClick(step.num)}
              disabled={!isReachable}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
              style={{
                backgroundColor: isActive ? "rgba(196,55,74,0.1)" : "transparent",
                borderLeft: isActive ? `2px solid ${ACCENT}` : "2px solid transparent",
                cursor: isReachable ? "pointer" : "not-allowed",
                opacity: isReachable ? 1 : 0.35,
              }}
            >
              <span className="text-sm w-6 text-center flex-shrink-0">
                {isCompleted ? (
                  <span style={{ color: "#4ade80" }}>✓</span>
                ) : (
                  <span style={{ color: isActive ? TEXT : TEXT_MUT }}>{step.num}</span>
                )}
              </span>
              <span
                className="text-sm truncate"
                style={{ color: isActive ? TEXT : TEXT_SEC }}
              >
                {step.label}
              </span>
            </button>
          );
        })}

        <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${BORDER_HI}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: TEXT_MUT }}>Progress</span>
            <span className="text-xs font-medium" style={{ color: TEXT_SEC }}>{Math.round(((highestStep - 1) / 8) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((highestStep - 1) / 8) * 100}%`, backgroundColor: ACCENT }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
