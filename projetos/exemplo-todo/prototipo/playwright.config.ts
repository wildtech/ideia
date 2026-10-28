import { defineConfig } from "@playwright/test";

// Os testes de jornada sobem a própria API e a própria interface, em portas e com um banco só deles,
// para não mexer em quem está com o `npm run dev` aberto.
const API = 3101;
const WEB = 5273;
const CELULAR_9X16 = { width: 540, height: 960 };

export default defineConfig({
  testDir: "e2e",
  workers: 1,
  outputDir: "test-results",
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${WEB}`,
    // Usa o Chrome que já está instalado (o mesmo que gera os PDFs), sem baixar outro navegador.
    channel: "chrome",
    viewport: { width: 1280, height: 720 },
  },
  webServer: [
    {
      command: "npx tsx server/index.ts",
      env: { PORT: String(API), DB_PATH: "data/e2e.db" },
      url: `http://localhost:${API}/api/quadro`,
      reuseExistingServer: false,
    },
    {
      command: "npx vite --strictPort",
      env: { WEB_PORT: String(WEB), API_URL: `http://localhost:${API}` },
      url: `http://localhost:${WEB}`,
      reuseExistingServer: false,
    },
  ],
  projects: [
    // npm run test:e2e: as jornadas de validação, sem vídeo.
    { name: "jornadas", testMatch: "jornadas.spec.ts" },
    // npm run demo: a jornada principal, narrada (legendas e voz) e gravada em vídeo. Veja e2e/demo.spec.ts.
    {
      name: "demo",
      testMatch: "demo.spec.ts",
      timeout: 180_000,
      use: { video: { mode: "on", size: { width: 1280, height: 720 } } },
    },
    // npm run demo:vertical: a mesma jornada narrada, em 9:16 (celular em pé), com a interface no layout estreito (abaixo de 640 px).
    // O Playwright não amplia a gravação, então ela tem o tamanho da tela (540x960); o montar-video.ts a leva para 1080x1920.
    {
      name: "demo-vertical",
      testMatch: "demo.spec.ts",
      timeout: 180_000,
      use: { viewport: CELULAR_9X16, hasTouch: true, video: { mode: "on", size: CELULAR_9X16 } },
    },
    // npm run capturas: refaz as imagens usadas nos slides (../imagens).
    { name: "capturas", testMatch: "capturas.spec.ts", use: { viewport: { width: 1000, height: 740 } } },
    // npm run capturas:mobile: as mesmas imagens, com a tela de um celular (390x844, com densidade 3x), em ../imagens/*-mobile.png.
    {
      name: "capturas-mobile",
      testMatch: "capturas.spec.ts",
      use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    },
  ],
});
