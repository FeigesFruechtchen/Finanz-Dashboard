// ==============================
// n8n Code Node – News Dashboard (mit Zeit-Ausblenden + Karten-Ausklappen)
// ==============================

// ---------- Helpers ----------
function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("de-DE", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return String(iso ?? "");
  }
}

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b), "de")
  );
}

function normalizeAssetHits(assetHits) {
  if (Array.isArray(assetHits)) {
    return assetHits.filter(Boolean).map(String);
  }
  if (typeof assetHits === "string") {
    return assetHits
      .split(/[,;|]/)
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
}

function isExplicitTrue(value) {
  if (value === true || value === 1 || value === "1") return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "yes" || normalized === "y";
  }
  return false;
}

// ---------- Kategorie-Priorität ----------
const CATEGORY_PRIORITY = {
  adhoc: 1,
  earnings: 2,
  analyst_rating: 3,
  macro: 4,
  rates: 5,
  equities: 6,
  etf: 7,
  dividends: 8,
  company_news: 9,
  geopolitics: 10,
  commodities: 11,
  crypto: 12,
  other: 99
};

// ---------- Config ----------
const TOP_HITS_MIN_RELEVANCE = 2; // ab hier kommen Asset-Hits in den Top-Block
const TOP_HITS_MAX_ITEMS = 6; // max Cards im Top-Block
// Zeitliches Ausblenden (nur visuell)
const AGE_DIM_1_HOURS = 24; // ab 24h leicht ausgrauen
const AGE_DIM_2_HOURS = 48; // ab 48h stark ausgrauen

// ---------- Input ----------
const input = $input.first().json || {};
const items = Array.isArray(input.items) ? input.items.slice() : [];

// ---------- Sortierung ----------
// 1. Relevanz DESC
// 2. Kategorie ASC
// 3. Datum DESC
items.sort((a, b) => {
  const r = (Number(b.relevance) || 0) - (Number(a.relevance) || 0);
  if (r !== 0) return r;

  const cA = CATEGORY_PRIORITY[a.category] ?? 99;
  const cB = CATEGORY_PRIORITY[b.category] ?? 99;
  if (cA !== cB) return cA - cB;

  return new Date(b.date) - new Date(a.date);
});

// ---------- Filter-Optionen dynamisch ----------
const categories = uniqSorted(items.map(x => String(x.category || "other")));
const sources = uniqSorted(items.map(x => String(x.source || "")));
const categoryCounts = items.reduce((acc, item) => {
  const value = String(item.category || "other");
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});
const sourceCounts = items.reduce((acc, item) => {
  const value = String(item.source || "unknown");
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});
const relevanceCounts = items.reduce((acc, item) => {
  const value = Math.max(0, Math.min(5, Number(item.relevance) || 0));
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});
const categoryTotal = categories.reduce((sum, category) => sum + (categoryCounts[category] || 0), 0);
const categoryColors = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#a78bfa",
  "#fb7185",
  "#38bdf8",
  "#fb923c",
  "#22c55e",
  "#e879f9"
];
let categoryGradient = "conic-gradient(rgba(255,255,255,.15) 0 100%)";
if (categoryTotal > 0) {
  let acc = 0;
  const stops = categories.map((category, index) => {
    const count = categoryCounts[category] || 0;
    const pct = (count / categoryTotal) * 100;
    const start = acc;
    acc += pct;
    const color = categoryColors[index % categoryColors.length];
    return `${color} ${start.toFixed(2)}% ${acc.toFixed(2)}%`;
  });
  categoryGradient = `conic-gradient(${stops.join(", ")})`;
}
const sourceTotal = sources.reduce((sum, source) => sum + (sourceCounts[source] || 0), 0);
let sourceGradient = "conic-gradient(rgba(255,255,255,.15) 0 100%)";
if (sourceTotal > 0) {
  let acc = 0;
  const stops = sources.map((source, index) => {
    const count = sourceCounts[source] || 0;
    const pct = (count / sourceTotal) * 100;
    const start = acc;
    acc += pct;
    const color = categoryColors[index % categoryColors.length];
    return `${color} ${start.toFixed(2)}% ${acc.toFixed(2)}%`;
  });
  sourceGradient = `conic-gradient(${stops.join(", ")})`;
}
const relevanceLevels = [5, 4, 3, 2, 1, 0];
const relevanceTotal = relevanceLevels.reduce((sum, level) => sum + (relevanceCounts[level] || 0), 0);
const relevanceColors = ["#22c55e", "#60a5fa", "#f59e0b", "#f97316", "#ef4444", "#94a3b8"];
let relevanceGradient = "conic-gradient(rgba(255,255,255,.15) 0 100%)";
if (relevanceTotal > 0) {
  let acc = 0;
  const stops = relevanceLevels.map((level, index) => {
    const count = relevanceCounts[level] || 0;
    const pct = (count / relevanceTotal) * 100;
    const start = acc;
    acc += pct;
    const color = relevanceColors[index % relevanceColors.length];
    return `${color} ${start.toFixed(2)}% ${acc.toFixed(2)}%`;
  });
  relevanceGradient = `conic-gradient(${stops.join(", ")})`;
}
const sentimentCounts = items.reduce(
  (acc, item) => {
    const value = String(item.sentiment || "unknown").toLowerCase();
    if (value === "positive") acc.positive += 1;
    else if (value === "negative") acc.negative += 1;
    else if (value === "neutral") acc.neutral += 1;
    else acc.other += 1;
    return acc;
  },
  { positive: 0, neutral: 0, negative: 0, other: 0 }
);
const sentimentTotal = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
const sentimentParts = {
  positive: sentimentTotal ? (sentimentCounts.positive / sentimentTotal) * 100 : 0,
  neutral: sentimentTotal ? (sentimentCounts.neutral / sentimentTotal) * 100 : 0,
  negative: sentimentTotal ? (sentimentCounts.negative / sentimentTotal) * 100 : 0
};

