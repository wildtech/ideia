#!/usr/bin/env node
// Gera o CSS de tokens de um protótipo a partir do tema do projeto: os valores vêm do tema (cada linha diz de onde), e o protótipo
// não guarda uma cópia à mão.
//
// Uso:  node tools/tema-tokens.js <pasta-do-projeto> <saida.css> [--conferir]
//
//   <pasta-do-projeto>  a pasta com o projeto.json (o tema é o do projeto, com o "extends" resolvido)
//   --conferir          não escreve: termina com código 1 se o arquivo existente estiver desatualizado
//
// Os tokens vêm de "colors" do tema (e "font"); o que o tema não declara usa um padrão. Para os botões preenchidos
// (texto branco sobre a cor), a cor "de ação" é a do tema escurecida só até ter contraste de 4,5:1 com o branco.
// Os slides e os carrosséis usam as mesmas cores do tema; "fundoEscuro" (fundo dos slides e cards escuros) e "destaque"
// (links e detalhes sobre o escuro) também viram tokens, para o design system e os materiais ficarem alinhados.
// Além das cores, saem raio, espaçamento, escala de tipo, sombra, alvo de toque e movimento ("tokens" no tema.json;
// veja tools/tokens.js, que é a fonte única desses valores também para os cards, os reels e o vídeo).
// Opcionalmente, o tema pode ter "prototipo" (ou "software", a palavra que o projeto escolheu): { "fundo": "FFFFFF", "suave": "4B5563" } para ajustar o que não tem
// equivalente nos documentos.

const fs = require("fs");
const path = require("path");
const { loadTheme } = require("./tema");
const { contraste, tokensDoTema, cssVars, paresDeContraste } = require("./tokens");

const args = process.argv.slice(2);
const CONFERIR = args.includes("--conferir");
const [pastaArg, saidaArg] = args.filter((a) => !a.startsWith("--"));
if (!pastaArg || !saidaArg) {
  console.error("Uso: node tools/tema-tokens.js <pasta-do-projeto> <saida.css> [--conferir]");
  process.exit(2);
}

// ------------------------------------------------------------------ tokens (tools/tokens.js)

const pasta = path.resolve(pastaArg);
const { theme, projeto } = loadTheme(pasta);
const nomeDoTema = (projeto && projeto.tema) || theme.name;
const tk = tokensDoTema(theme);
const t = tk.cores;

const css = `/* Gerado por tools/tema-tokens.js a partir do tema "${nomeDoTema}" (${theme.name}). Não edite à mão:
   mude o tema (temas/) e rode \`npm run tokens\`. */
:root {
${cssVars(tk, { origem: true })}}
`;

// ------------------------------------------------------------------ conferência de contraste

const pares = paresDeContraste(tk);
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
