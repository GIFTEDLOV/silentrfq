"use client";

import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  EXPECTED_CHAIN_ID,
  FACTORY_ADDRESS,
  SILENT_RFQ_FACTORY_ABI,
} from "@/config/contracts";

export function useGetRFQs() {
  return useReadContract({
    address: FACTORY_ADDRESS!,
    abi: SILENT_RFQ_FACTORY_ABI,
    functionName: "getRFQs",
    chainId: EXPECTED_CHAIN_ID,
    query: { enabled: !!FACTORY_ADDRESS },
  });
}

export function useCreateRFQ() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isPending: _isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    // Without enabled guard, TanStack Query v5 reports isPending:true from first
    // render (no cached data = pending state), causing phantom "Confirming..." UI.
    query: { enabled: !!hash },
  });
  // Also guard on hash so isConfirming is never true without an actual tx.
  const isConfirming = !!hash && _isConfirming;

  const create = (description: string, deadline: bigint) => {
    if (!FACTORY_ADDRESS) return;
    writeContract({
      address: FACTORY_ADDRESS,
      abi: SILENT_RFQ_FACTORY_ABI,
      functionName: "createRFQ",
      args: [description, deadline],
    });
  };

  return { create, hash, isPending, isConfirming, isSuccess, error, reset };
}
