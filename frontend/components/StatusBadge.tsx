export type RFQStatus = "open" | "finalized" | "revealed" | "expired";

const CONFIG: Record<RFQStatus, { label: string; className: string }> = {
  open:      { label: "Open",                className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  expired:   { label: "Pending Finalization",className: "border-amber-200 bg-amber-50 text-amber-700" },
  finalized: { label: "Finalized",           className: "border-slate-200 bg-slate-100 text-slate-600" },
  revealed:  { label: "Winner Revealed",     className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
};

export function StatusBadge({ status }: { status: RFQStatus }) {
  const { label, className } = CONFIG[status];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
