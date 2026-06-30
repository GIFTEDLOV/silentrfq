export type RFQStatus = "open" | "finalized" | "revealed" | "expired";

const CONFIG: Record<RFQStatus, { label: string; className: string }> = {
  open:      { label: "Open",           className: "bg-emerald-100 text-emerald-700" },
  expired:   { label: "Pending Finalization", className: "bg-amber-100 text-amber-700" },
  finalized: { label: "Finalized",      className: "bg-gray-200 text-gray-600" },
  revealed:  { label: "Winner Revealed",className: "bg-blue-100 text-blue-700" },
};

export function StatusBadge({ status }: { status: RFQStatus }) {
  const { label, className } = CONFIG[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
