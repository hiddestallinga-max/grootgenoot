import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Aanmelding } from "@/lib/types";
import AdminDashboard from "@/components/AdminDashboard";
import KoppelingenBeheer, {
  type KoppelingView,
  type UrenRij,
} from "@/components/KoppelingenBeheer";

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
  service_pct: number;
  actief: boolean;
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

  const aanmeldingen = (data as Aanmelding[]) ?? [];

  const { data: koppelingenData } = await supabaseAdmin
    .from("koppelingen")
    .select(
      "id, uurtarief_cent, service_pct, actief, hulpvrager:aanmeldingen!koppelingen_hulpvrager_id_fkey(id, voornaam, achternaam, stripe_onboarded, stripe_machtiging), grootgenoot:aanmeldingen!koppelingen_grootgenoot_id_fkey(id, voornaam, achternaam, stripe_onboarded, stripe_machtiging), uren(id, datum, minuten, omschrijving, status)",
    )
    .order("created_at", { ascending: false });

  const koppelingen: KoppelingView[] = (
    (koppelingenData as unknown as KoppelingRuw[]) ?? []
  ).map((k) => ({
    id: k.id,
    uurtarief_cent: k.uurtarief_cent,
    service_pct: Number(k.service_pct),
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
  }));

  const kandidaat = (a: Aanmelding) => ({
    id: a.id,
    naam: `${a.voornaam} ${a.achternaam}`,
  });

  return (
    <>
      <AdminDashboard aanmeldingen={aanmeldingen} />
      <div className="mx-auto max-w-5xl px-6 pb-16">
        <KoppelingenBeheer
          koppelingen={koppelingen}
          hulpvragers={aanmeldingen.filter((a) => a.rol === "hulpvrager").map(kandidaat)}
          grootgenoten={aanmeldingen.filter((a) => a.rol === "grootgenoot").map(kandidaat)}
        />
      </div>
    </>
  );
}
