#!/usr/bin/env node
// Compila um Markdown em uma apresentação HTML (reveal.js) autocontida, no tema do projeto.
//
// Uso: node tools/md2slides.js <pasta-do-projeto> [arquivo.md] [saida.html]
//
// Convenção do Markdown:
//   # Título                  capa (e, na linha abaixo, as linhas de contexto, como o público da apresentação)
//   ### Título do slide       um novo slide. Texto, listas, tabelas e citações do slide vêm abaixo dele
//   #### Subtítulo            subtítulo dentro do slide
//   **Layout:** destaque      (linha sozinha) layout do slide: conteudo (padrão), destaque (texto grande, centralizado) ou fechamento
//   Layouts de imagem e de frase (um slide = uma ideia, no espírito do Presentation Zen e do método Lessig):
//     frase | frase-escura | secao        o título do slide É a frase (grande, centralizada); secao e frase-escura têm fundo escuro
//     imagem-direita | imagem-esquerda    texto de um lado e a imagem sangrando do outro (a capa com imagem usa o mesmo desenho)
//     imagem-cheia                        a imagem ocupa o slide e a frase vai por cima, em um degradê escuro
//     evidencia                           print/diagrama inteiro sobre fundo escuro, com a legenda embaixo
//   **Imagem:** caminho/da/imagem.jpg     (relativo à pasta do projeto) a imagem do slide; vai embutida no html
//   **Crédito:** texto ou [link](url)     crédito da imagem, em letra pequena no canto
//   **Fundo:** escuro | claro             força o fundo do slide (a capa com imagem e as seções são escuras por padrão)
//   As linhas de diretiva podem vir juntas, uma abaixo da outra.
//
// Estilo (definido pelo tema, em "estilo" no tema.json):
//   padrao      (padrão) slides de título e conteúdo; o slide sem **Layout:** é de conteúdo
//   zen-lessig  um slide = uma ideia (Presentation Zen e método Lessig): o slide sem **Layout:** é de frase, o slide
//               com **Imagem:** e sem layout usa imagem-direita, e a capa é escura. Os layouts de frase e de imagem
//               também funcionam no estilo padrao, quando pedidos com **Layout:**.
//   > Notas: texto           citação que começa com "Notas:" vira nota do apresentador (a primeira linha e as seguintes;
//                             não aparece no slide: use ?showNotes=true na URL para vê-las)
//
// O tema (cores, fontes e logo) vem do projeto.json, como nos documentos. Se a pasta do tema tiver um slides.css,
// ele é acrescentado ao final e pode ajustar qualquer detalhe. O reveal.js vem do node_modules e fica embutido no arquivo
// (funciona offline). Para o PDF, o md2pdf.js abre o HTML em modo de impressão do reveal.
//
// Avisos (não bloqueiam): slide com texto demais e, no roteiro 10-20-30, quantidade de slides diferente de 10.

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { parse } = require("./md-parse");
const { loadTheme } = require("./tema");

const [, , projectArg, mdArg, outArg] = process.argv;
if (!projectArg) {
  console.error("Uso: node tools/md2slides.js <pasta-do-projeto> [arquivo.md] [saida.html]");
  process.exit(1);
}
const projectDir = path.resolve(projectArg);
const { theme, templatePath, logoPath, temaDirs } = loadTheme(projectDir);
const mdPath = path.resolve(mdArg || path.join(projectDir, path.basename(projectDir) + ".md"));
const outPath = path.resolve(outArg || path.join(projectDir, "out", path.basename(mdPath).replace(/\.md$/, ".html")));
const C = theme.colors;
const FONT = theme.font || "Source Sans Pro";
const HEADING_FONT = theme.headingFont || FONT;
const ESTILO = theme.estilo === "zen-lessig" ? "zen-lessig" : "padrao";
const MAX_WORDS = 70; // acima disso o slide provavelmente tem texto demais para ser lido de longe

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------- inline, listas e tabelas (mesma sintaxe do md2html.js) ----------
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
  const roots = [];
  const stack = [];
  for (const it of items) {
    const node = { ...it, children: [] };
    while (stack.length > it.level) stack.pop();
    if (it.level === 0 || !stack.length) { roots.push(node); stack.length = 0; stack.push(node); }
    else { stack[stack.length - 1].children.push(node); stack.push(node); }
  }
  const render = (nodes) => {
    const tag = nodes[0].ordered ? "ol" : "ul";
    return `<${tag}>` + nodes.map((n) => `<li>${inline(n.text)}${n.children.length ? render(n.children) : ""}</li>`).join("") + `</${tag}>`;
  };
  return roots.length ? render(roots) : "";
}

