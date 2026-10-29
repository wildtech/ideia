import { expect, test, type Page } from "@playwright/test";

// Jornadas de validação: o que a pessoa faz na tela, do começo ao fim. Cada teste parte dos dados de exemplo
// (5 tarefas em "A fazer" e 3 em "Feito"). A jornada principal também serve de roteiro para o vídeo de demonstração.

const API = "http://localhost:3101/api";

const aFazer = (page: Page) => page.getByRole("region", { name: /A fazer/ });
const feito = (page: Page) => page.getByRole("region", { name: /Feito/ });

test.beforeEach(async ({ page, request }) => {
  await request.post(`${API}/reset`, { data: {} });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Lista de tarefas" })).toBeVisible();
});

test("jornada principal: anotar, concluir e limpar o que está feito", async ({ page }) => {
  await expect(aFazer(page).getByRole("listitem")).toHaveCount(5);
  await expect(feito(page).getByRole("listitem")).toHaveCount(3);

  // Ato 1: anotar
  await page.getByLabel("O que precisa ser feito?").fill("Tarefa da jornada");
  await page.getByRole("button", { name: "Adicionar" }).click();
  await expect(aFazer(page).getByText("Tarefa da jornada")).toBeVisible();
  await expect(aFazer(page).getByRole("listitem")).toHaveCount(6);

  // Ato 2: andar
  await page.getByRole("button", { name: "Concluir: Tarefa da jornada" }).click();
  await expect(feito(page).getByText("Tarefa da jornada")).toBeVisible();
  await expect(aFazer(page).getByRole("listitem")).toHaveCount(5);
  await expect(feito(page).getByRole("listitem")).toHaveCount(4);

  // Ato 3: limpar (a confirmação diz quantas tarefas vão embora)
  page.once("dialog", (d) => {
    expect(d.message()).toContain("Remover 4 tarefas feitas");
    void d.accept();
  });
  await page.getByRole("button", { name: "Limpar feitas" }).click();
  await expect(feito(page).getByText("Nada feito ainda.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Limpar feitas" })).toBeDisabled();
  await expect(aFazer(page).getByRole("listitem")).toHaveCount(5);
});

test("não aceita uma tarefa sem título", async ({ page }) => {
  await page.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByRole("alert")).toHaveText("Escreva o que precisa ser feito.");
  await expect(aFazer(page).getByRole("listitem")).toHaveCount(5);
});

test("devolve uma tarefa feita para a fazer", async ({ page }) => {
  await page.getByRole("button", { name: "Voltar para a fazer: Escolher o tema" }).click();
  await expect(aFazer(page).getByText("Escolher o tema")).toBeVisible();
  await expect(feito(page).getByRole("listitem")).toHaveCount(2);
});

test("cancelar a confirmação não remove nada", async ({ page }) => {
  page.once("dialog", (d) => void d.dismiss());
  await page.getByRole("button", { name: "Limpar feitas" }).click();
  await expect(feito(page).getByRole("listitem")).toHaveCount(3);
});

test("o botão de limpar fica desligado quando não há nada feito", async ({ page, request }) => {
  await request.post(`${API}/feitas/limpar`, { data: {} });
  await page.reload();
  await expect(page.getByRole("button", { name: "Limpar feitas" })).toBeDisabled();
});

test("o catálogo do design system mostra tokens, contraste e componentes", async ({ page }) => {
  await page.goto("/ds");
  await expect(page.getByRole("heading", { name: "Design system" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Camadas" })).toBeVisible();
  // A cadeia tema → token → componente: a cor de ação vem da primária e é usada pelo botão.
  const acao = page.getByRole("row").filter({ has: page.getByText("--primaria-acao", { exact: true }) });
  await expect(acao).toContainText("colors.primary");
  await expect(acao).toContainText("Botao");
  // Todo par de cores do catálogo passa no contraste mínimo.
  await expect(page.getByRole("cell", { name: "NÃO passa" })).toHaveCount(0);
  await expect(page.getByRole("cell", { name: "passa", exact: true })).toHaveCount(7);
  await expect(page.getByRole("button", { name: "Exemplo" })).toHaveCount(4);
});
