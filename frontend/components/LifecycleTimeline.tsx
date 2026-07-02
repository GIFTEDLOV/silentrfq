import { Fragment } from "react";

type Props = {
  pastDeadline: boolean;
  finalized: boolean;
  winnerRevealed: boolean;
};

const STEPS = ["Created", "Bidding Open", "Deadline Passed", "Finalized", "Winner Revealed"];

function currentStepIndex(
  pastDeadline: boolean,
  finalized: boolean,
  winnerRevealed: boolean
): number {
  if (winnerRevealed) return 4;
  if (finalized) return 3;
  if (pastDeadline) return 2;
  return 1;
}

export function LifecycleTimeline({ pastDeadline, finalized, winnerRevealed }: Props) {
  const current = currentStepIndex(pastDeadline, finalized, winnerRevealed);

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-5">
      <div className="flex items-start" style={{ minWidth: 460 }}>
        {STEPS.map((label, i) => {
          const isDone = i < current;
          const isCurrent = i === current;

          return (
            <Fragment key={label}>
              <div className="flex flex-col items-center" style={{ minWidth: "5.5rem" }}>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-500
                    ${
                      isCurrent
                        ? "border-zamaYellow bg-zamaYellow text-ink shadow-[0_0_12px_rgba(255,210,8,0.5)]"
                        : isDone
                        ? "border-success/40 bg-success/10 text-emerald-400"
                        : "border-white/[0.10] bg-white/[0.03] text-slate-700"
                    }`}
                  style={isCurrent ? { animation: "checkmark-pulse 2.4s ease-in-out infinite" } : undefined}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span
                  className={`mt-2 text-center text-xs leading-tight
                    ${
                      isCurrent
                        ? "font-bold text-white"
                        : isDone
                        ? "text-slate-500"
                        : "text-slate-700"
                    }`}
                  style={{ maxWidth: "5rem" }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mt-4 h-0.5 flex-1 transition-colors duration-700 ${
                    i < current ? "bg-success/25" : "bg-white/[0.06]"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
