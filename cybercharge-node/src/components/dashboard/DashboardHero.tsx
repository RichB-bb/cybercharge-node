"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLanguage } from "@/lib/i18n";

export function DashboardHero() {
  const { address, isConnected } = useAccount();
  const { language, t } = useLanguage();
  const [userSyncStatus, setUserSyncStatus] = useState("Supabase ready");
  const displayAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "0x8A...921F";

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
    <section className="grid gap-8 border-b border-zinc-200 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-red-600">
          CyberCharge
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
          {t.dashboard.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-500 sm:text-xl sm:leading-8">
          {t.dashboard.subtitle}
        </p>
      </div>

      <div className="min-w-0 border-t border-zinc-200 pt-5 lg:min-w-72">
        <p className="text-sm text-zinc-500">{t.dashboard.connectedWallet}</p>
        <p className="mt-2 truncate font-mono text-2xl font-semibold text-zinc-950">
          {displayAddress}
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          {isConnected ? "Web3 wallet connected" : t.dashboard.notConnected}
        </p>
        <p className="mt-1 text-xs text-zinc-400">{userSyncStatus}</p>
      </div>
    </section>
  );
}
