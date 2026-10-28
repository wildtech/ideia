#!/usr/bin/env node
// Compila um Markdown em um carrossel de cards para redes sociais, no tema do projeto: um HTML com todos os cards, um
// PNG por card, um PDF (uma página por card), um reel em MP4 (os cards animados, um depois do outro), a legenda do post
// e o texto alternativo.
//
// Uso: node tools/md2cards.js <pasta-do-projeto> [arquivo.md] [saida-sem-extensao]
//        [--formatos html,png,pdf,mp4] [--formato 4:5|1:1|9:16|16:9|1.91:1] [--folha folha.png] [--catalogo]
//
//   --formato   o tamanho dos cards (padrão: o **Formato:** da capa, ou 4:5, o do feed do Instagram). 9:16 é o dos
//               stories e reels; 1.91:1, o de um link no LinkedIn. Quando é diferente do Markdown, a saída ganha o
//               sufixo do formato (por exemplo, x-carrossel-9x16.mp4).
//   --folha     gera também uma folha de contato (todos os cards lado a lado, em uma imagem só), para um slide.
//   --catalogo  em vez do Markdown, gera o catálogo dos layouts no tema do projeto: out/catalogo-cards.html e .png,
//               com o exemplo de cada layout. Serve para escolher um layout e conferir um tema ou um layout novo.
//
// A saída (sem extensão) é a base: <base>.html, <base>.pdf, <base>.mp4 e a pasta <base>/ com card-01.png...,
// legenda.txt e alt.txt.
//
// Convenção do Markdown (a mesma dos slides, com menos opções):
//   # Título                  o card de capa (e, nas linhas abaixo, o subtítulo)
//   ### Título do card        um novo card. Uma ideia por card; o texto e as listas vêm abaixo do título
//   #### Subtítulo            abre um bloco dentro do card (o layout antes-depois usa dois)
//   **Layout:** <nome>        um dos layouts de tools/cards/layouts/ (ou do tema, em temas/<tema>/cards/):
//       texto (padrão), frase, frase-escura, numero, citacao, passos, antes-depois, tela, duas-telas, foto, fechamento.
//       O catálogo (--catalogo) mostra todos. Para criar um: node tools/novo.js layout <nome>.
//   **Imagem:** imagens/x.png (relativo ao projeto; vai embutida; pode repetir)   **Foco:** topo | meio | base
//   **Crédito:** texto ou [link](url)   **Fundo:** escuro | claro   **Oculto:** sim   **Autor:** nome (citacao)
//   **Duração:** 4 (segundos do card no reel)   **Transição:** desliza | fade | zoom | corte (no reel)
//   Na capa, valem para o arquivo todo: **Formato:** 4:5 e **Música:** audio/trilha.mp3 (fundo do reel; registre a licença)
//   > Notas: texto            nota para quem produz; não aparece no card
//   > Legenda: texto          texto do post; todas as linhas "Legenda:" vão para legenda.txt
//   > Alt: texto              texto alternativo do card (cada card é uma imagem); todos vão para alt.txt
//
// O tema (cores, fonte, logo e tokens de movimento) vem do projeto.json, como nos documentos e nos slides.
// Avisos (não bloqueiam): frase com mais de 14 palavras, card com mais de 45 palavras, imagem ausente ou pesada,
// layout desconhecido e card sem texto alternativo.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { loadTheme } = require("./tema");
const { findChrome } = require("./chrome");
const { abrirChrome, gravarAnimacao } = require("./cdp");
const motor = require("./cards/motor");

const argv = process.argv.slice(2);
const opcao = (nome) => { const i = argv.indexOf(nome); return i >= 0 ? argv[i + 1] : undefined; };
const COM_VALOR = ["--folha", "--formatos", "--formato"];
const pos = argv.filter((a, i) => !a.startsWith("--") && !COM_VALOR.includes(argv[i - 1]));
const CATALOGO = argv.includes("--catalogo");
const folhaPath = opcao("--folha") ? path.resolve(opcao("--folha")) : null;
const formatos = (opcao("--formatos") || "html,png,pdf").split(",");
const [projectArg, mdArg, outArg] = pos;
if (!projectArg) {
  console.error("Uso: node tools/md2cards.js <pasta-do-projeto> [arquivo.md] [saida-sem-extensao] [--formatos html,png,pdf,mp4] [--formato 4:5] [--folha f.png] [--catalogo]");
  process.exit(1);
}

const MAX_FRASE = 14;
const MAX_CARD = 45;

