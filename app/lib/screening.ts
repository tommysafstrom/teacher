import type { ScreeningTrait, ScreeningAnswer } from "./types";

export type Field = 1 | 2 | 3 | 4;

export interface Question {
  id: string;
  area: string;
  subArea: string;
  field: Field;
  text: string;
}

export const AREA_LABELS: Record<string, string> = {
  kommunikation: "Kommunikation och information",
  planering: "Planering och organisation",
  sinnesintryck: "Sinnesintryck och motorik",
  uppmärksamhet: "Uppmärksamhet",
  impulsivitet: "Impulsivitet och aktivitet",
  tidsuppfattning: "Tidsuppfattning",
  flexibilitet: "Flexibilitet",
};

export const QUESTIONS: Question[] = [
  // ── Area: kommunikation ──────────────────────────────────────────────────
  // Field 1 — Förmåga att bearbeta och förstå
  { id: "q1",  area: "kommunikation", subArea: "Förmåga att bearbeta och förstå", field: 1,
    text: "förstå underförstådda budskap, sarkasm och ironi och uttryck som att \"kasta ett öga på\"" },
  { id: "q2",  area: "kommunikation", subArea: "Förmåga att bearbeta och förstå", field: 1,
    text: "plocka ut det väsentligaste i ett samtal och/eller ur en text och bortse från det som är oväsentligt" },

  // Field 2 — Förmåga att kommunicera egna behov
  { id: "q3",  area: "kommunikation", subArea: "Förmåga att kommunicera egna behov", field: 2,
    text: "beskriva något han/hon varit med om, sett eller läst – svårt att förklara \"varför\" och \"hur\"" },
  { id: "q4",  area: "kommunikation", subArea: "Förmåga att kommunicera egna behov", field: 2,
    text: "uttrycka vad han/hon vill, alternativt inte vill, samt be om hjälp" },
  { id: "q5",  area: "kommunikation", subArea: "Förmåga att kommunicera egna behov", field: 2,
    text: "ställa frågor för att få information och kunna lösa problem – svårt att dra egna slutsatser" },
  { id: "q6",  area: "kommunikation", subArea: "Förmåga att kommunicera egna behov", field: 2,
    text: "sätta ord på sina känslor och tankar, att få omgivningen att förstå hur han/hon upplever något" },

  // Field 3 — Förmåga att förstå andras behov och perspektiv
  { id: "q7",  area: "kommunikation", subArea: "Förmåga att förstå andras behov och perspektiv", field: 3,
    text: "läsa av och tolka sociala signaler – uppfattar inte nyanser i ett samtal, missförstår ofta" },
  { id: "q8",  area: "kommunikation", subArea: "Förmåga att förstå andras behov och perspektiv", field: 3,
    text: "sätta sig in i och förstå andras sätt att tänka, förstå andras avsikter, veta vad man förväntas säga/göra" },
  { id: "q9",  area: "kommunikation", subArea: "Förmåga att förstå andras behov och perspektiv", field: 3,
    text: "föreställa sig och förstå hur han/hon uppfattas av andra i det han/hon säger och gör" },
  { id: "q10", area: "kommunikation", subArea: "Förmåga att förstå andras behov och perspektiv", field: 3,
    text: "avgöra vad som är lämpligt att säga och till vem samt när det kan vara lämpligt" },

  // Field 4 — Förmåga att delta i ett samtal
  { id: "q11", area: "kommunikation", subArea: "Förmåga att delta i ett samtal", field: 4,
    text: "inleda och avsluta ett samtal" },
  { id: "q12", area: "kommunikation", subArea: "Förmåga att delta i ett samtal", field: 4,
    text: "delta i samtal med flera personer – svårt att klara turtagning under ett samtal" },
  { id: "q13", area: "kommunikation", subArea: "Förmåga att delta i ett samtal", field: 4,
    text: "byta samtalsämne – svårt att anpassa samtalsämne utifrån sammanhanget, kan hålla långa monologer" },
  { id: "q14", area: "kommunikation", subArea: "Förmåga att delta i ett samtal", field: 4,
    text: "hålla sig till ämnet, lyssna färdigt och låta andra komma till tals – avbryter ofta" },
  { id: "q15", area: "kommunikation", subArea: "Förmåga att delta i ett samtal", field: 4,
    text: "hålla tillbaka impulser att säga olämpligheter" },

  // ── Area: planering ──────────────────────────────────────────────────────
  // Field 1 — Förmåga att organisera uppgifter
  { id: "q16", area: "planering", subArea: "Förmåga att organisera uppgifter", field: 1,
    text: "få överblick och veta i vilken ordning uppgifter ska göras" },
  { id: "q17", area: "planering", subArea: "Förmåga att organisera uppgifter", field: 1,
    text: "planera och handla målinriktat, kunna följa och uppnå ett mål" },
  { id: "q18", area: "planering", subArea: "Förmåga att organisera uppgifter", field: 1,
    text: "skapa struktur på egen hand" },
  { id: "q19", area: "planering", subArea: "Förmåga att organisera uppgifter", field: 1,
    text: "prioritera vad som är viktigast att göra" },
  { id: "q20", area: "planering", subArea: "Förmåga att organisera uppgifter", field: 1,
    text: "föreställa sig, få bilder i huvudet av hur man kan göra" },

  // Field 2 — Förmåga till problemlösning, konsekvensförståelse och sammanhangsförståelse
  { id: "q21", area: "planering", subArea: "Förmåga till problemlösning och konsekvensförståelse", field: 2,
    text: "föreställa sig flera lösningar på ett problem" },
  { id: "q22", area: "planering", subArea: "Förmåga till problemlösning och konsekvensförståelse", field: 2,
    text: "komma vidare med något och hitta en ny lösning" },
  { id: "q23", area: "planering", subArea: "Förmåga till problemlösning och konsekvensförståelse", field: 2,
    text: "förutse ett resultat eller konsekvenser (om jag gör så här blir det så här)" },
  { id: "q24", area: "planering", subArea: "Förmåga till problemlösning och konsekvensförståelse", field: 2,
    text: "reflektera över något bakåt i tiden, t.ex. se vad han/hon har åstadkommit" },
  { id: "q25", area: "planering", subArea: "Förmåga till problemlösning och konsekvensförståelse", field: 2,
    text: "lära av erfarenhet (förra gången jag gjorde så här, blev det så här)" },
  { id: "q26", area: "planering", subArea: "Förmåga till problemlösning och konsekvensförståelse", field: 2,
    text: "förstå sammanhang – bra på att se detaljer men svårt att få ihop information till en helhet" },

  // Field 3 — Förmåga att komma igång och avsluta
  { id: "q27", area: "planering", subArea: "Förmåga att komma igång och avsluta", field: 3,
    text: "komma i gång med en uppgift" },
  { id: "q28", area: "planering", subArea: "Förmåga att komma igång och avsluta", field: 3,
    text: "upprätthålla motivationen och bli klar med en uppgift" },
  { id: "q29", area: "planering", subArea: "Förmåga att komma igång och avsluta", field: 3,
    text: "komma vidare om han/hon blivit avledd eller störd" },
  { id: "q30", area: "planering", subArea: "Förmåga att komma igång och avsluta", field: 3,
    text: "avsluta när han/hon kommit i gång" },

  // Field 4 — Förmåga att komma ihåg
  { id: "q31", area: "planering", subArea: "Förmåga att komma ihåg", field: 4,
    text: "hålla flera saker i minnet samtidigt" },
  { id: "q32", area: "planering", subArea: "Förmåga att komma ihåg", field: 4,
    text: "hålla reda på sina saker – tappar bort saker, glömmer att ta med" },

  // ── Area: sinnesintryck ──────────────────────────────────────────────────
  // Field 1 — Förmåga att hantera ljud och synintryck
  { id: "q33", area: "sinnesintryck", subArea: "Förmåga att hantera ljud och synintryck", field: 1,
    text: "höra vad någon säger om det finns bakgrundsljud" },
  { id: "q34", area: "sinnesintryck", subArea: "Förmåga att hantera ljud och synintryck", field: 1,
    text: "hantera vissa specifika ljud (t.ex. surrande fläktar, tickande klockor, barnskrik, klirrande bestick)" },
  { id: "q35", area: "sinnesintryck", subArea: "Förmåga att hantera ljud och synintryck", field: 1,
    text: "vistas i miljöer med mycket synintryck (t.ex. mycket bilder på väggarna)" },
  { id: "q36", area: "sinnesintryck", subArea: "Förmåga att hantera ljud och synintryck", field: 1,
    text: "hantera specifika synintryck (t.ex. starkt solljus)" },
  { id: "q37", area: "sinnesintryck", subArea: "Förmåga att hantera ljud och synintryck", field: 1,
    text: "bedöma avstånd" },

  // Field 2 — Förmåga att hantera lukter, smak och känselintryck
  { id: "q38", area: "sinnesintryck", subArea: "Förmåga att hantera lukter, smak och känselintryck", field: 2,
    text: "hantera vissa specifika känselintryck (t.ex. vissa textilier, beröring)" },
  { id: "q39", area: "sinnesintryck", subArea: "Förmåga att hantera lukter, smak och känselintryck", field: 2,
    text: "hantera vissa specifika konsistenser (t.ex. gröt, fil, mat med klumpar)" },
  { id: "q40", area: "sinnesintryck", subArea: "Förmåga att hantera lukter, smak och känselintryck", field: 2,
    text: "hantera vissa smaker på mat" },
  { id: "q41", area: "sinnesintryck", subArea: "Förmåga att hantera lukter, smak och känselintryck", field: 2,
    text: "hantera vissa lukter" },

  // Field 3 — Balans och kroppssinne
  { id: "q42", area: "sinnesintryck", subArea: "Balans och kroppssinne", field: 3,
    text: "avgöra hur mycket styrka man behöver använda till en uppgift" },
  { id: "q43", area: "sinnesintryck", subArea: "Balans och kroppssinne", field: 3,
    text: "hålla kroppen i upprätt position längre stunder (t.ex. sjunker ihop över skolbänken)" },
  { id: "q44", area: "sinnesintryck", subArea: "Balans och kroppssinne", field: 3,
    text: "känna var kroppen finns i förhållande till rummet (t.ex. känsla av att falla när han/hon ligger ner)" },
  { id: "q45", area: "sinnesintryck", subArea: "Balans och kroppssinne", field: 3,
    text: "hålla balansen" },

  // Field 4 — Motorisk automatisering
  { id: "q46", area: "sinnesintryck", subArea: "Motorisk automatisering", field: 4,
    text: "utföra motoriska rörelser utan att hela tiden behöva tänka på det (kan visa sig vid t.ex. skrivande eller hemkunskap)" },

  // ── Area: uppmärksamhet ──────────────────────────────────────────────────
  // Field 1 — Förmåga att rikta sin uppmärksamhet
  { id: "q47", area: "uppmärksamhet", subArea: "Förmåga att rikta sin uppmärksamhet", field: 1,
    text: "rikta sin uppmärksamhet mot det som är väsentligt – verkar inte lyssna, gör ofta slarvfel" },
  { id: "q48", area: "uppmärksamhet", subArea: "Förmåga att rikta sin uppmärksamhet", field: 1,
    text: "dela sin uppmärksamhet på flera saker samtidigt" },
  { id: "q49", area: "uppmärksamhet", subArea: "Förmåga att rikta sin uppmärksamhet", field: 1,
    text: "filtrera bort oväsentliga intryck – störs av yttre stimuli, avleds och är lättdistraherad" },

  // Field 2 — Förmåga att hålla kvar uppmärksamheten
  { id: "q50", area: "uppmärksamhet", subArea: "Förmåga att hålla kvar uppmärksamheten", field: 2,
    text: "behålla uppmärksamheten över längre tid – blir inte klar, trötnar eller undviker uppgifter" },
  { id: "q51", area: "uppmärksamhet", subArea: "Förmåga att hålla kvar uppmärksamheten", field: 2,
    text: "uppfatta det som sägs under ett samtal eller en lektion" },
  { id: "q52", area: "uppmärksamhet", subArea: "Förmåga att hålla kvar uppmärksamheten", field: 2,
    text: "hålla den röda tråden i det han/hon tänker/säger eller någon annan säger" },
  { id: "q53", area: "uppmärksamhet", subArea: "Förmåga att hålla kvar uppmärksamheten", field: 2,
    text: "fokusera – kommer hela tiden på sidospår, börjar göra något annat" },

  // Field 3 — Förmåga att följa instruktioner
  { id: "q54", area: "uppmärksamhet", subArea: "Förmåga att följa instruktioner", field: 3,
    text: "uppfatta och följa muntliga instruktioner" },
  { id: "q55", area: "uppmärksamhet", subArea: "Förmåga att följa instruktioner", field: 3,
    text: "uppfatta och följa skriftliga instruktioner" },

  // Field 4 — Förmåga att skifta uppmärksamhet
  { id: "q56", area: "uppmärksamhet", subArea: "Förmåga att skifta uppmärksamhet", field: 4,
    text: "skifta uppmärksamhet – att gå från en uppgift till en annan" },
  { id: "q57", area: "uppmärksamhet", subArea: "Förmåga att skifta uppmärksamhet", field: 4,
    text: "återvända till en uppgift – vet inte var han/hon var" },

  // ── Area: impulsivitet ───────────────────────────────────────────────────
  // Field 1 — Förmåga att hejda impulser
  { id: "q58", area: "impulsivitet", subArea: "Förmåga att hejda impulser", field: 1,
    text: "tänka innan han/hon agerar – är extremt handlingsbenägen och otålig" },
  { id: "q59", area: "impulsivitet", subArea: "Förmåga att hejda impulser", field: 1,
    text: "hålla tillbaka impulser att göra något olämpligt" },
  { id: "q60", area: "impulsivitet", subArea: "Förmåga att hejda impulser", field: 1,
    text: "hålla tillbaka impulser att säga något olämpligt eller att inte avbryta" },
  { id: "q61", area: "impulsivitet", subArea: "Förmåga att hejda impulser", field: 1,
    text: "styra sina känslor – reagerar på allt, stort som smått" },

  // Field 2 — Förmåga att vänta
  { id: "q62", area: "impulsivitet", subArea: "Förmåga att vänta", field: 2,
    text: "vänta – vill att allt ska ske NU" },
  { id: "q63", area: "impulsivitet", subArea: "Förmåga att vänta", field: 2,
    text: "vänta på sin tur" },
  { id: "q64", area: "impulsivitet", subArea: "Förmåga att vänta", field: 2,
    text: "vänta på respons och feedback" },

  // Field 3 — Förmåga att reglera aktivitetsnivå / går på högvarv
  { id: "q65", area: "impulsivitet", subArea: "Aktivitetsnivå – går på högvarv", field: 3,
    text: "vara \"lagom\" – går på högvarv, är alltid \"på\"" },
  { id: "q66", area: "impulsivitet", subArea: "Aktivitetsnivå – går på högvarv", field: 3,
    text: "hålla sig stilla – är rastlös, klättrar och springer omkring, pillar på saker, trummar med fingrarna" },
  { id: "q67", area: "impulsivitet", subArea: "Aktivitetsnivå – går på högvarv", field: 3,
    text: "lyssna in andra – pratar oavbrutet, svarar innan frågan är avslutad" },
  { id: "q68", area: "impulsivitet", subArea: "Aktivitetsnivå – går på högvarv", field: 3,
    text: "hushålla med sin energi – kan vara i gång för länge och blir till slut utmattad" },
  { id: "q69", area: "impulsivitet", subArea: "Aktivitetsnivå – går på högvarv", field: 3,
    text: "slappna av och varva ner" },

  // Field 4 — Förmåga att reglera aktivitetsnivå / går på lågvarv
  { id: "q70", area: "impulsivitet", subArea: "Aktivitetsnivå – går på lågvarv", field: 4,
    text: "hitta lämplig aktivitetsnivå – går på lågvarv, är långsam, verkar sakna energi" },
  { id: "q71", area: "impulsivitet", subArea: "Aktivitetsnivå – går på lågvarv", field: 4,
    text: "komma i gång – saknar handlingskraft och \"startmotor\", kan uppfattas som lat eller passiv" },
  { id: "q72", area: "impulsivitet", subArea: "Aktivitetsnivå – går på lågvarv", field: 4,
    text: "delta aktivt – dagdrömmar och ser ut att befinna sig i en annan värld" },
  { id: "q73", area: "impulsivitet", subArea: "Aktivitetsnivå – går på lågvarv", field: 4,
    text: "finna ro – upplever stark inre rastlöshet" },

  // ── Area: tidsuppfattning ────────────────────────────────────────────────
  // Field 1 — Upplevelse av tid
  { id: "q74", area: "tidsuppfattning", subArea: "Upplevelse av tid", field: 1,
    text: "känna av tid och förstå hur lång tid som passerat – saknar \"inre klocka\"" },
  { id: "q75", area: "tidsuppfattning", subArea: "Upplevelse av tid", field: 1,
    text: "förstå vad vi menar med \"snart\", \"strax\", \"senare\", \"om en stund\"" },

  // Field 2 — Tidsorientering
  { id: "q76", area: "tidsuppfattning", subArea: "Tidsorientering", field: 2,
    text: "förstå begrepp som dag, datum, månad, år" },
  { id: "q77", area: "tidsuppfattning", subArea: "Tidsorientering", field: 2,
    text: "förstå begrepp som i förrgår, i övermorgon" },
  { id: "q78", area: "tidsuppfattning", subArea: "Tidsorientering", field: 2,
    text: "hålla reda på vilken dag det är" },
  { id: "q79", area: "tidsuppfattning", subArea: "Tidsorientering", field: 2,
    text: "avläsa och förstå klockan" },
  { id: "q80", area: "tidsuppfattning", subArea: "Tidsorientering", field: 2,
    text: "avläsa och förstå tidtabeller" },

  // Field 3 — Tidsplanering
  { id: "q81", area: "tidsuppfattning", subArea: "Tidsplanering", field: 3,
    text: "beräkna tidsåtgång för olika uppgifter (t.ex. veta hur lång tid en skoluppgift tar)" },
  { id: "q82", area: "tidsuppfattning", subArea: "Tidsplanering", field: 3,
    text: "fördela tid mellan olika aktiviteter" },
  { id: "q83", area: "tidsuppfattning", subArea: "Tidsplanering", field: 3,
    text: "passa tider – kommer ofta för sent" },

  // Field 4 — Förmåga att anpassa sin tid till andras
  { id: "q84", area: "tidsuppfattning", subArea: "Förmåga att anpassa sin tid till andras", field: 4,
    text: "anpassa sin tid efter andra" },
  { id: "q85", area: "tidsuppfattning", subArea: "Förmåga att anpassa sin tid till andras", field: 4,
    text: "skynda sig" },

  // ── Area: flexibilitet ───────────────────────────────────────────────────
  // Field 1 — Förmåga att hantera övergångar
  { id: "q86", area: "flexibilitet", subArea: "Förmåga att hantera övergångar", field: 1,
    text: "hantera övergångar mellan aktiviteter – växla från en uppgift till en annan, att gå från A till B" },

  // Field 2 — Förmåga att hantera oförutsägbarhet och ovisshet
  { id: "q87", area: "flexibilitet", subArea: "Förmåga att hantera oförutsägbarhet och ovisshet", field: 2,
    text: "hantera oförutsägbarhet och ovisshet (t.ex. när en rutin ändras utan möjlighet att förbereda sig)" },
  { id: "q88", area: "flexibilitet", subArea: "Förmåga att hantera oförutsägbarhet och ovisshet", field: 2,
    text: "avvika från regler och rutiner" },
  { id: "q89", area: "flexibilitet", subArea: "Förmåga att hantera oförutsägbarhet och ovisshet", field: 2,
    text: "hantera nya miljöer" },
  { id: "q90", area: "flexibilitet", subArea: "Förmåga att hantera oförutsägbarhet och ovisshet", field: 2,
    text: "möta nya människor" },

  // Field 3 — Förmåga att hantera ostrukturerade situationer
  { id: "q91", area: "flexibilitet", subArea: "Förmåga att hantera ostrukturerade situationer", field: 3,
    text: "hantera ostrukturerade miljöer eller situationer (t.ex. att ha rast)" },
  { id: "q92", area: "flexibilitet", subArea: "Förmåga att hantera ostrukturerade situationer", field: 3,
    text: "fylla ut egen tid – komma på vad han/hon kan göra" },

  // Field 4 — Förmåga att byta tankespår
  { id: "q93", area: "flexibilitet", subArea: "Förmåga att byta tankespår", field: 4,
    text: "byta tankespår – fastnar i en tanke" },
  { id: "q94", area: "flexibilitet", subArea: "Förmåga att byta tankespår", field: 4,
    text: "hitta flexibla lösningar på olika problem" },
  { id: "q95", area: "flexibilitet", subArea: "Förmåga att byta tankespår", field: 4,
    text: "föreställa sig sådant som ska ske – får inga bilder i huvudet" },
  { id: "q96", area: "flexibilitet", subArea: "Förmåga att byta tankespår", field: 4,
    text: "kompromissa och anpassa sig efter andras idéer" },
  { id: "q97", area: "flexibilitet", subArea: "Förmåga att byta tankespår", field: 4,
    text: "uppfatta nyanser – har ett konkret \"svartvitt tänkande\"" },
];

