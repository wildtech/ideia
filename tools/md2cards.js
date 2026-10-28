#!/usr/bin/env node
// Compila um Markdown em um carrossel de cards para redes sociais (4:5, 1080x1350, o formato do feed do Instagram),
// no tema do projeto. Sai um HTML com todos os cards, um PNG por card, um PDF (uma página por card) e a legenda do post.
//
// Uso: node tools/md2cards.js <pasta-do-projeto> [arquivo.md] [saida-sem-extensao] [--formatos html,png,pdf] [--folha folha.png]
//
// --folha gera também uma folha de contato (todos os cards lado a lado, em uma imagem só), para mostrar o carrossel em
// um slide ou em um documento; vale com qualquer --formatos.
//
// A saída (sem extensão) é a base: <base>.html, <base>.pdf e a pasta <base>/ com card-01.png, card-02.png... e legenda.txt.
//
// Convenção do Markdown (a mesma dos slides, com menos opções):
//   # Título                  o card de capa (e, nas linhas abaixo, o subtítulo)
//   ### Título do card        um novo card. Uma ideia por card; o texto e as listas vêm abaixo do título
//   **Layout:** texto         (padrão) sem texto abaixo do título, o título vira uma frase grande; com texto ou lista, o
//                             título fica no topo e o resto embaixo
//                frase | frase-escura       o título É a frase, grande, em fundo claro ou escuro
//                tela                       texto de um lado e uma captura de celular do outro (use **Imagem:**)
//                fechamento                 o último card: chamada para ação, centralizada, em fundo escuro
//   **Imagem:** imagens/x.png (relativo ao projeto; vai embutida)   **Foco:** topo | meio | base (que parte da captura aparece)
//   **Crédito:** texto ou [link](url)   **Fundo:** escuro | claro   **Oculto:** sim (o card fica no Markdown e não sai)
//   > Notas: texto            nota para quem produz; não aparece no card
//   > Legenda: texto          texto do post (a legenda do Instagram); todas as linhas "Legenda:" vão para legenda.txt
//   > Alt: texto              texto alternativo do card (cada card é uma imagem); todos vão para alt.txt, para colar ao publicar
//
// O tema (cores, fonte e logo) vem do projeto.json, como nos documentos e nos slides.
// Avisos (não bloqueiam): frase com mais de 14 palavras, card com mais de 45 palavras, imagem ausente ou pesada e card sem texto alternativo.

const fs = require("fs");
const os = require("os");
const path = require("path");
const JSZip = require("jszip");
const { execFileSync } = require("child_process");
const { parse } = require("./md-parse");
const { loadTheme } = require("./tema");
const { findChrome } = require("./chrome");

const argv = process.argv.slice(2);
const iFolha = argv.indexOf("--folha");
const folhaPath = iFolha >= 0 ? path.resolve(argv[iFolha + 1] || "folha.png") : null;
const iForm = argv.indexOf("--formatos");
const formatos = iForm >= 0 ? (argv[iForm + 1] || "").split(",") : ["html", "png", "pdf"];
const pos = argv.filter((a, i) => !a.startsWith("--") && !(iForm >= 0 && i === iForm + 1) && !(iFolha >= 0 && i === iFolha + 1));
const [projectArg, mdArg, outArg] = pos;
if (!projectArg) {
  console.error("Uso: node tools/md2cards.js <pasta-do-projeto> [arquivo.md] [saida-sem-extensao] [--formatos html,png,pdf]");
  process.exit(1);
}

const W = 1080, H = 1350;
const MAX_FRASE = 14;
const MAX_CARD = 45;
const MAX_IMAGEM = 700 * 1024;

const projectDir = path.resolve(projectArg);
const { theme, templatePath, logoPath } = loadTheme(projectDir);
const mdPath = path.resolve(mdArg || path.join(projectDir, path.basename(projectDir) + "-carrossel.md"));
const base = path.resolve(outArg || path.join(projectDir, "out", path.basename(mdPath, ".md")));
const C = theme.colors;
const FONT = theme.font || "Source Sans Pro";
const HEADING_FONT = theme.headingFont || FONT;
const PRETO = C.fundoEscuro || "000000";
const DESTAQUE = C.destaque || "FFFFFF";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const semAcento = (t) => t.toLowerCase().replace(/ç/g, "c").replace(/[ãâá]/g, "a").replace(/[éê]/g, "e").replace(/í/g, "i").replace(/[óô]/g, "o").replace(/ú/g, "u");
const palavras = (t) => t.split(/\s+/).filter(Boolean).length;

