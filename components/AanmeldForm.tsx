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
  const [voorWie, setVoorWie] = useState<"zelf" | "naaste">("zelf");
  const naaste = rol === "hulpvrager" && voorWie === "naaste";

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

    const ruweToelichting = String(form.get("toelichting") ?? "").trim();
    const toelichting = naaste
      ? `[Aanvraag namens een naaste] ${ruweToelichting}`.trim()
      : ruweToelichting;

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
      toelichting,
      toestemming: form.get("toestemming") === "on",
      website: String(form.get("website") ?? ""), // honeypot, hoort leeg te zijn
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-samen/10 text-samen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
            <path d="m5 12 4.5 4.5L19 7" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-ink">
          Gelukt! We nemen contact op.
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          We hebben je aanmelding ontvangen en bellen of mailen je persoonlijk,
          meestal binnen één werkdag. Helemaal gratis en vrijblijvend.
        </p>
        <p className="mt-4 text-lg text-muted">
          Liever meteen contact? Bel{" "}
          <a href="tel:+31612154010" className="font-semibold text-support underline">
            06 12154010
          </a>
          .
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
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Honeypot tegen spam-bots: onzichtbaar voor mensen. Laat dit leeg. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {rol === "hulpvrager" && (
        <div>
          <p className={labelClass}>Voor wie zoek je hulp?</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(
              [
                ["zelf", "Voor mezelf"],
                ["naaste", "Voor een naaste"],
              ] as const
            ).map(([w, label]) => (
              <button
                key={w}
                type="button"
                onClick={() => setVoorWie(w)}
                aria-pressed={voorWie === w}
                className={`rounded-xl border p-4 text-lg font-semibold transition ${
                  voorWie === w
                    ? "border-support bg-support/10 text-ink"
                    : "border-black/15 bg-white text-ink hover:border-support/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {naaste && (
            <p className="mt-2 text-base leading-relaxed text-muted">
              Vul hieronder <strong>je eigen</strong> gegevens in, dan nemen we
              contact met jou op. De postcode is die van degene die hulp krijgt.
            </p>
          )}
        </div>
      )}

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
          Postcode{" "}
          <span className="font-normal text-muted">
            {naaste ? "(van degene die hulp krijgt)" : "(voor iemand dichtbij)"}
          </span>
        </label>
        <input
          id="postcode"
          name="postcode"
          className={inputClass}
          placeholder="1234 AB"
        />
      </div>

      <fieldset>
        <legend className={labelClass}>
          {naaste ? "Waar zou je naaste hulp bij willen? (kies wat past)" : t.categorieLabel}
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
            {naaste ? "Hoe snel is hulp gewenst?" : "Hoe snel zou je hulp willen?"}
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
          Ik ga ermee akkoord dat Grootgenoot mijn gegevens gebruikt om contact
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

      <div className="space-y-3">
        <button
          type="submit"
          disabled={status === "bezig"}
          className="w-full rounded-xl bg-support px-6 py-4 text-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {status === "bezig"
            ? "Bezig met versturen…"
            : rol === "hulpvrager"
              ? "Verstuur mijn aanvraag"
              : "Verstuur mijn aanmelding"}
        </button>
        <p className="text-center text-base text-muted">
          Gratis en vrijblijvend. We nemen persoonlijk contact op, meestal
          binnen één werkdag.
        </p>
        <p className="text-center text-base text-muted">
          Liever even bellen?{" "}
          <a
            href="tel:+31612154010"
            className="font-semibold text-support underline"
          >
            06 12154010
          </a>
        </p>
      </div>
    </form>
  );
}
