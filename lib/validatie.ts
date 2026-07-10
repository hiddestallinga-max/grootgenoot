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
    postcode: z.string().trim().max(10).optional().or(z.literal("")),
    categorieen: z
      .array(z.string())
      .default([])
      .refine((arr) => arr.every((c) => categorieSet.has(c)), {
        message: "Onbekende categorie",
      }),
    urgentie: z.enum(["laag", "gemiddeld", "hoog"]).optional(),
    beschikbaarheid: z.string().trim().max(500).optional().or(z.literal("")),
    toelichting: z.string().trim().max(2000).optional().or(z.literal("")),
    toestemming: z.literal(true, {
      errorMap: () => ({ message: "Je moet akkoord gaan om je aan te melden" }),
    }),
  })
  .transform((d) => ({
    ...d,
    telefoon: d.telefoon || null,
    postcode: d.postcode || null,
    beschikbaarheid: d.beschikbaarheid || null,
    toelichting: d.toelichting || null,
    urgentie: d.rol === "hulpvrager" ? (d.urgentie ?? null) : null,
  }));

export type AanmeldingInput = z.infer<typeof aanmeldingSchema>;
