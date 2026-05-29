import { Zap } from "lucide-react";

export function BrandLogo() {
  return (
    <div className="flex items-center gap-3" aria-label="CyberCharge">
      <span className="relative grid size-8 place-items-center">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-red-500" />
        <span className="grid size-7 place-items-center rounded-full border border-red-500/70 bg-white text-red-500">
          <Zap size={14} strokeWidth={2.4} />
        </span>
      </span>
      <span className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-950">
        CyberCharge
      </span>
    </div>
  );
}
