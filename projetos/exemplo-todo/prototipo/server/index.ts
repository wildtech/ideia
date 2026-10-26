import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { criarServidor } from "./app";
import { SqliteTodoRepository } from "./sqliteRepository";

const caminho = process.env.DB_PATH ?? "data/todo.db";
const porta = Number(process.env.PORT ?? 3001);

mkdirSync(dirname(caminho), { recursive: true });
const repo = new SqliteTodoRepository(caminho);
if (repo.semearSeVazio()) console.log("Banco vazio: dados de exemplo (fictícios) criados.");

criarServidor(repo).listen(porta, () => console.log(`API em http://localhost:${porta} (banco: ${caminho})`));
