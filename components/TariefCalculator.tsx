"use client";

import { useState } from "react";

// Servicepercentage van Grootgenoot bovenop het uurtarief van de grootgenoot.
export const SERVICE_PERCENTAGE = 18;

function euro(bedrag: number): string {
  return bedrag.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TariefCalculator() {
  const [tarief, setTarief] = useState(30);
  const [uren, setUren] = useState(2);

  const service = (tarief * SERVICE_PERCENTAGE) / 100;
  const perUur = tarief + service;
  const perMaand = perUur * uren * 4.33;

  const grootgenootPct = (tarief / perUur) * 100;

  return (
    <div className="glas p-7">
      <div className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="tarief" className="text-lg font-semibold text-ink">
              Uurtarief van je grootgenoot
            </label>
            <span className="text-lg font-bold text-support">
              {euro(tarief)}
            </span>
          </div>
          <input
            id="tarief"
            type="range"
            min={28}
            max={35}
            step={0.5}
            value={tarief}
            onChange={(e) => setTarief(Number(e.target.value))}
            className="mt-2 w-full accent-support"
          />
          <p className="mt-1 text-base text-muted">
            De grootgenoot bepaalt dit zelf, meestal tussen {euro(28)} en{" "}
            {euro(35)}.
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="uren" className="text-lg font-semibold text-ink">
              Uren hulp per week
            </label>
            <span className="text-lg font-bold text-support">
              {uren} {uren === 1 ? "uur" : "uur"}
            </span>
          </div>
          <input
            id="uren"
            type="range"
            min={1}
            max={10}
            step={1}
            value={uren}
            onChange={(e) => setUren(Number(e.target.value))}
            className="mt-2 w-full accent-support"
          />
        </div>

        <div>
          <div
            className="flex h-6 w-full overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <div
              className="bg-support"
              style={{ width: `${grootgenootPct}%` }}
            />
            <div className="flex-1 bg-samen" />
          </div>
          <div className="mt-3 space-y-1 text-lg">
            <p className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted">
                <span className="inline-block h-3 w-3 rounded-full bg-support" />
                Voor je grootgenoot
              </span>
              <span className="font-semibold text-ink">{euro(tarief)}</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted">
                <span className="inline-block h-3 w-3 rounded-full bg-samen" />
                Service Grootgenoot ({SERVICE_PERCENTAGE}%)
              </span>
              <span className="font-semibold text-ink">{euro(service)}</span>
            </p>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-4">
          <p className="flex items-baseline justify-between gap-4 text-xl">
            <span className="font-semibold text-ink">Per uur betaal je</span>
            <span className="text-2xl font-bold text-ink">{euro(perUur)}</span>
          </p>
          <p className="mt-1 flex items-baseline justify-between gap-4 text-lg text-muted">
            <span>
              Bij {uren} uur per week is dat per maand ongeveer
            </span>
            <span className="font-semibold">
              {euro(Math.round(perMaand))}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
