import { useEffect, useState } from "react";
import { Alerta, Botao, Campo, Cartao, EstadoVazio, type VarianteBotao } from "./index";

// O catálogo do design system (só no desenvolvimento, em /ds): cada token e cada componente nos seus estados, como
// documentação viva. Serve para ver a identidade do tema aplicada, conferir contraste e tirar prints.

const TOKENS = ["fundo", "texto", "titulo", "suave", "cartao", "borda", "primaria", "acento", "primaria-acao", "acento-acao", "fundo-escuro", "destaque"] as const;

const ESPACOS = [1, 2, 3, 4, 5, 6] as const;
const TIPOS = ["tipo-p", "tipo-m", "tipo-g", "tipo-gg", "tipo-ggg"] as const;
const RAIOS = ["raio-p", "raio", "raio-g"] as const;
const DURACOES = ["duracao-rapida", "duracao", "duracao-lenta"] as const;
const MEDIDAS = [...ESPACOS.map((n) => `espaco-${n}`), ...TIPOS, ...RAIOS, ...DURACOES, "curva", "sombra", "alvo-toque"];

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
    setValores({
      ...Object.fromEntries(TOKENS.map((t) => [t, estilo.getPropertyValue(`--${t}`).trim().toUpperCase()])),
      ...Object.fromEntries(MEDIDAS.map((t) => [t, estilo.getPropertyValue(`--${t}`).trim()])),
    });
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
