"use client";

import { useEffect, useState } from "react";
import { Layers3 } from "lucide-react";
import { useAccount } from "wagmi";
import { useLanguage } from "@/lib/i18n";
import { fetchAllocationsByWallet, isSupabaseConfigured } from "@/lib/supabase";
import type { AllocationRecord } from "@/lib/supabase";

export function AllocationCard() {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const [allocation, setAllocation] = useState<AllocationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address || !isSupabaseConfigured) {
      setAllocation(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchAllocationsByWallet(address)
      .then((data) => {
        if (isMounted) {
          setAllocation(data[0] ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAllocation(null);
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
    <section className="border border-zinc-200 bg-zinc-50 p-5 sm:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Allocation
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            {t.dashboard.allocationTitle}
          </h2>
        </div>
        <Layers3 size={24} className="shrink-0 text-red-600" />
      </div>
      <p className="mt-5 leading-7 text-zinc-500">{t.dashboard.allocationSubtitle}</p>

      <div className="mt-10 space-y-5">
        {isLoading && <p className="text-sm text-zinc-500">Loading allocation data...</p>}
        {!isLoading && !allocation && (
          <p className="text-sm text-zinc-500">No infrastructure allocations found.</p>
        )}
        {!isLoading && allocation && (
          <>
            <Metric label="Allocation Unit" value={`${allocation.allocation_percent}%`} />
            <Metric label="Purchase Value" value={`${allocation.purchase_value} ${allocation.asset}`} />
            <Metric label="Network" value={allocation.network} />
            <Metric label="Created" value={formatDate(allocation.created_at)} />
          </>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6 border-t border-zinc-200 pt-4">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="font-semibold text-zinc-950">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
