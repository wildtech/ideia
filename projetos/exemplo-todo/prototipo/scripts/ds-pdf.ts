// O design system em PDF (npm run ds:pdf), para compartilhar: imprime o catálogo /ds em ../out/<projeto>-design-system.pdf.
//
// O catálogo só existe no desenvolvimento, então este script sobe o Vite numa porta só dele, abre o /ds no Chrome e
// imprime em A4 deitado, com as cores. Um cabeçalho diz de onde vem (o tema do projeto) e quando foi gerado. Como os
// outros PDFs do out/, é uma saída descartável: a fonte da verdade é o tema (src/tokens.css é gerado dele) e o src/ui/.
// Refaça quando o tema ou os componentes mudarem.

import { mkdirSync, readFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const RAIZ = resolve(import.meta.dirname, "..");
const PROJETO = resolve(RAIZ, "..");
const PORTA = 5293;

const projeto = JSON.parse(readFileSync(join(PROJETO, "projeto.json"), "utf8")) as { nome?: string; tema?: string };
const nome = basename(PROJETO);
const saida = join(PROJETO, "out", `${nome}-design-system.pdf`);
const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const servidor = await createServer({ root: RAIZ, server: { port: PORTA, strictPort: true }, logLevel: "error" });
await servidor.listen();
const navegador = await chromium.launch({ channel: "chrome" });
try {
  const pagina = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
  await pagina.goto(`http://localhost:${PORTA}/ds`, { waitUntil: "networkidle" });
  await pagina.getByRole("heading", { name: "Design system", level: 1 }).waitFor();

  // O cabeçalho do documento: o que é, de que tema vem e quando foi gerado. Só no PDF; o /ds não muda.
  await pagina.evaluate(
    ({ titulo, tema, data }) => {
      const topo = document.createElement("p");
      topo.className = "ds-pdf-topo";
      topo.textContent = `${titulo} · tema "${tema}" · gerado em ${data} a partir do catálogo /ds (src/tokens.css e src/ui/)`;
      document.body.prepend(topo);
      const estilo = document.createElement("style");
      estilo.textContent = `
        .ds-pdf-topo { margin: 0 0 12px; font-size: 11px; color: var(--suave); }
        @page { size: A4 landscape; margin: 12mm; }
        section, .ds-camada, table, tr, figure { break-inside: avoid; }
        h2 { break-after: avoid; }
      `;
      document.head.append(estilo);
    },
    { titulo: projeto.nome ?? nome, tema: projeto.tema ?? "(?)", data: hoje },
  );

  mkdirSync(join(PROJETO, "out"), { recursive: true });
  await pagina.pdf({ path: saida, printBackground: true, preferCSSPageSize: true });
  console.log(`Gerado: ${relative(process.cwd(), saida)}`);
} finally {
  await navegador.close();
  await servidor.close();
}
