import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isToegestaan, ipVan } from "@/lib/rateLimit";
import { stuurMail, eigenaarEmail } from "@/lib/email";

// Gebruiker die liever heeft dat Hidde de Stripe-instelling regelt, stuurt hier
// zijn betaalgegevens. We slaan ze server-side op (RLS aan) en mailen Hidde dat
// er nieuwe gegevens binnen zijn. Hidde zet ze daarna in Stripe.

const ibanRe = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

const schema = z
  .object({
    rol: z.enum(["hulpvrager", "grootgenoot"]),
    voornaam: z.string().trim().min(1, "Vul je voornaam in").max(100),
    achternaam: z.string().trim().min(1, "Vul je achternaam in").max(100),
    email: z.string().trim().email("Vul een geldig e-mailadres in").max(200),
    telefoon: z.string().trim().min(6, "Vul een telefoonnummer in").max(30),
    straat: z.string().trim().min(2, "Vul je straat en huisnummer in").max(200),
    postcode: z.string().trim().min(4, "Vul je postcode in").max(12),
    woonplaats: z.string().trim().min(2, "Vul je woonplaats in").max(100),
    iban: z
      .string()
      .trim()
      .max(40)
      .transform((v) => v.replace(/\s+/g, "").toUpperCase()),
    rekeninghouder: z.string().trim().min(2, "Vul de naam op de rekening in").max(200),
    geboortedatum: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .or(z.literal("")),
    kvk: z.string().trim().max(20).optional().or(z.literal("")),
    machtiging_akkoord: z.boolean().optional().default(false),
    toelichting: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    if (!ibanRe.test(val.iban)) {
      ctx.addIssue({ code: "custom", path: ["iban"], message: "Vul een geldig IBAN in" });
    }
    if (val.rol === "hulpvrager" && !val.machtiging_akkoord) {
      ctx.addIssue({
        code: "custom",
        path: ["machtiging_akkoord"],
        message: "We hebben je toestemming voor de automatische incasso nodig",
      });
    }
    if (val.rol === "grootgenoot" && !/^\d{4}-\d{2}-\d{2}$/.test(val.geboortedatum ?? "")) {
      ctx.addIssue({
        code: "custom",
        path: ["geboortedatum"],
        message: "Vul je geboortedatum in",
      });
    }
  });

export async function POST(request: Request) {
  if (!isToegestaan(`stripe-intake:${ipVan(request)}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het over een kwartier opnieuw." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Controleer je gegevens" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const { error } = await supabaseAdmin.from("stripe_intake").insert({
    rol: d.rol,
    voornaam: d.voornaam,
    achternaam: d.achternaam,
    email: d.email,
    telefoon: d.telefoon,
    straat: d.straat,
    postcode: d.postcode,
    woonplaats: d.woonplaats,
    geboortedatum: d.rol === "grootgenoot" && d.geboortedatum ? d.geboortedatum : null,
    kvk: d.kvk || null,
    iban: d.iban,
    rekeninghouder: d.rekeninghouder,
    machtiging_akkoord: d.rol === "hulpvrager" ? Boolean(d.machtiging_akkoord) : false,
    toelichting: d.toelichting || null,
  });

  if (error) {
    console.error("Stripe-intake-fout:", error.message);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }

  // Bewust géén IBAN of andere betaalgegevens in deze mail: die staan alleen
  // in de database (RLS aan) en zijn in de regiekamer in te zien. Zo zwerven
  // er geen bankgegevens rond in mailboxen.
  const rolLabel = d.rol === "hulpvrager" ? "hulpvrager (incasso)" : "grootgenoot (uitbetaling)";
  await stuurMail({
    naar: eigenaarEmail(),
    onderwerp: `Betaalgegevens ontvangen: ${d.voornaam} ${d.achternaam} (${rolLabel})`,
    tekst: `${d.voornaam} ${d.achternaam} (${rolLabel}) heeft betaalgegevens ingestuurd via "Wij regelen je betaling".\n\nBekijk de gegevens in de regiekamer, zet ze in Stripe en klik daarna op "Verwerkt": /admin`,
  });

  return NextResponse.json({ ok: true });
}
