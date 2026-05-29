"use client";

import { useLanguage } from "@/lib/i18n";

export function InfrastructureOverview() {
  const { t } = useLanguage();

  return (
    <section className="bg-white px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-7xl">
            {t.infrastructure.title}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-zinc-500 sm:mt-6 sm:text-2xl sm:leading-9">
            {t.infrastructure.subtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-10 sm:mt-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
          <div className="min-h-[360px] bg-[url('/images/station.avif')] bg-cover bg-center sm:min-h-[68vh]" />

          <div className="space-y-8 sm:space-y-12">
            {t.infrastructure.items.map((item) => (
              <div key={item.title} className="border-t border-zinc-200 pt-8">
                <h3 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-zinc-500 sm:text-lg sm:leading-8">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