// ---------- inline e listas (mesma sintaxe do md2html.js e do md2slides.js) ----------
function inline(text) {
  let out = "", last = 0, m;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  while ((m = re.exec(text))) {
    out += esc(text.slice(last, m.index));
    if (m[2] !== undefined) out += `<strong>${esc(m[2])}</strong>`;
    else if (m[3] !== undefined) out += `<em>${esc(m[3])}</em>`;
    else if (m[4] !== undefined) out += `<code>${esc(m[4])}</code>`;
    else out += `<a href="${esc(m[6])}">${esc(m[5])}</a>`;
    last = re.lastIndex;
  }
  return out + esc(text.slice(last));
}
function renderList(items) {
  const tag = items[0] && items[0].ordered ? "ol" : "ul";
  return `<${tag}>` + items.map((i) => `<li>${inline(i.text)}</li>`).join("") + `</${tag}>`;
}

// ---------- Markdown -> cards ----------
const META_OCULTA = /^\*\*(Roteiro|Template|Status do documento):\*\*/;
const DIRETIVA_RE = /^\*\*(Layout|Imagem|Crédito|Fundo|Oculto|Foco):\*\*\s*(.+?)\s*$/;
const NOTAS_RE = /^\*{0,2}Notas( de produção)?:\*{0,2}\s*(.*)$/i;
const LEGENDA_RE = /^\*{0,2}Legenda:\*{0,2}\s*(.*)$/i;
const ALT_RE = /^\*{0,2}Alt:\*{0,2}\s*(.*)$/i;
const LAYOUTS = ["texto", "frase", "frase-escura", "tela", "fechamento"];

function buildCards(blocks, legendas) {
  const cards = [];
  let cur = null;
  const novo = (layout, title) => ({ layout, title, html: "", words: palavras(title), image: null, credit: null, dark: null, hidden: false, foco: "topo", semTexto: true, alt: null, meta: layout === "capa" });
  for (const b of blocks) {
    if (b.type === "heading" && b.level === 1 && !cards.length) { cur = novo("capa", b.text); cards.push(cur); continue; }
    if (b.type === "heading" && b.level <= 3) { cur = novo("texto", b.text); cards.push(cur); continue; }
    if (!cur) continue;
    const add = (html, text) => { cur.html += html; cur.words += palavras(text || ""); cur.semTexto = false; };
    if (b.type === "para") {
      const conteudo = [];
      for (const l of b.lines) {
        const m = l.match(DIRETIVA_RE);
        if (!m) { conteudo.push(l); continue; }
        const chave = semAcento(m[1]), valor = m[2];
        if (chave === "layout") cur.layout = semAcento(valor);
        else if (chave === "imagem") cur.image = valor;
        else if (chave === "credito") cur.credit = valor;
        else if (chave === "fundo") cur.dark = semAcento(valor) === "escuro";
        else if (chave === "oculto") cur.hidden = ["sim", "true", "s"].includes(semAcento(valor));
        else if (chave === "foco") cur.foco = ["meio", "base"].includes(semAcento(valor)) ? semAcento(valor) : "topo";
      }
      const linhas = cur.layout === "capa" ? conteudo.filter((l) => !META_OCULTA.test(l)) : conteudo;
      if (linhas.length) add(`<p>${linhas.map(inline).join("<br>")}</p>`, linhas.join(" "));
    } else if (b.type === "list") add(renderList(b.items), b.items.map((i) => i.text).join(" "));
    else if (b.type === "callout") {
      const [first, ...rest] = b.items;
      if (first && first.plain && LEGENDA_RE.test(first.text)) {
        legendas.push([first.text.match(LEGENDA_RE)[1], ...rest.map((i) => i.text)].filter(Boolean).join("\n"));
      } else if (first && first.plain && ALT_RE.test(first.text)) {
        cur.alt = [first.text.match(ALT_RE)[1], ...rest.map((i) => i.text)].filter(Boolean).join(" ");
      } else if (!(first && first.plain && NOTAS_RE.test(first.text))) {
        add(b.items.map((i) => `<p>${inline(i.text)}</p>`).join(""), b.items.map((i) => i.text).join(" "));
      }
    }
  }
  return cards;
}

