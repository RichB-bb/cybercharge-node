"use client";

import { motion } from "framer-motion";
import { BatteryCharging, ChartNoAxesCombined, Factory, UtilityPole } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const reasons = [
  {
    icon: ChartNoAxesCombined,
  },
  {
    icon: BatteryCharging,
  },
  {
    icon: Factory,
  },
  {
    icon: UtilityPole,
  },
];

export function WhyEVInfrastructure() {
  const { t } = useLanguage();

  return (
    <section id="why-ev" className="bg-white px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600 sm:text-sm sm:tracking-[0.28em]">
              {t.why.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
              {t.why.title}
            </h2>
          </div>

          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 sm:gap-y-14">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              const copy = t.why.items[index];
              return (
                <article key={copy.title} className="border-t border-zinc-200 pt-6">
                  <Icon size={24} className="text-red-600" />
                  <h3 className="mt-6 text-xl font-semibold text-zinc-950 sm:mt-8">{copy.title}</h3>
                  <p className="mt-4 leading-7 text-zinc-500">{copy.description}</p>
                </article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
