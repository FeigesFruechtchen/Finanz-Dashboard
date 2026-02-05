// n8n Code Node – Zeitfilter + Dedupe + Normalisierung in einem Schritt

const hours = 48;
const cutoff = Date.now() - hours * 3600 * 1000;

const stripHtml = (html = "") =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSource = item =>
  item.json.source ||
  item.json.feedTitle ||
  item.json.meta?.title ||
  item.json.feed?.title ||
  (item.json.link?.includes("suredividend.com") ? "SureDividend" : null) ||
  (item.json.link?.includes("finanzen.net") ? "finanzen.net" : null) ||
  (item.json.link?.includes("finanznachrichten.de") ? "finanznachrichten.de" : null) ||
  (item.json.link?.includes("investor.spglobal.com") ? "S&P Global IR" : null) ||
  "Unbekannte Quelle";

const toIso = d => {
  const dt = d ? new Date(d) : null;
  return dt && !isNaN(dt) ? dt.toISOString() : null;
};

const normalize = s =>
  (s ?? "")
    .toLowerCase()
    .replace(
      /\b(dpa[- ]afx|analyser|research|stuft|stufen|bewertet|kursziel|fairer wert|auf|von|bei)\b/g,
      " "
    )
    .replace(/\b(overweight|underweight|equal weight|hold|buy|sell|kaufen)\b/g, " ")
    .replace(
      /\b(deutsche bank|jpmorgan|jp morgan|ubs|goldman sachs|jefferies|barclays|berenberg|dz bank)\b/g,
      " "
    )
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const dayKey = iso => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toISOString().slice(0, 10);
};

const getHost = link => {
  if (!link) return "";
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const seenLinkOrTitle = new Set();
const seenFingerprints = new Set();
const out = [];

for (const item of items) {
  const title = (item.json.title || "").trim();
  const link = (item.json.link || item.json.url || "").trim();
  if (!title && !link) continue;

  const dedupeKey = link || title.toLowerCase();
  if (seenLinkOrTitle.has(dedupeKey)) continue;

  const isoDate = toIso(item.json.isoDate || item.json.pubDate || item.json.date);
  const timestamp = isoDate ? new Date(isoDate).getTime() : 0;
  if (!Number.isFinite(timestamp) || timestamp < cutoff) continue;

  seenLinkOrTitle.add(dedupeKey);

  const category = item.json.category ?? "";
  const tickers = Array.isArray(item.json.tickers) ? item.json.tickers.slice().sort().join(",") : "";
  const tNorm = normalize(item.json.title);
  const date = dayKey(isoDate);
  const source = getSource(item);
  const host = getHost(link) || source;

  const key = `${date}::${category}::${tickers}::${host}::${tNorm}`;

  if (!seenFingerprints.has(key)) {
    seenFingerprints.add(key);
    const snippet = item.json.contentSnippet || item.json.summary || "";
    const content = item.json.content || item.json.description || "";
    const text = stripHtml(snippet || content);

    out.push({
      json: {
        title,
        link,
        date: isoDate,
        source,
        text,
        hasText: Boolean(text && text.length > 30),
        rawType: item.json.categories?.[0] || null,
        category: item.json.category ?? null,
        tickers: Array.isArray(item.json.tickers) ? item.json.tickers : null
      }
    });
  }
}

out.sort((a, b) => (b.json.date || "").localeCompare(a.json.date || ""));
return out;
