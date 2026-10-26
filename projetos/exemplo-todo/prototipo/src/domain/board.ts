import { contar, ordenar } from "./rules";
import { STAGES, type Resultado, type Stage, type StageId, type Tarefa } from "./types";

export interface QuadroData {
  etapas: readonly Stage[];
  tarefas: Tarefa[];
  totais: Record<StageId, number>;
}

export function montarQuadro(tarefas: readonly Tarefa[]): QuadroData {
  return { etapas: STAGES, tarefas: ordenar(tarefas), totais: contar(tarefas) };
}

/**
 * O contrato de dados. A tela e a API só conhecem este contrato: trocar o SQLite por outro banco é escrever outra
 * implementação, sem mexer nas telas.
 */
export interface TodoGateway {
  quadro(): Promise<QuadroData>;
  criar(titulo: string): Promise<Resultado<Tarefa>>;
  mover(id: string, para: StageId): Promise<Resultado<Tarefa>>;
  /** Remove todas as tarefas em "Feito" e devolve quantas foram removidas. */
  limparFeitas(): Promise<{ removidas: number }>;
  reiniciarDadosDeExemplo(): Promise<void>;
}
