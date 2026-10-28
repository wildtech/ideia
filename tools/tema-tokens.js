#!/usr/bin/env node
// Gera o CSS de tokens de um protótipo a partir do tema do projeto: as cores e a fonte vêm do tema, e o protótipo
// não guarda uma cópia à mão.
//
// Uso:  node tools/tema-tokens.js <pasta-do-projeto> <saida.css> [--conferir]
//
//   <pasta-do-projeto>  a pasta com o projeto.json (o tema é o do projeto, com o "extends" resolvido)
//   --conferir          não escreve: termina com código 1 se o arquivo existente estiver desatualizado
//
// Os tokens vêm de "colors" do tema (e "font"); o que o tema não declara usa um padrão. Para os botões preenchidos
// (texto branco sobre a cor), a cor "de ação" é a do tema escurecida só até ter contraste de 4,5:1 com o branco.
// Opcionalmente, o tema pode ter "prototipo": { "fundo": "FFFFFF", "suave": "4B5563" } para ajustar o que não tem
// equivalente nos documentos.

const fs = require("fs");
const path = require("path");
const { loadTheme } = require("./tema");

const args = process.argv.slice(2);
const CONFERIR = args.includes("--conferir");
const [pastaArg, saidaArg] = args.filter((a) => !a.startsWith("--"));
if (!pastaArg || !saidaArg) {
  console.error("Uso: node tools/tema-tokens.js <pasta-do-projeto> <saida.css> [--conferir]");
  process.exit(2);
}

// ------------------------------------------------------------------ cores

const hex = (c) => String(c).replace("#", "").toUpperCase();
const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
const luz = (h) => {
  const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => {
  const [x, y] = [luz(a), luz(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

function paraHsl(h) {
  const [r, g, b] = rgb(h).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let t = 0;
  if (d) t = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(t * 60 + 360) % 360, s, l];
}
function deHsl([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/** Escurece a cor, mantendo o matiz, até ter o contraste mínimo com o branco. */
function escurecerAte(cor, minimo) {
  if (contraste(cor, "FFFFFF") >= minimo) return cor;
  const [h, s, l] = paraHsl(cor);
  for (let li = l; li > 0; li -= 0.005) {
    const c = deHsl([h, s, li]);
    if (contraste(c, "FFFFFF") >= minimo) return c;
  }
  return "000000";
}

// ------------------------------------------------------------------ tokens

const pasta = path.resolve(pastaArg);
const { theme, projeto } = loadTheme(pasta);
const nomeDoTema = (projeto && projeto.tema) || theme.name;
const cores = theme.colors || {};
const extra = theme.prototipo || {};

const fundo = hex(extra.fundo || "FFFFFF");
const t = {
  titulo: hex(cores.titleBlue || cores.textStrong || "111111"),
  texto: hex(cores.text || "222222"),
  suave: hex(extra.suave || "4B5563"),
  primaria: hex(cores.primary || "2B5C8A"),
  acento: hex(cores.accent || "A83232"),
  cartao: hex(cores.calloutFill || cores.tableStripe || "F3F3F3"),
  borda: hex(cores.border || "D1D5DB"),
  fundo,
};
t.primariaAcao = escurecerAte(t.primaria, 4.5);
t.acentoAcao = escurecerAte(t.acento, 4.5);

const fonte = [`"${theme.font || "Open Sans"}"`, '"Segoe UI"', "Helvetica", "Arial", "sans-serif"].join(", ");

const css = `/* Gerado por tools/tema-tokens.js a partir do tema "${nomeDoTema}" (${theme.name}). Não edite à mão:
   mude o tema (temas/) e rode \`npm run tokens\`. */
:root {
  --fonte: ${fonte};
  --fundo: #${t.fundo};
  --texto: #${t.texto};
  --titulo: #${t.titulo};
  --suave: #${t.suave};
  --cartao: #${t.cartao};
  --borda: #${t.borda};
  /* Cor da marca, para faixas, foco e detalhes. */
  --primaria: #${t.primaria};
  --acento: #${t.acento};
  /* Cores de ação: fundo de botão preenchido, com texto branco e contraste de pelo menos 4,5:1. */
  --primaria-acao: #${t.primariaAcao};
  --acento-acao: #${t.acentoAcao};
  --sobre-acao: #ffffff;
}
`;

// ------------------------------------------------------------------ conferência de contraste

const pares = [
  ["texto sobre o fundo", t.texto, t.fundo],
  ["título sobre o fundo", t.titulo, t.fundo],
  ["texto suave sobre o fundo", t.suave, t.fundo],
  ["texto sobre o cartão", t.texto, t.cartao],
  ["texto suave sobre o cartão", t.suave, t.cartao],
  ["branco sobre a cor de ação", "FFFFFF", t.primariaAcao],
  ["branco sobre a cor de perigo", "FFFFFF", t.acentoAcao],
  ["cor de perigo sobre o fundo", t.acentoAcao, t.fundo],
];
const ruins = pares.filter(([, a, b]) => contraste(a, b) < 4.5);

const saida = path.resolve(saidaArg);
if (CONFERIR) {
  const atual = fs.existsSync(saida) ? fs.readFileSync(saida, "utf8") : "";
  if (atual !== css) {
    console.error(`${path.relative(process.cwd(), saida)} está desatualizado em relação ao tema. Rode \`npm run tokens\`.`);
    process.exit(1);
  }
  console.log(`${path.relative(process.cwd(), saida)} está em dia com o tema.`);
} else {
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, css);
  console.log(`Gerado: ${path.relative(process.cwd(), saida)} (tema: ${theme.name})`);
  if (t.primariaAcao !== t.primaria) console.log(`  A cor primária #${t.primaria} tem ${contraste(t.primaria, "FFFFFF").toFixed(2)}:1 com o branco; os botões usam #${t.primariaAcao} (${contraste(t.primariaAcao, "FFFFFF").toFixed(2)}:1).`);
  if (t.acentoAcao !== t.acento) console.log(`  A cor de destaque #${t.acento} foi escurecida para #${t.acentoAcao} nos botões.`);
}
for (const [nome, a, b] of ruins) console.warn(`  AVISO: contraste baixo, ${nome}: ${contraste(a, b).toFixed(2)}:1 (mínimo 4,5:1). Ajuste o tema.`);
