"use client";

import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  FACTORY_ADDRESS,
  SILENT_RFQ_FACTORY_ABI,
} from "@/config/contracts";

export function useGetRFQs() {
  return useReadContract({
    address: FACTORY_ADDRESS!,
    abi: SILENT_RFQ_FACTORY_ABI,
    functionName: "getRFQs",
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

  const { isPending: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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
