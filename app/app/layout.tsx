import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import "./globals.css";
import { getUser } from "@/lib/db";
import ThemeToggle from "./components/ThemeToggle";

export const metadata: Metadata = {
  title: "Lärarstöd",
  description: "Verktyg för lärare att stödja elever med särskilda behov",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await cookies();
  const userId = store.get("userId")?.value;
  const currentUser = userId ? getUser(userId) : null;

  return (
    <html lang="sv" className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans">
        <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <nav className="flex items-center gap-5">
              {currentUser?.role === "requester" && (
                <>
                  <Link href="/requester" className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline">
                    Förfrågningar
                  </Link>
                  <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
                    Elever
                  </Link>
                  <Link href="/library" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
                    Materialbibliotek
                  </Link>
                </>
              )}
              {currentUser?.role === "supplier" && (
                <>
                  <Link href="/supplier" className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline">
                    Mina förfrågningar
                  </Link>
                  <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
                    Elever
                  </Link>
                  <Link href="/library" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
                    Materialbibliotek
                  </Link>
                </>
              )}
              {!currentUser && (
                <Link href="/" className="text-lg font-semibold text-blue-700 dark:text-blue-400 hover:underline">
                  Lärarstöd
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-4">
              {currentUser && (
                <span className="text-sm text-gray-600 dark:text-gray-400">{currentUser.name}</span>
              )}
              {currentUser && (
                <Link href="/login" className="text-sm text-gray-400 dark:text-gray-500 hover:underline">
                  Byt användare
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
