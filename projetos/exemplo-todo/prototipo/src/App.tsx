import { useCallback, useEffect, useState } from "react";
import { gateway } from "./api";
import { Coluna } from "./components/Coluna";
import { NovaTarefa } from "./components/NovaTarefa";
import type { QuadroData, Tarefa } from "./domain";
import { Botao } from "./ui";

export function App() {
  const [quadro, setQuadro] = useState<QuadroData | null>(null);

  const carregar = useCallback(async () => setQuadro(await gateway.quadro()), []);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function criar(titulo: string): Promise<string | null> {
    const r = await gateway.criar(titulo);
    if (!r.ok) return r.erro;
    await carregar();
    return null;
  }

  async function mover(t: Tarefa) {
    await gateway.mover(t.id, t.etapa === "feito" ? "a-fazer" : "feito");
    await carregar();
  }

  async function limpar(feitas: number) {
    // Limpar não tem desfazer: por isso a confirmação diz quantas tarefas vão embora.
    if (!window.confirm(`Remover ${feitas} ${feitas === 1 ? "tarefa feita" : "tarefas feitas"}? Isso não pode ser desfeito.`)) return;
    await gateway.limparFeitas();
    await carregar();
  }

  async function reiniciar() {
    await gateway.reiniciarDadosDeExemplo();
    await carregar();
  }

  if (!quadro) return <p className="carregando">Carregando…</p>;

  return (
    <main>
      <h1>Lista de tarefas</h1>
      <p className="aviso">Protótipo de exemplo. Todos os dados são fictícios.</p>
      <NovaTarefa onCriar={criar} />
      <div className="quadro">
        {quadro.etapas.map((etapa) => {
          const doEstagio = quadro.tarefas.filter((t) => t.etapa === etapa.id);
          return (
            <Coluna
              key={etapa.id}
              etapa={etapa}
              tarefas={doEstagio}
              onMover={mover}
              onLimpar={etapa.id === "feito" ? () => limpar(doEstagio.length) : undefined}
            />
          );
        })}
      </div>
      <footer>
        <Botao variante="discreto" onClick={reiniciar}>
          Reiniciar dados de exemplo
        </Botao>
      </footer>
    </main>
  );
}
