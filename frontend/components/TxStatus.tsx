"use client";

import { ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";

type TxStatusProps = {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null | undefined;
  hash?: `0x${string}`;
};

export function TxStatus({ isPending, isConfirming, isSuccess, error, hash }: TxStatusProps) {
  const { chainId } = useAccount();
  const isSepoliaChain = chainId === 11155111;

  if (!isPending && !isConfirming && !isSuccess && !error) return null;

  const etherscanLink = hash && isSepoliaChain
    ? `https://sepolia.etherscan.io/tx/${hash}`
    : null;

  return (
    <div className="mt-3 rounded-xl border border-slate-200 p-3 text-sm">
      {isPending && (
        <p className="text-amber-700">Waiting for wallet approval...</p>
      )}
      {isConfirming && (
        <div className="space-y-1">
          <p className="text-blue-700">Transaction submitted. Waiting for confirmation...</p>
          {hash && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-500 break-all">{hash}</span>
              {etherscanLink && (
                <a
                  href={etherscanLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                >
                  View on Sepolia Etherscan
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
      {isSuccess && (
        <div className="space-y-1">
          <p className="font-medium text-emerald-700">Transaction confirmed.</p>
          {etherscanLink && (
            <a
              href={etherscanLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
            >
              View on Sepolia Etherscan
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
      {error && (
        <p className="break-words text-red-700">
          Error: {(error as Error & { shortMessage?: string }).shortMessage ?? error.message}
        </p>
      )}
    </div>
  );
}
