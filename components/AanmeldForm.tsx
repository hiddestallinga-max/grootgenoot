"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIEEN, type Rol } from "@/lib/types";

type Props = { rol: Rol };

const tekst = {
  hulpvrager: {
    categorieLabel: "Waar zou je hulp bij willen? (kies wat past)",
    toelichtingLabel: "Wil je nog iets toelichten? (optioneel)",
  },
  grootgenoot: {
    categorieLabel: "Wat zou je willen bieden? (kies wat past)",
    toelichtingLabel: "Vertel kort iets over jezelf (optioneel)",
  },
} as const;

export default function AanmeldForm({ rol }: Props) {
  const t = tekst[rol];
  const [categorieen, setCategorieen] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "bezig" | "klaar">("idle");
  const [fout, setFout] = useState<string | null>(null);

  function toggleCategorie(c: string) {
    setCategorieen((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFout(null);
    setStatus("bezig");
    const form = new FormData(e.currentTarget);

    const payload = {
      rol,
      voornaam: String(form.get("voornaam") ?? ""),
      achternaam: String(form.get("achternaam") ?? ""),
      email: String(form.get("email") ?? ""),
      telefoon: String(form.get("telefoon") ?? ""),
      postcode: String(form.get("postcode") ?? ""),
      categorieen,
      urgentie:
        rol === "hulpvrager"
          ? (String(form.get("urgentie") ?? "") || undefined)
          : undefined,
      beschikbaarheid:
        rol === "grootgenoot" ? String(form.get("beschikbaarheid") ?? "") : "",
      toelichting: String(form.get("toelichting") ?? ""),
      toestemming: form.get("toestemming") === "on",
    };

    try {
      const res = await fetch("/api/aanmelding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");
      setStatus("klaar");
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis");
      setStatus("idle");
    }
  }

  if (status === "klaar") {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-ink">Bedankt voor je aanmelding!</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          We hebben je gegevens ontvangen en nemen persoonlijk contact met je op.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-support"
        >
          <span aria-hidden="true">←</span> Terug naar de startpagina
        </Link>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-lg text-ink placeholder:text-muted/60 focus:border-support";
  const labelClass = "block text-lg font-semibold text-ink";

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="voornaam" className={labelClass}>
            Voornaam
          </label>
          <input id="voornaam" name="voornaam" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="achternaam" className={labelClass}>
            Achternaam
          </label>
          <input
            id="achternaam"
            name="achternaam"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            E-mailadres
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="naam@voorbeeld.nl"
          />
        </div>
        <div>
          <label htmlFor="telefoon" className={labelClass}>
            Telefoonnummer <span className="font-normal text-muted">(optioneel)</span>
          </label>
          <input id="telefoon" name="telefoon" className={inputClass} />
        </div>
      </div>

      <div className="max-w-xs">
        <label htmlFor="postcode" className={labelClass}>
          Postcode <span className="font-normal text-muted">(voor iemand dichtbij)</span>
        </label>
        <input
          id="postcode"
          name="postcode"
          className={inputClass}
          placeholder="1234 AB"
        />
      </div>

      <fieldset>
        <legend className={labelClass}>{t.categorieLabel}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CATEGORIEEN.map((c) => {
            const actief = categorieen.includes(c);
            return (
              <label
                key={c}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-lg transition ${
                  actief
                    ? "border-support bg-support/10 text-ink"
                    : "border-black/15 bg-white text-ink hover:border-support/50"
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

      {rol === "hulpvrager" && (
        <div>
          <label htmlFor="urgentie" className={labelClass}>
            Hoe snel zou je hulp willen?
          </label>
          <select id="urgentie" name="urgentie" className={inputClass} defaultValue="gemiddeld">
            <option value="laag">Geen haast</option>
            <option value="gemiddeld">Binnen een paar weken</option>
            <option value="hoog">Zo snel mogelijk</option>
          </select>
        </div>
      )}

      {rol === "grootgenoot" && (
        <div>
          <label htmlFor="beschikbaarheid" className={labelClass}>
            Wanneer ben je beschikbaar? (optioneel)
          </label>
          <input
            id="beschikbaarheid"
            name="beschikbaarheid"
            className={inputClass}
            placeholder="Bijv. doordeweeks overdag, weekenden"
          />
        </div>
      )}

      <div>
        <label htmlFor="toelichting" className={labelClass}>
          {t.toelichtingLabel}
        </label>
        <textarea
          id="toelichting"
          name="toelichting"
          rows={4}
          className={inputClass}
        />
      </div>

      <label className="flex items-start gap-3 text-base leading-relaxed text-muted">
        <input
          type="checkbox"
          name="toestemming"
          required
          className="mt-1 h-5 w-5 accent-support"
        />
        <span>
          Ik ga ermee akkoord dat GrootGenoot mijn gegevens gebruikt om contact
          met me op te nemen. Zie de{" "}
          <Link href="/privacy" className="font-semibold text-support underline">
            privacyverklaring
          </Link>
          .
        </span>
      </label>

      {fout && (
        <p role="alert" className="text-lg font-semibold text-red-700">
          {fout}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "bezig"}
        className="w-full rounded-xl bg-support px-6 py-4 text-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {status === "bezig" ? "Bezig met versturen…" : "Aanmelden"}
      </button>
    </form>
  );
}
