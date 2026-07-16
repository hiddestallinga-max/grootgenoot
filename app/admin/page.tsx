import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Aanmelding } from "@/lib/types";
import AdminDashboard from "@/components/AdminDashboard";
import KoppelingenBeheer, {
  type KoppelingView,
  type UrenRij,
  type FactuurView,
} from "@/components/KoppelingenBeheer";
import IntakeBeheer, { type IntakeRij } from "@/components/IntakeBeheer";
import Prullenbak, { type WegKoppeling } from "@/components/Prullenbak";

export const dynamic = "force-dynamic";
export const metadata = { title: "Regiekamer | Grootgenoot" };

type PersoonKort = {
  id: string;
  voornaam: string;
  achternaam: string;
  stripe_onboarded: boolean;
  stripe_machtiging: boolean;
};

type KoppelingRuw = {
  id: string;
  uurtarief_cent: number;
  actief: boolean;
  verwijderd_op: string | null;
  hulpvrager: PersoonKort | null;
  grootgenoot: PersoonKort | null;
  uren: UrenRij[];
};

export default async function AdminPage() {
  const { data, error } = await supabaseAdmin
    .from("aanmeldingen")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-ink">Regiekamer</h1>
        <p className="mt-4 text-lg text-red-700">
          Kon aanmeldingen niet laden: {error.message}
        </p>
        <p className="mt-2 text-muted">
          Controleer of het schema is uitgevoerd en de env-variabelen kloppen.
        </p>
      </main>
    );
  }

  const alleAanmeldingen = (data as Aanmelding[]) ?? [];
  const aanmeldingen = alleAanmeldingen.filter((a) => !a.verwijderd_op);
  const wegAanmeldingen = alleAanmeldingen.filter((a) => a.verwijderd_op);

  const { data: koppelingenData } = await supabaseAdmin
    .from("koppelingen")
    .select(
      "id, uurtarief_cent, actief, verwijderd_op, hulpvrager:aanmeldingen!koppelingen_hulpvrager_id_fkey(id, voornaam, achternaam, stripe_onboarded, stripe_machtiging), grootgenoot:aanmeldingen!koppelingen_grootgenoot_id_fkey(id, voornaam, achternaam, stripe_onboarded, stripe_machtiging), uren(id, datum, minuten, km, omschrijving, status)",
    )
    .order("created_at", { ascending: false });

  const alleKoppelingen = (koppelingenData as unknown as KoppelingRuw[]) ?? [];

  const naarView = (k: KoppelingRuw): KoppelingView => ({
    id: k.id,
    uurtarief_cent: k.uurtarief_cent,
    actief: k.actief,
    hulpvrager: {
      id: k.hulpvrager?.id ?? "",
      naam: k.hulpvrager
        ? `${k.hulpvrager.voornaam} ${k.hulpvrager.achternaam}`
        : "Onbekend",
      machtiging: Boolean(k.hulpvrager?.stripe_machtiging),
    },
    grootgenoot: {
      id: k.grootgenoot?.id ?? "",
      naam: k.grootgenoot
        ? `${k.grootgenoot.voornaam} ${k.grootgenoot.achternaam}`
        : "Onbekend",
      onboarded: Boolean(k.grootgenoot?.stripe_onboarded),
    },
    uren: k.uren ?? [],
  });

  const koppelingen: KoppelingView[] = alleKoppelingen
    .filter((k) => !k.verwijderd_op)
    .map(naarView);

  const wegKoppelingen: WegKoppeling[] = alleKoppelingen
    .filter((k) => k.verwijderd_op)
    .map((k) => ({
      id: k.id,
      verwijderdOp: k.verwijderd_op ?? "",
      hulpvragerNaam: k.hulpvrager
        ? `${k.hulpvrager.voornaam} ${k.hulpvrager.achternaam}`
        : "Onbekend",
      grootgenootNaam: k.grootgenoot
        ? `${k.grootgenoot.voornaam} ${k.grootgenoot.achternaam}`
        : "Onbekend",
    }));

  type FactuurRuw = {
    id: string;
    koppeling_id: string | null;
    periode: string;
    totaal_cent: number;
    status: string;
    nummer: number | null;
    gecrediteerd: boolean;
    incasso_vanaf: string | null;
    created_at: string;
    creditnotas: { id: string; nummer: number; bedrag_cent: number; created_at: string }[] | null;
  };

  const { data: facturenData } = await supabaseAdmin
    .from("facturen")
    .select(
      "id, koppeling_id, periode, totaal_cent, status, nummer, gecrediteerd, incasso_vanaf, created_at, creditnotas(id, nummer, bedrag_cent, created_at)",
    )
    .order("created_at", { ascending: false });

  const zichtbareKoppelingIds = new Set(koppelingen.map((k) => k.id));
  const facturenPerKoppeling: Record<string, FactuurView[]> = {};
  const losseFacturen: FactuurView[] = [];
  for (const f of (facturenData as unknown as FactuurRuw[]) ?? []) {
    const jaar = new Date(f.created_at).getFullYear();
    const view: FactuurView = {
      id: f.id,
      nummer: f.nummer != null ? `${jaar}-${String(f.nummer).padStart(4, "0")}` : "—",
      periode: f.periode,
      totaalCent: f.totaal_cent,
      status: f.status,
      gecrediteerd: f.gecrediteerd,
      incassoVanaf: f.incasso_vanaf,
      creditnotas: (f.creditnotas ?? []).map((c) => ({
        id: c.id,
        nummer: `C${new Date(c.created_at).getFullYear()}-${String(c.nummer).padStart(4, "0")}`,
        bedragCent: c.bedrag_cent,
      })),
    };
    if (f.koppeling_id && zichtbareKoppelingIds.has(f.koppeling_id)) {
      (facturenPerKoppeling[f.koppeling_id] ??= []).push(view);
    } else {
      // Facturen waarvan de koppeling in de prullenbak zit of definitief weg
      // is: die blijven bewaard (fiscale bewaarplicht) en tonen we apart.
      losseFacturen.push(view);
    }
  }

  const { data: intakeData } = await supabaseAdmin
    .from("stripe_intake")
    .select("*")
    .order("created_at", { ascending: false });
  const intakes = (intakeData as IntakeRij[]) ?? [];

  const kandidaat = (a: Aanmelding) => ({
    id: a.id,
    naam: `${a.voornaam} ${a.achternaam}`,
  });

  return (
    <>
      <AdminDashboard aanmeldingen={aanmeldingen} />
      <div className="mx-auto max-w-5xl px-6 pb-16">
        {intakes.length > 0 && <IntakeBeheer intakes={intakes} />}
        <KoppelingenBeheer
          koppelingen={koppelingen}
          facturen={facturenPerKoppeling}
          losseFacturen={losseFacturen}
          hulpvragers={aanmeldingen.filter((a) => a.rol === "hulpvrager").map(kandidaat)}
          grootgenoten={aanmeldingen.filter((a) => a.rol === "grootgenoot").map(kandidaat)}
        />
        <Prullenbak aanmeldingen={wegAanmeldingen} koppelingen={wegKoppelingen} />
      </div>
    </>
  );
}