const projectDir = path.resolve(projectArg);
const contexto = { projectDir, ...loadTheme(projectDir) };
const urlDe = (p) => require("url").pathToFileURL(p).href;

function chromeHeadless(extra, url) {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "md2cards-"));
  try {
    execFileSync(findChrome(), ["--headless=new", "--hide-scrollbars", "--force-device-scale-factor=1", `--user-data-dir=${perfil}`, ...extra, url], { stdio: "ignore", timeout: 90000 });
  } catch (e) {
    // o Chrome pode sair com erro por mensagens de display; o que vale é o arquivo ter sido gerado
  } finally {
    fs.rmSync(perfil, { recursive: true, force: true });
  }
}

/** Fotografa uma página HTML (já gravada em disco) no tamanho dado, em PNG. */
async function fotografar(chrome, html, arquivoHtml, png) {
  fs.writeFileSync(arquivoHtml, html);
  await chrome.navegar(urlDe(arquivoHtml));
  fs.writeFileSync(png, await chrome.foto("png"));
  fs.unlinkSync(arquivoHtml);
}

async function catalogo(montador) {
  const md = ["# Catálogo de cards", "", `Os layouts no tema "${contexto.theme.name}".`, ""];
  const nomes = Object.values(montador.layouts).filter((l) => !l.meta.interno && l.exemplo).map((l) => l.nome);
  for (const n of nomes) md.push(montador.layouts[n].exemplo, "");
  const { cards } = motor.lerCards(md.join("\n"));
  const f = motor.formato(opcao("--formato") || "4:5");
  const extras = cards.map((c) => ({ etiqueta: c.layout === "capa" ? "capa" : c.layout }));
  const base = path.join(projectDir, "out", "catalogo-cards");
  fs.mkdirSync(path.dirname(base), { recursive: true });
  fs.writeFileSync(base + ".html", montador.pagina(cards, { formato: f, extras }));
  const [fw, fh] = motor.folhaTamanho(f, cards.length);
  const chrome = await abrirChrome({ largura: fw, altura: fh });
  try {
    await fotografar(chrome, montador.pagina(cards, { formato: f, modo: "folha", extras }), base + "_folha.html", base + ".png");
  } finally {
    await chrome.fechar();
  }
  console.log(`Gerado: ${base}.html e ${base}.png (${nomes.length} layouts: ${nomes.join(", ")})`);
  const sem = Object.values(montador.layouts).filter((l) => !l.meta.interno && !l.exemplo).map((l) => l.nome);
  if (sem.length) console.warn(`Aviso: layouts sem @exemplo (fora do catálogo): ${sem.join(", ")}`);
}

