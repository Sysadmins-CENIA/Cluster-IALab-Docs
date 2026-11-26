// Pruebas del buscador (docs/javascripts/search.js) contra el índice real del sitio.
// Ejecutar: node --test tests/   (compila el sitio con `uv run mkdocs build` en un directorio temporal)
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const search = require("../docs/javascripts/search.js");

const out = fs.mkdtempSync(path.join(os.tmpdir(), "ialab-site-"));
execFileSync("uv", ["run", "--quiet", "mkdocs", "build", "-q", "-d", out], { cwd: path.join(__dirname, "..") });
const docs = search.buildDocs(JSON.parse(fs.readFileSync(path.join(out, "search", "search_index.json"), "utf8")));
fs.rmSync(out, { recursive: true, force: true });

const top = (q, n = 3) => search.rank(docs, q).slice(0, n).map(r => r.location);
const expectTop = (q, page) => {
  const got = top(q);
  assert.ok(got.some(l => l.startsWith(page)), `"${q}" debía traer ${page} entre los 3 primeros; trajo ${JSON.stringify(got)}`);
};

test("palabra exacta: claude → asistentes de IA", () => expectTop("claude", "instructions-and-guides/ai_assistants/"));
test("con guiones: --comment → asistentes de IA", () => expectTop("--comment", "instructions-and-guides/ai_assistants/"));
test("con signo igual: qos=long → políticas de SLURM", () => expectTop("qos=long", "instructions-and-guides/slurm_policies/"));
test("varias palabras: política de uso → política de uso", () => expectTop("política de uso", "usage_policy/"));
test("sin tildes: politica de uso → política de uso", () => expectTop("politica de uso", "usage_policy/"));
test("mayúsculas: ACL → compartir con ACL", () => expectTop("ACL", "instructions-and-guides/acl/"));
test("error de tipeo: slurn → SLURM", () => expectTop("slurn", "instructions-and-guides/slurm"));
test("palabra del cuerpo: preempteable → políticas de SLURM", () => expectTop("preempteable", "instructions-and-guides/slurm_policies/"));
test("cuota → almacenamiento", () => expectTop("cuota", "storage/"));
test("noticias → historial de noticias", () => expectTop("noticias", "novedades/"));
test("palabra inexistente no trae resultados", () => assert.deepEqual(top("zzqxw"), []));
test("consulta vacía no trae resultados", () => assert.deepEqual(top("   "), []));
test("todas las palabras deben estar: claude zzqxw → nada", () => assert.deepEqual(top("claude zzqxw"), []));
test("la tolerancia a errores no confunde palabras distintas: privacidad ≠ prioridad", () => {
  assert.ok(!search.rank(docs, "privacidad").some(r => /prioridad/i.test(r.title)), "no debe traer secciones de prioridad");
});
test("una sola letra no trae resultados", () => assert.deepEqual(top("a"), []));
