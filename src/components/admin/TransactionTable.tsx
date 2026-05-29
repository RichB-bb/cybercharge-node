"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { TransactionRecord, UserRecord } from "@/lib/supabase";

export function TransactionTable() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wallets = useMemo(
    () => new Map(users.map((user) => [user.id, user.wallet_address])),
    [users],
  );

  useEffect(() => {
    const client = createSupabaseAdminClient();

    if (!client) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    Promise.all([
      client.from("transactions").select("*").order("created_at", { ascending: false }),
      client.from("users").select("*"),
    ]).then(([transactionsResult, usersResult]) => {
      if (!mounted) return;
      setTransactions((transactionsResult.data ?? []) as TransactionRecord[]);
      setUsers((usersResult.data ?? []) as UserRecord[]);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminTable title="Transactions" isLoading={isLoading} empty={transactions.length === 0}>
      <table className="w-full min-w-[920px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500">
            {["Wallet", "Tx Hash", "Amount", "Asset", "Network", "Status", "Created", "Confirmed"].map((item) => (
              <th key={item} className="py-3 pr-5 font-medium">{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100">
              <td className="py-4 pr-5 font-mono text-xs">{shorten(wallets.get(item.user_id))}</td>
              <td className="py-4 pr-5 font-mono text-xs">{shorten(item.tx_hash)}</td>
              <td className="py-4 pr-5 text-zinc-500">{item.amount}</td>
              <td className="py-4 pr-5 text-zinc-500">{item.asset}</td>
              <td className="py-4 pr-5 text-zinc-500">{item.network}</td>
              <td className="py-4 pr-5"><StatusBadge status={item.status} /></td>
              <td className="py-4 pr-5 text-zinc-500">{formatDate(item.created_at)}</td>
              <td className="py-4 pr-5 text-zinc-500">{item.confirmation_time ? formatDate(item.confirmation_time) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTable>
  );
}

function AdminTable({ children, empty, isLoading, title }: { children: React.ReactNode; empty: boolean; isLoading: boolean; title: string }) {
  return (
    <section className="border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h2>
      <div className="mt-5 overflow-x-auto">{children}</div>
      {isLoading && <p className="mt-5 text-sm text-zinc-500">Loading data...</p>}
      {!isLoading && empty && <p className="mt-5 text-sm text-zinc-500">No records found.</p>}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex h-7 items-center px-3 text-xs font-medium capitalize ${status === "confirmed" || status === "active" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-500"}`}>
      {status}
    </span>
  );
}

function shorten(value?: string | null) {
  if (!value) return "-";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export { AdminTable, StatusBadge, formatDate, shorten };
