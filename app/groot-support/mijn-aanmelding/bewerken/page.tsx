import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { leesWijzigToken } from "@/lib/wijzigToken";
import WijzigForm from "@/components/WijzigForm";
import { STATUS_LABELS, type Aanmelding, type Status } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Mijn gegevens wijzigen | Grootgenoot",
  robots: { index: false, follow: false },
};

const STATUS_UITLEG: Record<Status, string> = {
  nieuw: "We hebben je aanmelding ontvangen en nemen binnenkort contact met je op.",
  gebeld: "We hebben contact met je gehad en zijn op zoek naar een goede match.",
  intake: "We zijn bezig met de intake om je goed te leren kennen.",
  match_voorgesteld: "We hebben een match voorgesteld. Je hoort snel van ons.",
  gekoppeld: "Je bent gekoppeld! De eerste afspraak wordt ingepland.",
  loopt: "Je koppeling loopt. Vragen? We zijn altijd bereikbaar.",
};

export default async function Bewerken({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const geheim = process.env.ADMIN_SESSION_SECRET;
  const id = token && geheim ? await leesWijzigToken(token, geheim) : null;

  let aanmelding: Aanmelding | null = null;
  if (id) {
    const { data } = await supabaseAdmin
      .from("aanmeldingen")
      .select("*")
      .eq("id", id)
      .single();
    aanmelding = (data as Aanmelding | null) ?? null;
  }

  if (!aanmelding || !token) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <h1 className="text-4xl font-bold leading-tight text-ink">
          Deze link werkt niet meer
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-muted">
          De link is verlopen of ongeldig. Geen zorgen: je vraagt zo een
          nieuwe aan.
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

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Hallo {aanmelding.voornaam}!
      </h1>
      <div className="glas mt-6 p-6">
        <p className="text-base font-semibold uppercase tracking-wide text-muted">
          Status: {STATUS_LABELS[aanmelding.status]}
        </p>
        <p className="mt-2 text-lg leading-relaxed text-ink">
          {STATUS_UITLEG[aanmelding.status]}
        </p>
      </div>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        Hieronder kun je je gegevens aanpassen. Klopt alles al? Dan hoef je
        niets te doen.
      </p>
      <WijzigForm aanmelding={aanmelding} token={token} />
    </main>
  );
}
