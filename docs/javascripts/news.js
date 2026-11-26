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
          ${dateHtml(n)}
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

const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const TAGS = { critical: "Crítico", warning: "Aviso", info: "Info" };

// "2026-11-20" → "20 nov 2026"
function shortDate(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date || "");
  return m ? `${Number(m[3])} ${MONTHS_SHORT[Number(m[2]) - 1]} ${m[1]}` : "";
}

function dateHtml(n) {
  return n.date ? `<time datetime="${escapeHtml(n.date)}">${escapeHtml(shortDate(n.date))}</time>` : "";
}

// Una línea para recorrer con la vista: tipo, título y fecha; debajo la descripción breve; el detalle al desplegar
function itemHtml(n, open) {
  const sev = TAGS[n.severity] ? n.severity : "info";
  return `
      <details class="news-item ${sev}" id="${anchorId(n)}"${open ? " open" : ""}>
        <summary>
          <span class="news-line"><span class="news-tag ${sev}">${TAGS[sev]}</span>
            <span class="news-title">${escapeHtml(n.title)}</span>${dateHtml(n)}</span>
          <span class="news-brief">${escapeHtml(briefOf(n))}</span>
        </summary>
        <div class="news-body">${escapeHtml(n.body || "")}</div>
      </details>`;
}

function monthTitle(n) {
  const m = /^(\d{4})-(\d{2})/.exec(n.date || "");
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : "Sin fecha";
}

// Lista simple: un título fijo por mes y las noticias debajo; firstOpen abre la primera
function listHtml(items, firstOpen) {
  let current = null;
  return items.map((n, i) => {
    const title = monthTitle(n);
    const header = title !== current ? `
      <h3 class="news-month-title">${title}</h3>` : "";
    current = title;
    return header + itemHtml(n, firstOpen && i === 0);
  }).join("");
}

const PAGE_SIZE = 10;

// state: { year: "2026", month: "11" } (strings; vacío = todos)
function filterItems(items, state) {
  return byDateDesc(items).filter(n => {
    const m = /^(\d{4})-(\d{2})/.exec(n.date || "");
    if (state.year && (!m || m[1] !== state.year)) return false;
    if (state.month && (!m || m[2] !== state.month)) return false;
    return true;
  });
}

// Años con noticias y meses con noticias (dentro del año elegido, si lo hay); de lo más reciente a lo más antiguo
function filterOptions(items, state) {
  const dated = items.map(n => /^(\d{4})-(\d{2})/.exec(n.date || "")).filter(Boolean);
  const years = [...new Set(dated.map(m => m[1]))].sort().reverse();
  const months = [...new Set(dated.filter(m => !state.year || m[1] === state.year).map(m => m[2]))]
    .sort().reverse().map(v => ({ value: v, label: MONTHS[Number(v) - 1] }));
  return { years, months };
}

// Cuántas mostrar para que se vea una noticia (al llegar desde el popup), en tandas de PAGE_SIZE
function limitFor(items, id, size = PAGE_SIZE) {
  const i = byDateDesc(items).findIndex(n => String(n.id) === String(id));
  return i < 0 ? size : (Math.floor(i / size) + 1) * size;
}

function moreHtml(shown, total) {
  if (shown >= total) return "";
  const next = Math.min(PAGE_SIZE, total - shown);
  return `
    <div class="news-more-bar">
      <button type="button" class="news-more">Mostrar ${next} más</button>
      <span class="news-count">${shown} de ${total} noticias</span>
    </div>`;
}

function filtersHtml(options, state) {
  const opt = (v, label, sel) => `<option value="${escapeHtml(v)}"${sel ? " selected" : ""}>${escapeHtml(label)}</option>`;
  return `
    <form class="news-filters" role="search" aria-label="Filtrar noticias">
      <label>Año <select name="anio">${opt("", "Todos los años", !state.year)}${options.years.map(y => opt(y, y, y === state.year)).join("")}</select></label>
      <label>Mes <select name="mes">${opt("", "Todos los meses", !state.month)}${options.months.map(m => opt(m.value, m.label, m.value === state.month)).join("")}</select></label>
    </form>`;
}

// Historial filtrado: las primeras state.limit noticias (10 por defecto) y un botón para mostrar más
function historyPageHtml(items, state) {
  if (!items.length) return "<p>Aún no hay avisos publicados.</p>";
  const filtered = filterItems(items, state);
  if (!filtered.length) return "<p>No hay noticias para ese filtro.</p>";
  const shown = filtered.slice(0, Math.max(PAGE_SIZE, Number(state.limit) || PAGE_SIZE));
  return `<div class="news-list">${listHtml(shown, true)}</div>` + moreHtml(shown.length, filtered.length);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    escapeHtml, isActive, pendingCritical, briefOf, popupHtml, anchorId, shortDate,
    filterItems, filterOptions, limitFor, filtersHtml, historyPageHtml,
  };
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

  // Filtros en la URL: ?anio=2026&mes=11 (se puede compartir y volver atrás); "Mostrar más" no cambia la URL
  function readState() {
    const q = new URLSearchParams(location.search);
    return { year: q.get("anio") || "", month: q.get("mes") || "" };
  }

  function writeState(state) {
    const q = new URLSearchParams();
    if (state.year) q.set("anio", state.year);
    if (state.month) q.set("mes", state.month);
    const qs = q.toString();
    history.pushState(null, "", location.pathname + (qs ? "?" + qs : ""));
  }

  function renderHistory(container, items, state) {
    container.innerHTML = filtersHtml(filterOptions(items, state), state)
      + historyPageHtml(items, state);

    container.querySelectorAll(".news-filters select").forEach(sel => sel.addEventListener("change", () => {
      const next = { ...state, limit: 0, [sel.name === "anio" ? "year" : "month"]: sel.value };
      // Si el mes elegido no tiene noticias en el año nuevo, se quita el filtro de mes
      if (next.month && !filterOptions(items, next).months.some(m => m.value === next.month)) next.month = "";
      writeState(next);
      renderHistory(container, items, next);
    }));

    const more = container.querySelector(".news-more");
    if (more) more.addEventListener("click", () => {
      const shown = container.querySelectorAll(".news-item").length;
      renderHistory(container, items, { ...state, limit: shown + PAGE_SIZE });
      // El foco pasa a la primera noticia nueva para seguir leyendo desde ahí
      const first = container.querySelectorAll(".news-item summary")[shown];
      if (first) first.focus();
    });
  }

  async function loadHistory() {
    const container = document.getElementById(HISTORY_CONTAINER_ID);
    if (!container) return; // solo la página de noticias tiene historial
    try {
      const data = await fetchJson(HISTORY_URL);
      const items = data.history || data;
      const hashId = decodeURIComponent(location.hash.slice(1)).replace(/^noticia-/, "");
      // Desde el popup (#noticia-N): sin filtros y mostrando hasta esa noticia
      const state = location.hash.startsWith("#noticia-")
        ? { year: "", month: "", limit: limitFor(items, hashId) }
        : readState();
      renderHistory(container, items, state);
      window.addEventListener("popstate", () => renderHistory(container, items, readState()));
      openFromHash();
    } catch (e) {
      console.warn("No se pudo cargar el historial:", e.message);
    }
  }

  window.addEventListener("hashchange", openFromHash);
  document.addEventListener("DOMContentLoaded", () => { loadAlerts(); loadHistory(); });
}
