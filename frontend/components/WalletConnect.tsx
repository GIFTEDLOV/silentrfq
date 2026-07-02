"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {!connected ? (
              <button
                onClick={openConnectModal}
                type="button"
                className="
                  relative overflow-hidden rounded-xl
                  border border-zamaYellow/30
                  bg-gradient-to-b from-zamaYellow/[0.20] to-zamaYellow/[0.07]
                  px-4 py-2 text-sm font-bold text-zamaYellow
                  backdrop-blur-sm
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.13),inset_0_-1px_0_rgba(0,0,0,0.12)]
                  hover:border-zamaYellow/50
                  hover:from-zamaYellow/[0.28] hover:to-zamaYellow/[0.12]
                  hover:shadow-[0_0_28px_rgba(255,210,8,0.28),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.12)]
                  transition-all duration-200
                  before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[45%]
                  before:bg-gradient-to-b before:from-white/[0.11] before:to-transparent
                  before:pointer-events-none before:rounded-t-xl
                "
              >
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                type="button"
                className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-danger/15 transition-colors"
              >
                Wrong Network
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openChainModal}
                  type="button"
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 hover:border-white/[0.15] hover:bg-white/[0.07] transition-all"
                >
                  {chain.name}
                </button>
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="
                    relative overflow-hidden rounded-xl
                    border border-zamaYellow/25
                    bg-gradient-to-b from-zamaYellow/[0.15] to-zamaYellow/[0.05]
                    px-4 py-2 text-sm font-semibold text-zamaYellow
                    backdrop-blur-sm
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                    hover:border-zamaYellow/40
                    hover:from-zamaYellow/[0.22] hover:to-zamaYellow/[0.09]
                    hover:shadow-[0_0_20px_rgba(255,210,8,0.20),inset_0_1px_0_rgba(255,255,255,0.14)]
                    transition-all duration-200
                    before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[40%]
                    before:bg-gradient-to-b before:from-white/[0.08] before:to-transparent
                    before:pointer-events-none before:rounded-t-xl
                  "
                >
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
