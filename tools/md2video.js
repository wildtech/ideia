#!/usr/bin/env node
// Compila um Markdown em um vídeo em cenas: cartões animados (os mesmos layouts dos cards, no tema do projeto) e
// trechos da jornada gravada pelo Playwright no protótipo, com transições, voz, legendas e, se quiser, música.
//
// Uso: node tools/md2video.js <pasta-do-projeto> [arquivo.md] [saida-sem-extensao] [--formato 16:9|9:16|1:1|4:5]
//
// Saída: <base>.mp4 (o primeiro formato) e <base>-<formato>.mp4 (os outros), cada um com a sua legenda em .srt.
//
// Convenção do Markdown (<projeto>-video.md; a mesma do carrossel, com o que é de vídeo):
//   # Título                  a cena de abertura (o card de capa); nas linhas abaixo, o subtítulo e as opções:
//     **Formato:** 16:9, 9:16   os formatos a gerar (padrão 16:9)
//     **Gravação:** prototipo/demo   a pasta da gravação da jornada (cenas.json, tempos.json e os vídeos)
//     **Música:** audio/trilha.mp3   música de fundo, que abaixa sozinha quando a voz entra (registre a licença)
//     **Transição:** desliza | fade | zoom | corte   a transição padrão entre cenas de tipos diferentes
//   ### Título                uma cena. Por padrão, um cartão animado (use **Layout:** como no carrossel)
//   **Cena:** jornada         a cena é um trecho da jornada gravada (o **Trecho:** diz qual); entre duas cenas da
//                             jornada o corte é seco, porque a gravação é contínua
//   **Trecho:** id            o nome do trecho: liga a cena à voz e, na jornada, ao passo do e2e/demo.spec.ts
//                             (sem ele, vale o título sem acentos, com hífen)
//   **Zoom:** 1.6             (jornada) quanto a tela se aproxima do que está sendo feito; quem aplica é a jornada
//   **Duração:** 4            (cartão) segundos na tela, quando não há voz
//   > Narração: texto         o que a voz diz e a legenda mostra. Os áudios vêm do `npm run narracao` do protótipo
//                             (<gravação>/tempos.json) ou de <projeto>/narracao/<trecho>.wav; sem voz, só a legenda
//
// Antes, grave a jornada: `cd <projeto>/prototipo && npm run demo:todos` (cria cenas.json e cenas-vertical.json).
// Sem a gravação, as cenas da jornada ficam de fora (com um aviso) e o vídeo sai só com os cartões.
// Precisa do ffmpeg e do Chrome.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { loadTheme } = require("./tema");
const { gravarAnimacao } = require("./cdp");
const motor = require("./cards/motor");

const argv = process.argv.slice(2);
const iForm = argv.indexOf("--formato");
const formatoCli = iForm >= 0 ? argv[iForm + 1] : null;
const pos = argv.filter((a, i) => !a.startsWith("--") && !(iForm >= 0 && i === iForm + 1));
const [projectArg, mdArg, outArg] = pos;
if (!projectArg) {
  console.error("Uso: node tools/md2video.js <pasta-do-projeto> [arquivo.md] [saida-sem-extensao] [--formato 16:9]");
  process.exit(1);
}

const FPS = 30;
const TRANSICAO_S = 0.5;
const ATRASO_VOZ_S = 0.6;
const PALAVRAS_POR_SEGUNDO = 2.4;
const EXT_AUDIO = ["wav", "mp3", "m4a", "aiff", "ogg"];

const projectDir = path.resolve(projectArg);
const contexto = { projectDir, ...loadTheme(projectDir) };
const mdPath = path.resolve(mdArg || path.join(projectDir, path.basename(projectDir) + "-video.md"));
const base = path.resolve(outArg || path.join(projectDir, "out", path.basename(mdPath, ".md")));

function ff(args, rotulo) {
  const r = spawnSync("ffmpeg", ["-y", "-v", "error", ...args], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error(`O ffmpeg falhou (${rotulo}).`);
}
function duracaoDe(arquivo) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", arquivo], { encoding: "utf8" });
  const s = parseFloat(r.stdout);
  return Number.isFinite(s) ? s : null;
}
function temAudio(arquivo) {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", arquivo], { encoding: "utf8" });
  return r.stdout.trim() !== "";
}
const lerJson = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null);
const srtTempo = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

/** A voz de um trecho: o áudio do protótipo (tempos.json), um áudio do projeto, ou nenhuma. */
function vozDe(id, gravacaoDir, tempos) {
  const t = tempos && tempos[id];
  if (t && t.arquivo) {
    const abs = path.resolve(path.dirname(gravacaoDir), t.arquivo);
    if (fs.existsSync(abs)) return { arquivo: abs, segundos: duracaoDe(abs) || t.segundos };
  }
  for (const e of EXT_AUDIO) {
    const abs = path.join(projectDir, "narracao", `${id}.${e}`);
    if (fs.existsSync(abs)) return { arquivo: abs, segundos: duracaoDe(abs) };
  }
  return null;
}

