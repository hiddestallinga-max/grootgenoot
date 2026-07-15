import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { genereerFactuurPdf, type FactuurSnapshot } from "@/lib/factuurPdf";

// Download een eerder gemaakte factuur opnieuw als PDF, uit de opgeslagen
// snapshot. Beschermd door de regiekamer-middleware (/api/admin/*).

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Geen factuur opgegeven" }, { status: 400 });
  }

  const { data: factuur } = await supabaseAdmin
    .from("facturen")
    .select("snapshot")
    .eq("id", id)
    .single();

  const snapshot = factuur?.snapshot as FactuurSnapshot | null;
  if (!snapshot) {
    return NextResponse.json(
      { error: "Voor deze factuur is geen PDF beschikbaar." },
      { status: 404 },
    );
  }

  const pdf = await genereerFactuurPdf(snapshot);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="factuur-${snapshot.nummer}.pdf"`,
    },
  });
}
