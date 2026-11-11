import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { criarServidor } from "./app";
import { SqliteTodoRepository } from "./sqliteRepository";

const caminho = process.env.DB_PATH ?? "data/todo.db";
const porta = Number(process.env.PORT ?? 3001);
// Só neste computador: a API não tem login, então não pode ficar aberta para a rede.
const host = "127.0.0.1";

mkdirSync(dirname(caminho), { recursive: true });
const repo = new SqliteTodoRepository(caminho);
if (repo.semearSeVazio()) console.log("Banco vazio: dados de exemplo (fictícios) criados.");

criarServidor(repo).listen(porta, host, () => console.log(`API em http://localhost:${porta} (banco: ${caminho})`));