(async () => {
  const montador = await motor.criarMontador(contexto);
  if (CATALOGO) return catalogo(montador);

  const mdPath = path.resolve(mdArg || path.join(projectDir, path.basename(projectDir) + "-carrossel.md"));
  const { cards: todos, legendas, opcoes } = motor.lerCards(fs.readFileSync(mdPath, "utf8"));
  const doMd = (opcoes.formatos && opcoes.formatos[0]) || "4:5";
  const f = motor.formato(opcao("--formato") || doMd);
  let base = path.resolve(outArg || path.join(projectDir, "out", path.basename(mdPath, ".md")));
  if (f.nome !== motor.formato(doMd).nome) base += "-" + f.sufixo;

  const ocultos = todos.filter((c) => c.hidden);
  const cards = todos.filter((c) => !c.hidden);
  if (ocultos.length) console.log(`${ocultos.length} card(s) oculto(s): ${ocultos.map((c) => `"${c.title}"`).join(", ")}`);
  if (!cards.length) { console.error("Nenhum card em " + mdPath); process.exit(1); }

  cards.forEach((c, i) => {
    const l = montador.layouts[c.layout];
    if (!l || (l.meta.interno && c.layout !== "capa")) {
      const validos = Object.values(montador.layouts).filter((x) => !x.meta.interno).map((x) => x.nome);
      console.warn(`Aviso: layout desconhecido no card ${i + 1} ("${c.layout}"); vale "texto". Use: ${validos.join(", ")}.`);
      c.layout = "texto";
    }
    const meta = montador.metaDe(c);
    if (montador.fraseDe(c) && motor.palavras(c.title) > MAX_FRASE) console.warn(`Aviso: o card ${i + 1} ("${c.title}") tem ${motor.palavras(c.title)} palavras na frase; o limite é ${MAX_FRASE}.`);
    if (c.words > MAX_CARD) console.warn(`Aviso: o card ${i + 1} ("${c.title}") tem ${c.words} palavras; o limite é ${MAX_CARD}. Divida em dois cards.`);
    if (!c.alt) console.warn(`Aviso: o card ${i + 1} ("${c.title}") não tem texto alternativo (> Alt: ...).`);
    if (meta.imagem === "tela" && !c.images.length) console.warn(`Aviso: o card ${i + 1} ("${c.title}") usa o layout ${c.layout}, mas não tem **Imagem:**.`);
  });

  fs.mkdirSync(path.dirname(base), { recursive: true });
  const htmlPath = base + ".html";
  fs.writeFileSync(htmlPath, montador.pagina(cards, { formato: f }));
  if (formatos.includes("html")) console.log("Gerado: " + htmlPath);

  if (formatos.includes("png") || folhaPath) {
    const chrome = await abrirChrome({ largura: f.W, altura: f.H });
    try {
      if (formatos.includes("png")) {
        fs.mkdirSync(base, { recursive: true });
        for (let i = 0; i < cards.length; i++) {
          const png = path.join(base, `card-${String(i + 1).padStart(2, "0")}.png`);
          await fotografar(chrome, montador.pagina(cards, { formato: f, modo: "solo", indice: i }), path.join(base, `_card-${i + 1}.html`), png);
        }
        console.log(`Gerado: ${cards.length} PNGs de ${f.W}x${f.H} em ${base}/`);
      }
    } finally {
      await chrome.fechar();
    }
    if (folhaPath) {
      const [fw, fh] = motor.folhaTamanho(f, cards.length);
      const folha = await abrirChrome({ largura: fw, altura: fh });
      try {
        fs.mkdirSync(path.dirname(folhaPath), { recursive: true });
        await fotografar(folha, montador.pagina(cards, { formato: f, modo: "folha" }), path.join(path.dirname(folhaPath), "_folha.html"), folhaPath);
      } finally {
        await folha.fechar();
      }
      console.log(`Gerado: ${folhaPath} (${fw}x${fh}, ${cards.length} cards)`);
    }
  }

  if (formatos.includes("pdf")) {
    const pdf = base + ".pdf";
    if (fs.existsSync(pdf)) fs.unlinkSync(pdf);
    chromeHeadless(["--no-pdf-header-footer", `--print-to-pdf=${pdf}`], urlDe(htmlPath));
    if (!fs.existsSync(pdf)) { console.error("O PDF não foi gerado: " + pdf); process.exit(1); }
    console.log("Gerado: " + pdf);
  }

  if (formatos.includes("mp4")) {
    const linha = motor.linhaDoTempo(cards, { transicao: opcoes.transicao || "desliza", mexeSempre: (c) => montador.metaDe(c).imagem === "fundo" && c.images.length > 0 });
    const anim = base + "_anim.html";
    fs.writeFileSync(anim, montador.pagina(cards, { formato: f, modo: "anim", tempos: linha.tempos }));
    let audio = null;
    if (opcoes.musica) {
      const musica = path.resolve(projectDir, opcoes.musica);
      if (!fs.existsSync(musica)) console.warn(`Aviso: a música não existe: ${opcoes.musica}; o reel sai sem som.`);
      else {
        const d = linha.duracao;
        audio = { entradas: ["-stream_loop", "-1", "-i", musica], mapa: ["-map", "0:v", "-map", "1:a", "-af", `volume=0.8,afade=t=in:d=0.5,afade=t=out:st=${Math.max(0, d - 1.5).toFixed(2)}:d=1.5`] };
      }
    }
    const mp4 = base + ".mp4";
    const r = await gravarAnimacao({ arquivoHtml: anim, largura: f.W, altura: f.H, duracao: linha.duracao, intervalos: linha.intervalos, saida: mp4, audio });
    fs.unlinkSync(anim);
    console.log(`Gerado: ${mp4} (${linha.duracao.toFixed(1)} s, ${f.W}x${f.H}, ${r.capturados} de ${r.quadros} quadros capturados${audio ? ", com música" : ""})`);
  }

  if (cards.some((c) => c.alt)) {
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(path.join(base, "alt.txt"), cards.map((c, i) => `Card ${String(i + 1).padStart(2, "0")}: ${c.alt || "(sem texto alternativo)"}`).join("\n") + "\n");
    console.log("Gerado: " + path.join(base, "alt.txt"));
  }
  if (legendas.length) {
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(path.join(base, "legenda.txt"), legendas.join("\n\n") + "\n");
    console.log("Gerado: " + path.join(base, "legenda.txt"));
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
