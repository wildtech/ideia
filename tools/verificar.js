#!/usr/bin/env node
// Verifica segredos e versões de um protótipo (ou de qualquer pasta de software).
//
// Uso:  node tools/verificar.js <pasta> [--rede]
//
// Sem --rede, só olha os arquivos (rápido e offline).
// Com --rede, também consulta o calendário de versões do Node e roda `npm audit` e `npm outdated`.
// Termina com código 1 se houver FALHA. AVISO não derruba a verificação.
//
// Para ignorar uma linha de propósito (por exemplo, um segredo falso em um teste),
// escreva `verificar:ignorar` na mesma linha.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const args = process.argv.slice(2);
const REDE = args.includes("--rede");
const pasta = path.resolve(args.find((a) => !a.startsWith("--")) || ".");

if (!fs.existsSync(pasta)) {
  console.error(`Pasta não encontrada: ${pasta}`);
  process.exit(2);
}

let falhas = 0;
let avisos = 0;
const ok = (msg) => console.log(`  ok     ${msg}`);
const aviso = (msg) => { avisos++; console.log(`  AVISO  ${msg}`); };
const falha = (msg) => { falhas++; console.log(`  FALHA  ${msg}`); };
const secao = (titulo) => console.log(`\n${titulo}`);

const run = (cmd, cmdArgs, opts = {}) => {
  try {
    return { saida: execFileSync(cmd, cmdArgs, { cwd: pasta, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024, ...opts }), codigo: 0 };
  } catch (e) {
    return { saida: (e.stdout || "").toString(), erro: (e.stderr || e.message || "").toString(), codigo: e.status ?? 1 };
  }
};

// ---------------------------------------------------------------- arquivos

const IGNORAR_DIRS = new Set(["node_modules", ".git", "dist", "coverage", "test-results", "playwright-report", "demo", "out"]);
const IGNORAR_ARQUIVOS = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/;
const BINARIOS = /\.(png|jpe?g|gif|webp|ico|pdf|docx|pptx|mp4|webm|mov|wav|mp3|m4a|aiff|ogg|woff2?|ttf|otf|db|sqlite3?)$/i;

function listarArquivos() {
  const git = run("git", ["ls-files", "-co", "--exclude-standard", "-z"]);
  if (git.codigo === 0 && git.saida) {
    return git.saida.split("\0").filter(Boolean).filter((f) => fs.existsSync(path.join(pasta, f)));
  }
  const lista = [];
  const andar = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) { if (!IGNORAR_DIRS.has(e.name)) andar(path.join(dir, e.name)); }
      else lista.push(path.relative(pasta, path.join(dir, e.name)));
    }
  };
  andar(pasta);
  return lista;
}

// ---------------------------------------------------------------- segredos

