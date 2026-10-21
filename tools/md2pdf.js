#!/usr/bin/env node
// Gera o PDF de um projeto a partir do HTML (que deve ter sido gerado antes pelo md2html.js), usando o Chrome em modo headless.
//
// Uso: node tools/md2pdf.js <pasta-do-projeto> [arquivo.html] [saida.pdf]
//
// O Chrome (ou Chromium/Edge) é procurado nos caminhos padrão de macOS, Windows e Linux. Se não for encontrado, defina a variável CHROME com o caminho do executável.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const [, , projectArg, htmlArg, outArg] = process.argv;
if (!projectArg) {
  console.error("Uso: node tools/md2pdf.js <pasta-do-projeto> [arquivo.html] [saida.pdf]");
  process.exit(1);
}
const projectDir = path.resolve(projectArg);
const name = path.basename(projectDir);
const htmlPath = path.resolve(htmlArg || path.join(projectDir, "out", name + ".html"));
const outPath = path.resolve(outArg || htmlPath.replace(/\.html$/, ".pdf"));
// Procura o Chrome/Chromium: a variável CHROME tem prioridade; senão testa os caminhos comuns de cada sistema.
function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const candidates = {
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ],
    win32: [
      path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Google/Chrome/Application/chrome.exe"),
      path.join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google/Chrome/Application/chrome.exe"),
      path.join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
      path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Microsoft/Edge/Application/msedge.exe"),
    ],
    linux: [
      "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium",
      "/usr/bin/chromium-browser", "/snap/bin/chromium", "/usr/bin/microsoft-edge",
    ],
  }[process.platform] || [];
  return candidates.find((c) => fs.existsSync(c)) || candidates[0] || "chrome";
}
const chrome = findChrome();

if (!fs.existsSync(htmlPath)) {
  console.error("HTML não encontrado: " + htmlPath + " (rode o md2html.js antes)");
  process.exit(1);
}
if (!fs.existsSync(chrome)) {
  console.error("Chrome não encontrado em " + chrome + ". Defina a variável CHROME com o caminho do executável.");
  process.exit(1);
}

try {
  execFileSync(chrome, ["--headless=new", "--no-pdf-header-footer", "--print-to-pdf=" + outPath, require("url").pathToFileURL(htmlPath).href], { stdio: "ignore" });
} catch (e) {
  // O Chrome pode sair com erro por causa de mensagens de display; o que vale é o PDF ter sido gerado.
}
if (!fs.existsSync(outPath)) {
  console.error("O PDF não foi gerado: " + outPath);
  process.exit(1);
}
console.log("Gerado: " + outPath);
