import { describe, expect, it } from "vitest";
import { aplicarMovimento, contar, idsParaLimpar, ordenar, TITULO_MAX, validarTitulo } from "./rules";
import { montarQuadro } from "./board";
import type { Tarefa } from "./types";

const t = (id: string, etapa: Tarefa["etapa"], criadaEm: string, concluidaEm: string | null = null): Tarefa => ({
  id,
  titulo: `Tarefa ${id}`,
  etapa,
  criadaEm,
  concluidaEm,
});

describe("validarTitulo", () => {
  it("normaliza os espaços", () => {
    expect(validarTitulo("  regar   as plantas ")).toEqual({ ok: true, valor: "regar as plantas" });
  });
  it("recusa título vazio ou só com espaços", () => {
    expect(validarTitulo("   ")).toMatchObject({ ok: false, codigo: "invalida" });
  });
  it("recusa título acima do limite e aceita o limite exato", () => {
    expect(validarTitulo("a".repeat(TITULO_MAX + 1))).toMatchObject({ ok: false });
    expect(validarTitulo("a".repeat(TITULO_MAX))).toMatchObject({ ok: true });
  });
});

describe("aplicarMovimento", () => {
  const agora = "2026-10-26T10:00:00.000Z";
  it("conclui: vai para Feito e guarda quando", () => {
    const r = aplicarMovimento(t("1", "a-fazer", "2026-10-25T09:00:00.000Z"), "feito", agora);
    expect(r).toMatchObject({ ok: true, valor: { etapa: "feito", concluidaEm: agora } });
  });
  it("reabre: volta para A fazer e limpa a data de conclusão", () => {
    const r = aplicarMovimento(t("1", "feito", "2026-10-25T09:00:00.000Z", agora), "a-fazer", agora);
    expect(r).toMatchObject({ ok: true, valor: { etapa: "a-fazer", concluidaEm: null } });
  });
  it("recusa mover para a etapa em que já está", () => {
    expect(aplicarMovimento(t("1", "feito", "2026-10-25T09:00:00.000Z", agora), "feito", agora)).toMatchObject({ ok: false });
  });
});

describe("limpar feitas", () => {
  const tarefas = [t("1", "a-fazer", "2026-10-25T09:00:00.000Z"), t("2", "feito", "2026-10-25T10:00:00.000Z", "2026-10-26T08:00:00.000Z"), t("3", "feito", "2026-10-25T11:00:00.000Z", "2026-10-26T09:00:00.000Z")];
  it("só remove as que estão em Feito", () => {
    expect(idsParaLimpar(tarefas)).toEqual(["2", "3"]);
  });
  it("não remove nada quando não há tarefas feitas", () => {
    expect(idsParaLimpar([t("1", "a-fazer", "2026-10-25T09:00:00.000Z")])).toEqual([]);
  });
});

describe("quadro", () => {
  const tarefas = [
    t("velha", "a-fazer", "2026-10-20T09:00:00.000Z"),
    t("nova", "a-fazer", "2026-10-25T09:00:00.000Z"),
    t("antiga-feita", "feito", "2026-10-19T09:00:00.000Z", "2026-10-21T09:00:00.000Z"),
    t("recente-feita", "feito", "2026-10-19T10:00:00.000Z", "2026-10-26T09:00:00.000Z"),
  ];
  it("conta por etapa", () => {
    expect(contar(tarefas)).toEqual({ "a-fazer": 2, feito: 2 });
  });
  it("ordena: A fazer pelas mais antigas, Feito pelas concluídas mais recentemente", () => {
    expect(ordenar(tarefas).map((x) => x.id)).toEqual(["velha", "nova", "recente-feita", "antiga-feita"]);
  });
  it("monta o quadro com as duas etapas e os totais", () => {
    const q = montarQuadro(tarefas);
    expect(q.etapas.map((e) => e.id)).toEqual(["a-fazer", "feito"]);
    expect(q.totais).toEqual({ "a-fazer": 2, feito: 2 });
  });
});
