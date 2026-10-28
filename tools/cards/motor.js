// Motor dos cards: lê o Markdown, carrega os layouts (um arquivo .css por layout) e monta o HTML dos cards, parados
// (PNG e PDF) ou animados (reel e cenas do vídeo). Usado por tools/md2cards.js e tools/md2video.js.
//
// Layouts: cada arquivo tools/cards/layouts/<nome>.css é um layout. O tema pode acrescentar ou trocar layouts com
// temas/<tema>/cards/<nome>.css e ajustar qualquer detalhe com temas/<tema>/cards.css (acrescentado ao final).
// O arquivo começa com um comentário que descreve o layout:
//
//   /* @layout {"escuro": false, "frase": false, "imagem": "tela", "descricao": "..."}
//   @exemplo
//   ### Título do card de exemplo
//   **Layout:** <nome>
//   Texto do exemplo (usado pelo catálogo: node tools/md2cards.js <projeto> --catalogo)
//   */
//
//   escuro    fundo escuro por padrão (o **Fundo:** do card troca)
//   frase     o título é a frase do card (grande, no meio)
//   imagem    "tela" (captura de celular, uma por **Imagem:**) ou "fundo" (a imagem cobre o card)
//   interno   não se pede com **Layout:** (a capa, que é o "# Título")
//
// O HTML de um card é sempre o mesmo, e o layout só muda o CSS:
//   <section class="card l-<layout> claro|escuro [frase] f-<paisagem|quadrado|retrato|alto>">
//     [.fundo-img] [img.logo] <div class="miolo"><h2/><div class="texto">...[.bloco>h3]</div>[.autor]</div>
//     [.telas > .tela*] [.credito] [.rodape > .progresso .num .deslize] [.legenda]
//   </section>

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { parse } = require("../md-parse");
const { tokensDoTema, cssVars } = require("../tokens");

const DIR_LAYOUTS = path.join(__dirname, "layouts");

// ---------- formatos ----------
// O desenho dos layouts é feito para o menor lado com 1080 px; os outros formatos são uma escala disso (zoom).
const FORMATOS = {
  "4:5": [1080, 1350],
  "1:1": [1080, 1080],
  "9:16": [1080, 1920],
  "16:9": [1920, 1080],
  "1.91:1": [1200, 628],
};
function formato(nome) {
  const chave = String(nome || "4:5").trim().replace("x", ":");
  if (!FORMATOS[chave]) throw new Error(`Formato desconhecido: "${nome}". Use: ${Object.keys(FORMATOS).join(", ")}.`);
  const [W, H] = FORMATOS[chave];
  const z = Math.min(W, H) / 1080;
  const r = H / W;
  const orient = r < 0.95 ? "paisagem" : r <= 1.05 ? "quadrado" : r < 1.5 ? "retrato" : "alto";
  return { nome: chave, W, H, z, BW: Math.round(W / z), BH: Math.round(H / z), orient, sufixo: chave.replace(/[:.]/g, "x") };
}

// ---------- layouts ----------
function lerLayout(arquivo) {
  const css = fs.readFileSync(arquivo, "utf8");
  const m = css.match(/\/\*\s*@layout\s*(\{[\s\S]*?\})\s*(?:@exemplo\s*([\s\S]*?))?\*\//);
  let meta = {};
  if (m) {
    try { meta = JSON.parse(m[1]); } catch (e) { console.warn(`Aviso: o cabeçalho @layout de ${arquivo} não é um JSON válido.`); }
  }
  return { nome: path.basename(arquivo, ".css"), arquivo, css, meta, exemplo: m && m[2] ? m[2].trim() : null };
}

/** Os layouts disponíveis: os da ferramenta e, por cima, os dos temas (do mais distante ao mais próximo). */
function carregarLayouts(temaDirs = []) {
  const dirs = [DIR_LAYOUTS, ...temaDirs.map((d) => path.join(d, "cards"))];
  const layouts = {};
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).filter((f) => f.endsWith(".css")).sort()) layouts[path.basename(f, ".css")] = lerLayout(path.join(d, f));
  }
  if (!layouts.base) throw new Error("Falta tools/cards/layouts/base.css");
  const extras = temaDirs.map((d) => path.join(d, "cards.css")).filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f, "utf8"));
  return { layouts, extras };
}