// ---------- logo e imagens ----------
async function carregarLogo() {
  if (theme.logoText) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="110" viewBox="0 0 140 110"><text x="70" y="82" font-size="80" text-anchor="middle">${esc(theme.logoText)}</text></svg>`;
    return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  }
  if (logoPath) {
    const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml" }[path.extname(logoPath).toLowerCase()] || "image/png";
    return `data:${mime};base64,` + fs.readFileSync(logoPath).toString("base64");
  }
  if (!templatePath) return null;
  const zip = await JSZip.loadAsync(fs.readFileSync(templatePath));
  const f = zip.file(`word/media/${theme.layout === "simple" ? theme.logoMedia || "image1.png" : "image2.png"}`);
  return f ? "data:image/png;base64," + (await f.async("base64")) : null;
}

function imagemEmbutida(rel, titulo) {
  const abs = path.resolve(projectDir, rel);
  if (!fs.existsSync(abs)) { console.warn(`Aviso: a imagem do card "${titulo}" não existe: ${rel}`); return null; }
  if (fs.statSync(abs).size > MAX_IMAGEM) console.warn(`Aviso: a imagem ${rel} passa de 700 KB; otimize-a.`);
  const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }[path.extname(abs).toLowerCase()] || "image/png";
  return `data:${mime};base64,` + fs.readFileSync(abs).toString("base64");
}

// ---------- render ----------
const ESCURO_POR_PADRAO = ["capa", "frase-escura", "fechamento"];

function renderCard(c, i, total, logo) {
  const escuro = c.dark !== null ? c.dark : ESCURO_POR_PADRAO.includes(c.layout);
  const classes = ["card", `l-${c.layout}`, escuro ? "escuro" : "claro"];
  const frase = c.layout === "frase" || c.layout === "frase-escura" || (c.layout === "texto" && c.semTexto);
  if (frase) classes.push("frase");
  const img = c.image ? imagemEmbutida(c.image, c.title) : null;
  const topo = logo && c.layout !== "capa" ? `<img class="logo" src="${logo}" alt="">` : "";
  const capaLogo = logo && c.layout === "capa" ? `<img class="logo grande" src="${logo}" alt="">` : "";
  const tela = c.layout === "tela" && img ? `<div class="tela"><img src="${img}" alt="" style="${{ topo: "top:0", meio: "top:50%;transform:translateY(-50%)", base: "bottom:0" }[c.foco]}"></div>` : "";
  const fundoImg = c.layout === "capa" && img ? `<div class="capa-img" style="background-image:url('${img}')"></div>` : "";
  const credito = c.credit ? `<div class="credito">${inline(c.credit)}</div>` : "";
  const rodape = c.layout === "capa" ? "" : `<div class="rodape"><span>${i + 1} / ${total}</span>${i < total - 1 ? "<span>Deslize →</span>" : ""}</div>`;
  return `<section class="${classes.join(" ")}" id="c${i + 1}">${fundoImg}${topo}${capaLogo}
<div class="miolo"><h2>${inline(c.title)}</h2><div class="texto">${c.html}</div></div>${tela}${credito}${rodape}</section>`;
}

function css() {
  return `
@page{size:${W}px ${H}px;margin:0}
*{box-sizing:border-box}
html,body{margin:0;background:#d1d5db}
body{font-family:"${FONT}","Segoe UI",Helvetica,Arial,sans-serif;color:#${C.text}}
body.solo{background:#fff}
.card{position:relative;width:${W}px;height:${H}px;overflow:hidden;page-break-after:always;break-after:page;margin:0 auto 24px;padding:96px 84px 110px}
body.solo .card{margin:0}
@media print{html,body{background:none}.card{margin:0}}
.claro{background:#fff;color:#${C.text}}
.escuro{background:#${PRETO};color:#fff}
.card h2{font-family:"${HEADING_FONT}","${FONT}",sans-serif;font-size:72px;line-height:1.12;margin:0 0 36px;color:#${C.titleBlue};font-weight:800;text-wrap:balance}
.escuro h2{color:#fff}
.texto{font-size:46px;line-height:1.35}
.texto p{margin:0 0 .6em;text-wrap:pretty}
.texto ul,.texto ol{margin:0;padding-left:1.1em}
.texto li{margin:0 0 .5em}
.texto a{color:#${C.primary};text-decoration:underline}
.escuro .texto a{color:#${DESTAQUE}}
.texto code{font-family:Menlo,Consolas,monospace;font-size:.85em}
.miolo{position:relative;z-index:2}
/* texto com conteúdo: o bloco fica no meio do card, e não colado no topo */
.l-texto:not(.frase) .miolo{height:100%;display:flex;flex-direction:column;justify-content:center}
.logo{position:absolute;left:84px;top:44px;height:48px}
.logo.grande{position:relative;left:auto;top:auto;height:120px;margin-bottom:48px;z-index:2}
.rodape{position:absolute;left:84px;right:84px;bottom:44px;display:flex;justify-content:space-between;font-size:26px;opacity:.7;z-index:3}
.credito{position:absolute;left:84px;bottom:86px;font-size:22px;color:#fff;background:rgba(0,0,0,.6);padding:3px 10px;border-radius:4px;z-index:5}
.credito a{color:#fff}
/* frase: o título é a ideia do card, grande, no meio */
.frase .miolo{height:100%;display:flex;flex-direction:column;justify-content:center}
.frase h2{font-size:96px;line-height:1.1;margin:0}
.frase .texto{margin-top:44px;font-size:44px}
/* capa */
.l-capa{padding:130px 84px;display:flex;flex-direction:column;justify-content:center}
.l-capa h2{font-size:100px;line-height:1.05;color:#fff}
.l-capa .texto{font-size:46px;opacity:.9}
.l-capa .texto p{color:#fff}
.capa-img{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.35;z-index:0}
.l-capa::after{content:"";position:absolute;left:84px;bottom:110px;width:140px;height:12px;background:#${C.primary}}
.escuro.l-capa::after{background:#${DESTAQUE}}
/* fechamento */
.l-fechamento{text-align:center}
.l-fechamento .miolo{height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center}
.l-fechamento h2{font-size:84px}
/* tela: texto à esquerda e a captura de um celular à direita, sangrando embaixo */
.l-tela .miolo{width:440px;height:100%;display:flex;flex-direction:column;justify-content:center}
.l-tela h2{font-size:60px}
.l-tela .texto{font-size:38px}
.l-tela .rodape{justify-content:flex-start;gap:36px}
.tela{position:absolute;right:70px;top:170px;bottom:-40px;width:420px;border:10px solid #111;border-bottom:0;border-radius:44px 44px 0 0;overflow:hidden;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.28);z-index:1}
.tela img{position:absolute;left:0;width:100%;height:auto;display:block}
/* folha de contato: todos os cards lado a lado, em escala 0,3 (324x405 cada), em 5 colunas */
body.folha{background:#${PRETO};padding:24px;display:grid;grid-template-columns:repeat(5,324px);gap:16px;width:max-content}
body.folha .card{zoom:.3;margin:0}
`;
}

function pagina(cards, logo, so, folha) {
  const corpo = so === undefined ? cards.map((c, i) => renderCard(c, i, cards.length, logo)).join("\n") : renderCard(cards[so], so, cards.length, logo);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(cards[0].title)}</title><meta name="viewport" content="width=${W}"><style>${css()}</style></head><body${folha ? ' class="folha"' : so === undefined ? "" : ' class="solo"'}>\n${corpo}\n</body></html>`;
}

// ---------- Chrome ----------
const chrome = findChrome();
function chromeHeadless(extra, url) {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "md2cards-"));
  try {
    execFileSync(chrome, ["--headless=new", "--hide-scrollbars", "--force-device-scale-factor=1", `--user-data-dir=${perfil}`, ...extra, url], { stdio: "ignore", timeout: 90000 });
  } catch (e) {
    // o Chrome pode sair com erro por mensagens de display; o que vale é o arquivo ter sido gerado
  } finally {
    fs.rmSync(perfil, { recursive: true, force: true });
  }
}
const urlDe = (p) => require("url").pathToFileURL(p).href;

// ---------- main ----------
(async () => {
  const legendas = [];
  const todos = buildCards(parse(fs.readFileSync(mdPath, "utf8")), legendas);
  const ocultos = todos.filter((c) => c.hidden);
  const cards = todos.filter((c) => !c.hidden);
  if (ocultos.length) console.log(`${ocultos.length} card(s) oculto(s): ${ocultos.map((c) => `"${c.title}"`).join(", ")}`);
  if (!cards.length) { console.error("Nenhum card em " + mdPath); process.exit(1); }

  cards.forEach((c, i) => {
    if (!LAYOUTS.includes(c.layout) && c.layout !== "capa") console.warn(`Aviso: layout desconhecido no card ${i + 1} ("${c.layout}"); vale "texto". Use: ${LAYOUTS.join(", ")}.`);
    const frase = c.layout === "frase" || c.layout === "frase-escura" || (c.layout === "texto" && c.semTexto);
    if (frase && palavras(c.title) > MAX_FRASE) console.warn(`Aviso: o card ${i + 1} ("${c.title}") tem ${palavras(c.title)} palavras na frase; o limite é ${MAX_FRASE}.`);
    if (c.words > MAX_CARD) console.warn(`Aviso: o card ${i + 1} ("${c.title}") tem ${c.words} palavras; o limite é ${MAX_CARD}. Divida em dois cards.`);
    if (!c.alt) console.warn(`Aviso: o card ${i + 1} ("${c.title}") não tem texto alternativo (> Alt: ...).`);
    if (c.layout === "tela" && !c.image) console.warn(`Aviso: o card ${i + 1} ("${c.title}") usa o layout tela, mas não tem **Imagem:**.`);
  });

  const logo = await carregarLogo();
  fs.mkdirSync(path.dirname(base), { recursive: true });
  const htmlPath = base + ".html";
  fs.writeFileSync(htmlPath, pagina(cards, logo));
  if (formatos.includes("html")) console.log("Gerado: " + htmlPath);

  if (formatos.includes("png")) {
    fs.mkdirSync(base, { recursive: true });
    for (let i = 0; i < cards.length; i++) {
      const tmp = path.join(base, `_card-${i + 1}.html`);
      const png = path.join(base, `card-${String(i + 1).padStart(2, "0")}.png`);
      fs.writeFileSync(tmp, pagina(cards, logo, i));
      if (fs.existsSync(png)) fs.unlinkSync(png);
      // A janela é um pouco mais alta que o card: o Chrome novo reserva um trecho para a interface.
      chromeHeadless([`--screenshot=${png}`, `--window-size=${W},${H + 200}`], urlDe(tmp));
      fs.unlinkSync(tmp);
      if (!fs.existsSync(png)) { console.error("O PNG não foi gerado: " + png); process.exit(1); }
      recortar(png, W, H);
    }
    console.log(`Gerado: ${cards.length} PNGs de ${W}x${H} em ${base}/`);
  }

  if (folhaPath) {
    const colunas = 5, linhas = Math.ceil(cards.length / colunas);
    const fw = 24 * 2 + colunas * 324 + (colunas - 1) * 16, fh = 24 * 2 + linhas * 405 + (linhas - 1) * 16;
    const tmp = path.join(path.dirname(folhaPath), "_folha.html");
    fs.mkdirSync(path.dirname(folhaPath), { recursive: true });
    fs.writeFileSync(tmp, pagina(cards, logo, undefined, true));
    if (fs.existsSync(folhaPath)) fs.unlinkSync(folhaPath);
    chromeHeadless([`--screenshot=${folhaPath}`, `--window-size=${fw},${fh + 200}`], urlDe(tmp));
    fs.unlinkSync(tmp);
    if (!fs.existsSync(folhaPath)) { console.error("A folha de contato não foi gerada: " + folhaPath); process.exit(1); }
    recortar(folhaPath, fw, fh);
    console.log(`Gerado: ${folhaPath} (${fw}x${fh}, ${cards.length} cards)`);
  }

  if (formatos.includes("pdf")) {
    const pdf = base + ".pdf";
    if (fs.existsSync(pdf)) fs.unlinkSync(pdf);
    chromeHeadless(["--no-pdf-header-footer", `--print-to-pdf=${pdf}`], urlDe(htmlPath));
    if (!fs.existsSync(pdf)) { console.error("O PDF não foi gerado: " + pdf); process.exit(1); }
    console.log("Gerado: " + pdf);
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
})();

// Recorta o PNG para exatamente w x h (a captura sai com a altura da janela). Lê o cabeçalho do PNG e usa o pngjs.
function recortar(arquivo, w, h) {
  const { PNG } = require("pngjs");
  const img = PNG.sync.read(fs.readFileSync(arquivo));
  if (img.width === w && img.height === h) return;
  if (img.width < w || img.height < h) { console.warn(`Aviso: ${path.basename(arquivo)} saiu com ${img.width}x${img.height}, menor que ${w}x${h}.`); return; }
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(img, out, 0, 0, w, h, 0, 0);
  fs.writeFileSync(arquivo, PNG.sync.write(out));
}
