"use client";

import { AlertTriangle } from "lucide-react";
import { useAccount } from "wagmi";
import { EXPECTED_CHAIN_ID } from "@/config/contracts";

function chainName(id: number): string {
  if (id === 31337) return "Hardhat Local (localhost:8545)";
  if (id === 11155111) return "Sepolia";
  return `chain ${id}`;
}

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chainId } = useAccount();

  if (isConnected && chainId !== EXPECTED_CHAIN_ID) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="space-y-1">
          <p className="font-semibold">Wrong network</p>
          <p>
            Please switch your wallet to{" "}
            <strong>{chainName(EXPECTED_CHAIN_ID)}</strong> before submitting
            transactions.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
