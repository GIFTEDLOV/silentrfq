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
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white px-5 py-5">
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
                      ? "border-gray-900 bg-gray-900 text-white"
                      : isDone
                      ? "border-gray-300 bg-gray-100 text-gray-500"
                      : "border-gray-200 bg-white text-gray-300"
                    }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-2 text-center text-xs leading-tight
                    ${isCurrent
                      ? "font-semibold text-gray-900"
                      : isDone
                      ? "text-gray-500"
                      : "text-gray-300"
                    }`}
                  style={{ maxWidth: "5rem" }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mt-3.5 h-0.5 flex-1 ${i < current ? "bg-gray-400" : "bg-gray-200"}`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