const PADROES = [
  ["chave privada", /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/],
  ["chave da AWS", /\bAKIA[0-9A-Z]{16}\b/],
  ["token do GitHub", /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/],
  ["chave da Anthropic", /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ["chave no estilo OpenAI", /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/],
  ["token do Slack", /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ["chave de API do Google", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["chave live do Stripe", /\b[sr]k_live_[0-9A-Za-z]{16,}/],
  ["JWT", /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["senha em endereço de conexão", /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:[^\s@/]{3,}@[^\s/]+/i],
  ["atribuição de segredo", /\b(?:api[_-]?key|apikey|secret|token|passwd|password|senha|client[_-]?secret|access[_-]?key)\w*\s*[:=]\s*["'`][^"'`\s]{12,}["'`]/i],
];

function procurarSegredos(arquivos) {
  let achados = 0;
  for (const rel of arquivos) {
    if (BINARIOS.test(rel) || IGNORAR_ARQUIVOS.test(rel)) continue;
    const abs = path.join(pasta, rel);
    let texto;
    try {
      if (fs.statSync(abs).size > 1024 * 1024) continue;
      texto = fs.readFileSync(abs, "utf8");
    } catch { continue; }
    if (texto.includes("\0")) continue;
    texto.split("\n").forEach((linha, i) => {
      if (linha.includes("verificar:ignorar")) return;
      for (const [nome, re] of PADROES) {
        if (re.test(linha)) {
          achados++;
          falha(`possível segredo (${nome}) em ${rel}:${i + 1}`); // o valor nunca é impresso
          break;
        }
      }
    });
  }
  if (!achados) ok(`nenhum padrão de segredo em ${arquivos.length} arquivos`);
}

function procurarEnv() {
  const achados = fs.readdirSync(pasta).filter((f) => /^\.env(\..+)?$/.test(f) && !/^\.env\.(example|exemplo|sample)$/.test(f));
  let comValor = 0;
  for (const f of achados) {
    const linhas = fs.readFileSync(path.join(pasta, f), "utf8").split("\n");
    const preenchidas = linhas.filter((l) => /^\s*(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=\s*\S/.test(l) && !/^\s*#/.test(l));
    if (preenchidas.length) {
      comValor++;
      falha(`${f} guarda ${preenchidas.length} valor(es) em arquivo: passe segredos pelo ambiente, em tempo de execução (guias/seguranca.md)`);
    }
  }
  if (!comValor) ok("nenhum .env com valores no disco");
}

function conferirGitignore() {
  const dentroDoGit = run("git", ["rev-parse", "--is-inside-work-tree"]).codigo === 0;
  if (!dentroDoGit) { aviso("fora de um repositório git: não deu para conferir o .gitignore"); return; }
  const deveIgnorar = [".env", ".env.local", "data/qualquer.db", "node_modules/x", "app.log"];
  const faltam = deveIgnorar.filter((f) => run("git", ["check-ignore", "-q", f]).codigo !== 0);
  if (faltam.length) falha(`o .gitignore não cobre: ${faltam.join(", ")}`);
  else ok(".gitignore cobre .env, bancos locais, logs e node_modules");
  if (run("git", ["check-ignore", "-q", ".env.example"]).codigo === 0) aviso(".env.example está ignorado pelo git (ele deve ser versionado, com os nomes das variáveis)");
}

// ---------------------------------------------------------------- versões

const lerJson = (f) => { try { return JSON.parse(fs.readFileSync(path.join(pasta, f), "utf8")); } catch { return null; } };

function pisoDoEngines(faixa) {
  const m = /(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(faixa || "");
  return m ? [Number(m[1]), Number(m[2] || 0), Number(m[3] || 0)] : null;
}

async function conferirNode(pkg) {
  const atual = process.versions.node.split(".").map(Number);
  const exigido = pkg.engines && pkg.engines.node;
  if (!exigido) aviso(`package.json sem "engines.node" (Node em uso: ${process.versions.node})`);
  else {
    const piso = pisoDoEngines(exigido);
    const cmp = piso && (atual[0] - piso[0] || atual[1] - piso[1] || atual[2] - piso[2]);
    if (piso && cmp < 0) falha(`o Node em uso (${process.versions.node}) é mais antigo que o exigido (${exigido})`);
    else ok(`Node ${process.versions.node} atende ao engines (${exigido})`);
  }
  if (!REDE) return;
  try {
    const r = await fetch("https://raw.githubusercontent.com/nodejs/Release/main/schedule.json", { signal: AbortSignal.timeout(15000) });
    const cal = (await r.json())[`v${atual[0]}`];
    if (!cal) { aviso(`Node v${atual[0]} não consta no calendário oficial de versões`); return; }
    const hoje = new Date();
    if (new Date(cal.end) < hoje) falha(`Node v${atual[0]} saiu de suporte em ${cal.end}: use uma versão LTS em suporte`);
    else if (cal.lts && new Date(cal.lts) > hoje) aviso(`Node v${atual[0]} ainda é "Current" (vira LTS em ${cal.lts}): prefira uma LTS para o que for durar`);
    else if (cal.maintenance && new Date(cal.maintenance) < hoje) ok(`Node v${atual[0]} em manutenção, com suporte até ${cal.end}`);
    else ok(`Node v${atual[0]} é LTS ativa, com suporte até ${cal.end}`);
  } catch (e) {
    aviso(`não consegui consultar o calendário do Node (${e.message})`);
  }
}

function conferirDependencias(pkg) {
  const lock = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"].find((f) => fs.existsSync(path.join(pasta, f)));
  if (lock) ok(`lockfile presente (${lock})`); else falha("sem lockfile (package-lock.json): as versões não ficam reproduzíveis");

  const todas = { ...pkg.dependencies, ...pkg.devDependencies };
  const soltas = Object.entries(todas).filter(([, v]) => /^(\*|latest|next|x)?$/.test(v) || /^(git|github|https?):/.test(v) || /^[\w-]+\/[\w.-]+/.test(v));
  if (soltas.length) falha(`versão solta ou de origem não registrada: ${soltas.map(([n, v]) => `${n}@${v || "(vazio)"}`).join(", ")}`);
  else ok(`${Object.keys(todas).length} dependências com versão declarada`);

  const ganchos = ["preinstall", "install", "postinstall", "prepare"].filter((s) => pkg.scripts && pkg.scripts[s]);
  if (ganchos.length) aviso(`o próprio package.json roda scripts na instalação: ${ganchos.join(", ")}`);

  const lockJson = lerJson("package-lock.json");
  if (lockJson && lockJson.packages) {
    const comScript = Object.entries(lockJson.packages).filter(([, p]) => p.hasInstallScript).map(([n]) => n.replace(/^node_modules\//, ""));
    if (comScript.length) aviso(`dependências que rodam script na instalação (confira se esperava): ${comScript.join(", ")}`);
  }
}

function rodarNpm() {
  const audit = run("npm", ["audit", "--json"]);
  try {
    const v = JSON.parse(audit.saida).metadata.vulnerabilities;
    const graves = (v.high || 0) + (v.critical || 0);
    const leves = (v.moderate || 0) + (v.low || 0);
    if (graves) falha(`npm audit: ${graves} vulnerabilidade(s) alta(s) ou crítica(s)`);
    if (leves) aviso(`npm audit: ${leves} vulnerabilidade(s) moderada(s) ou baixa(s)`);
    if (!graves && !leves) ok("npm audit: nenhuma vulnerabilidade conhecida");
  } catch {
    aviso(`npm audit não respondeu (${(audit.erro || "sem resposta").split("\n")[0]})`);
  }

  const out = run("npm", ["outdated", "--json"]);
  try {
    const lista = Object.entries(JSON.parse(out.saida || "{}"));
    if (!lista.length) { ok("npm outdated: tudo na última versão"); return; }
    const major = lista.filter(([, i]) => i.current && i.latest && i.current.split(".")[0] !== i.latest.split(".")[0]);
    aviso(`npm outdated: ${lista.length} dependência(s) com versão nova, ${major.length} delas de versão maior`);
    for (const [nome, i] of lista.slice(0, 15)) console.log(`           ${nome}: ${i.current || "não instalada"} -> ${i.latest}`);
  } catch {
    aviso("npm outdated não respondeu (rode `npm install` antes?)");
  }
}

// ---------------------------------------------------------------- execução

(async () => {
  console.log(`Verificando ${path.relative(process.cwd(), pasta) || "."}${REDE ? " (com rede)" : " (offline)"}`);

  secao("Segredos");
  procurarSegredos(listarArquivos());
  procurarEnv();
  conferirGitignore();

  const pkg = lerJson("package.json");
  secao("Versões");
  if (!pkg) aviso("sem package.json: nada a conferir nas versões");
  else {
    await conferirNode(pkg);
    conferirDependencias(pkg);
    if (REDE) rodarNpm(); else console.log("  (use --rede para consultar o calendário do Node, npm audit e npm outdated)");
  }

  console.log(`\n${falhas ? "COM FALHAS" : "Sem falhas"}: ${falhas} falha(s), ${avisos} aviso(s)`);
  process.exit(falhas ? 1 : 0);
})();
