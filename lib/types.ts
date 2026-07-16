export type Rol = "hulpvrager" | "grootgenoot";

export type Status =
  | "nieuw"
  | "gebeld"
  | "intake"
  | "match_voorgesteld"
  | "gekoppeld"
  | "loopt";

export const STATUS_LABELS: Record<Status, string> = {
  nieuw: "Nieuw",
  gebeld: "Gebeld",
  intake: "Intake",
  match_voorgesteld: "Match voorgesteld",
  gekoppeld: "Gekoppeld",
  loopt: "Loopt & nazorg",
};

export const STATUS_VOLGORDE: Status[] = [
  "nieuw",
  "gebeld",
  "intake",
  "match_voorgesteld",
  "gekoppeld",
  "loopt",
];

// Waar iemand hulp bij zoekt of wat een grootgenoot wil bieden.
export const CATEGORIEEN = [
  "Gezelschap",
  "Wandelen of een uitje",
  "Koken of samen eten",
  "Boodschappen of vervoer",
  "Hand- en spandiensten (was, administratie, IT)",
  "Samen sporten of bewegen",
  "Helpen onthouden (medicatie, afspraken)",
] as const;

export type Aanmelding = {
  id: string;
  rol: Rol;
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string | null;
  postcode: string | null;
  categorieen: string[];
  urgentie: "laag" | "gemiddeld" | "hoog" | null;
  beschikbaarheid: string | null;
  toelichting: string | null;
  toestemming: boolean;
  status: Status;
  notitie: string | null;
  created_at: string;
  // Soft delete: gezet = in de prullenbak (regiekamer), null = actief.
  verwijderd_op?: string | null;
};
