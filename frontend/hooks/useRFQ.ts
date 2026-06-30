"use client";

import { useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { EXPECTED_CHAIN_ID, SILENT_RFQ_ABI } from "@/config/contracts";

export function useRFQ(address: `0x${string}`) {
  const contract = { address, abi: SILENT_RFQ_ABI } as const;

  // Explicit chainId prevents wagmi from defaulting to the first chain in the
  // config (hardhat) when the wallet is not yet connected. Without it, reads
  // fail at the localhost:8545 transport when no local node is running.
  const result = useReadContracts({
    contracts: [
      { ...contract, functionName: "buyer",          chainId: EXPECTED_CHAIN_ID },
      { ...contract, functionName: "description",    chainId: EXPECTED_CHAIN_ID },
      { ...contract, functionName: "deadline",       chainId: EXPECTED_CHAIN_ID },
      { ...contract, functionName: "finalized",      chainId: EXPECTED_CHAIN_ID },
      { ...contract, functionName: "winnerRevealed", chainId: EXPECTED_CHAIN_ID },
      { ...contract, functionName: "vendorCount",    chainId: EXPECTED_CHAIN_ID },
    ],
  });

  const [b, d, dl, f, wr, vc] = result.data ?? [];

  return {
    buyer: b?.result as `0x${string}` | undefined,
    description: d?.result as string | undefined,
    deadline: dl?.result as bigint | undefined,
    finalized: f?.result as boolean | undefined,
    winnerRevealed: wr?.result as boolean | undefined,
    vendorCount: vc?.result as bigint | undefined,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
  };
}

export function useWinnerAddress(
  address: `0x${string}`,
  enabled: boolean
) {
  return useReadContract({
    address,
    abi: SILENT_RFQ_ABI,
    functionName: "winnerAddress",
    chainId: EXPECTED_CHAIN_ID,
    query: { enabled },
  });
}

export function useFinalize(address: `0x${string}`) {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isPending: _isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });
  const isConfirming = !!hash && _isConfirming;

  const finalize = () => {
    writeContract({
      address,
      abi: SILENT_RFQ_ABI,
      functionName: "finalize",
    });
  };

  return { finalize, hash, isPending, isConfirming, isSuccess, error, reset };
}
