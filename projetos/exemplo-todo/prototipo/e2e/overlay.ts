import type { Page } from "@playwright/test";

/**
 * Roda no navegador (por `page.addInitScript`): desenha a legenda e um cursor com "onda" no clique, porque o vídeo do
 * Playwright não mostra o mouse nem a caixa de confirmação do navegador. Precisa ser autocontida.
 */
export function instalarOverlay(): void {
  const montar = () => {
    if (document.getElementById("demo-legenda")) return;
    const estilo = document.createElement("style");
    estilo.textContent = `
      #demo-legenda{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);width:max-content;max-width:1180px;padding:12px 22px;
        background:rgba(0,0,0,.82);color:#fff;font:600 24px/1.35 "Open Sans",Arial,sans-serif;text-align:center;border-radius:12px;
        pointer-events:none;z-index:2147483646;opacity:0;transition:opacity .3s}
      #demo-cursor{position:fixed;left:0;top:0;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;
        background:rgba(31,138,112,.35);border:3px solid #1f8a70;pointer-events:none;z-index:2147483647;opacity:0;
        transition:transform .45s cubic-bezier(.3,.7,.3,1)}
      .demo-onda{position:fixed;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:3px solid #a83232;
        pointer-events:none;z-index:2147483647;animation:demo-onda .6s ease-out forwards}
      @keyframes demo-onda{to{transform:scale(3.2);opacity:0}}`;
    document.head.appendChild(estilo);
    const legenda = document.createElement("div");
    legenda.id = "demo-legenda";
    document.body.appendChild(legenda);
    const cursor = document.createElement("div");
    cursor.id = "demo-cursor";
    document.body.appendChild(cursor);
    document.addEventListener(
      "mousemove",
      (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        cursor.style.opacity = "1";
      },
      true,
    );
    document.addEventListener(
      "mousedown",
      (e) => {
        const onda = document.createElement("div");
        onda.className = "demo-onda";
        onda.style.left = `${e.clientX}px`;
        onda.style.top = `${e.clientY}px`;
        document.body.appendChild(onda);
        setTimeout(() => onda.remove(), 700);
      },
      true,
    );
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar);
  else montar();
}

/** Mostra (ou, com texto vazio, esconde) a legenda no pé da tela. */
export async function legenda(page: Page, texto: string): Promise<void> {
  await page.evaluate((t) => {
    const el = document.getElementById("demo-legenda");
    if (!el) return;
    el.textContent = t;
    el.style.opacity = t ? "1" : "0";
  }, texto);
}