function renderTable(b) {
  return `<table><thead><tr>${b.header.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead><tbody>` +
    b.body.map((r) => `<tr>${b.header.map((_, c) => `<td>${inline(r[c] || "")}</td>`).join("")}</tr>`).join("") + "</tbody></table>";
}

// ---------- Markdown -> slides ----------
const META_OCULTA = /^\*\*(Roteiro|Template|Status do documento):\*\*/;
const DIRETIVA_RE = /^\*\*(Layout|Imagem|Crédito|Fundo):\*\*\s*(.+?)\s*$/;
const semAcento = (t) => t.toLowerCase().replace(/ç/g, "c").replace(/[ãâá]/g, "a").replace(/[éê]/g, "e").replace(/í/g, "i").replace(/[óô]/g, "o").replace(/ú/g, "u");
const LAYOUTS_COM_IMAGEM = ["imagem-direita", "imagem-esquerda", "imagem-cheia", "evidencia"];
const LAYOUTS_NOVOS = ["frase", "frase-escura", "secao", ...LAYOUTS_COM_IMAGEM];
const MAX_WORDS_FRASE = 14; // no estilo Lessig, a frase do slide é curta
const NOTAS_RE = /^\*{0,2}Notas( do apresentador)?:\*{0,2}\s*(.*)$/i;

function buildSlides(blocks) {
  const slides = [];
  let cur = null;
  for (const b of blocks) {
    if (b.type === "heading" && b.level === 1 && !slides.length) {
      cur = { layout: "capa", title: b.text, html: "", notes: [], words: 0, image: null, credit: null, dark: null };
      slides.push(cur);
      continue;
    }
    if (b.type === "heading" && b.level <= 3) {
      cur = { layout: ESTILO === "zen-lessig" ? "frase" : "conteudo", explicit: false, title: b.text, html: "", notes: [], words: 0, image: null, credit: null, dark: null };
      slides.push(cur);
      continue;
    }
    if (!cur) continue;
    const add = (html, text) => { cur.html += html; cur.words += (text || "").split(/\s+/).filter(Boolean).length; };
    if (b.type === "heading") add(`<h3>${inline(b.text)}</h3>`, b.text);
    else if (b.type === "para") {
      // linhas de diretiva (Layout, Imagem, Crédito, Fundo) configuram o slide; o resto é conteúdo
      const conteudoLinhas = [];
      for (const l of b.lines) {
        const m = l.match(DIRETIVA_RE);
        if (!m) { conteudoLinhas.push(l); continue; }
        const chave = semAcento(m[1]), valor = m[2];
        if (chave === "layout") { cur.layout = semAcento(valor); cur.explicit = true; }
        else if (chave === "imagem") cur.image = valor;
        else if (chave === "credito") cur.credit = valor;
        else if (chave === "fundo") cur.dark = semAcento(valor) === "escuro";
      }
      if (!conteudoLinhas.length) continue;
      const linhas = cur.layout === "capa" ? conteudoLinhas.filter((l) => !META_OCULTA.test(l)) : conteudoLinhas;
      if (linhas.length) add(`<p${cur.layout === "capa" ? ' class="meta"' : ""}>${linhas.map(inline).join("<br>")}</p>`, linhas.join(" "));
    } else if (b.type === "list") add(renderList(b.items), b.items.map((i) => i.text).join(" "));
    else if (b.type === "table") add(renderTable(b), [...b.header, ...b.body.flat()].join(" "));
    else if (b.type === "callout") {
      const [first, ...rest] = b.items;
      const mNotas = first && first.plain ? first.text.match(NOTAS_RE) : null;
      if (mNotas) cur.notes.push(...[mNotas[2], ...rest.map((i) => i.text)].filter(Boolean));
      else add(`<blockquote>${b.items.map((i) => (i.plain ? `<p>${inline(i.text)}</p>` : `<p>• ${inline(i.text)}</p>`)).join("")}</blockquote>`, b.items.map((i) => i.text).join(" "));
    }
  }
  return slides;
}

// ---------- logo ----------
const svgUri = (svg) => "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");

