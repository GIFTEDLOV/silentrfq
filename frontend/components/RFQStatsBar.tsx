"use client";

import { BarChart2, CheckCircle, List, Trophy } from "lucide-react";
import { useReadContracts } from "wagmi";
import { EXPECTED_CHAIN_ID, SILENT_RFQ_ABI } from "@/config/contracts";

type Props = {
  addresses: readonly `0x${string}`[];
};

export function RFQStatsBar({ addresses }: Props) {
  const contracts = addresses.flatMap((addr) => [
    {
      address: addr,
      abi: SILENT_RFQ_ABI,
      functionName: "finalized" as const,
      chainId: EXPECTED_CHAIN_ID,
    },
    {
      address: addr,
      abi: SILENT_RFQ_ABI,
      functionName: "winnerRevealed" as const,
      chainId: EXPECTED_CHAIN_ID,
    },
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
    { label: "Total RFQs",       value: total,                      icon: List,        accent: "text-slate-400" },
    { label: "Open",             value: isLoading ? "—" : open,      icon: BarChart2,   accent: "text-emerald-400" },
    { label: "Finalized",        value: isLoading ? "—" : finalized, icon: CheckCircle, accent: "text-slate-500" },
    { label: "Winners Revealed", value: isLoading ? "—" : revealed,  icon: Trophy,      accent: "text-zamaYellow" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.045]"
        >
          <div className="flex items-start justify-between">
            <p className="font-display text-3xl font-bold text-white">{value}</p>
            <Icon className={`h-5 w-5 ${accent}`} />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
