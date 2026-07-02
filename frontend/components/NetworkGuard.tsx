"use client";

import { AlertTriangle } from "lucide-react";
import { useAccount } from "wagmi";
import { EXPECTED_CHAIN_ID } from "@/config/contracts";

function chainName(id: number): string {
  if (id === 31337) return "Hardhat Local";
  if (id === 11155111) return "Sepolia";
  return `chain ${id}`;
}

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chainId } = useAccount();

  if (isConnected && chainId !== EXPECTED_CHAIN_ID) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-zamaYellow/20 bg-zamaYellow/[0.06] p-4 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-zamaYellow" />
        <div className="space-y-1">
          <p className="font-semibold text-zamaYellow">Wrong network</p>
          <p className="text-slate-400">
            Switch your wallet to{" "}
            <strong className="text-slate-200">{chainName(EXPECTED_CHAIN_ID)}</strong> to submit
            transactions.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
