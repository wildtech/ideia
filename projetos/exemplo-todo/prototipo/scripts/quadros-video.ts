// Tira um quadro de cada vídeo de demonstração (o horizontal e o vertical) e os junta, lado a lado, em uma imagem de
// fundo transparente para os slides: ../imagens/09-videos.png. Rode `npm run demo:todos` antes (os vídeos ficam em demo/).
// O quadro escolhido é o do passo "anotar" (segundos depois de ele começar, lido de demo/cenas.json): a pessoa digita,
// o cursor aparece, a tela se aproxima e a legenda narra.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const DEPOIS_DO_INICIO_S = 4.5;
const quadroDe = (cenas: string): number => {
  const anotar = existsSync(cenas) ? JSON.parse(readFileSync(cenas, "utf8")).trechos?.anotar : null;
  return anotar ? anotar.inicio + DEPOIS_DO_INICIO_S : 10;
};
const HORIZONTAL = "demo/demo.mp4";
const VERTICAL = "demo/demo-vertical.mp4";
const SAIDA = "../imagens/09-videos.png";

for (const v of [HORIZONTAL, VERTICAL]) {
  if (!existsSync(v)) {
    console.error(`Não achei ${v}. Rode \`npm run demo:todos\` antes.`);
    process.exit(1);
  }
}
if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) {
  console.error("Precisa do ffmpeg (veja guias/video-demonstracao.md).");
  process.exit(1);
}

// Tela de 1600x900: o vídeo horizontal à esquerda (900 de largura) e o vertical à direita (780 de altura), com uma moldura.
const moldura = "pad=iw+12:ih+12:6:6:color=0x111111";
const filtro = [
  `[0:v]scale=900:-2,${moldura}[h]`,
  `[1:v]scale=-2:780,${moldura}[v]`,
  "[2:v][h]overlay=x=83:y=(H-h)/2[a]",
  "[a][v]overlay=x=1065:y=(H-h)/2:format=auto",
].join(";");

const r = spawnSync(
  "ffmpeg",
  ["-y", "-v", "error", "-ss", quadroDe("demo/cenas.json").toFixed(2), "-i", HORIZONTAL, "-ss", quadroDe("demo/cenas-vertical.json").toFixed(2), "-i", VERTICAL, "-f", "lavfi", "-i", "color=c=black@0:s=1600x900,format=rgba", "-filter_complex", filtro, "-frames:v", "1", "-pix_fmt", "rgba", SAIDA],
  { stdio: "inherit" },
);
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`Gerado: ${SAIDA}`);
