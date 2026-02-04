# Vorschläge zur Erweiterung des Finanznews-Dashboards

Ausgangspunkt: Das Dashboard zeigt derzeit nur Finanznews im Format der gelieferten Items (u. a. `category`, `relevance`, `sentiment`, `impact_tags`, `tickers`, `one_liner`, `commentary`, `date`, `source`). Auf dieser Basis lassen sich sofort Mehrwert-Ansichten und Funktionen integrieren.

## 1) Übersicht & Priorisierung
- **Top-Impact-Feed:** Sortierung nach `relevance` (z. B. 4–5 zuerst), optional mit Hinweis auf `impact_tags` (z. B. *equities_up*, *sector_tech*).
- **Sentiment-Übersicht:** Balken/Badges für `sentiment` (positiv/neutral/negativ) + Filter.
- **Kategoriefilter:** Umschalten zwischen `analyst_rating`, `macro`, `adhoc`, `m&a`, `dividends` etc.

## 2) Schneller Kontext pro News
- **Ticker-Chips:** Klickbare `tickers` für direkte Filterung nach Unternehmen.
- **Source-Badges:** Filter nach `source` (z. B. finanzen.net, finanznachrichten.de).
- **Zeitfilter:** Letzte 24h/7 Tage/30 Tage basierend auf `date`.

## 3) Mehr Insights aus vorhandenen Feldern
- **Impact-Heatmap:** Visualisierung der häufigsten `impact_tags` (z. B. *equities_up* vs. *equities_down*).
- **Relevanz-Cluster:** Gruppierung nach Relevanzstufen (1–2 niedrig, 3 mittel, 4–5 hoch).
- **AI-Kommentar-Ansicht:** Optionaler „Analystenkommentar“-Toggle für `commentary`.

## 4) Entdeckungs- & Recherche-Features
- **Keyword-Suche:** Volltextsuche über `title`, `one_liner`, `text`.
- **Verwandte News:** „Ähnliche Meldungen“ über gleiche `tickers`, `category` oder `impact_tags`.
- **Lesezeichen / Watchlist:** Speichern relevanter Artikel.

## 5) Reports & Export
- **Wöchentlicher Report:** Automatisch generierte Zusammenfassung der Top-Storys.
- **CSV/JSON-Export:** Export gefilterter Feeds für eigene Analysen.

## 6) UX-Details
- **Kompakt-/Detailmodus (bestätigt sinnvoll):** Schnell-Überblick vs. vollständige Ansicht.
- **Lesbarkeit:** Klare Trennung zwischen `one_liner` und Langtext (`text`).
- **Keyboard-Navigation:** Schneller Wechsel durch Meldungen.

## 7) Erweiterungen für die Datenpipeline (optional)
- **Duplikat-Erkennung:** Mehrfachmeldungen zu denselben Themen zusammenfassen (ähnliche `title`/`text`).
- **Ticker-Normalisierung:** Einheitliche Ticker-Symbole (z. B. SAP vs. SAP SE).
- **Sprachdetektion:** Einheitliche Sprachkennzeichnung und optional Übersetzung.

---
**Empfohlenes MVP-Upgrade (1–2 Sprints):**
1. Top-Impact-Feed + Sentiment/Category Filter.
2. Ticker-Chips + Source-Badges + Zeitfilter.
3. Keyword-Suche + Kompakt/Detailmodus.