// ---------- Top Hits (deine Assets) ----------
const topHitsAll = items.filter(n => {
  return isExplicitTrue(n.asset_hit) && (Number(n.relevance) || 0) >= TOP_HITS_MIN_RELEVANCE;
});
const topHits = topHitsAll.slice(0, TOP_HITS_MAX_ITEMS);
const topHitsCount = topHitsAll.length;

// ---------- Cards Renderer ----------
function renderCard(n) {
  const rel = Number(n.relevance ?? 0);
  const sent = String(n.sentiment || "unknown").toLowerCase();
  const cat = String(n.category || "other");
  const src = String(n.source || "");
  const assets = normalizeAssetHits(n.asset_hits);
  const isAssetHit = isExplicitTrue(n.asset_hit) || assets.length > 0;

  // Alert-Stripe (wie vorher)
  const alertClass = rel >= 4 ? "alert" : "";

  // Relevanz-Badge-Farbe
  const relBadge = rel >= 4 ? "good" : rel >= 2 ? "warn" : "info";

  // Sentiment-Badge-Farbe
  const sentBadge =
    sent === "positive" ? "good" : sent === "negative" ? "bad" : sent === "mixed" ? "warn" : "info";

  // Zeitliches Ausblenden
  const ageHours = (() => {
    try {
      const t = new Date(n.date).getTime();
      if (!Number.isFinite(t)) return 0;
      return (Date.now() - t) / 36e5;
    } catch {
      return 0;
    }
  })();

  let ageClass = "";
  if (ageHours >= AGE_DIM_2_HOURS) ageClass = "old-48";
  else if (ageHours >= AGE_DIM_1_HOURS) ageClass = "old-24";

  const chips = [
    isAssetHit ? `<span class="chip assetHit">🎯 Asset-Hit</span>` : "",
    `<span class="chip ${relBadge}">Relevanz: ${rel}</span>`,
    `<span class="chip ${sentBadge}">Sentiment: ${esc(sent)}</span>`,
    `<span class="chip">Kategorie: ${esc(cat)}</span>`,
    src ? `<span class="chip">Quelle: ${esc(src)}</span>` : ""
  ]
    .filter(Boolean)
    .join("");

  const assetsLine = isAssetHit
    ? `<div class="assetLine"><span class="label">Assets:</span> ${esc(assets.join(", "))}</div>`
    : "";

  const oneLiner = n.one_liner ? `<p class="text">${esc(n.one_liner)}</p>` : "";
  const commentaryText = n.commentary ? String(n.commentary) : "";
  const hasCommentary = commentaryText.length > 0;
  const defaultExpanded = isAssetHit && rel >= TOP_HITS_MIN_RELEVANCE;
  const commentaryClass = defaultExpanded ? "commentary" : "commentary collapsed";
  const commentary = hasCommentary
    ? `<p class="text muted ${commentaryClass}">${esc(commentaryText)}</p>`
    : "";
  const toggleButton = hasCommentary
    ? `<button class="btn ghost toggleCommentary" type="button" data-state="${
        defaultExpanded ? "expanded" : "collapsed"
      }">${defaultExpanded ? "Einschätzung ausblenden" : "Einschätzung"}</button>`
    : "";

  // data-* Werte: lieber "roh" (ohne HTML escaping), weil wir exakt matchen
  // title Tooltip: Alter in Stunden
  const tooltip = `${Math.max(0, Math.floor(ageHours))}h alt`;

  return `
  <article
    class="card ${alertClass} ${ageClass} ${isAssetHit ? "isAssetHit" : ""}"
    data-relevance="${rel}"
    data-category="${cat}"
    data-sentiment="${sent}"
    data-source="${src}"
    data-title="${esc(n.title || "")}"
    data-assets="${esc(assets.join(" ")).toLowerCase()}"
    title="${esc(tooltip)}"
  >
    <h2 class="title">${esc(n.title || "Ohne Titel")}</h2>

    <div class="meta">
      <span>${esc(src || "unknown")}</span>
      <span>•</span>
      <span>${fmtDate(n.date)}</span>
    </div>

    <div class="chips">${chips}</div>

    ${assetsLine}
    ${oneLiner}
    ${commentary}

    <div class="footer">
      <a class="btn" href="${esc(n.link || "#")}" target="_blank" rel="noopener noreferrer">
        Artikel öffnen →
      </a>
      ${toggleButton}
    </div>
  </article>`;
}

