import { Fragment } from "react";

type Props = {
  pastDeadline: boolean;
  finalized: boolean;
  winnerRevealed: boolean;
};

const STEPS = ["Created", "Bidding Open", "Deadline Passed", "Finalized", "Winner Revealed"];

function currentStepIndex(pastDeadline: boolean, finalized: boolean, winnerRevealed: boolean): number {
  if (winnerRevealed) return 4;
  if (finalized) return 3;
  if (pastDeadline) return 2;
  return 1;
}

export function LifecycleTimeline({ pastDeadline, finalized, winnerRevealed }: Props) {
  const current = currentStepIndex(pastDeadline, finalized, winnerRevealed);

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="flex items-start" style={{ minWidth: 460 }}>
        {STEPS.map((label, i) => {
          const isDone = i < current;
          const isCurrent = i === current;

          return (
            <Fragment key={label}>
              <div className="flex flex-col items-center" style={{ minWidth: "5rem" }}>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold
                    ${isCurrent
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : isDone
                      ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                      : "border-slate-200 bg-white text-slate-300"
                    }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span
                  className={`mt-2 text-center text-xs leading-tight
                    ${isCurrent
                      ? "font-semibold text-indigo-700"
                      : isDone
                      ? "text-slate-500"
                      : "text-slate-300"
                    }`}
                  style={{ maxWidth: "5rem" }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mt-3.5 h-0.5 flex-1 ${i < current ? "bg-emerald-300" : "bg-slate-200"}`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
