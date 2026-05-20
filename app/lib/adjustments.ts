import type { Kid, Adjustment, Challenge } from "./types";
import { getMaterialsByChallenge } from "./db";

interface AdjustmentRule {
  area: Adjustment["area"];
  tip: string;
  triggers: Challenge[];
}

const RULES: AdjustmentRule[] = [
  // Klassrumsmiljö
  {
    area: "klassrumsmiljö",
    tip: "Placera eleven nära tavlan och läraren, långt från distraherande miljöer (fönster, dörr).",
    triggers: ["adhd", "uppmärksamhetsliknande", "impulsivitetsliknande"],
  },
  {
    area: "klassrumsmiljö",
    tip: "Sätt upp ett visuellt dagsschema i klassrummet så att eleven alltid vet vad som händer härnäst.",
    triggers: ["autismspektrum", "planeringsliknande", "flexibilitetsliknande"],
  },
  {
    area: "klassrumsmiljö",
    tip: "Erbjud rörelsepaus var 20:e minut för att återhämta fokus.",
    triggers: ["adhd", "uppmärksamhetsliknande", "impulsivitetsliknande"],
  },
  {
    area: "klassrumsmiljö",
    tip: "Minimera bakgrundsljud och visuell röra – använd skärmar eller avskärmning vid behov.",
    triggers: ["autismspektrum", "sinnesintrycksliknande", "uppmärksamhetsliknande"],
  },

  // Bemötande
  {
    area: "bemötande",
    tip: "Ge tydliga, korta instruktioner en i taget. Undvik långa meningar med flera steg.",
    triggers: ["adhd", "uppmärksamhetsliknande", "autismspektrum", "planeringsliknande"],
  },
  {
    area: "bemötande",
    tip: "Förvarna alltid om ändringar i rutin i god tid. Överraskningar kan skapa oro.",
    triggers: ["autismspektrum", "flexibilitetsliknande"],
  },
  {
    area: "bemötande",
    tip: "Använd ett lugnt, jämnt tonläge. Undvik ironi och bildspråk som kan missförstås.",
    triggers: ["autismspektrum", "kommunikationsliknande"],
  },
  {
    area: "bemötande",
    tip: "Ge positiv bekräftelse direkt när eleven gör rätt – inte enbart när något går fel.",
    triggers: ["adhd", "uppmärksamhetsliknande", "kommunikationsliknande"],
  },
  {
    area: "bemötande",
    tip: "Upprepa och sammanfatta viktiga instruktioner skriftligt på tavlan eller som lapp.",
    triggers: ["planeringsliknande", "lässvårighetsliknande", "dyslexi"],
  },
  {
    area: "bemötande",
    tip: "Hjälp eleven att sätta ord på känslor och ge strategier för att kommunicera behov.",
    triggers: ["kommunikationsliknande", "autismspektrum", "språkstörning"],
  },

  // Ämne
  {
    area: "ämne",
    tip: "Erbjud inläst material och filmer som komplement till textboken.",
    triggers: ["dyslexi", "lässvårighetsliknande"],
  },
  {
    area: "ämne",
    tip: "Tillåt eleven att lyssna på böcker eller använda talsyntes.",
    triggers: ["dyslexi", "lässvårighetsliknande"],
  },
  {
    area: "ämne",
    tip: "Använd konkret material och bilder för att förklara abstrakta matematiska begrepp.",
    triggers: ["dyskalkyli", "planeringsliknande"],
  },
  {
    area: "ämne",
    tip: "Dela upp skrivuppgifter i mindre delar med tydliga delmål och deadlines.",
    triggers: ["dyslexi", "adhd", "uppmärksamhetsliknande", "planeringsliknande"],
  },
  {
    area: "ämne",
    tip: "Använd TimeTimer eller annan visuell klocka för att göra tidsåtgång konkret.",
    triggers: ["tidsuppfattningsliknande", "adhd"],
  },

  // Lektionsstruktur
  {
    area: "lektionsstruktur",
    tip: "Starta alltid lektionen med en tydlig agenda: vad ska vi göra, hur länge, och vad händer sen.",
    triggers: ["autismspektrum", "planeringsliknande", "flexibilitetsliknande", "adhd"],
  },
  {
    area: "lektionsstruktur",
    tip: "Bryt ner arbetspasset i korta block (10–15 min) med tydliga avslut och nya starter.",
    triggers: ["adhd", "uppmärksamhetsliknande", "impulsivitetsliknande"],
  },
  {
    area: "lektionsstruktur",
    tip: "Avsluta alltid lektionen med en kort sammanfattning av vad som gjordes.",
    triggers: ["planeringsliknande", "flexibilitetsliknande", "autismspektrum"],
  },
  {
    area: "lektionsstruktur",
    tip: "Ge eleven extra tid på prov och inlämningar utan att det betonas inför klassen.",
    triggers: ["dyslexi", "dyskalkyli", "lässvårighetsliknande", "tidsuppfattningsliknande"],
  },
  {
    area: "lektionsstruktur",
    tip: "Förbered eleven på aktivitetsskiften med en tydlig förvarning (t.ex. \"om 5 minuter byter vi\").",
    triggers: ["flexibilitetsliknande", "autismspektrum", "tidsuppfattningsliknande"],
  },
];

export function deriveAdjustments(kid: Kid): Adjustment[] {
  const challenges = new Set<Challenge>();

  kid.diagnoses.forEach((d) => challenges.add(d.label as Challenge));
  kid.screenings.forEach((s) =>
    s.traits.forEach((t) => challenges.add(t as Challenge))
  );

  if (challenges.size === 0) return [];

  const challengeList = Array.from(challenges);
  const materials = getMaterialsByChallenge(challengeList);

  const adjustments: Adjustment[] = RULES.filter((rule) =>
    rule.triggers.some((t) => challenges.has(t))
  ).map((rule) => {
    const relatedMaterialIds = materials
      .filter((m) => m.challenges.some((c) => rule.triggers.includes(c as Challenge)))
      .map((m) => m.id);

    return {
      area: rule.area,
      tip: rule.tip,
      materialIds: relatedMaterialIds,
    };
  });

  return adjustments;
}
