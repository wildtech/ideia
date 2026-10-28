import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

// Refaz as capturas de tela usadas nos slides (../imagens). Rode com `npm run capturas`.
// As imagens são insumo da apresentação e ficam versionadas.

const API = "http://localhost:3101/api";
const PASTA = "../imagens";

test("capturas do fluxo para os slides", async ({ page, request }) => {
  // No projeto "capturas-mobile" (tela de celular) as imagens levam o sufixo "-mobile" e mostram a página inteira rolada,
  // porque no layout estreito as duas colunas ficam uma embaixo da outra.
  const mobile = test.info().project.name === "capturas-mobile";
  const sufixo = mobile ? "-mobile" : "";
  await request.post(`${API}/reset`, { data: {} });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Lista de tarefas" })).toBeVisible();
  // Tira o ponteiro do caminho antes de cada foto, para nenhum botão aparecer no estado de "hover".
  const foto = async (nome: string) => {
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `${PASTA}/${nome}${sufixo}.png`, fullPage: mobile });
  };

  await foto("01-quadro-inicial");

  await page.getByLabel("O que precisa ser feito?").fill("Revisar os slides");
  await page.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByText("Revisar os slides")).toBeVisible();
  await foto("02-tarefa-nova");

  await page.getByRole("button", { name: "Concluir: Escrever o pitch" }).click();
  await expect(page.getByRole("region", { name: /Feito/ }).getByText("Escrever o pitch")).toBeVisible();
  await foto("03-tarefa-concluida");

  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "Limpar feitas" }).click();
  await expect(page.getByText("Nada feito ainda.")).toBeVisible();
  await foto("04-feitas-limpas");
});

test("captura do catálogo do design system", async ({ page }) => {
  await page.goto("/ds");
  await expect(page.getByRole("heading", { name: "Design system" })).toBeVisible();
  await page.mouse.move(0, 0);
  const mobile = test.info().project.name === "capturas-mobile";
  await page.screenshot({ path: `${PASTA}/05-design-system${mobile ? "-mobile" : ""}.png`, fullPage: true });
});

// Três telas de celular lado a lado (a jornada anotar, andar e limpar), em uma imagem de fundo transparente, para um
// slide. Parte das capturas de celular (`npm run capturas:mobile`), que ficam versionadas em ../imagens.
// O topo do catálogo, no formato da metade direita de um slide (imagem-direita), com densidade 2x.
test("captura do topo do catálogo para um slide", async ({ browser }) => {
  test.skip(test.info().project.name !== "capturas", "roda uma vez, no projeto capturas");
  const contexto = await browser.newContext({ viewport: { width: 720, height: 810 }, deviceScaleFactor: 2, baseURL: "http://localhost:5273" });
  const pagina = await contexto.newPage();
  await pagina.goto("/ds");
  await expect(pagina.getByRole("heading", { name: "Design system" })).toBeVisible();
  await pagina.screenshot({ path: `${PASTA}/08-catalogo-slide.png` });
  await contexto.close();
});

test("montagem das telas de celular para os slides", async ({ page }) => {
  test.skip(test.info().project.name !== "capturas", "a montagem roda uma vez, no projeto capturas");
  const tela = (nome: string) => `data:image/png;base64,${readFileSync(`${PASTA}/${nome}-mobile.png`).toString("base64")}`;
  const telas = ["02-tarefa-nova", "03-tarefa-concluida", "04-feitas-limpas"].map(tela);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.setContent(`<style>
      html,body{margin:0;background:transparent}
      body{width:1600px;height:900px;display:flex;justify-content:center;align-items:flex-start;gap:70px;padding-top:60px;box-sizing:border-box}
      .celular{width:340px;height:780px;border:8px solid #111;border-radius:44px;overflow:hidden;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.35);position:relative}
      .celular img{position:absolute;top:0;left:0;width:100%;height:auto;display:block}
    </style>${telas.map((src) => `<div class="celular"><img src="${src}" alt=""></div>`).join("")}`);
  await page.screenshot({ path: `${PASTA}/06-celular.png`, omitBackground: true });
});
