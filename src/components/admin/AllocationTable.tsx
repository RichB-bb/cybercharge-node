"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { AllocationRecord, UserRecord } from "@/lib/supabase";
import { AdminTable, StatusBadge, formatDate, shorten } from "./TransactionTable";

export function AllocationTable() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
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
      client.from("allocations").select("*").order("created_at", { ascending: false }),
      client.from("users").select("*"),
    ]).then(([allocationsResult, usersResult]) => {
      if (!mounted) return;
      setAllocations((allocationsResult.data ?? []) as AllocationRecord[]);
      setUsers((usersResult.data ?? []) as UserRecord[]);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminTable title="Allocations" isLoading={isLoading} empty={allocations.length === 0}>
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500">
            {["Wallet", "Allocation", "Purchase Value", "Asset", "Network", "Status", "Created"].map((item) => (
              <th key={item} className="py-3 pr-5 font-medium">{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allocations.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100">
              <td className="py-4 pr-5 font-mono text-xs">{shorten(wallets.get(item.user_id))}</td>
              <td className="py-4 pr-5 text-zinc-500">{item.allocation_percent}%</td>
              <td className="py-4 pr-5 text-zinc-500">{item.purchase_value}</td>
              <td className="py-4 pr-5 text-zinc-500">{item.asset}</td>
              <td className="py-4 pr-5 text-zinc-500">{item.network}</td>
              <td className="py-4 pr-5"><StatusBadge status={item.status} /></td>
              <td className="py-4 pr-5 text-zinc-500">{formatDate(item.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTable>
  );
}
