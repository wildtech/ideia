// Divide uma gravação única da sua voz nos trechos da narração (npm run dividir).
//
// Uso:   npm run dividir -- [arquivo] [--pausa 0.8] [--limiar -35]
//   arquivo   a gravação inteira, lendo os trechos de e2e/narracao.ts na ordem, com uma pausa (silêncio) entre eles.
//             Sem argumento, usa narracao/voz.(wav|mp3|m4a|aiff|ogg).
//   --pausa   segundos de silêncio que separam um trecho do outro (padrão 0.8). As pausas entre as frases de um mesmo
//             trecho precisam ser menores que isso.
//   --limiar  volume (em dB) abaixo do qual é silêncio (padrão -35). Suba (por exemplo, -30) se o ambiente tem ruído.
// Saída: narracao/<id>.wav, um por trecho. Depois é só rodar `npm run demo`.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { NARRACAO } from "../e2e/narracao";

const args = process.argv.slice(2);
const opcao = (nome: string, padrao: number): number => {
  const i = args.indexOf(nome);
  return i >= 0 && args[i + 1] !== undefined ? Number(args[i + 1]) : padrao;
};
const pausa = opcao("--pausa", 0.8);
const limiar = opcao("--limiar", -35);
const posicionais = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1]?.startsWith("--")));
const entrada = posicionais[0] ?? ["wav", "mp3", "m4a", "aiff", "ogg"].map((e) => join("narracao", `voz.${e}`)).find((f) => existsSync(f));

if (!entrada || !existsSync(entrada)) {
  console.error("Não achei a gravação. Passe o arquivo (npm run dividir -- minha-voz.wav) ou salve em narracao/voz.wav.");
  process.exit(1);
}
if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) {
  console.error("Preciso do ffmpeg para dividir a gravação. Veja guias/video-demonstracao.md.");
  process.exit(1);
}

// 1. Acha os silêncios e a duração total.
const sonda = spawnSync("ffmpeg", ["-v", "info", "-i", entrada, "-af", `silencedetect=noise=${limiar}dB:d=${pausa}`, "-f", "null", "-"], { encoding: "utf8" });
const texto = sonda.stderr;
const total = (() => {
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(texto);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0;
})();
const inicios = [...texto.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const fins = [...texto.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));

// 2. Os trechos de fala são o que sobra entre os silêncios.
const falas: { de: number; ate: number }[] = [];
let cursor = 0;
for (let i = 0; i < inicios.length; i++) {
  if (inicios[i]! - cursor > 0.3) falas.push({ de: cursor, ate: inicios[i]! });
  cursor = fins[i] ?? total;
}
if (total - cursor > 0.3) falas.push({ de: cursor, ate: total });

if (falas.length !== NARRACAO.length) {
  console.error(`Achei ${falas.length} trechos de fala, e o roteiro tem ${NARRACAO.length}.`);
  console.error(falas.map((f, i) => `  ${i + 1}. de ${f.de.toFixed(1)} s até ${f.ate.toFixed(1)} s`).join("\n"));
  console.error(
    falas.length > NARRACAO.length
      ? "Sobraram trechos: aumente --pausa (as pausas dentro de um trecho estão sendo tomadas por separadores) ou suba --limiar."
      : "Faltaram trechos: diminua --pausa, ou deixe uma pausa maior entre os trechos ao gravar.",
  );
  process.exit(1);
}

// 3. Corta cada trecho, com uma folga pequena nas pontas.
mkdirSync("narracao", { recursive: true });
const FOLGA = 0.15;
NARRACAO.forEach((t, i) => {
  const f = falas[i]!;
  const de = Math.max(0, f.de - FOLGA);
  const ate = Math.min(total, f.ate + FOLGA);
  const saida = join("narracao", `${t.id}.wav`);
  const r = spawnSync("ffmpeg", ["-y", "-v", "error", "-ss", de.toFixed(3), "-to", ate.toFixed(3), "-i", entrada, "-ar", "44100", "-ac", "1", saida], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log(`${t.id.padEnd(10)} ${(ate - de).toFixed(1).padStart(5)} s  -> ${saida}`);
});
console.log("\nPronto. Rode `npm run demo` para gravar o vídeo no ritmo da sua voz.");
