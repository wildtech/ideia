import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./tokens.css";
import "./styles.css";

// O catálogo do design system (/ds) só existe no desenvolvimento: no build, o import some do pacote.
const Catalogo = import.meta.env.DEV ? lazy(() => import("./ui/Catalogo").then((m) => ({ default: m.Catalogo }))) : null;
const noCatalogo = Catalogo !== null && window.location.pathname === "/ds";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {noCatalogo ? (
      <Suspense fallback={null}>
        <Catalogo />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
