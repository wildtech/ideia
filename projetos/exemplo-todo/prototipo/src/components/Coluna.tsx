import type { Stage, Tarefa } from "../domain";
import { Botao, Cartao, EstadoVazio } from "../ui";

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
    <Cartao como="section" tipo="bloco" faixa={feito ? "neutra" : "primaria"} className={`coluna ${etapa.id}`} aria-labelledby={`h-${etapa.id}`}>
      <header>
        <h2 id={`h-${etapa.id}`}>
          {etapa.nome} <span className="contagem">{tarefas.length}</span>
        </h2>
        {onLimpar && (
          <Botao variante="perigo" onClick={onLimpar} disabled={tarefas.length === 0}>
            Limpar feitas
          </Botao>
        )}
      </header>
      {tarefas.length === 0 ? (
        <EstadoVazio>{feito ? "Nada feito ainda." : "Nada a fazer. Que tal anotar a próxima tarefa?"}</EstadoVazio>
      ) : (
        <ul>
          {tarefas.map((t) => (
            <Cartao como="li" key={t.id}>
              <span className="titulo">{t.titulo}</span>
              <Botao onClick={() => onMover(t)} aria-label={`${feito ? "Voltar para a fazer" : "Concluir"}: ${t.titulo}`}>
                {feito ? "Voltar" : "Concluir"}
              </Botao>
            </Cartao>
          ))}
        </ul>
      )}
    </Cartao>
  );
}
