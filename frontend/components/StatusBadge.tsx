export type RFQStatus = "open" | "finalized" | "revealed" | "expired";

const CONFIG: Record<RFQStatus, { label: string; className: string }> = {
  open:      { label: "Open",                 className: "bg-success/10 text-emerald-400 border-success/20" },
  expired:   { label: "Pending Finalization", className: "bg-zamaYellow/10 text-zamaYellow border-zamaYellow/20" },
  finalized: { label: "Finalized",            className: "bg-white/[0.06] text-slate-300 border-white/[0.10]" },
  revealed:  { label: "Winner Revealed",      className: "bg-zamaYellow text-ink border-zamaYellow" },
};

export function StatusBadge({ status }: { status: RFQStatus }) {
  const { label, className } = CONFIG[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${className}`}
    >
      {label}
    </span>
  );
}
