"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLanguage } from "@/lib/i18n";

export function DashboardHero() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { t } = useLanguage();
  const [canShowDisconnected, setCanShowDisconnected] = useState(false);
  const [userSyncStatus, setUserSyncStatus] = useState<"ready" | "pending" | "found" | "syncing">(
    "ready",
  );
  const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;
  const isRestoringWallet = isConnecting || isReconnecting || (!canShowDisconnected && !address);

  useEffect(() => {
    const timer = window.setTimeout(() => setCanShowDisconnected(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isConnecting || isReconnecting) {
      setUserSyncStatus("pending");
      return;
    }

    if (!isConnected || !address) {
      setUserSyncStatus("pending");
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
          setUserSyncStatus("found");
        }
      } catch {
        if (isMounted) {
          setUserSyncStatus("syncing");
        }
      }
    }

    void syncWalletUser();

    return () => {
      isMounted = false;
    };
  }, [address, isConnected, isConnecting, isReconnecting]);

  return (
    <section className="grid gap-6 border-b border-zinc-200 pb-6 sm:pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-red-600">
          CyberCharge
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          {t.dashboard.title}
        </h1>
      </div>

      <div className="min-w-0 border-t border-zinc-200 pt-5 lg:min-w-72">
        <p className="text-sm text-zinc-500">
          {isRestoringWallet
            ? t.dashboard.reconnectingWallet
            : isConnected
              ? t.dashboard.connectedWallet
              : t.dashboard.noWalletConnected}
        </p>
        {displayAddress ? (
          <p className="mt-2 truncate font-mono text-2xl font-semibold text-zinc-950">
            {displayAddress}
          </p>
        ) : isRestoringWallet ? (
          <div className="mt-4 h-11 w-full bg-zinc-100 px-4 text-sm font-semibold leading-[2.75rem] text-zinc-500">
            {t.dashboard.reconnectingWallet}
          </div>
        ) : (
          <button
            type="button"
            onClick={openConnectModal}
            className="mt-4 h-11 w-full bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            {t.dashboard.connectWallet}
          </button>
        )}
      </div>
    </section>
  );
}

function getUserSyncLabel(
  status: "ready" | "pending" | "found" | "syncing",
  labels: {
    supabaseReady: string;
    userRecordFound: string;
    userSyncPending: string;
    walletIdentityPending: string;
  },
) {
  if (status === "found") return labels.userRecordFound;
  if (status === "syncing") return labels.userSyncPending;
  if (status === "pending") return labels.walletIdentityPending;
  return labels.supabaseReady;
}
