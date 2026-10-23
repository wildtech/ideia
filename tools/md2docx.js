#!/usr/bin/env node
// Compila um documento de projeto (Markdown) em .docx usando um template .docx como base.
//
// Uso: node tools/md2docx.js <pasta-do-projeto> [arquivo.md] [saida.docx]
//
//   <pasta-do-projeto> deve conter um projeto.json com "tema": o nome de uma pasta em temas/ (tema.json + base.docx).
//   (Formato antigo, ainda aceito: um theme.json na pasta do projeto, com "template" relativo a ela.)
//   O tema traz "template" (o .docx de base) e "colors" (cores usadas em tabelas e destaques).
//   Sem arquivo.md, usa <pasta>/<nome-da-pasta>.md. Sem saida, grava em <pasta>/out/.
//
// O template fornece cabeçalhos, rodapés, marca d'água/logo, estilos e numeração.
// O script substitui apenas o corpo do documento, mantendo a seção de página do template.

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const [, , projectArg, mdArg, outArg] = process.argv;
if (!projectArg) {
  console.error("Uso: node tools/md2docx.js <pasta-do-projeto> [arquivo.md] [saida.docx]");
  process.exit(1);
}
const projectDir = path.resolve(projectArg);
const { theme, templatePath, logoPath } = require("./tema").loadTheme(projectDir);
if (!templatePath) { console.error("O tema não tem base.docx. Use \"extends\": \"neutro\" no tema.json para herdar a base neutra."); process.exit(1); }
const mdPath = path.resolve(mdArg || path.join(projectDir, path.basename(projectDir) + ".md"));
const outPath = path.resolve(outArg || path.join(projectDir, "out", path.basename(mdPath).replace(/\.md$/, ".docx")));
const C = theme.colors;
const FONT = theme.font || "Source Sans Pro";
const HEADING_FONT = theme.headingFont || FONT;
// Opções do tema (os padrões valem para o layout "classic"):
//   numberSections: numera as seções (1., 2., ...) com a numeração nº 1 do template
//   uppercaseTitles: título e seções em maiúsculas
//   headerDate: troca o texto "dd/mmm/yyyy" do cabeçalho do template pela data da geração
//   keepLeadingParagraphs: quantos parágrafos do início do corpo do template são mantidos (ex.: logo no corpo)
const NUMBER_SECTIONS = theme.numberSections !== false;
const UPPER = theme.uppercaseTitles !== false;
const KEEP_LEADING = theme.keepLeadingParagraphs || 0;
const HEADER_DATE = theme.headerDate === true;
const caps = (t) => (UPPER ? t.toUpperCase() : t);