// ---------- Main Cards ----------
const cardsHtml = items.map(n => renderCard(n)).join("");

// ---------- Top Hits Block ----------
const topHitsHtml = topHitsCount
  ? `
  <section class="topHits">
    <div class="topHitsHead">
      <h2>Top Hits (deine Assets)</h2>
      <div class="topHitsMeta">${topHits.length} von ${topHitsCount} Treffern (Relevanz ≥ ${TOP_HITS_MIN_RELEVANCE})</div>
    </div>
    <div class="topHitsGrid">
      ${topHits.map(n => renderCard(n)).join("")}
    </div>
  </section>
  `
  : "";

// ---------- Filter UI ----------
const filterBar = `
<div class="filters">
  <div class="filtersRow">
    <button class="btn ghost" id="reset" type="button">Reset</button>
  </div>

  <div class="filtersMeta">
    <span id="countShown">0</span> von <span id="countAll">${items.length}</span> angezeigt
    • Sortierung: Relevanz (DESC) → Kategorie → Datum
    • Alert ab Relevanz ≥ 3
  </div>
</div>`;

const sentimentCard = `
<section class="sideCard">
  <div class="sideCardTitle">Sentiment Überblick</div>
  <div class="sentimentSummary">
    <div
      class="sentimentDonut"
      style="--pos:${sentimentParts.positive.toFixed(2)};--neu:${sentimentParts.neutral.toFixed(
        2
      )};--neg:${sentimentParts.negative.toFixed(2)};"
      aria-label="Sentiment Verteilung"
      role="img"
    >
      <div class="sentimentDonutInner">${sentimentTotal || 0}</div>
    </div>
    <div class="sentimentLegend">
      <button class="chip good sentimentFilter" type="button" data-sentiment="positive">
        Positiv: ${sentimentCounts.positive}
      </button>
      <button class="chip info sentimentFilter" type="button" data-sentiment="neutral">
        Neutral: ${sentimentCounts.neutral}
      </button>
      <button class="chip bad sentimentFilter" type="button" data-sentiment="negative">
        Negativ: ${sentimentCounts.negative}
      </button>
      ${sentimentCounts.other ? `<span class="chip">Sonstige: ${sentimentCounts.other}</span>` : ""}
    </div>
  </div>
</section>`;

