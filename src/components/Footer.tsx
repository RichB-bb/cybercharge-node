"use client";

import { BatteryCharging } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-10 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-zinc-500 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3 text-zinc-950">
            <BatteryCharging size={18} className="text-red-600" />
            {t.footer.brand}
          </div>
          <p className="mt-3 max-w-xl">
            {t.footer.disclosure}
          </p>
        </div>
        <p className="max-w-xl">
          {t.footer.mvp}
        </p>
      </div>
    </footer>
  );
}
