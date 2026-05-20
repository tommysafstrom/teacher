import Link from "next/link";
import { getKids } from "@/lib/db";

export default function Home() {
  const kids = getKids();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Välj elev</h1>
      <p className="text-gray-500 mb-6">
        Välj en elev för att se profil, kartläggning och anpassningar.
      </p>
      <ul className="space-y-3">
        {kids.map((kid) => (
          <li key={kid.id}>
            <Link
              href={`/kids/${kid.id}`}
              className="block bg-white border border-gray-200 rounded-lg px-5 py-4 hover:border-blue-400 hover:shadow-sm transition"
            >
              <span className="font-medium text-blue-700">{kid.label}</span>
              <span className="ml-3 text-sm text-gray-400">ID: {kid.id}</span>
              <div className="mt-1 text-sm text-gray-500">
                {kid.diagnoses.length > 0
                  ? `${kid.diagnoses.length} diagnos(er) · `
                  : ""}
                {kid.screenings.length > 0
                  ? `${kid.screenings.length} kartläggning(ar)`
                  : "Ingen kartläggning gjord"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 pt-6 border-t border-gray-200">
        <Link
          href="/library"
          className="text-sm text-blue-600 hover:underline"
        >
          Bläddra i materialbiblioteket →
        </Link>
      </div>
    </div>
  );
}
