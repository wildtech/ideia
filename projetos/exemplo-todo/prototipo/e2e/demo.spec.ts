import { expect, test, type Locator, type Page } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { duracaoEstimada, JORNADA, type Trecho } from "./narracao";
import { focar, instalarOverlay, legenda, passo } from "./overlay";

// A jornada principal, narrada, para virar vídeo de demonstração (npm run demo). As cenas vêm do Markdown do vídeo
// (../exemplo-todo-video.md, as que têm "**Cena:** jornada"), na ordem dele: cada uma começa com a legenda e o nome do
// passo, faz a ação daquele trecho (ACOES, abaixo) com zoom no que está sendo feito e espera a voz terminar.
// Os instantes ficam em demo/marcas.json, e o scripts/montar-video.ts usa isso para pôr a voz no lugar certo e para
// dizer ao tools/md2video.js onde começa cada cena.
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

/** O que a pessoa faz em cada trecho da jornada. `zoom` é a escala pedida no Markdown (1 é sem zoom). */
type Acao = (page: Page, zoom: number) => Promise<void>;
const ACOES: Record<string, Acao> = {
  prototipo: async (page) => {
    await aFazer(page).hover();
    await page.waitForTimeout(1200);
    await feito(page).hover();
  },
  anotar: async (page, zoom) => {
    const campo = page.getByLabel("O que precisa ser feito?");
    await focar(page, [campo, page.getByRole("button", { name: "Adicionar" })], zoom);
    await campo.hover();
    await page.waitForTimeout(500);
    await campo.pressSequentially("Revisar os slides", { delay: 110 });
    await clicar(page, page.getByRole("button", { name: "Adicionar" }));
    await expect(aFazer(page).getByText("Revisar os slides")).toBeVisible();
    await focar(page, [aFazer(page).getByRole("listitem").last()], zoom);
  },
  andar: async (page, zoom) => {
    await focar(page, [aFazer(page).getByRole("listitem").last(), feito(page).getByRole("heading")], zoom);
    await clicar(page, page.getByRole("button", { name: "Concluir: Revisar os slides" }));
    await expect(feito(page).getByText("Revisar os slides")).toBeVisible();
  },
  limpar: async (page, zoom) => {
    const feitas = await feito(page).getByRole("listitem").count();
    const pergunta = `Remover ${feitas} tarefas feitas? Isso não pode ser desfeito.`;
    await focar(page, [feito(page)], zoom);
    await page.getByRole("button", { name: "Limpar feitas" }).hover();
    await page.waitForTimeout(1500);
    // A caixa de confirmação do navegador não aparece no vídeo; por isso a pergunta vai na legenda.
    const texto = await page.locator("#demo-legenda").innerText();
    await legenda(page, `A confirmação pergunta: “${pergunta}”`);
    await page.waitForTimeout(2500);
    page.once("dialog", (d) => {
      expect(d.message()).toBe(pergunta);
      void d.accept();
    });
    await page.getByRole("button", { name: "Limpar feitas" }).click();
    await expect(feito(page).getByText("Nada feito ainda.")).toBeVisible();
    await legenda(page, texto);
  },
  fim: async (page) => {
    await expect(aFazer(page).getByRole("listitem")).toHaveCount(5);
  },
};

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

  /** Começa uma cena: mostra o passo e a legenda, faz a ação e espera a voz terminar. */
  async function cena(trecho: Trecho) {
    passos[trecho.id] = Date.now() - t0;
    const segundos = tempos[trecho.id]?.segundos ?? duracaoEstimada(trecho.texto || "");
    await focar(page, [], 1);
    await passo(page, trecho.titulo);
    await legenda(page, trecho.texto, segundos);
    const inicio = Date.now();
    const acao = ACOES[trecho.id];
    // No 9:16 a tela já é a de um celular, e o zoom só cortaria a interface.
    if (acao) await acao(page, variante ? 1 : trecho.zoom);
    else console.warn(`Aviso: o trecho "${trecho.id}" não tem ação em e2e/demo.spec.ts; a cena só mostra a tela.`);
    const falta = segundos * 1000 + PAUSA_ENTRE_TRECHOS_MS - (Date.now() - inicio);
    if (falta > 0) await page.waitForTimeout(falta);
  }

  if (!JORNADA.length) throw new Error("O Markdown do vídeo não tem cenas de jornada (**Cena:** jornada).");
  for (const trecho of JORNADA) await cena(trecho);
  await focar(page, [], 1);
  await passo(page, "");
  await legenda(page, "");

  // `passos` são os instantes (em ms, contados a partir da faixa magenta) em que cada trecho da narração começou.
  writeFileSync(`demo/marcas${variante}.json`, JSON.stringify({ fimMs: Date.now() - t0, passos }, null, 2));
});
