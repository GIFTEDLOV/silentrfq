import { ClipboardList, Lock } from "lucide-react";
import type { ParsedRFQ } from "@/config/rfqDescription";

const BRIEF_ROWS: Array<[string, "RFQ Type" | "Category" | "Goods / Service" | "Quantity" | "Currency" | "Delivery Location" | "Delivery Target"]> = [
  ["RFQ Type", "RFQ Type"],
  ["Category", "Category"],
  ["Goods / Service", "Goods / Service"],
  ["Quantity", "Quantity"],
  ["Currency", "Currency"],
  ["Delivery Location", "Delivery Location"],
  ["Delivery Target", "Delivery Target"],
];

export function ProcurementBrief({ parsed }: { parsed: ParsedRFQ }) {
  if (!parsed.isStructured) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
      <div className="mb-5 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-zamaYellow" />
        <h2 className="text-sm font-bold text-white">Procurement Brief</h2>
      </div>

      <div className="space-y-3">
        {BRIEF_ROWS.map(([label, key]) => {
          const value = parsed.fields[key];
          if (!value) return null;
          return (
            <div key={key} className="flex items-start justify-between gap-4 text-sm">
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {label}
              </span>
              <span className="text-right text-slate-200">{value}</span>
            </div>
          );
        })}
      </div>

      {parsed.requirements && (
        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">Requirements</p>
          <p className="whitespace-pre-line text-xs leading-relaxed text-slate-400">{parsed.requirements}</p>
        </div>
      )}

      {parsed.additionalTerms && (
        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Additional Terms
          </p>
          <p className="whitespace-pre-line text-xs leading-relaxed text-slate-400">{parsed.additionalTerms}</p>
        </div>
      )}

      {parsed.vendorInstruction && (
        <div className="mt-5 border-t border-fheBlue/15 pt-4">
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-fheBlueSoft">
            <Lock className="h-3 w-3" />
            Vendor Instruction
          </p>
          <p className="whitespace-pre-line text-xs leading-relaxed text-slate-400">{parsed.vendorInstruction}</p>
        </div>
      )}
    </div>
  );
}
