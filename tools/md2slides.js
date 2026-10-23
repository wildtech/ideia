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
const LAYOUT_RE = /^\*\*Layout:\*\*\s*([a-zA-Zçã]+)\s*$/;
const NOTAS_RE = /^\*{0,2}Notas( do apresentador)?:\*{0,2}\s*(.*)$/i;

function buildSlides(blocks) {
  const slides = [];
  let cur = null;
  for (const b of blocks) {
    if (b.type === "heading" && b.level === 1 && !slides.length) {
      cur = { layout: "capa", title: b.text, html: "", notes: [], words: 0 };
      slides.push(cur);
      continue;
    }
    if (b.type === "heading" && b.level <= 3) {
      cur = { layout: "conteudo", title: b.text, html: "", notes: [], words: 0 };
      slides.push(cur);
      continue;
    }
    if (!cur) continue;
    const add = (html, text) => { cur.html += html; cur.words += (text || "").split(/\s+/).filter(Boolean).length; };
    if (b.type === "heading") add(`<h3>${inline(b.text)}</h3>`, b.text);
    else if (b.type === "para") {
      if (b.lines.length === 1 && LAYOUT_RE.test(b.lines[0])) { cur.layout = b.lines[0].match(LAYOUT_RE)[1].toLowerCase().replace("ç", "c").replace("ã", "a"); continue; }
      const linhas = cur.layout === "capa" ? b.lines.filter((l) => !META_OCULTA.test(l)) : b.lines;
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
const css = (logo) => `
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
${theme.logoText || logo ? ".reveal .slide-background .logo-bg{}" : ""}
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
    if (s.layout !== "capa" && s.words > MAX_WORDS) console.warn(`Aviso: o slide ${i} ("${s.title}") tem ${s.words} palavras; acima de ${MAX_WORDS} fica difícil de ler de longe.`);
  });

  const bgLogo = logo ? ` data-background-color="#ffffff" data-background-image="${logo}" data-background-size="auto 56px" data-background-position="right 36px bottom 26px" data-background-repeat="no-repeat"` : ' data-background-color="#ffffff"';
  const sections = slides.map((s) => {
    const notas = s.notes.length ? `<aside class="notes">${s.notes.map(esc).join("<br>")}</aside>` : "";
    if (s.layout === "capa") {
      const capaLogo = logo ? `<img class="capa-logo" src="${logo}" alt="${esc(theme.name || "Logo")}">` : "";
      return `<section class="capa" data-background-color="#ffffff">${capaLogo}<h1>${inline(s.title)}</h1>${s.html}${notas}</section>`;
    }
    const cls = ["destaque", "fechamento"].includes(s.layout) ? s.layout : "conteudo";
    return `<section class="${cls}"${bgLogo}><h2>${inline(s.title)}</h2>${s.html}${notas}</section>`;
  }).join("\n");

  const R = path.dirname(require.resolve("reveal.js/package.json"));
  const read = (p) => fs.readFileSync(path.join(R, p), "utf8");
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
<style>${read("dist/reveal.css")}</style>
<style>${css(logo)}${extra}</style>
</head>
<body>
<div class="reveal"><div class="slides">
${sections}
</div></div>
<script>${read("dist/reveal.js")}</script>
<script>
Reveal.initialize({ hash: true, width: 1280, height: 720, margin: 0.05, center: false, transition: "fade", slideNumber: "c/t", controls: true, progress: true, pdfSeparateFragments: false });
</script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log("Gerado:", outPath);
})();
