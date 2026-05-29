"use client";

import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, Layers, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const steps = [
  { icon: Wallet },
  { icon: Layers },
  { icon: CreditCard },
  { icon: CheckCircle2 },
];

export function PurchaseFlow() {
  const { t } = useLanguage();

  return (
    <section id="flow" className="bg-white px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600 sm:text-sm sm:tracking-[0.28em]">
            {t.flow.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            {t.flow.title}
          </h2>
        </motion.div>

        <div className="relative mt-10 grid gap-5 sm:mt-14 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-zinc-200 lg:block" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            const copy = t.flow.steps[index];
            return (
              <motion.article
                key={copy.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="relative border-t border-zinc-200 bg-white p-5 sm:p-6"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="grid size-14 place-items-center rounded-full border border-zinc-200 text-red-600">
                    <Icon size={22} />
                  </div>
                  <span className="text-sm font-semibold text-zinc-500">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-zinc-950">{copy.title}</h3>
                <p className="mt-4 leading-7 text-zinc-500">
                  {copy.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
