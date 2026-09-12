import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ExamplePage from "./pages/ExamplePage";
import translations from "../public/locale/en.json";

/**
 * Standalone harness — NOT the federation entrypoint.
 * The host only ever imports `./manifest`. This exists so `vite preview` serves something
 * and so the plugin can be developed in isolation.
 */
window.CARE_API_URL ??= "http://127.0.0.1:9000";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: { en: { translation: translations } },
  interpolation: { escapeValue: false },
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ExamplePage />
    </QueryClientProvider>
  </StrictMode>,
);
