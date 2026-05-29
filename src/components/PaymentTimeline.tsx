"use client";

const paymentSteps = [
  "Connect Wallet",
  "Confirm Transaction",
  "Allocation Recorded",
  "View Dashboard",
  "Track Participation",
] as const;

export function PaymentTimeline() {
  return (
    <section className="bg-white px-4 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600">
            What Happens After Payment
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            A clear path from wallet confirmation to allocation tracking.
          </h2>
        </div>

        <div className="mt-12 grid gap-0 border-y border-zinc-200 sm:mt-16 lg:grid-cols-5">
          {paymentSteps.map((step, index) => (
            <div
              key={step}
              className="relative border-b border-zinc-200 py-7 last:border-b-0 lg:border-b-0 lg:border-r lg:px-6 lg:last:border-r-0 first:lg:pl-0 last:lg:pr-0"
            >
              <p className="text-sm font-medium text-zinc-400">
                Step {index + 1}
              </p>
              <p className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">
                {step}
              </p>
              <div className="mt-6 h-px w-12 bg-red-600" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
