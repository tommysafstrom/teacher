# Datamodell

```mermaid
erDiagram
    KID {
        string id PK
        string label
        string notes
    }

    SCREENING {
        string id PK
        string kidId FK
        string date
        string[] traits
        object raw
    }

    DIAGNOSIS {
        string id PK
        string kidId FK
        string date
        string label
    }

    MATERIAL {
        string id PK
        string title
        string type
        string[] challenges
        string subject
        string url
        string description
    }

    KID ||--o{ SCREENING : "har"
    KID ||--o{ DIAGNOSIS : "har"
    DIAGNOSIS }o--o{ MATERIAL : "pekar mot (via challenge-tagg)"
    SCREENING }o--o{ MATERIAL : "pekar mot (via trait-tagg)"
```

## Härledda anpassningar (ej lagrade)

```mermaid
flowchart LR
    S["SCREENING\n(traits)"] --> Logic["adjustments.ts\nMerge + rangordning"]
    D["DIAGNOSIS\n(labels)"] --> Logic
    Logic --> A["Anpassningslista\n(rangordnade tips + materiallänkar)"]
    A -.->|"challenge/trait-tagg matchar"| M["MATERIAL"]
```

> Anpassningar beräknas vid varje anrop till `GET /api/kids/[id]/adjustments` och
> lagras inte i `db.json`. Det håller datan ren och tips alltid aktuella.
