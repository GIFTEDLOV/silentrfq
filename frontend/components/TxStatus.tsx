"use client";

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
  if (!isPending && !isConfirming && !isSuccess && !error) return null;

  return (
    <div className="mt-3 rounded border p-3 text-sm">
      {isPending && (
        <p className="text-yellow-700">Waiting for wallet approval...</p>
      )}
      {isConfirming && (
        <p className="text-blue-700">
          Transaction submitted. Waiting for confirmation...
          {hash && (
            <span className="ml-2 font-mono text-xs break-all">({hash})</span>
          )}
        </p>
      )}
      {isSuccess && (
        <p className="text-green-700">Transaction confirmed.</p>
      )}
      {error && (
        <p className="text-red-700 break-words">
          Error: {(error as Error & { shortMessage?: string }).shortMessage ?? error.message}
        </p>
      )}
    </div>
  );
}