// ---------- texto ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const semAcento = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const palavras = (t) => String(t).split(/\s+/).filter(Boolean).length;
const slug = (t) => semAcento(t).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function inline(text) {
  let out = "", last = 0, m;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  while ((m = re.exec(text))) {
    out += esc(text.slice(last, m.index));
    if (m[2] !== undefined) out += `<strong>${esc(m[2])}</strong>`;
    else if (m[3] !== undefined) out += `<em>${esc(m[3])}</em>`;
    else if (m[4] !== undefined) out += `<code>${esc(m[4])}</code>`;
    else out += `<a href="${esc(m[6])}">${esc(m[5])}</a>`;
    last = re.lastIndex;
  }
  return out + esc(text.slice(last));
}
const textoPuro = (t) => String(t).replace(/\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g, "$1$2$3").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
function renderList(items) {
  const tag = items[0] && items[0].ordered ? "ol" : "ul";
  return `<${tag}>` + items.map((i) => `<li>${inline(i.text)}</li>`).join("") + `</${tag}>`;
}

// ---------- Markdown -> cards ----------
const META_OCULTA = /^\*\*(Roteiro|Template|Status do documento):\*\*/;
const DIRETIVA_RE = /^\*\*(Layout|Imagem|Crédito|Credito|Fundo|Oculto|Foco|Autor|Duração|Duracao|Transição|Transicao|Formato|Música|Musica|Trecho|Cena|Zoom|Gravação|Gravacao):\*\*\s*(.+?)\s*$/;
const CALLOUT_RE = (nome) => new RegExp(`^\\*{0,2}${nome}:\\*{0,2}\\s*(.*)$`, "i");
const NOTAS_RE = CALLOUT_RE("Notas( de produção)?");
const LEGENDA_RE = CALLOUT_RE("Legenda");
const ALT_RE = CALLOUT_RE("Alt");
const NARRACAO_RE = CALLOUT_RE("Narração");

/**
 * Lê o Markdown e devolve { cards, legendas, opcoes }. "opcoes" são as diretivas da capa que valem para o arquivo
 * todo (formato, música, transição, gravação).
 */
function lerCards(md) {
  const cards = [];
  const legendas = [];
  const opcoes = {};
  let cur = null;
  let bloco = null;
  const novo = (layout, title) => ({
    layout, title, partes: [], words: palavras(title), images: [], credit: null, dark: null, hidden: false, foco: "topo",
    semTexto: true, alt: null, autor: null, duracao: null, transicao: null, narracao: null, trecho: null, cena: null, zoom: null,
  });
  for (const b of parse(md)) {
    if (b.type === "heading" && b.level === 1 && !cards.length) { cur = novo("capa", b.text); cards.push(cur); bloco = null; continue; }
    if (b.type === "heading" && b.level <= 3) { cur = novo("texto", b.text); cards.push(cur); bloco = null; continue; }
    if (!cur) continue;
    const add = (html, text) => {
      if (bloco) bloco.html += html; else cur.partes.push({ html });
      cur.words += palavras(text || "");
      cur.semTexto = false;
    };
    if (b.type === "heading" && b.level === 4) {
      bloco = { h3: b.text, html: "" };
      cur.partes.push({ bloco });
      cur.words += palavras(b.text);
      cur.semTexto = false;
      continue;
    }
    if (b.type === "para") {
      const conteudo = [];
      for (const l of b.lines) {
        const m = l.match(DIRETIVA_RE);
        if (!m) { conteudo.push(l); continue; }
        const chave = semAcento(m[1]), valor = m[2];
        if (chave === "layout") cur.layout = semAcento(valor);
        else if (chave === "imagem") cur.images.push(valor);
        else if (chave === "credito") cur.credit = valor;
        else if (chave === "fundo") cur.dark = semAcento(valor) === "escuro";
        else if (chave === "oculto") cur.hidden = ["sim", "true", "s"].includes(semAcento(valor));
        else if (chave === "foco") cur.foco = ["meio", "base"].includes(semAcento(valor)) ? semAcento(valor) : "topo";
        else if (chave === "autor") cur.autor = valor;
        else if (chave === "duracao") cur.duracao = parseFloat(valor.replace(",", "."));
        else if (chave === "transicao") cur.transicao = semAcento(valor);
        else if (chave === "trecho") cur.trecho = valor.trim();
        else if (chave === "cena") cur.cena = semAcento(valor);
        else if (chave === "zoom") cur.zoom = parseFloat(valor.replace(",", "."));
        // Diretivas do arquivo todo: valem quando vêm na capa.
        if (cur.layout === "capa" && cards.length === 1) {
          if (chave === "formato") opcoes.formatos = valor.split(",").map((s) => s.trim()).filter(Boolean);
          else if (chave === "musica") opcoes.musica = valor;
          else if (chave === "transicao") opcoes.transicao = semAcento(valor);
          else if (chave === "gravacao") opcoes.gravacao = valor;
        }
      }
      const linhas = cur.layout === "capa" ? conteudo.filter((l) => !META_OCULTA.test(l)) : conteudo;
      if (linhas.length) add(`<p>${linhas.map(inline).join("<br>")}</p>`, linhas.join(" "));
    } else if (b.type === "list") add(renderList(b.items), b.items.map((i) => i.text).join(" "));
    else if (b.type === "callout") {
      const [first, ...rest] = b.items;
      const juntar = (re, sep) => [first.text.match(re).slice(-1)[0], ...rest.map((i) => i.text)].filter(Boolean).join(sep);
      if (first && first.plain && LEGENDA_RE.test(first.text)) legendas.push(juntar(LEGENDA_RE, "\n"));
      else if (first && first.plain && ALT_RE.test(first.text)) cur.alt = juntar(ALT_RE, " ");
      else if (first && first.plain && NARRACAO_RE.test(first.text)) cur.narracao = juntar(NARRACAO_RE, " ");
      else if (!(first && first.plain && NOTAS_RE.test(first.text))) {
        add(b.items.map((i) => `<p>${inline(i.text)}</p>`).join(""), b.items.map((i) => i.text).join(" "));
      }
    }
  }
  for (const c of cards) if (!c.trecho) c.trecho = slug(c.title) || "card";
  return { cards, legendas, opcoes };
}