const AREA_TRAIT: Record<string, ScreeningTrait> = {
  kommunikation:  "kommunikationsliknande",
  planering:      "planeringsliknande",
  sinnesintryck:  "sinnesintrycksliknande",
  uppmärksamhet:  "uppmärksamhetsliknande",
  impulsivitet:   "impulsivitetsliknande",
  tidsuppfattning:"tidsuppfattningsliknande",
  flexibilitet:   "flexibilitetsliknande",
};

export function deriveTraits(answers: ScreeningAnswer[]): ScreeningTrait[] {
  const checkedIds = new Set(answers.filter((a) => a.checked).map((a) => a.questionId));
  if (checkedIds.size === 0) return [];

  const activeAreas = new Set<string>();
  for (const q of QUESTIONS) {
    if (checkedIds.has(q.id)) activeAreas.add(q.area);
  }

  return Object.keys(AREA_LABELS)
    .filter((a) => activeAreas.has(a))
    .map((a) => AREA_TRAIT[a]);
}

export function buildSummary(traits: ScreeningTrait[], answers: ScreeningAnswer[]): string {
  const checkedIds = new Set(answers.filter((a) => a.checked).map((a) => a.questionId));
  const total = checkedIds.size;

  if (total === 0) return "Inga svårigheter markerade.";

  // Find lowest (most severe) field per area that has at least one checked item
  const areaSeverity: Record<string, Field> = {};
  for (const q of QUESTIONS) {
    if (checkedIds.has(q.id)) {
      const cur = areaSeverity[q.area];
      if (cur === undefined || q.field < cur) areaSeverity[q.area] = q.field;
    }
  }

  const field1 = Object.entries(areaSeverity)
    .filter(([, f]) => f === 1)
    .map(([a]) => AREA_LABELS[a] ?? a);
  const field2 = Object.entries(areaSeverity)
    .filter(([, f]) => f === 2)
    .map(([a]) => AREA_LABELS[a] ?? a);

  const parts: string[] = [];
  if (field1.length > 0) parts.push(`Fält 1 (röd): ${field1.join(", ")}`);
  if (field2.length > 0) parts.push(`Fält 2 (orange): ${field2.join(", ")}`);

  return `${total} observationer markerade.${parts.length > 0 ? " " + parts.join(". ") + "." : ""}`;
}
