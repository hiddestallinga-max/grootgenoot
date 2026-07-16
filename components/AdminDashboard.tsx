"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  STATUS_LABELS,
  STATUS_VOLGORDE,
  type Aanmelding,
  type Status,
} from "@/lib/types";

const statusKleur: Record<Status, string> = {
  nieuw: "bg-blue-100 text-blue-800",
  gebeld: "bg-amber-100 text-amber-800",
  intake: "bg-amber-100 text-amber-800",
  match_voorgesteld: "bg-purple-100 text-purple-800",
  gekoppeld: "bg-green-100 text-green-800",
  loopt: "bg-green-100 text-green-800",
};

export default function AdminDashboard({
  aanmeldingen,
}: {
  aanmeldingen: Aanmelding[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Aanmelding[]>(aanmeldingen);
  const [zoek, setZoek] = useState("");
  const [rolFilter, setRolFilter] = useState<"alle" | "hulpvrager" | "grootgenoot">("alle");
  const [statusFilter, setStatusFilter] = useState<"alle" | Status>("alle");
  const [opslaanFout, setOpslaanFout] = useState<string | null>(null);

  const gefilterd = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    return items.filter((a) => {
      if (rolFilter !== "alle" && a.rol !== rolFilter) return false;
      if (statusFilter !== "alle" && a.status !== statusFilter) return false;
      if (!q) return true;
      const hooi = `${a.voornaam} ${a.achternaam} ${a.email} ${a.postcode ?? ""}`.toLowerCase();
      return hooi.includes(q);
    });
  }, [items, zoek, rolFilter, statusFilter]);

  async function updateVeld(id: string, veld: Partial<Pick<Aanmelding, "status" | "notitie">>) {
    const vorige = items;
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...veld } : a)));
    try {
      const res = await fetch("/api/admin/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...veld }),
      });
      if (!res.ok) throw new Error();
      setOpslaanFout(null);
    } catch {
      // Terugdraaien: de wijziging is niet opgeslagen.
      setItems(vorige);
      setOpslaanFout(
        "Opslaan mislukt. Mogelijk is je sessie verlopen. Herlaad de pagina en probeer het opnieuw.",
      );
    }
  }

  async function verwijderAanmelding(a: Aanmelding) {
    const zeker = window.confirm(
      `${a.voornaam} ${a.achternaam} naar de prullenbak verplaatsen? Je kunt de aanmelding daar altijd terugzetten of alsnog definitief verwijderen.`,
    );
    if (!zeker) return;
    const res = await fetch("/api/admin/aanmelding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, actie: "verwijder" }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== a.id));
      setOpslaanFout(null);
      router.refresh();
    } else {
      setOpslaanFout("Verwijderen mislukt. Probeer het opnieuw.");
    }
  }

  async function uitloggen() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function exporteerCsv() {
    const kol = [
      "rol", "voornaam", "achternaam", "email", "telefoon", "postcode",
      "categorieen", "urgentie", "beschikbaarheid", "toelichting", "status",
      "notitie", "created_at",
    ];
    // Escapen voor CSV, incl. bescherming tegen formule-injectie in Excel.
    const esc = (v: unknown) => {
      let s = String(v ?? "");
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rijen = gefilterd.map((a) =>
      [a.rol, a.voornaam, a.achternaam, a.email, a.telefoon, a.postcode,
       a.categorieen.join("; "), a.urgentie, a.beschikbaarheid, a.toelichting,
       a.status, a.notitie, a.created_at].map(esc).join(","),
    );
    // \ufeff = BOM, zodat Excel de UTF-8 (é, ë, …) goed leest.
    const csv = "\ufeff" + [kol.join(","), ...rijen].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "grootgenoot-aanmeldingen.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const tellingen = STATUS_VOLGORDE.map((s) => ({
    status: s,
    aantal: items.filter((a) => a.status === s).length,
  }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Regiekamer</h1>
          <p className="text-muted">{items.length} aanmeldingen in totaal</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exporteerCsv}
            className="rounded-xl border border-black/15 bg-white px-4 py-2 font-semibold text-ink hover:border-support"
          >
            Exporteer CSV
          </button>
          <button
            onClick={uitloggen}
            className="rounded-xl border border-black/15 bg-white px-4 py-2 font-semibold text-muted hover:border-support"
          >
            Uitloggen
          </button>
        </div>
      </div>

      {opslaanFout && (
        <p role="alert" className="mt-4 rounded-xl bg-red-100 px-4 py-3 font-semibold text-red-800">
          {opslaanFout}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {tellingen.map((t) => (
          <span
            key={t.status}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${statusKleur[t.status]}`}
          >
            {STATUS_LABELS[t.status]}: {t.aantal}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={zoek}
          onChange={(e) => setZoek(e.target.value)}
          placeholder="Zoek op naam, e-mail of postcode"
          className="flex-1 rounded-xl border border-black/15 bg-white px-4 py-2 text-ink focus:border-support"
        />
        <select
          value={rolFilter}
          onChange={(e) => setRolFilter(e.target.value as typeof rolFilter)}
          className="rounded-xl border border-black/15 bg-white px-4 py-2 text-ink"
        >
          <option value="alle">Alle rollen</option>
          <option value="hulpvrager">Hulpvragers</option>
          <option value="grootgenoot">Grootgenoten</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-xl border border-black/15 bg-white px-4 py-2 text-ink"
        >
          <option value="alle">Alle statussen</option>
          {STATUS_VOLGORDE.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {gefilterd.length === 0 && (
          <p className="text-muted">Geen aanmeldingen die aan de filter voldoen.</p>
        )}
        {gefilterd.map((a) => (
          <article key={a.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-ink">
                  {a.voornaam} {a.achternaam}
                </h2>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                  {a.rol === "hulpvrager" ? "Zoekt ondersteuning" : "Grootgenoot"}
                  {a.rol === "hulpvrager" && a.urgentie ? ` · urgentie: ${a.urgentie}` : ""}
                </p>
              </div>
              <span className="flex items-center gap-2">
                <select
                  value={a.status}
                  onChange={(e) => updateVeld(a.id, { status: e.target.value as Status })}
                  className={`rounded-full border-0 px-3 py-1.5 text-sm font-semibold ${statusKleur[a.status]}`}
                >
                  {STATUS_VOLGORDE.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <button
                  onClick={() => verwijderAanmelding(a)}
                  title="Aanmelding naar de prullenbak"
                  className="rounded-full border border-red-700/30 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:border-red-700"
                >
                  Verwijder
                </button>
              </span>
            </div>

            <div className="mt-3 grid gap-x-6 gap-y-1 text-base text-muted sm:grid-cols-2">
              <p><span className="font-semibold text-ink">E-mail:</span> {a.email}</p>
              {a.telefoon && <p><span className="font-semibold text-ink">Tel:</span> {a.telefoon}</p>}
              {a.postcode && <p><span className="font-semibold text-ink">Postcode:</span> {a.postcode}</p>}
              {a.beschikbaarheid && <p><span className="font-semibold text-ink">Beschikbaar:</span> {a.beschikbaarheid}</p>}
              <p><span className="font-semibold text-ink">Aangemeld:</span> {new Date(a.created_at).toLocaleDateString("nl-NL")}</p>
            </div>

            {a.categorieen.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {a.categorieen.map((c) => (
                  <span key={c} className="rounded-full bg-support/10 px-3 py-1 text-sm text-support">{c}</span>
                ))}
              </div>
            )}

            {a.toelichting && (
              <p className="mt-3 rounded-xl bg-cream p-3 text-base italic text-muted">“{a.toelichting}”</p>
            )}

            <textarea
              defaultValue={a.notitie ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (a.notitie ?? "")) {
                  updateVeld(a.id, { notitie: e.target.value });
                }
              }}
              placeholder="Interne notitie (bijv. wanneer gebeld, met wie gematcht)…"
              rows={2}
              className="mt-3 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-base text-ink focus:border-support"
            />
          </article>
        ))}
      </div>
    </main>
  );
}
