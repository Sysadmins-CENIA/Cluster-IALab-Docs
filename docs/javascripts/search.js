// Buscador tolerante a errores sobre el índice de MkDocs (search/search_index.json).
// La lógica son funciones puras, probadas en tests/search.test.js.

const MIN_MATCH = 0.6;

// Palabras vacías: no aportan para ordenar ("política de uso" → "política", "uso")
const STOPWORDS = new Set("a al con de del el en la las lo los o para por se su un una y".split(" "));

// Minúsculas y sin tildes, para que "politica" encuentre "política"
function normalize(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Mismo corte para el texto y para la consulta ("qos=long" → "qos", "long")
function tokenize(s) {
  return normalize(s).split(/[^a-z0-9]+/).filter(Boolean);
}

function countWords(text) {
  const counts = new Map();
  tokenize(text).forEach(w => counts.set(w, (counts.get(w) || 0) + 1));
  return counts;
}

function buildDocs(index) {
  return index.docs.map(d => ({
    title: d.title || "",
    location: d.location,
    titleWords: new Set(tokenize(d.title || "")),
    words: countWords((d.title || "") + " " + (d.text || ""))
  }));
}

function trigrams(s) {
  const t = ` ${s} `;
  const out = new Set();
  for (let i = 0; i < t.length - 2; i++) out.add(t.slice(i, i + 3));
  return out;
}

function similarity(qTri, word) {
  const wTri = trigrams(word);
  let hit = 0;
  qTri.forEach(g => { if (wTri.has(g)) hit++; });
  return hit / qTri.size;
}

// Qué tan bien calza un término con una palabra: exacta 1, contenida 0.9, parecida (trigramas) < 0.9
function match(q, qTri, w) {
  if (w === q) return 1;
  if (w.includes(q)) return 0.9;
  return Math.min(similarity(qTri, w), 0.85);
}

function bestMatch(q, words) {
  const qTri = trigrams(q);
  let best = 0, bestWord = null;
  for (const w of words) {
    const m = match(q, qTri, w);
    if (m > best) { best = m; bestWord = w; }
  }
  return { best, bestWord };
}

// Términos de 1 letra no filtran nada (toda palabra contiene una "a")
function queryTerms(query) {
  const all = tokenize(query).filter(t => t.length > 1);
  const useful = all.filter(t => !STOPWORDS.has(t));
  return useful.length ? useful : all;
}

// Cada término debe parecerse a alguna palabra del documento; el título pesa más,
// y a igual calce desempata cuántas veces aparece la palabra.
function score(doc, query) {
  const terms = queryTerms(query);
  if (!terms.length) return 0;
  let total = 0;
  for (const q of terms) {
    const { best, bestWord } = bestMatch(q, doc.words.keys());
    // 0.6: tolera un error de tipeo ("slurn" → "slurm") sin confundir palabras distintas ("privacidad" ≠ "prioridad")
    if (best < MIN_MATCH) return 0;
    const inTitle = bestMatch(q, doc.titleWords).best;
    const freq = Math.log1p(doc.words.get(bestWord) || 0) / 10;
    total += best + (inTitle >= MIN_MATCH ? 2 * inTitle : 0) + freq;
  }
  return total / terms.length;
}

function rank(docs, query) {
  if (!docs || !query.trim()) return [];
  return docs
    .map(d => ({ title: d.title, location: d.location, score: score(d, query) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { normalize, tokenize, buildDocs, trigrams, similarity, score, rank };
}

if (typeof document !== "undefined") (function () {
  const ROOT = new URL("../", document.currentScript.src).href;
  const INDEX_URL = ROOT + "search/search_index.json";

  const box = document.querySelector(".wy-side-nav-search");
  if (!box) return;

  // Oculta el buscador original del tema y usa el propio
  const original = box.querySelector("form");
  if (original) original.style.display = "none";

  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Buscar en la documentación";
  input.className = "fuzzy-search-input";

  const results = document.createElement("div");
  results.className = "fuzzy-results";
  results.hidden = true;

  box.append(input, results);

  let docs = null;
  fetch(INDEX_URL).then(r => r.json()).then(data => { docs = buildDocs(data); });

  function render(query) {
    if (!docs || !query.trim()) {
      results.hidden = true;
      return [];
    }
    const ranked = rank(docs, query);
    results.innerHTML = ranked.length ? "" : '<p class="fuzzy-empty">Sin resultados</p>';
    ranked.forEach(x => {
      const a = document.createElement("a");
      a.href = new URL(x.location, ROOT).href;
      a.textContent = x.title || x.location; // los títulos pueden traer "<...>" ya decodificado
      results.appendChild(a);
    });
    results.hidden = false;
    return ranked;
  }

  input.addEventListener("input", () => render(input.value));

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const first = results.querySelector("a");
      if (first) window.location.href = first.href;
    }
    if (e.key === "Escape") {
      input.value = "";
      results.hidden = true;
    }
  });
})();
