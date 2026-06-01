"use client";

const paymentSteps = [
  "Connect Wallet",
  "Purchase Allocation",
  "View Dashboard",
] as const;

export function PaymentTimeline() {
  return (
    <section className="bg-white px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600">
              What Happens After Payment
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              From wallet to dashboard.
            </h2>
          </div>
          <a
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            View Investor Dashboard
          </a>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {paymentSteps.map((step, index) => (
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
