import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { leesWijzigToken } from "@/lib/wijzigToken";
import UrenForm from "@/components/UrenForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Uren doorgeven | Grootgenoot",
  robots: { index: false, follow: false },
};

const STATUS_TEKST: Record<string, string> = {
  ingediend: "Wacht op goedkeuring",
  goedgekeurd: "Goedgekeurd",
  afgekeurd: "Afgekeurd",
  gefactureerd: "Op maandoverzicht",
};

type KoppelingRij = {
  id: string;
  hulpvrager: { voornaam: string; achternaam: string } | null;
};

export default async function Uren({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const geheim = process.env.ADMIN_SESSION_SECRET;
  const id = token && geheim ? await leesWijzigToken(token, geheim) : null;

  let koppelingen: KoppelingRij[] = [];
  let voornaam = "";
  if (id) {
    const { data: gg } = await supabaseAdmin
      .from("aanmeldingen")
      .select("voornaam, rol")
      .eq("id", id)
      .is("verwijderd_op", null)
      .single();
    if (gg?.rol === "grootgenoot") {
      voornaam = gg.voornaam;
      const { data } = await supabaseAdmin
        .from("koppelingen")
        .select(
          "id, hulpvrager:aanmeldingen!koppelingen_hulpvrager_id_fkey(voornaam, achternaam)",
        )
        .eq("grootgenoot_id", id)
        .eq("actief", true)
        .is("verwijderd_op", null);
      koppelingen = (data as unknown as KoppelingRij[]) ?? [];
    }
  }

  if (!token || !voornaam) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <h1 className="text-4xl font-bold leading-tight text-ink">
          Deze link werkt niet meer
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-muted">
          Vraag een nieuwe link aan via je e-mailadres, dat is zo gebeurd.
        </p>
        <Link
          href="/groot-support/mijn-aanmelding"
          className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-support"
        >
          Nieuwe link aanvragen <span aria-hidden="true">→</span>
        </Link>
      </main>
    );
  }

  if (koppelingen.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <h1 className="text-4xl font-bold leading-tight text-ink">
          Hallo {voornaam}!
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-muted">
          Je hebt nog geen actieve koppeling, dus er zijn nog geen uren door te
          geven. Zodra je aan iemand gekoppeld bent, kun je hier je uren
          invullen.
        </p>
      </main>
    );
  }

  const koppelingIds = koppelingen.map((k) => k.id);
  const { data: recenteUren } = await supabaseAdmin
    .from("uren")
    .select("id, datum, minuten, km, status, omschrijving")
    .in("koppeling_id", koppelingIds)
    .order("datum", { ascending: false })
    .limit(10);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Uren doorgeven
      </h1>
      <p className="mt-5 mb-8 text-xl leading-relaxed text-muted">
        Hallo {voornaam}! Vul hieronder in wanneer en hoe lang je iemand hebt
        ondersteund. Na goedkeuring komen je uren op het maandoverzicht en worden
        ze automatisch uitbetaald.
      </p>

      <UrenForm
        token={token}
        koppelingen={koppelingen.map((k) => ({
          id: k.id,
          naam: k.hulpvrager
            ? `${k.hulpvrager.voornaam} ${k.hulpvrager.achternaam}`
            : "Onbekend",
        }))}
      />

      {recenteUren && recenteUren.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-ink">Laatst ingediend</h2>
          <ul className="mt-4 space-y-2">
            {recenteUren.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-white/60 px-4 py-3 text-lg"
              >
                <span className="text-ink">
                  {new Date(u.datum).toLocaleDateString("nl-NL")} ·{" "}
                  {(u.minuten / 60).toLocaleString("nl-NL")} uur
                  {Number(u.km ?? 0) > 0
                    ? ` · ${Number(u.km).toLocaleString("nl-NL")} km`
                    : ""}
                </span>
                <span className="text-base font-semibold text-muted">
                  {STATUS_TEKST[u.status] ?? u.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
