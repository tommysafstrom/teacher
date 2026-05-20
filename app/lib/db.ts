import fs from "fs";
import path from "path";
import type { DB, Kid, Screening, Diagnosis, Material, User, Request, Response, Reminder } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Simple write-lock via a module-level promise chain
let writeChain: Promise<void> = Promise.resolve();

export function readDB(): DB {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  return {
    kids: parsed.kids ?? [],
    library: parsed.library ?? [],
    users: parsed.users ?? [],
    requests: parsed.requests ?? [],
    responses: parsed.responses ?? [],
    reminders: parsed.reminders ?? [],
  } as DB;
}

export function writeDB(db: DB): Promise<void> {
  writeChain = writeChain.then(
    () =>
      new Promise<void>((resolve, reject) => {
        try {
          fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
          resolve();
        } catch (err) {
          reject(err);
        }
      })
  );
  return writeChain;
}

// --- Kid helpers ---

export function getKids(): Kid[] {
  return readDB().kids;
}

export function getKid(id: string): Kid | undefined {
  return readDB().kids.find((k) => k.id === id);
}

export function updateKid(id: string, updater: (kid: Kid) => Kid): Promise<void> {
  const db = readDB();
  const idx = db.kids.findIndex((k) => k.id === id);
  if (idx === -1) throw new Error(`Kid ${id} not found`);
  db.kids[idx] = updater(db.kids[idx]);
  return writeDB(db);
}

// --- Screening helpers ---

export async function addScreening(kidId: string, screening: Screening): Promise<void> {
  return updateKid(kidId, (kid) => ({
    ...kid,
    screenings: [...kid.screenings, screening],
  }));
}

// --- Diagnosis helpers ---

export async function addDiagnosis(kidId: string, diagnosis: Diagnosis): Promise<void> {
  return updateKid(kidId, (kid) => ({
    ...kid,
    diagnoses: [...kid.diagnoses, diagnosis],
  }));
}

export async function removeDiagnosis(kidId: string, diagnosisId: string): Promise<void> {
  return updateKid(kidId, (kid) => ({
    ...kid,
    diagnoses: kid.diagnoses.filter((d) => d.id !== diagnosisId),
  }));
}

// --- User helpers ---

export function getUsers(): User[] {
  return readDB().users;
}

export function getUser(id: string): User | undefined {
  return readDB().users.find((u) => u.id === id);
}

// --- Request helpers ---

export function getRequests(): Request[] {
  return readDB().requests;
}

export function getRequest(id: string): Request | undefined {
  return readDB().requests.find((r) => r.id === id);
}

export function addRequest(request: Request): Promise<void> {
  const db = readDB();
  db.requests.push(request);
  return writeDB(db);
}

export function updateRequest(id: string, updater: (req: Request) => Request): Promise<void> {
  const db = readDB();
  const idx = db.requests.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Request ${id} not found`);
  db.requests[idx] = updater(db.requests[idx]);
  return writeDB(db);
}

// --- Response helpers ---

export function getResponses(): Response[] {
  return readDB().responses;
}

export function getResponse(requestId: string, supplierId: string, kidId: string): Response | undefined {
  return readDB().responses.find(
    (r) => r.requestId === requestId && r.supplierId === supplierId && r.kidId === kidId
  );
}

export function upsertResponse(response: Response): Promise<void> {
  const db = readDB();
  const idx = db.responses.findIndex(
    (r) => r.requestId === response.requestId && r.supplierId === response.supplierId && r.kidId === response.kidId
  );
  if (idx === -1) {
    db.responses.push(response);
  } else {
    db.responses[idx] = response;
  }
  return writeDB(db);
}

// --- Reminder helpers ---

export function getReminders(): Reminder[] {
  return readDB().reminders;
}

export function addReminder(reminder: Reminder): Promise<void> {
  const db = readDB();
  db.reminders.push(reminder);
  return writeDB(db);
}

// --- Material helpers ---

export function getMaterials(): Material[] {
  return readDB().library;
}

export function getMaterialsByChallenge(challenges: string[]): Material[] {
  const library = readDB().library;
  return library.filter((m) =>
    m.challenges.some((c) => challenges.includes(c))
  );
}
