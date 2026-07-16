import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  SERVICE_CENT_PER_UUR,
  REISKOSTEN_CENT_PER_KM,
  BTW_PCT_SERVICE,
  btwOverService,
} from "./tarieven";

// Nette factuur- en creditnota-PDF's in de huisstijl van Grootgenoot.
// Zuiver JavaScript (pdf-lib), dus werkt prima op Vercel zonder externe fonts.
// Bij veel urenregels loopt de tabel automatisch door op een volgende pagina.

const BEDRIJF = {
  naam: "Grootgenoot",
  tagline: "Hulp en gezelschap dichtbij",
  adres: "De Steeg (Gelderland)",
  email: "info@grootgenoot.nl",
  telefoon: "06 12154010",
  kvk: "42103745",
  btw: "NL005497451B95",
  iban: "NL59 ASNB 0708 8601 92",
};

const KLEUR = {
  support: rgb(0.094, 0.373, 0.647),
  ink: rgb(0.047, 0.184, 0.306),
  muted: rgb(0.29, 0.36, 0.43),
  lijn: rgb(0.85, 0.88, 0.92),
  wit: rgb(1, 1, 1),
};

const PAGINA = { breedte: 595.28, hoogte: 841.89 };
const ONDERGRENS = 110; // onder deze y begint een nieuwe pagina (boven de voettekst)

export type FactuurRegel = {
  datum: string;
  minuten: number;
  km: number;
  omschrijving: string | null;
};

export type FactuurSnapshot = {
  nummer: string;
  datum: string;
  periode: string;
  klantNaam: string;
  grootgenootNaam: string;
  uurtariefCent: number;
  regels: FactuurRegel[];
  totaalUren: number;
  totaalKm: number;
  urenCent: number;
  serviceCent: number;
  reisCent: number;
  totaalCent: number;
  // Tarieven zoals ze golden op factuurdatum (oude snapshots missen deze
  // velden; dan vallen we terug op de huidige constanten).
  serviceCentPerUur?: number;
  reiskostenCentPerKm?: number;
  btwPctService?: number;
  btwCent?: number;
  incassoVanaf?: string | null;
  grootgenootKvk?: string | null;
  grootgenootBtw?: string | null;
};

