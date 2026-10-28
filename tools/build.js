#!/usr/bin/env node
// Gera as saídas de um projeto.
//
// Uso: node tools/build.js <pasta-do-projeto> [<pasta-do-projeto> ...]
//
// Com projeto.json: gera cada item de "saidas" (documento: docx/html/pdf; apresentacao: html/pdf com reveal.js;
// carrossel: html, png (um por card), pdf e mp4 (o reel), para redes sociais; video: mp4 em cenas, com md2video.js).
// Uma saída pode ter "formato" (por exemplo, "9:16") para gerar o carrossel em outro tamanho.
// Sem projeto.json (formato antigo): lê <pasta>/<nome>.md e gera docx, html e pdf.
// O PDF é sempre gerado a partir do HTML. A saída vai para <pasta>/out/.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const projects = process.argv.slice(2);
if (!projects.length) {
  console.error("Uso: node tools/build.js <pasta-do-projeto> [<pasta-do-projeto> ...]");
  process.exit(1);
}

function run(tool, args) {
  execFileSync("node", [path.join(__dirname, tool), ...args], { stdio: "inherit" });
}

function saidasDe(projectDir) {
  const p = path.join(projectDir, "projeto.json");
  if (fs.existsSync(p)) {
    const projeto = JSON.parse(fs.readFileSync(p, "utf8"));
    if (Array.isArray(projeto.saidas) && projeto.saidas.length) return projeto.saidas;
  }
  const nome = path.basename(path.resolve(projectDir));
  return [{ fonte: nome + ".md", tipo: "documento", formatos: ["docx", "html", "pdf"] }];
}

let failed = false;
for (const project of projects) {
  const dir = path.resolve(project);
  for (const saida of saidasDe(dir)) {
    const md = path.join(dir, saida.fonte);
    const base = path.join(dir, "out", path.basename(saida.fonte, ".md"));
    const formatos = saida.formatos || ["docx", "html", "pdf"];
    if (saida.tipo === "carrossel") {
      try {
        run("md2cards.js", [dir, md, base, "--formatos", (saida.formatos || ["html", "png", "pdf"]).join(","), ...(saida.formato ? ["--formato", saida.formato] : [])]);
      } catch (e) {
        failed = true;
        console.error("Falhou: md2cards.js em " + saida.fonte + " (" + project + ")");
      }
      continue;
    }
    if (saida.tipo === "video") {
      try {
        run("md2video.js", [dir, md, base, ...(saida.formato ? ["--formato", saida.formato] : [])]);
      } catch (e) {
        failed = true;
        console.error("Falhou: md2video.js em " + saida.fonte + " (" + project + ")");
      }
      continue;
    }
    const htmlTool = saida.tipo === "apresentacao" ? "md2slides.js" : "md2html.js";
    const passos = [];
    if (formatos.includes("docx") && saida.tipo !== "apresentacao") passos.push(["md2docx.js", [dir, md, base + ".docx"]]);
    if (formatos.includes("html") || formatos.includes("pdf")) passos.push([htmlTool, [dir, md, base + ".html"]]);
    if (formatos.includes("pdf")) passos.push(["md2pdf.js", [dir, base + ".html", base + ".pdf"]]);
    for (const [tool, args] of passos) {
      try {
        run(tool, args);
      } catch (e) {
        failed = true;
        console.error("Falhou: " + tool + " em " + saida.fonte + " (" + project + ")");
      }
    }
  }
}
process.exit(failed ? 1 : 0);
