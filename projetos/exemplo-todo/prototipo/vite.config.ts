import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// As portas e a API podem ser trocadas por variáveis de ambiente (os testes de jornada usam outras, para
// não atrapalhar quem está com o `npm run dev` aberto). Sem variáveis, valem 5173 e http://localhost:3001.
const api = process.env.API_URL ?? "http://localhost:3001";
const porta = Number(process.env.WEB_PORT ?? 5173);

export default defineConfig({
  plugins: [react()],
  server: { port: porta, proxy: { "/api": api } },
  test: { include: ["src/**/*.test.ts", "server/**/*.test.ts"], environment: "node" },
});
