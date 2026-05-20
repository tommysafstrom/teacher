export type ScreeningTrait =
  | "kommunikationsliknande"
  | "planeringsliknande"
  | "sinnesintrycksliknande"
  | "uppmärksamhetsliknande"
  | "impulsivitetsliknande"
  | "tidsuppfattningsliknande"
  | "flexibilitetsliknande";

export type DiagnosisLabel =
  | "dyslexi"
  | "adhd"
  | "autismspektrum"
  | "dyskalkyli"
  | "språkstörning";

export type MaterialType = "video" | "mall" | "tips" | "artikel";

export type Challenge =
  | "dyslexi"
  | "adhd"
  | "autismspektrum"
  | "dyskalkyli"
  | "språkstörning"
  | "kommunikationsliknande"
  | "planeringsliknande"
  | "sinnesintrycksliknande"
  | "uppmärksamhetsliknande"
  | "impulsivitetsliknande"
  | "tidsuppfattningsliknande"
  | "flexibilitetsliknande"
  | "lässvårighetsliknande"; // retained for library entries

export interface ScreeningAnswer {
  questionId: string;
  checked: boolean;
}

export interface Screening {
  id: string;
  date: string; // ISO date
  traits: ScreeningTrait[];
  answers: ScreeningAnswer[];
  summary: string;
}

export interface Diagnosis {
  id: string;
  date: string;
  label: DiagnosisLabel;
}

export interface Kid {
  id: string;
  label: string;
  notes: string;
  screenings: Screening[];
  diagnoses: Diagnosis[];
}

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  challenges: Challenge[];
  subject: string;
  url?: string;
  description: string;
}

export interface DB {
  kids: Kid[];
  library: Material[];
}

export interface Adjustment {
  area: "klassrumsmiljö" | "bemötande" | "ämne" | "lektionsstruktur";
  tip: string;
  materialIds: string[];
}
