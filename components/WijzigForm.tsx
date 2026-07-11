"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIEEN, type Aanmelding } from "@/lib/types";

type Props = { aanmelding: Aanmelding; token: string };

export default function WijzigForm({ aanmelding, token }: Props) {
  const [categorieen, setCategorieen] = useState<string[]>(
    aanmelding.categorieen,
  );
  const [status, setStatus] = useState<
    "idle" | "bezig" | "opgeslagen" | "afgemeld"
  >("idle");
  const [fout, setFout] = useState<string | null>(null);

  function toggleCategorie(c: string) {
    setCategorieen((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  async function verstuur(actie: "opslaan" | "afmelden", form?: FormData) {
    setFout(null);
    setStatus("bezig");
    const payload =
      actie === "opslaan" && form
        ? {
            token,
            actie,
            telefoon: String(form.get("telefoon") ?? ""),
            postcode: String(form.get("postcode") ?? ""),
            categorieen,
            urgentie:
              aanmelding.rol === "hulpvrager"
                ? String(form.get("urgentie") ?? "") || undefined
                : undefined,
            beschikbaarheid: String(form.get("beschikbaarheid") ?? ""),
            toelichting: String(form.get("toelichting") ?? ""),
          }
        : { token, actie };

    try {
      const res = await fetch("/api/mijn-aanmelding/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");
      setStatus(actie === "afmelden" ? "afgemeld" : "opgeslagen");
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis");
      setStatus("idle");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await verstuur("opslaan", new FormData(e.currentTarget));
  }

  async function afmelden() {
    const zeker = window.confirm(
      "Weet je zeker dat je je wilt afmelden? We verwijderen dan al je gegevens.",
    );
    if (zeker) await verstuur("afmelden");
  }

  if (status === "afgemeld") {
    return (
      <div className="glas p-8 text-center">
        <h2 className="text-2xl font-bold text-ink">Je bent afgemeld</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Al je gegevens zijn verwijderd. Bedankt en het ga je goed. Je bent
          altijd welkom om je opnieuw aan te melden.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-support"
        >
          <span aria-hidden="true">←</span> Naar de startpagina
        </Link>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-lg text-ink placeholder:text-muted/60 focus:border-support";
  const labelClass = "block text-lg font-semibold text-ink";

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="telefoon" className={labelClass}>
            Telefoonnummer{" "}
            <span className="font-normal text-muted">(optioneel)</span>
          </label>
          <input
            id="telefoon"
            name="telefoon"
            defaultValue={aanmelding.telefoon ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="postcode" className={labelClass}>
            Postcode
          </label>
          <input
            id="postcode"
            name="postcode"
            defaultValue={aanmelding.postcode ?? ""}
            className={inputClass}
            placeholder="1234 AB"
          />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>
          {aanmelding.rol === "hulpvrager"
            ? "Waar zou je hulp bij willen?"
            : "Wat zou je willen bieden?"}
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CATEGORIEEN.map((c) => {
            const actief = categorieen.includes(c);
            return (
              <label
                key={c}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-lg transition ${
                  actief
                    ? "border-support bg-support/10 text-ink"
                    : "border-ink/15 bg-white text-ink hover:border-support/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={actief}
                  onChange={() => toggleCategorie(c)}
                  className="h-5 w-5 accent-support"
                />
                {c}
              </label>
            );
          })}
        </div>
      </fieldset>

      {aanmelding.rol === "hulpvrager" && (
        <div>
          <label htmlFor="urgentie" className={labelClass}>
            Hoe snel zou je hulp willen?
          </label>
          <select
            id="urgentie"
            name="urgentie"
            className={inputClass}
            defaultValue={aanmelding.urgentie ?? "gemiddeld"}
          >
            <option value="laag">Geen haast</option>
            <option value="gemiddeld">Binnen een paar weken</option>
            <option value="hoog">Zo snel mogelijk</option>
          </select>
        </div>
      )}

      {aanmelding.rol === "grootgenoot" && (
        <div>
          <label htmlFor="beschikbaarheid" className={labelClass}>
            Wanneer ben je beschikbaar? (optioneel)
          </label>
          <input
            id="beschikbaarheid"
            name="beschikbaarheid"
            defaultValue={aanmelding.beschikbaarheid ?? ""}
            className={inputClass}
            placeholder="Bijv. doordeweeks overdag, weekenden"
          />
        </div>
      )}

      <div>
        <label htmlFor="toelichting" className={labelClass}>
          Toelichting <span className="font-normal text-muted">(optioneel)</span>
        </label>
        <textarea
          id="toelichting"
          name="toelichting"
          rows={4}
          defaultValue={aanmelding.toelichting ?? ""}
          className={inputClass}
        />
      </div>

      {fout && (
        <p role="alert" className="text-lg font-semibold text-red-700">
          {fout}
        </p>
      )}

      {status === "opgeslagen" && (
        <p role="status" className="text-lg font-semibold text-samen">
          Je wijzigingen zijn opgeslagen.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "bezig"}
          className="rounded-xl bg-support px-6 py-4 text-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {status === "bezig" ? "Bezig…" : "Wijzigingen opslaan"}
        </button>
        <button
          type="button"
          onClick={afmelden}
          disabled={status === "bezig"}
          className="rounded-xl border border-red-700/30 bg-white px-6 py-4 text-lg font-semibold text-red-700 transition hover:border-red-700 disabled:opacity-60"
        >
          Mij afmelden
        </button>
      </div>
    </form>
  );
}
