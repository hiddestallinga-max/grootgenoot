"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Koppeling = { id: string; naam: string };

export default function UrenForm({
  koppelingen,
  token,
  email,
  endpoint = "/api/uren",
}: {
  koppelingen: Koppeling[];
  token?: string;
  email?: string;
  endpoint?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "bezig" | "klaar">("idle");
  const [fout, setFout] = useState<string | null>(null);

  const vandaag = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFout(null);
    setStatus("bezig");
    const form = new FormData(e.currentTarget);
    const doel = e.currentTarget;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(token ? { token } : { email }),
          koppeling_id: String(form.get("koppeling") ?? ""),
          datum: String(form.get("datum") ?? ""),
          minuten: Number(form.get("minuten") ?? 0),
          km: Number(form.get("km") ?? 0),
          omschrijving: String(form.get("omschrijving") ?? ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");
      setStatus("klaar");
      doel.reset();
      router.refresh();
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis");
      setStatus("idle");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-lg text-ink focus:border-support";
  const labelClass = "block text-lg font-semibold text-ink";

  const duren: { minuten: number; label: string }[] = [];
  for (let m = 15; m <= 480; m += 15) {
    const uur = Math.floor(m / 60);
    const rest = m % 60;
    duren.push({
      minuten: m,
      label:
        uur === 0
          ? `${rest} minuten`
          : `${uur} uur${rest ? ` en ${rest} minuten` : ""}`,
    });
  }

  return (
    <form onSubmit={onSubmit} className="glas space-y-6 p-7">
      <div>
        <label htmlFor="koppeling" className={labelClass}>
          Voor wie heb je gewerkt?
        </label>
        <select id="koppeling" name="koppeling" required className={inputClass}>
          {koppelingen.map((k) => (
            <option key={k.id} value={k.id}>
              {k.naam}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="datum" className={labelClass}>
            Datum
          </label>
          <input
            id="datum"
            name="datum"
            type="date"
            required
            defaultValue={vandaag}
            max={vandaag}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="minuten" className={labelClass}>
            Hoe lang?
          </label>
          <select
            id="minuten"
            name="minuten"
            required
            defaultValue="60"
            className={inputClass}
          >
            {duren.map((d) => (
              <option key={d.minuten} value={d.minuten}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="km" className={labelClass}>
          Gereisde kilometers{" "}
          <span className="font-normal text-muted">(optioneel, heen en terug)</span>
        </label>
        <input
          id="km"
          name="km"
          type="number"
          min={0}
          max={1000}
          step={1}
          inputMode="numeric"
          defaultValue={0}
          className={inputClass}
        />
        <p className="mt-1 text-base text-muted">
          Voor de reiskostenvergoeding van € 0,23 per kilometer. Laat op 0
          staan als je niet hebt gereisd.
        </p>
      </div>

      <div>
        <label htmlFor="omschrijving" className={labelClass}>
          Wat heb je gedaan?{" "}
          <span className="font-normal text-muted">(optioneel)</span>
        </label>
        <input
          id="omschrijving"
          name="omschrijving"
          className={inputClass}
          placeholder="Bijv. boodschappen en samen koffie gedronken"
        />
      </div>

      {fout && (
        <p role="alert" className="text-lg font-semibold text-red-700">
          {fout}
        </p>
      )}
      {status === "klaar" && (
        <p role="status" className="text-lg font-semibold text-samen">
          Uren ingediend! Na goedkeuring komen ze op het maandoverzicht.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "bezig"}
        className="rounded-xl bg-support px-6 py-4 text-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "bezig" ? "Bezig…" : "Uren indienen"}
      </button>
    </form>
  );
}
