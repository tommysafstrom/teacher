"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { QUESTIONS, AREA_LABELS, type Field } from "@/lib/screening";

const FIELD_CONFIG: Record<Field, {
  label: string;
  border: string;
  bg: string;
  checkedBg: string;
  text: string;
  dot: string;
  badge: string;
}> = {
  1: {
    label: "Fält 1",
    border: "border-red-400",
    bg: "bg-red-50",
    checkedBg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
  },
  2: {
    label: "Fält 2",
    border: "border-amber-400",
    bg: "bg-amber-50",
    checkedBg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  3: {
    label: "Fält 3",
    border: "border-green-500",
    bg: "bg-green-50",
    checkedBg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700",
  },
  4: {
    label: "Fält 4",
    border: "border-blue-400",
    bg: "bg-blue-50",
    checkedBg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-400",
    badge: "bg-blue-100 text-blue-700",
  },
};

const AREAS = Object.keys(AREA_LABELS);

export default function ScreenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (questionId: string) =>
    setChecked((prev) => ({ ...prev, [questionId]: !prev[questionId] }));

  const toggleArea = (area: string) =>
    setCollapsed((prev) => ({ ...prev, [area]: !prev[area] }));

  const totalChecked = Object.values(checked).filter(Boolean).length;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const answers = QUESTIONS.map((q) => ({
      questionId: q.id,
      checked: !!checked[q.id],
    }));
    const res = await fetch(`/api/kids/${id}/screenings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) {
      setError("Något gick fel. Försök igen.");
      setSubmitting(false);
      return;
    }
    router.push(`/kids/${id}`);
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/kids/${id}`} className="text-sm text-blue-600 hover:underline">
          ← Tillbaka till profil
        </Link>
        <h1 className="text-2xl font-bold mt-2">Skolkompassen</h1>
        <p className="text-sm text-gray-500 mt-1">
          Markera de påståenden som stämmer in på eleven. Det här är ett observationsunderlag, inte en diagnos.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-8 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-xs font-semibold text-gray-500 self-center">Prioritet:</span>
        {([1, 2, 3, 4] as Field[]).map((field) => {
          const cfg = FIELD_CONFIG[field];
          return (
            <div key={field} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>
          );
        })}
        <span className="text-xs text-gray-400 self-center ml-1">
          (Fält 1 = störst påverkan på lärandet)
        </span>
      </div>

      {/* Areas */}
      <div className="space-y-4">
        {AREAS.map((area) => {
          const areaQuestions = QUESTIONS.filter((q) => q.area === area);
          const areaChecked = areaQuestions.filter((q) => checked[q.id]).length;
          const isOpen = !collapsed[area];

          // Get sub-areas in order of field number
          const subAreas = Array.from(
            new Map(areaQuestions.map((q) => [q.subArea, q.field])).entries()
          ).sort(([, fa], [, fb]) => fa - fb);

          return (
            <section key={area} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Area header */}
              <button
                onClick={() => toggleArea(area)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
              >
                <span className="font-semibold text-gray-800 text-sm">
                  {AREA_LABELS[area]}
                </span>
                <div className="flex items-center gap-2">
                  {areaChecked > 0 && (
                    <span className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded-full">
                      {areaChecked}
                    </span>
                  )}
                  <span className="text-gray-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Sub-areas */}
              {isOpen && (
                <div className="divide-y divide-gray-100">
                  {subAreas.map(([subArea, field]) => {
                    const cfg = FIELD_CONFIG[field as Field];
                    const items = areaQuestions.filter((q) => q.subArea === subArea);

                    return (
                      <div key={subArea} className={`border-l-4 ${cfg.border}`}>
                        {/* Sub-area label */}
                        <div className={`px-4 pt-3 pb-1 ${cfg.bg}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                            <span className={`text-xs font-semibold ${cfg.text}`}>
                              {cfg.label} — {subArea}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="px-4 pb-3 space-y-1">
                          {items.map((q) => {
                            const isChecked = !!checked[q.id];
                            return (
                              <label
                                key={q.id}
                                className={`flex items-start gap-3 py-1.5 px-2 rounded cursor-pointer transition-colors ${
                                  isChecked ? cfg.checkedBg : "hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggle(q.id)}
                                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-gray-700 cursor-pointer"
                                />
                                <span className={`text-sm leading-snug ${isChecked ? "font-medium" : "text-gray-700"}`}>
                                  {q.text}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Submit */}
      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium text-sm"
        >
          {submitting ? "Sparar…" : "Spara kartläggning"}
        </button>
        <span className="text-sm text-gray-500">
          {totalChecked === 0
            ? "Inga påståenden markerade ännu"
            : `${totalChecked} påstående${totalChecked === 1 ? "" : "n"} markerade`}
        </span>
      </div>
    </div>
  );
}
