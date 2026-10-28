import { useEffect, useState } from "react";
import { Alerta, Botao, Campo, Cartao, EstadoVazio, type VarianteBotao } from "./index";

// O catálogo do design system (só no desenvolvimento, em /ds): cada token e cada componente nos seus estados, como
// documentação viva. Serve para ver a identidade do tema aplicada, conferir contraste e tirar prints.

const TOKENS = ["fundo", "texto", "titulo", "suave", "cartao", "borda", "primaria", "acento", "primaria-acao", "acento-acao", "fundo-escuro", "destaque"] as const;

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
  useEffect(() => {
    const estilo = getComputedStyle(document.documentElement);
    setValores(Object.fromEntries(TOKENS.map((t) => [t, estilo.getPropertyValue(`--${t}`).trim().toUpperCase()])));
  }, []);
  const cor = (ref: string) => (ref.startsWith("#") ? ref : valores[ref] ?? "#000000");

  return (
    <main>
      <h1>Design system</h1>
      <p className="aviso">Catálogo do protótipo (só no desenvolvimento). Cores e fonte vêm do tema do projeto, por <code>npm run tokens</code>.</p>

      <h2>Tokens</h2>
      <div className="ds-amostras">
        {TOKENS.map((t) => (
          <div key={t} className="ds-amostra">
            <span className="ds-amostra__cor" style={{ background: `var(--${t})` }} />
            <code>--{t}</code>
            <span>{valores[t]}</span>
          </div>
        ))}
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
