import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { Resultado, StageId, TodoGateway } from "../src/domain";

/** Só aceita chamadas feitas a este computador: protege contra páginas de outros sites (DNS rebinding). */
const HOSTS_PERMITIDOS = new Set(["localhost", "127.0.0.1", "[::1]"]);
/** Tamanho máximo do corpo de uma requisição. As chamadas da tela têm poucas centenas de bytes. */
export const LIMITE_CORPO = 16 * 1024;

class ErroHttp extends Error {
  constructor(readonly status: number, mensagem: string) {
    super(mensagem);
  }
}

function hostPermitido(req: IncomingMessage): boolean {
  const host = req.headers.host;
  if (!host) return false;
  const nome = host.startsWith("[") ? host.slice(0, host.indexOf("]") + 1) : host.split(":")[0]!;
  return HOSTS_PERMITIDOS.has(nome.toLowerCase());
}

async function corpo(req: IncomingMessage): Promise<Record<string, unknown>> {
  // Exigir JSON obriga o navegador a pedir permissão (CORS) antes de uma chamada vinda de outro site,
  // e esta API não concede essa permissão.
  const tipo = (req.headers["content-type"] ?? "").toLowerCase();
  if (!tipo.startsWith("application/json")) throw new ErroHttp(415, "Envie o corpo como application/json.");
  const partes: Buffer[] = [];
  let tamanho = 0;
  for await (const p of req) {
    tamanho += (p as Buffer).length;
    if (tamanho > LIMITE_CORPO) throw new ErroHttp(413, "Corpo grande demais.");
    partes.push(p as Buffer);
  }
  const texto = Buffer.concat(partes).toString("utf8");
  if (!texto) return {};
  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    throw new ErroHttp(400, "JSON inválido.");
  }
  if (typeof dados !== "object" || dados === null || Array.isArray(dados)) throw new ErroHttp(400, "O corpo deve ser um objeto JSON.");
  return dados as Record<string, unknown>;
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

/**
 * API HTTP mínima sobre o contrato `TodoGateway`. Não conhece SQLite.
 * É um protótipo, sem login: por isso só escuta em localhost (ver server/index.ts) e recusa chamadas de outros sites.
 */
export function criarServidor(gateway: TodoGateway): Server {
  return createServer(async (req, res) => {
    try {
      if (!hostPermitido(req)) return json(res, 403, { erro: "Acesso permitido só por localhost." });
      const url = new URL(req.url ?? "/", "http://localhost");
      const partes = url.pathname.split("/").filter(Boolean);
      if (partes[0] !== "api") return json(res, 404, { erro: "Não encontrado." });

      if (req.method === "GET" && partes[1] === "quadro" && partes.length === 2) return json(res, 200, await gateway.quadro());

      if (req.method === "POST" && partes[1] === "tarefas" && partes.length === 2) {
        const b = await corpo(req);
        return responder(res, await gateway.criar(typeof b.titulo === "string" ? b.titulo : ""), 201);
      }

      if (req.method === "POST" && partes[1] === "tarefas" && partes[2] && partes[3] === "mover" && partes.length === 4) {
        const b = await corpo(req);
        return responder(res, await gateway.mover(partes[2], b.para as StageId));
      }

      if (req.method === "POST" && partes[1] === "feitas" && partes[2] === "limpar" && partes.length === 3) {
        await corpo(req);
        return json(res, 200, await gateway.limparFeitas());
      }

      if (req.method === "POST" && partes[1] === "reset" && partes.length === 2) {
        await corpo(req);
        await gateway.reiniciarDadosDeExemplo();
        return json(res, 200, { ok: true });
      }

      return json(res, 404, { erro: "Não encontrado." });
    } catch (e) {
      if (e instanceof ErroHttp) return json(res, e.status, { erro: e.message });
      console.error(e);
      return json(res, 500, { erro: "Erro interno." });
    }
  });
}