// ---------- logo e imagens ----------
async function carregarLogo({ theme, logoPath, templatePath }) {
  if (theme.logoText) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="110" viewBox="0 0 140 110"><text x="70" y="82" font-size="80" text-anchor="middle">${esc(theme.logoText)}</text></svg>`;
    return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  }
  if (logoPath) {
    const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml" }[path.extname(logoPath).toLowerCase()] || "image/png";
    return `data:${mime};base64,` + fs.readFileSync(logoPath).toString("base64");
  }
  if (!templatePath) return null;
  const zip = await JSZip.loadAsync(fs.readFileSync(templatePath));
  const f = zip.file(`word/media/${theme.layout === "simple" ? theme.logoMedia || "image1.png" : "image2.png"}`);
  return f ? "data:image/png;base64," + (await f.async("base64")) : null;
}

const MAX_IMAGEM = 700 * 1024;
const cacheImagens = new Map();
function imagemEmbutida(projectDir, rel, titulo) {
  const abs = path.resolve(projectDir, rel);
  if (cacheImagens.has(abs)) return cacheImagens.get(abs);
  if (!fs.existsSync(abs)) { console.warn(`Aviso: a imagem do card "${titulo}" não existe: ${rel}`); return null; }
  if (fs.statSync(abs).size > MAX_IMAGEM) console.warn(`Aviso: a imagem ${rel} passa de 700 KB; otimize-a.`);
  const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }[path.extname(abs).toLowerCase()] || "image/png";
  const uri = `data:${mime};base64,` + fs.readFileSync(abs).toString("base64");
  cacheImagens.set(abs, uri);
  return uri;
}

// ---------- montagem ----------
/**
 * Cria o montador de páginas de um projeto: { layouts, render(cards, opcoes) }.
 * contexto: { projectDir, theme, logoPath, templatePath, temaDirs } (o que o loadTheme devolve, mais a pasta).
 */
async function criarMontador(contexto) {
  const { layouts, extras } = carregarLayouts(contexto.temaDirs);
  const tk = tokensDoTema(contexto.theme);
  const logo = await carregarLogo(contexto);

  const metaDe = (c) => (layouts[c.layout] || layouts.texto || {}).meta || {};
  const escuroDe = (c) => (c.dark !== null ? c.dark : !!metaDe(c).escuro);
  const fraseDe = (c) => !!metaDe(c).frase || (c.layout === "texto" && c.semTexto);

  function renderCard(c, i, total, f, extra = {}) {
    const meta = metaDe(c);
    const classes = ["card", `l-${layouts[c.layout] ? c.layout : "texto"}`, escuroDe(c) ? "escuro" : "claro", `f-${f.orient}`];
    if (fraseDe(c)) classes.push("frase");
    if (extra.classe) classes.push(extra.classe);
    const imgs = c.images.map((rel) => imagemEmbutida(contexto.projectDir, rel, c.title)).filter(Boolean);
    const topo = logo && c.layout !== "capa" ? `<img class="logo" src="${logo}" alt="">` : "";
    const capaLogo = logo && c.layout === "capa" ? `<img class="logo grande" src="${logo}" alt="">` : "";
    const posFoco = { topo: "top:0", meio: "top:50%;transform:translateY(-50%)", base: "bottom:0" }[c.foco];
    let telas = "";
    if (meta.imagem === "tela") {
      const lista = imgs.length ? imgs : [null];
      telas = `<div class="telas n${lista.length}">` + lista.map((src) => `<div class="tela">${src ? `<img src="${src}" alt="" style="${posFoco}">` : ""}</div>`).join("") + "</div>";
    }
    const fundo = meta.imagem === "fundo" && imgs[0] ? `<div class="fundo-img" style="background-image:url('${imgs[0]}')"></div>` : "";
    const corpo = c.partes.map((p) => (p.bloco ? `<div class="bloco"><h3>${inline(p.bloco.h3)}</h3>${p.bloco.html}</div>` : p.html)).join("");
    const autor = c.autor ? `<div class="autor">${inline(c.autor)}</div>` : "";
    const credito = c.credit ? `<div class="credito">${inline(c.credit)}</div>` : "";
    const rodape = c.layout === "capa" || extra.semRodape ? "" : `<div class="rodape"><span class="progresso"><i style="width:${(((i + 1) / total) * 100).toFixed(1)}%"></i></span><span class="num">${i + 1} / ${total}</span>${i < total - 1 && !extra.semDeslize ? '<span class="deslize">Deslize →</span>' : ""}</div>`;
    const estilo = [`width:${f.BW}px`, `height:${f.BH}px`, `zoom:${f.z}`, ...(extra.estilo || [])].join(";");
    return `<section class="${classes.join(" ")}" style="${estilo}">${fundo}${topo}${capaLogo}
${extra.etiqueta ? `<div class="etiqueta">${esc(extra.etiqueta)}</div>` : ""}<div class="miolo"><h2>${inline(c.title)}</h2><div class="texto">${corpo}</div>${autor}</div>${telas}${credito}${rodape}${extra.legenda || ""}</section>`;
  }

  function css() {
    const ordem = ["base", ...Object.keys(layouts).filter((n) => n !== "base" && n !== "animacao"), ...(layouts.animacao ? ["animacao"] : [])];
    return `:root{\n${cssVars(tk)}  --fonte-titulo:"${tk.fonteTitulo}","${tk.fonte}",sans-serif;\n}\n` + ordem.map((n) => layouts[n].css).join("\n") + "\n" + extras.join("\n");
  }

  /**
   * Monta uma página HTML.
   *   modo "todos"  (padrão) todos os cards, um embaixo do outro (o html e o pdf do carrossel)
   *   modo "solo"   só o card `indice` (para o PNG)
   *   modo "folha"  todos lado a lado, pequenos (a folha de contato)
   *   modo "anim"   todos empilhados, com a linha do tempo (`tempos`: [{ t0, t1, transicao }]) para virar vídeo
   */
  function pagina(cards, { formato: f, modo = "todos", indice = 0, tempos = null, extras: extrasCard = [], semDeslize = false } = {}) {
    let corpo;
    if (modo === "solo") corpo = renderCard(cards[indice], indice, cards.length, f, { semDeslize, ...(extrasCard[indice] || {}) });
    else if (modo === "anim") {
      corpo = cards.map((c, i) => {
        const t = tempos[i];
        const estilo = [`--t0:${t.t0.toFixed(3)}s`, `--t1:${t.t1.toFixed(3)}s`, `--tsai:${t.tsai}s`, `--tsai-ant:${i ? tempos[i - 1].tsai : 0}s`];
        return renderCard(c, i, cards.length, f, { semDeslize: true, ...(extrasCard[i] || {}), classe: `tr-${t.transicao || "desliza"}`, estilo });
      }).join("\n");
    } else if (modo === "folha") {
      corpo = cards.map((c, i) => `<div class="mini" style="zoom:${(324 / f.W).toFixed(4)}">${renderCard(c, i, cards.length, f, { semDeslize, ...(extrasCard[i] || {}) })}</div>`).join("\n");
    } else corpo = cards.map((c, i) => renderCard(c, i, cards.length, f, { semDeslize, ...(extrasCard[i] || {}) })).join("\n");
    const classe = { todos: "", solo: "solo", folha: "folha", anim: "anim" }[modo];
    const tamanho = modo === "anim" ? `<style>body.anim{width:${f.W}px;height:${f.H}px}</style>`
      : modo === "folha" ? `<style>body.folha{width:${folhaLargura(f)}px}</style>` : "";
    const quadro = modo === "anim"
      ? `<script>window.__quadro=(ms)=>{for(const a of document.getAnimations()){a.pause();a.currentTime=ms;}};</script>`
      : "";
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(textoPuro(cards[0].title))}</title><meta name="viewport" content="width=${f.W}"><style>@page{size:${f.W}px ${f.H}px;margin:0}\n${css()}</style>${tamanho}</head><body${classe ? ` class="${classe}"` : ""}>\n${corpo}\n${quadro}</body></html>`;
  }

  return { layouts, tokens: tk, metaDe, fraseDe, pagina };
}

