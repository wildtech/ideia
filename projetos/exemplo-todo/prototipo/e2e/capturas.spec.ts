import { expect, test } from "@playwright/test";

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
