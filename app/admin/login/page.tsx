"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    setBezig(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wachtwoord }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Inloggen mislukt");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Inloggen mislukt");
      setBezig(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-3xl font-bold text-ink">Regiekamer</h1>
      <p className="mt-2 text-lg text-muted">Log in om de aanmeldingen te beheren.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          type="password"
          value={wachtwoord}
          onChange={(e) => setWachtwoord(e.target.value)}
          placeholder="Wachtwoord"
          autoFocus
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-lg text-ink focus:border-support"
        />
        {fout && (
          <p role="alert" className="text-lg font-semibold text-red-700">
            {fout}
          </p>
        )}
        <button
          type="submit"
          disabled={bezig}
          className="w-full rounded-xl bg-support px-6 py-4 text-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {bezig ? "Bezig…" : "Inloggen"}
        </button>
      </form>
    </main>
  );
}
