# System Architecture

```mermaid
graph TD
    Browser["Browser\n(localhost:3000)"]

    subgraph NextJS["Next.js App (App Router)"]
        Pages["Pages\n/ · /kids/[id] · /kids/[id]/screen\n/kids/[id]/diagnose · /kids/[id]/adjustments\n/library"]
        APIRoutes["API Routes\n/api/kids · /api/kids/[id]\n/api/kids/[id]/screenings\n/api/kids/[id]/diagnoses\n/api/kids/[id]/adjustments\n/api/library"]
        LibDB["lib/db.ts\nTyped read/write helpers\n(file-locked)"]
    end

    DataFile["data/db.json\nLocal JSON file\n(kids · screenings · diagnoses · library)"]

    Browser -->|HTTP| Pages
    Pages -->|fetch| APIRoutes
    APIRoutes --> LibDB
    LibDB -->|fs.readFileSync / fs.writeFileSync| DataFile
```

## Folder Structure

```mermaid
graph LR
    Root["/teacher"]
    Root --> App["app/\n(Next.js App Router)"]
    Root --> Lib["lib/\ndb.ts · types.ts · adjustments.ts"]
    Root --> Data["data/\ndb.json"]
    Root --> Documentation["documentation/\narchitecture.md · flow-teacher.md · data-model.md"]
    Root --> Plans["plans/\ninitial.md"]

    App --> AppRoot["page.tsx\n(välj elev)"]
    App --> AppKids["kids/[id]/\npage.tsx · screen/ · diagnose/ · adjustments/"]
    App --> AppLibrary["library/\npage.tsx"]
    App --> AppAPI["api/\nkids/ · library/"]
```
