"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Aanmelding } from "@/lib/types";

// Prullenbak van de regiekamer: soft-deleted aanmeldingen en koppelingen.
// Alles is terug te zetten; "definitief verwijderen" is de enige actie die
// echt gegevens weggooit (facturen blijven ook dan bewaard).

export type WegKoppeling = {
  id: string;
  verwijderdOp: string;
  hulpvragerNaam: string;
  grootgenootNaam: string;
};

export default function Prullenbak({
  aanmeldingen,
  koppelingen,
}: {
  aanmeldingen: Aanmelding[];
  koppelingen: WegKoppeling[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const totaal = aanmeldingen.length + koppelingen.length;
  if (totaal === 0) return null;

  async function roep(pad: string, body: object) {
    setBezig(true);
    setFout(null);
    try {
      const res = await fetch(pad, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");
      router.refresh();
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis");
    } finally {
      setBezig(false);
    }
  }

  const knopHerstel =
    "rounded-lg border border-support px-3 py-1.5 text-sm font-semibold text-support transition hover:bg-support/5 disabled:opacity-50";
  const knopWeg =
    "rounded-lg border border-red-700/30 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:border-red-700 disabled:opacity-50";

  return (
    <section className="mt-12">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 text-xl font-bold text-muted transition hover:text-ink"
      >
        <span aria-hidden="true">{open ? "▾" : "▸"}</span>
        Prullenbak ({totaal})
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {fout && (
            <p role="alert" className="rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-800">
              {fout}
            </p>
          )}

          {aanmeldingen.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/70 px-5 py-4"
            >
              <div>
                <p className="font-bold text-ink">
                  {a.voornaam} {a.achternaam}{" "}
                  <span className="font-normal text-muted">
                    ({a.rol === "hulpvrager" ? "hulpvrager" : "grootgenoot"})
                  </span>
                </p>
                <p className="text-sm text-muted">
                  {a.email}
                  {a.verwijderd_op
                    ? ` · verwijderd op ${new Date(a.verwijderd_op).toLocaleDateString("nl-NL")}`
                    : ""}
                </p>
              </div>
              <span className="flex gap-2">
                <button
                  className={knopHerstel}
                  disabled={bezig}
                  onClick={() =>
                    roep("/api/admin/aanmelding", { id: a.id, actie: "herstel" })
                  }
                >
                  Terugzetten
                </button>
                <button
                  className={knopWeg}
                  disabled={bezig}
                  onClick={() => {
                    if (
                      window.confirm(
                        `${a.voornaam} ${a.achternaam} definitief verwijderen? Dit kan niet ongedaan worden gemaakt. Koppelingen en uren verdwijnen mee; facturen blijven bewaard.`,
                      )
                    ) {
                      roep("/api/admin/aanmelding", { id: a.id, actie: "definitief" });
                    }
                  }}
                >
                  Definitief verwijderen
                </button>
              </span>
            </div>
          ))}

          {koppelingen.map((k) => (
            <div
              key={k.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/70 px-5 py-4"
            >
              <div>
                <p className="font-bold text-ink">
                  Koppeling: {k.hulpvragerNaam}{" "}
                  <span className="font-normal text-muted">en</span>{" "}
                  {k.grootgenootNaam}
                </p>
                <p className="text-sm text-muted">
                  verwijderd op{" "}
                  {new Date(k.verwijderdOp).toLocaleDateString("nl-NL")}
                </p>
              </div>
              <span className="flex gap-2">
                <button
                  className={knopHerstel}
                  disabled={bezig}
                  onClick={() =>
                    roep("/api/admin/koppeling", { id: k.id, actie: "herstel" })
                  }
                >
                  Terugzetten
                </button>
                <button
                  className={knopWeg}
                  disabled={bezig}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Koppeling definitief verwijderen? De uren verdwijnen mee; facturen blijven bewaard.",
                      )
                    ) {
                      roep("/api/admin/koppeling", { id: k.id, actie: "definitief" });
                    }
                  }}
                >
                  Definitief verwijderen
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
