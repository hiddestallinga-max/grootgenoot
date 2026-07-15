"use client";

import { useState } from "react";
import UrenForm from "./UrenForm";

type Koppeling = { id: string; naam: string };

export default function UrenDirect() {
  const [status, setStatus] = useState<"idle" | "bezig">("idle");
  const [fout, setFout] = useState<string | null>(null);
  const [geenMatch, setGeenMatch] = useState(false);
  const [gevonden, setGevonden] = useState<{
    voornaam: string;
    email: string;
    koppelingen: Koppeling[];
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFout(null);
    setGeenMatch(false);
    setStatus("bezig");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");

    try {
      const res = await fetch("/api/uren/koppelingen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");
      if (!data.koppelingen || data.koppelingen.length === 0) {
        setGeenMatch(true);
        setStatus("idle");
        return;
      }
      setGevonden({ voornaam: data.voornaam ?? "", email, koppelingen: data.koppelingen });
      setStatus("idle");
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis");
      setStatus("idle");
    }
  }

  if (gevonden) {
    return (
      <div className="space-y-5">
        <p className="text-lg leading-relaxed text-muted">
          Hallo {gevonden.voornaam}! Vul hieronder in wanneer en hoe lang je
          iemand hebt ondersteund.
        </p>
        <UrenForm
          email={gevonden.email}
          endpoint="/api/uren/direct"
          koppelingen={gevonden.koppelingen}
        />
        <button
          type="button"
          onClick={() => setGevonden(null)}
          className="text-base font-semibold text-support underline"
        >
          Een ander e-mailadres gebruiken
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="uren-email" className="block text-lg font-semibold text-ink">
          Het e-mailadres waarmee je je hebt aangemeld
        </label>
        <input
          id="uren-email"
          name="email"
          type="email"
          required
          placeholder="naam@voorbeeld.nl"
          className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-lg text-ink placeholder:text-muted/60 focus:border-support"
        />
      </div>

      {geenMatch && (
        <p role="alert" className="text-lg leading-relaxed text-muted">
          We konden geen actieve koppeling vinden bij dit e-mailadres. Klopt het
          adres, en ben je al aan iemand gekoppeld? Neem anders even contact op,
          dan zoeken we het samen uit.
        </p>
      )}
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
        {status === "bezig" ? "Bezig…" : "Uren doorgeven"}
      </button>
    </form>
  );
}
