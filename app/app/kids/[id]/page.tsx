import Link from "next/link";
import { notFound } from "next/navigation";
import { getKid } from "@/lib/db";

export default async function KidProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kid = getKid(id);
  if (!kid) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Tillbaka
        </Link>
        <h1 className="text-2xl font-bold mt-2">{kid.label}</h1>
        <p className="text-sm text-gray-400">ID: {kid.id}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <Link
          href={`/kids/${kid.id}/screen`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
        >
          Kartlägg
        </Link>
        <Link
          href={`/kids/${kid.id}/diagnose`}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:border-blue-400 transition text-sm font-medium"
        >
          Diagnos
        </Link>
        <Link
          href={`/kids/${kid.id}/adjustments`}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:border-blue-400 transition text-sm font-medium"
        >
          Anpassningar
        </Link>
      </div>

      {/* Diagnoses */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Diagnoser</h2>
        {kid.diagnoses.length === 0 ? (
          <p className="text-sm text-gray-400">Inga diagnoser registrerade.</p>
        ) : (
          <ul className="space-y-2">
            {kid.diagnoses.map((d) => (
              <li
                key={d.id}
                className="bg-white border border-gray-200 rounded px-4 py-2 text-sm flex justify-between"
              >
                <span className="font-medium capitalize">{d.label}</span>
                <span className="text-gray-400">{d.date}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Screenings */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Kartläggningar</h2>
        {kid.screenings.length === 0 ? (
          <p className="text-sm text-gray-400">Ingen kartläggning gjord ännu.</p>
        ) : (
          <ul className="space-y-2">
            {kid.screenings.map((s) => (
              <li
                key={s.id}
                className="bg-white border border-gray-200 rounded px-4 py-2 text-sm"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Kartläggning</span>
                  <span className="text-gray-400">{s.date}</span>
                </div>
                <p className="text-gray-600">{s.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
