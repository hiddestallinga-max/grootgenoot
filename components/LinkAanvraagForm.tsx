"use client";

import { useState } from "react";

export default function LinkAanvraagForm() {
  const [status, setStatus] = useState<"idle" | "bezig" | "klaar">("idle");
  const [fout, setFout] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFout(null);
    setStatus("bezig");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/mijn-aanmelding/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(form.get("email") ?? "") }),
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
      <div className="glas p-8">
        <h2 className="text-2xl font-bold text-ink">Kijk in je mailbox</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Als dit e-mailadres bij ons bekend is, hebben we je zojuist een link
          gestuurd waarmee je je aanmelding kunt bekijken en wijzigen. Kijk ook
          even in je spam-map.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-lg font-semibold text-ink">
          Het e-mailadres waarmee je je hebt aangemeld
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="naam@voorbeeld.nl"
          className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-lg text-ink placeholder:text-muted/60 focus:border-support"
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
        {status === "bezig" ? "Bezig…" : "Stuur mij de link"}
      </button>
    </form>
  );
}
