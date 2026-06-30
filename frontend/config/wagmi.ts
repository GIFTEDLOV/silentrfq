import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "SilentRFQ",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    "placeholder-silentrfq-local",
  chains: [hardhat, sepolia],
  ssr: true,
});
