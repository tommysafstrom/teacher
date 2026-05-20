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

export type UserRole = "supplier" | "requester";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Request {
  id: string;
  requesterId: string;
  kidIds: string[];
  supplierIds: string[];
  note: string;
  dueDate?: string;
  createdAt: string;
  status: "active" | "closed";
}

export interface Response {
  id: string;
  requestId: string;
  supplierId: string;
  kidId: string;
  answers: Record<string, string>;
  submittedAt?: string;
  lastActivityAt: string;
}

export interface Reminder {
  id: string;
  requestId: string;
  supplierId: string;
  sentAt: string;
}

export interface DB {
  kids: Kid[];
  library: Material[];
  users: User[];
  requests: Request[];
  responses: Response[];
  reminders: Reminder[];
}

export interface Adjustment {
  area: "klassrumsmiljö" | "bemötande" | "ämne" | "lektionsstruktur";
  tip: string;
  materialIds: string[];
}
