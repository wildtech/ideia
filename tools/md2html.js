#!/usr/bin/env node
// Compila um documento de projeto (Markdown) em HTML autocontido, no visual do template .docx/.pdf.
//
// Uso: node tools/md2html.js <pasta-do-projeto> [arquivo.md] [saida.html]
//
// Usa o mesmo theme.json do md2docx.js. As imagens (logo, ícone e marca d'água com a barra degradê)
// são extraídas do template .docx e embutidas no HTML em base64. O HTML funciona offline.
// Para imprimir/gerar PDF: Imprimir > Salvar como PDF > A4, margens "Nenhuma", com "Gráficos de plano de fundo".

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { PNG } = require("pngjs");
const { parse } = require("./md-parse");

const [, , projectArg, mdArg, outArg] = process.argv;
if (!projectArg) {
  console.error("Uso: node tools/md2html.js <pasta-do-projeto> [arquivo.md] [saida.html]");
  process.exit(1);
}
const projectDir = path.resolve(projectArg);
const theme = JSON.parse(fs.readFileSync(path.join(projectDir, "theme.json"), "utf8"));
const mdPath = path.resolve(mdArg || path.join(projectDir, path.basename(projectDir) + ".md"));
const outPath = path.resolve(outArg || path.join(projectDir, "out", path.basename(mdPath).replace(/\.md$/, ".html")));
const templatePath = path.resolve(projectDir, theme.template);
const C = theme.colors;
const FONT = theme.font || "Source Sans Pro";
const HEADING_FONT = theme.headingFont || FONT;
// layout "classic" (padrão): logo no canto, marca d'água e barra degradê, seções numeradas e em maiúsculas.
// layout "simple": logo centralizado no topo, sem marca d'água, rodapé de texto (theme.footer) e seções sem numeração
//   (a menos que numberSections seja true). Opções: logoMedia (imagem do template, padrão image1.png), logoText (texto ou emoji no lugar da imagem, como o 💡 do
//   template genérico) com logoTextSize (px, padrão 120), footer (lista de linhas Markdown).
const SIMPLE = theme.layout === "simple";
const HEADER_DATE = theme.headerDate === true; // no simple: data da geração ao lado do número de página
const todayLabel = () => {
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${meses[d.getMonth()]}/${d.getFullYear()}`;
};
const NUMBER_SECTIONS = theme.numberSections ?? !SIMPLE;
const UPPER = theme.uppercaseTitles ?? !SIMPLE;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(text) {
  let out = "", last = 0, m;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  while ((m = re.exec(text))) {
    out += esc(text.slice(last, m.index));
    if (m[2] !== undefined) out += `<strong>${esc(m[2])}</strong>`;
    else if (m[3] !== undefined) out += `<em>${esc(m[3])}</em>`;
    else if (m[4] !== undefined) out += `<code>${esc(m[4])}</code>`;
    else if (/^https?:/.test(m[6])) out += `<a href="${esc(m[6])}">${esc(m[5])}</a>`;
    else out += `<a href="${esc(m[6])}">${esc(m[5])}</a>`;
    last = re.lastIndex;
  }
  return out + esc(text.slice(last));
}

// Lista plana {level, ordered, text} -> árvore -> <ul>/<ol> aninhados
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
  const narrow = (c) => b.header.length > 3 && Math.max(b.header[c].length, ...b.body.map((r) => (r[c] || "").length)) <= 3;
  const cls = (c) => (narrow(c) ? ' class="narrow"' : "");
  return `<div class="box"><table><thead><tr>${b.header.map((h, c) => `<th${cls(c)}>${inline(h)}</th>`).join("")}</tr></thead><tbody>` +
    b.body.map((r) => `<tr>${b.header.map((_, c) => `<td${cls(c)}>${inline(r[c] || "")}</td>`).join("")}</tr>`).join("") +
    "</tbody></table></div>";
}

// Citação: primeira linha em texto simples vira a faixa azul do "box"; o resto vai no corpo cinza.
function renderCallout(b) {
  const items = [...b.items];
  let head = "";
  if (items.length && items[0].plain && /:(\*\*)?\s*$/.test(items[0].text)) head = `<div class="box-head">${inline(items.shift().text.replace(/:(\*\*)?\s*$/, "$1"))}</div>`;
  const rest = items.filter((it) => !it.plain);
  const plain = items.filter((it) => it.plain).map((it) => `<p>${inline(it.text)}</p>`).join("");
  return `<div class="box">${head}<div class="box-body">${plain}${renderList(rest)}</div></div>`;
}

function renderBody(blocks) {
  let html = "", titleDone = false;
  for (const b of blocks) {
    if (b.type === "heading") {
      if (b.level === 1 && !titleDone) { titleDone = true; html += `<h1>${inline(b.text)}</h1>`; }
      else if (b.level <= 3) html += `<h2>${inline(b.text)}</h2>`;
      else html += `<h3>${inline(b.text)}</h3>`;
    } else if (b.type === "para") {
      html += `<p${b.lines.length > 1 ? ' class="meta"' : ""}>${b.lines.map(inline).join("<br>")}</p>`;
    } else if (b.type === "list") html += renderList(b.items);
    else if (b.type === "callout") html += renderCallout(b);
    else if (b.type === "table") html += renderTable(b);
  }
  return html;
}

const css = (img) => `
:root{--title:#${C.titleBlue};--primary:#${C.primary};--accent:#${C.accent};--text:#${C.text};--strong:#${C.textStrong};--box:#f3f3f3}
*{box-sizing:border-box}
html{background:#e9edf3}
body{margin:0;font-family:"${FONT}","Source Sans 3","Segoe UI",Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:var(--text);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet{position:relative;width:794px;max-width:100%;min-height:1123px;margin:24px auto;padding:150px 78px 110px 133px;background:#fff url(${img.watermarkNoBar}) 0 0/794px 1123px repeat-y;box-shadow:0 2px 18px rgba(0,40,100,.18)}
.sheet::after{content:"";position:absolute;left:133px;right:78px;bottom:34px;height:12px;background:linear-gradient(90deg,#0072e6,#00cccc)}
.logo{position:absolute;top:34px;right:78px;z-index:2;background:#fff;padding:0 0 2px 6px}
.logo img{display:block;height:44px}
.logo-icon{position:fixed;top:30px;right:60px;height:20px;z-index:1;display:none}
h1{margin:0 0 26px;text-align:center;font-size:17.5px;line-height:1.35;font-weight:700;letter-spacing:.01em;text-transform:uppercase;color:var(--title)}
h2{counter-increment:sec;display:flex;gap:30px;margin:42px 0 14px;font-size:14.5px;line-height:1.3;font-weight:700;text-transform:uppercase;color:var(--title);break-after:avoid}
h2::before{content:counter(sec) ".";color:#000;font-weight:700;min-width:1.2em}
h3{margin:24px 0 8px;font-size:14px;font-weight:700;color:var(--accent);break-after:avoid}
body{counter-reset:sec}
p{margin:0 0 12px;text-align:justify}
p.meta{text-align:left}
strong{color:var(--strong);font-weight:700}
a{color:var(--primary)}
code{font-family:ui-monospace,Menlo,monospace;font-size:.92em}
ul,ol{margin:0 0 14px;padding-left:24px}
li{margin:0 0 4px;padding-left:6px}
ul{list-style:none;padding-left:22px}
ul>li{position:relative}
ul>li::before{content:"●";position:absolute;left:-18px;color:var(--primary);font-size:.7em;top:.28em}
ul ul>li::before{content:"○"}
ol{list-style:none;counter-reset:n;padding-left:22px}
ol>li{counter-increment:n;position:relative}
ol>li::before{content:counter(n) ".";position:absolute;left:-24px;width:20px;text-align:right;color:var(--primary);font-weight:700}
li>ul,li>ol{margin:4px 0 0}
.box{margin:6px 0 20px;background:var(--box);break-inside:avoid}
.box-head{background:var(--primary);color:#fff;text-align:center;font-weight:700;text-transform:uppercase;padding:11px 14px;font-size:14px}
.box-head strong{color:inherit}
.box-body{padding:14px 18px 8px;font-size:14px}
.box-body ul{margin-bottom:6px}
.box-body p{margin-bottom:8px}
.box table{width:100%;border-collapse:collapse;font-size:13.5px;line-height:1.4}
.box th{background:var(--primary);color:#fff;text-align:left;text-transform:uppercase;font-weight:700;padding:10px 12px}
.box td{padding:8px 12px;border-top:3px solid #fff;vertical-align:top}
.box tbody tr:first-child td{border-top:0}
.box td:first-child{min-width:120px;color:var(--strong);font-weight:600}
.box th.narrow,.box td.narrow{width:44px;text-align:center}
tr{break-inside:avoid}
@media (max-width:820px){
  html{background:#fff}
  .sheet{margin:0;padding:96px 20px 70px;box-shadow:none;background-size:100% auto}
  .logo{right:20px}
  .sheet::after{left:20px;right:20px}
  h2{gap:18px}
}
@page{size:A4;margin:0}
.paged{width:100%;border-collapse:collapse}
.paged>thead>tr>td,.paged>tfoot>tr>td,.paged>tbody>tr>td{padding:0;border:0;background:none}
.sp-top,.sp-bottom{display:none}
@media print{
  html{background:#fff}
  .sheet{width:auto;min-height:0;margin:0;padding:0 20mm 0 35mm;background:none;box-shadow:none}
  .sheet::after{display:none}
  .sheet::before{content:"";position:fixed;z-index:-1;top:0;left:0;width:210mm;height:297mm;background:url(${img.watermark}) 0 0/100% 100% no-repeat}
  .sp-top{display:block;height:30mm}
  .sp-bottom{display:block;height:28mm}
  .logo{position:absolute;top:5mm;right:14mm;padding:5mm 3mm 2mm 4mm}
  .logo img{height:11mm}
  .logo-icon{display:block;position:fixed;top:9mm;right:20mm;height:5mm}
}
`;

// Rodapé nas caixas de margem da página aceita só texto: tira a formatação Markdown (links viram o texto do link).
const footerPlain = (theme.footer || []).map((l) => l.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`]/g, "").replace(/"/g, '\\"')).join("\\A ");
const cssSimple = () => `
:root{--title:#${C.titleBlue};--primary:#${C.primary};--accent:#${C.accent};--text:#${C.text};--strong:#${C.textStrong};--box:#f3f3f3}
*{box-sizing:border-box}
html{background:#e9edf3}
body{margin:0;font-family:"${FONT}","Segoe UI",Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:var(--text);-webkit-print-color-adjust:exact;print-color-adjust:exact;counter-reset:sec}
.sheet{position:relative;width:794px;max-width:100%;min-height:1123px;margin:24px auto;padding:60px 78px 110px;background:#fff;box-shadow:0 2px 18px rgba(0,0,0,.15)}
.logo{text-align:center;margin:0 0 18px}
.logo img{height:96px;max-width:100%}
.logo-text{font-size:${theme.logoTextSize || 120}px;line-height:1.1}
.foot{margin-top:40px;text-align:right;font-size:12px;line-height:1.35}
.foot p{margin:0;text-align:right}
h1{margin:0 0 26px;text-align:center;font-family:"${HEADING_FONT}",sans-serif;font-size:19px;line-height:1.35;font-weight:700;${UPPER ? "text-transform:uppercase;" : ""}color:var(--title)}
h2{${NUMBER_SECTIONS ? "counter-increment:sec;display:flex;gap:30px;" : ""}margin:34px 0 10px;font-family:"${HEADING_FONT}",sans-serif;font-size:15px;line-height:1.3;font-weight:700;${UPPER ? "text-transform:uppercase;" : ""}color:var(--title);break-after:avoid}
${NUMBER_SECTIONS ? 'h2::before{content:counter(sec) ".";font-weight:700;min-width:1.2em}' : ""}
h3{margin:22px 0 8px;font-family:"${HEADING_FONT}",sans-serif;font-size:14px;font-weight:700;color:var(--accent);break-after:avoid}
p{margin:0 0 12px;text-align:justify}
p.meta{text-align:left}
strong{color:var(--strong);font-weight:700}
a{color:var(--primary)}
code{font-family:ui-monospace,Menlo,monospace;font-size:.92em}
ul,ol{margin:0 0 14px;padding-left:24px}
li{margin:0 0 4px;padding-left:6px}
ul{list-style:none;padding-left:22px}
ul>li{position:relative}
ul>li::before{content:"-";position:absolute;left:-16px}
ol{list-style:none;counter-reset:n;padding-left:22px}
ol>li{counter-increment:n;position:relative}
ol>li::before{content:counter(n) ".";position:absolute;left:-24px;width:20px;text-align:right;font-weight:700}
li>ul,li>ol{margin:4px 0 0}
.box{margin:6px 0 20px;background:var(--box);break-inside:avoid}
.box-head{background:var(--primary);color:#fff;text-align:center;font-weight:700;padding:11px 14px;font-size:14px}
.box-head strong{color:inherit}
.box-body{padding:14px 18px 8px;font-size:14px}
.box-body ul{margin-bottom:6px}
.box-body p{margin-bottom:8px}
.box table{width:100%;border-collapse:collapse;font-size:13.5px;line-height:1.4}
.box th{background:var(--primary);color:#fff;text-align:left;font-weight:700;padding:10px 12px}
.box td{padding:8px 12px;border-top:3px solid #fff;vertical-align:top}
.box tbody tr:first-child td{border-top:0}
.box td:first-child{min-width:120px;color:var(--strong);font-weight:600}
.box th.narrow,.box td.narrow{width:44px;text-align:center}
tr{break-inside:avoid}
.paged>tbody>tr,.paged>tbody>tr>td{break-inside:auto}
@media (max-width:820px){html{background:#fff}.sheet{margin:0;padding:30px 20px 70px;box-shadow:none}}
/* Na impressão, a margem da página (topo, rodapé e laterais) vem do @page; número de página e data ficam nas caixas de margem. */
@page{size:A4;margin:${theme.pageMarginTop || 22}mm 20mm 26mm 20mm;
  @top-right{content:counter(page)${HEADER_DATE ? ` "\\A ${todayLabel()}"` : ""};white-space:pre;text-align:right;vertical-align:bottom;font-family:"${FONT}",sans-serif;font-size:10px;color:#${C.text};padding-bottom:6mm}
  @bottom-right{content:"${footerPlain}";white-space:pre;text-align:right;vertical-align:top;font-family:"${FONT}",sans-serif;font-size:10px;line-height:1.35;color:#${C.textStrong};padding-top:6mm}}
@media print{
  html{background:#fff}
  .sheet{width:auto;min-height:0;margin:0;padding:0;box-shadow:none}
  .logo{margin-bottom:10px}
  .foot{display:none}
}
`;

// Na tela a marca d'água se repete a cada "página" dentro de um fluxo contínuo; por isso a barra degradê
// (que faz parte da imagem, nas últimas linhas) é apagada copiando faixa de cima. A barra é redesenhada em CSS no fim do documento.
async function withoutBar(buf) {
  const png = PNG.sync.read(buf);
  const { width: w, height: h, data } = png;
  const isBar = (y) => { for (let x = 0; x < w; x += 8) { const i = (y * w + x) * 4; if (data[i + 2] > 200 && data[i] < 80) return true; } return false; };
  let first = h;
  for (let y = Math.floor(h * 0.9); y < h; y++) if (isBar(y)) { first = y; break; }
  const start = Math.max(0, first - 2), count = h - start, src = start - count - 4;
  for (let k = 0; k < count; k++) data.copy(data, (start + k) * w * 4, (src + k) * w * 4, (src + k + 1) * w * 4);
  return "data:image/png;base64," + PNG.sync.write(png).toString("base64");
}

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(templatePath));
  const uri = async (name) => "data:image/png;base64," + (await zip.file(`word/media/${name}`).async("base64"));
  let img;
  if (SIMPLE) img = { logo: theme.logoText ? "" : await uri(theme.logoMedia || "image1.png") };
  else {
    // image1 = ícone redondo, image2 = logo (wordmark), image3 = marca d'água de página inteira com barra degradê
    img = { icon: await uri("image1.png"), logo: await uri("image2.png"), watermark: await uri("image3.png") };
    img.watermarkNoBar = await withoutBar(await zip.file("word/media/image3.png").async("nodebuffer"));
  }

  const blocks = parse(fs.readFileSync(mdPath, "utf8"));
  const title = blocks.find((b) => b.type === "heading")?.text || path.basename(mdPath, ".md");
  const footerHtml = (theme.footer || []).map((l) => `<p>${inline(l)}</p>`).join("");
  const fontLink = SIMPLE ? "" : `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
`;
  const page = SIMPLE
    ? `<main class="sheet">
${theme.logoText ? `<div class="logo logo-text">${esc(theme.logoText)}</div>` : `<div class="logo"><img src="${img.logo}" alt="${esc(theme.name || "Logo")}"></div>`}
${renderBody(blocks)}
<div class="foot">${footerHtml}</div>
</main>`
    : `<img class="logo-icon" src="${img.icon}" alt="">
<main class="sheet">
<div class="logo"><img src="${img.logo}" alt="${esc(theme.name || "Logo")}"></div>
<table class="paged"><thead><tr><td><div class="sp-top"></div></td></tr></thead><tbody><tr><td>
${renderBody(blocks)}
</td></tr></tbody><tfoot><tr><td><div class="sp-bottom"></div></td></tr></tfoot></table>
</main>`;
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${fontLink}<style>${SIMPLE ? cssSimple() : css(img)}</style>
</head>
<body>
${page}
</body>
</html>
`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log("Gerado:", outPath);
})();
