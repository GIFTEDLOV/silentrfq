"use client";

import { useReadContracts } from "wagmi";
import { EXPECTED_CHAIN_ID, SILENT_RFQ_ABI } from "@/config/contracts";

type Props = {
  addresses: readonly `0x${string}`[];
};

export function RFQStatsBar({ addresses }: Props) {
  const contracts = addresses.flatMap((addr) => [
    { address: addr, abi: SILENT_RFQ_ABI, functionName: "finalized" as const, chainId: EXPECTED_CHAIN_ID },
    { address: addr, abi: SILENT_RFQ_ABI, functionName: "winnerRevealed" as const, chainId: EXPECTED_CHAIN_ID },
  ]);

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: addresses.length > 0 },
  });

  const total = addresses.length;
  let open = 0;
  let finalized = 0;
  let revealed = 0;

  if (data) {
    for (let i = 0; i < addresses.length; i++) {
      const isFinalized = data[i * 2]?.result as boolean | undefined;
      const isRevealed = data[i * 2 + 1]?.result as boolean | undefined;
      if (isFinalized) finalized++;
      else open++;
      if (isRevealed) revealed++;
    }
  }

  const stats = [
    { label: "Total RFQs",      value: total },
    { label: "Open",            value: isLoading ? "-" : open },
    { label: "Finalized",       value: isLoading ? "-" : finalized },
    { label: "Winners Revealed",value: isLoading ? "-" : revealed },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value }) => (
        <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-0.5 text-xs text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
