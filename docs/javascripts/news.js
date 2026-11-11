const ALERTS_URL = new URL("../data/news.json", document.currentScript.src).href;
const SEEN_KEY = "ialab_seen_critical";
const NEWS_PAGE = new URL("../novedades/", document.currentScript.src).href;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function isActive(n) {
  if (!n.expires) return true;
  return new Date(n.expires + "T23:59:59") >= new Date();
}

function showCriticalPopup(items) {
  const seen = new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"));
  const pending = items.filter(n => n.severity === "critical" && !seen.has(n.id));
  if (!pending.length) return;

  const backdrop = document.createElement("div");
  backdrop.className = "news-popup-backdrop open";
  backdrop.innerHTML = `
    <div class="news-popup" role="dialog" aria-modal="true" aria-labelledby="news-popup-title">
      <h3 id="news-popup-title">⚠️ ${pending.length > 1 ? "Avisos críticos" : escapeHtml(pending[0].title)}</h3>
      ${pending.map(n => `<p><strong>${escapeHtml(n.title)}</strong><br>${escapeHtml(n.body || "")}</p>`).join("")}
      <div class="news-popup-actions">
        <a class="news-popup-link" href="${NEWS_PAGE}">Ver sección de noticias</a>
        <button type="button">Entendido</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);

  const close = () => {
    pending.forEach(n => seen.add(n.id));
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
    backdrop.remove();
  };

  backdrop.querySelector("button").onclick = close;
  backdrop.querySelector(".news-popup-link").addEventListener("click", close);
  backdrop.addEventListener("click", e => { if (e.target === backdrop) close(); });
  document.addEventListener("keydown", function esc(e) {
    if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
  });
}

async function loadAlerts() {
  try {
    const res = await fetch(ALERTS_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = (data.news || data).filter(isActive);
    showCriticalPopup(items);
  } catch (e) {
    console.warn("No se pudieron cargar los avisos:", e.message);
  }
}

const HISTORY_URL = new URL("../data/news_history.json", document.currentScript.src).href;

const HISTORY_CONTAINER_ID = "news_history";

function renderHistory(items) {
  const container = document.getElementById(HISTORY_CONTAINER_ID);
  if (!container) return;
  const sorted = [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  container.innerHTML = sorted.map(n => `
    <article class="news-item ${escapeHtml(n.severity)}">
      <h4>${escapeHtml(n.title)}</h4>
      <div>${escapeHtml(n.body || "")}</div>
      <small>${escapeHtml(n.date || "")}</small>
    </article>`).join("") || "<p>Aún no hay avisos publicados.</p>";
}

async function loadHistory() {
  if (!document.getElementById(HISTORY_CONTAINER_ID)) return; // solo la página de noticias tiene historial
  try {
    const res = await fetch(HISTORY_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} al pedir ${HISTORY_URL}`);
    const data = await res.json();
    renderHistory(data.history || data);
  } catch (e) {
    console.warn("No se pudo cargar el historial:", e.message);
  }
}

document.addEventListener("DOMContentLoaded", () => { loadAlerts(); loadHistory(); });
