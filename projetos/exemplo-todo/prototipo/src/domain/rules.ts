import type { Falha, ISOTimestamp, Resultado, StageId, Tarefa } from "./types";

export const TITULO_MAX = 120;

const falha = (erro: string, codigo: Falha["codigo"] = "invalida"): Falha => ({ ok: false, erro, codigo });

/** Valida e normaliza o título: sem espaços sobrando, não vazio, até `TITULO_MAX` caracteres. */
export function validarTitulo(bruto: string): Resultado<string> {
  const titulo = bruto.trim().replace(/\s+/g, " ");
  if (!titulo) return falha("Escreva o que precisa ser feito.");
  if (titulo.length > TITULO_MAX) return falha(`O título passa de ${TITULO_MAX} caracteres.`);
  return { ok: true, valor: titulo };
}

/**
 * Muda a tarefa de etapa. Vale nos dois sentidos (concluir e reabrir). Ao ir para "Feito" guarda quando foi concluída;
 * ao voltar para "A fazer", limpa essa data.
 */
export function aplicarMovimento(tarefa: Tarefa, para: StageId, agora: ISOTimestamp): Resultado<Tarefa> {
  if (tarefa.etapa === para) return falha("A tarefa já está nesta etapa.");
  return { ok: true, valor: { ...tarefa, etapa: para, concluidaEm: para === "feito" ? agora : null } };
}

/** Quais tarefas o botão "Limpar feitas" remove: só as que estão em "Feito". */
export function idsParaLimpar(tarefas: readonly Tarefa[]): string[] {
  return tarefas.filter((t) => t.etapa === "feito").map((t) => t.id);
}

export function contar(tarefas: readonly Tarefa[]): Record<StageId, number> {
  const totais: Record<StageId, number> = { "a-fazer": 0, feito: 0 };
  for (const t of tarefas) totais[t.etapa] += 1;
  return totais;
}

/** "A fazer": as mais antigas primeiro. "Feito": as concluídas mais recentemente primeiro. */
export function ordenar(tarefas: readonly Tarefa[]): Tarefa[] {
  return [...tarefas].sort((a, b) => {
    if (a.etapa !== b.etapa) return a.etapa === "a-fazer" ? -1 : 1;
    if (a.etapa === "a-fazer") return a.criadaEm.localeCompare(b.criadaEm);
    return (b.concluidaEm ?? "").localeCompare(a.concluidaEm ?? "");
  });
}
