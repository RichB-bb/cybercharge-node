"use client";

import { BrandLogo } from "./BrandLogo";

const footerLinks = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Risk Disclosure", href: "/#risk-disclosure" },
  { label: "Contact", href: "mailto:contact@tslcharge.cc" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <BrandLogo />
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Infrastructure allocation platform for EV charging deployment.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-zinc-700">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition hover:text-zinc-950"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-5 max-w-7xl text-sm text-zinc-400">© 2026 CyberCharge</div>
    </footer>
  );
}
