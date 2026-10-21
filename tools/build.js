#!/usr/bin/env node
// Gera os três formatos de um projeto: docx, html e pdf.
//
// Uso: node tools/build.js <pasta-do-projeto> [<pasta-do-projeto> ...]
//
// Para cada pasta, lê <pasta>/<nome>.md e grava em <pasta>/out/. O PDF é gerado a partir do HTML.

const path = require("path");
const { execFileSync } = require("child_process");

const projects = process.argv.slice(2);
if (!projects.length) {
  console.error("Uso: node tools/build.js <pasta-do-projeto> [<pasta-do-projeto> ...]");
  process.exit(1);
}

let failed = false;
for (const project of projects) {
  for (const tool of ["md2docx.js", "md2html.js", "md2pdf.js"]) {
    try {
      execFileSync("node", [path.join(__dirname, tool), project], { stdio: "inherit" });
    } catch (e) {
      failed = true;
      console.error("Falhou: " + tool + " em " + project);
    }
  }
}
process.exit(failed ? 1 : 0);
