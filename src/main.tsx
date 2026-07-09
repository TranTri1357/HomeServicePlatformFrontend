import { createRoot } from "react-dom/client";
import { AppRouter } from "./app/routes";
import { AppProviders } from "./app/providers";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <AppRouter />
  </AppProviders>
);
