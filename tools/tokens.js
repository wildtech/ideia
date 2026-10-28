// Tokens do design system a partir de um tema: cores (com o contraste conferido), fonte, raio, espaçamento, escala de
// tipo, sombra e movimento. É a fonte única dos valores usados pelo protótipo (tools/tema-tokens.js gera o tokens.css),
// pelos cards e reels (tools/md2cards.js) e pelo vídeo em cenas (tools/md2video.js).
//
// No tema.json, tudo é opcional:
//   "colors":  { "primary", "accent", "titleBlue", "text", "calloutFill", "border", "fundoEscuro", "destaque", ... }
//   "font":    "Open Sans"
//   "tokens":  { "raio": 6, "espaco": 8, "escalaTipo": 1.25, "alvoToque": 44, "sombra": "0 8px 24px rgba(0,0,0,.12)",
//                "movimento": { "rapido": 150, "normal": 300, "lento": 600, "curva": "cubic-bezier(.2,.7,.2,1)" } }
//   "prototipo": { "fundo": "FFFFFF", "suave": "4B5563" }   (o que não tem equivalente nos documentos)

const hex = (c) => String(c).replace("#", "").toUpperCase();
const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
const luz = (h) => {
  const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => {
  const [x, y] = [luz(hex(a)), luz(hex(b))].sort((m, n) => n - m);
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

const PADRAO = {
  raio: 6,
  espaco: 8,
  escalaTipo: 1.25,
  alvoToque: 44,
  sombra: "0 8px 24px rgba(0,0,0,.12)",
  movimento: { rapido: 150, normal: 300, lento: 600, curva: "cubic-bezier(.2,.7,.2,1)" },
};

/** Os tokens de um tema já resolvido (com o "extends" aplicado, como o loadTheme devolve). */
function tokensDoTema(theme) {
  const cores = theme.colors || {};
  const extra = theme.prototipo || {};
  const tk = theme.tokens || {};
  const c = {
    titulo: hex(cores.titleBlue || cores.textStrong || "111111"),
    texto: hex(cores.text || "222222"),
    suave: hex(extra.suave || "4B5563"),
    primaria: hex(cores.primary || "2B5C8A"),
    acento: hex(cores.accent || "A83232"),
    cartao: hex(cores.calloutFill || cores.tableStripe || "F3F3F3"),
    borda: hex(cores.border || "D1D5DB"),
    fundo: hex(extra.fundo || "FFFFFF"),
    fundoEscuro: hex(cores.fundoEscuro || "000000"),
    destaque: hex(cores.destaque || "FFFFFF"),
  };
  c.primariaAcao = escurecerAte(c.primaria, 4.5);
  c.acentoAcao = escurecerAte(c.acento, 4.5);
  const raio = tk.raio ?? PADRAO.raio;
  const espaco = tk.espaco ?? PADRAO.espaco;
  const escala = tk.escalaTipo ?? PADRAO.escalaTipo;
  const mov = { ...PADRAO.movimento, ...(tk.movimento || {}) };
  return {
    cores: c,
    fonte: theme.font || "Open Sans",
    fonteTitulo: theme.headingFont || theme.font || "Open Sans",
    raio: { p: Math.round(raio * 0.5), m: raio, g: Math.round(raio * 1.4) },
    espaco: [0.5, 1, 1.5, 2, 3, 4].map((m) => Math.round(espaco * m)),
    tipo: { p: 1 / escala, m: 1, g: escala, gg: escala ** 2, ggg: escala ** 3 },
    alvoToque: tk.alvoToque ?? PADRAO.alvoToque,
    sombra: tk.sombra || PADRAO.sombra,
    movimento: mov,
  };
}

const r3 = (n) => +n.toFixed(3);

/** As variáveis CSS (sem o ":root {}") dos tokens, com comentários. */
function cssVars(t) {
  const c = t.cores;
  const pilha = [`"${t.fonte}"`, '"Segoe UI"', "Helvetica", "Arial", "sans-serif"].join(", ");
  return `  --fonte: ${pilha};
  --fundo: #${c.fundo};
  --texto: #${c.texto};
  --titulo: #${c.titulo};
  --suave: #${c.suave};
  --cartao: #${c.cartao};
  --borda: #${c.borda};
  /* Cor da marca, para faixas, foco e detalhes. */
  --primaria: #${c.primaria};
  --acento: #${c.acento};
  /* Cores de ação: fundo de botão preenchido, com texto branco e contraste de pelo menos 4,5:1. */
  --primaria-acao: #${c.primariaAcao};
  --acento-acao: #${c.acentoAcao};
  --sobre-acao: #ffffff;
  /* Fundo escuro e cor de destaque sobre ele: os mesmos dos slides e dos carrosséis. */
  --fundo-escuro: #${c.fundoEscuro};
  --destaque: #${c.destaque};
  /* Forma: raio dos cantos (pequeno, médio e grande) e sombra. */
  --raio-p: ${t.raio.p}px;
  --raio: ${t.raio.m}px;
  --raio-g: ${t.raio.g}px;
  --sombra: ${t.sombra};
  /* Espaçamento, em degraus (de 1 a 6). */
${t.espaco.map((v, i) => `  --espaco-${i + 1}: ${v}px;`).join("\n")}
  /* Escala de tipo (proporção ${t.tipo.g}). */
  --tipo-p: ${r3(t.tipo.p)}rem;
  --tipo-m: 1rem;
  --tipo-g: ${r3(t.tipo.g)}rem;
  --tipo-gg: ${r3(t.tipo.gg)}rem;
  --tipo-ggg: ${r3(t.tipo.ggg)}rem;
  /* Alvo de toque mínimo no celular. */
  --alvo-toque: ${t.alvoToque}px;
  /* Movimento: durações e a curva das transições (também usadas nos reels e no vídeo). */
  --duracao-rapida: ${t.movimento.rapido}ms;
  --duracao: ${t.movimento.normal}ms;
  --duracao-lenta: ${t.movimento.lento}ms;
  --curva: ${t.movimento.curva};
`;
}

/** Os pares de cores que precisam de contraste de 4,5:1. */
function paresDeContraste(t) {
  const c = t.cores;
  return [
    ["texto sobre o fundo", c.texto, c.fundo],
    ["título sobre o fundo", c.titulo, c.fundo],
    ["texto suave sobre o fundo", c.suave, c.fundo],
    ["texto sobre o cartão", c.texto, c.cartao],
    ["texto suave sobre o cartão", c.suave, c.cartao],
    ["branco sobre a cor de ação", "FFFFFF", c.primariaAcao],
    ["branco sobre a cor de perigo", "FFFFFF", c.acentoAcao],
    ["cor de perigo sobre o fundo", c.acentoAcao, c.fundo],
    ["branco sobre o fundo escuro", "FFFFFF", c.fundoEscuro],
    ["destaque sobre o fundo escuro", c.destaque, c.fundoEscuro],
  ];
}

module.exports = { hex, contraste, escurecerAte, tokensDoTema, cssVars, paresDeContraste, PADRAO };