/** A legenda de um cartão: as palavras acendem no ritmo da voz (o mesmo efeito da legenda da jornada). */
function legendaHtml(texto, inicio, segundos) {
  const palavras = texto.split(/\s+/).filter(Boolean);
  const total = palavras.reduce((n, p) => n + p.length + 1, 0);
  let acc = 0;
  const spans = palavras.map((w) => {
    const atraso = inicio + (acc / total) * segundos;
    acc += w.length + 1;
    return `<span style="animation-delay:${atraso.toFixed(2)}s">${motor.esc(w)}</span>`;
  });
  return `<div class="legenda" style="--v0:${inicio}s"><p>${spans.join(" ")}</p></div>`;
}

(async () => {
  if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) throw new Error("Precisa do ffmpeg (veja guias/video-demonstracao.md).");
  const montador = await motor.criarMontador(contexto);
  const { cards: todos, opcoes } = motor.lerCards(fs.readFileSync(mdPath, "utf8"));
  const cenas = todos.filter((c) => !c.hidden);
  const formatos = formatoCli ? [formatoCli] : opcoes.formatos && opcoes.formatos.length ? opcoes.formatos : ["16:9"];
  const gravacaoDir = path.resolve(projectDir, opcoes.gravacao || "prototipo/demo");
  const tempos = lerJson(path.join(gravacaoDir, "tempos.json"));
  const musica = opcoes.musica ? path.resolve(projectDir, opcoes.musica) : null;
  if (musica && !fs.existsSync(musica)) console.warn(`Aviso: a música não existe: ${opcoes.musica}; o vídeo sai sem ela.`);

  cenas.forEach((c) => {
    if (c.cena !== "jornada" && !montador.layouts[c.layout]) {
      console.warn(`Aviso: layout desconhecido na cena "${c.title}" ("${c.layout}"); vale "texto".`);
      c.layout = "texto";
    }
  });

  fs.mkdirSync(path.dirname(base), { recursive: true });
  for (const [n, nomeFormato] of formatos.entries()) {
    const f = motor.formato(nomeFormato);
    const saida = n === 0 ? base : `${base}-${f.sufixo}`;
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "md2video-"));
    // A gravação mais parecida com o formato: a vertical para o 9:16 e o 4:5, a horizontal para o resto.
    const vertical = f.orient === "alto" || f.orient === "retrato";
    const gravacao = lerJson(path.join(gravacaoDir, vertical ? "cenas-vertical.json" : "cenas.json")) || lerJson(path.join(gravacaoDir, "cenas.json"));
    const videoJornada = gravacao ? path.resolve(path.dirname(gravacaoDir), gravacao.video) : null;
    const jornadaTemAudio = videoJornada && fs.existsSync(videoJornada) ? temAudio(videoJornada) : false;

    const segmentos = [];
    try {
      for (const [i, c] of cenas.entries()) {
        const arquivo = path.join(tmp, `cena-${String(i + 1).padStart(2, "0")}.mp4`);
        if (c.cena === "jornada") {
          const t = gravacao && gravacao.trechos[c.trecho];
          if (!t || !fs.existsSync(videoJornada)) {
            console.warn(`Aviso: a cena "${c.title}" (trecho "${c.trecho}") não está na gravação; fica de fora. Rode \`npm run demo:todos\` no protótipo.`);
            continue;
          }
          const escala = `scale=${f.W}:${f.H}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${f.W}:${f.H}:(ow-iw)/2:(oh-ih)/2:color=0x${montador.tokens.cores.fundoEscuro},fps=${FPS},format=yuv420p`;
          const audio = jornadaTemAudio ? ["-map", "0:a"] : ["-f", "lavfi", "-t", String(t.fim - t.inicio), "-i", "anullsrc=r=48000:cl=stereo"];
          const args = ["-ss", t.inicio.toFixed(3), "-to", t.fim.toFixed(3), "-i", videoJornada];
          if (jornadaTemAudio) args.push("-vf", escala, "-map", "0:v", ...audio);
          else args.push(...audio, "-vf", escala, "-map", "0:v", "-map", "1:a", "-shortest");
          ff([...args, "-ar", "48000", "-ac", "2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-b:a", "160k", arquivo], `cena ${c.title}`);
          const d = duracaoDe(arquivo);
          segmentos.push({ arquivo, duracao: d, tipo: "jornada", cena: c, voz: c.narracao ? { inicio: 0, segundos: tempos?.[c.trecho]?.segundos ?? d } : null });
          continue;
        }
        // Cartão animado: o card, sozinho, com a legenda e a voz.
        const voz = c.narracao ? vozDe(c.trecho, gravacaoDir, tempos) : null;
        const falaS = c.narracao ? (voz ? voz.segundos : motor.palavras(c.narracao) / PALAVRAS_POR_SEGUNDO) : 0;
        const d = c.duracao || (c.narracao ? ATRASO_VOZ_S + falaS + 1.2 : motor.duracaoDoCard(c));
        const extras = [{ semRodape: true, legenda: c.narracao ? legendaHtml(c.narracao, ATRASO_VOZ_S, falaS) : "" }];
        const tempo = [{ t0: 0, t1: d + 3600, tsai: 0, transicao: "fade" }];
        const html = path.join(tmp, `cena-${i + 1}.html`);
        fs.writeFileSync(html, montador.pagina([c], { formato: f, modo: "anim", tempos: tempo, extras }));
        const atrasoMs = Math.round(ATRASO_VOZ_S * 1000);
        const audio = voz
          ? { entradas: ["-i", voz.arquivo], mapa: ["-map", "0:v", "-map", "1:a", "-af", `adelay=${atrasoMs}|${atrasoMs},apad,aformat=sample_rates=48000:channel_layouts=stereo`] }
          : { entradas: ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"], mapa: ["-map", "0:v", "-map", "1:a"] };
        const mexe = (c.narracao || (montador.metaDe(c).imagem === "fundo" && c.images.length)) ? null : [[0, 2.6]];
        await gravarAnimacao({ arquivoHtml: html, largura: f.W, altura: f.H, duracao: d, intervalos: mexe, saida: arquivo, fps: FPS, audio });
        segmentos.push({ arquivo, duracao: d, tipo: "cartao", cena: c, voz: c.narracao ? { inicio: ATRASO_VOZ_S, segundos: falaS } : null });
      }
      if (!segmentos.length) throw new Error("Nenhuma cena para montar.");

      // Junta as cenas: transição entre tipos diferentes (ou quando a cena pede), corte seco entre trechos da jornada.
      const entradas = segmentos.flatMap((s) => ["-i", s.arquivo]);
      const filtros = segmentos.map((_, i) => `[${i}:v]fps=${FPS},settb=AVTB,format=yuv420p[v${i}];[${i}:a]aresample=48000,aformat=channel_layouts=stereo[a${i}]`);
      let v = "v0", a = "a0", total = segmentos[0].duracao;
      const inicios = [0];
      const padrao = opcoes.transicao || "fade";
      const XFADE = { desliza: "slideleft", fade: "fade", zoom: "zoomin" };
      for (let i = 1; i < segmentos.length; i++) {
        const s = segmentos[i], ant = segmentos[i - 1];
        const tipo = s.cena.transicao || (s.tipo === "jornada" && ant.tipo === "jornada" ? "corte" : padrao);
        if (tipo === "corte") {
          filtros.push(`[${v}][${a}][v${i}][a${i}]concat=n=2:v=1:a=1[vk${i}][ac${i}]`, `[vk${i}]settb=AVTB[vc${i}]`);
          inicios.push(total);
          total += s.duracao;
        } else {
          const off = total - TRANSICAO_S;
          filtros.push(`[${v}][v${i}]xfade=transition=${XFADE[tipo] || "fade"}:duration=${TRANSICAO_S}:offset=${off.toFixed(3)}[vc${i}]`);
          filtros.push(`[${a}][a${i}]acrossfade=d=${TRANSICAO_S}[ac${i}]`);
          inicios.push(off);
          total = off + s.duracao;
        }
        v = `vc${i}`;
        a = `ac${i}`;
      }
      const args = [...entradas];
      if (musica && fs.existsSync(musica)) {
        args.push("-stream_loop", "-1", "-i", musica);
        const m = segmentos.length;
        filtros.push(`[${m}:a]atrim=0:${total.toFixed(3)},aresample=48000,aformat=channel_layouts=stereo,volume=0.35,afade=t=in:d=1,afade=t=out:st=${Math.max(0, total - 2).toFixed(2)}:d=2[mus]`);
        filtros.push(`[${a}]asplit=2[voz1][voz2]`);
        filtros.push(`[mus][voz2]sidechaincompress=threshold=0.03:ratio=10:attack=15:release=400[musb]`);
        filtros.push(`[voz1][musb]amix=inputs=2:normalize=0:duration=first[afinal]`);
        a = "afinal";
      }
      ff([...args, "-filter_complex", filtros.join(";"), "-map", `[${v}]`, "-map", `[${a}]`, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", saida + ".mp4"], "montagem");

      // Legenda em .srt (para subir junto com o vídeo nas redes e no YouTube).
      const srt = segmentos
        .map((s, i) => (s.voz && s.cena.narracao ? { inicio: inicios[i] + s.voz.inicio, fim: Math.min(inicios[i] + s.voz.inicio + s.voz.segundos, inicios[i] + s.duracao), texto: s.cena.narracao } : null))
        .filter(Boolean)
        .map((l, i) => `${i + 1}\n${srtTempo(l.inicio)} --> ${srtTempo(l.fim)}\n${l.texto}\n`)
        .join("\n");
      if (srt) fs.writeFileSync(saida + ".srt", srt);
      const comVoz = segmentos.filter((s) => s.voz).length;
      console.log(`Gerado: ${saida}.mp4 (${f.W}x${f.H}, ${total.toFixed(1)} s, ${segmentos.length} cenas: ${segmentos.filter((s) => s.tipo === "cartao").length} cartões e ${segmentos.filter((s) => s.tipo === "jornada").length} da jornada; ${comVoz} com narração${musica && fs.existsSync(musica) ? ", com música" : ""})`);
      if (srt) console.log(`Gerado: ${saida}.srt`);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
