"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import type { CityName } from "./CityMap";

const CityMap = dynamic(() => import("./CityMap"), { ssr: false });

type CityDeployment = {
  name: CityName;
  planned: string;
  active: string;
  utilization: string;
  phase: string;
};

const overviewStats = [
  { label: "Planned Sites", value: "46,480" },
  { label: "Active Stations", value: "15,160" },
  { label: "Deployment Markets", value: "18" },
  { label: "Avg. Estimated Utilization", value: "74%" },
];

const cities: CityDeployment[] = [
  { name: "Tokyo", planned: "8,400", active: "2,680", utilization: "76%", phase: "Phase 1" },
  { name: "Osaka", planned: "5,200", active: "1,740", utilization: "71%", phase: "Phase 1" },
  { name: "Singapore", planned: "3,600", active: "1,280", utilization: "82%", phase: "Phase 2" },
  { name: "Dubai", planned: "4,800", active: "1,520", utilization: "73%", phase: "Phase 2" },
  { name: "Los Angeles", planned: "9,200", active: "2,940", utilization: "74%", phase: "Phase 2" },
  { name: "Seoul", planned: "6,400", active: "2,160", utilization: "75%", phase: "Phase 2" },
  { name: "Berlin", planned: "4,200", active: "1,360", utilization: "70%", phase: "Phase 3" },
  { name: "Toronto", planned: "4,680", active: "1,480", utilization: "72%", phase: "Phase 3" },
];

export function DeploymentMap() {
  const [selectedCity, setSelectedCity] = useState<CityName>("Tokyo");
  const { t } = useLanguage();
  const currentCity = cities.find((city) => city.name === selectedCity) ?? cities[0];
  const localizedStats = overviewStats.map((stat, index) => ({
    ...stat,
    label: t.deployment.overview[index] ?? stat.label,
  }));

  return (
    <section id="deployment-map" className="bg-white px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-7xl">
            {t.deployment.title}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-zinc-500 sm:mt-6 sm:text-2xl sm:leading-9">
            {t.deployment.subtitle}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-y-8 border-y border-zinc-200 py-8 sm:mt-20 sm:gap-y-10 sm:py-10 lg:grid-cols-4">
          {localizedStats.map((stat) => (
            <div key={stat.label} className="px-4 text-center">
              <p className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 sm:mt-3 sm:text-sm sm:tracking-[0.16em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid min-w-0 gap-10 sm:mt-24 lg:grid-cols-[1.45fr_0.9fr] lg:items-start lg:gap-16">
          <div className="min-w-0 overflow-hidden bg-zinc-100">
            <CityMap city={selectedCity} />
          </div>

          <div className="min-w-0">
            <div className="border-t border-zinc-200 pt-8">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-red-600">
                {t.deployment.selectedMarket}
              </p>
              <h3 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
                {currentCity.name}
              </h3>
              <div className="mt-8 grid grid-cols-2 gap-5 sm:mt-10 sm:gap-8">
                <Stat label={t.deployment.planned} value={currentCity.planned} />
                <Stat label={t.deployment.active} value={currentCity.active} />
                <Stat label={t.deployment.utilization} value={currentCity.utilization} />
                <Stat label={t.deployment.phase} value={currentCity.phase} />
              </div>
            </div>

            <div className="mt-12">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                {t.deployment.markets}
              </p>
              <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                {cities.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => setSelectedCity(city.name)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4 text-start transition hover:text-red-600 sm:gap-4 sm:py-5"
                  >
                    <span
                      className={
                        selectedCity === city.name
                          ? "truncate text-lg font-semibold text-zinc-950 sm:text-xl"
                          : "truncate text-lg font-medium text-zinc-500 sm:text-xl"
                      }
                    >
                      {city.name}
                    </span>
                    <span
                      className={
                        selectedCity === city.name
                          ? "whitespace-nowrap text-sm font-medium text-red-600"
                          : "text-sm text-zinc-400"
                      }
                    >
                      {city.phase}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-8 text-sm leading-6 text-zinc-500">
              {t.deployment.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-zinc-200 pt-5">
      <p className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm">{label}</p>
    </div>
  );
}
