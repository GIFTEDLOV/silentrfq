"use client";

import { useMemo } from "react";
import { parseEventLogs } from "viem";
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

export function useGetRFQsByBuyer(buyer: `0x${string}` | undefined) {
  return useReadContract({
    address: FACTORY_ADDRESS!,
    abi: SILENT_RFQ_FACTORY_ABI,
    functionName: "getRFQsByBuyer",
    args: buyer ? [buyer] : undefined,
    chainId: EXPECTED_CHAIN_ID,
    query: { enabled: !!FACTORY_ADDRESS && !!buyer },
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

  const {
    data: receipt,
    isPending: _isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
    // Without enabled guard, TanStack Query v5 reports isPending:true from first
    // render (no cached data = pending state), causing phantom "Confirming..." UI.
    query: { enabled: !!hash },
  });
  const isConfirming = !!hash && _isConfirming;

  // Extract the deployed RFQ contract address from the RFQCreated event in the receipt.
  const createdRFQAddress = useMemo<`0x${string}` | undefined>(() => {
    if (!receipt) return undefined;
    try {
      const logs = parseEventLogs({
        abi: SILENT_RFQ_FACTORY_ABI,
        logs: receipt.logs,
        eventName: "RFQCreated",
      });
      return (logs[0]?.args as { rfq?: `0x${string}` } | undefined)?.rfq;
    } catch {
      return undefined;
    }
  }, [receipt]);

  const create = (description: string, deadline: bigint) => {
    if (!FACTORY_ADDRESS) return;
    writeContract({
      address: FACTORY_ADDRESS,
      abi: SILENT_RFQ_FACTORY_ABI,
      functionName: "createRFQ",
      args: [description, deadline],
    });
  };

  return { create, hash, isPending, isConfirming, isSuccess, createdRFQAddress, error, reset };
}
