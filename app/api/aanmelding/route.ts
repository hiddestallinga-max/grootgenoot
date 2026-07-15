import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { aanmeldingSchema } from "@/lib/validatie";
import { isToegestaan, ipVan } from "@/lib/rateLimit";
import { stuurMail, eigenaarEmail } from "@/lib/email";

export async function POST(request: Request) {
  // Maximaal 5 aanmeldingen per 10 minuten per IP tegen spam-scripts.
  if (!isToegestaan(`aanmelding:${ipVan(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Te veel aanmeldingen achter elkaar. Probeer het later opnieuw." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  // Honeypot: het veld "website" is onzichtbaar voor mensen. Alleen bots
  // vullen het in. We doen dan alsof alles gelukt is, zonder op te slaan.
  if (
    typeof body === "object" &&
    body !== null &&
    "website" in body &&
    (body as { website?: unknown }).website
  ) {
    return NextResponse.json({ ok: true });
  }

  const parsed = aanmeldingSchema.safeParse(body);
  if (!parsed.success) {
    const eerste = parsed.error.issues[0]?.message ?? "Controleer je gegevens";
    return NextResponse.json({ error: eerste }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("aanmeldingen")
    .insert(parsed.data);

  if (error) {
    // 23505 = unique_violation: dit e-mailadres is al aangemeld met deze rol.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Je bent al aangemeld met dit e-mailadres. We nemen contact met je op." },
        { status: 409 },
      );
    }
    console.error("Insert-fout aanmelding:", error.message);
    return NextResponse.json(
      { error: "Er ging iets mis bij het opslaan. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  // Mails versturen mag nooit de aanmelding laten mislukken; die is al opgeslagen.
  const d = parsed.data;
  const rolLabel = d.rol === "hulpvrager" ? "zoekt ondersteuning" : "wil grootgenoot worden";

  const stappen = [
    "1. We bellen je eerst om je vraag rustig door te spreken.",
    "2. Zodra er een passende match is, plannen we een gratis en vrijblijvend kennismakingsgesprek.",
  ];
  if (d.rol === "hulpvrager") {
    stappen.push(
      "Fijn om te weten: als het relevant is, is het prettig als er een mantelzorger bij het kennismakingsgesprek aanwezig is. Die kan meehelpen bij het regelen van de administratie.",
    );
  }
  const welkomTekst = `Beste ${d.voornaam},\n\nBedankt voor je aanmelding bij Grootgenoot. We hebben je gegevens goed ontvangen.\n\nZo gaat het nu verder:\n\n${stappen.join("\n\n")}\n\nHartelijke groet,\nHidde van Grootgenoot\ninfo@grootgenoot.nl`;
  await Promise.allSettled([
    stuurMail({
      naar: eigenaarEmail(),
      onderwerp: `Nieuwe aanmelding: ${d.voornaam} ${d.achternaam} (${rolLabel})`,
      tekst: [
        `Naam: ${d.voornaam} ${d.achternaam}`,
        `Rol: ${rolLabel}`,
        `E-mail: ${d.email}`,
        d.telefoon ? `Telefoon: ${d.telefoon}` : null,
        d.postcode ? `Postcode: ${d.postcode}` : null,
        d.categorieen.length ? `Categorieën: ${d.categorieen.join(", ")}` : null,
        d.urgentie ? `Urgentie: ${d.urgentie}` : null,
        d.beschikbaarheid ? `Beschikbaarheid: ${d.beschikbaarheid}` : null,
        d.werkvorm ? `Werkvorm: ${d.werkvorm}` : null,
        d.kvk ? `KvK: ${d.kvk}` : null,
        d.btw_id ? `BTW-id: ${d.btw_id}` : null,
        d.toelichting ? `Toelichting: ${d.toelichting}` : null,
        "",
        "Bekijk alle aanmeldingen in de regiekamer: /admin",
      ]
        .filter((r) => r !== null)
        .join("\n"),
    }),
    stuurMail({
      naar: d.email,
      onderwerp: "Bedankt voor je aanmelding bij Grootgenoot",
      tekst: welkomTekst,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
