"use client";

const snapshotItems = [
  { label: "Deployment Markets", value: "18" },
  { label: "Infrastructure Assets", value: "15,160" },
  { label: "Supported Wallets", value: "3+" },
  { label: "Treasury Verified", value: "Yes" },
] as const;

export function PlatformSnapshot() {
  return (
    <section className="bg-white px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600">
              Platform Snapshot
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Built for infrastructure participation.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
            Key operating signals for a deployment-backed EV charging allocation platform.
          </p>
        </div>

        <div className="grid divide-y divide-zinc-200 border-y border-zinc-200 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {snapshotItems.map((item) => (
            <div key={item.label} className="py-6 sm:px-6 sm:py-8 first:sm:pl-0 last:sm:pr-0">
              <p className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                {item.value}
              </p>
              <p className="mt-3 text-sm font-medium text-zinc-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
