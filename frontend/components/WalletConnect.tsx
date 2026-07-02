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
                className="rounded-xl bg-zamaYellow px-4 py-2 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(255,210,8,0.35)] transition-all"
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
                  className="rounded-xl border border-zamaYellow/30 bg-zamaYellow/10 px-4 py-2 text-sm font-semibold text-zamaYellow hover:bg-zamaYellow hover:text-ink transition-all"
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