// Layout do template (padrão, "classic"): texto recuado em 850 twips; margens 1134 / 1132; página A4.
// Outros temas ajustam no tema.json: "indent" (recuo do texto) e "margins" ([esquerda, direita]).
const INDENT = theme.indent ?? 850;
const [MARGIN_L, MARGIN_R] = theme.margins || [1134, 1132];
const CONTENT_W = 11906 - MARGIN_L - MARGIN_R - INDENT; // largura útil do corpo

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- runs ----------
const fontXmlOf = (f) => `<w:rFonts w:ascii="${f}" w:cs="${f}" w:eastAsia="${f}" w:hAnsi="${f}"/>`;
const fontXml = fontXmlOf(FONT);
function rPr({ bold, italics, color = C.text, size, underline, mono, heading } = {}) {
  return "<w:rPr>" +
    (mono ? '<w:rFonts w:ascii="Courier New" w:cs="Courier New" w:eastAsia="Courier New" w:hAnsi="Courier New"/>' : heading ? fontXmlOf(HEADING_FONT) : fontXml) +
    (bold ? '<w:b w:val="1"/><w:bCs w:val="1"/>' : "") +
    (italics ? '<w:i w:val="1"/><w:iCs w:val="1"/>' : "") +
    `<w:color w:val="${color}"/>` +
    (size ? `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>` : "") +
    (underline ? '<w:u w:val="single"/>' : "") +
    "</w:rPr>";
}
const run = (text, o) => `<w:r>${rPr(o)}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;

const hyperlinks = []; // {id, url}
function inline(text, base = {}) {
  let out = "";
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, m;
  const plain = (t, extra) => { if (t) out += run(t, { ...base, ...extra }); };
  while ((m = re.exec(text))) {
    plain(text.slice(last, m.index));
    if (m[2] !== undefined) plain(m[2], { bold: true, color: base.color === C.text ? C.textStrong : base.color });
    else if (m[3] !== undefined) plain(m[3], { italics: true });
    else if (m[4] !== undefined) plain(m[4], { mono: true });
    else if (/^https?:/.test(m[6])) {
      const id = `rIdLink${hyperlinks.length + 1}`;
      hyperlinks.push({ id, url: m[6] });
      out += `<w:hyperlink r:id="${id}" w:history="1">${run(m[5], { ...base, color: C.primary, underline: true })}</w:hyperlink>`;
    } else plain(m[5], { color: C.primary });
    last = re.lastIndex;
  }
  plain(text.slice(last));
  return out;
}

// ---------- parágrafos (formatos do template) ----------
const SP = '<w:spacing w:after="{A}" w:before="{B}" w:line="276" w:lineRule="auto"/>';
const spacing = (after = 120, before = 0) => SP.replace("{A}", after).replace("{B}", before);
const ind = (left = INDENT) => `<w:ind w:left="${left}" w:right="7" w:firstLine="0"/>`;

const empty = (after = 200) => `<w:p><w:pPr>${spacing(after)}</w:pPr></w:p>`;

const title = (text) => `<w:p><w:pPr><w:keepNext w:val="1"/><w:keepLines w:val="1"/>${spacing(240, 120)}${ind()}<w:jc w:val="center"/></w:pPr>` +
  run(caps(text), { bold: true, color: C.titleBlue, size: 28, heading: true }) + "</w:p>";

const section = (text) => `<w:p><w:pPr><w:keepNext w:val="1"/><w:keepLines w:val="1"/>` +
  (NUMBER_SECTIONS ? `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>` : "") +
  `${spacing(160, 320)}${ind()}</w:pPr>` + run(caps(text), { bold: true, color: C.titleBlue, size: 24, heading: true }) + "</w:p>";

const subsection = (text) => `<w:p><w:pPr><w:keepNext w:val="1"/><w:keepLines w:val="1"/>${spacing(100, 200)}${ind()}</w:pPr>` +
  run(text, { bold: true, color: C.accent, size: 22, heading: true }) + "</w:p>";

const body = (inner, { jc = "both", after = 120 } = {}) =>
  `<w:p><w:pPr>${spacing(after)}${ind()}<w:jc w:val="${jc}"/></w:pPr>${inner}</w:p>`;

function listItem(it, numId) {
  const left = INDENT + 360 + it.level * 360;
  return `<w:p><w:pPr><w:numPr><w:ilvl w:val="${it.ordered ? 0 : it.level}"/><w:numId w:val="${numId}"/></w:numPr>${spacing(60)}` +
    `<w:ind w:left="${left}" w:right="7" w:hanging="360"/></w:pPr>` +
    inline(it.text, { size: 21 }) + "</w:p>";
}

const callout = (inner, indentExtra = 0, numPr = "") =>
  `<w:p><w:pPr>${numPr}<w:pBdr><w:left w:val="single" w:sz="24" w:space="8" w:color="${C.primary}"/></w:pBdr>` +
  `<w:shd w:val="clear" w:color="auto" w:fill="F3F3F3"/>${spacing(40)}` +
  `<w:ind w:left="${INDENT + 200 + indentExtra}" w:right="7" w:firstLine="0"/></w:pPr>${inner}</w:p>`;

// ---------- numeração de listas ordenadas (adicionada ao numbering.xml do template) ----------
// Os ids são calculados a partir do numbering.xml do template (ver main), para não colidir com as listas dele.
let ORDERED_ABSTRACT_ID = 3;
let nextNumId = 3;
const orderedNums = [];
function newOrderedNum() {
  const id = nextNumId++;
  orderedNums.push(id);
  return id;
}
const orderedAbstract = () => `<w:abstractNum w:abstractNumId="${ORDERED_ABSTRACT_ID}"><w:multiLevelType w:val="hybridMultilevel"/>` +
  Array.from({ length: 9 }, (_, lv) =>
    `<w:lvl w:ilvl="${lv}"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%${lv + 1}."/><w:lvlJc w:val="left"/>` +
    `<w:pPr><w:ind w:left="${720 + lv * 360}" w:hanging="360"/></w:pPr><w:rPr><w:b w:val="1"/><w:color w:val="${C.primary}"/></w:rPr></w:lvl>`).join("") +
  "</w:abstractNum>";

