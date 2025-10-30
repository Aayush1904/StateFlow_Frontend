import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NuqsAdapter } from "nuqs/adapters/react";

import "./index.css";
import App from "./App.tsx";
import QueryProvider from "./context/query-provider.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { OfflineProvider } from "./context/offline-provider.tsx";
import { OfflineIndicator } from "./components/offline-indicator.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryProvider>
        <OfflineProvider>
        <NuqsAdapter>
          <App />
            <OfflineIndicator />
        </NuqsAdapter>
        <Toaster />
        </OfflineProvider>
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>
);