const categoryCard = `
<section class="sideCard">
  <div class="sideCardTitle">Kategorie Überblick</div>
  <div class="categorySummary">
    <div
      class="categoryDonut"
      style="--category-gradient:${categoryGradient};"
      aria-label="Kategorie Verteilung"
      role="img"
    >
      <div class="categoryDonutInner">${categoryTotal}</div>
    </div>
    <div class="categoryLegend">
      ${categories
        .map(category => {
          const count = categoryCounts[category] || 0;
          return `<button class="chip categoryFilter" type="button" data-category="${esc(
            category
          )}">${esc(category)}: ${count}</button>`;
        })
        .join("")}
    </div>
  </div>
</section>`;

const sourceCard = `
<section class="sideCard">
  <div class="sideCardTitle">Quelle Überblick</div>
  <div class="sourceSummary">
    <div
      class="sourceDonut"
      style="--source-gradient:${sourceGradient};"
      aria-label="Quelle Verteilung"
      role="img"
    >
      <div class="sourceDonutInner">${sourceTotal}</div>
    </div>
    <div class="sourceLegend">
      ${sources
        .map(source => {
          const count = sourceCounts[source] || 0;
          return `<button class="chip sourceFilter" type="button" data-source="${esc(
            source
          )}">${esc(source)}: ${count}</button>`;
        })
        .join("")}
    </div>
  </div>
</section>`;

const relevanceCard = `
<section class="sideCard">
  <div class="sideCardTitle">Relevanz Überblick</div>
  <div class="relevanceSummary">
    <div
      class="relevanceDonut"
      style="--relevance-gradient:${relevanceGradient};"
      aria-label="Relevanz Verteilung"
      role="img"
    >
      <div class="relevanceDonutInner">${relevanceTotal}</div>
    </div>
    <div class="relevanceLegend">
      ${relevanceLevels
        .map(level => {
          const count = relevanceCounts[level] || 0;
          const label = level === 5 ? "5" : `≥ ${level}`;
          return `<button class="chip relevanceFilter" type="button" data-relevance="${level}">
            Relevanz ${label}: ${count}
          </button>`;
        })
        .join("")}
    </div>
  </div>
</section>`;

const placeholderCard = `
<section class="sideCard">
  <div class="sideCardTitle">Weitere Insights</div>
  <p class="sideCardText">Hier kannst du später weitere KPIs, Trends oder Alerts anzeigen.</p>