// ---------- tabelas ----------
function table(b) {
  const weight = b.header.map((h, c) => {
    const lens = [h.length, ...b.body.map((r) => (r[c] || "").replace(/\*\*/g, "").length)];
    return Math.min(Math.max(...lens, 3), 48);
  });
  const total = weight.reduce((a, c) => a + c, 0);
  const widths = weight.map((w) => Math.max(520, Math.round((w / total) * CONTENT_W)));
  widths[widths.indexOf(Math.max(...widths))] += CONTENT_W - widths.reduce((a, c) => a + c, 0);

  const line = `w:val="single" w:sz="12" w:space="0" w:color="FFFFFF"`;
  const cell = (text, c, head, ri) => {
    const fill = head ? C.primary : "F3F3F3";
    const narrow = b.header.length > 3 && widths[c] < 900;
    return `<w:tc><w:tcPr><w:tcW w:w="${widths[c]}" w:type="dxa"/>` +
      `<w:tcBorders><w:top ${line}/><w:left ${line}/><w:bottom ${line}/><w:right ${line}/></w:tcBorders>` +
      (fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : "") +
      `<w:tcMar><w:top w:w="70" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="70" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar>` +
      `</w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="252" w:lineRule="auto"/><w:jc w:val="${narrow ? "center" : "left"}"/></w:pPr>` +
      inline(text, head ? { bold: true, size: 19, color: "FFFFFF" } : { size: 19 }) + "</w:p></w:tc>";
  };
  const row = (cells, head, ri) =>
    `<w:tr><w:trPr><w:cantSplit/>${head ? "<w:tblHeader/>" : ""}</w:trPr>${cells.map((t, c) => cell(t, c, head, ri)).join("")}</w:tr>`;
  return `<w:tbl><w:tblPr><w:tblW w:w="${CONTENT_W}" w:type="dxa"/><w:tblInd w:w="${INDENT}" w:type="dxa"/><w:tblLayout w:type="fixed"/></w:tblPr>` +
    `<w:tblGrid>${widths.map((w) => `<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>` +
    row(b.header, true, 0) + b.body.map((r, ri) => row(b.header.map((_, c) => r[c] || ""), false, ri)).join("") + "</w:tbl>";
}

const { parse } = require("./md-parse");

// ---------- montagem do corpo ----------
function buildBody(blocks) {
  const out = [empty(200)];
  let titleDone = false;
  for (const b of blocks) {
    if (b.type === "heading") {
      if (b.level === 1 && !titleDone) { titleDone = true; out.push(title(b.text)); }
      else if (b.level <= 3) out.push(section(b.text));
      else out.push(subsection(b.text));
    } else if (b.type === "para") {
      // linhas consecutivas viram quebras de linha; alinhado à esquerda
      const inner = b.lines.map((l, idx) => (idx ? '<w:r><w:br/></w:r>' : "") + inline(l, { size: 21 })).join("");
      out.push(body(inner, { jc: b.lines.length > 1 ? "left" : "both" }));
    } else if (b.type === "list") {
      const numId = b.items.some((it) => it.ordered) ? newOrderedNum() : 2;
      b.items.forEach((it) => out.push(listItem(it, numId)));
      out.push(empty(60));
    } else if (b.type === "callout") {
      for (const it of b.items) {
        if (it.plain) out.push(callout(inline(it.text, { size: 21 })));
        else out.push(callout(inline(it.text, { size: 21 }), 360 + it.level * 360,
          `<w:numPr><w:ilvl w:val="${it.level}"/><w:numId w:val="2"/></w:numPr>`));
      }
      out.push(empty(120));
    } else if (b.type === "table") {
      out.push(table(b));
      out.push(empty(160));
    }
  }
  return out.join("");
}

// ---------- logo e rodapé de temas simples (só cores e logo) ----------
// Tamanho em pixels de uma imagem PNG ou JPEG (para manter a proporção ao embutir no docx).
function imageSize(buf, ext) {
  if (ext === ".png") return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xc3) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error("Não foi possível ler o tamanho da imagem do logo");
}

const LOGO_REL_ID = "rIdLogoTema";
function logoImageParagraph(w, h) {
  const maxW = 2400000, maxH = 900000; // EMU (cerca de 6,7 cm x 2,5 cm)
  const k = Math.min(maxW / w, maxH / h);
  const cx = Math.round(w * k), cy = Math.round(h * k);
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr><w:r><w:drawing>` +
    `<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0">` +
    `<wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="9001" name="logo"/>` +
    `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="logo"/><pic:cNvPicPr/></pic:nvPicPr>` +
    `<pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${LOGO_REL_ID}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
    `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>` +
    `</a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}
const logoTextParagraph = (text) =>
  `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr><w:r><w:rPr><w:sz w:val="240"/><w:szCs w:val="240"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;
const plainMd = (t) => (t || "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`]/g, "");