function euro(cent: number): string {
  return (cent / 100).toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

function getal(n: number): string {
  return n.toLocaleString("nl-NL", { maximumFractionDigits: 2 });
}

function datumNl(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function datumLang(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

type Ctx = {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  breedte: number;
};

function tekst(
  ctx: Ctx,
  s: string,
  x: number,
  y: number,
  opties: { grootte?: number; vet?: boolean; kleur?: ReturnType<typeof rgb>; rechts?: boolean } = {},
) {
  const grootte = opties.grootte ?? 10;
  const font = opties.vet ? ctx.bold : ctx.font;
  let px = x;
  if (opties.rechts) px = x - font.widthOfTextAtSize(s, grootte);
  ctx.page.drawText(s, { x: px, y, size: grootte, font, color: opties.kleur ?? KLEUR.ink });
}

function kop(ctx: Ctx, titel: string, nummer: string, datum: string, periode: string, marge: number) {
  const top = 792;
  tekst(ctx, BEDRIJF.naam, marge, top, { grootte: 24, vet: true, kleur: KLEUR.support });
  tekst(ctx, BEDRIJF.tagline, marge, top - 18, { grootte: 10, kleur: KLEUR.muted });

  const rechts = ctx.breedte - marge;
  tekst(ctx, titel, rechts, top, { grootte: 18, vet: true, rechts: true });
  tekst(ctx, `Nummer: ${nummer}`, rechts, top - 22, { grootte: 10, kleur: KLEUR.muted, rechts: true });
  tekst(ctx, `Datum: ${datumNl(datum)}`, rechts, top - 36, { grootte: 10, kleur: KLEUR.muted, rechts: true });
  tekst(ctx, `Periode: ${periode}`, rechts, top - 50, { grootte: 10, kleur: KLEUR.muted, rechts: true });

  ctx.page.drawLine({
    start: { x: marge, y: top - 66 },
    end: { x: rechts, y: top - 66 },
    thickness: 1,
    color: KLEUR.support,
  });
  return top - 66;
}

function afzenderEnKlant(ctx: Ctx, klantNaam: string, marge: number, yStart: number) {
  const rechts = ctx.breedte - marge;
  let y = yStart - 26;
  tekst(ctx, "Van", marge, y, { grootte: 9, vet: true, kleur: KLEUR.muted });
  tekst(ctx, "Factuur voor", rechts - 180, y, { grootte: 9, vet: true, kleur: KLEUR.muted });
  y -= 16;
  tekst(ctx, BEDRIJF.naam, marge, y, { grootte: 11, vet: true });
  tekst(ctx, klantNaam, rechts - 180, y, { grootte: 11, vet: true });
  y -= 14;
  const regelsVan = [BEDRIJF.adres, BEDRIJF.email, BEDRIJF.telefoon, `KvK ${BEDRIJF.kvk}`];
  for (const r of regelsVan) {
    tekst(ctx, r, marge, y, { grootte: 9, kleur: KLEUR.muted });
    y -= 12;
  }
  return y;
}

function totaalregel(
  ctx: Ctx,
  label: string,
  bedrag: string,
  y: number,
  marge: number,
  vet = false,
) {
  const rechts = ctx.breedte - marge;
  tekst(ctx, label, rechts - 240, y, { grootte: vet ? 12 : 10, vet, kleur: vet ? KLEUR.ink : KLEUR.muted });
  tekst(ctx, bedrag, rechts, y, { grootte: vet ? 12 : 10, vet, rechts: true });
}

async function nieuwDocument() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGINA.breedte, PAGINA.hoogte]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ctx: Ctx = { doc, page, font, bold, breedte: PAGINA.breedte };
  return { doc, ctx };
}

/** Begint een nieuwe pagina en geeft de nieuwe start-y terug. */
function nieuwePagina(ctx: Ctx): number {
  ctx.page = ctx.doc.addPage([PAGINA.breedte, PAGINA.hoogte]);
  return PAGINA.hoogte - 60;
}

function voettekst(ctx: Ctx, marge: number, boodschap: string) {
  const y = 70;
  ctx.page.drawLine({
    start: { x: marge, y: y + 16 },
    end: { x: ctx.breedte - marge, y: y + 16 },
    thickness: 0.5,
    color: KLEUR.lijn,
  });
  tekst(ctx, boodschap, marge, y, { grootte: 9, kleur: KLEUR.muted });
  tekst(
    ctx,
    `${BEDRIJF.naam} · KvK ${BEDRIJF.kvk} · BTW ${BEDRIJF.btw} · IBAN ${BEDRIJF.iban}`,
    marge,
    y - 14,
    { grootte: 8, kleur: KLEUR.muted },
  );
}

export async function genereerFactuurPdf(s: FactuurSnapshot): Promise<Uint8Array> {
  const marge = 50;
  const { doc, ctx } = await nieuwDocument();

  const servicePerUur = s.serviceCentPerUur ?? SERVICE_CENT_PER_UUR;
  const reisPerKm = s.reiskostenCentPerKm ?? REISKOSTEN_CENT_PER_KM;
  const btwPct = s.btwPctService ?? BTW_PCT_SERVICE;
  const btwCent = s.btwCent ?? btwOverService(s.serviceCent);

  const yNaKop = kop(ctx, "Factuur", s.nummer, s.datum, s.periode, marge);
  let y = afzenderEnKlant(ctx, s.klantNaam, marge, yNaKop);

  const colDatum = marge + 6;
  const colOms = marge + 90;
  const colUur = ctx.breedte - marge - 120;
  const colKm = ctx.breedte - marge - 40;

  function tabelkop(yPos: number): number {
    ctx.page.drawRectangle({
      x: marge,
      y: yPos - 4,
      width: ctx.breedte - marge * 2,
      height: 20,
      color: rgb(0.93, 0.96, 0.99),
    });
    tekst(ctx, "Datum", colDatum, yPos + 2, { grootte: 9, vet: true });
    tekst(ctx, "Omschrijving", colOms, yPos + 2, { grootte: 9, vet: true });
    tekst(ctx, "Uren", colUur, yPos + 2, { grootte: 9, vet: true, rechts: true });
    tekst(ctx, "Km", colKm, yPos + 2, { grootte: 9, vet: true, rechts: true });
    return yPos - 18;
  }

  y -= 24;
  y = tabelkop(y);

  for (const r of s.regels) {
    if (y < ONDERGRENS) {
      y = nieuwePagina(ctx);
      y = tabelkop(y);
    }
    const uur = getal(r.minuten / 60);
    tekst(ctx, datumNl(r.datum), colDatum, y, { grootte: 9, kleur: KLEUR.muted });
    const oms = r.omschrijving && r.omschrijving.length > 52
      ? r.omschrijving.slice(0, 51) + "…"
      : r.omschrijving ?? "";
    tekst(ctx, oms, colOms, y, { grootte: 9, kleur: KLEUR.muted });
    tekst(ctx, uur, colUur, y, { grootte: 9, kleur: KLEUR.muted, rechts: true });
    tekst(ctx, r.km > 0 ? getal(r.km) : "-", colKm, y, { grootte: 9, kleur: KLEUR.muted, rechts: true });
    y -= 14;
  }

  // Het totaalblok heeft ongeveer 130 punten nodig; anders naar een nieuwe pagina.
  if (y < ONDERGRENS + 130) {
    y = nieuwePagina(ctx);
  }

  if (s.grootgenootKvk) {
    y -= 4;
    const idlijn = `Uren uitgevoerd door ${s.grootgenootNaam} (zzp), KvK ${s.grootgenootKvk}${
      s.grootgenootBtw ? `, BTW ${s.grootgenootBtw}` : ""
    }`;
    tekst(ctx, idlijn, colDatum, y, { grootte: 8, kleur: KLEUR.muted });
    y -= 10;
  }

  y -= 6;
  ctx.page.drawLine({
    start: { x: ctx.breedte - marge - 280, y },
    end: { x: ctx.breedte - marge, y },
    thickness: 0.5,
    color: KLEUR.lijn,
  });
  y -= 18;
  totaalregel(ctx, `Uren (${getal(s.totaalUren)} × ${euro(s.uurtariefCent)})`, euro(s.urenCent), y, marge);
  y -= 16;
  totaalregel(
    ctx,
    `Service (${getal(s.totaalUren)} × ${euro(servicePerUur)}, incl. btw)`,
    euro(s.serviceCent),
    y,
    marge,
  );
  if (s.reisCent > 0) {
    y -= 16;
    totaalregel(ctx, `Reiskosten (${getal(s.totaalKm)} km × ${euro(reisPerKm)})`, euro(s.reisCent), y, marge);
  }
  y -= 10;
  ctx.page.drawLine({
    start: { x: ctx.breedte - marge - 280, y },
    end: { x: ctx.breedte - marge, y },
    thickness: 0.5,
    color: KLEUR.lijn,
  });
  y -= 20;
  totaalregel(ctx, "Totaal", euro(s.totaalCent), y, marge, true);
  y -= 16;
  totaalregel(
    ctx,
    `Waarvan btw over de service (${btwPct}%)`,
    euro(btwCent),
    y,
    marge,
  );
  y -= 12;
  tekst(
    ctx,
    "Het uurtarief en de reiskosten gaan volledig naar uw grootgenoot; daarover brengt Grootgenoot geen btw in rekening.",
    marge,
    y,
    { grootte: 8, kleur: KLEUR.muted },
  );

  voettekst(
    ctx,
    marge,
    s.incassoVanaf
      ? `Dit bedrag wordt op of kort na ${datumLang(s.incassoVanaf)} via automatische SEPA-incasso afgeschreven. Vragen? Bel of mail ons gerust.`
      : "Dit bedrag wordt via automatische SEPA-incasso van uw rekening afgeschreven. Vragen? Bel of mail ons gerust.",
  );

  return doc.save();
}

export type CreditnotaData = {
  nummer: string;
  datum: string;
  origineelNummer: string;
  periode: string;
  klantNaam: string;
  bedragCent: number;
  reden: string | null;
};

export async function genereerCreditnotaPdf(c: CreditnotaData): Promise<Uint8Array> {
  const marge = 50;
  const { doc, ctx } = await nieuwDocument();

  const yNaKop = kop(ctx, "Creditnota", c.nummer, c.datum, c.periode, marge);
  let y = afzenderEnKlant(ctx, c.klantNaam, marge, yNaKop);

  y -= 30;
  tekst(ctx, `Correctie op factuur ${c.origineelNummer}`, marge, y, { grootte: 11, vet: true });
  y -= 20;
  tekst(
    ctx,
    "Deze creditnota corrigeert de bovengenoemde factuur. Het bedrag wordt teruggestort.",
    marge,
    y,
    { grootte: 10, kleur: KLEUR.muted },
  );
  if (c.reden) {
    y -= 16;
    tekst(ctx, `Reden: ${c.reden}`, marge, y, { grootte: 10, kleur: KLEUR.muted });
  }

  y -= 34;
  ctx.page.drawLine({
    start: { x: ctx.breedte - marge - 220, y },
    end: { x: ctx.breedte - marge, y },
    thickness: 0.5,
    color: KLEUR.lijn,
  });
  y -= 20;
  totaalregel(ctx, "Gecrediteerd bedrag", `- ${euro(c.bedragCent)}`, y, marge, true);

  voettekst(
    ctx,
    marge,
    "Het gecrediteerde bedrag wordt binnen enkele werkdagen teruggestort op uw rekening.",
  );

  return doc.save();
}
