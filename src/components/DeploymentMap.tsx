"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { CityName } from "./CityMap";

const CityMap = dynamic(() => import("./CityMap"), { ssr: false });

type CityDeployment = {
  name: CityName;
  planned: string;
  active: string;
  utilization: string;
  phase: string;
};

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
  const currentCity = cities.find((city) => city.name === selectedCity) ?? cities[0];

  return (
    <section id="deployment-map" className="bg-white px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            Deployment Network
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-500 sm:text-xl sm:leading-8">
            Global infrastructure footprint across major EV adoption corridors.
          </p>
        </div>

        <div className="mt-10 grid min-w-0 gap-8 sm:mt-14 lg:grid-cols-[1.55fr_0.8fr] lg:items-start lg:gap-12">
          <div className="min-w-0 overflow-hidden bg-zinc-100">
            <CityMap city={selectedCity} />
          </div>

          <div className="min-w-0">
            <div className="border-y border-zinc-200 py-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-600">
                Selected Market
              </p>
              <h3 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                {currentCity.name}
              </h3>
              <div className="mt-6 grid grid-cols-2 gap-5">
                <Stat label="Planned Sites" value={currentCity.planned} />
                <Stat label="Active Stations" value={currentCity.active} />
                <Stat label="Estimated Utilization" value={currentCity.utilization} />
                <Stat label="Deployment Phase" value={currentCity.phase} />
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Markets
              </p>
              <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                {cities.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => setSelectedCity(city.name)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 text-start transition hover:text-red-600 sm:gap-4"
                  >
                    <span
                      className={
                        selectedCity === city.name
                          ? "truncate text-base font-semibold text-zinc-950 sm:text-lg"
                          : "truncate text-base font-medium text-zinc-500 sm:text-lg"
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

            <p className="mt-6 text-xs leading-5 text-zinc-500">
              Deployment data is illustrative and subject to site acquisition, permitting,
              installation, and utilization activity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{label}</p>
    </div>
  );
}
