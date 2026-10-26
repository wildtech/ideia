export type StageId = "a-fazer" | "feito";

export interface Stage {
  id: StageId;
  nome: string;
}

/** As duas etapas da lista, na ordem em que aparecem. */
export const STAGES: readonly Stage[] = [
  { id: "a-fazer", nome: "A fazer" },
  { id: "feito", nome: "Feito" },
];

export type ISOTimestamp = string;

export interface Tarefa {
  id: string;
  titulo: string;
  etapa: StageId;
  criadaEm: ISOTimestamp;
  /** Preenchido quando a tarefa está em "Feito"; nulo quando volta para "A fazer". */
  concluidaEm: ISOTimestamp | null;
}

export type Falha = { ok: false; erro: string; codigo: "invalida" | "nao-encontrada" };
export type Resultado<T> = { ok: true; valor: T } | Falha;
