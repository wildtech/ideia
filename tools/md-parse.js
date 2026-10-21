// Parser Markdown compartilhado pelos compiladores (md2docx.js, md2html.js).
// Reconhece: títulos (#..####), parágrafos, listas (aninhadas), citações (>), tabelas e ---.

const LIST_RE = /^\s*([-*]|\d+\.)\s+/;
function parseList(lines) {
  return lines.map((l) => {
    const m = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (!m) return { text: l.trim(), plain: true };
    return { text: m[3], level: Math.min(Math.floor(m[1].length / 4), 2), ordered: /\d/.test(m[2]) };
  });
}
function parse(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^---+\s*$/.test(line)) { i++; continue; }
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      blocks.push({ type: "heading", level: m[1].length, text: m[2].replace(/\*\*/g, "").trim() });
      i++; continue;
    }
    if (line.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|\s*$/g, "").split("|").map((c) => c.trim());
      blocks.push({ type: "table", header: cells(rows[0]), body: rows.slice(2).map(cells) });
      continue;
    }
    if (line.startsWith(">")) {
      const inner = [];
      while (i < lines.length && lines[i].startsWith(">")) inner.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ type: "callout", items: parseList(inner) });
      continue;
    }
    if (LIST_RE.test(line)) {
      const list = [];
      while (i < lines.length && LIST_RE.test(lines[i])) list.push(lines[i++]);
      blocks.push({ type: "list", items: parseList(list) });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\||>|---+\s*$)/.test(lines[i]) && !LIST_RE.test(lines[i])) {
      para.push(lines[i++].trim());
    }
    blocks.push({ type: "para", lines: para });
  }
  return blocks;
}

module.exports = { parse, parseList };
