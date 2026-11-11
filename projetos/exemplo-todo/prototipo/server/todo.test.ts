import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { STAGES } from "../src/domain";
import { request } from "node:http";
import { criarServidor, LIMITE_CORPO } from "./app";
import { EXEMPLOS } from "./sample";
import { SqliteTodoRepository } from "./sqliteRepository";

const AGORA = "2026-10-26T10:00:00.000Z";
let repo: SqliteTodoRepository;

beforeEach(() => {
  repo = new SqliteTodoRepository(":memory:", () => AGORA);
  repo.semearSeVazio();
});
afterEach(() => repo.close());

describe("dados de exemplo", () => {
  it("só semeia uma vez e cobre as duas etapas", async () => {
    expect(repo.semearSeVazio()).toBe(false);
    const q = await repo.quadro();
    expect(q.tarefas).toHaveLength(EXEMPLOS.length);
    for (const e of STAGES) expect(q.totais[e.id]).toBeGreaterThan(0);
  });
});

describe("criar e mover", () => {
  it("cria na etapa A fazer, com o título normalizado", async () => {
    const r = await repo.criar("  nova   tarefa ");
    expect(r).toMatchObject({ ok: true, valor: { titulo: "nova tarefa", etapa: "a-fazer", concluidaEm: null } });
    expect((await repo.quadro()).totais["a-fazer"]).toBe(EXEMPLOS.filter((e) => e.etapa === "a-fazer").length + 1);
  });

  it("não cria tarefa sem título", async () => {
    expect(await repo.criar("   ")).toMatchObject({ ok: false, codigo: "invalida" });
  });

  it("conclui e reabre uma tarefa", async () => {
    const q = await repo.quadro();
    const a = q.tarefas.find((t) => t.etapa === "a-fazer")!;
    expect(await repo.mover(a.id, "feito")).toMatchObject({ ok: true, valor: { etapa: "feito", concluidaEm: AGORA } });
    expect(await repo.mover(a.id, "a-fazer")).toMatchObject({ ok: true, valor: { etapa: "a-fazer", concluidaEm: null } });
  });

  it("recusa mover uma tarefa que não existe", async () => {
    expect(await repo.mover("nao-existe", "feito")).toMatchObject({ ok: false, codigo: "nao-encontrada" });
  });
});

describe("limpar feitas", () => {
  it("remove só as feitas e diz quantas", async () => {
    const antes = await repo.quadro();
    const feitas = antes.totais.feito;
    const r = await repo.limparFeitas();
    expect(r.removidas).toBe(feitas);
    const depois = await repo.quadro();
    expect(depois.totais.feito).toBe(0);
    expect(depois.totais["a-fazer"]).toBe(antes.totais["a-fazer"]);
  });

  it("não faz nada quando não há feitas", async () => {
    await repo.limparFeitas();
    expect(await repo.limparFeitas()).toEqual({ removidas: 0 });
  });

  it("reiniciar volta aos dados de exemplo", async () => {
    await repo.limparFeitas();
    await repo.reiniciarDadosDeExemplo();
    expect((await repo.quadro()).tarefas).toHaveLength(EXEMPLOS.length);
  });
});

describe("API HTTP", () => {
  let servidor: Server;
  let base: string;
  let porta: number;

  beforeEach(async () => {
    servidor = criarServidor(repo);
    await new Promise<void>((ok) => servidor.listen(0, "127.0.0.1", ok));
    porta = (servidor.address() as AddressInfo).port;
    base = `http://127.0.0.1:${porta}/api`;
  });
  afterEach(() => new Promise<void>((ok) => servidor.close(() => ok())));

  const JSON_HEADERS = { "content-type": "application/json" };
  const post = (caminho: string, corpo: unknown = {}) =>
    fetch(base + caminho, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(corpo) });

  it("devolve o quadro", async () => {
    const q = (await (await fetch(`${base}/quadro`)).json()) as { tarefas: unknown[] };
    expect(q.tarefas).toHaveLength(EXEMPLOS.length);
  });

  it("responde 201 ao criar e 422 ao criar sem título", async () => {
    expect((await post("/tarefas", { titulo: "Ligar para a gráfica" })).status).toBe(201);
    expect((await post("/tarefas", { titulo: "" })).status).toBe(422);
  });

  it("responde 404 ao mover uma tarefa que não existe", async () => {
    expect((await post("/tarefas/xyz/mover", { para: "feito" })).status).toBe(404);
  });

  it("limpa as feitas e informa quantas", async () => {
    const r = (await (await post("/feitas/limpar")).json()) as { removidas: number };
    expect(r.removidas).toBe(EXEMPLOS.filter((e) => e.etapa === "feito").length);
  });

  it("recusa POST sem application/json (chamada vinda de outro site) e não mexe nos dados", async () => {
    const r = await fetch(`${base}/feitas/limpar`, { method: "POST", headers: { "content-type": "text/plain" }, body: "{}" });
    expect(r.status).toBe(415);
    const q = (await (await fetch(`${base}/quadro`)).json()) as { tarefas: unknown[] };
    expect(q.tarefas).toHaveLength(EXEMPLOS.length);
  });

  it("recusa um Host que não é localhost (DNS rebinding)", async () => {
    const status = await new Promise<number>((ok, falha) => {
      const req = request({ host: "127.0.0.1", port: porta, path: "/api/quadro", headers: { host: "exemplo.com" } }, (res) => {
        res.resume();
        ok(res.statusCode ?? 0);
      });
      req.on("error", falha);
      req.end();
    });
    expect(status).toBe(403);
  });

  it("recusa corpo grande demais e JSON inválido", async () => {
    expect((await post("/tarefas", { titulo: "x".repeat(LIMITE_CORPO) })).status).toBe(413);
    const quebrado = await fetch(`${base}/tarefas`, { method: "POST", headers: JSON_HEADERS, body: "{" });
    expect(quebrado.status).toBe(400);
  });
});
