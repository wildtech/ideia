// Monta o vídeo final da demonstração (npm run demo): pega a gravação do Playwright (com legendas e cursor) e, se houver
// voz, mistura cada trecho no instante em que o passo começou. Saída: demo/demo.mp4. Precisa do ffmpeg.
// Com --vertical, monta a versão 9:16 (npm run demo:vertical): pega a gravação do projeto "demo-vertical", usa
// demo/marcas-vertical.json e leva o vídeo para 1080x1920, em demo/demo-vertical.mp4.

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

type Tempos = Record<string, { arquivo: string | null; segundos: number }>;
interface Marcas {
  fimMs: number;
  passos: Record<string, number>;
}

function achar(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? achar(p) : [p];
  });
}

const vertical = process.argv.includes("--vertical");
const sufixo = vertical ? "-vertical" : "";

// A gravação mais recente do projeto "demo" (ou "demo-vertical"). A pasta de cada gravação termina com o nome do projeto.
const gravacoes = achar("test-results")
  .filter((p) => p.endsWith("video.webm") && dirname(p).endsWith(vertical ? "-demo-vertical" : "-demo"))
  .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
const gravacao = gravacoes[0];
if (!gravacao) {
  console.error(`Não achei a gravação em test-results/. Rode \`npm run demo${vertical ? ":vertical" : ""}\`.`);
  process.exit(1);
}
mkdirSync("demo", { recursive: true });

if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) {
  copyFileSync(gravacao, `demo/demo${sufixo}.webm`);
  console.log(`Sem o ffmpeg: o vídeo (só com legendas) ficou em demo/demo${sufixo}.webm. Instale o ffmpeg para gerar o MP4 com voz.`);
  process.exit(0);
}

const tempos: Tempos = existsSync("demo/tempos.json") ? JSON.parse(readFileSync("demo/tempos.json", "utf8")) : {};
const marcas: Marcas = JSON.parse(readFileSync(`demo/marcas${sufixo}.json`, "utf8"));

// Acha o quadro da faixa magenta (a marca de sincronia, no topo da página): é o "tempo zero" da jornada no vídeo.
// O .webm do Playwright começa antes da jornada e termina depois, e não traz a duração; por isso a âncora é a marca.
const FPS = 25;
const tira = spawnSync(
  "ffmpeg",
  ["-v", "error", "-i", gravacao, "-vf", `fps=${FPS},crop=iw:ih*0.015:0:0,scale=4:1,format=rgb24`, "-f", "rawvideo", "-"],
  { maxBuffer: 64 * 1024 * 1024 },
);
const bytes = tira.stdout as Buffer;
let quadroMarca = -1;
for (let i = 0; i + 12 <= bytes.length; i += 12) {
  const [r, g, b] = [bytes[i]!, bytes[i + 1]!, bytes[i + 2]!];
  if (r > 200 && g < 80 && b > 200) {
    quadroMarca = i / 12;
    break;
  }
}
if (quadroMarca < 0) {
  console.error("Não achei a marca de sincronia no vídeo. Rode `npm run demo` de novo.");
  process.exit(1);
}
const tMarca = quadroMarca / FPS;
// O vídeo final começa um pouco depois da faixa (que não deve aparecer), e a voz é atrasada na mesma medida.
const corte = tMarca + 0.55;
const vozes = Object.entries(tempos)
  .filter(([id, t]) => t.arquivo && existsSync(t.arquivo) && marcas.passos[id] !== undefined)
  .map(([id, t]) => ({ id, arquivo: t.arquivo as string, atrasoMs: Math.max(0, Math.round((tMarca + marcas.passos[id]! / 1000 - corte) * 1000)) }));

const args = ["-y", "-v", "error", "-ss", corte.toFixed(3), "-i", gravacao];
for (const v of vozes) args.push("-i", v.arquivo);
if (vozes.length) {
  const filtros = vozes.map((v, i) => `[${i + 1}:a]adelay=${v.atrasoMs}|${v.atrasoMs}[a${i}]`);
  const mix = `${vozes.map((_, i) => `[a${i}]`).join("")}amix=inputs=${vozes.length}:normalize=0:duration=longest[voz]`;
  args.push("-filter_complex", `${filtros.join(";")};${mix}`, "-map", "0:v", "-map", "[voz]", "-c:a", "aac", "-b:a", "128k", "-shortest");
} else {
  args.push("-map", "0:v");
}
if (vertical) args.push("-vf", "scale=1080:1920:flags=lanczos");
args.push("-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `demo/demo${sufixo}.mp4`);

const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`\nVídeo: demo/demo${sufixo}.mp4 (marca de sincronia em ${tMarca.toFixed(2)} s; ${vozes.length ? `${vozes.length} trechos com voz` : "só com legendas"}).`);
for (const v of vozes) console.log(`  ${v.id.padEnd(10)} começa em ${(v.atrasoMs / 1000).toFixed(1)} s`);
