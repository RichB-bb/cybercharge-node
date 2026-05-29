"use client";

import { motion } from "framer-motion";
import { Gauge, Layers, MapPinned, Zap } from "lucide-react";

const nodeStats = [
  { label: "Investment node types", value: "2", detail: "Starter / Power", icon: Layers },
  { label: "Projected deployment scale", value: "24", detail: "planned sites", icon: MapPinned },
  { label: "Estimated utilization", value: "67%", detail: "illustrative model", icon: Gauge },
];

export function ProductSection() {
  return (
    <section id="product" className="relative bg-white px-5 py-32 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative min-h-[860px] overflow-hidden rounded-[1.75rem] bg-zinc-100 sm:min-h-[760px] lg:min-h-[72vh]"
        >
          <div className="absolute inset-x-[10%] bottom-[20%] h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent" />
          <div className="absolute bottom-[20%] left-1/2 h-48 w-[76%] -translate-x-1/2 rounded-t-[4rem] border border-zinc-300 bg-white" />
          <div className="absolute bottom-[16%] left-1/2 h-12 w-[88%] -translate-x-1/2 rounded-full border border-zinc-300 bg-zinc-200" />
          <div className="absolute left-1/2 top-[31%] grid size-28 -translate-x-1/2 place-items-center rounded-full border border-zinc-300 bg-white text-red-600">
            <Zap size={42} strokeWidth={1.8} />
          </div>

          <div className="absolute inset-x-0 top-0 p-7 text-center sm:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-red-600">
              Investment Node
            </p>
            <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
              CyberCharge Investment Node
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
              Digital node allocation linked to shared EV charging stations and offline
              charging service revenue.
            </p>
          </div>

          <div className="absolute inset-x-5 bottom-5 grid gap-3 sm:inset-x-8 sm:bottom-8 md:grid-cols-3">
            {nodeStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl bg-white p-5 text-zinc-950 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <Icon size={20} className="text-red-600" />
                    <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {stat.detail}
                    </span>
                  </div>
                  <p className="text-4xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="mt-2 text-sm text-zinc-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div className="border-t border-zinc-200 p-6">
            <p className="text-sm text-zinc-500">Starter Node</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">299 USDC</p>
          </div>
          <div className="border-t border-zinc-200 p-6">
            <p className="text-sm text-zinc-500">Power Node</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">0.08 ETH</p>
          </div>
          <div className="border-t border-zinc-200 p-6">
            <p className="text-sm text-zinc-500">Limited Round</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">500 Nodes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
