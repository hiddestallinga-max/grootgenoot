// Plaatsen in het werkgebied (regio Arnhem–Nijmegen en omstreken). Elke plaats
// heeft eigen, plaatsspecifieke tekst zodat de landingspagina's echt van elkaar
// verschillen (geen dunne, gekopieerde pagina's).

export type Plaats = {
  slug: string;
  naam: string;
  gemeente: string;
  intro: string;
  buurten: string[];
  nabij: string[]; // slugs van nabijgelegen plaatsen (interne links)
};

export const PLAATSEN: Plaats[] = [
  {
    slug: "arnhem",
    naam: "Arnhem",
    gemeente: "Arnhem",
    intro:
      "In Arnhem willen veel ouderen zo lang mogelijk zelfstandig in hun eigen wijk blijven wonen, of dat nu het Spijkerkwartier, Klarendal, Presikhaaf, Schuytgraaf of Elden is. Een grootgenoot uit je eigen stadsdeel is dichtbij voor gezelschap en praktische hulp: samen een ommetje door park Sonsbeek, boodschappen doen of gewoon even bijkletsen.",
    buurten: [
      "Spijkerkwartier",
      "Klarendal",
      "Presikhaaf",
      "Schuytgraaf",
      "Rijkerswoerd",
      "Malburgen",
      "Elden",
      "Geitenkamp",
    ],
    nabij: ["velp", "rozendaal", "westervoort", "oosterbeek"],
  },
  {
    slug: "nijmegen",
    naam: "Nijmegen",
    gemeente: "Nijmegen",
    intro:
      "Nijmegen is een levendige stad met veel oudere inwoners in wijken als Nijmegen-Oost, Bottendaal, Hatert, Grootstal, Dukenburg en Lent. Onze grootgenoten uit de buurt bieden gezelschap en ondersteuning die geen medische zorg is: een wandeling langs de Waal, hulp in huis of samen naar een afspraak.",
    buurten: [
      "Nijmegen-Oost",
      "Bottendaal",
      "Hunnerberg",
      "Hatert",
      "Grootstal",
      "Dukenburg",
      "Lent",
    ],
    nabij: ["elst", "bemmel", "huissen"],
  },
  {
    slug: "velp",
    naam: "Velp",
    gemeente: "Rheden",
    intro:
      "Velp ligt aan de voet van Nationaal Park Veluwezoom, een fijne plek om ouder te worden. Een grootgenoot uit Velp is dichtbij voor een wandeling richting Beekhuizen, samen boodschappen of gewoon goed gezelschap thuis.",
    buurten: ["Velp-Zuid", "Velp-Noord", "Overbeek"],
    nabij: ["rozendaal", "rheden", "arnhem", "de-steeg"],
  },
  {
    slug: "rheden",
    naam: "Rheden",
    gemeente: "Rheden",
    intro:
      "Het dorp Rheden ligt tussen de IJssel en de heuvels van de Veluwezoom, met de Posbank op wandelafstand. Een grootgenoot uit de buurt helpt met gezelschap, een uitje in de natuur of praktische klussen thuis.",
    buurten: [],
    nabij: ["de-steeg", "velp", "dieren", "ellecom"],
  },
  {
    slug: "de-steeg",
    naam: "De Steeg",
    gemeente: "Rheden",
    intro:
      "De Steeg is een klein, groen dorp in de gemeente Rheden, bekend om landgoed Middachten. Juist in zo'n kleine kern is een vertrouwd gezicht uit de buurt goud waard: iemand die langskomt voor gezelschap, een wandeling of hulp in en om het huis.",
    buurten: [],
    nabij: ["ellecom", "rheden", "dieren", "velp"],
  },
  {
    slug: "ellecom",
    naam: "Ellecom",
    gemeente: "Rheden",
    intro:
      "Ellecom is een van de kleinste dorpen langs de Veluwezoom, tussen De Steeg en Dieren. Een grootgenoot uit de directe omgeving is dichtbij voor gezelschap en ondersteuning, zodat je prettig zelfstandig kunt blijven wonen.",
    buurten: [],
    nabij: ["de-steeg", "dieren", "rheden"],
  },
  {
    slug: "dieren",
    naam: "Dieren",
    gemeente: "Rheden",
    intro:
      "Dieren is de grootste kern van de gemeente Rheden, gelegen aan de IJssel en het Apeldoorns Kanaal. Onze grootgenoten uit Dieren en omgeving bieden gezelschap, hulp bij boodschappen en een luisterend oor dichtbij.",
    buurten: ["Dieren-Noord", "Dieren-Zuid", "Dieren-West"],
    nabij: ["spankeren", "ellecom", "rheden"],
  },
  {
    slug: "spankeren",
    naam: "Spankeren",
    gemeente: "Rheden",
    intro:
      "Spankeren is een klein dorp bij Dieren in de gemeente Rheden. In zo'n kleine gemeenschap maakt een grootgenoot uit de buurt echt verschil: gezelschap, een wandeling of praktische hulp, altijd door iemand dichtbij.",
    buurten: [],
    nabij: ["dieren", "rheden", "ellecom"],
  },
  {
    slug: "rozendaal",
    naam: "Rozendaal",
    gemeente: "Rozendaal",
    intro:
      "Rozendaal is de kleinste gemeente van Gelderland, groen en rustig gelegen bij kasteel Rosendael, direct naast Velp en Arnhem. Een grootgenoot uit de buurt is zo bij je voor gezelschap of hulp in en om het huis.",
    buurten: [],
    nabij: ["velp", "arnhem"],
  },
  {
    slug: "oosterbeek",
    naam: "Oosterbeek",
    gemeente: "Renkum",
    intro:
      "Oosterbeek, in de gemeente Renkum, ligt fraai tussen bos en de uiterwaarden van de Rijn. Een grootgenoot uit de buurt biedt gezelschap en ondersteuning, van een wandeling over de Airborne-paden tot praktische hulp thuis.",
    buurten: [],
    nabij: ["renkum", "arnhem"],
  },
  {
    slug: "renkum",
    naam: "Renkum",
    gemeente: "Renkum",
    intro:
      "Renkum ligt aan de Rijn, tussen de bossen van de Zuidwest-Veluwe. Onze grootgenoten uit Renkum en Oosterbeek helpen met gezelschap, boodschappen en kleine klussen, zodat je fijn zelfstandig blijft.",
    buurten: [],
    nabij: ["oosterbeek", "arnhem"],
  },
  {
    slug: "elst",
    naam: "Elst",
    gemeente: "Overbetuwe",
    intro:
      "Elst ligt precies tussen Arnhem en Nijmegen, in de gemeente Overbetuwe. Een grootgenoot uit de Betuwe is dichtbij voor gezelschap, vervoer naar een afspraak of hulp in huis.",
    buurten: [],
    nabij: ["nijmegen", "bemmel", "huissen", "arnhem"],
  },
  {
    slug: "huissen",
    naam: "Huissen",
    gemeente: "Lingewaard",
    intro:
      "Huissen, in de gemeente Lingewaard, ligt aan de Nederrijn vlak bij Arnhem. Een grootgenoot uit de buurt biedt gezelschap en praktische ondersteuning, of dat nu samen koken is of een ommetje langs de dijk.",
    buurten: [],
    nabij: ["bemmel", "elst", "arnhem", "nijmegen"],
  },
  {
    slug: "bemmel",
    naam: "Bemmel",
    gemeente: "Lingewaard",
    intro:
      "Bemmel is de grootste kern van de gemeente Lingewaard, tussen Arnhem en Nijmegen in de Betuwe. Onze grootgenoten helpen dichtbij met gezelschap, boodschappen en een luisterend oor.",
    buurten: [],
    nabij: ["huissen", "elst", "nijmegen"],
  },
  {
    slug: "duiven",
    naam: "Duiven",
    gemeente: "Duiven",
    intro:
      "Duiven ligt ten oosten van Arnhem, aan de rand van de Liemers. Een grootgenoot uit Duiven of Westervoort is snel bij je voor gezelschap of hulp in en om het huis.",
    buurten: [],
    nabij: ["westervoort", "zevenaar", "arnhem"],
  },
  {
    slug: "westervoort",
    naam: "Westervoort",
    gemeente: "Westervoort",
    intro:
      "Westervoort ligt direct ten oosten van Arnhem, waar de IJssel en de Rijn samenkomen. Een grootgenoot uit de buurt biedt gezelschap en praktische ondersteuning dichtbij huis.",
    buurten: [],
    nabij: ["duiven", "arnhem", "zevenaar"],
  },
  {
    slug: "zevenaar",
    naam: "Zevenaar",
    gemeente: "Zevenaar",
    intro:
      "Zevenaar is het hart van de Liemers, ten oosten van Arnhem. Onze grootgenoten uit Zevenaar en omgeving helpen met gezelschap, vervoer naar afspraken en hulp in huis.",
    buurten: [],
    nabij: ["duiven", "westervoort"],
  },
];

export function plaatsBySlug(slug: string): Plaats | undefined {
  return PLAATSEN.find((p) => p.slug === slug);
}
