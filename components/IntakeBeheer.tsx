"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Binnengekomen betaalgegevens (Stripe-intake) in de regiekamer. Het IBAN
// staat bewust alleen hier (achter de login) en niet in de notificatiemail.
// Na "Verwerkt" wordt de rij direct gewist: de gegevens staan dan in Stripe
// en horen niet langer in onze database (dataminimalisatie).

export type IntakeRij = {
  id: string;
  rol: "hulpvrager" | "grootgenoot";
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string | null;
  straat: string | null;
  postcode: string | null;
  woonplaats: string | null;
  geboortedatum: string | null;
  kvk: string | null;
  iban: string;
  rekeninghouder: string;
  machtiging_akkoord: boolean;
  toelichting: string | null;
  created_at: string;
};

export default function IntakeBeheer({ intakes }: { intakes: IntakeRij[] }) {
  const router = useRouter();
  const [bezig, setBezig] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  async function verwerk(intake: IntakeRij) {
    const zeker = window.confirm(
      `Gegevens van ${intake.voornaam} ${intake.achternaam} als verwerkt markeren? De gegevens (inclusief IBAN) worden dan uit de database gewist. Zorg dat alles in Stripe staat.`,
    );
    if (!zeker) return;
    setBezig(intake.id);
    setFout(null);
    try {
      const res = await fetch("/api/admin/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: intake.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");
      router.refresh();
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis");
    } finally {
      setBezig(null);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-ink">
        Betaalgegevens om in Stripe te zetten ({intakes.length})
      </h2>
      <p className="mt-1 text-muted">
        Ingevuld via &quot;Wij regelen je betaling&quot;. Zet de gegevens in
        Stripe en klik daarna op Verwerkt; dan worden ze hier gewist.
      </p>

      {fout && (
        <p role="alert" className="mt-3 rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-800">
          {fout}
        </p>
      )}

      <div className="mt-4 space-y-4">
        {intakes.map((i) => (
          <article
            key={i.id}
            className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink">
                  {i.voornaam} {i.achternaam}{" "}
                  <span className="font-normal text-muted">
                    ({i.rol === "hulpvrager" ? "incasso instellen" : "uitbetaling instellen"})
                  </span>
                </h3>
                <p className="text-sm text-muted">
                  Ontvangen op {new Date(i.created_at).toLocaleDateString("nl-NL")}
                </p>
              </div>
              <button
                onClick={() => verwerk(i)}
                disabled={bezig !== null}
                className="rounded-xl bg-support px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {bezig === i.id ? "Bezig…" : "Verwerkt (gegevens wissen)"}
              </button>
            </div>

            <dl className="mt-3 grid gap-x-6 gap-y-1 text-base sm:grid-cols-2">
              <div><dt className="inline font-semibold text-ink">E-mail: </dt><dd className="inline text-muted">{i.email}</dd></div>
              {i.telefoon && <div><dt className="inline font-semibold text-ink">Telefoon: </dt><dd className="inline text-muted">{i.telefoon}</dd></div>}
              {i.straat && (
                <div>
                  <dt className="inline font-semibold text-ink">Adres: </dt>
                  <dd className="inline text-muted">
                    {i.straat}, {i.postcode} {i.woonplaats}
                  </dd>
                </div>
              )}
              {i.geboortedatum && (
                <div><dt className="inline font-semibold text-ink">Geboortedatum: </dt><dd className="inline text-muted">{i.geboortedatum}</dd></div>
              )}
              {i.kvk && <div><dt className="inline font-semibold text-ink">KvK: </dt><dd className="inline text-muted">{i.kvk}</dd></div>}
              <div><dt className="inline font-semibold text-ink">IBAN: </dt><dd className="inline text-muted">{i.iban}</dd></div>
              <div><dt className="inline font-semibold text-ink">Rekeninghouder: </dt><dd className="inline text-muted">{i.rekeninghouder}</dd></div>
              {i.rol === "hulpvrager" && (
                <div>
                  <dt className="inline font-semibold text-ink">Machtiging: </dt>
                  <dd className="inline text-muted">
                    {i.machtiging_akkoord ? "akkoord gegeven" : "NIET akkoord"}
                  </dd>
                </div>
              )}
              {i.toelichting && (
                <div className="sm:col-span-2">
                  <dt className="inline font-semibold text-ink">Toelichting: </dt>
                  <dd className="inline text-muted">{i.toelichting}</dd>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
