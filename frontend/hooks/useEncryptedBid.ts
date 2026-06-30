"use client";

import { useState } from "react";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/web";
import {
  createInstance,
  initSDK,
  SepoliaConfig,
} from "@zama-fhe/relayer-sdk/web";
import { bytesToHex } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { SILENT_RFQ_ABI } from "@/config/contracts";

type SdkStatus = "idle" | "initializing" | "ready" | "error";
type EncryptStatus = "idle" | "encrypting" | "done" | "error";

// The network field expects Eip1193Provider from ethers; window.ethereum satisfies that interface.
type FhevmNetwork = Parameters<typeof createInstance>[0]["network"];

export function useEncryptedBid() {
  const [sdkStatus, setSdkStatus] = useState<SdkStatus>("idle");
  const [sdkError, setSdkError] = useState("");
  const [encryptStatus, setEncryptStatus] = useState<EncryptStatus>("idle");
  const [encryptError, setEncryptError] = useState("");
  const [fhevmInstance, setFhevmInstance] = useState<FhevmInstance | null>(
    null
  );

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isPending: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const initSdk = async () => {
    if (sdkStatus === "ready" || sdkStatus === "initializing") return;
    setSdkStatus("initializing");
    setSdkError("");
    try {
      const win = window as Window & { ethereum?: unknown };
      if (!win.ethereum) throw new Error("No wallet detected. Install MetaMask.");

      await initSDK();

      const instance = await createInstance({
        ...SepoliaConfig,
        network: win.ethereum as unknown as FhevmNetwork,
      });

      setFhevmInstance(instance);
      setSdkStatus("ready");
    } catch (e) {
      setSdkError(e instanceof Error ? e.message : String(e));
      setSdkStatus("error");
    }
  };

  const encryptAndSubmit = async (
    rfqAddress: `0x${string}`,
    userAddress: `0x${string}`,
    bidAmount: bigint
  ) => {
    if (!fhevmInstance) return;
    reset();
    setEncryptStatus("encrypting");
    setEncryptError("");
    try {
      const encInput = fhevmInstance.createEncryptedInput(
        rfqAddress,
        userAddress
      );
      encInput.add64(bidAmount);
      const { handles, inputProof } = await encInput.encrypt();

      const inputBid = bytesToHex(handles[0]);
      const proof = bytesToHex(inputProof);

      setEncryptStatus("done");

      writeContract({
        address: rfqAddress,
        abi: SILENT_RFQ_ABI,
        functionName: "submitBid",
        args: [inputBid, proof],
      });
    } catch (e) {
      setEncryptError(e instanceof Error ? e.message : String(e));
      setEncryptStatus("error");
    }
  };

  return {
    sdkStatus,
    sdkError,
    encryptStatus,
    encryptError,
    fhevmInstance,
    initSdk,
    encryptAndSubmit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    writeError: writeError as Error | null,
    reset,
  };
}
