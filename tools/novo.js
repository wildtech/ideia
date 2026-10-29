#!/usr/bin/env node
// Gera as estruturas de apoio: esqueletos de projeto, tema, carrossel, vídeo e layout de card, já no formato que os
// compiladores entendem. Não inventa conteúdo: o que falta fica como "A definir" ou "(?)", para ser escrito a partir
// do documento (ou da entrevista com a pessoa). Nunca sobrescreve um arquivo que já existe.
//
// Uso:
//   node tools/novo.js projeto <nome> [--roteiro iniciativa] [--tema generico] [--titulo "Título"]
//       projetos/<nome>/ com projeto.json, <nome>.md (uma seção por item do roteiro) e apoio/
//   node tools/novo.js tema <nome> --primaria 1F8A70 [--destaque A8E6D7] [--fundo-escuro 0F3D32] [--acento A83232]
//                                  [--logo caminho.png] [--fonte "Open Sans"] [--estilo padrao|zen-lessig]
//       temas/<nome>/tema.json (tema simples, herda do neutro), com o contraste das cores conferido
//   node tools/novo.js carrossel <pasta-do-projeto>
//       <projeto>-carrossel.md seguindo o roteiro divulgacao (um card por passo), e a saída no projeto.json
//   node tools/novo.js video <pasta-do-projeto>
//       <projeto>-video.md: abertura, cenário, cenas da jornada e fechamento, e a saída no projeto.json
//   node tools/novo.js spec <pasta-do-projeto> <nome> [--tipo mudança|defeito|ajuste] [--titulo "Título"]
//       specs/NNN-<nome>.md (o próximo número) com o status Ideia, seguindo o roteiro spec; marca o projeto.json com
//       "tarefas": "git". Depois: node tools/specs.js <pasta-do-projeto> (confere, gera o índice e o relatório)
//   node tools/novo.js layout <nome> [--tema <tema>]
//       um layout de card novo, a partir de um modelo comentado: tools/cards/layouts/<nome>.css ou, com --tema,
//       temas/<tema>/cards/<nome>.css (só para aquele tema). Confira no catálogo: node tools/md2cards.js <projeto> --catalogo

const fs = require("fs");
const path = require("path");
const { contraste, escurecerAte, hex } = require("./tokens");

const RAIZ = path.resolve(__dirname, "..");
const [comando, alvo, ...resto] = process.argv.slice(2);
const opcao = (nome, padrao) => { const i = resto.indexOf(nome); return i >= 0 ? resto[i + 1] : padrao; };

