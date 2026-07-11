import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Aanmelding } from "@/lib/types";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Regiekamer | Grootgenoot" };

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

  return <AdminDashboard aanmeldingen={(data as Aanmelding[]) ?? []} />;
}
