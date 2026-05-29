"use client";

import { useLanguage } from "@/lib/i18n";

const exposures = [
  { city: "Tokyo", value: 34 },
  { city: "Singapore", value: 18 },
  { city: "Dubai", value: 21 },
  { city: "Los Angeles", value: 27 },
];

export function DeploymentExposure() {
  const { t } = useLanguage();

  return (
    <section className="border border-zinc-200 bg-white p-5 sm:p-8">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
        {t.dashboard.exposureTitle}
      </h2>
      <div className="mt-8 space-y-6">
        {exposures.map((item) => (
          <div key={item.city}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="font-medium text-zinc-950">{item.city}</span>
              <span className="text-sm text-zinc-500">{item.value}%</span>
            </div>
            <div className="h-2 overflow-hidden bg-zinc-100">
              <div className="h-full bg-zinc-950" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