// ---------- main ----------
(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(templatePath));
  const numXml = await zip.file("word/numbering.xml").async("string");
  const maxOf = (re) => Math.max(0, ...[...numXml.matchAll(re)].map((m) => Number(m[1])));
  ORDERED_ABSTRACT_ID = maxOf(/<w:abstractNum [^>]*w:abstractNumId="(\d+)"/g) + 1;
  nextNumId = maxOf(/<w:num [^>]*w:numId="(\d+)"/g) + 1;
  const docXml = await zip.file("word/document.xml").async("string");
  const bodyStart = docXml.indexOf("<w:body>") + "<w:body>".length;
  const sectPr = docXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/g).pop();

  const blocks = parse(fs.readFileSync(mdPath, "utf8"));
  const newBody = buildBody(blocks);
  // parágrafos iniciais do template mantidos (ex.: logo que fica no corpo, e não no cabeçalho)
  let lead = "";
  if (KEEP_LEADING) {
    const paras = docXml.slice(bodyStart).match(/<w:p[ >][\s\S]*?<\/w:p>/g) || [];
    lead = paras.slice(0, KEEP_LEADING).join("");
  }
  // logo de um tema simples: imagem (png/jpg) ou texto/emoji no topo, quando o template não traz o dele no corpo
  let logoXml = "";
  const logoExt = logoPath ? path.extname(logoPath).toLowerCase() : "";
  if (!KEEP_LEADING && logoPath && [".png", ".jpg", ".jpeg"].includes(logoExt)) {
    const buf = fs.readFileSync(logoPath);
    const isPng = logoExt === ".png";
    const { w, h } = imageSize(buf, isPng ? ".png" : ".jpg");
    const media = "word/media/logo-tema" + (isPng ? ".png" : ".jpg");
    zip.file(media, buf);
    const rels = await zip.file("word/_rels/document.xml.rels").async("string");
    zip.file("word/_rels/document.xml.rels", rels.replace("</Relationships>", `<Relationship Id="${LOGO_REL_ID}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${media.replace("word/", "")}"/></Relationships>`));
    let ct = await zip.file("[Content_Types].xml").async("string");
    const ext = isPng ? "png" : "jpg";
    if (!new RegExp(`Extension="${ext}"`, "i").test(ct))
      ct = ct.replace(/<Types[^>]*>/, (m) => m + `<Default Extension="${ext}" ContentType="image/${isPng ? "png" : "jpeg"}"/>`);
    zip.file("[Content_Types].xml", ct);
    logoXml = logoImageParagraph(w, h);
  } else if (!KEEP_LEADING && logoPath) {
    console.warn(`Aviso: o logo ${path.basename(logoPath)} não entra no docx (só png e jpg). No html, no pdf e nos slides ele é usado.`);
  } else if (!KEEP_LEADING && theme.logoText) {
    logoXml = logoTextParagraph(theme.logoText);
  }
  zip.file("word/document.xml", docXml.slice(0, bodyStart) + lead + logoXml + newBody + sectPr + "</w:body></w:document>");

  // rodapé de um tema simples: os marcadores {{rodape1}} e {{rodape2}} da base neutra recebem as linhas de "footer"
  for (const name of Object.keys(zip.files).filter((n) => /^word\/footer\d*\.xml$/.test(n))) {
    const f = await zip.file(name).async("string");
    if (f.includes("{{rodape")) zip.file(name, f.replace("{{rodape1}}", esc(plainMd((theme.footer || [])[0]))).replace("{{rodape2}}", esc(plainMd((theme.footer || [])[1]))));
  }

  // numeração: acrescenta o estilo de lista ordenada e uma instância (num) por lista
  if (orderedNums.length) {
    let num = await zip.file("word/numbering.xml").async("string");
    const firstNum = num.indexOf("<w:num ");
    const nums = orderedNums.map((id) =>
      `<w:num w:numId="${id}"><w:abstractNumId w:val="${ORDERED_ABSTRACT_ID}"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>`).join("");
    num = num.slice(0, firstNum) + orderedAbstract() + num.slice(firstNum);
    num = num.replace("</w:numbering>", nums + "</w:numbering>");
    zip.file("word/numbering.xml", num);
  }

  // data de geração no cabeçalho (template com o marcador "dd/mmm/yyyy")
  if (HEADER_DATE) {
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const d = new Date();
    const hoje = `${String(d.getDate()).padStart(2, "0")}/${meses[d.getMonth()]}/${d.getFullYear()}`;
    for (const name of Object.keys(zip.files).filter((n) => /^word\/header\d*\.xml$/.test(n))) {
      const h = await zip.file(name).async("string");
      zip.file(name, h.replace("dd/mmm/yyyy", hoje));
    }
  }

  // hyperlinks externos
  if (hyperlinks.length) {
    let rels = await zip.file("word/_rels/document.xml.rels").async("string");
    const add = hyperlinks.map((h) =>
      `<Relationship Id="${h.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${esc(h.url)}" TargetMode="External"/>`).join("");
    zip.file("word/_rels/document.xml.rels", rels.replace("</Relationships>", add + "</Relationships>"));
  }

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log("Gerado:", outPath);
})();
