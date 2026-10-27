// Prepara a voz do vídeo de demonstração (npm run narracao, chamado por npm run demo).
//
// Para cada trecho de e2e/narracao.ts:
//   1. se existe um áudio seu em narracao/<id>.(wav|mp3|m4a|aiff|ogg), usa esse (é o caminho em qualquer sistema);
//   2. senão, no macOS, sintetiza com a voz em português do sistema (`say`) em demo/audio/<id>.aiff;
//   3. senão, fica sem voz (o vídeo sai só com legendas) e a duração é estimada pelo número de palavras.
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
  console.log("\nSem voz: o vídeo sai só com legendas. Para ter voz, grave os áudios em narracao/<id>.wav (ou rode no macOS).");
