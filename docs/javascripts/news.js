// Noticias del clúster: popup con el encabezado de los avisos críticos nuevos
// e historial con un desplegable por noticia (página novedades.md).
// La lógica son funciones puras, probadas en tests/news.test.js.

const SEEN_KEY = "ialab_seen_critical";

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function isActive(n, now) {
  if (!n.expires) return true;
  return new Date(n.expires + "T23:59:59") >= now;
}

// Críticas vigentes que este navegador todavía no ha visto
function pendingCritical(items, seenIds, now) {
  return items.filter(n => n.severity === "critical" && isActive(n, now) && !seenIds.has(n.id));
}

function anchorId(n) {
  return "noticia-" + String(n.id).replace(/[^\w-]/g, "");
}

const BRIEF_MAX = 160;

// Descripción breve: el campo "summary" o, si no hay, la primera oración del detalle (acotada)
function briefOf(n) {
  const text = String(n.summary || (n.body || "").split(/(?<=[.!?])\s/)[0] || "").trim();
  return text.length > BRIEF_MAX ? text.slice(0, BRIEF_MAX - 1).trimEnd() + "…" : text;
}

const POPUP_MAX = 3;
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
  "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function byDateDesc(items) {
  return [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

// Encabezado (título, fecha y descripción breve) de las POPUP_MAX críticas más recientes;
// el resto se cuenta y se remite al historial
function popupHtml(pending, newsPage) {
  const shown = byDateDesc(pending).slice(0, POPUP_MAX);
  const extra = pending.length - shown.length;
  const title = pending.length > 1 ? "Avisos críticos" : "Aviso crítico";
  const list = shown.map(n => `
        <li><a class="news-popup-item" href="${escapeHtml(newsPage)}#${anchorId(n)}">${escapeHtml(n.title)}</a>
          <small>${escapeHtml(n.date || "")}</small>
          <p class="news-brief">${escapeHtml(briefOf(n))}</p></li>`).join("");
  const more = extra > 0
    ? `<p class="news-popup-more">y ${extra} ${extra === 1 ? "aviso más" : "avisos más"} en el historial.</p>`
    : "";
  return `
    <div class="news-popup" role="dialog" aria-modal="true" aria-labelledby="news-popup-title">
      <h3 id="news-popup-title">⚠️ ${title}</h3>
      <ul class="news-popup-list">${list}
      </ul>${more}
      <p>Para leer los detalles, revisa el <a class="news-popup-link" href="${escapeHtml(newsPage)}">Historial de Noticias</a>.</p>
      <div class="news-popup-actions">
        <button type="button">Entendido</button>
      </div>
    </div>`;
}

function itemHtml(n, open) {
  return `
        <details class="news-item ${escapeHtml(n.severity || "info")}" id="${anchorId(n)}"${open ? " open" : ""}>
          <summary><span class="news-title">${escapeHtml(n.title)}</span> <small>${escapeHtml(n.date || "")}</small>
            <span class="news-brief">${escapeHtml(briefOf(n))}</span></summary>
          <div class="news-body">${escapeHtml(n.body || "")}</div>
        </details>`;
}

// Agrupa en orden: [{ year, months: [{ month, items }] }]; sin fecha va al final
function groupByYearMonth(items) {
  const years = [];
  for (const n of byDateDesc(items)) {
    const m = /^(\d{4})-(\d{2})/.exec(n.date || "");
    const year = m ? m[1] : "Sin fecha";
    const month = m ? MONTHS[Number(m[2]) - 1] : null;
    let y = years.find(g => g.year === year);
    if (!y) years.push(y = { year, months: [] });
    let mo = y.months.find(g => g.month === month);
    if (!mo) y.months.push(mo = { month, items: [] });
    mo.items.push(n);
  }
  return years;
}

// Historial: año > mes > noticia, todos desplegables; abiertos solo el año, el mes y la noticia más recientes
function historyHtml(items) {
  if (!items.length) return "<p>Aún no hay avisos publicados.</p>";
  return groupByYearMonth(items).map((y, yi) => {
    const count = y.months.reduce((s, m) => s + m.items.length, 0);
    const body = y.months.map((mo, mi) => {
      const list = mo.items.map((n, ni) => itemHtml(n, yi === 0 && mi === 0 && ni === 0)).join("");
      if (mo.month === null) return list; // sin fecha: sin nivel de mes
      return `
      <details class="news-month"${yi === 0 && mi === 0 ? " open" : ""}>
        <summary>${mo.month} (${mo.items.length})</summary>${list}
      </details>`;
    }).join("");
    return `
    <details class="news-year"${yi === 0 ? " open" : ""}>
      <summary>${escapeHtml(y.year)} (${count})</summary>${body}
    </details>`;
  }).join("");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { escapeHtml, isActive, pendingCritical, briefOf, popupHtml, historyHtml, groupByYearMonth, anchorId };
}

if (typeof document !== "undefined") {
  const SCRIPT_SRC = document.currentScript.src;
  const ALERTS_URL = new URL("../data/news.json", SCRIPT_SRC).href;
  const HISTORY_URL = new URL("../data/news_history.json", SCRIPT_SRC).href;
  const NEWS_PAGE = new URL("../novedades/", SCRIPT_SRC).href;
  const HISTORY_CONTAINER_ID = "news_history";

  function readSeen() {
    try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }

  function showCriticalPopup(items) {
    const seen = readSeen();
    const pending = pendingCritical(items, seen, new Date());
    if (!pending.length) return;

    const backdrop = document.createElement("div");
    backdrop.className = "news-popup-backdrop open";
    backdrop.innerHTML = popupHtml(pending, NEWS_PAGE);
    document.body.appendChild(backdrop);

    const close = () => {
      pending.forEach(n => seen.add(n.id));
      try { localStorage.setItem(SEEN_KEY, JSON.stringify([...seen])); } catch (e) { /* sin almacenamiento: volverá a aparecer */ }
      backdrop.remove();
      document.removeEventListener("keydown", esc);
    };
    function esc(e) { if (e.key === "Escape") close(); }

    backdrop.querySelector("button").onclick = close;
    backdrop.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
    backdrop.addEventListener("click", e => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", esc);
    backdrop.querySelector("button").focus();
  }

  // Si se llega con #noticia-N (desde el popup), abre ese desplegable
  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id && document.getElementById(id);
    if (!el || el.tagName !== "DETAILS") return;
    for (let d = el; d; d = d.parentElement && d.parentElement.closest("details")) d.open = true;
    el.scrollIntoView();
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} al pedir ${url}`);
    return res.json();
  }

  async function loadAlerts() {
    try {
      const data = await fetchJson(ALERTS_URL);
      showCriticalPopup(data.news || data);
    } catch (e) {
      console.warn("No se pudieron cargar los avisos:", e.message);
    }
  }

  async function loadHistory() {
    const container = document.getElementById(HISTORY_CONTAINER_ID);
    if (!container) return; // solo la página de noticias tiene historial
    try {
      const data = await fetchJson(HISTORY_URL);
      container.innerHTML = historyHtml(data.history || data);
      openFromHash();
    } catch (e) {
      console.warn("No se pudo cargar el historial:", e.message);
    }
  }

  window.addEventListener("hashchange", openFromHash);
  document.addEventListener("DOMContentLoaded", () => { loadAlerts(); loadHistory(); });
}
