import { useEffect, useState } from "react";
import { Alerta, Botao, Campo, Cartao, EstadoVazio, type VarianteBotao } from "./index";
import tokensCss from "../tokens.css?raw";

// O catálogo do design system (só no desenvolvimento, em /ds): cada token e cada componente nos seus estados, como
// documentação viva. Serve para ver a identidade do tema aplicada, conferir contraste e tirar prints.

const TOKENS = ["fundo", "texto", "titulo", "suave", "cartao", "borda", "primaria", "acento", "primaria-acao", "acento-acao", "fundo-escuro", "destaque"] as const;

const ESPACOS = [1, 2, 3, 4, 5, 6] as const;
const TIPOS = ["tipo-p", "tipo-m", "tipo-g", "tipo-gg", "tipo-ggg"] as const;
const RAIOS = ["raio-p", "raio", "raio-g"] as const;
const DURACOES = ["duracao-rapida", "duracao", "duracao-lenta"] as const;
const MEDIDAS = [...ESPACOS.map((n) => `espaco-${n}`), ...TIPOS, ...RAIOS, ...DURACOES, "curva", "sombra", "alvo-toque"];

// As camadas: cada token do tokens.css (o semântico), com o valor e, no comentário que o gerador escreve, de onde vem
// no tema (o primitivo). Quem usa cada token (o componente) é lido das folhas de estilo carregadas, então não desatualiza.
interface LinhaToken {
  nome: string;
  valor: string;
  origem: string;
}
const LINHAS: LinhaToken[] = [...tokensCss.matchAll(/^\s*--([\w-]+):\s*(.+?);(?:\s*\/\*\s*(.+?)\s*\*\/)?\s*$/gm)].map((m) => ({
  nome: m[1]!,
  valor: m[2]!,
  origem: m[3] ?? "",
}));

const grupo = (n: string): string =>
  n === "fonte" ? "Fonte"
  : n.startsWith("raio") || n === "sombra" ? "Forma"
  : n.startsWith("espaco") ? "Espaço"
  : n.startsWith("tipo") ? "Tipo"
  : n === "alvo-toque" ? "Toque"
  : n.startsWith("duracao") || n === "curva" ? "Movimento"
  : "Cor";
const GRUPOS = [...new Set(LINHAS.map((l) => grupo(l.nome)))];

/** A classe CSS de cada componente de src/ui/. O que não é de componente nem do catálogo (.ds-) é das telas. */
const COMPONENTES: [string, string][] = [
  ["ds-botao", "Botao"],
  ["ds-rotulo", "Campo"],
  ["ds-campo", "Campo"],
  ["ds-cartao", "Cartao"],
  ["ds-vazio", "EstadoVazio"],
  ["ds-alerta", "Alerta"],
];
const ORDEM_USO = [...new Set(COMPONENTES.map(([, c]) => c)), "Telas"];

