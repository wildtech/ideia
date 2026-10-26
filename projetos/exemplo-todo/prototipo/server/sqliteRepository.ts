import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import {
  aplicarMovimento,
  idsParaLimpar,
  montarQuadro,
  STAGES,
  validarTitulo,
  type QuadroData,
  type Resultado,
  type StageId,
  type Tarefa,
  type TodoGateway,
} from "../src/domain";
import { EXEMPLOS } from "./sample";

const ETAPAS = STAGES.map((s) => `'${s.id}'`).join(",");

const SCHEMA = `
create table if not exists tarefas (
  id text primary key,
  titulo text not null,
  etapa text not null check (etapa in (${ETAPAS})),
  criada_em text not null,
  concluida_em text
);
create index if not exists idx_tarefas_etapa on tarefas(etapa);
`;

type Row = Record<string, unknown>;

const toTarefa = (r: Row): Tarefa => ({
  id: r.id as string,
  titulo: r.titulo as string,
  etapa: r.etapa as StageId,
  criadaEm: r.criada_em as string,
  concluidaEm: (r.concluida_em as string | null) ?? null,
});

/** Implementação do contrato `TodoGateway` sobre SQLite (`node:sqlite`, embutido no Node). */
export class SqliteTodoRepository implements TodoGateway {
  private db: DatabaseSync;

  constructor(
    caminho: string,
    private agora: () => string = () => new Date().toISOString(),
  ) {
    this.db = new DatabaseSync(caminho);
    this.db.exec(SCHEMA);
  }

  close(): void {
    this.db.close();
  }

  private todas(): Tarefa[] {
    return (this.db.prepare("select * from tarefas").all() as Row[]).map(toTarefa);
  }

  private buscar(id: string): Tarefa | null {
    const r = this.db.prepare("select * from tarefas where id = ?").get(id) as Row | undefined;
    return r ? toTarefa(r) : null;
  }

  /** Cria os dados de exemplo (fictícios) se o banco estiver vazio. Devolve `true` se semeou. */
  semearSeVazio(): boolean {
    const { n } = this.db.prepare("select count(*) as n from tarefas").get() as { n: number };
    if (n > 0) return false;
    const base = Date.parse(this.agora());
    const inserir = this.db.prepare("insert into tarefas (id, titulo, etapa, criada_em, concluida_em) values (?, ?, ?, ?, ?)");
    EXEMPLOS.forEach((e, i) => {
      const criada = new Date(base - (EXEMPLOS.length - i) * 3_600_000).toISOString();
      inserir.run(randomUUID(), e.titulo, e.etapa, criada, e.etapa === "feito" ? new Date(base - i * 60_000).toISOString() : null);
    });
    return true;
  }

  async quadro(): Promise<QuadroData> {
    return montarQuadro(this.todas());
  }

  async criar(titulo: string): Promise<Resultado<Tarefa>> {
    const v = validarTitulo(titulo);
    if (!v.ok) return v;
    const tarefa: Tarefa = { id: randomUUID(), titulo: v.valor, etapa: "a-fazer", criadaEm: this.agora(), concluidaEm: null };
    this.db
      .prepare("insert into tarefas (id, titulo, etapa, criada_em, concluida_em) values (?, ?, ?, ?, ?)")
      .run(tarefa.id, tarefa.titulo, tarefa.etapa, tarefa.criadaEm, null);
    return { ok: true, valor: tarefa };
  }

  async mover(id: string, para: StageId): Promise<Resultado<Tarefa>> {
    const atual = this.buscar(id);
    if (!atual) return { ok: false, erro: "Tarefa não encontrada.", codigo: "nao-encontrada" };
    const r = aplicarMovimento(atual, para, this.agora());
    if (!r.ok) return r;
    this.db.prepare("update tarefas set etapa = ?, concluida_em = ? where id = ?").run(r.valor.etapa, r.valor.concluidaEm, id);
    return r;
  }

  async limparFeitas(): Promise<{ removidas: number }> {
    const ids = idsParaLimpar(this.todas());
    const apagar = this.db.prepare("delete from tarefas where id = ?");
    for (const id of ids) apagar.run(id);
    return { removidas: ids.length };
  }

  async reiniciarDadosDeExemplo(): Promise<void> {
    this.db.exec("delete from tarefas");
    this.semearSeVazio();
  }
}
