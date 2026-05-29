"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Planned Sites", value: "24" },
  { label: "Active Stations", value: "8" },
  { label: "Monthly Charging Sessions", value: "1,280" },
  { label: "Estimated Utilization", value: "67%" },
];

export function DeploymentStats() {
  return (
    <section id="deployment" className="relative bg-white px-5 py-32 sm:px-8">
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="text-center"
        >
          <h2 className="text-5xl font-semibold tracking-tight text-zinc-950 sm:text-7xl">
            Deployment Network
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-500 sm:text-2xl sm:leading-9">
            A growing network of shared EV charging stations deployed across high-demand
            urban locations.
          </p>

          <div className="mt-20 grid gap-y-12 border-y border-zinc-200 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: index * 0.06, ease: "easeOut" }}
                  className="px-4"
                >
                  <p className="text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
                    {stat.value}
                  </p>
                  <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
