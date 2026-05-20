# Lärarens användarflöde

```mermaid
flowchart TD
    Start([Öppna verktyget]) --> ElevLista["/ — Välj elev\n(Adam · Beata)"]

    ElevLista --> Profil["/kids/id — Elevprofil\nAktiva diagnoser · Kartläggningar"]

    Profil --> KartBtn["Tryck: Kartlägg"]
    Profil --> DiagBtn["Tryck: Diagnos"]
    Profil --> AnjBtn["Tryck: Anpassningar"]

    KartBtn --> Fragor["/kids/id/screen\nSteg-för-steg frågeformulär"]
    Fragor --> SparaKart["POST /api/kids/id/screenings\nSpara resultat i db.json"]
    SparaKart --> Profil

    DiagBtn --> DiagForm["/kids/id/diagnose\nLägg till / ta bort diagnos"]
    DiagForm --> SparaDiag["POST /api/kids/id/diagnoses\nSpara i db.json"]
    SparaDiag --> Profil

    AnjBtn --> Anpassningar["/kids/id/adjustments\nGET /api/kids/id/adjustments\n(härlett från diagnoser + kartläggning)"]
    Anpassningar --> Tips["Rangordnade tips grupperade per område\nKlassrumsmiljö · Bemötande · Ämne · Lektionsstruktur"]
    Tips --> MatLink["Länk till material"]

    MatLink --> Bibliotek["/library\nMaterialbibliotek"]
    Bibliotek --> Filter["Filtrera på utmaning / ämne"]
    Filter --> Material["Visa material\n(video · mall · tips)"]

    ElevLista --> Bibliotek
```
