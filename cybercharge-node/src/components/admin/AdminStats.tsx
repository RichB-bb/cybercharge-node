"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CircleDollarSign, Clock3, UsersRound } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { AllocationRecord, TransactionRecord, UserRecord } from "@/lib/supabase";

export function AdminStats() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const client = createSupabaseAdminClient();

    if (!client) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    Promise.all([
      client.from("users").select("*"),
      client.from("allocations").select("*"),
      client.from("transactions").select("*"),
    ]).then(([usersResult, allocationsResult, transactionsResult]) => {
      if (!mounted) return;
      setUsers((usersResult.data ?? []) as UserRecord[]);
      setAllocations((allocationsResult.data ?? []) as AllocationRecord[]);
      setTransactions((transactionsResult.data ?? []) as TransactionRecord[]);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const totalVolume = useMemo(
    () => allocations.reduce((sum, item) => sum + Number(item.purchase_value), 0),
    [allocations],
  );
  const pendingTransactions = transactions.filter((item) => item.status === "pending").length;
  const confirmedTransactions = transactions.filter((item) => item.status === "confirmed").length;
  const stats = [
    { label: "Total Users", value: users.length, icon: UsersRound },
    { label: "Total Transactions", value: transactions.length, icon: Activity },
    { label: "Total Allocation Volume", value: `${formatAmount(totalVolume)} USDT`, icon: CircleDollarSign },
    { label: "Pending Transactions", value: pendingTransactions, icon: Clock3 },
    { label: "Confirmed Transactions", value: confirmedTransactions, icon: Activity },
  ];

  return (
    <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.label} className="border-t border-zinc-200 pt-5">
            <Icon size={20} className="text-red-600" />
            <p className="mt-7 text-3xl font-semibold tracking-tight text-zinc-950">
              {isLoading ? "..." : item.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{item.label}</p>
          </article>
        );
      })}
    </section>
  );
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}
