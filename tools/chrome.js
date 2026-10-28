// Localiza o Chrome (ou Chromium/Edge) para os compiladores que o usam em modo headless (md2pdf.js, md2cards.js).
// A variável CHROME tem prioridade; senão testa os caminhos comuns de macOS, Windows e Linux.

const fs = require("fs");
const path = require("path");

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

module.exports = { findChrome };
