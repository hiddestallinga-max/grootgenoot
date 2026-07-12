"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type UrenRij = {
  id: string;
  datum: string;
  minuten: number;
  km: number | null;
  omschrijving: string | null;
  status: string;
};

export type KoppelingView = {
  id: string;
  uurtarief_cent: number;
  service_pct: number;
  actief: boolean;
  hulpvrager: { id: string; naam: string; machtiging: boolean };
  grootgenoot: { id: string; naam: string; onboarded: boolean };
  uren: UrenRij[];
};

export type Kandidaat = { id: string; naam: string };

function euro(cent: number): string {
  return (cent / 100).toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
  });
}

export default function KoppelingenBeheer({
  koppelingen,
  hulpvragers,
  grootgenoten,
}: {
  koppelingen: KoppelingView[];
  hulpvragers: Kandidaat[];
  grootgenoten: Kandidaat[];
}) {
  const router = useRouter();
  const [bezig, setBezig] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  async function roep(pad: string, body: object, actieNaam: string) {
    setBezig(actieNaam);
    setFout(null);
    setMelding(null);
    try {
      const res = await fetch(pad, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");
      setMelding("Gelukt!");
      router.refresh();
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis");
    } finally {
      setBezig(null);
      setTimeout(() => setMelding(null), 4000);
    }
  }

  async function nieuweKoppeling(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const tariefEuro = Number(String(form.get("tarief") ?? "30").replace(",", "."));
    const servicePct = Number(String(form.get("service") ?? "15").replace(",", "."));
    await roep(
      "/api/admin/koppeling",
      {
        actie: "nieuw",
        hulpvrager_id: String(form.get("hulpvrager") ?? ""),
        grootgenoot_id: String(form.get("grootgenoot") ?? ""),
        uurtarief_cent: Math.round(tariefEuro * 100),
        service_pct: servicePct,
      },
      "nieuw",
    );
  }

  const inputClass =
    "rounded-xl border border-black/15 bg-white px-3 py-2 text-ink focus:border-support";
  const knopClass =
    "rounded-xl border border-black/15 bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-support disabled:opacity-50";

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-ink">Koppelingen en betalingen</h2>

      {(melding || fout) && (
        <p
          role="status"
          className={`mt-3 rounded-xl px-4 py-2 font-semibold ${fout ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
        >
          {fout ?? melding}
        </p>
      )}

      <form
        onSubmit={nieuweKoppeling}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-black/5 bg-white p-4"
      >
        <div>
          <label htmlFor="hulpvrager" className="block text-sm font-semibold text-muted">
            Hulpvrager
          </label>
          <select id="hulpvrager" name="hulpvrager" required className={inputClass}>
            {hulpvragers.map((h) => (
              <option key={h.id} value={h.id}>
                {h.naam}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="grootgenoot" className="block text-sm font-semibold text-muted">
            Grootgenoot
          </label>
          <select id="grootgenoot" name="grootgenoot" required className={inputClass}>
            {grootgenoten.map((g) => (
              <option key={g.id} value={g.id}>
                {g.naam}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tarief" className="block text-sm font-semibold text-muted">
            Uurtarief (€)
          </label>
          <input
            id="tarief"
            name="tarief"
            type="number"
            min={10}
            max={100}
            step="0.50"
            defaultValue={30}
            required
            className={`${inputClass} w-24`}
          />
        </div>
        <div>
          <label htmlFor="service" className="block text-sm font-semibold text-muted">
            Service %
          </label>
          <input
            id="service"
            name="service"
            type="number"
            min={0}
            max={50}
            step="0.5"
            defaultValue={15}
            required
            className={`${inputClass} w-20`}
          />
        </div>
        <button
          type="submit"
          disabled={bezig !== null || hulpvragers.length === 0 || grootgenoten.length === 0}
          className="rounded-xl bg-support px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Koppeling aanmaken
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {koppelingen.length === 0 && (
          <p className="text-muted">Nog geen koppelingen.</p>
        )}
        {koppelingen.map((k) => {
          const ingediend = k.uren.filter((u) => u.status === "ingediend");
          const goedgekeurd = k.uren.filter((u) => u.status === "goedgekeurd");
          const goedMinuten = goedgekeurd.reduce((s, u) => s + u.minuten, 0);
          const goedKm = goedgekeurd.reduce((s, u) => s + Number(u.km ?? 0), 0);
          const urenCent = Math.round((goedMinuten / 60) * k.uurtarief_cent);
          const serviceCent = Math.round((urenCent * k.service_pct) / 100);
          const reisCent = Math.round(goedKm * 23);
          const klaarVoorIncasso =
            goedgekeurd.length > 0 &&
            k.grootgenoot.onboarded &&
            k.hulpvrager.machtiging;

          return (
            <article
              key={k.id}
              className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-ink">
                  {k.hulpvrager.naam}{" "}
                  <span className="font-normal text-muted">krijgt hulp van</span>{" "}
                  {k.grootgenoot.naam}
                </h3>
                <span className="flex items-center gap-2 text-sm font-semibold text-muted">
                  {euro(k.uurtarief_cent)}/uur +
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step="0.5"
                    defaultValue={k.service_pct}
                    aria-label="Servicepercentage"
                    onBlur={(e) => {
                      const nieuwPct = Number(e.target.value.replace(",", "."));
                      if (Number.isFinite(nieuwPct) && nieuwPct !== k.service_pct) {
                        roep(
                          "/api/admin/koppeling",
                          { actie: "service", id: k.id, service_pct: nieuwPct },
                          "service",
                        );
                      }
                    }}
                    className="w-16 rounded-lg border border-black/15 bg-white px-2 py-0.5 text-sm text-ink focus:border-support"
                  />
                  % service
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Koppeling verwijderen? De bijbehorende uren en factuurhistorie verdwijnen ook.",
                        )
                      ) {
                        roep(
                          "/api/admin/koppeling",
                          { actie: "verwijder", id: k.id },
                          "verwijder",
                        );
                      }
                    }}
                    disabled={bezig !== null}
                    className="rounded-lg border border-red-700/30 px-2 py-0.5 text-sm font-semibold text-red-700 transition hover:border-red-700 disabled:opacity-50"
                  >
                    Verwijder
                  </button>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
                <span
                  className={`rounded-full px-3 py-1 ${k.grootgenoot.onboarded ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                >
                  Uitbetaling grootgenoot:{" "}
                  {k.grootgenoot.onboarded ? "geregeld" : "nog niet geregeld"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 ${k.hulpvrager.machtiging ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                >
                  Machtiging cliënt:{" "}
                  {k.hulpvrager.machtiging ? "geregeld" : "nog niet geregeld"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {!k.grootgenoot.onboarded && (
                  <button
                    className={knopClass}
                    disabled={bezig !== null}
                    onClick={() =>
                      roep(
                        "/api/admin/stripe/onboard",
                        { aanmelding_id: k.grootgenoot.id },
                        "onboard",
                      )
                    }
                  >
                    Mail betaallink naar grootgenoot
                  </button>
                )}
                {!k.hulpvrager.machtiging && (
                  <button
                    className={knopClass}
                    disabled={bezig !== null}
                    onClick={() =>
                      roep(
                        "/api/admin/stripe/machtiging",
                        { aanmelding_id: k.hulpvrager.id },
                        "machtiging",
                      )
                    }
                  >
                    Mail machtigingslink naar cliënt
                  </button>
                )}
              </div>

              {ingediend.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                    Ingediende uren
                  </p>
                  <ul className="mt-2 space-y-2">
                    {ingediend.map((u) => (
                      <li
                        key={u.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream px-3 py-2 text-base"
                      >
                        <span>
                          {new Date(u.datum).toLocaleDateString("nl-NL")} ·{" "}
                          {(u.minuten / 60).toLocaleString("nl-NL")} uur
                          {Number(u.km ?? 0) > 0
                            ? ` · ${Number(u.km).toLocaleString("nl-NL")} km`
                            : ""}
                          {u.omschrijving ? ` · ${u.omschrijving}` : ""}
                        </span>
                        <span className="flex gap-2">
                          <button
                            className={knopClass}
                            disabled={bezig !== null}
                            onClick={() =>
                              roep(
                                "/api/admin/uren",
                                { id: u.id, status: "goedgekeurd" },
                                "uren",
                              )
                            }
                          >
                            Goedkeuren
                          </button>
                          <button
                            className={`${knopClass} text-red-700`}
                            disabled={bezig !== null}
                            onClick={() =>
                              roep(
                                "/api/admin/uren",
                                { id: u.id, status: "afgekeurd" },
                                "uren",
                              )
                            }
                          >
                            Afkeuren
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {goedgekeurd.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-support/10 px-4 py-3">
                  <span className="text-base text-ink">
                    Klaar voor incasso:{" "}
                    <span className="font-bold">
                      {(goedMinuten / 60).toLocaleString("nl-NL")} uur
                      {goedKm > 0
                        ? ` · ${goedKm.toLocaleString("nl-NL")} km`
                        : ""}{" "}
                      · {euro(urenCent + serviceCent + reisCent)}
                    </span>{" "}
                    <span className="text-muted">
                      ({euro(urenCent)} grootgenoot + {euro(serviceCent)} service
                      {reisCent > 0 ? ` + ${euro(reisCent)} reiskosten` : ""})
                    </span>
                  </span>
                  <button
                    className="rounded-xl bg-support px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    disabled={bezig !== null || !klaarVoorIncasso}
                    title={
                      klaarVoorIncasso
                        ? ""
                        : "Eerst moeten de betaallink en de machtiging geregeld zijn"
                    }
                    onClick={() =>
                      roep(
                        "/api/admin/stripe/incasso",
                        { koppeling_id: k.id },
                        "incasso",
                      )
                    }
                  >
                    {bezig === "incasso" ? "Bezig…" : "Start incasso"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
