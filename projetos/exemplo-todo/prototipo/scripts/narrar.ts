// Prepara a voz do vídeo de demonstração (npm run narracao, chamado por npm run demo).
//
// Para cada trecho com "> Narração:" do Markdown do vídeo (../<projeto>-video.md, lido por e2e/narracao.ts):
//   1. se existe um áudio seu em narracao/<id>.(wav|mp3|m4a|aiff|ogg), usa esse (é o caminho em qualquer sistema);
//   2. senão, se a variável TTS_COMANDO está definida, roda esse comando de síntese de voz (qualquer sistema);
//      no comando, {saida} é o arquivo de áudio a gerar (demo/audio/<id>.wav), {arquivo_texto} é um arquivo com o texto
//      do trecho e {texto} é o próprio texto entre aspas duplas. Exemplo no Linux:
//        TTS_COMANDO='espeak-ng -v pt-br -w "{saida}" -f "{arquivo_texto}"'
//   3. senão, no macOS, sintetiza com a voz em português do sistema (`say`) em demo/audio/<id>.aiff;
//   4. senão, fica sem voz (o vídeo sai só com legendas) e a duração é estimada pelo número de palavras.
// Escreve demo/tempos.json com o arquivo e a duração de cada trecho; a jornada usa isso para acompanhar o ritmo.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { duracaoEstimada, NARRACAO, VOZES_MACOS } from "../e2e/narracao";

const EXTENSOES = ["wav", "mp3", "m4a", "aiff", "ogg"];

const temComando = (cmd: string, args: string[]): boolean => spawnSync(cmd, args, { stdio: "ignore" }).status === 0;

function duracaoDe(arquivo: string): number | null {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", arquivo], { encoding: "utf8" });
  const s = r.status === 0 ? parseFloat(r.stdout) : NaN;
  return Number.isFinite(s) ? s : null;
}

/** Roda o comando de síntese do usuário (TTS_COMANDO). Devolve o arquivo gerado, ou null se não deu certo. */
function sintetizarComComando(id: string, texto: string): string | null {
  const modelo = process.env.TTS_COMANDO;
  if (!modelo) return null;
  const saida = join("demo/audio", `${id}.wav`);
  const arquivoTexto = join("demo/audio", `${id}.txt`);
  writeFileSync(arquivoTexto, texto, "utf8");
  const comando = modelo
    .split("{saida}").join(saida)
    .split("{arquivo_texto}").join(arquivoTexto)
    .split("{texto}").join(`"${texto.replace(/"/g, '\\"')}"`);
  const r = spawnSync(comando, { shell: true, stdio: "ignore" });
  if (r.status === 0 && existsSync(saida)) return saida;
  console.warn(`Aviso: o TTS_COMANDO falhou no trecho "${id}"; sigo sem voz nele.`);
  return null;
}

function sintetizar(texto: string, saida: string): boolean {
  if (process.platform !== "darwin") return false;
  for (const voz of VOZES_MACOS) {
    if (spawnSync("say", ["-v", voz, "-o", saida, texto], { stdio: "ignore" }).status === 0) return true;
  }
  return false;
}

mkdirSync("demo/audio", { recursive: true });
const proprios = existsSync("narracao") ? readdirSync("narracao") : [];
const temFfprobe = temComando("ffprobe", ["-version"]);
const tempos: Record<string, { arquivo: string | null; segundos: number; origem: string }> = {};

for (const { id, texto } of NARRACAO) {
  let arquivo: string | null = null;
  let origem = "sem voz";
  const seu = EXTENSOES.map((e) => `${id}.${e}`).find((f) => proprios.includes(f));
  if (seu) {
    arquivo = join("narracao", seu);
    origem = "áudio seu";
  } else if (process.env.TTS_COMANDO) {
    arquivo = sintetizarComComando(id, texto);
    if (arquivo) origem = "comando TTS_COMANDO";
  } else {
    const saida = join("demo/audio", `${id}.aiff`);
    if (sintetizar(texto, saida)) {
      arquivo = saida;
      origem = "voz do sistema";
    }
  }
  const medida = arquivo && temFfprobe ? duracaoDe(arquivo) : null;
  tempos[id] = { arquivo, segundos: medida ?? duracaoEstimada(texto), origem: medida === null && arquivo ? `${origem} (duração estimada)` : origem };
  console.log(`${id.padEnd(10)} ${tempos[id]!.segundos.toFixed(1).padStart(5)} s  ${tempos[id]!.origem}`);
}

writeFileSync("demo/tempos.json", JSON.stringify(tempos, null, 2));
if (Object.values(tempos).every((t) => !t.arquivo))
  console.log("\nSem voz: o vídeo sai só com legendas. Para ter voz, grave os áudios em narracao/<id>.wav, defina TTS_COMANDO ou rode no macOS (veja guias/video-demonstracao.md).");
