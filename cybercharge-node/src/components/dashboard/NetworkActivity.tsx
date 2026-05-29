"use client";

import { Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function NetworkActivity() {
  const { t } = useLanguage();

  return (
    <section className="border border-zinc-200 bg-zinc-50 p-5 sm:p-8">
      <div className="flex items-center justify-between gap-6">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
          {t.dashboard.activityTitle}
        </h2>
        <Zap size={24} className="text-red-600" />
      </div>
      <div className="mt-8 space-y-5">
        {t.dashboard.activityItems.map((item) => (
          <div key={item.label} className="border-t border-zinc-200 pt-4">
            <p className="text-sm text-zinc-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
