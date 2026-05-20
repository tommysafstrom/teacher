"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Material, Challenge } from "@/lib/types";

const CHALLENGES: { value: Challenge; label: string }[] = [
  { value: "dyslexi", label: "Dyslexi" },
  { value: "adhd", label: "ADHD" },
  { value: "autismspektrum", label: "Autismspektrum" },
  { value: "dyskalkyli", label: "Dyskalkyli" },
  { value: "språkstörning", label: "Språkstörning" },
  { value: "kommunikationsliknande", label: "Kommunikation" },
  { value: "planeringsliknande", label: "Planering" },
  { value: "sinnesintrycksliknande", label: "Sinnesintryck" },
  { value: "uppmärksamhetsliknande", label: "Uppmärksamhet" },
  { value: "impulsivitetsliknande", label: "Impulsivitet" },
  { value: "tidsuppfattningsliknande", label: "Tidsuppfattning" },
  { value: "flexibilitetsliknande", label: "Flexibilitet" },
  { value: "lässvårighetsliknande", label: "Lässvårigheter" },
];

const TYPE_LABELS: Record<string, string> = {
  video: "Video",
  mall: "Mall",
  tips: "Tips",
  artikel: "Artikel",
};

export default function LibraryPage() {
  const [items, setItems] = useState<Material[]>([]);
  const [filter, setFilter] = useState<Challenge | "">("");

  useEffect(() => {
    const url = filter
      ? `/api/library?challenge=${encodeURIComponent(filter)}`
      : "/api/library";
    fetch(url)
      .then((r) => r.json())
      .then(setItems);
  }, [filter]);

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Tillbaka
        </Link>
        <h1 className="text-2xl font-bold mt-2">Materialbibliotek</h1>
        <p className="text-sm text-gray-500 mt-1">
          Filtrerat material för olika utmaningar och ämnen.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Filtrera på utmaning
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("")}
            className={`px-3 py-1 rounded text-sm border transition ${
              filter === ""
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            Alla
          </button>
          {CHALLENGES.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value)}
              className={`px-3 py-1 rounded text-sm border transition ${
                filter === c.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Inga material hittades.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.challenges.map((c) => (
                      <span
                        key={c}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{item.subject}</p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                    >
                      Öppna →
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
