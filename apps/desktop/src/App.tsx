import { ThemeProvider } from "./components/ThemeProvider";
import { AppShell, type TabId } from "./components/AppShell";
import { DashboardPage, AdvancedPage, LogsPage, SettingsPage } from "./pages";

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AppShell>
        {(activeTab: TabId) => {
          switch (activeTab) {
            case "dashboard":
              return <DashboardPage />;
            case "advanced":
              return <AdvancedPage />;
            case "logs":
              return <LogsPage />;
            case "settings":
              return <SettingsPage />;
          }
        }}
      </AppShell>
    </ThemeProvider>
  );
}

export default App;
