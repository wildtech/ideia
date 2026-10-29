#!/usr/bin/env node
// Confere as specs de um projeto, gera o índice e o relatório de fluxo acumulado.
//
// Uso:  node tools/specs.js <pasta-do-projeto> [--conferir] [--sem-relatorio]
//
// Lê projetos/<projeto>/specs/NNN-nome.md (uma especificação por arquivo, ver roteiros/spec.txt) e:
//   1. confere cada spec: tipo, status, seções do roteiro e critérios de aceite (FALHA termina com erro; AVISO é para ler);
//   2. escreve specs/README.md, o índice (tabela de specs e contagem por status), sem editar à mão;
//   3. escreve out/specs-relatorio.html, com o diagrama de fluxo acumulado (cumulative flow diagram) e as métricas,
//      montados a partir do histórico do git de cada spec (quando o projeto está em um repositório git).
//
// --conferir        não escreve nada: termina com código 1 se o índice estiver desatualizado ou houver FALHA
// --sem-relatorio   só confere e gera o índice
//
// O status é a linha "**Status:** Ideia | Pitch | Andamento | Finalizado" no topo da spec. O histórico vem do git:
// cada commit que mexe na spec conta como a data em que ela passou àquele status.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { loadTheme } = require("./tema");

const args = process.argv.slice(2);
const CONFERIR = args.includes("--conferir");
const SEM_RELATORIO = args.includes("--sem-relatorio");
const pastaArg = args.find((a) => !a.startsWith("--"));
if (!pastaArg) {
  console.error("Uso: node tools/specs.js <pasta-do-projeto> [--conferir] [--sem-relatorio]");
  process.exit(2);
}
const pasta = path.resolve(pastaArg);
const specsDir = path.join(pasta, "specs");
if (!fs.existsSync(specsDir)) {
  console.log(`Sem pasta specs/ em ${path.relative(process.cwd(), pasta)}: nada a fazer.`);
  process.exit(0);
}

// ------------------------------------------------------------------ modelo

const STATUS = ["Ideia", "Pitch", "Andamento", "Finalizado"];
const TIPOS = { mudança: "Mudança em software", defeito: "Defeito", ajuste: "Ajuste de padrão" };
const SECOES = {
  mudança: ["Problema", "Apetite", "Solução", "Armadilhas", "Fora de escopo", "Critérios de aceite"],
  defeito: ["Onde acontece", "Estado atual", "Estado desejado", "Passos para reproduzir", "Critérios de aceite"],
  ajuste: ["Onde acontece", "Estado atual", "Estado desejado", "Critérios de aceite"],
};

const sem = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const achaStatus = (v) => STATUS.find((s) => sem(s) === sem(v || "")) || null;
const achaTipo = (v) => Object.keys(TIPOS).find((t) => sem(t) === sem(v || "")) || null;

const falhas = [];
const avisos = [];
const falha = (arq, msg) => falhas.push(`${arq}: ${msg}`);
const aviso = (arq, msg) => avisos.push(`${arq}: ${msg}`);

