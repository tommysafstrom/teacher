"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Diagnosis, DiagnosisLabel } from "@/lib/types";

const DIAGNOSIS_OPTIONS: { label: DiagnosisLabel; display: string }[] = [
  { label: "dyslexi", display: "Dyslexi" },
  { label: "adhd", display: "ADHD" },
  { label: "autismspektrum", display: "Autismspektrum" },
  { label: "dyskalkyli", display: "Dyskalkyli" },
  { label: "språkstörning", display: "Språkstörning" },
];

export default function DiagnosePage() {
  const { id } = useParams<{ id: string }>();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadKid = useCallback(async () => {
    const res = await fetch(`/api/kids/${id}`);
    if (res.ok) {
      const kid = await res.json();
      setDiagnoses(kid.diagnoses);
    }
  }, [id]);

  useEffect(() => {
    loadKid();
  }, [loadKid]);

  const addDiagnosis = async (label: DiagnosisLabel) => {
    setAdding(true);
    setError(null);
    const res = await fetch(`/api/kids/${id}/diagnoses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (!res.ok) {
      setError("Kunde inte lägga till diagnosen.");
    } else {
      await loadKid();
    }
    setAdding(false);
  };

  const removeDiagnosis = async (diagnosisId: string) => {
    const res = await fetch(
      `/api/kids/${id}/diagnoses?diagnosisId=${encodeURIComponent(diagnosisId)}`,
      { method: "DELETE" }
    );
    if (res.ok) await loadKid();
  };

  const activeLabels = new Set(diagnoses.map((d) => d.label));

  return (
    <div>
      <div className="mb-6">
        <Link href={`/kids/${id}`} className="text-sm text-blue-600 hover:underline">
          ← Tillbaka till profil
        </Link>
        <h1 className="text-2xl font-bold mt-2">Diagnoser</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Lägg till eller ta bort diagnoser för eleven.
        </p>
      </div>

      {/* Active diagnoses */}
      <section className="mb-6">
        <h2 className="text-base font-semibold mb-2">Aktiva diagnoser</h2>
        {diagnoses.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Inga diagnoser registrerade.</p>
        ) : (
          <ul className="space-y-2">
            {diagnoses.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-4 py-2 text-sm"
              >
                <span className="font-medium capitalize">{d.label}</span>
                <span className="text-gray-400 dark:text-gray-500 mr-4">{d.date}</span>
                <button
                  onClick={() => removeDiagnosis(d.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add diagnosis */}
      <section>
        <h2 className="text-base font-semibold mb-2">Lägg till diagnos</h2>
        <div className="flex flex-wrap gap-2">
          {DIAGNOSIS_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => addDiagnosis(opt.label)}
              disabled={adding || activeLabels.has(opt.label)}
              className={`px-4 py-2 rounded border text-sm font-medium transition ${
                activeLabels.has(opt.label)
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400"
              }`}
            >
              {opt.display}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
    </div>
  );
}
