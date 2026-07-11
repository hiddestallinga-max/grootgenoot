"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "bezig" | "klaar">("idle");
  const [fout, setFout] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFout(null);
    setStatus("bezig");
    const form = new FormData(e.currentTarget);

    const payload = {
      naam: String(form.get("naam") ?? ""),
      email: String(form.get("email") ?? ""),
      bericht: String(form.get("bericht") ?? ""),
      website: String(form.get("website") ?? ""), // honeypot, hoort leeg te zijn
    };

    try {
      const res = await fetch("/api/contact", {
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
      <div className="glas p-8 text-center">
        <h2 className="text-2xl font-bold text-ink">Bericht verstuurd!</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Bedankt voor je bericht. We reageren zo snel mogelijk.
        </p>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-lg text-ink placeholder:text-muted/60 focus:border-support";
  const labelClass = "block text-lg font-semibold text-ink";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Honeypot tegen spam-bots: onzichtbaar voor mensen. Laat dit leeg. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="naam" className={labelClass}>
            Naam
          </label>
          <input id="naam" name="naam" required className={inputClass} />
        </div>
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
      </div>

      <div>
        <label htmlFor="bericht" className={labelClass}>
          Je bericht
        </label>
        <textarea
          id="bericht"
          name="bericht"
          rows={5}
          required
          className={inputClass}
        />
      </div>

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
        {status === "bezig" ? "Bezig met versturen…" : "Verstuur bericht"}
      </button>
    </form>
  );
}
