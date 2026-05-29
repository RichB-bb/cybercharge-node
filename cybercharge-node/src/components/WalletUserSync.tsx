"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

export function WalletUserSync() {
  const { address, isConnected } = useAccount();
  const lastSyncedAddressRef = useRef<string | null>(null);
  const [syncMessage, setSyncMessage] = useState("");
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("WalletUserSync mounted");
    }
  }, []);

  async function runManualSync() {
    if (!address) {
      console.warn("Manually Sync Current Wallet skipped: no address detected.");
      return;
    }

    setIsManualSyncing(true);

    try {
      console.log("Manually Sync Current Wallet clicked");
      console.log("address detected", address);
      console.log("calling /api/user/sync", address.toLowerCase());

      const user = await syncWalletUserOnServer(address.toLowerCase());

      console.log("manual sync result", user);
      setSyncMessage("Manual wallet sync complete");
      lastSyncedAddressRef.current = address.toLowerCase();
    } catch (error) {
      console.error("manual sync error detail", serializeError(error));
      setSyncMessage("Manual wallet sync failed");
    } finally {
      setIsManualSyncing(false);
    }
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("address detected", address ?? null);
    }

    if (!isConnected || !address) {
      lastSyncedAddressRef.current = null;
      setSyncMessage("");
      return;
    }

    const normalizedAddress = address.toLowerCase();

    if (lastSyncedAddressRef.current === normalizedAddress) {
      return;
    }

    let isMounted = true;
    lastSyncedAddressRef.current = normalizedAddress;

    async function syncWalletUser() {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("calling /api/user/sync", normalizedAddress);
        }

        const user = await syncWalletUserOnServer(normalizedAddress);

        if (process.env.NODE_ENV === "development") {
          console.log("user sync success", user);
        }

        if (isMounted) {
          setSyncMessage("Wallet user synced");
        }
      } catch (error) {
        lastSyncedAddressRef.current = null;

        if (process.env.NODE_ENV === "development") {
          console.error("Wallet user sync failed", error);
        }

        if (isMounted) {
          setSyncMessage("Wallet user sync pending");
        }
      }
    }

    void syncWalletUser();

    return () => {
      isMounted = false;
    };
  }, [address, isConnected]);

  if (process.env.NODE_ENV !== "development" || !syncMessage) {
    if (process.env.NODE_ENV !== "development") {
      return null;
    }
  }

  return (
    <>
      <span className="sr-only" aria-live="polite">
        {syncMessage}
      </span>
      {address && (
        <button
          type="button"
          onClick={runManualSync}
          disabled={isManualSyncing}
          className="fixed bottom-4 left-4 z-[100] border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-950 shadow-lg disabled:opacity-50"
        >
          {isManualSyncing ? "Syncing Wallet..." : "Manually Sync Current Wallet"}
        </button>
      )}
    </>
  );
}

async function syncWalletUserOnServer(walletAddress: string) {
  const response = await fetch("/api/user/sync", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ wallet_address: walletAddress }),
  });
  const data = await response.json();

  if (!response.ok) {
    console.error("user sync API error detail", data);
    throw data;
  }

  return data;
}

function serializeError(error: unknown) {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }

  const record = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };

  return {
    code: record.code,
    message: record.message,
    details: record.details,
    hint: record.hint,
  };
}
