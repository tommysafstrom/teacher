import fs from "fs";
import path from "path";
import type { DB, Kid, Screening, Diagnosis, Material } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Simple write-lock via a module-level promise chain
let writeChain: Promise<void> = Promise.resolve();

export function readDB(): DB {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DB;
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
