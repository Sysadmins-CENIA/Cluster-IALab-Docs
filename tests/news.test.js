// Pruebas de docs/javascripts/news.js. Ejecutar: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const news = require("../docs/javascripts/news.js");

const NOW = new Date("2026-11-23T12:00:00");
const items = [
  { id: "1", severity: "critical", title: "Nueva cola long", body: "Detalle largo de la cola long.", date: "2026-11-10", expires: "2026-12-10" },
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

test("el popup muestra el encabezado y no el detalle", () => {
  const html = news.popupHtml(news.pendingCritical(items, new Set(), NOW), "/novedades/");
  assert.match(html, /Nueva cola long/);
  assert.match(html, /Corte &lt;eléctrico&gt;/); // escapado
  assert.doesNotMatch(html, /Detalle/); // sin el cuerpo de la noticia
});

test("el popup remite al historial, con enlace a cada noticia", () => {
  const html = news.popupHtml([items[0]], "/novedades/");
  assert.match(html, /Historial de Noticias/);
  assert.match(html, /href="\/novedades\/#noticia-1"/);
});

test("el historial muestra cada noticia como desplegable con el detalle dentro", () => {
  const html = news.historyHtml(items);
  assert.equal((html.match(/<details\b/g) || []).length, 4);
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
