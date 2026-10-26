import type { StageId } from "../src/domain";

export interface Exemplo {
  titulo: string;
  etapa: StageId;
}

/** Dados de exemplo. Todos fictícios: servem para ver a lista em uso e testar o botão de limpar. */
export const EXEMPLOS: readonly Exemplo[] = [
  { titulo: "Escrever o pitch", etapa: "a-fazer" },
  { titulo: "Revisar o resumo (TL;DR)", etapa: "a-fazer" },
  { titulo: "Gerar os slides", etapa: "a-fazer" },
  { titulo: "Testar o protótipo", etapa: "a-fazer" },
  { titulo: "Regar as plantas", etapa: "a-fazer" },
  { titulo: "Escolher o tema", etapa: "feito" },
  { titulo: "Montar o roteiro", etapa: "feito" },
  { titulo: "Rodar o build", etapa: "feito" },
];
