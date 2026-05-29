"use client";

import { BrandLogo } from "./BrandLogo";

const footerLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Risk Disclosure", href: "/#risk-disclosure" },
  { label: "Contact", href: "mailto:contact@tslcharge.cc" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-12 pb-[calc(env(safe-area-inset-bottom)+3rem)] sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="max-w-xl">
          <BrandLogo />
          <p className="mt-5 text-sm leading-6 text-zinc-500">
            Infrastructure allocation platform for EV charging deployment.
          </p>
          <p className="mt-6 text-sm text-zinc-400">© 2026 CyberCharge</p>
        </div>

        <nav className="grid gap-3 text-sm font-medium text-zinc-700 sm:grid-cols-2 lg:min-w-96">
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
    </footer>
  );
}
