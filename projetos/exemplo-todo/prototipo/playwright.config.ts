import { defineConfig } from "@playwright/test";

// Os testes de jornada sobem a própria API e a própria interface, em portas e com um banco só deles,
// para não mexer em quem está com o `npm run dev` aberto.
const API = 3101;
const WEB = 5273;

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
    // npm run capturas: refaz as imagens usadas nos slides (../imagens).
    { name: "capturas", testMatch: "capturas.spec.ts", use: { viewport: { width: 1000, height: 740 } } },
  ],
});
