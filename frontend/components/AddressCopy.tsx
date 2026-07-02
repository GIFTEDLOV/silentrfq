"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function AddressCopy({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span title={address} className="font-mono text-sm text-slate-300">
        {truncated}
      </span>
      <button
        onClick={copy}
        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-300 transition-colors"
        title="Copy full address"
      >
        {copied ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
        {copied && <span className="text-success font-medium">Copied</span>}
      </button>
    </span>
  );
}
