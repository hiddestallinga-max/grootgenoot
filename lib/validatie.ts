import { z } from "zod";
import { CATEGORIEEN } from "./types";

const categorieSet = new Set<string>(CATEGORIEEN);

export const aanmeldingSchema = z
  .object({
    rol: z.enum(["hulpvrager", "grootgenoot"]),
    voornaam: z.string().trim().min(1, "Vul je voornaam in").max(100),
    achternaam: z.string().trim().min(1, "Vul je achternaam in").max(100),
    email: z.string().trim().email("Vul een geldig e-mailadres in").max(200),
    telefoon: z.string().trim().max(30).optional().or(z.literal("")),
    // Verplicht: de postcode is ons enige gegeven om iemand dichtbij te vinden.
    postcode: z
      .string()
      .trim()
      .min(4, "Vul je postcode in, dan zoeken we iemand dichtbij")
      .max(10),
    categorieen: z
      .array(z.string())
      .default([])
      .refine((arr) => arr.every((c) => categorieSet.has(c)), {
        message: "Onbekende categorie",
      }),
    urgentie: z.enum(["laag", "gemiddeld", "hoog"]).optional(),
    beschikbaarheid: z.string().trim().max(500).optional().or(z.literal("")),
    werkvorm: z.enum(["particulier", "zzp"]).optional(),
    kvk: z.string().trim().max(20).optional().or(z.literal("")),
    btw_id: z.string().trim().max(20).optional().or(z.literal("")),
    toelichting: z.string().trim().max(2000).optional().or(z.literal("")),
    toestemming: z.literal(true, {
      errorMap: () => ({ message: "Je moet akkoord gaan om je aan te melden" }),
    }),
  })
  .superRefine((d, ctx) => {
    if (d.rol === "grootgenoot" && d.werkvorm === "zzp" && !(d.kvk && d.kvk.trim())) {
      ctx.addIssue({ code: "custom", path: ["kvk"], message: "Vul je KvK-nummer in" });
    }
  })
  .transform((d) => {
    const zzp = d.rol === "grootgenoot" && d.werkvorm === "zzp";
    return {
      ...d,
      telefoon: d.telefoon || null,
      postcode: d.postcode,
      beschikbaarheid: d.beschikbaarheid || null,
      toelichting: d.toelichting || null,
      urgentie: d.rol === "hulpvrager" ? (d.urgentie ?? null) : null,
      werkvorm: d.rol === "grootgenoot" ? (d.werkvorm ?? null) : null,
      kvk: zzp ? d.kvk || null : null,
      btw_id: zzp ? d.btw_id || null : null,
    };
  });

export type AanmeldingInput = z.infer<typeof aanmeldingSchema>;
