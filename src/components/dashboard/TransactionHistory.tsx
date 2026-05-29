"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLanguage } from "@/lib/i18n";
import { fetchTransactionsByWallet, isSupabaseConfigured } from "@/lib/supabase";
import type { TransactionRecord } from "@/lib/supabase";

export function TransactionHistory() {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address || !isSupabaseConfigured) {
      setTransactions([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchTransactionsByWallet(address)
      .then((data) => {
        if (isMounted) {
          setTransactions(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTransactions([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [address, isConnected]);

  return (
    <section className="mt-5 border border-zinc-200 bg-white p-5 sm:p-8">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
        {t.dashboard.transactionsTitle}
      </h2>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              {["Tx Hash", "Network", "Asset", "Status", "Confirmation Time"].map((header) => (
                <th key={header} className="py-3 pr-6 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-5 pr-6 font-mono text-xs font-medium text-zinc-950">
                  {item.tx_hash ? `${item.tx_hash.slice(0, 8)}...${item.tx_hash.slice(-6)}` : "Pending"}
                </td>
                <td className="py-5 pr-6 text-zinc-500">{item.network}</td>
                <td className="py-5 pr-6 text-zinc-500">
                  {item.amount} {item.asset}
                </td>
                <td className="py-5 pr-6">
                  <span
                    className={`inline-flex h-7 items-center px-3 text-xs font-medium capitalize ${
                      item.status === "confirmed"
                        ? "bg-zinc-950 text-white"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-5 pr-6 text-zinc-500">
                  {item.confirmation_time ? formatDateTime(item.confirmation_time) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLoading && <p className="mt-6 text-sm text-zinc-500">Loading transactions...</p>}
      {!isLoading && transactions.length === 0 && (
        <p className="mt-6 text-sm text-zinc-500">No transactions found.</p>
      )}

      <p className="mt-6 max-w-3xl text-sm leading-6 text-zinc-500">
        {t.dashboard.disclaimer}
      </p>
    </section>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
