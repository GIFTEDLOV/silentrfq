"use client";

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
      <div className="rounded border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800 space-y-1">
        <p>
          Wrong network. Please switch your wallet to{" "}
          <strong>{chainName(EXPECTED_CHAIN_ID)}</strong>.
        </p>
        <p>Switch to the configured network before submitting transactions.</p>
      </div>
    );
  }

  return <>{children}</>;
}
