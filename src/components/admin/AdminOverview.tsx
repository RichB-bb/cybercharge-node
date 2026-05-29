"use client";

import type { ReactNode } from "react";

type AdminOverviewProps = {
  children: ReactNode;
};

export function AdminOverview({ children }: AdminOverviewProps) {
  return (
    <AdminShell>
      <section className="border-b border-zinc-200 pb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-red-600">
              CyberCharge Operations
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
              Admin Dashboard
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-500 sm:text-xl sm:leading-8">
              Monitor platform users, infrastructure allocations, and transaction activity.
            </p>
          </div>
          <div className="border-t border-zinc-200 pt-5">
            <p className="text-sm text-zinc-500">Access Mode</p>
            <p className="mt-2 text-xl font-semibold text-zinc-950">Operations Console</p>
          </div>
        </div>
      </section>
      {children}
    </AdminShell>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-zinc-950 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  );
}
