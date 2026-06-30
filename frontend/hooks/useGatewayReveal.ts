"use client";

import { useState } from "react";
// type-only imports are erased at runtime — no eager SDK chunk dependency
import type { FhevmInstance, PublicDecryptResults } from "@zama-fhe/relayer-sdk/web";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { SILENT_RFQ_ABI } from "@/config/contracts";

export type SdkStatus = "idle" | "initializing" | "ready" | "error";
export type DecryptStatus = "idle" | "decrypting" | "done" | "error";

export function useGatewayReveal() {
  const [sdkStatus, setSdkStatus] = useState<SdkStatus>("idle");
  const [sdkError, setSdkError] = useState("");
  const [decryptStatus, setDecryptStatus] = useState<DecryptStatus>("idle");
  const [decryptError, setDecryptError] = useState("");
  const [decryptResult, setDecryptResult] = useState<PublicDecryptResults | null>(null);
  const [fhevmInstance, setFhevmInstance] = useState<FhevmInstance | null>(null);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  // Guard: TanStack Query v5 reports isPending:true on first render with no data.
  // Disable until a real tx hash exists to prevent phantom "Confirming..." state.
  const { isPending: _isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });
  const isConfirming = !!hash && _isConfirming;

  const initSdk = async () => {
    if (sdkStatus === "ready" || sdkStatus === "initializing") return;
    setSdkStatus("initializing");
    setSdkError("");
    try {
      const win = window as Window & { ethereum?: unknown };
      if (!win.ethereum) throw new Error("No wallet detected. Install MetaMask.");
      // Lazy import prevents eager WASM evaluation when the chunk first loads.
      // Top-level import of the SDK causes the dynamic chunk to fail silently,
      // leaving next/dynamic stuck on the loading fallback.
      const { initSDK, createInstance, SepoliaConfig } = await import(
        "@zama-fhe/relayer-sdk/web"
      );
      await initSDK();
      const instance = await createInstance({
        ...SepoliaConfig,
        network: win.ethereum as Parameters<typeof createInstance>[0]["network"],
      });
      setFhevmInstance(instance);
      setSdkStatus("ready");
    } catch (e) {
      setSdkError(e instanceof Error ? e.message : String(e));
      setSdkStatus("error");
    }
  };

  const requestDecrypt = async (handle: `0x${string}`) => {
    if (!fhevmInstance) return;
    setDecryptStatus("decrypting");
    setDecryptError("");
    setDecryptResult(null);
    try {
      // publicDecrypt fetches KMS-signed decryption from the Zama relayer.
      // Returns: clearValues (map handle→value), abiEncodedClearValues, decryptionProof.
      const result = await fhevmInstance.publicDecrypt([handle]);
      setDecryptResult(result);
      setDecryptStatus("done");
    } catch (e) {
      setDecryptError(e instanceof Error ? e.message : String(e));
      setDecryptStatus("error");
    }
  };

  const submitReveal = (
    rfqAddress: `0x${string}`,
    handle: `0x${string}`,
    result: PublicDecryptResults
  ) => {
    reset();
    writeContract({
      address: rfqAddress,
      abi: SILENT_RFQ_ABI,
      functionName: "callbackRevealWinner",
      // handlesList = [handle], abiEncodedCleartexts and decryptionProof come
      // directly from publicDecrypt — the SDK assembles them in the correct format.
      args: [[handle], result.abiEncodedClearValues, result.decryptionProof],
    });
  };

  const resetDecrypt = () => {
    setDecryptStatus("idle");
    setDecryptError("");
    setDecryptResult(null);
    reset();
  };

  return {
    sdkStatus,
    sdkError,
    decryptStatus,
    decryptError,
    decryptResult,
    fhevmInstance,
    initSdk,
    requestDecrypt,
    submitReveal,
    resetDecrypt,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    writeError: writeError as Error | null,
    reset,
  };
}