// A folha de contato: miniaturas de 324 px de largura, em 5 colunas, com 16 px entre elas e 24 px de margem.
const FOLHA = { colunas: 5, largura: 324, vao: 16, margem: 24 };
const folhaLargura = () => FOLHA.margem * 2 + FOLHA.colunas * FOLHA.largura + (FOLHA.colunas - 1) * FOLHA.vao;
function folhaTamanho(f, n) {
  const linhas = Math.ceil(n / FOLHA.colunas);
  const alt = Math.round((FOLHA.largura / f.W) * f.H);
  return [folhaLargura(), FOLHA.margem * 2 + linhas * alt + (linhas - 1) * FOLHA.vao];
}

// ---------- linha do tempo (reel e cenas) ----------
const TRANSICAO_S = 0.5;
/** Duração sugerida de um card animado: tempo para as entradas e para ler. */
function duracaoDoCard(c) {
  if (c.duracao) return c.duracao;
  if (c.layout === "capa") return 3;
  return Math.max(3, Math.min(8, 1.8 + c.words * 0.3));
}
/**
 * Calcula a linha do tempo dos cards animados: cada card entra em t0 e sai em t1; o próximo entra junto com a saída
 * (uma sobreposição de TRANSICAO_S segundos, ou nenhuma no "corte"). Devolve também os intervalos em que algo se
 * mexe: fora deles o quadro é igual ao anterior e não precisa ser capturado de novo.
 */
