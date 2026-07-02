import { Eye, Lock, Shield } from "lucide-react";

const PUBLIC_ITEMS = [
  "RFQ description and deadline",
  "Vendor wallet addresses (submission order)",
  "Total number of bids submitted",
  "Winner address (after reveal only)",
];

const PRIVATE_ITEMS = [
  "Individual bid amounts (never exposed)",
  "Losing bid amounts (permanently encrypted)",
  "Winning bid amount (buyer-only FHE access)",
  "Live ranking during bidding",
  "Encrypted comparison results",
];

export function PrivacyPanel() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
      <div className="mb-5 flex items-center gap-2">
        <Shield className="h-4 w-4 text-fheBlueSoft" />
        <h3 className="text-sm font-bold text-white">Privacy Model</h3>
        <span className="ml-auto font-mono text-[10px] text-slate-600">TFHE · Zama FHE</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Public On-Chain
          </p>
          <ul className="space-y-2">
            {PUBLIC_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                <Eye className="mt-0.5 h-3 w-3 shrink-0 text-slate-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-fheBlue/20 bg-fheBlue/[0.06] p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-fheBlueSoft">
            Encrypted / Private
          </p>
          <ul className="space-y-2">
            {PRIVATE_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                <Lock className="mt-0.5 h-3 w-3 shrink-0 text-fheBlueSoft" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-600">
        Encrypted ciphertexts are stored on-chain. No FHE.allow grant is issued for losing
        bids, making them permanently inaccessible without the key.
      </p>
    </div>
  );
}