const AJUDA = "Uso: node tools/novo.js projeto|tema|carrossel|video|spec|layout <nome ou pasta> [opções] (veja o cabeçalho de tools/novo.js)";
const nomeValido = (n) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(n || "");
function escrever(arquivo, conteudo) {
  if (fs.existsSync(arquivo)) { console.error(`Já existe: ${path.relative(RAIZ, arquivo)}. Nada foi alterado.`); process.exit(1); }
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, conteudo);
  console.log("Criado: " + path.relative(RAIZ, arquivo));
}
function registrarSaida(pasta, saida) {
  const p = path.join(pasta, "projeto.json");
  if (!fs.existsSync(p)) { console.warn(`Aviso: ${path.relative(RAIZ, p)} não existe; registre a saída à mão.`); return; }
  const projeto = JSON.parse(fs.readFileSync(p, "utf8"));
  projeto.saidas = projeto.saidas || [];
  if (projeto.saidas.some((s) => s.fonte === saida.fonte && s.tipo === saida.tipo)) return;
  projeto.saidas.push(saida);
  fs.writeFileSync(p, JSON.stringify(projeto, null, 2) + "\n");
  console.log(`Atualizado: ${path.relative(RAIZ, p)} (saída ${saida.tipo}: ${saida.fonte})`);
}
function pastaDoProjeto(arg) {
  const pasta = path.resolve(arg || "");
  if (!arg || !fs.existsSync(pasta)) { console.error("Informe a pasta do projeto (por exemplo, projetos/meu-projeto)."); process.exit(1); }
  return { pasta, nome: path.basename(pasta) };
}
/** As seções do documento principal (os ### dele), para apontar a fonte de cada card ou cena. */
function secoesDe(pasta, nome) {
  const md = path.join(pasta, `${nome}.md`);
  if (!fs.existsSync(md)) return [];
  return fs.readFileSync(md, "utf8").split("\n").filter((l) => /^###\s/.test(l)).map((l) => l.replace(/^###\s+/, "").trim());
}
const achar = (secoes, re) => secoes.find((s) => re.test(s)) || null;

// ---------- projeto ----------
function projeto() {
  if (!nomeValido(alvo)) { console.error("O nome do projeto vai em minúsculas, sem acentos e com hífen (por exemplo, minha-ideia)."); process.exit(1); }
  const roteiro = opcao("--roteiro", "iniciativa");
  const tema = opcao("--tema", "generico");
  const arqRoteiro = path.join(RAIZ, "roteiros", `${roteiro}.txt`);
  if (!fs.existsSync(arqRoteiro)) { console.error(`Roteiro não encontrado: roteiros/${roteiro}.txt`); process.exit(1); }
  if (!fs.existsSync(path.join(RAIZ, "temas", tema, "tema.json"))) { console.error(`Tema não encontrado: temas/${tema}/`); process.exit(1); }
  const pasta = path.join(RAIZ, "projetos", alvo);
  const titulo = opcao("--titulo", "A definir");
  // Cada linha do roteiro, até a primeira linha em branco, é "Seção. Pergunta". A primeira é o título; as de regras,
  // revisão e período são orientação para quem escreve, e não seções do documento.
  const linhas = fs.readFileSync(arqRoteiro, "utf8").split("\n");
  const fim = linhas.findIndex((l) => !l.trim());
  const itens = linhas.slice(1, fim < 0 ? undefined : fim)
    .map((l) => l.match(/^(?:\d+\.\s*)?([^.:]+)[.:]\s*(.*)$/))
    // Um nome de seção é curto; uma frase longa é a explicação do título (como a segunda linha do pitch).
    .filter((m) => m && m[1].trim().split(/\s+/).length <= 8 && !/^(regras?|revisão|período|antes de publicar)\b/i.test(m[1].trim()));
  const md = [
    `# ${titulo}`,
    "",
    `**Roteiro:** ${roteiro}`,
    "**Período de acompanhamento:** A definir",
    "**Data limite:** A definir",
    "**Status do documento:** Rascunho",
    "",
    "> **Resumo (TL;DR):** A definir. Escreva depois do documento, seguindo roteiros/tldr.txt: nada novo entra no resumo.",
    "",
    ...itens.flatMap((m) => [`### ${m[1].trim()}`, "", `*Pergunta do roteiro: ${m[2].trim()}*`, "", "A definir.", ""]),
  ].join("\n");
  escrever(path.join(pasta, `${alvo}.md`), md);
  escrever(path.join(pasta, "projeto.json"), JSON.stringify({ nome: titulo, tema, saidas: [{ fonte: `${alvo}.md`, tipo: "documento", formatos: ["docx", "html", "pdf"] }] }, null, 2) + "\n");
  fs.mkdirSync(path.join(pasta, "apoio"), { recursive: true });
  console.log(`Pronto. Escreva o documento e gere com: node tools/build.js projetos/${alvo}`);
}

// ---------- tema ----------
function tema() {
  if (!nomeValido(alvo)) { console.error("O nome do tema vai em minúsculas, sem acentos e com hífen."); process.exit(1); }
  const primaria = opcao("--primaria");
  if (!primaria) { console.error("Informe ao menos a cor principal: --primaria 1F8A70 (sem cor, proponha uma da paleta de guias/slides.md)."); process.exit(1); }
  const cores = { primary: hex(primaria), titleBlue: "111111" };
  if (opcao("--acento")) cores.accent = hex(opcao("--acento"));
  // Sem fundo escuro, deriva um da cor principal (bem escurecido) e usa o branco como destaque.
  cores.fundoEscuro = hex(opcao("--fundo-escuro") || escurecerAte(cores.primary, 10));
  cores.destaque = hex(opcao("--destaque") || "FFFFFF");
  const pasta = path.join(RAIZ, "temas", alvo);
  const t = { extends: "neutro", name: alvo, font: opcao("--fonte", "Open Sans"), footer: [`**${alvo}**`, "A definir"], colors: cores };
  if (opcao("--estilo")) t.estilo = opcao("--estilo");
  const logo = opcao("--logo");
  if (logo) {
    if (!fs.existsSync(logo)) { console.error(`Logo não encontrado: ${logo}`); process.exit(1); }
    const destino = "logo" + path.extname(logo).toLowerCase();
    fs.mkdirSync(pasta, { recursive: true });
    fs.copyFileSync(logo, path.join(pasta, destino));
    t.logo = destino;
  }
  escrever(path.join(pasta, "tema.json"), JSON.stringify(t, null, 2) + "\n");
  const pares = [
    ["branco sobre a cor principal (botões)", "FFFFFF", cores.primary],
    ["branco sobre o fundo escuro", "FFFFFF", cores.fundoEscuro],
    ["destaque sobre o fundo escuro", cores.destaque, cores.fundoEscuro],
  ];
  for (const [nome, a, b] of pares) {
    const r = contraste(a, b);
    console.log(`  ${r >= 4.5 ? "ok   " : "AVISO"} ${nome}: ${r.toFixed(2)}:1${r < 4.5 ? " (mínimo 4,5:1; os botões do protótipo escurecem a cor sozinhos, mas os slides e os cards não)" : ""}`);
  }
  console.log(`Use no projeto.json: "tema": "${alvo}". Veja como fica: node tools/md2cards.js <projeto> --catalogo`);
}

// ---------- carrossel ----------
function carrossel() {
  const { pasta, nome } = pastaDoProjeto(alvo);
  const s = secoesDe(pasta, nome);
  const fonte = (re, padrao) => `"${achar(s, re) || padrao}"`;
  const card = (titulo, linhas, alt, notas) => [`### ${titulo}`, "", ...linhas, ...(linhas.length ? [""] : []), `> Alt: ${alt}`, "", `> Notas: ${notas}`, ""].join("\n");
  const md = [
    "# A definir (o mesmo título do documento)",
    "",
    "**Roteiro:** divulgacao",
    `**Status do documento:** Rascunho, a partir de \`${nome}.md\`.`,
    "**Formato:** 4:5",
    "",
    "A definir: uma linha de apoio.",
    "",
    "> Alt: Card de capa: A definir.",
    "",
    "> Legenda: A definir. A primeira linha é o gancho; depois o contexto e a chamada, até cerca de 125 palavras.",
    "",
    "---",
    "",
    card("A definir: o gancho, uma pergunta ou cena de até 14 palavras.", ["**Layout:** frase-escura"], "A definir.", `fonte: ${fonte(/problema/i, "Problema")}.`),
    card("A definir: o problema.", ["- (?)", "- (?)"], "A definir.", `fonte: ${fonte(/problema/i, "Problema")}. Só o que está no documento.`),
    card("A definir: a solução, em uma frase.", ["**Layout:** frase", "", "A definir: uma linha de apoio."], "A definir.", `fonte: ${fonte(/solu|tl;dr|resumo/i, "Solução")}.`),
    card("1. A definir (um verbo)", ["**Layout:** tela", "**Imagem:** imagens/A-definir.png", "**Foco:** topo", "", "A definir."], "A definir: o que a captura mostra.", `fonte: ${fonte(/solu/i, "Solução")}, ato 1. Um card por passo (copie este).`),
    card("O que não faz, de propósito.", ["- (?)", "- (?)"], "A definir.", `fonte: ${fonte(/fora de escopo|no-gos/i, "Fora de escopo")}.`),
    card("A definir: um número do documento (por exemplo, o apetite).", ["**Layout:** numero", "", "A definir."], "A definir.", `fonte: ${fonte(/apetite/i, "Apetite")}. Opcional: só números que já estão no documento.`),
    card("A definir: a chamada para ação.", ["**Layout:** fechamento", "", "A definir: um só caminho, com um só link."], "A definir.", "se a decisão ou o destino não existem, deixe \"A definir\" no documento e não invente uma chamada."),
  ].join("\n");
  escrever(path.join(pasta, `${nome}-carrossel.md`), md);
  registrarSaida(pasta, { fonte: `${nome}-carrossel.md`, tipo: "carrossel", formatos: ["html", "png", "pdf"] });
  console.log("Escreva os cards a partir do documento (roteiros/divulgacao.txt) e veja os layouts com --catalogo.");
}

// ---------- vídeo ----------
function video() {
  const { pasta, nome } = pastaDoProjeto(alvo);
  const s = secoesDe(pasta, nome);
  const temPrototipo = fs.existsSync(path.join(pasta, "prototipo"));
  const md = [
    "# A definir (o título do vídeo)",
    "",
    "**Roteiro:** video",
    `**Status do documento:** Rascunho, a partir de \`${nome}.md\`.`,
    "**Formato:** 16:9, 9:16",
    ...(temPrototipo ? ["**Gravação:** prototipo/demo"] : []),
    "",
    "A definir: uma linha de apoio.",
    "",
    "> Notas: cada ### é uma cena: um cartão animado (os layouts do carrossel) ou um trecho da jornada gravada (**Cena:** jornada). Gere com node tools/build.js. Nada novo entra: a narração vem do documento.",
    "",
    "---",
    "",
    "### A definir: o cenário, em uma frase.",
    "",
    "**Layout:** frase-escura",
    "**Trecho:** cenario",
    "",
    "> Narração: A definir: a cena do problema, contada em voz alta.",
    "",
    `> Notas: fonte: "${achar(s, /problema/i) || "Problema"}".`,
    "",
    ...(temPrototipo
      ? ["### 1. A definir (um verbo)", "", "**Cena:** jornada", "**Trecho:** a-definir", "**Zoom:** 1.5", "", "> Narração: A definir.", "", "> Notas: o trecho precisa de uma ação com o mesmo nome em prototipo/e2e/demo.spec.ts (ACOES). Um trecho por passo da solução.", ""]
      : ["### 1. A definir (um verbo)", "", "**Layout:** tela", "**Imagem:** imagens/A-definir.png", "**Trecho:** passo-1", "", "> Narração: A definir.", ""]),
    "### A definir: a chamada para ação.",
    "",
    "**Layout:** fechamento",
    "**Duração:** 4",
    "",
    "A definir: um só caminho, com um só link.",
    "",
  ].join("\n");
  escrever(path.join(pasta, `${nome}-video.md`), md);
  registrarSaida(pasta, { fonte: `${nome}-video.md`, tipo: "video", formatos: ["mp4"] });
  console.log(temPrototipo ? "Depois de escrever: cd prototipo && npm run demo:todos, e então node tools/build.js." : "Sem protótipo: o vídeo sai só com cartões animados.");
}

// ---------- spec ----------
function spec() {
  const { pasta } = pastaDoProjeto(alvo);
  const nome = resto[0];
  if (!nomeValido(nome)) { console.error("O nome da spec vai em minúsculas, sem acentos e com hífen (por exemplo, nova-tarefa)."); process.exit(1); }
  const tipo = opcao("--tipo", "mudança");
  if (!["mudança", "defeito", "ajuste"].includes(tipo)) { console.error("O tipo é mudança, defeito ou ajuste."); process.exit(1); }
  const dir = path.join(pasta, "specs");
  const numeros = fs.existsSync(dir) ? fs.readdirSync(dir).map((f) => parseInt(f, 10)).filter((n) => n > 0) : [];
  const numero = String(Math.max(0, ...numeros) + 1).padStart(3, "0");
  const titulo = opcao("--titulo", "A definir");
  const aceite = ["### Critérios de aceite", "", "- [ ] Dado ..., quando ..., então ... [unitário]", "- [ ] Dado ..., quando ..., então ... [jornada]", ""];
  const corpos = {
    mudança: ["### Problema (problem)", "", "A definir. Uma cena concreta: quem está tentando fazer o quê, o que acontece hoje e por que isso é ruim.", "",
      "### Apetite (appetite)", "", "A definir. Em horas ou poucos dias.", "",
      "### Solução (solution)", "", "**Ato 1:** A definir.", "**Ato 2:** A definir.", "**Ato 3:** A definir.", "",
      "### Armadilhas (rabbit holes)", "", "A definir.", "",
      "### Fora de escopo (no-gos)", "", "A definir.", ""],
    defeito: ["### Onde acontece", "", "A definir.", "", "### Estado atual", "", "A definir.", "", "### Estado desejado", "", "A definir.", "",
      "### Passos para reproduzir", "", "1. A definir.", "2. A definir.", "**Esperado:** A definir.", "**Obtido:** A definir.", ""],
    ajuste: ["### Onde acontece", "", "A definir.", "", "### Estado atual", "", "A definir.", "", "### Estado desejado", "", "A definir.", ""],
  };
  const md = [`# ${titulo}`, "", "**Roteiro:** spec", `**Tipo:** ${tipo}`, "**Status:** Ideia", "",
    "> **Resumo (TL;DR):** A definir. O problema, para quem, e o que significa esta spec estar pronta.", "", ...corpos[tipo], ...aceite].join("\n");
  escrever(path.join(dir, `${numero}-${nome}.md`), md);
  const pj = path.join(pasta, "projeto.json");
  if (fs.existsSync(pj)) {
    const projeto = JSON.parse(fs.readFileSync(pj, "utf8"));
    if (!projeto.tarefas) { projeto.tarefas = "git"; fs.writeFileSync(pj, JSON.stringify(projeto, null, 2) + "\n"); console.log(`Atualizado: ${path.relative(RAIZ, pj)} ("tarefas": "git")`); }
  }
  console.log(`Pronto. Escreva a spec e rode: node tools/specs.js ${path.relative(process.cwd(), pasta) || "."}`);
}

// ---------- layout ----------
function layout() {
  if (!nomeValido(alvo)) { console.error("O nome do layout vai em minúsculas, sem acentos e com hífen."); process.exit(1); }
  const doTema = opcao("--tema");
  const dir = doTema ? path.join(RAIZ, "temas", doTema, "cards") : path.join(__dirname, "cards", "layouts");
  if (doTema && !fs.existsSync(path.join(RAIZ, "temas", doTema))) { console.error(`Tema não encontrado: temas/${doTema}/`); process.exit(1); }
  const css = `/* @layout {"escuro": false, "frase": false, "descricao": "A definir: para que serve este layout, em uma frase."}
@exemplo
### Um título de exemplo
**Layout:** ${alvo}
Um texto de exemplo, para o catálogo.
*/
/* O HTML do card é sempre o mesmo (veja tools/cards/motor.js):
   section.card.l-${alvo}.claro|escuro.f-paisagem|quadrado|retrato|alto > .logo, .miolo > h2 + .texto (+ .bloco > h3), .autor,
   .telas > .tela, .fundo-img, .credito, .rodape. Use só os tokens do tema (var(--primaria), var(--fundo-escuro),
   var(--destaque), var(--raio), ...): nenhuma cor escrita à mão. Tamanhos em px, para o menor lado com 1080 px.
   No cabeçalho: "escuro" (fundo escuro por padrão), "frase" (o título é a frase) e "imagem" ("tela" ou "fundo"). */
.l-${alvo} .miolo{height:100%;display:flex;flex-direction:column;justify-content:center}
.l-${alvo} h2{color:var(--primaria-acao)}
/* Animação (reel e vídeo): as entradas comuns já valem; para uma própria, use body.anim .l-${alvo} ... com
   animation-delay: calc(var(--t0) + .3s). */
`;
  escrever(path.join(dir, `${alvo}.css`), css);
  console.log(`Use com **Layout:** ${alvo} e confira no catálogo: node tools/md2cards.js <projeto> --catalogo`);
}

const COMANDOS = { projeto, tema, carrossel, video, spec, layout };
if (!COMANDOS[comando] || !alvo) { console.error(AJUDA); process.exit(1); }
COMANDOS[comando]();
