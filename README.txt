News Dashboard – n8n Code Node
==============================

Überblick
--------
Dieses Repository enthält eine n8n Code-Node-Vorlage (`n8n_code_node.js`),
welche ein vollständiges News-Dashboard als HTML-String generiert.
Der Output kann in n8n direkt an einen HTML-Renderer/HTTP-Response
weitergegeben werden.

Die Vorlage umfasst:
- Vollständiges HTML + CSS + JS in einem String
- Sidebar-Insights (Sentiment, Kategorie, Quelle, Relevanz) mit Donut-Charts
- Klickbare Filter-Chips (Sentiment/Kategorie/Quelle/Relevanz)
- Top-Hits-Bereich für Asset-Hits
- Einzelne News-Kacheln mit Ausklapp-„Einschätzung“
- Relevanz-/Alert-Visuals und zeitliches Ausblenden

Dateien
-------
- `n8n_code_node.js`: Der komplette Generator (HTML/CSS/JS) für das Dashboard.
- `Node Zeitfilter+Dedup+Normalisieren.js`: Kombinierte Code-Node für Zeitfilter (48h),
  Deduplizierung und Normalisierung der Items (inkl. HTML-Strip, Quellen-Detektion,
  ISO-Datum und Textfeld für KI-Tagging).

Wie funktioniert die Code-Node?
-------------------------------
1) **Input lesen**
   - Erwartet wird ein Objekt mit `items` (Array von News-Objekten).

2) **Sortierung**
   - Nach Relevanz (DESC), Kategorie-Priorität (ASC), Datum (DESC).

3) **Aufbereitung & Statistik**
   - Zählt Sentiments, Kategorien, Quellen, Relevanzstufen.
   - Erzeugt Donut-Gradients für die Overview-Karten.

4) **Rendering**
   - Jede News wird als Karte gerendert.
   - Asset-Hits erhalten Badge + Seitenmarkierung + Glow.
   - „Einschätzung“ ist pro Karte ausklappbar.

5) **Interaktive Filter**
   - Chips in der Sidebar filtern nach Sentiment/Kategorie/Quelle/Relevanz.
   - „Reset“ setzt alle Filter zurück.

Erwartetes Input-Format (Beispiel)
---------------------------------
```
{
  "items": [
    {
      "category": "analyst_rating",
      "relevance": 3,
      "sentiment": "positive",
      "asset_hit": true,
      "asset_hits": ["SAP"],
      "title": "JPMORGAN stuft SAP SE auf 'Overweight'",
      "link": "https://...",
      "date": "2026-02-04T07:30:00.000Z",
      "source": "finanznachrichten.de",
      "one_liner": "Kurz-Headline...",
      "commentary": "Ausführliche Einschätzung..."
    }
  ]
}
```

Wichtige Optionen (im Code)
---------------------------
- `TOP_HITS_MIN_RELEVANCE`: Mindest-Relevanz für Top Hits
- `TOP_HITS_MAX_ITEMS`: Maximale Anzahl Top-Hits-Karten
- `AGE_DIM_1_HOURS` / `AGE_DIM_2_HOURS`: Visuelles Ausgrauen älterer News

Hinweise
--------
- Alle Styles sind im HTML eingebettet – es gibt keine externen Abhängigkeiten.
- Das Dashboard ist responsiv (Sidebar klappt bei kleineren Breiten untereinander).
- Filter-Chips sind toggelbar (erneuter Klick deaktiviert den Filter).

Anpassungen
-----------
- Farben/Styles können direkt im `<style>`-Block angepasst werden.
- Weitere Overview-Karten können analog zu Sentiment/Kategorie/Quelle ergänzt werden.
- Zusätzliche Filter lassen sich über weitere `data-*` Attribute an den Karten erweitern.
