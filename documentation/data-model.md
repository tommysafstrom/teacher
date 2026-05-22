# Datamodell

## Befintliga entiteter

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
        object answers
        string summary
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

## Nya entiteter — Request & Supply-modulen

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string role
    }

    REQUEST {
        string id PK
        string requesterId FK
        string[] kidIds
        string[] supplierIds
        string note
        string createdAt
        string status
    }

    RESPONSE {
        string id PK
        string requestId FK
        string supplierId FK
        string kidId FK
        object answers
        string submittedAt
        string lastActivityAt
    }

    REMINDER {
        string id PK
        string requestId FK
        string supplierId FK
        string sentAt
    }

    USER ||--o{ REQUEST : "skapar (requester)"
    REQUEST ||--o{ RESPONSE : "har"
    REQUEST ||--o{ REMINDER : "har"
    USER ||--o{ RESPONSE : "fyller i (supplier)"
    USER ||--o{ REMINDER : "får (supplier)"
    KID ||--o{ RESPONSE : "beskrivs av"
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
