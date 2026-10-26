import type { QuadroData, Resultado, StageId, Tarefa, TodoGateway } from "./domain";

async function chamar<T>(caminho: string, corpo?: unknown): Promise<T> {
  const r = await fetch(`/api${caminho}`, corpo === undefined ? undefined : { method: "POST", body: JSON.stringify(corpo) });
  return (await r.json()) as T;
}

/** Cliente HTTP que cumpre o mesmo contrato do acesso a dados. A tela só conhece este contrato. */
export const gateway: TodoGateway = {
  quadro: () => chamar<QuadroData>("/quadro"),
  criar: (titulo) => chamar<Resultado<Tarefa>>("/tarefas", { titulo }),
  mover: (id, para: StageId) => chamar<Resultado<Tarefa>>(`/tarefas/${id}/mover`, { para }),
  limparFeitas: () => chamar<{ removidas: number }>("/feitas/limpar", {}),
  reiniciarDadosDeExemplo: async () => {
    await chamar("/reset", {});
  },
};
