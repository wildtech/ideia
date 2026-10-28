import type { Locator, Page } from "@playwright/test";

/**
 * Roda no navegador (por `page.addInitScript`): desenha a legenda (as palavras acendem no ritmo da voz), o nome do
 * passo no canto, um cursor com "onda" no clique (o vídeo do Playwright não mostra o mouse nem a caixa de confirmação
 * do navegador) e o zoom suave no que está sendo feito. As cores e o movimento vêm dos tokens do tema (tokens.css).
 * Precisa ser autocontida.
 */
export function instalarOverlay(): void {
  const montar = () => {
    if (document.getElementById("demo-legenda")) return;
    const estilo = document.createElement("style");
    estilo.textContent = `
      #demo-legenda{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);width:max-content;max-width:1100px;
        text-align:center;font:700 25px/1.55 var(--fonte,"Open Sans",Arial,sans-serif);pointer-events:none;z-index:2147483646;
        opacity:0;transition:opacity .3s}
      #demo-legenda p{display:inline;margin:0;padding:.12em .5em;background:rgba(0,0,0,.82);color:#fff;border-radius:10px;
        box-decoration-break:clone;-webkit-box-decoration-break:clone}
      #demo-legenda span{opacity:.5}
      #demo-legenda.parada span{opacity:1}
      @keyframes demo-palavra{to{opacity:1;color:var(--destaque,#fff)}}
      #demo-passo{position:fixed;right:24px;top:22px;padding:8px 18px;border-radius:999px;background:var(--fundo-escuro,#000);
        color:#fff;font:700 20px/1.3 var(--fonte,"Open Sans",Arial,sans-serif);pointer-events:none;z-index:2147483646;
        box-shadow:var(--sombra,0 8px 24px rgba(0,0,0,.2));opacity:0;transform:translateY(-12px);
        transition:opacity var(--duracao,.3s) var(--curva,ease),transform var(--duracao,.3s) var(--curva,ease)}
      #demo-passo::before{content:"";display:inline-block;width:10px;height:10px;margin-right:10px;border-radius:50%;
        background:var(--destaque,#fff);vertical-align:middle}
      #demo-passo.visivel{opacity:1;transform:none}
      #demo-cursor{position:fixed;left:0;top:0;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;
        background:color-mix(in srgb,var(--primaria,#1f8a70) 35%,transparent);border:3px solid var(--primaria,#1f8a70);
        pointer-events:none;z-index:2147483647;opacity:0;transition:transform .45s cubic-bezier(.3,.7,.3,1)}
      .demo-onda{position:fixed;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:3px solid var(--acento,#a83232);
        pointer-events:none;z-index:2147483647;animation:demo-onda .6s ease-out forwards}
      @keyframes demo-onda{to{transform:scale(3.2);opacity:0}}
      #root{transform-origin:0 0;transition:transform .9s var(--curva,cubic-bezier(.2,.7,.2,1))}
      @media (max-width:640px){
        #demo-legenda{max-width:calc(100vw - 24px);bottom:56px;font-size:17px}
        #demo-passo{right:12px;top:12px;font-size:15px}
        html{scroll-behavior:smooth}
      }`;
    document.head.appendChild(estilo);
    for (const id of ["demo-legenda", "demo-passo", "demo-cursor"]) {
      const el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
    const cursor = document.getElementById("demo-cursor")!;
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

    // Zoom: aproxima a página (#root) do retângulo dado, sem deixar aparecer borda vazia. O que fica por cima
    // (legenda, passo, cursor) não muda de tamanho.
    let atual = { s: 1, tx: 0, ty: 0 };
    (window as unknown as { __demoZoom: (r: DOMRectInit | null, s: number) => void }).__demoZoom = (r, s) => {
      const root = document.getElementById("root");
      if (!root) return;
      if (!r || s <= 1) {
        atual = { s: 1, tx: 0, ty: 0 };
        root.style.transform = "";
        return;
      }
      const caixa = root.getBoundingClientRect();
      const R = { x: caixa.left - atual.tx, y: caixa.top - atual.ty };
      const qx = (r.x! + r.width! / 2 - R.x - atual.tx) / atual.s;
      const qy = (r.y! + r.height! / 2 - R.y - atual.ty) / atual.s;
      const vw = innerWidth, vh = innerHeight;
      const W = root.offsetWidth, H = Math.max(root.offsetHeight, vh - R.y);
      const tx = Math.min(-R.x, Math.max(vw - R.x - s * W, vw / 2 - R.x - s * qx));
      const ty = Math.min(-R.y, Math.max(vh - R.y - s * H, vh * 0.45 - R.y - s * qy));
      atual = { s, tx, ty };
      root.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    };
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar);
  else montar();
}

/**
 * Mostra a legenda no pé da tela (com texto vazio, esconde). Com `segundos`, as palavras acendem uma a uma, no ritmo
 * da voz (proporcional ao tamanho de cada palavra); sem, a legenda aparece inteira.
 */
export async function legenda(page: Page, texto: string, segundos?: number): Promise<void> {
  await page.evaluate(
    ([t, s]) => {
      const el = document.getElementById("demo-legenda");
      if (!el) return;
      el.style.opacity = t ? "1" : "0";
      if (!t) return;
      const palavras = t.split(/\s+/).filter(Boolean);
      const total = palavras.reduce((n, p) => n + p.length + 1, 0);
      let acumulado = 0;
      const p = document.createElement("p");
      palavras.forEach((w, i) => {
        const span = document.createElement("span");
        span.textContent = w;
        if (s) span.style.animation = `demo-palavra .25s ease-out ${((acumulado / total) * s * 1000).toFixed(0)}ms forwards`;
        acumulado += w.length + 1;
        p.append(span, i < palavras.length - 1 ? " " : "");
      });
      el.className = s ? "" : "parada";
      el.replaceChildren(p);
    },
    [texto, segundos ?? 0] as const,
  );
}

/** Mostra (ou, com texto vazio, esconde) o nome do passo no canto da tela. */
export async function passo(page: Page, texto: string): Promise<void> {
  await page.evaluate((t) => {
    const el = document.getElementById("demo-passo");
    if (!el) return;
    if (t) el.textContent = t;
    el.classList.toggle("visivel", !!t);
  }, texto);
}

/** Aproxima a tela dos elementos dados (a caixa que junta todos), com a escala pedida; escala 1 volta ao normal. */
export async function focar(page: Page, alvos: Locator[], escala: number): Promise<void> {
  const caixas = (await Promise.all(alvos.map((a) => a.boundingBox()))).filter((b) => b !== null);
  if (escala <= 1 || !caixas.length) {
    await page.evaluate(() => (window as unknown as { __demoZoom: (r: null, s: number) => void }).__demoZoom(null, 1));
  } else {
    const x = Math.min(...caixas.map((b) => b.x)), y = Math.min(...caixas.map((b) => b.y));
    const r = { x, y, width: Math.max(...caixas.map((b) => b.x + b.width)) - x, height: Math.max(...caixas.map((b) => b.y + b.height)) - y };
    await page.evaluate(([caixa, s]) => (window as unknown as { __demoZoom: (r: DOMRectInit, s: number) => void }).__demoZoom(caixa, s), [r, escala] as const);
  }
  await page.waitForTimeout(950);
}