function lerSpec(arquivo) {
  const nome = path.basename(arquivo);
  const texto = fs.readFileSync(arquivo, "utf8");
  const linhas = texto.split("\n");
  const titulo = (linhas.find((l) => /^#\s/.test(l)) || "").replace(/^#\s+/, "").trim();
  const campo = (c) => {
    const m = texto.match(new RegExp(`^\\*\\*${c}:\\*\\*\\s*(.+)$`, "mi"));
    return m ? m[1].trim() : null;
  };
  const numero = (nome.match(/^(\d+)-/) || [])[1] || null;
  const tipo = achaTipo(campo("Tipo"));
  const status = achaStatus(campo("Status"));
  const secoes = linhas.filter((l) => /^###\s/.test(l)).map((l) => l.replace(/^###\s+/, "").trim());
  const marcados = (texto.match(/^\s*-\s\[[xX]\]/gm) || []).length;
  const abertos = (texto.match(/^\s*-\s\[ \]/gm) || []).length;
  const apetite = (texto.split(/^###\s+Apetite.*$/mi)[1] || "").split(/^###\s/m)[0].trim();

  if (!numero) falha(nome, "o nome do arquivo deve começar com o número (NNN-nome.md)");
  if (!titulo) falha(nome, "falta o título (# ...)");
  if (!tipo) falha(nome, `**Tipo:** deve ser ${Object.keys(TIPOS).join(", ")} (está "${campo("Tipo") || ""}")`);
  if (!status) falha(nome, `**Status:** deve ser ${STATUS.join(", ")} (está "${campo("Status") || ""}")`);
  if (!/^>\s*\*\*Resumo \(TL;DR\):\*\*/m.test(texto)) aviso(nome, "falta o Resumo (TL;DR) em citação no topo");
  if (tipo) {
    for (const s of SECOES[tipo]) {
      if (!secoes.some((x) => sem(x).startsWith(sem(s)))) aviso(nome, `falta a seção "${s}"`);
    }
  }
  if (marcados + abertos === 0) aviso(nome, "não tem critérios de aceite (- [ ] ...)");
  if (status === "Finalizado" && abertos) aviso(nome, `Finalizado com ${abertos} critério(s) de aceite sem marcar`);
  if ((status === "Ideia" || status === "Pitch") && marcados) aviso(nome, `${status} com ${marcados} critério(s) já marcado(s)`);
  if (tipo === "mudança" && /\bsemanas?\b|\bm[eê]s(es)?\b/i.test(apetite)) {
    aviso(nome, "o apetite passa de poucos dias: uma mudança cabe em horas ou poucos dias; do contrário, vira um projeto (pitch completo)");
  }
  return { nome, numero, titulo: titulo.replace(/^\d+\s*[-:.]?\s*/, ""), tipo, status, marcados, abertos };
}

const arquivos = fs.readdirSync(specsDir).filter((f) => f.endsWith(".md") && f !== "README.md").sort();
const specs = arquivos.map((f) => lerSpec(path.join(specsDir, f)));
const vistos = new Set();
for (const s of specs) {
  if (s.numero && vistos.has(s.numero)) falha(s.nome, `o número ${s.numero} se repete`);
  vistos.add(s.numero);
}

// ------------------------------------------------------------------ índice

const nomeDoProjeto = (() => {
  const p = path.join(pasta, "projeto.json");
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")).nome || path.basename(pasta) : path.basename(pasta);
})();
const cont = Object.fromEntries(STATUS.map((s) => [s, specs.filter((x) => x.status === s).length]));

const indice = `# Specs: ${nomeDoProjeto}

**Gerado por \`tools/specs.js\`. Não edite à mão: mude as specs e rode \`node tools/specs.js ${path.relative(process.cwd(), pasta) || "."}\`.**

### Por status

| Status | Specs |
| :--- | :--- |
${STATUS.map((s) => `| ${s} | ${cont[s]} |`).join("\n")}

### Todas as specs

| # | Spec | Tipo | Status | Critérios |
| :--- | :--- | :--- | :--- | :--- |
${specs
  .map((s) => `| ${s.numero || "?"} | [${s.titulo}](${s.nome}) | ${s.tipo ? TIPOS[s.tipo] : "?"} | ${s.status || "?"} | ${s.marcados}/${s.marcados + s.abertos} |`)
  .join("\n")}
`;
const arqIndice = path.join(specsDir, "README.md");

if (CONFERIR) {
  const atual = fs.existsSync(arqIndice) ? fs.readFileSync(arqIndice, "utf8") : "";
  if (atual !== indice) falhas.push(`${path.relative(process.cwd(), arqIndice)}: desatualizado. Rode \`node tools/specs.js ${pastaArg}\`.`);
} else {
  fs.writeFileSync(arqIndice, indice);
  console.log(`Gerado: ${path.relative(process.cwd(), arqIndice)} (${specs.length} specs)`);
}

// ------------------------------------------------------------------ histórico no git

const git = (...a) => execFileSync("git", ["-C", pasta, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const emGit = (() => {
  try { return git("rev-parse", "--is-inside-work-tree").trim() === "true"; } catch { return false; }
})();
const hoje = new Date().toISOString().slice(0, 10);

/** Eventos [{data, status}] de uma spec, do mais antigo ao mais novo; o último é o estado do arquivo hoje. */
function eventosDe(spec) {
  const rel = `specs/${spec.nome}`;
  const ev = [];
  if (emGit) {
    try {
      const commits = git("log", "--follow", "--format=%H%x09%cs", "--", rel).trim().split("\n").filter(Boolean).reverse();
      for (const linha of commits) {
        const [h, data] = linha.split("\t");
        let st = null;
        try {
          const m = git("show", `${h}:./${rel}`).match(/^\*\*Status:\*\*\s*(.+)$/mi);
          st = achaStatus(m && m[1]);
        } catch { /* arquivo com outro nome nesse commit (renomeado) */ }
        if (st && (!ev.length || ev[ev.length - 1].status !== st)) ev.push({ data, status: st });
      }
    } catch { /* sem histórico */ }
  }
  if (spec.status && (!ev.length || ev[ev.length - 1].status !== spec.status)) ev.push({ data: hoje, status: spec.status });
  return ev;
}

const dias = (d) => Math.round(Date.parse(d + "T00:00:00Z") / 86400000);
const deDias = (n) => new Date(n * 86400000).toISOString().slice(0, 10);

// ------------------------------------------------------------------ relatório (fluxo acumulado)

function relatorio() {
  const historicos = specs.map((s) => ({ spec: s, ev: eventosDe(s) })).filter((h) => h.ev.length);
  if (!historicos.length) return;
  const inicio = Math.min(...historicos.map((h) => dias(h.ev[0].data)));
  const fim = Math.max(dias(hoje), ...historicos.map((h) => dias(h.ev[h.ev.length - 1].data)));
  const estadoEm = (h, d) => {
    let st = null;
    for (const e of h.ev) if (dias(e.data) <= d) st = e.status;
    return st;
  };
  // Uma coluna por dia. Com um histórico curto, abre-se espaço dos dois lados para as faixas aparecerem.
  const de = fim - inicio < 6 ? inicio - (6 - (fim - inicio)) : inicio;
  const pontos = [];
  for (let d = de; d <= fim; d++) {
    const c = Object.fromEntries(STATUS.map((s) => [s, 0]));
    for (const h of historicos) { const st = estadoEm(h, d); if (st) c[st]++; }
    pontos.push({ d, c });
  }

  const { theme } = loadTheme(pasta);
  const cores = theme.colors || {};
  const misturar = (h, t) => "#" + [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - t) + 255 * t).toString(16).padStart(2, "0")).join("");
  const primaria = (cores.primary || "2B5C8A").replace("#", "");
  const acento = (cores.accent || "B45309").replace("#", "");
  // Do pronto ao começo: a cor do tema para o que terminou, o destaque para o que anda, o destaque clareado para o
  // que se valida e cinza para o que é só ideia.
  const cor = { Finalizado: "#" + primaria, Andamento: "#" + acento, Pitch: misturar(acento, 0.6), Ideia: "#D9DCE1" };
  const texto = "#" + (cores.text || "222222");
  const pontoTotal = Math.max(1, ...pontos.map((p) => STATUS.reduce((t, s) => t + p.c[s], 0)));

  const W = 900, H = 380, ML = 48, MR = 130, MT = 20, MB = 44;
  const x = (d) => ML + ((d - de) / Math.max(1, fim - de)) * (W - ML - MR);
  const y = (v) => MT + (1 - v / pontoTotal) * (H - MT - MB);
  // Faixas empilhadas: Finalizado embaixo, depois Andamento, Pitch e Ideia no alto.
  const ordem = ["Finalizado", "Andamento", "Pitch", "Ideia"];
  const camadas = ordem.map((st, i) => {
    const base = (p) => ordem.slice(0, i).reduce((t, s) => t + p.c[s], 0);
    const topo = (p) => base(p) + p.c[st];
    const cima = pontos.map((p) => `${x(p.d).toFixed(1)},${y(topo(p)).toFixed(1)}`);
    const baixo = pontos.map((p) => `${x(p.d).toFixed(1)},${y(base(p)).toFixed(1)}`).reverse();
    return `<polygon points="${cima.concat(baixo).join(" ")}" fill="${cor[st]}" stroke="#fff" stroke-width="1"><title>${st}</title></polygon>`;
  });
  const ultimo = pontos[pontos.length - 1];
  const rotulos = ordem.map((st, i) => {
    const base = ordem.slice(0, i).reduce((t, s) => t + ultimo.c[s], 0);
    const meio = base + ultimo.c[st] / 2;
    return ultimo.c[st] ? `<text x="${W - MR + 8}" y="${(y(meio) + 4).toFixed(1)}" font-size="13" fill="${texto}">${st} (${ultimo.c[st]})</text>` : "";
  });
  const passo = Math.max(1, Math.ceil(pontoTotal / 5));
  const grade = [];
  for (let v = 0; v <= pontoTotal; v += passo) {
    grade.push(`<line x1="${ML}" x2="${W - MR}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="#E5E7EB"/><text x="${ML - 8}" y="${(y(v) + 4).toFixed(1)}" font-size="12" text-anchor="end" fill="${texto}">${v}</text>`);
  }
  const marcas = [];
  const nMarcas = Math.min(6, fim - de + 1);
  for (let i = 0; i < nMarcas; i++) {
    const d = Math.round(de + ((fim - de) * i) / Math.max(1, nMarcas - 1));
    marcas.push(`<text x="${x(d).toFixed(1)}" y="${H - 18}" font-size="12" text-anchor="middle" fill="${texto}">${deDias(d).slice(5).split("-").reverse().join("/")}</text>`);
  }
  const resumoSvg = `Diagrama de fluxo acumulado das specs de ${deDias(de)} a ${deDias(fim)}. Hoje: ${ordem.map((s) => `${ultimo.c[s]} em ${s}`).join(", ")}.`;
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${resumoSvg}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">
<title>${resumoSvg}</title>${grade.join("")}${camadas.join("")}${rotulos.join("")}${marcas.join("")}</svg>`;

  // Métricas a partir dos eventos.
  const tempos = historicos
    .filter((h) => h.ev.some((e) => e.status === "Finalizado") && h.ev.length > 1)
    .map((h) => dias(h.ev.find((e) => e.status === "Finalizado").data) - dias(h.ev[0].data));
  const finalizadas30 = historicos.filter((h) => {
    const e = h.ev.find((x) => x.status === "Finalizado");
    return e && dias(hoje) - dias(e.data) <= 30;
  }).length;
  const media = tempos.length ? (tempos.reduce((a, b) => a + b, 0) / tempos.length).toFixed(1) : null;

  const datasEventos = [...new Set(historicos.flatMap((h) => h.ev.map((e) => e.data)))].sort();
  const linhasTabela = datasEventos.map((data) => {
    const c = Object.fromEntries(STATUS.map((s) => [s, 0]));
    for (const h of historicos) { const st = estadoEm(h, dias(data)); if (st) c[st]++; }
    return `<tr><td>${data}</td>${ordem.slice().reverse().map((s) => `<td>${c[s]}</td>`).join("")}</tr>`;
  });
  const curto = datasEventos.length < 2;
  const titulo = `Relatório das specs: ${nomeDoProjeto}`;
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<style>
  body{font-family:"${theme.font || "Open Sans"}",Helvetica,Arial,sans-serif;color:${texto};max-width:980px;margin:2rem auto;padding:0 1rem;line-height:1.5}
  h1{font-size:1.6rem;margin-bottom:.2rem} h2{font-size:1.15rem;margin-top:2rem}
  .meta{color:#555;font-size:.9rem}
  .cards{display:flex;gap:1rem;flex-wrap:wrap;margin:1rem 0}
  .card{border:1px solid #D1D5DB;border-radius:8px;padding:.7rem 1rem;min-width:130px}
  .card b{display:block;font-size:1.5rem}
  table{border-collapse:collapse;width:100%;font-size:.95rem} th,td{border:1px solid #D1D5DB;padding:.35rem .6rem;text-align:left} th{background:#F3F4F6}
  .nota{background:#F3F4F6;border-left:4px solid ${cor.Finalizado};padding:.6rem .9rem}
</style></head><body>
<h1>${titulo}</h1>
<p class="meta">Gerado em ${hoje} por <code>tools/specs.js</code> a partir do histórico do git. Não edite à mão.</p>
<div class="cards">
${STATUS.map((s) => `<div class="card"><b>${cont[s]}</b>${s}</div>`).join("\n")}
<div class="card"><b>${media === null ? "—" : media + " d"}</b>Tempo médio até Finalizado</div>
<div class="card"><b>${finalizadas30}</b>Finalizadas nos últimos 30 dias</div>
</div>
<h2>Fluxo acumulado (cumulative flow diagram)</h2>
${svg}
<p class="nota">Como ler: cada faixa é a quantidade de specs naquele status, empilhadas, e a altura total é quantas specs existem. Uma faixa que engorda (Andamento, por exemplo) mostra trabalho se acumulando; a faixa de Finalizado deve subir com o tempo. ${curto ? "O histórico ainda é curto: há só uma data nos commits." : ""}</p>
<h2>Dados do diagrama</h2>
<table><thead><tr><th>Data</th>${ordem.slice().reverse().map((s) => `<th>${s}</th>`).join("")}</tr></thead><tbody>
${linhasTabela.join("\n")}
</tbody></table>
${emGit ? "" : '<p class="nota">O projeto não está em um repositório git: o relatório mostra só o estado de hoje.</p>'}
</body></html>
`;
  const saida = path.join(pasta, "out", "specs-relatorio.html");
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, html);
  console.log(`Gerado: ${path.relative(process.cwd(), saida)}`);
}

if (!SEM_RELATORIO && !CONFERIR) relatorio();

// ------------------------------------------------------------------ resultado

for (const a of avisos) console.warn("  AVISO: " + a);
for (const f of falhas) console.error("  FALHA: " + f);
if (falhas.length) process.exit(1);
if (CONFERIR) console.log(`${path.relative(process.cwd(), arqIndice)} está em dia.`);
