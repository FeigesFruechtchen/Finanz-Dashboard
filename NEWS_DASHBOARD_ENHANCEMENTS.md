# Finanznews-Dashboard – aktueller Stand & nächste Schritte

Ausgangspunkt: Das Dashboard rendert News-Items mit Feldern wie `category`, `relevance`, `sentiment`, `impact_tags`, `tickers`, `one_liner`, `commentary`, `date`, `source`. Die Filterung läuft vollständig über klickbare Chips in der Sidebar (kein Suchfeld mehr).

## 1) Aktuell umgesetzt (Stand heute)
- **Hero-Header:** prominenter Titel mit Unterzeile, klare visuelle Hierarchie.
- **Top-Hits-Block:** eigene Sektion für Asset-Hits mit Relevanz-Minimum.
- **Sentiment/Kategorie/Quelle/Relevanz:** je ein Donut + Chips zum Filtern.
- **Sticky Sidebar:** Insight-Kacheln bleiben beim Scrollen sichtbar.
- **Karten-UX:** „Einschätzung“ pro News ausklappbar; Asset-Hit und Alerts visuell hervorgehoben.
- **Sortierung & Meta:** Hinweis zur Sortierung + Alert-Schwelle in der Filter-Meta-Zeile.

## 2) Sinnvolle nächste Erweiterungen (kurzfristig)
- **Zeitfilter (24h/7d/30d):** Chips oder kleiner Toggle auf Basis von `date`.
- **Impact-Tags-Heatmap:** Überblick über häufige `impact_tags`.
- **Ticker-Filter:** Chips aus `tickers` zur schnellen Unternehmens-Filterung.
- **Top-Hits-Transparenz:** kurze Erklärung der Kriterien (Asset-Hit + Relevanz-Minimum).

## 3) Mehrwert-Features (mittelfristig)
- **Ähnliche News/Cluster:** Gruppierung nach `tickers`, `category` oder textlicher Ähnlichkeit.
- **Duplikat-Erkennung:** Mehrfachmeldungen bündeln (ähnliche `title`/`text`).
- **Watchlist/Favoriten:** markierte News sammeln und separat anzeigen.
- **Export:** CSV/JSON-Export aus dem gefilterten Zustand.

## 4) Pipeline & Datenqualität
- **Ticker-Normalisierung:** Einheitliche Symbole/Mapping.
- **Sentiment-Qualität:** Konsolidierung von `mixed`/`neutral` bzw. Fehlwerten.
- **Sprach-Tagging:** Einheitliche Sprachkennung, optional Übersetzung.

---
**Empfohlener Mini-Plan (1–2 Sprints):**
1. Zeitfilter + Ticker-Chips.
2. Impact-Tags-Heatmap + ähnliche News.
3. Export + Duplikat-Erkennung.