/** Para cada token, quem o usa (componentes e telas), lendo as regras de CSS carregadas na página (menos a que os define). */
function lerUsos(): Record<string, string[]> {
  const usos: Record<string, Set<string>> = {};
  const visitar = (regras: CSSRuleList) => {
    for (const regra of Array.from(regras)) {
      if (regra instanceof CSSStyleRule && !regra.style[0]?.startsWith("--")) {
        const quem = regra.selectorText.split(",").map((sel) => COMPONENTES.find(([classe]) => sel.includes(`.${classe}`))?.[1] ?? (sel.includes(".ds-") ? null : "Telas"));
        for (const [, nome] of regra.style.cssText.matchAll(/var\(--([\w-]+)/g)) for (const q of quem) if (q) (usos[nome!] ??= new Set()).add(q);
      }
      if ("cssRules" in regra) visitar((regra as CSSGroupingRule).cssRules);
    }
  };
  for (const folha of Array.from(document.styleSheets)) {
    try {
      visitar(folha.cssRules);
    } catch {
      // Folha de outra origem: não dá para ler, e não é do protótipo.
    }
  }
  return Object.fromEntries(Object.entries(usos).map(([k, v]) => [k, ORDEM_USO.filter((q) => v.has(q))]));
}

const tipoDaOrigem = (o: string): string => (o.startsWith("tema:") ? "tema" : o.startsWith("padrão:") ? "padrao" : o.startsWith("--") ? "derivado" : "fixo");

const VARIANTES: { id: VarianteBotao; uso: string }[] = [
  { id: "primario", uso: "A ação principal da tela. Uma por tela." },
  { id: "padrao", uso: "Ações comuns, como concluir ou voltar." },
  { id: "perigo", uso: "Apaga algo. Peça confirmação antes." },
  { id: "discreto", uso: "Ação rara, com cara de link." },
];

function luz(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
function contraste(a: string, b: string): number {
  const [x, y] = [luz(a), luz(b)].sort((m, n) => n - m);
  return (x! + 0.05) / (y! + 0.05);
}

const PARES: [string, string, string][] = [
  ["texto", "texto", "fundo"],
  ["texto suave", "suave", "fundo"],
  ["texto no cartão", "texto", "cartao"],
  ["branco sobre a ação primária", "#FFFFFF", "primaria-acao"],
  ["branco sobre a ação de perigo", "#FFFFFF", "acento-acao"],
  ["branco sobre o fundo escuro", "#FFFFFF", "fundo-escuro"],
  ["destaque sobre o fundo escuro", "destaque", "fundo-escuro"],
];

export function Catalogo() {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [usos, setUsos] = useState<Record<string, string[]>>({});
  useEffect(() => {
    setUsos(lerUsos());
    const estilo = getComputedStyle(document.documentElement);
    setValores({
      ...Object.fromEntries(TOKENS.map((t) => [t, estilo.getPropertyValue(`--${t}`).trim().toUpperCase()])),
      ...Object.fromEntries(MEDIDAS.map((t) => [t, estilo.getPropertyValue(`--${t}`).trim()])),
    });
  }, []);
  const cor = (ref: string) => (ref.startsWith("#") ? ref : valores[ref] ?? "#000000");

  return (
    <main>
      <h1>Design system</h1>
      <p className="aviso">Catálogo do protótipo (só no desenvolvimento). Os tokens vêm do tema do projeto, por <code>npm run tokens</code>.</p>

      <h2>Camadas</h2>
      <ol className="ds-camadas" aria-label="De onde vem cada valor">
        <li>
          <strong>Primitivo</strong>
          <code>temas/&lt;tema&gt;/tema.json</code>
          <span>O valor em si: a cor da marca, o raio, a duração.</span>
        </li>
        <li>
          <strong>Semântico</strong>
          <code>src/tokens.css</code>
          <span>Para que serve: <code>--primaria-acao</code>, <code>--raio-g</code>. Gerado, não se edita.</span>
        </li>
        <li>
          <strong>Componente</strong>
          <code>src/ui/</code>
          <span>Onde é usado: o botão, o campo, o cartão. Só com tokens.</span>
        </li>
        <li>
          <strong>Uso</strong>
          <code>src/components/</code>
          <span>As telas do protótipo. Os cards, o reel e o vídeo leem os mesmos tokens.</span>
        </li>
      </ol>
      <p className="ds-nota">
        Na tabela, <span className="ds-origem ds-origem--tema">tema</span> é um valor que o tema declara,{" "}
        <span className="ds-origem ds-origem--padrao">padrão</span> é o de <code>tools/tokens.js</code> (o tema pode mudar em <code>"tokens"</code>), e{" "}
        <span className="ds-origem ds-origem--derivado">derivado</span> é calculado de outro token.
      </p>
      <div className="ds-rolagem">
        <table className="ds-tabela ds-tabela--camadas">
          <thead>
            <tr>
              <th>Token (semântico)</th>
              <th>Valor</th>
              <th>Vem do tema (primitivo)</th>
              <th>Usado por</th>
            </tr>
          </thead>
          {GRUPOS.map((g) => (
            <tbody key={g}>
              <tr>
                <th colSpan={4} scope="colgroup" className="ds-tabela__grupo">
                  {g}
                </th>
              </tr>
              {LINHAS.filter((l) => grupo(l.nome) === g).map((l) => (
                <tr key={l.nome}>
                  <td>
                    <code>--{l.nome}</code>
                  </td>
                  <td>
                    {grupo(l.nome) === "Cor" && <span className="ds-pastilha" style={{ background: `var(--${l.nome})` }} />}
                    <code>{l.valor.length > 24 ? `${l.valor.slice(0, 24)}…` : l.valor}</code>
                  </td>
                  <td>
                    <span className={`ds-origem ds-origem--${tipoDaOrigem(l.origem)}`}>{l.origem.replace(/^(tema|padrão|fixo): /, "") || "?"}</span>
                  </td>
                  <td>{usos[l.nome]?.join(", ") || <span className="ds-nota">não usado no protótipo</span>}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <h3>Por componente</h3>
      <div className="ds-grade">
        {ORDEM_USO.map((quem) => {
          const deles = LINHAS.filter((l) => usos[l.nome]?.includes(quem));
          return (
            <Cartao key={quem} tipo="item">
              <strong>{quem}</strong>
              <span className="ds-fichas">
                {deles.map((l) => (
                  <code key={l.nome} className="ds-ficha">
                    --{l.nome}
                  </code>
                ))}
              </span>
            </Cartao>
          );
        })}
      </div>

      <h2>Cores</h2>
      <div className="ds-amostras">
        {TOKENS.map((t) => (
          <div key={t} className="ds-amostra">
            <span className="ds-amostra__cor" style={{ background: `var(--${t})` }} />
            <code>--{t}</code>
            <span>{valores[t]}</span>
          </div>
        ))}
      </div>

      <h2>Espaçamento</h2>
      <div className="ds-degraus">
        {ESPACOS.map((n) => (
          <div key={n} className="ds-degrau">
            <code>--espaco-{n}</code>
            <span className="ds-degrau__barra" style={{ width: `calc(var(--espaco-${n}) * 4)` }} />
            <span>{valores[`espaco-${n}`]}</span>
          </div>
        ))}
      </div>

      <h2>Tipo</h2>
      <div className="ds-degraus">
        {TIPOS.map((t) => (
          <div key={t} className="ds-degrau">
            <code>--{t}</code>
            <span style={{ fontSize: `var(--${t})` }}>Lista de tarefas</span>
            <span>{valores[t]}</span>
          </div>
        ))}
      </div>

      <h2>Forma</h2>
      <div className="ds-raios">
        {RAIOS.map((r) => (
          <span key={r} className="ds-raio" style={{ borderRadius: `var(--${r})` }}>
            --{r}: {valores[r]}
          </span>
        ))}
        <span className="ds-raio" style={{ boxShadow: "var(--sombra)", border: 0 }}>
          --sombra
        </span>
      </div>

      <h2>Movimento</h2>
      <p className="ds-nota">
        Passe o mouse (ou o foco) no trilho: o quadrado anda com <code>--duracao-lenta</code> ({valores["duracao-lenta"]}) e a curva{" "}
        <code>{valores.curva}</code>. As mesmas durações e a mesma curva animam os reels e o vídeo. Rápida: {valores["duracao-rapida"]}; normal:{" "}
        {valores.duracao}.
      </p>
      <div className="ds-mov-trilho" tabIndex={0} aria-label="Exemplo de movimento">
        <div className="ds-mov" />
      </div>

      <h2>Contraste</h2>
      <table className="ds-tabela">
        <thead>
          <tr>
            <th>Par</th>
            <th>Razão</th>
            <th>Mínimo 4,5:1</th>
          </tr>
        </thead>
        <tbody>
          {PARES.map(([nome, a, b]) => {
            const razao = contraste(cor(a), cor(b));
            return (
              <tr key={nome}>
                <td>{nome}</td>
                <td>{razao.toFixed(2)}:1</td>
                <td>{razao >= 4.5 ? "passa" : "NÃO passa"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>Botão</h2>
      <div className="ds-grade">
        {VARIANTES.map((v) => (
          <Cartao key={v.id} tipo="item">
            <div>
              <strong>{v.id}</strong>
              <p className="ds-nota">{v.uso}</p>
            </div>
            <span className="ds-par">
              <Botao variante={v.id}>Exemplo</Botao>
              <Botao variante={v.id} disabled>
                Desligado
              </Botao>
            </span>
          </Cartao>
        ))}
      </div>
      <p className="ds-nota">O foco aparece ao navegar com a tecla Tab: um contorno de 3 px na cor da marca.</p>

      <h2>Campo</h2>
      <Campo rotulo="Com rótulo e ação ao lado" placeholder="Escreva algo" acao={<Botao variante="primario">Enviar</Botao>} />
      <p />
      <Campo rotulo="Sem ação" defaultValue="Um valor preenchido" />
      <Alerta>Mensagem de erro, anunciada a leitores de tela.</Alerta>

      <h2>Cartão</h2>
      <div className="ds-grade">
        <Cartao tipo="bloco" faixa="primaria">
          Bloco com a faixa da marca
        </Cartao>
        <Cartao tipo="bloco" faixa="neutra">
          Bloco com a faixa neutra
        </Cartao>
        <Cartao tipo="item">Item de lista</Cartao>
      </div>

      <h2>Estado vazio</h2>
      <Cartao tipo="bloco">
        <EstadoVazio>Nada a fazer. Que tal anotar a próxima tarefa?</EstadoVazio>
      </Cartao>
    </main>
  );
}
