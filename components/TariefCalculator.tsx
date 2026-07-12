"use client";

import { useState } from "react";
import { REISKOSTEN_CENT_PER_KM } from "@/lib/tarieven";

const REIS_PER_KM = REISKOSTEN_CENT_PER_KM / 100; // € 0,23

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
  const [servicePct, setServicePct] = useState(15);
  const [km, setKm] = useState(0);

  const service = (tarief * servicePct) / 100;
  const perUur = tarief + service;
  // Reiskosten: geen service hierover.
  const reisPerMaand = km * REIS_PER_KM * 4.33;
  const perMaand = perUur * uren * 4.33 + reisPerMaand;

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
            min={25}
            max={35}
            step={0.5}
            value={tarief}
            onChange={(e) => setTarief(Number(e.target.value))}
            className="schuif mt-2"
          />
          <p className="mt-1 text-base text-muted">
            De grootgenoot bepaalt dit zelf, meestal tussen {euro(25)} en{" "}
            {euro(35)}.
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="uren" className="text-lg font-semibold text-ink">
              Uren hulp per week
            </label>
            <span className="text-lg font-bold text-support">
              {uren} uur
            </span>
          </div>
          <input
            id="uren"
            type="range"
            min={1}
            max={20}
            step={1}
            value={uren}
            onChange={(e) => setUren(Number(e.target.value))}
            className="schuif mt-2"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="service" className="text-lg font-semibold text-ink">
              Servicepercentage
            </label>
            <span className="text-lg font-bold text-support">{servicePct}%</span>
          </div>
          <input
            id="service"
            type="range"
            min={10}
            max={20}
            step={1}
            value={servicePct}
            onChange={(e) => setServicePct(Number(e.target.value))}
            className="schuif mt-2"
          />
          <p className="mt-1 text-base text-muted">
            10 tot 20%, afhankelijk van de hulpvraag. We spreken dit vooraf
            met je af.
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="km" className="text-lg font-semibold text-ink">
              Reiskilometers per week
            </label>
            <span className="text-lg font-bold text-support">{km} km</span>
          </div>
          <input
            id="km"
            type="range"
            min={0}
            max={50}
            step={1}
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            className="schuif mt-2"
          />
          <p className="mt-1 text-base text-muted">
            Alleen als je grootgenoot voor je reist: {euro(REIS_PER_KM)} per
            kilometer. Hier rekenen we geen service over.
          </p>
        </div>

        <div className="space-y-1 border-t border-ink/10 pt-4 text-lg">
          <p className="flex items-center justify-between gap-4">
            <span className="text-muted">Voor je grootgenoot</span>
            <span className="font-semibold text-ink">{euro(tarief)}</span>
          </p>
          <p className="flex items-center justify-between gap-4">
            <span className="text-muted">Service ({servicePct}%)</span>
            <span className="font-semibold text-ink">{euro(service)}</span>
          </p>
        </div>

        <div className="border-t border-ink/10 pt-4">
          <p className="flex items-baseline justify-between gap-4 text-xl">
            <span className="font-semibold text-ink">Per uur betaal je</span>
            <span className="text-2xl font-bold text-ink">{euro(perUur)}</span>
          </p>
          {km > 0 && (
            <p className="mt-1 flex items-baseline justify-between gap-4 text-lg text-muted">
              <span>
                Reiskosten ({km} km/week × {euro(REIS_PER_KM)}) per maand
              </span>
              <span className="font-semibold">
                {euro(Math.round(reisPerMaand))}
              </span>
            </p>
          )}
          <p className="mt-1 flex items-baseline justify-between gap-4 text-lg text-muted">
            <span>
              {km > 0
                ? `Samen per maand (${uren} uur hulp + reiskosten) ongeveer`
                : `Bij ${uren} uur per week is dat per maand ongeveer`}
            </span>
            <span className="font-semibold">{euro(Math.round(perMaand))}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
