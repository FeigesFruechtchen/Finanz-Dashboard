# Finanznews-Dashboard – aktueller Stand & nächste Schritte

Ausgangspunkt: Das Dashboard nutzt die gelieferten Items (`category`, `relevance`, `sentiment`, `impact_tags`, `tickers`, `one_liner`, `commentary`, `date`, `source`) und bietet bereits interaktive Insights in der Sidebar. Die Filterung erfolgt über klickbare Chips statt Dropdowns/Suche.

## 1) Aktuell umgesetzt
- **Top-Hits-Block:** zeigt Asset-Hits (mit Relevanz-Minimum) in eigener Sektion.
- **Sentiment-Overview:** Donut + Chips (positiv/neutral/negativ) mit Filterfunktion.
- **Kategorie-Overview:** Donut + Chips, klickbar und filterbar.
- **Quelle-Overview:** Donut + Chips, klickbar und filterbar.
- **Relevanz-Overview:** Donut + Chips, filtert nach Mindest-Relevanz.
- **Sticky Sidebar:** Insight-Kacheln bleiben beim Scrollen sichtbar.
- **Karten-UX:** „Einschätzung“ pro News ausklappbar; Asset-Hit und Alerts visuell hervorgehoben.

## 2) Sinnvolle nächste Erweiterungen (kurzfristig)
- **Zeitfilter (24h/7d/30d):** Ergänzung als Chips oder kleiner Toggle, basierend auf `date`.
- **Impact-Tags-Heatmap:** Überblick über häufige `impact_tags` (z. B. *equities_up* vs. *equities_down*).
- **Ticker-Filter:** Chips aus `tickers` zur schnellen Unternehmens-Filterung.
- **Quelle/Kategorie-Detail:** Tooltip oder Mini-Legende für seltene Kategorien/Quellen.

## 3) Mehrwert-Features (mittelfristig)
- **Ähnliche News/Cluster:** Gruppierung nach `tickers`, `category` oder textlicher Ähnlichkeit.
- **Duplikat-Erkennung:** Mehrfachmeldungen bündeln (ähnliche `title`/`text`).
- **Watchlist:** Favoriten markieren und separat anzeigen.
- **Export:** CSV/JSON-Export aus dem gefilterten Zustand.

## 4) Pipeline & Datenqualität
- **Ticker-Normalisierung:** Einheitliche Symbole/Mapping.
- **Sentiment-Qualität:** Konsolidierung von `mixed`/`neutral` oder Fehlwerten.
- **Sprach-Tagging:** Einheitliche Sprachkennung, optional Übersetzung.

---
**Empfohlener Mini-Plan (1–2 Sprints):**
1. Zeitfilter + Ticker-Chips (Filterung über Sidebar oder Top-Leiste).
2. Impact-Tags-Heatmap + ähnliche News.
3. Export + Duplikat-Erkennung.
