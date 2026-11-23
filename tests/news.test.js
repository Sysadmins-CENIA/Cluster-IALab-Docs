// Pruebas de docs/javascripts/news.js. Ejecutar: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const news = require("../docs/javascripts/news.js");

const NOW = new Date("2026-11-23T12:00:00");
const items = [
  { id: "1", severity: "critical", title: "Nueva cola long", body: "Detalle largo de la cola long. Segunda oración con más detalle.", date: "2026-11-10", expires: "2026-12-10" },
  { id: "2", severity: "info", title: "Mantención menor", body: "Detalle info.", date: "2026-11-12" },
  { id: "3", severity: "critical", title: "Caída de hydra", body: "Detalle de hydra.", date: "2026-11-01", expires: "2026-11-05" },
  { id: "4", severity: "critical", title: "Corte <eléctrico>", body: "Detalle del corte.", date: "2026-11-20" },
];

test("el popup solo considera críticas, vigentes y no vistas", () => {
  const p = news.pendingCritical(items, new Set(["4"]), NOW);
  assert.deepEqual(p.map(n => n.id), ["1"]); // 2 es info, 3 venció, 4 ya se vio
});

test("sin críticas nuevas no hay popup", () => {
  assert.deepEqual(news.pendingCritical(items, new Set(["1", "4"]), NOW), []);
});

test("el popup muestra el encabezado y no el detalle completo", () => {
  const html = news.popupHtml(news.pendingCritical(items, new Set(), NOW), "/novedades/");
  assert.match(html, /Nueva cola long/);
  assert.match(html, /Corte &lt;eléctrico&gt;/); // escapado
  assert.doesNotMatch(html, /Segunda oración con más detalle/); // solo la descripción breve
});

test("el popup remite al historial, con enlace a cada noticia", () => {
  const html = news.popupHtml([items[0]], "/novedades/");
  assert.match(html, /Historial de Noticias/);
  assert.match(html, /href="\/novedades\/#noticia-1"/);
});