function linhaDoTempo(cards, { transicao = "desliza", duracoes = null, mexeSempre = () => false } = {}) {
  const tr = (c) => (c && (c.transicao || transicao)) || transicao;
  const sobrepoe = (c) => (tr(c) === "corte" ? 0 : TRANSICAO_S);
  const tempos = [];
  const intervalos = [];
  let t = 0;
  cards.forEach((c, i) => {
    const ultimo = i === cards.length - 1;
    const d = duracoes ? duracoes[i] : duracaoDoCard(c);
    const tsai = ultimo ? 0 : sobrepoe(cards[i + 1]);
    const t0 = t, t1 = t0 + d;
    tempos.push({ t0, t1: ultimo ? t1 + 3600 : t1, tsai, transicao: tr(c) });
    intervalos.push(mexeSempre(c) ? [t0, t1] : [t0, t0 + 2.6]);
    if (!ultimo) intervalos.push([t1 - tsai - 0.05, t1 + 0.05]);
    t = ultimo ? t1 : t1 - tsai;
  });
  return { tempos, intervalos, duracao: t };
}

module.exports = { folhaTamanho, FORMATOS, formato, carregarLayouts, lerCards, criarMontador, linhaDoTempo, duracaoDoCard, palavras, slug, esc, inline, textoPuro, TRANSICAO_S };
