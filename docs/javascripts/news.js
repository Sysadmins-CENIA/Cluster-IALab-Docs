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

// Solo el encabezado (título y fecha); el detalle está en el historial
function popupHtml(pending, newsPage) {
  const title = pending.length > 1 ? "Avisos críticos" : "Aviso crítico";
  const list = pending.map(n => `
        <li><a class="news-popup-item" href="${escapeHtml(newsPage)}#${anchorId(n)}">${escapeHtml(n.title)}</a>
          <small>${escapeHtml(n.date || "")}</small></li>`).join("");
  return `
    <div class="news-popup" role="dialog" aria-modal="true" aria-labelledby="news-popup-title">
      <h3 id="news-popup-title">⚠️ ${title}</h3>
      <ul class="news-popup-list">${list}
      </ul>
      <p>Para leer los detalles, revisa el <a class="news-popup-link" href="${escapeHtml(newsPage)}">Historial de Noticias</a>.</p>
      <div class="news-popup-actions">
        <button type="button">Entendido</button>
      </div>
    </div>`;
}

// Un desplegable (<details>) por noticia, de la más reciente a la más antigua
function historyHtml(items) {
  const sorted = [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return sorted.map(n => `
    <details class="news-item ${escapeHtml(n.severity || "info")}" id="${anchorId(n)}">
      <summary><span class="news-title">${escapeHtml(n.title)}</span> <small>${escapeHtml(n.date || "")}</small></summary>
      <div class="news-body">${escapeHtml(n.body || "")}</div>
    </details>`).join("") || "<p>Aún no hay avisos publicados.</p>";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { escapeHtml, isActive, pendingCritical, popupHtml, historyHtml, anchorId };
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
    if (el && el.tagName === "DETAILS") { el.open = true; el.scrollIntoView(); }
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
