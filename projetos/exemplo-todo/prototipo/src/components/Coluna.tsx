import type { Stage, Tarefa } from "../domain";

interface Props {
  etapa: Stage;
  tarefas: Tarefa[];
  /** Muda a tarefa de etapa: concluir (em "A fazer") ou voltar (em "Feito"). */
  onMover: (t: Tarefa) => void;
  /** Só a coluna "Feito" mostra o botão de limpar. */
  onLimpar?: () => void;
}

export function Coluna({ etapa, tarefas, onMover, onLimpar }: Props) {
  const feito = etapa.id === "feito";
  return (
    <section className={`coluna ${etapa.id}`} aria-labelledby={`h-${etapa.id}`}>
      <header>
        <h2 id={`h-${etapa.id}`}>
          {etapa.nome} <span className="contagem">{tarefas.length}</span>
        </h2>
        {onLimpar && (
          <button type="button" className="perigo" onClick={onLimpar} disabled={tarefas.length === 0}>
            Limpar feitas
          </button>
        )}
      </header>
      {tarefas.length === 0 ? (
        <p className="vazio">{feito ? "Nada feito ainda." : "Nada a fazer. Que tal anotar a próxima tarefa?"}</p>
      ) : (
        <ul>
          {tarefas.map((t) => (
            <li key={t.id}>
              <span className="titulo">{t.titulo}</span>
              <button type="button" onClick={() => onMover(t)} aria-label={`${feito ? "Voltar para a fazer" : "Concluir"}: ${t.titulo}`}>
                {feito ? "Voltar" : "Concluir"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
