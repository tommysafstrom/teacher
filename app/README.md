# Lärarstöd

Lokalt webbverktyg som hjälper lärare att stödja elever med särskilda behov.

## Kom igång

```bash
npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i webbläsaren.

## Funktioner

- **Välj elev** — välj bland registrerade elever (Adam och Beata vid start)
- **Elevprofil** — se diagnoser och kartläggningar i ett ögonkast
- **Kartlägg** — gör ett frågeformulär om eleven, resultat sparas som drag (ej diagnos)
- **Diagnos** — registrera formella diagnoser (dyslexi, ADHD, autismspektrum m.fl.)
- **Anpassningar** — få rankade, praktiska tips baserat på elevens profil
- **Materialbibliotek** — filtrera videor, mallar och tips per utmaning

All data sparas i `data/db.json` lokalt. Inga namn på elever — bara ID.

## Projektstruktur

```
app/
├── app/               # Next.js App Router
│   ├── page.tsx       # Elevväljaren
│   ├── kids/[id]/     # Profil, kartläggning, diagnos, anpassningar
│   ├── library/       # Materialbibliotek
│   └── api/           # API-rutter
├── lib/
│   ├── types.ts       # TypeScript-typer
│   ├── db.ts          # Läs/skriv-hjälpare för JSON-filen
│   ├── screening.ts   # Frågeformulär och drag-logik
│   └── adjustments.ts # Regelbaserad anpassningslogik
├── data/
│   └── db.json        # All data (git-ignoreras ej — byt om det innehåller riktig data)
└── documentation/     # Mermaid-diagram (arkitektur, flöde, datamodell)
```

## Flytta till riktig databas

Byt ut `lib/db.ts` mot en databasklient (t.ex. Prisma + PostgreSQL eller SQLite).
API-rutterna och logiken i `lib/adjustments.ts` behöver inte ändras — de anropar
bara funktionerna i `db.ts`.

Lägg till autentisering via NextAuth.js eller Clerk innan verktyget används av
flera lärare.
