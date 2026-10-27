// O roteiro da narração do vídeo de demonstração. É o mesmo texto das legendas e da voz.
// Cada trecho tem um id: o vídeo mostra a legenda e a voz toca quando o passo da jornada começa.
// O cenário vem do "Problema" do pitch (exemplo-todo.md) e é fictício.

export interface Trecho {
  id: string;
  texto: string;
}

export const NARRACAO: readonly Trecho[] = [
  {
    id: "cenario",
    texto:
      "Uma pessoa toca quatro assuntos ao mesmo tempo. Ao longo do dia, ela anota o que precisa fazer em post-its, em mensagens e nas margens de reuniões. No fim do dia, não sabe o que já fez nem o que ainda falta. Este cenário é fictício.",
  },
  { id: "prototipo", texto: "Este é o protótipo de uma lista de tarefas, com duas etapas: a fazer e feito. Todos os dados são fictícios." },
  { id: "anotar", texto: "Primeiro, anotar. A pessoa escreve a tarefa e clica em adicionar. A tarefa nova entra em a fazer." },
  { id: "andar", texto: "Depois, andar. Ao concluir, a tarefa vai para feito, e o protótipo guarda quando ela foi concluída." },
  {
    id: "limpar",
    texto: "Por fim, limpar. O botão limpar feitas pergunta antes, e diz quantas tarefas vão embora, porque não há como desfazer.",
  },
  { id: "fim", texto: "Só o que estava feito foi removido. O que falta continua à vista. Esse é o fluxo do pitch." },
];

// Vozes em português do macOS, da preferida para a de reserva.
export const VOZES_MACOS = ["Luciana (Enhanced)", "Luciana"];

// Sem áudio, a duração de cada trecho é estimada pelo número de palavras (fala calma, em português).
export const PALAVRAS_POR_SEGUNDO = 2.4;
export const duracaoEstimada = (texto: string): number => texto.split(/\s+/).filter(Boolean).length / PALAVRAS_POR_SEGUNDO;
