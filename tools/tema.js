// Carrega o tema e as saídas de um projeto. Compartilhado pelos compiladores.
//
// Ordem de busca:
//   1. <projeto>/projeto.json  -> "tema": nome da pasta em temas/<nome>/ (com tema.json e, opcionalmente, base.docx e um logo)
//      Um tema simples pode ser só cores e logo: "extends": "neutro" herda a base neutra (docx, layout e opções) e
//      sobrescreve o que declarar ("colors", "font", "logo", "footer", ...).
//   2. <projeto>/theme.json    -> formato antigo (um theme.json dentro do projeto, "template" relativo ao projeto)
//
// projeto.json:
//   { "nome": "...", "tema": "generico",
//     "saidas":    [{ "fonte": "x.md", "tipo": "documento" | "apresentacao", "formatos": ["docx","html","pdf"] }],
//     "artefatos": [{ "tipo": "prototipo", "caminho": "prototipo", "origem": "x.md", "descricao": "..." }] }
//   "saidas" são geradas pelas ferramentas em out/ (efêmeras: ficam fora do git e são regeneradas do .md).
//   "artefatos" também são saídas derivadas de um documento (um protótipo gerado da especificação, por exemplo),
//   mas PERSISTENTES: são versionados na pasta do projeto, criados fora destas ferramentas (pelo assistente ou à mão)
//   e passam a evoluir por conta própria. "origem" aponta o documento de onde nasceram, para manter a rastreabilidade.

const fs = require("fs");
const path = require("path");

const TEMAS_DIR = path.resolve(__dirname, "..", "temas");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// Mescla o tema filho sobre o pai ("colors" e "tokens" são mesclados item a item; o resto é substituído).
function merge(parent, child) {
  const out = { ...parent, ...child };
  out.colors = { ...(parent.colors || {}), ...(child.colors || {}) };
  if (parent.tokens || child.tokens) out.tokens = { ...(parent.tokens || {}), ...(child.tokens || {}) };
  return out;
}

// Resolve um tema por nome, seguindo "extends" (um tema simples herda de um tema base, como o "neutro").
// Retorna { theme, templatePath, logoPath, temaDirs } com temaDirs do mais distante ao mais próximo.
function resolveTema(nome, vistos = []) {
  if (vistos.includes(nome)) throw new Error(`Tema com "extends" circular: ${[...vistos, nome].join(" > ")}`);
  const temaDir = path.join(TEMAS_DIR, nome);
  const temaPath = path.join(temaDir, "tema.json");
  if (!fs.existsSync(temaPath)) throw new Error(`Tema não encontrado: ${temaPath}`);
  const own = readJson(temaPath);
  const base = own.extends ? resolveTema(own.extends, [...vistos, nome]) : { theme: {}, templatePath: null, logoPath: null, temaDirs: [] };
  const theme = merge(base.theme, own);
  delete theme.extends;
  // "template" (base.docx) e "logo" (imagem png/jpg/svg) são relativos à pasta do tema que os declara
  const templatePath = own.template ? path.resolve(temaDir, own.template) : base.templatePath;
  const logoPath = own.logo ? path.resolve(temaDir, own.logo) : base.logoPath;
  return { theme, templatePath, logoPath, temaDirs: [...base.temaDirs, temaDir] };
}

// Retorna { projeto, theme, templatePath, logoPath, temaDir, temaDirs }.
// templatePath e logoPath podem ser null (tema simples, só com cores).
function loadTheme(projectDir) {
  const projetoPath = path.join(projectDir, "projeto.json");
  if (fs.existsSync(projetoPath)) {
    const projeto = readJson(projetoPath);
    if (!projeto.tema) throw new Error(`${projetoPath}: falta o campo "tema"`);
    const r = resolveTema(projeto.tema);
    // ajustes pontuais do projeto sobre o tema (opcional): "ajustes": { "footer": [...] }
    const theme = merge(r.theme, projeto.ajustes || {});
    return { projeto, theme, templatePath: r.templatePath, logoPath: r.logoPath, temaDir: r.temaDirs[r.temaDirs.length - 1], temaDirs: r.temaDirs };
  }
  const legacy = path.join(projectDir, "theme.json");
  if (!fs.existsSync(legacy)) throw new Error(`Nem projeto.json nem theme.json em ${projectDir}`);
  const theme = readJson(legacy);
  return { projeto: null, theme, templatePath: path.resolve(projectDir, theme.template), logoPath: null, temaDir: null, temaDirs: [] };
}

module.exports = { loadTheme, TEMAS_DIR };
