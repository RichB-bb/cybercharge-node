"use client";

import { useLanguage } from "@/lib/i18n";

export function PaymentTimeline() {
  const { t } = useLanguage();

  return (
    <section className="bg-white px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600">
              {t.checkout.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              {t.checkout.title}
            </h2>
          </div>
          <a
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            {t.checkout.dashboardCta}
          </a>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {t.checkout.steps.map((step, index) => (
            <div key={step} className="border border-zinc-200 bg-white p-5">
              <p className="text-sm font-medium text-zinc-400">Step {index + 1}</p>
              <p className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
