"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BatteryCharging, CircleDollarSign, Gauge } from "lucide-react";
import { useAccount } from "wagmi";
import { useLanguage } from "@/lib/i18n";
import {
  fetchAllocationsByWallet,
  fetchPendingTransactionCountByWallet,
  isSupabaseConfigured,
} from "@/lib/supabase";
import type { AllocationRecord } from "@/lib/supabase";

export function PortfolioOverview() {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address || !isSupabaseConfigured) {
      setAllocations([]);
      setPendingCount(0);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      fetchAllocationsByWallet(address),
      fetchPendingTransactionCountByWallet(address),
    ])
      .then(([data, count]) => {
        if (isMounted) {
          setAllocations(data);
          setPendingCount(count);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAllocations([]);
          setPendingCount(0);
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

  const totalAllocation = useMemo(
    () => allocations.reduce((sum, item) => sum + Number(item.allocation_percent), 0),
    [allocations],
  );
  const totalPurchaseValue = useMemo(
    () => allocations.reduce((sum, item) => sum + Number(item.purchase_value), 0),
    [allocations],
  );
  const labels = [
    t.dashboard.totalAllocation,
    t.dashboard.participationValue,
    t.dashboard.activeStations,
    t.dashboard.monthlySessions,
  ];
  const values = [
    { value: isLoading ? "..." : `${totalAllocation}%`, icon: Gauge },
    {
      value: isLoading ? "..." : `${formatAmount(totalPurchaseValue)} USDT`,
      icon: CircleDollarSign,
    },
    { value: isLoading ? "..." : String(Math.round(totalAllocation * 12.8)), icon: BatteryCharging },
    { value: isLoading ? "..." : formatInteger(Math.round(totalAllocation * 736.8)), icon: Activity },
  ];

  return (
    <section className="mt-10">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        {t.dashboard.portfolio}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((item, index) => {
          const Icon = item.icon;
          return (
            <article key={labels[index]} className="border-t border-zinc-200 pt-5">
              <Icon size={20} className="text-red-600" />
              <p className="mt-8 text-3xl font-semibold tracking-tight text-zinc-950">
                {item.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{labels[index]}</p>
            </article>
          );
        })}
      </div>
      {!isLoading && isConnected && isSupabaseConfigured && allocations.length === 0 && (
        <p className="mt-6 text-sm text-zinc-500">No infrastructure allocations found.</p>
      )}
      <p className="mt-3 text-sm text-zinc-500">
        Pending Transactions:{" "}
        <span className="font-medium text-zinc-950">{isLoading ? "..." : pendingCount}</span>
      </p>
    </section>
  );
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