test("el historial muestra cada noticia como desplegable con el detalle dentro", () => {
  const html = news.historyPageHtml(items, {});
  assert.equal((html.match(/<details class="news-item\b/g) || []).length, 4);
  assert.match(html, /<details[^>]*id="noticia-1"[\s\S]*<summary[\s\S]*Nueva cola long[\s\S]*<\/summary>[\s\S]*Detalle largo de la cola long/);
});

test("el historial va de la más reciente a la más antigua", () => {
  const html = news.historyPageHtml(items, {});
  const order = [...html.matchAll(/id="noticia-(\d+)"/g)].map(m => m[1]);
  assert.deepEqual(order, ["4", "2", "1", "3"]);
});

test("el historial escapa el HTML de título y detalle", () => {
  const html = news.historyPageHtml([{ id: "x", severity: "info", title: "<b>t</b>", body: "<script>alert(1)</script>", date: "2026-11-01" }], {});
  assert.doesNotMatch(html, /<script>|<b>t<\/b>/);
});

test("historial vacío muestra un mensaje", () => {
  assert.match(news.historyPageHtml([], {}), /Aún no hay avisos publicados/);
});

test("el popup muestra la descripción breve (summary) bajo cada encabezado, no el detalle", () => {
  const n = { id: "9", severity: "critical", title: "Corte", summary: "Kraken sin acceso el sábado 9-13 h.", body: "Detalle completo del corte.", date: "2026-11-21" };
  const html = news.popupHtml([n], "/novedades/");
  assert.match(html, /Kraken sin acceso el sábado 9-13 h\./);
  assert.doesNotMatch(html, /Detalle completo/);
});

test("sin summary, el popup usa la primera oración del detalle, acotada", () => {
  const n = { id: "8", severity: "critical", title: "T", body: "Primera oración corta. Segunda oración que no va.", date: "2026-11-21" };
  const html = news.popupHtml([n], "/novedades/");
  assert.match(html, /Primera oración corta\./);
  assert.doesNotMatch(html, /Segunda oración/);
  const largo = { ...n, body: "x".repeat(400) };
  assert.ok(news.briefOf(largo).length <= 160);
});

test("el historial abre por defecto solo la noticia más reciente", () => {
  const html = news.historyPageHtml(items, {});
  const abiertos = [...html.matchAll(/<details( class="news-item[^>]*)>/g)].filter(m => /\bopen\b/.test(m[1]));
  assert.equal(abiertos.length, 1);
  assert.match(abiertos[0][1], /id="noticia-4"/); // 2026-11-20, la más reciente
});

test("el historial muestra la descripción breve en el encabezado del desplegable", () => {
  const html = news.historyPageHtml([{ id: "9", severity: "info", title: "T", summary: "Resumen corto.", body: "Detalle.", date: "2026-11-21" }], {});
  assert.match(html, /<summary>[\s\S]*Resumen corto\.[\s\S]*<\/summary>/);
});

// ---- Tope del popup ----
const criticas = n => Array.from({ length: n }, (_, i) => ({
  id: "c" + i, severity: "critical", title: "Crítica " + i, summary: "Resumen " + i,
  date: `2026-11-${String(10 + i).padStart(2, "0")}`,
}));

test("el popup muestra como máximo 3 críticas, las más recientes primero", () => {
  const html = news.popupHtml(criticas(5), "/novedades/");
  const titulos = [...html.matchAll(/class="news-popup-item"[^>]*>([^<]+)</g)].map(m => m[1]);
  assert.deepEqual(titulos, ["Crítica 4", "Crítica 3", "Crítica 2"]);
});

test("si hay más de 3, el popup avisa cuántas faltan y remite al historial", () => {
  const html = news.popupHtml(criticas(5), "/novedades/");
  assert.match(html, /y 2 avisos más/);
  assert.doesNotMatch(news.popupHtml(criticas(3), "/novedades/"), /avisos? más/);
  assert.match(news.popupHtml(criticas(4), "/novedades/"), /y 1 aviso más/);
});

// ---- Filtros y paginación ----
// 23 noticias: 2026-11 (8), 2026-10 (7), 2025-11 (5), 2025-03 (3)
const muchas = [
  ...Array.from({ length: 8 }, (_, i) => ({ id: "n" + i, title: "N" + i, date: `2026-11-${String(28 - i).padStart(2, "0")}` })),
  ...Array.from({ length: 7 }, (_, i) => ({ id: "o" + i, title: "O" + i, date: `2026-10-${String(28 - i).padStart(2, "0")}` })),
  ...Array.from({ length: 5 }, (_, i) => ({ id: "p" + i, title: "P" + i, date: `2025-11-${String(28 - i).padStart(2, "0")}` })),
  ...Array.from({ length: 3 }, (_, i) => ({ id: "q" + i, title: "Q" + i, date: `2025-03-${String(28 - i).padStart(2, "0")}` })),
];

test("filtrar por año, por mes, por ambos o sin filtro", () => {
  assert.equal(news.filterItems(muchas, {}).length, 23);
  assert.equal(news.filterItems(muchas, { year: "2025" }).length, 8);
  assert.equal(news.filterItems(muchas, { month: "11" }).length, 13); // noviembre de todos los años
  assert.deepEqual(news.filterItems(muchas, { year: "2026", month: "10" }).map(n => n.id), ["o0", "o1", "o2", "o3", "o4", "o5", "o6"]);
});

test("opciones de filtro: años de más reciente a más antiguo y meses con noticias", () => {
  const o = news.filterOptions(muchas, {});
  assert.deepEqual(o.years, ["2026", "2025"]);
  assert.deepEqual(o.months.map(m => m.label), ["Noviembre", "Octubre", "Marzo"]);
  assert.deepEqual(news.filterOptions(muchas, { year: "2025" }).months.map(m => m.value), ["11", "03"]);
});

// ---- "Mostrar más" (en lugar de páginas) ----
const visibles = h => (h.match(/<details class="news-item\b/g) || []).length;

test("primero se ven 10 noticias y un botón para mostrar 10 más, con el conteo", () => {
  const html = news.historyPageHtml(muchas, {});
  assert.equal(visibles(html), 10);
  assert.match(html, /<button[^>]*class="news-more"[^>]*>Mostrar 10 más<\/button>/);
  assert.match(html, /10 de 23 noticias/);
});

test("con un límite mayor se ven más en la misma lista; el botón ofrece solo las que faltan", () => {
  const html = news.historyPageHtml(muchas, { limit: 20 });
  assert.equal(visibles(html), 20);
  assert.match(html, />Mostrar 3 más</);
});

test("cuando ya se ven todas no hay botón", () => {
  const html = news.historyPageHtml(muchas, { limit: 30 });
  assert.equal(visibles(html), 23);
  assert.doesNotMatch(html, /news-more/);
  assert.doesNotMatch(news.historyPageHtml(muchas, { year: "2025", month: "03" }), /news-more/);
});

test("no hay páginas: nada de 'Página X de Y'", () => {
  assert.doesNotMatch(news.historyPageHtml(muchas, {}), /Página \d+ de/);
});

test("la noticia más reciente viene abierta, también al mostrar más", () => {
  const abiertas = h => [...h.matchAll(/<details class="news-item[^"]*" id="([^"]+)"([^>]*)>/g)].filter(m => /\bopen\b/.test(m[2])).map(m => m[1]);
  assert.deepEqual(abiertas(news.historyPageHtml(muchas, {})), ["noticia-n0"]);
  assert.deepEqual(abiertas(news.historyPageHtml(muchas, { limit: 20 })), ["noticia-n0"]);
});

test("el conteo respeta el filtro", () => {
  assert.match(news.historyPageHtml(muchas, { month: "11" }), /10 de 13 noticias/);
});

test("limitFor: cuántas mostrar para que se vea una noticia (desde el popup)", () => {
  assert.equal(news.limitFor(muchas, "n0"), 10);
  assert.equal(news.limitFor(muchas, "o5"), 20);
  assert.equal(news.limitFor(muchas, "q2"), 30);
  assert.equal(news.limitFor(muchas, "no-existe"), 10);
});

test("selectores de filtro: 'Todos' más las opciones, con la elegida marcada", () => {
  const html = news.filtersHtml(news.filterOptions(muchas, { year: "2025" }), { year: "2025", month: "11" });
  assert.match(html, /<select[^>]*name="anio"[\s\S]*<option value="">Todos los años<\/option>[\s\S]*<option value="2025" selected>2025<\/option>/);
  assert.match(html, /<select[^>]*name="mes"[\s\S]*<option value="">Todos los meses<\/option>[\s\S]*<option value="11" selected>Noviembre<\/option>/);
  assert.doesNotMatch(html, /value="10"/); // octubre no tiene noticias en 2025
});

// ---- Lista simple con separadores de mes ----
const variadas = [
  { id: "a", severity: "critical", title: "A", date: "2026-11-20" },
  { id: "b", severity: "info", title: "B", date: "2026-11-02" },
  { id: "c", severity: "warning", title: "C", date: "2026-10-22" },
  { id: "d", title: "D", date: "2025-12-05" },
  { id: "e", severity: "info", title: "E" },
];

test("los meses son títulos fijos (no desplegables), de lo más reciente a lo más antiguo", () => {
  const html = news.historyPageHtml(variadas, {});
  const meses = [...html.matchAll(/<h3 class="news-month-title">([^<]+)<\/h3>/g)].map(m => m[1]);
  assert.deepEqual(meses, ["Noviembre 2026", "Octubre 2026", "Diciembre 2025", "Sin fecha"]);
  assert.doesNotMatch(html, /<details class="news-(year|month)"/);
});

test("cada noticia va bajo el título de su mes", () => {
  const html = news.historyPageHtml(variadas, {});
  const oct = html.slice(html.indexOf("Octubre 2026"), html.indexOf("Diciembre 2025"));
  assert.match(oct, /id="noticia-c"/);
  assert.doesNotMatch(oct, /id="noticia-(a|b|d|e)"/);
});

test("la fecha se muestra corta y legible: 20 nov 2026", () => {
  assert.equal(news.shortDate("2026-11-20"), "20 nov 2026");
  assert.equal(news.shortDate("2026-01-05"), "5 ene 2026");
  assert.equal(news.shortDate(""), "");
  const html = news.historyPageHtml(variadas, {});
  assert.match(html, /<time datetime="2026-11-20">20 nov 2026<\/time>/);
  assert.doesNotMatch(html, />2026-11-20</);
});

test("cada noticia tiene una etiqueta de tipo con texto (no solo color)", () => {
  const html = news.historyPageHtml(variadas, {});
  const tag = id => (html.match(new RegExp(`id="noticia-${id}"[\\s\\S]*?class="news-tag [a-z]+">([^<]+)<`)) || [])[1];
  assert.equal(tag("a"), "Crítico");
  assert.equal(tag("b"), "Info");
  assert.equal(tag("c"), "Aviso");
  assert.equal(tag("d"), "Info"); // sin severidad = info
});

test("sin noticias publicadas y sin resultados del filtro son mensajes distintos", () => {
  assert.match(news.historyPageHtml([], {}), /Aún no hay avisos publicados/);
  assert.match(news.historyPageHtml(variadas, { year: "2024" }), /No hay noticias para ese filtro/);
});
