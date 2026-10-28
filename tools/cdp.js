// Abre o Chrome sem janela e conversa com ele pelo protocolo de depuração (Chrome DevTools Protocol), sem dependência
// nova: usa o WebSocket que já vem no Node (22 ou mais novo). Serve para gravar os cards animados quadro a quadro:
// a página expõe window.__quadro(ms), que congela todas as animações naquele instante, e cada quadro é uma captura.
// Por ser quadro a quadro, o vídeo sai igual em qualquer máquina, sem depender da velocidade dela.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const { findChrome } = require("./chrome");

/** Abre o Chrome numa página do tamanho pedido. Devolve { navegar, avaliar, foto, fechar }. */
async function abrirChrome({ largura, altura }) {
  if (typeof WebSocket === "undefined") throw new Error("Precisa do Node 22 ou mais novo (WebSocket embutido).");
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "ideia-cdp-"));
  const proc = spawn(findChrome(), [
    "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${perfil}`, "--hide-scrollbars", "--force-device-scale-factor=1",
    "--no-first-run", "--no-default-browser-check", "--disable-gpu", `--window-size=${largura},${altura}`, "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });

  const wsUrl = await new Promise((ok, falha) => {
    let buf = "";
    const tempo = setTimeout(() => falha(new Error("O Chrome não abriu a porta de depuração.")), 30000);
    proc.stderr.on("data", (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(tempo); ok(m[1]); }
    });
    proc.on("exit", () => falha(new Error("O Chrome fechou antes de abrir a porta de depuração.")));
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((ok, falha) => { ws.onopen = ok; ws.onerror = () => falha(new Error("Não conectei ao Chrome.")); });
  let id = 0;
  const pendentes = new Map();
  const ouvintes = [];
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pendentes.has(msg.id)) {
      const { ok, falha } = pendentes.get(msg.id);
      pendentes.delete(msg.id);
      if (msg.error) falha(new Error(msg.error.message)); else ok(msg.result);
    } else if (msg.method) ouvintes.forEach((f) => f(msg));
  };
  const enviar = (method, params = {}, sessionId) => new Promise((ok, falha) => {
    const n = ++id;
    pendentes.set(n, { ok, falha });
    ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

  const { targetId } = await enviar("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await enviar("Target.attachToTarget", { targetId, flatten: true });
  const cmd = (method, params) => enviar(method, params, sessionId);
  await cmd("Page.enable");
  await cmd("Emulation.setDeviceMetricsOverride", { width: largura, height: altura, deviceScaleFactor: 1, mobile: false });

  async function avaliar(expressao) {
    const r = await cmd("Runtime.evaluate", { expression: expressao, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  }
  async function navegar(url) {
    const carregou = new Promise((ok) => {
      const f = (msg) => { if (msg.method === "Page.loadEventFired" && msg.sessionId === sessionId) { ouvintes.splice(ouvintes.indexOf(f), 1); ok(); } };
      ouvintes.push(f);
    });
    await cmd("Page.navigate", { url });
    await carregou;
    await avaliar("document.fonts.ready.then(() => true)");
  }
  /** Captura a página: um Buffer em JPEG (mais rápido, para vídeo) ou PNG. */
  async function foto(formato = "jpeg") {
    const r = await cmd("Page.captureScreenshot", formato === "png" ? { format: "png" } : { format: "jpeg", quality: 92, optimizeForSpeed: true });
    return Buffer.from(r.data, "base64");
  }
  async function fechar() {
    const saiu = new Promise((ok) => (proc.exitCode !== null ? ok() : proc.once("exit", ok)));
    try { await Promise.race([enviar("Browser.close"), new Promise((ok) => setTimeout(ok, 2000))]); } catch (e) { /* já fechou */ }
    ws.close();
    await Promise.race([saiu, new Promise((ok) => setTimeout(ok, 3000))]);
    if (proc.exitCode === null) proc.kill();
    try { fs.rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) { /* o perfil temporário fica para o sistema limpar */ }
  }
  return { navegar, avaliar, foto, fechar };
}

/**
 * Grava uma página animada (com window.__quadro) em um vídeo, quadro a quadro, pelo ffmpeg.
 *   arquivoHtml   a página (modo "anim" do motor dos cards)
 *   duracao       segundos de vídeo
 *   intervalos    [[inicio, fim], ...] em que algo se mexe; fora deles o quadro anterior se repete (bem mais rápido)
 *   audio         argumentos extras do ffmpeg para o áudio (entradas e filtros), opcional
 */
async function gravarAnimacao({ arquivoHtml, largura, altura, duracao, intervalos = null, saida, fps = 30, audio = null }) {
  const { spawnSync } = require("child_process");
  if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) throw new Error("Precisa do ffmpeg para gerar vídeo (veja guias/video-demonstracao.md).");
  const chrome = await abrirChrome({ largura, altura });
  try {
    await chrome.navegar(require("url").pathToFileURL(arquivoHtml).href);
    const args = ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-"];
    if (audio) args.push(...audio.entradas);
    args.push("-vf", `scale=${largura}:${altura}:flags=lanczos,format=yuv420p`);
    if (audio) args.push(...audio.mapa, "-c:a", "aac", "-b:a", "160k");
    args.push("-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-r", String(fps), "-movflags", "+faststart", "-t", duracao.toFixed(3), saida);
    const ff = spawn("ffmpeg", args, { stdio: ["pipe", "inherit", "inherit"] });
    const fim = new Promise((ok, falha) => ff.on("exit", (c) => (c === 0 ? ok() : falha(new Error("O ffmpeg falhou ao montar " + saida)))));
    const escrever = (buf) => new Promise((ok) => (ff.stdin.write(buf) ? ok() : ff.stdin.once("drain", ok)));
    const total = Math.ceil(duracao * fps);
    const mexe = (t) => !intervalos || intervalos.some(([a, b]) => t >= a && t <= b);
    let anterior = null;
    let capturados = 0;
    for (let q = 0; q < total; q++) {
      const t = q / fps;
      if (!anterior || mexe(t)) {
        await chrome.avaliar(`window.__quadro(${(t * 1000).toFixed(1)})`);
        anterior = await chrome.foto("jpeg");
        capturados++;
      }
      await escrever(anterior);
    }
    ff.stdin.end();
    await fim;
    return { quadros: total, capturados };
  } finally {
    await chrome.fechar();
  }
}

module.exports = { abrirChrome, gravarAnimacao };
