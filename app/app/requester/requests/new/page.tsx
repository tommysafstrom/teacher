"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Kid, User } from "@/lib/types";

export default function NewRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [kids, setKids] = useState<Kid[]>([]);
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [selectedKids, setSelectedKids] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/kids").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([allKids, allUsers]) => {
      setKids(allKids);
      setSuppliers((allUsers as User[]).filter((u) => u.role === "supplier"));
      setLoading(false);
    });
  }, []);

  function toggleKid(id: string) {
    setSelectedKids((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  }

  function toggleSupplier(id: string) {
    setSelectedSuppliers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kidIds: selectedKids, supplierIds: selectedSuppliers, note, dueDate: dueDate || undefined }),
    });
    if (res.ok) {
      router.push("/requester");
    } else {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-gray-400 dark:text-gray-500">Laddar...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Ny förfrågan</h1>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Steg 1: Välj elever</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {kids.map((kid) => (
              <label
                key={kid.id}
                className={`flex items-center gap-2 border rounded-lg px-4 py-3 cursor-pointer transition ${
                  selectedKids.includes(kid.id)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:bg-gray-800"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={selectedKids.includes(kid.id)}
                  onChange={() => toggleKid(kid.id)}
                />
                <span className="text-sm font-medium">{kid.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={selectedKids.length === 0}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
            >
              Nästa →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Steg 2: Välj lärare</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {suppliers.map((supplier) => (
              <label
                key={supplier.id}
                className={`flex items-center gap-2 border rounded-lg px-4 py-3 cursor-pointer transition ${
                  selectedSuppliers.includes(supplier.id)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:bg-gray-800"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={selectedSuppliers.includes(supplier.id)}
                  onChange={() => toggleSupplier(supplier.id)}
                />
                <span className="text-sm font-medium">{supplier.name}</span>
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              ← Tillbaka
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedSuppliers.length === 0}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
            >
              Nästa →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Steg 3: Bekräfta och skicka</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 text-sm text-gray-700 dark:text-gray-200 space-y-1">
            <p>
              <span className="font-medium">Elever ({selectedKids.length}):</span>{" "}
              {kids
                .filter((k) => selectedKids.includes(k.id))
                .map((k) => k.label)
                .join(", ")}
            </p>
            <p>
              <span className="font-medium">Lärare ({selectedSuppliers.length}):</span>{" "}
              {suppliers
                .filter((s) => selectedSuppliers.includes(s.id))
                .map((s) => s.name)
                .join(", ")}
            </p>
          </div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            Anteckning (valfritt)
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Beskriv vad du behöver observationer om..."
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label className="block mt-4 mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            Sista svarsdatum (valfritt)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              ← Tillbaka
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Skickar..." : "Skicka förfrågan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
