// O roteiro da narração do vídeo de demonstração. Vem do Markdown do vídeo (../exemplo-todo-video.md, ou o arquivo da
// variável VIDEO_MD): cada cena com "> Narração:" é um trecho, e o mesmo texto vira a legenda e a voz.
// As cenas com "**Cena:** jornada" são gravadas pelo Playwright (e2e/demo.spec.ts); as outras são cartões animados,
// montados pelo tools/md2video.js. O cenário vem do "Problema" do pitch (exemplo-todo.md) e é fictício.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface Trecho {
  id: string;
  texto: string;
  /** O título da cena: na jornada, aparece no canto da tela (por exemplo, "1. Anotar"). */
  titulo: string;
  tipo: "cartao" | "jornada";
  /** Na jornada, quanto a tela se aproxima do que está sendo feito (1 é sem zoom). */
  zoom: number;
}

/** O mesmo "slug" do tools/cards/motor.js: sem acentos, em minúsculas, com hífen. */
const slug = (t: string): string =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function arquivoDoVideo(): string {
  if (process.env.VIDEO_MD) return process.env.VIDEO_MD;
  const md = readdirSync("..").find((f) => f.endsWith("-video.md"));
  if (!md) throw new Error("Não achei o Markdown do vídeo (../<projeto>-video.md). Defina VIDEO_MD com o caminho.");
  return join("..", md);
}

/** Lê as cenas do Markdown do vídeo. Só interessa o que a narração e a jornada usam; o resto é do md2video.js. */
export function lerCenas(md: string): Trecho[] {
  const cenas: Trecho[] = [];
  for (const bloco of md.replace(/\r/g, "").split(/^(?=#{1}\s|#{3}\s)/m)) {
    const titulo = bloco.match(/^#{1,3}\s+(.*)$/m)?.[1]?.replace(/\*\*/g, "").trim();
    if (!titulo) continue;
    const diretiva = (nome: string) => bloco.match(new RegExp(`^\\*\\*${nome}:\\*\\*\\s*(.+?)\\s*$`, "m"))?.[1];
    const narracao = bloco.match(/^>\s*\*{0,2}Narração:\*{0,2}\s*(.*(?:\n>(?!\s*\*{0,2}\w+:).*)*)/m)?.[1];
    if (diretiva("Oculto") === "sim") continue;
    cenas.push({
      id: diretiva("Trecho") ?? slug(titulo),
      titulo,
      texto: narracao ? narracao.replace(/\n>\s?/g, " ").trim() : "",
      tipo: diretiva("Cena")?.toLowerCase() === "jornada" ? "jornada" : "cartao",
      zoom: Number((diretiva("Zoom") ?? "1").replace(",", ".")) || 1,
    });
  }
  return cenas;
}

const CENAS = existsSync(arquivoDoVideo()) ? lerCenas(readFileSync(arquivoDoVideo(), "utf8")) : [];

/** Os trechos com voz (cartões e jornada), na ordem do vídeo. */
export const NARRACAO: readonly Trecho[] = CENAS.filter((c) => c.texto);
/** As cenas da jornada, na ordem em que o Playwright as grava. */
export const JORNADA: readonly Trecho[] = CENAS.filter((c) => c.tipo === "jornada");

// Vozes em português do macOS, da preferida para a de reserva.
export const VOZES_MACOS = ["Luciana (Enhanced)", "Luciana"];

// Sem áudio, a duração de cada trecho é estimada pelo número de palavras (fala calma, em português).
export const PALAVRAS_POR_SEGUNDO = 2.4;
export const duracaoEstimada = (texto: string): number => texto.split(/\s+/).filter(Boolean).length / PALAVRAS_POR_SEGUNDO;
