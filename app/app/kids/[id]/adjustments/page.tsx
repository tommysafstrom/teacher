"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Adjustment, Material } from "@/lib/types";

const AREA_LABELS: Record<Adjustment["area"], string> = {
  klassrumsmiljö: "Klassrumsmiljö och schema",
  bemötande: "Hur du bemöter eleven",
  ämne: "Ämnesspecifikt material",
  lektionsstruktur: "Lektionsstruktur",
};

export default function AdjustmentsPage() {
  const { id } = useParams<{ id: string }>();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [materials, setMaterials] = useState<Record<string, Material>>({});
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  const load = useCallback(async () => {
    const [adjRes, libRes] = await Promise.all([
      fetch(`/api/kids/${id}/adjustments`),
      fetch("/api/library"),
    ]);
    const adj: Adjustment[] = await adjRes.json();
    const lib: Material[] = await libRes.json();
    const matMap: Record<string, Material> = {};
    lib.forEach((m) => (matMap[m.id] = m));
    setAdjustments(adj);
    setMaterials(matMap);
    setEmpty(adj.length === 0);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const areas = (["klassrumsmiljö", "bemötande", "ämne", "lektionsstruktur"] as const).filter(
    (area) => adjustments.some((a) => a.area === area)
  );

  if (loading) return <p className="text-gray-400 dark:text-gray-500 text-sm">Laddar…</p>;

  return (
    <div>
      <div className="mb-6">
        <Link href={`/kids/${id}`} className="text-sm text-blue-600 hover:underline">
          ← Tillbaka till profil
        </Link>
        <h1 className="text-2xl font-bold mt-2">Anpassningar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tips baserade på elevens kartläggningar och diagnoser.
        </p>
      </div>

      {empty ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-4 text-sm text-yellow-800 dark:text-yellow-300">
          Inga anpassningar ännu. Gör en kartläggning eller lägg till en diagnos för att se tips.
        </div>
      ) : (
        <div className="space-y-8">
          {areas.map((area) => (
            <section key={area}>
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-1 mb-3">
                {AREA_LABELS[area]}
              </h2>
              <ul className="space-y-4">
                {adjustments
                  .filter((a) => a.area === area)
                  .map((adj, i) => (
                    <li key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <p className="text-sm mb-3">{adj.tip}</p>
                      {adj.materialIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {adj.materialIds.map((mid) => {
                            const mat = materials[mid];
                            if (!mat) return null;
                            return (
                              <Link
                                key={mid}
                                href={`/library`}
                                className="text-xs bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                              >
                                {mat.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
