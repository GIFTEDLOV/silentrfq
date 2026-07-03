"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Lock, ShieldCheck } from "lucide-react";
import { FACTORY_ADDRESS } from "@/config/contracts";

export type VerificationStatus = "open" | "finalized" | "revealed";

type Props = {
  rfqAddress: `0x${string}`;
  winnerAddress?: `0x${string}`;
  status: VerificationStatus;
};

const STATUS_LABEL: Record<VerificationStatus, string> = {
  open: "Open",
  finalized: "Finalized",
  revealed: "Winner Revealed",
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      title={`Copy ${label}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:border-white/[0.20] hover:text-white transition-colors shrink-0"
    >
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function EtherscanButton({ address }: { address: string }) {
  return (
    <a
      href={`https://sepolia.etherscan.io/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Open on Sepolia Etherscan"
      className="inline-flex items-center gap-1.5 rounded-lg border border-fheBlue/25 bg-fheBlue/[0.06] px-2.5 py-1.5 text-xs font-medium text-fheBlueSoft hover:border-fheBlue/40 hover:bg-fheBlue/[0.12] transition-colors shrink-0"
    >
      <ExternalLink className="h-3 w-3" />
      Etherscan
    </a>
  );
}

function VerificationField({
  label,
  value,
  actions,
}: {
  label: string;
  value: string;
  actions?: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">{label}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs text-slate-300 break-all">{value}</span>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function LiveVerificationPanel({ rfqAddress, winnerAddress, status }: Props) {
  const isRevealed = status === "revealed";
  const factory = FACTORY_ADDRESS ?? "Not configured";

  return (
    <div
      className={`rounded-2xl border p-6 transition-all ${
        isRevealed ? "border-fheBlue/30 bg-fheBlue/[0.05]" : "border-white/[0.08] bg-white/[0.03]"
      }`}
      style={isRevealed ? { animation: "verify-glow 3.2s ease-in-out infinite" } : undefined}
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
            isRevealed ? "border-fheBlue/40 bg-fheBlue/20" : "border-white/[0.12] bg-white/[0.05]"
          }`}
        >
          <ShieldCheck className={`h-4 w-4 ${isRevealed ? "text-fheBlueSoft" : "text-slate-400"}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Live Verification</h3>
          <p className="text-[11px] text-slate-500">Independently verifiable on Sepolia — no wallet required</p>
        </div>
        <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Network</p>
          <span className="font-mono text-xs text-slate-300">Sepolia</span>
        </div>

        <VerificationField
          label="Factory"
          value={factory}
          actions={
            FACTORY_ADDRESS && (
              <>
                <CopyButton value={factory} label="factory address" />
                <EtherscanButton address={factory} />
              </>
            )
          }
        />

        <VerificationField
          label="RFQ Contract"
          value={rfqAddress}
          actions={
            <>
              <CopyButton value={rfqAddress} label="RFQ address" />
              <EtherscanButton address={rfqAddress} />
            </>
          }
        />

        {winnerAddress && (
          <VerificationField
            label="Winner"
            value={winnerAddress}
            actions={
              <>
                <CopyButton value={winnerAddress} label="winner address" />
                <EtherscanButton address={winnerAddress} />
              </>
            }
          />
        )}

        <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Losing bids</p>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-fheBlueSoft">
            <Lock className="h-3 w-3" />
            Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
