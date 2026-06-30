"use client";

import { useState } from "react";

export function AddressCopy({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1 font-mono text-sm">
      <span title={address}>{truncated}</span>
      <button
        onClick={copy}
        className="text-xs text-gray-500 hover:text-gray-800 underline"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </span>
  );
}
