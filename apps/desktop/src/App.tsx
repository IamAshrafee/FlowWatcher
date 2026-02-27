import { Suspense, lazy } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppShell, type TabId } from "./components/AppShell";
import { DashboardPage } from "./pages";

// Lazy-load non-primary tabs for faster initial render.
const AdvancedPage = lazy(() =>
  import("./pages").then((m) => ({ default: m.AdvancedPage })),
);
const LogsPage = lazy(() =>
  import("./pages").then((m) => ({ default: m.LogsPage })),
);
const SettingsPage = lazy(() =>
  import("./pages").then((m) => ({ default: m.SettingsPage })),
);

/** Minimal loading spinner for lazy-loaded tabs. */
function TabFallback() {
  return (
    <div
      className="flex items-center justify-center py-12"
      style={{ color: "var(--color-text-muted)" }}
    >
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-current"
        style={{ borderTopColor: "transparent" }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AppShell>
        {(activeTab: TabId) => {
          switch (activeTab) {
            case "dashboard":
              return <DashboardPage />;
            case "advanced":
              return (
                <Suspense fallback={<TabFallback />}>
                  <AdvancedPage />
                </Suspense>
              );
            case "logs":
              return (
                <Suspense fallback={<TabFallback />}>
                  <LogsPage />
                </Suspense>
              );
            case "settings":
              return (
                <Suspense fallback={<TabFallback />}>
                  <SettingsPage />
                </Suspense>
              );
          }
        }}
      </AppShell>
    </ThemeProvider>
  );
}

export default App;