</section>`;

// ---------- HTML ----------
const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>News Dashboard</title>

<style>
:root{
  --bg:#0b1020;
  --card:#111a33;
  --text:#eef2ff;
  --muted:#9aa7c7;
  --border:rgba(255,255,255,.08);

  --good:#22c55e;
  --bad:#ef4444;
  --warn:#f59e0b;
  --info:#60a5fa;
}

*{box-sizing:border-box}

body{
  margin:0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background:
    radial-gradient(1200px 600px at 20% 0%, rgba(96,165,250,.18), transparent 60%),
    radial-gradient(900px 500px at 80% 10%, rgba(239,68,68,.10), transparent 55%),
    var(--bg);
  color:var(--text);
}

.wrap{
  width:100%;
  max-width:none;
  margin:0;
  padding:24px 28px;
}

.hero{
  display:flex;
  flex-direction:column;
  gap:6px;
}

.titleHero{
  margin:0;
  font-size:28px;
  font-weight:700;
  letter-spacing:.2px;
  background:linear-gradient(90deg, #e2e8f0, #60a5fa 50%, #38bdf8);
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
}

.heroSubtitle{
  margin:0;
  color:var(--muted);
  font-size:13px;
}

.filters{
  margin-top:14px;
  padding:12px;
  border-radius:16px;
  border:1px solid var(--border);
  background:rgba(255,255,255,.04);
}

.filtersRow{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:end;
}

.f{
  display:flex;
  flex-direction:column;
  gap:6px;
  font-size:12px;
  color:var(--muted);
}

.f select{
  height:34px;
  padding:0 10px;
  border-radius:12px;
  border:1px solid var(--border);
  background:rgba(17,26,51,.65);
  color:var(--text);
  outline:none;
  min-width:170px;
}

.filtersMeta{
  margin-top:10px;
  color:var(--muted);
  font-size:12px;
}

.layout{
  margin-top:16px;
  display:grid;
  grid-template-columns:minmax(240px, 320px) minmax(0, 1fr);
  gap:16px;
  align-items:start;
}

.sidebar{
  display:flex;
  flex-direction:column;
  gap:14px;
  position:sticky;
  top:18px;
  align-self:start;
}

.content{
  min-width:0;
}

.sideCard{
  background:rgba(17,26,51,.72);
  border:1px solid var(--border);
  border-radius:16px;
  padding:14px;
}

.sideCardTitle{
  font-size:13px;
  letter-spacing:.2px;
  color:var(--muted);
  margin-bottom:10px;
}

.sideCardText{
  margin:0;
  font-size:13px;
  color:rgba(238,242,255,.9);
}

.sentimentSummary{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  align-items:center;
}

.categorySummary{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  align-items:center;
}

.sourceSummary{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  align-items:center;
}

.relevanceSummary{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  align-items:center;
}

.sentimentLegend{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}

.categoryLegend{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}

.sourceLegend{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}

.relevanceLegend{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}

.categoryDonut{
  --category-gradient:conic-gradient(rgba(255,255,255,.15) 0 100%);
  width:54px;
  height:54px;
  border-radius:50%;
  display:grid;
  place-items:center;
  background:var(--category-gradient);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.12),
    0 8px 18px rgba(0,0,0,.35);
}

.categoryDonutInner{
  width:34px;
  height:34px;
  border-radius:50%;
  background:rgba(11,16,32,.95);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  color:var(--text);
}

.sourceDonut{
  --source-gradient:conic-gradient(rgba(255,255,255,.15) 0 100%);
  width:54px;
  height:54px;
  border-radius:50%;
  display:grid;
  place-items:center;
  background:var(--source-gradient);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.12),
    0 8px 18px rgba(0,0,0,.35);
}

.sourceDonutInner{
  width:34px;
  height:34px;
  border-radius:50%;
  background:rgba(11,16,32,.95);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  color:var(--text);
}

.relevanceDonut{
  --relevance-gradient:conic-gradient(rgba(255,255,255,.15) 0 100%);
  width:54px;
  height:54px;
  border-radius:50%;
  display:grid;
  place-items:center;
  background:var(--relevance-gradient);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.12),
    0 8px 18px rgba(0,0,0,.35);
}

.relevanceDonutInner{
  width:34px;
  height:34px;
  border-radius:50%;
  background:rgba(11,16,32,.95);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  color:var(--text);
}
.sentimentDonut{
  --pos:0;
  --neu:0;
  --neg:0;
  width:54px;
  height:54px;
  border-radius:50%;
  display:grid;
  place-items:center;
  background:
    conic-gradient(
      var(--good) 0 calc(var(--pos) * 1%),
      var(--info) calc(var(--pos) * 1%) calc((var(--pos) + var(--neu)) * 1%),
      var(--bad) calc((var(--pos) + var(--neu)) * 1%) 100%
    );
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.12),
    0 8px 18px rgba(0,0,0,.35);
}

.sentimentDonutInner{
  width:34px;
  height:34px;
  border-radius:50%;
  background:rgba(11,16,32,.95);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  color:var(--text);
}

.topHits{
  margin-top:16px;
  padding:12px;
  border-radius:16px;
  border:1px solid var(--border);
  background:rgba(255,255,255,.03);
}

.topHitsHead{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:12px;
  padding:4px 2px 10px;
}

.topHitsHead h2{
  margin:0;
  font-size:14px;
  letter-spacing:.2px;
}

.topHitsMeta{
  color:var(--muted);
  font-size:12px;
}

.topHitsGrid{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:14px;
  align-items:start;
}

.grid{
  margin-top:16px;
  column-count:3;
  column-gap:14px;
}

.card{
  position:relative;
  background:rgba(17,26,51,.72);
  border:1px solid var(--border);
  border-radius:16px;
  padding:14px;
  transition: opacity .15s ease, filter .15s ease;
  break-inside:avoid;
  margin:0 0 14px;
}

/* Zeitliches Ausblenden */
.card.old-24{
  opacity:.75;
}
.card.old-48{
  opacity:.45;
  filter: grayscale(.15);
}
.card.old-48:hover{
  opacity:.65;
  filter:none;
}

.card.alert::before{
  content:"";
  position:absolute;
  left:0;
  top:0;
  bottom:0;
  width:6px;
  border-radius:16px 0 0 16px;
  background:linear-gradient(
    180deg,
    rgba(239,68,68,.95),
    rgba(239,68,68,.65)
  );
}

.card.isAssetHit::before{
  content:"";
  position:absolute;
  left:0;
  top:0;
  bottom:0;
  width:6px;
  border-radius:16px 0 0 16px;
  background:linear-gradient(
    180deg,
    rgba(96,165,250,.95),
    rgba(34,211,238,.65)
  );
}

.card.alert{
  box-shadow:
    0 0 0 1px rgba(239,68,68,.45),
    0 0 18px rgba(239,68,68,.22),
    0 14px 30px rgba(0,0,0,.45);
}

.card.isAssetHit{
  box-shadow:
    0 0 0 1px rgba(96,165,250,.35),
    0 12px 26px rgba(56,189,248,.18);
}

.title{
  margin:0;
  font-size:15px;
  font-weight:650;
  line-height:1.25;
}

.meta{
  margin-top:6px;
  color:var(--muted);
  font-size:12px;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

.chips{
  display:flex;
  gap:6px;
  flex-wrap:wrap;
  margin-top:10px;
}

.chip{
  font-size:11px;
  padding:4px 8px;
  border-radius:999px;
  background:rgba(255,255,255,.06);
  border:1px solid var(--border);
  white-space:nowrap;
}

.chip.good{border-color:rgba(34,197,94,.35);background:rgba(34,197,94,.14)}
.chip.bad{border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.14)}
.chip.warn{border-color:rgba(245,158,11,.35);background:rgba(245,158,11,.14)}
.chip.info{border-color:rgba(96,165,250,.35);background:rgba(96,165,250,.14)}

.chip.assetHit{
  border-color:rgba(96,165,250,.45);
  background:rgba(96,165,250,.12);
}

.chip.sentimentFilter{
  color:var(--text);
  cursor:pointer;
}

.chip.categoryFilter{
  color:var(--text);
  cursor:pointer;
}

.chip.sourceFilter{
  color:var(--text);
  cursor:pointer;
}

.chip.relevanceFilter{
  color:var(--text);
  cursor:pointer;
}

.chip.sentimentFilter.active{
  box-shadow:0 0 0 1px rgba(255,255,255,.2), 0 10px 20px rgba(0,0,0,.25);
  filter:brightness(1.08);
}

.chip.categoryFilter.active{
  box-shadow:0 0 0 1px rgba(255,255,255,.2), 0 10px 20px rgba(0,0,0,.25);
  filter:brightness(1.08);
}

.chip.sourceFilter.active{
  box-shadow:0 0 0 1px rgba(255,255,255,.2), 0 10px 20px rgba(0,0,0,.25);
  filter:brightness(1.08);
}

.chip.relevanceFilter.active{
  box-shadow:0 0 0 1px rgba(255,255,255,.2), 0 10px 20px rgba(0,0,0,.25);
  filter:brightness(1.08);
}

.assetLine{
  margin-top:10px;
  color:rgba(238,242,255,.88);
  font-size:12px;
}
.assetLine .label{
  color:var(--muted);
}

.text{
  margin:10px 0 0;
  font-size:13px;
  line-height:1.45;
  color:rgba(238,242,255,.9);
}

.text.muted{color:rgba(154,167,199,.95)}

.commentary{
  white-space:normal;
  overflow:visible;
  max-height:none;
}

.commentary.collapsed{
  display:none;
}

.footer{margin-top:12px}

a.btn, button.btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:8px 10px;
  border-radius:12px;
  border:1px solid var(--border);
  background:rgba(255,255,255,.06);
  color:var(--text);
  text-decoration:none;
  font-size:12px;
  cursor:pointer;
}

a.btn:hover, button.btn:hover{filter:brightness(1.05)}

button.btn.ghost{
  background:transparent;
}

@media(max-width:1200px){
  .layout{grid-template-columns:1fr}
  .grid{column-count:2}
  .topHitsGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:900px){
  .grid{column-count:1}
  .topHitsGrid{grid-template-columns:1fr}
  .wrap{padding:18px}
}
</style>
</head>

<body>
<div class="wrap">
  <header class="hero">
    <h1 class="titleHero">News Dashboard</h1>
    <p class="heroSubtitle">Live-Marktnachrichten, Insights und Filter auf einen Blick.</p>
  </header>

  ${filterBar}

  <div class="layout">
    <aside class="sidebar">
      ${sentimentCard}
      ${categoryCard}
      ${sourceCard}
      ${relevanceCard}
      ${placeholderCard}
    </aside>
    <main class="content">
      ${topHitsHtml}

      <section class="grid" id="grid">
        ${cardsHtml || `<div style="color:var(--muted)">Keine Meldungen vorhanden.</div>`}
      </section>
    </main>
  </div>
</div>

<script>
(function(){
  const reset = document.getElementById("reset");
  const shownEl = document.getElementById("countShown");
  const sentimentButtons = Array.from(document.querySelectorAll(".sentimentFilter"));
  const categoryButtons = Array.from(document.querySelectorAll(".categoryFilter"));
  const sourceButtons = Array.from(document.querySelectorAll(".sourceFilter"));
  const relevanceButtons = Array.from(document.querySelectorAll(".relevanceFilter"));

  const cards = Array.from(document.querySelectorAll("#grid .card"));
  let sentimentFilter = "all";
  let categoryFilter = "all";
  let sourceFilter = "all";
  let relevanceFilter = "all";

  function apply(){
    const pv = sourceFilter;

    let shown = 0;

    for(const card of cards){
      const r = Number(card.dataset.relevance || 0);
      const c = card.dataset.category || "";
      const s = card.dataset.sentiment || "";
      const p = card.dataset.source || "";
      const relOk = (relevanceFilter === "all" || r >= Number(relevanceFilter));
      const catOk = (categoryFilter === "all" || c === categoryFilter);
      const sentOk = (sentimentFilter === "all" || s === sentimentFilter);
      const srcOk  = (pv === "all" || p === pv);
      const ok = relOk && catOk && sentOk && srcOk;

      card.style.display = ok ? "" : "none";
      if(ok) shown++;
    }

    shownEl.textContent = String(shown);
  }

  function resetAll(){
    sentimentFilter = "all";
    categoryFilter = "all";
    sourceFilter = "all";
    relevanceFilter = "all";
    sentimentButtons.forEach(button => button.classList.remove("active"));
    categoryButtons.forEach(button => button.classList.remove("active"));
    sourceButtons.forEach(button => button.classList.remove("active"));
    relevanceButtons.forEach(button => button.classList.remove("active"));
    apply();
  }

  reset.addEventListener("click", resetAll);
  sentimentButtons.forEach(button => {
    button.addEventListener("click", () => {
      const next = button.dataset.sentiment || "all";
      sentimentFilter = sentimentFilter === next ? "all" : next;
      sentimentButtons.forEach(item => item.classList.toggle("active", item.dataset.sentiment === sentimentFilter));
      apply();
    });
  });
  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const next = button.dataset.category || "all";
      categoryFilter = categoryFilter === next ? "all" : next;
      categoryButtons.forEach(item => item.classList.toggle("active", item.dataset.category === categoryFilter));
      apply();
    });
  });
  sourceButtons.forEach(button => {
    button.addEventListener("click", () => {
      const next = button.dataset.source || "all";
      sourceFilter = sourceFilter === next ? "all" : next;
      sourceButtons.forEach(item => item.classList.toggle("active", item.dataset.source === sourceFilter));
      apply();
    });
  });
  relevanceButtons.forEach(button => {
    button.addEventListener("click", () => {
      const next = button.dataset.relevance || "all";
      relevanceFilter = relevanceFilter === next ? "all" : next;
      relevanceButtons.forEach(item => item.classList.toggle("active", item.dataset.relevance === relevanceFilter));
      apply();
    });
  });
  document.addEventListener("click", event => {
    const toggle = event.target.closest(".toggleCommentary");
    if (!toggle) return;
    const card = toggle.closest(".card");
    if (!card) return;
    const commentary = card.querySelector(".commentary");
    if (!commentary) return;
    const isCollapsed = toggle.dataset.state !== "expanded";
    commentary.classList.toggle("collapsed", !isCollapsed);
    toggle.dataset.state = isCollapsed ? "expanded" : "collapsed";
    toggle.textContent = isCollapsed ? "Einschätzung ausblenden" : "Einschätzung";
  });

  // initial
  apply();
})();
</script>

</body>
</html>`;

return [{ json: { html } }];