async function loadLogo() {
  if (theme.logoText) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="110" viewBox="0 0 140 110"><text x="70" y="82" font-size="80" text-anchor="middle">${esc(theme.logoText)}</text></svg>`;
    return svgUri(svg);
  }
  if (logoPath) {
    const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml" }[path.extname(logoPath).toLowerCase()] || "image/png";
    return `data:${mime};base64,` + fs.readFileSync(logoPath).toString("base64");
  }
  if (!templatePath) return null;
  const zip = await JSZip.loadAsync(fs.readFileSync(templatePath));
  const name = theme.layout === "simple" ? (theme.logoMedia || "image1.png") : "image2.png";
  const f = zip.file(`word/media/${name}`);
  return f ? "data:image/png;base64," + (await f.async("base64")) : null;
}

// ---------- CSS ----------
const css = (logo, total, imgCss = "") => `${imgCss}
:root{--title:#${C.titleBlue};--primary:#${C.primary};--accent:#${C.accent};--text:#${C.text};--strong:#${C.textStrong};--box:#${C.calloutFill || "f3f3f3"}}
html,body{background:#fff}
.reveal{font-family:"${FONT}","Segoe UI",Helvetica,Arial,sans-serif;font-size:40px;color:var(--text)}
.reveal .slides section{text-align:left}
.reveal h1,.reveal h2,.reveal h3{font-family:"${HEADING_FONT}","${FONT}",sans-serif;color:var(--title);text-transform:none;line-height:1.15;margin:0 0 .5em}
.reveal h1{font-size:2.1em}
.reveal h2{font-size:1.5em;border-bottom:4px solid var(--primary);padding-bottom:.2em}
.reveal h3{font-size:1.1em;color:var(--accent)}
.reveal p{margin:.5em 0;line-height:1.35}
.reveal strong{color:var(--strong)}
.reveal a{color:var(--primary)}
.reveal ul,.reveal ol{display:block;margin:.4em 0 .4em 1em}
.reveal li{margin:.3em 0;line-height:1.3}
.reveal ul li::marker{color:var(--primary)}
.reveal table{font-size:.75em;border-collapse:collapse;width:100%;margin:.6em 0}
.reveal th{background:var(--primary);color:#fff;text-align:left;padding:.4em .6em}
.reveal td{padding:.35em .6em;border-top:3px solid #fff;background:var(--box);vertical-align:top}
.reveal blockquote{width:100%;margin:.6em 0;padding:.3em .8em;background:var(--box);border-left:8px solid var(--primary);box-shadow:none;font-style:normal}
.reveal blockquote p{margin:.25em 0}
.reveal code{font-family:ui-monospace,Menlo,monospace;font-size:.85em}
.reveal section.capa{text-align:center}
.reveal section.capa h1{border:0;margin-top:.2em}
.reveal section.capa p.meta{font-size:.6em;color:var(--text);text-align:center}
.reveal section.capa .capa-logo{height:150px;margin:0 auto .4em;display:block}
.reveal section.destaque{text-align:center}
.reveal section.destaque h2{border:0;font-size:1.2em}
.reveal section.destaque p,.reveal section.destaque li{font-size:1.35em;line-height:1.3}
.reveal section.fechamento{text-align:center}
.reveal section.destaque ul,.reveal section.destaque ol,.reveal section.fechamento ul,.reveal section.fechamento ol{display:inline-block;text-align:left;margin:.4em 0}
.reveal section.fechamento h2{border:0}
.reveal .progress{color:var(--primary)}
.reveal .controls{color:var(--primary)}
.reveal .slide-number{color:var(--text);background:transparent;font-size:18px}

/* Layouts de imagem e de frase (classe "nl"): cada slide tem um bloco .sl que ocupa o quadro 1280x720 inteiro */
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.reveal .slides>section.nl{height:720px!important;top:0!important;padding:0;overflow:hidden;background:#fff}
.reveal .slides>section.nl.escuro{background:#${C.fundoEscuro || "000000"};color:#fff}
.reveal section.nl.escuro h1,.reveal section.nl.escuro h2,.reveal section.nl.escuro h3,.reveal section.nl.escuro strong,.reveal section.nl.escuro p,.reveal section.nl.escuro li{color:#fff}
.reveal section.nl.escuro a{color:#${C.destaque || "FFAB40"}}
.reveal section.nl .sl{position:absolute;inset:0;box-sizing:border-box}
.reveal section.nl h2{border:0;padding:0;margin:0 0 .35em;font-weight:700}
.reveal section.nl p,.reveal section.nl li{font-weight:300}
.im{background-size:cover;background-position:center;background-repeat:no-repeat}
.reveal section.nl .credito{position:absolute;right:22px;bottom:14px;font-size:16px;line-height:1.2;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.9);z-index:5}
.reveal section.nl .credito a{color:#fff;text-decoration:underline}
.reveal section.nl .fr{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 110px}
.reveal section.nl .fr h2{font-size:2.3em;line-height:1.18;margin:0}
.reveal section.nl .fr p{font-size:.95em;margin:.7em 0 0}
.reveal section.nl .fr h1{font-size:2.5em;line-height:1.15;margin:0;border:0}
.reveal section.nl .fr p.meta{font-size:.55em;margin-top:1.2em}
.reveal section.nl.secao-s .fr h2{font-size:2.6em}
.reveal section.nl .split{display:grid;grid-template-columns:1fr 1fr}
.reveal section.nl .split.esq{grid-template-columns:1fr 1fr}
.reveal section.nl .split .txt{display:flex;flex-direction:column;justify-content:center;padding:60px 64px;min-width:0}
.reveal section.nl .split.esq .txt{order:2}
.reveal section.nl .split.esq .im{order:1}
.reveal section.nl .split .txt h2{font-size:1.5em;line-height:1.2}
.reveal section.nl .split .txt h1{font-size:1.9em;line-height:1.15;border:0;margin:0 0 .4em}
.reveal section.nl .split .txt p{font-size:.85em;margin:.5em 0}
.reveal section.nl .split .txt p.meta{font-size:.62em}
.reveal section.nl .split .txt ul,.reveal section.nl .split .txt ol{margin:.3em 0 .3em 1em}
.reveal section.nl .split .txt li{font-size:.85em}
.reveal section.nl .cheia .im{position:absolute;inset:0}
.reveal section.nl .cheia .shade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 30%,rgba(0,0,0,.78) 100%)}
.reveal section.nl .cheia .txt{position:absolute;left:72px;right:72px;bottom:64px}
.reveal section.nl .cheia .txt h2,.reveal section.nl .cheia .txt p,.reveal section.nl .cheia .txt li{color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)}
.reveal section.nl .cheia .txt h2{font-size:1.9em;line-height:1.15;margin:0}
.reveal section.nl .evid .im{position:absolute;left:56px;right:56px;top:28px;bottom:104px;background-size:contain}
.reveal section.nl .evid .legenda{position:absolute;left:56px;right:56px;bottom:30px;text-align:center}
.reveal section.nl .evid .legenda h2{font-size:.9em;font-weight:400;margin:0}
.reveal section.nl .evid .legenda p{font-size:.6em;margin:.2em 0 0}

/* PDF: impressão estática (sem JavaScript). O md2pdf.js abre o arquivo com ?static-print; cada slide vira uma página 16:9. */
@page{size:1280px 720px;margin:0}
html.static-print,html.static-print body{background:#fff;height:auto;overflow:visible}
html.static-print .reveal{position:static;width:auto;height:auto;overflow:visible;font-size:40px}
html.static-print .reveal .slides{position:static!important;width:auto!important;height:auto!important;transform:none!important;perspective:none!important;display:block!important;margin:0!important;left:auto!important;top:auto!important;inset:auto!important}
html.static-print .reveal .slides>section{display:block!important;position:relative!important;top:auto!important;left:auto!important;width:1280px!important;height:720px!important;opacity:1!important;visibility:visible!important;transform:none!important;box-sizing:border-box;padding:44px 72px 100px;overflow:hidden;background:#fff;break-after:page;page-break-after:always;counter-increment:slide}
html.static-print .reveal .slides>section:last-child{break-after:auto;page-break-after:auto}
html.static-print .reveal .backgrounds,html.static-print .reveal .controls,html.static-print .reveal .progress,html.static-print .reveal .slide-number,html.static-print .reveal aside.notes{display:none!important}
${logo ? `html.static-print .reveal .slides>section:not(.capa)::before{content:"";position:absolute;right:40px;bottom:30px;width:140px;height:56px;background:url(${logo}) right bottom/contain no-repeat}` : ""}
html.static-print .reveal .slides>section::after{content:counter(slide) " / ${total}";position:absolute;left:72px;bottom:30px;font-size:18px;color:var(--text)}
html.static-print .reveal .slides>section.capa::after{content:none}
html.static-print .reveal .slides>section.nl{padding:0;overflow:hidden;background:#fff}
html.static-print .reveal .slides>section.nl.escuro{background:#${C.fundoEscuro || "000000"}}
html.static-print .reveal .slides>section.nl::before,html.static-print .reveal .slides>section.nl::after{content:none!important}
html.static-print .reveal section.capa{display:flex!important;flex-direction:column;justify-content:center;align-items:center}
html.static-print .reveal section.destaque,html.static-print .reveal section.fechamento{display:flex!important;flex-direction:column;justify-content:center}
`;

(async () => {
  const blocks = parse(fs.readFileSync(mdPath, "utf8"));
  const slides = buildSlides(blocks);
  if (!slides.length) { console.error("Nenhum slide encontrado em " + mdPath); process.exit(1); }
  const logo = await loadLogo();

  // avisos
  const roteiro = (fs.readFileSync(mdPath, "utf8").match(/^\*\*(?:Roteiro|Template):\*\*\s*(.+)$/m) || [])[1];
  const conteudo = slides.filter((s) => s.layout !== "capa");
  if (roteiro && /10-20-30/.test(roteiro) && conteudo.length !== 10)
    console.warn(`Aviso: o roteiro 10-20-30 prevê 10 slides depois da capa, e este tem ${conteudo.length}.`);
  slides.forEach((s, i) => {
    if (s.image && s.layout !== "capa" && !LAYOUTS_COM_IMAGEM.includes(s.layout) && !(ESTILO === "zen-lessig" && s.layout === "frase" && !s.explicit))
      console.warn(`Aviso: o slide ${i} ("${s.title}") tem **Imagem:**, mas o layout "${s.layout}" não mostra imagem. Use imagem-direita, imagem-esquerda, imagem-cheia ou evidencia.`);
    if (s.layout === "capa") return;
    const tituloPalavras = s.title.split(/\s+/).filter(Boolean).length;
    const limite = ["frase", "frase-escura", "secao"].includes(s.layout) ? MAX_WORDS_FRASE : s.layout === "evidencia" ? 20 : LAYOUTS_COM_IMAGEM.includes(s.layout) ? 30 : MAX_WORDS;
    const palavras = LAYOUTS_NOVOS.includes(s.layout) ? tituloPalavras + s.words : s.words;
    if (palavras > limite) console.warn(`Aviso: o slide ${i} ("${s.title}") tem ${palavras} palavras; acima de ${limite} fica difícil de ler de longe neste layout.`);
  });

  // imagens dos slides: embutidas uma única vez cada (classe .im-N), mesmo que apareçam em vários slides
  const imgs = new Map();
  const mimeDe = (f) => ({ ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" }[path.extname(f).toLowerCase()] || "image/jpeg");
  const classeDaImagem = (rel, titulo) => {
    const abs = path.resolve(projectDir, rel);
    if (!fs.existsSync(abs)) { console.warn(`Aviso: imagem não encontrada: ${rel} (slide "${titulo}")`); return null; }
    if (!imgs.has(abs)) {
      const buf = fs.readFileSync(abs);
      if (buf.length > 700 * 1024) console.warn(`Aviso: ${rel} tem ${Math.round(buf.length / 1024)} KB; otimize (por exemplo, 1600 px de largura em JPEG) para o html não ficar pesado.`);
      imgs.set(abs, { id: imgs.size + 1, uri: `data:${mimeDe(abs)};base64,` + buf.toString("base64") });
    }
    return "im-" + imgs.get(abs).id;
  };
  const renderNovo = (s, notas) => {
    const credito = s.credit ? `<div class="credito">${inline(s.credit)}</div>` : "";
    let layout = s.layout;
    const precisaImagem = LAYOUTS_COM_IMAGEM.includes(layout) || (layout === "capa" && s.image);
    const imc = s.image ? classeDaImagem(s.image, s.title) : null;
    if (precisaImagem && !imc) layout = layout === "capa" ? "capa" : "frase";
    const im = imc ? `<div class="im ${imc}" role="img" aria-label="${esc(s.title)}"></div>` : "";
    const escuro = s.dark !== null ? s.dark : (["frase-escura", "secao", "evidencia"].includes(layout) || (layout === "capa" && (!!imc || ESTILO === "zen-lessig")));
    const cls = (extra) => `nl ${extra} ${escuro ? "escuro" : ""}`.trim();
    if (layout === "capa" && imc) return `<section class="${cls("capa-img")}"><div class="sl split dir"><div class="txt"><h1>${inline(s.title)}</h1>${s.html}</div>${im}</div>${credito}${notas}</section>`;
    if (layout === "imagem-direita" || layout === "imagem-esquerda")
      return `<section class="${cls("imagem")}"><div class="sl split ${layout === "imagem-esquerda" ? "esq" : "dir"}"><div class="txt"><h2>${inline(s.title)}</h2>${s.html}</div>${im}</div>${credito}${notas}</section>`;
    if (layout === "imagem-cheia")
      return `<section class="${cls("imagem")}"><div class="sl cheia">${im}<div class="shade"></div><div class="txt"><h2>${inline(s.title)}</h2>${s.html}</div></div>${credito}${notas}</section>`;
    if (layout === "evidencia")
      return `<section class="${cls("evidencia")}"><div class="sl evid">${im}<div class="legenda"><h2>${inline(s.title)}</h2>${s.html}</div></div>${credito}${notas}</section>`;
    if (layout === "capa") return `<section class="${cls("capa-s")}"><div class="sl fr"><h1>${inline(s.title)}</h1>${s.html}</div>${credito}${notas}</section>`;
    // frase, frase-escura, secao
    return `<section class="${cls(layout === "secao" ? "secao-s" : "frase-s")}"><div class="sl fr"><h2>${inline(s.title)}</h2>${s.html}</div>${credito}${notas}</section>`;
  };

  const bgLogo = logo ? ` data-background-color="#ffffff" data-background-image="${logo}" data-background-size="auto 56px" data-background-position="right 36px bottom 26px" data-background-repeat="no-repeat"` : ' data-background-color="#ffffff"';
  const sections = slides.map((s) => {
    const notas = s.notes.length ? `<aside class="notes">${s.notes.map(esc).join("<br>")}</aside>` : "";
    if (ESTILO === "zen-lessig" && s.layout === "frase" && !s.explicit && s.image) s.layout = "imagem-direita";
    if (LAYOUTS_NOVOS.includes(s.layout) || (s.layout === "capa" && (s.image || ESTILO === "zen-lessig"))) return renderNovo(s, notas);
    if (s.layout === "capa") {
      const capaLogo = logo ? `<img class="capa-logo" src="${logo}" alt="${esc(theme.name || "Logo")}">` : "";
      return `<section class="capa" data-background-color="#ffffff">${capaLogo}<h1>${inline(s.title)}</h1>${s.html}${notas}</section>`;
    }
    const cls = ["destaque", "fechamento"].includes(s.layout) ? s.layout : "conteudo";
    return `<section class="${cls}"${bgLogo}><h2>${inline(s.title)}</h2>${s.html}${notas}</section>`;
  }).join("\n");

  const R = path.dirname(require.resolve("reveal.js/package.json"));
  const read = (p) => fs.readFileSync(path.join(R, p), "utf8");
  // O reveal.css traz um @media print genérico, com !important, que força fontes de 20pt e títulos pretos e anularia o tema
  // na impressão. O PDF dos slides é controlado aqui (modo ?static-print), então esse bloco é removido.
  const semPrintGenerico = (css) => {
    const i = css.indexOf("@media print{");
    if (i < 0) return css;
    let depth = 0, j = i + "@media print".length;
    for (; j < css.length; j++) { if (css[j] === "{") depth++; else if (css[j] === "}" && --depth === 0) { j++; break; } }
    return css.slice(0, i) + css.slice(j);
  };
  // slides.css de cada tema da cadeia (do mais distante ao mais próximo), se houver
  const extra = (temaDirs || []).map((d) => path.join(d, "slides.css")).filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, "utf8")).join("\n");
  const titulo = slides[0].layout === "capa" ? slides[0].title : path.basename(mdPath, ".md");

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>${esc(titulo)}</title>
<style>${read("dist/reset.css")}</style>
<style>${semPrintGenerico(read("dist/reveal.css"))}</style>
<style>${css(logo, slides.length, [...imgs.values()].map((i) => `.im-${i.id}{background-image:url(${i.uri})}`).join("\n"))}${extra}</style>
</head>
<body>
<div class="reveal"><div class="slides">
${sections}
</div></div>
<script>${read("dist/reveal.js")}</script>
<script>
if (/[?&]static-print/.test(location.search)) {
  // impressão para PDF: sem o reveal, cada slide é uma página (ver o CSS "static-print")
  document.documentElement.classList.add("static-print");
} else Reveal.initialize({ hash: true, width: 1280, height: 720, margin: 0.05, center: false, transition: "fade", slideNumber: "c/t", controls: true, progress: true, pdfSeparateFragments: false });
</script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log("Gerado:", outPath);
})();
