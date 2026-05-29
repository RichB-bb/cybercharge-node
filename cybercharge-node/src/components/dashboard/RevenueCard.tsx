"use client";

import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function RevenueCard() {
  const { t } = useLanguage();

  return (
    <section className="border border-zinc-200 bg-white p-5 sm:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-600">
            Participation
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            {t.dashboard.revenueTitle}
          </h2>
        </div>
        <TrendingUp size={24} className="shrink-0 text-red-600" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {t.dashboard.revenueItems.map((item) => (
          <div key={item} className="border-t border-zinc-200 pt-5">
            <p className="text-xl font-semibold tracking-tight text-zinc-950">{item}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Illustrative metrics based on deployment activity and utilization signals.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
