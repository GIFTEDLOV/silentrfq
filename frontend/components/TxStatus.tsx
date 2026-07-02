"use client";

import { CheckCircle, ExternalLink, Loader2, XCircle } from "lucide-react";
import { useAccount } from "wagmi";

type TxStatusProps = {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null | undefined;
  hash?: `0x${string}`;
};

export function TxStatus({
  isPending,
  isConfirming,
  isSuccess,
  error,
  hash,
}: TxStatusProps) {
  const { chainId } = useAccount();
  const isSepoliaChain = chainId === 11155111;

  if (!isPending && !isConfirming && !isSuccess && !error) return null;

  const etherscanTxLink =
    hash && isSepoliaChain ? `https://sepolia.etherscan.io/tx/${hash}` : null;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm space-y-2">
      {isPending && (
        <div className="flex items-center gap-2 text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-zamaYellow" />
          <span className="font-medium">Waiting for wallet approval...</span>
        </div>
      )}
      {isConfirming && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-fheBlueSoft">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-medium">Transaction submitted — confirming...</span>
          </div>
          {hash && (
            <div className="flex flex-wrap items-center gap-2 pl-6">
              <span className="font-mono text-xs text-slate-600 break-all">{hash}</span>
              {etherscanTxLink && (
                <a
                  href={etherscanTxLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-fheBlueSoft hover:underline"
                >
                  Etherscan <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
      {isSuccess && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            <span className="font-semibold">Transaction confirmed.</span>
          </div>
          {etherscanTxLink && (
            <a
              href={etherscanTxLink}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-6 inline-flex items-center gap-1 text-xs font-medium text-fheBlueSoft hover:underline"
            >
              View on Sepolia Etherscan <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 text-red-400">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="break-words">
            {(error as Error & { shortMessage?: string }).shortMessage ?? error.message}
          </p>
        </div>
      )}
    </div>
  );
}
