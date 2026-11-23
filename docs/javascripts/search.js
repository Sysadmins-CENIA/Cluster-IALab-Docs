(function () {
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
  fetch(INDEX_URL).then(r => r.json()).then(data => {
    docs = data.docs.map(d => ({
      title: d.title || "",
      location: d.location,
      words: new Set((d.title + " " + d.text).toLowerCase().split(/[^\wáéíóúñü]+/).filter(Boolean))
    }));
  });

  function trigrams(s) {
    const t = ` ${s.toLowerCase()} `;
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

  function score(doc, query) {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    let total = 0;
    for (const q of tokens) {
      const qTri = trigrams(q);
      let best = 0;
      for (const w of doc.words) {
        const s = w.includes(q) ? 1 : similarity(qTri, w);
        if (s > best) best = s;
      }
      if (best < 0.5) return 0; // cada término debe parecerse a alguna palabra
      total += best;
    }
    return total / tokens.length;
  }

  function render(query) {
    if (!docs || !query.trim()) {
      results.hidden = true;
      return [];
    }
    const ranked = docs
      .map(d => ({ d, s: score(d, query) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8);

    results.innerHTML = ranked.length ? "" : '<p class="fuzzy-empty">Sin resultados</p>';
    ranked.forEach(x => {
      const a = document.createElement("a");
      a.href = new URL(x.d.location, ROOT).href;
      a.textContent = x.d.title || x.d.location; // los títulos pueden traer "<...>" ya decodificado
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