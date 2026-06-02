"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLanguage } from "@/lib/i18n";

export function DashboardHero() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { language, t } = useLanguage();
  const [userSyncStatus, setUserSyncStatus] = useState("Supabase ready");
  const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  useEffect(() => {
    if (!isConnected || !address) {
      setUserSyncStatus("Wallet identity pending");
      return;
    }

    let isMounted = true;
    const connectedAddress = address;

    async function syncWalletUser() {
      try {
        const response = await fetch("/api/user/sync", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ wallet_address: connectedAddress }),
        });

        if (!response.ok) {
          throw new Error("User sync failed.");
        }

        if (isMounted) {
          setUserSyncStatus("User record found");
        }
      } catch {
        if (isMounted) {
          setUserSyncStatus("User sync pending");
        }
      }
    }

    void syncWalletUser();

    return () => {
      isMounted = false;
    };
  }, [address, isConnected, language]);

  return (
    <section className="grid gap-6 border-b border-zinc-200 pb-6 sm:pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-red-600">
          CyberCharge
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Rewards Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg sm:leading-8">
          Your available rewards, withdrawal requests, and payout history.
        </p>
      </div>

      <div className="min-w-0 border-t border-zinc-200 pt-5 lg:min-w-72">
        <p className="text-sm text-zinc-500">
          {isConnected ? t.dashboard.connectedWallet : "No Wallet Connected"}
        </p>
        {displayAddress ? (
          <p className="mt-2 truncate font-mono text-2xl font-semibold text-zinc-950">
            {displayAddress}
          </p>
        ) : (
          <button
            type="button"
            onClick={openConnectModal}
            className="mt-4 h-11 w-full bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Connect Wallet
          </button>
        )}
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          {isConnected
            ? "Withdrawals are sent to this connected wallet."
            : "Connect Wallet to view rewards and request withdrawals."}
        </p>
        <p className="mt-1 text-xs text-zinc-400">{userSyncStatus}</p>
      </div>
    </section>
  );
}
