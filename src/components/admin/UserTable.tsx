"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { AllocationRecord, UserRecord } from "@/lib/supabase";
import { AdminTable, formatDate, shorten } from "./TransactionTable";

export function UserTable() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const allocationCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allocations.forEach((item) => counts.set(item.user_id, (counts.get(item.user_id) ?? 0) + 1));
    return counts;
  }, [allocations]);

  useEffect(() => {
    const client = createSupabaseAdminClient();

    if (!client) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    Promise.all([
      client.from("users").select("*").order("created_at", { ascending: false }),
      client.from("allocations").select("*"),
    ]).then(([usersResult, allocationsResult]) => {
      if (!mounted) return;
      setUsers((usersResult.data ?? []) as UserRecord[]);
      setAllocations((allocationsResult.data ?? []) as AllocationRecord[]);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="mt-5">
      <AdminTable title="Users" isLoading={isLoading} empty={users.length === 0}>
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              {["Wallet Address", "Created", "Allocation Count"].map((item) => (
                <th key={item} className="py-3 pr-5 font-medium">{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-4 pr-5 font-mono text-xs">{shorten(item.wallet_address)}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatDate(item.created_at)}</td>
                <td className="py-4 pr-5 text-zinc-500">{allocationCounts.get(item.id) ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>
    </section>
  );
}
