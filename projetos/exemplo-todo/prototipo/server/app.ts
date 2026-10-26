import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { Resultado, StageId, TodoGateway } from "../src/domain";

async function corpo(req: IncomingMessage): Promise<Record<string, unknown>> {
  const partes: Buffer[] = [];
  for await (const p of req) partes.push(p as Buffer);
  const texto = Buffer.concat(partes).toString("utf8");
  return texto ? (JSON.parse(texto) as Record<string, unknown>) : {};
}

function json(res: ServerResponse, status: number, dados: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(dados));
}

/** Traduz um resultado do domínio para o status HTTP. */
function responder<T>(res: ServerResponse, r: Resultado<T>, statusOk = 200): void {
  if (r.ok) return json(res, statusOk, r);
  return json(res, r.codigo === "nao-encontrada" ? 404 : 422, r);
}

/** API HTTP mínima sobre o contrato `TodoGateway`. Não conhece SQLite. */
export function criarServidor(gateway: TodoGateway): Server {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      const partes = url.pathname.split("/").filter(Boolean);
      if (partes[0] !== "api") return json(res, 404, { erro: "Não encontrado." });

      if (req.method === "GET" && partes[1] === "quadro" && partes.length === 2) return json(res, 200, await gateway.quadro());

      if (req.method === "POST" && partes[1] === "tarefas" && partes.length === 2) {
        const b = await corpo(req);
        return responder(res, await gateway.criar(String(b.titulo ?? "")), 201);
      }

      if (req.method === "POST" && partes[1] === "tarefas" && partes[2] && partes[3] === "mover") {
        const b = await corpo(req);
        return responder(res, await gateway.mover(partes[2], b.para as StageId));
      }

      if (req.method === "POST" && partes[1] === "feitas" && partes[2] === "limpar") {
        return json(res, 200, await gateway.limparFeitas());
      }

      if (req.method === "POST" && partes[1] === "reset" && partes.length === 2) {
        await gateway.reiniciarDadosDeExemplo();
        return json(res, 200, { ok: true });
      }

      return json(res, 404, { erro: "Não encontrado." });
    } catch (e) {
      return json(res, 500, { erro: e instanceof Error ? e.message : "Erro interno." });
    }
  });
}
