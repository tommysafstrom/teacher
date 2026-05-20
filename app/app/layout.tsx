import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lärarstöd",
  description: "Verktyg för lärare att stödja elever med särskilda behov",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="h-full">
      <body className="min-h-full bg-gray-50 text-gray-900 font-sans">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <a href="/" className="text-lg font-semibold text-blue-700 hover:underline">
            Lärarstöd
          </a>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
