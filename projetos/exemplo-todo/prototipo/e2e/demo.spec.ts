import { expect, test, type Locator, type Page } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { duracaoEstimada, NARRACAO } from "./narracao";
import { instalarOverlay, legenda } from "./overlay";

// A jornada principal, narrada, para virar vídeo de demonstração (npm run demo). Cada trecho da narração começa junto
// com um passo da jornada, e a jornada espera o trecho terminar antes de seguir. Os instantes ficam em demo/marcas.json,
// e o scripts/montar-video.ts usa isso para pôr a voz no lugar certo.
//
// Sincronia: antes do primeiro trecho, a página pisca uma faixa magenta no topo. O montar-video.ts acha esse quadro no vídeo
// e conta todos os instantes a partir dele (o vídeo do Playwright começa antes da jornada e termina depois, então não dá
// para ancorar nas pontas). A faixa é cortada do vídeo final.

const API = "http://localhost:3101/api";
const PAUSA_ENTRE_TRECHOS_MS = 700;

test.setTimeout(180_000);

const aFazer = (page: Page) => page.getByRole("region", { name: /A fazer/ });
const feito = (page: Page) => page.getByRole("region", { name: /Feito/ });

/** Leva o cursor até o elemento, espera o olho acompanhar e só então clica. */
async function clicar(page: Page, alvo: Locator) {
  await alvo.hover();
  await page.waitForTimeout(500);
  await alvo.click();
}

test("demo narrada: anotar, concluir e limpar o que está feito", async ({ page, request }) => {
  // O projeto "demo-vertical" roda esta mesma jornada em 9:16; os arquivos dele levam o sufixo "-vertical".
  const variante = test.info().project.name === "demo-vertical" ? "-vertical" : "";
  mkdirSync("demo", { recursive: true });
  const tempos: Record<string, { segundos: number }> = existsSync("demo/tempos.json") ? JSON.parse(readFileSync("demo/tempos.json", "utf8")) : {};

  await request.post(`${API}/reset`, { data: {} });
  await page.addInitScript(instalarOverlay);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Lista de tarefas" })).toBeVisible();

  // Marca de sincronia: a faixa magenta é o "tempo zero" da jornada.
  await page.evaluate(() => {
    const m = document.createElement("div");
    m.id = "demo-sync";
    m.style.cssText = "position:fixed;left:0;top:0;width:100%;height:16px;background:#ff00ff;z-index:2147483647";
    document.body.appendChild(m);
  });
  const t0 = Date.now();
  const passos: Record<string, number> = {};
  await page.waitForTimeout(500);
  await page.evaluate(() => document.getElementById("demo-sync")?.remove());
  await page.waitForTimeout(400);

  /** Começa um trecho: mostra a legenda, faz a ação e espera o trecho terminar. */
  async function narrar(id: string, acao?: () => Promise<void>) {
    const trecho = NARRACAO.find((t) => t.id === id);
    if (!trecho) throw new Error(`Trecho sem texto: ${id}`);
    passos[id] = Date.now() - t0;
    await legenda(page, trecho.texto);
    const inicio = Date.now();
    if (acao) await acao();
    const segundos = tempos[id]?.segundos ?? duracaoEstimada(trecho.texto);
    const falta = segundos * 1000 + PAUSA_ENTRE_TRECHOS_MS - (Date.now() - inicio);
    if (falta > 0) await page.waitForTimeout(falta);
  }

  await narrar("cenario");

  await narrar("prototipo", async () => {
    await aFazer(page).hover();
    await page.waitForTimeout(1200);
    await feito(page).hover();
  });

  await narrar("anotar", async () => {
    await page.getByLabel("O que precisa ser feito?").hover();
    await page.waitForTimeout(500);
    await page.getByLabel("O que precisa ser feito?").pressSequentially("Revisar os slides", { delay: 110 });
    await clicar(page, page.getByRole("button", { name: "Adicionar" }));
    await expect(aFazer(page).getByText("Revisar os slides")).toBeVisible();
  });

  await narrar("andar", async () => {
    await clicar(page, page.getByRole("button", { name: "Concluir: Revisar os slides" }));
    await expect(feito(page).getByText("Revisar os slides")).toBeVisible();
  });

  await narrar("limpar", async () => {
    const feitas = await feito(page).getByRole("listitem").count();
    const pergunta = `Remover ${feitas} tarefas feitas? Isso não pode ser desfeito.`;
    await page.getByRole("button", { name: "Limpar feitas" }).hover();
    await page.waitForTimeout(1500);
    // A caixa de confirmação do navegador não aparece no vídeo; por isso a pergunta vai na legenda.
    await legenda(page, `A confirmação pergunta: “${pergunta}”`);
    await page.waitForTimeout(2500);
    page.once("dialog", (d) => {
      expect(d.message()).toBe(pergunta);
      void d.accept();
    });
    await page.getByRole("button", { name: "Limpar feitas" }).click();
    await expect(feito(page).getByText("Nada feito ainda.")).toBeVisible();
    await legenda(page, NARRACAO.find((t) => t.id === "limpar")!.texto);
  });

  await narrar("fim", async () => {
    await expect(aFazer(page).getByRole("listitem")).toHaveCount(5);
  });
  await legenda(page, "");

  // `passos` são os instantes (em ms, contados a partir da faixa magenta) em que cada trecho da narração começou.
  writeFileSync(`demo/marcas${variante}.json`,JSON.stringify({ fimMs: Date.now() - t0, passos }, null, 2));
});
