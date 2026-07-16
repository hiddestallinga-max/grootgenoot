"use client";

import { useState } from "react";
import { REISKOSTEN_CENT_PER_KM, SERVICE_CENT_PER_UUR } from "@/lib/tarieven";

const REIS_PER_KM = REISKOSTEN_CENT_PER_KM / 100; // € 0,23
const SERVICE_PER_UUR = SERVICE_CENT_PER_UUR / 100; // € 4,00

function euro(bedrag: number): string {
  return bedrag.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Slider met grote min/plus-knoppen ernaast. De knoppen zijn er voor mensen
 * voor wie slepen lastig is (verminderde fijne motoriek); de slider blijft
 * voor wie snel wil schuiven.
 */
function SchuifMetKnoppen({
  id,
  label,
  waarde,
  weergave,
  min,
  max,
  stap,
  onChange,
  toelichting,
}: {
  id: string;
  label: string;
  waarde: number;
  weergave: string;
  min: number;
  max: number;
  stap: number;
  onChange: (v: number) => void;
  toelichting?: string;
}) {
  const zet = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  const knopClass =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-support/40 bg-white text-2xl font-bold text-support transition hover:bg-support/5 active:scale-95 disabled:opacity-40";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-lg font-semibold text-ink">
          {label}
        </label>
        <span className="text-lg font-bold text-support">{weergave}</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          aria-label={`${label} verlagen`}
          disabled={waarde <= min}
          onClick={() => zet(waarde - stap)}
          className={knopClass}
        >
          −
        </button>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={stap}
          value={waarde}
          onChange={(e) => zet(Number(e.target.value))}
          className="schuif"
        />
        <button
          type="button"
          aria-label={`${label} verhogen`}
          disabled={waarde >= max}
          onClick={() => zet(waarde + stap)}
          className={knopClass}
        >
          +
        </button>
      </div>
      {toelichting && <p className="mt-1 text-base text-muted">{toelichting}</p>}
    </div>
  );
}

export default function TariefCalculator() {
  const [tarief, setTarief] = useState(30);
  const [uren, setUren] = useState(2);
  const [km, setKm] = useState(0);

  const service = SERVICE_PER_UUR;
  const perUur = tarief + service;
  // Reiskosten: geen service hierover.
  const reisPerMaand = km * REIS_PER_KM * 4.33;
  const perMaand = perUur * uren * 4.33 + reisPerMaand;

  return (
    <div className="glas p-7">
      <div className="space-y-6">
        <SchuifMetKnoppen
          id="tarief"
          label="Uurtarief van je grootgenoot"
          waarde={tarief}
          weergave={euro(tarief)}
          min={25}
          max={35}
          stap={0.5}
          onChange={setTarief}
          toelichting={`De grootgenoot bepaalt dit bedrag in overleg met jou, meestal is dit tussen ${euro(25)} en ${euro(35)}.`}
        />

        <SchuifMetKnoppen
          id="uren"
          label="Uren hulp per week"
          waarde={uren}
          weergave={`${uren} uur`}
          min={1}
          max={20}
          stap={1}
          onChange={setUren}
        />

        <SchuifMetKnoppen
          id="km"
          label="Reiskilometers per week"
          waarde={km}
          weergave={`${km} km`}
          min={0}
          max={50}
          stap={1}
          onChange={setKm}
          toelichting={`Alleen als je grootgenoot voor je reist: ${euro(REIS_PER_KM)} per kilometer. Hier rekenen we geen service over.`}
        />

        <div className="space-y-1 border-t border-ink/10 pt-4 text-lg">
          <p className="flex items-center justify-between gap-4">
            <span className="text-muted">Voor je grootgenoot</span>
            <span className="font-semibold text-ink">{euro(tarief)}</span>
          </p>
          <p className="flex items-center justify-between gap-4">
            <span className="text-muted">Service per uur</span>
            <span className="font-semibold text-ink">{euro(service)}</span>
          </p>
          <p className="text-base text-muted">
            Zonder service kan Grootgenoot niet draaiende blijven.
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
