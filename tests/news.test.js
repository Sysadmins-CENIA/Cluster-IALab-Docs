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
  const html = news.historyHtml(items);
  assert.equal((html.match(/<details class="news-item\b/g) || []).length, 4);
  assert.match(html, /<details[^>]*id="noticia-1"[\s\S]*<summary[\s\S]*Nueva cola long[\s\S]*<\/summary>[\s\S]*Detalle largo de la cola long/);
});

test("el historial va de la más reciente a la más antigua", () => {
  const html = news.historyHtml(items);
  const order = [...html.matchAll(/id="noticia-(\d+)"/g)].map(m => m[1]);
  assert.deepEqual(order, ["4", "2", "1", "3"]);
});

test("el historial escapa el HTML de título y detalle", () => {
  const html = news.historyHtml([{ id: "x", severity: "info", title: "<b>t</b>", body: "<script>alert(1)</script>", date: "2026-11-01" }]);
  assert.doesNotMatch(html, /<script>|<b>t<\/b>/);
});

test("historial vacío muestra un mensaje", () => {
  assert.match(news.historyHtml([]), /Aún no hay avisos publicados/);
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
  const html = news.historyHtml(items);
  const abiertos = [...html.matchAll(/<details( class="news-item[^>]*)>/g)].filter(m => /\bopen\b/.test(m[1]));
  assert.equal(abiertos.length, 1);
  assert.match(abiertos[0][1], /id="noticia-4"/); // 2026-11-20, la más reciente
});

test("el historial muestra la descripción breve en el encabezado del desplegable", () => {
  const html = news.historyHtml([{ id: "9", severity: "info", title: "T", summary: "Resumen corto.", body: "Detalle.", date: "2026-11-21" }]);
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

// ---- Historial agrupado por año y mes ----
const variadas = [
  { id: "a", severity: "info", title: "A", date: "2026-11-20" },
  { id: "b", severity: "info", title: "B", date: "2026-11-02" },
  { id: "c", severity: "info", title: "C", date: "2026-10-22" },
  { id: "d", severity: "info", title: "D", date: "2025-12-05" },
  { id: "e", severity: "info", title: "E" },
];

test("el historial agrupa por año y, dentro, por mes, de lo más reciente a lo más antiguo", () => {
  const html = news.historyHtml(variadas);
  const grupos = [...html.matchAll(/<details class="news-(year|month)"[^>]*>\s*<summary>([^<]+)/g)].map(m => m[1] + ":" + m[2].trim());
  assert.deepEqual(grupos, ["year:2026 (3)", "month:Noviembre (2)", "month:Octubre (1)", "year:2025 (1)", "month:Diciembre (1)", "year:Sin fecha (1)"]);
});

test("solo el año y el mes más recientes vienen abiertos", () => {
  const html = news.historyHtml(variadas);
  const abiertos = [...html.matchAll(/<details class="news-(year|month)"([^>]*)>\s*<summary>([^<]+)/g)]
    .filter(m => /\bopen\b/.test(m[2])).map(m => m[3].trim());
  assert.deepEqual(abiertos, ["2026 (3)", "Noviembre (2)"]);
});

test("cada noticia queda dentro de su mes", () => {
  const html = news.historyHtml(variadas);
  const oct = html.slice(html.indexOf("Octubre"), html.indexOf("2025 ("));
  assert.match(oct, /id="noticia-c"/);
  assert.doesNotMatch(oct, /id="noticia-(a|b|d)"/);
});
