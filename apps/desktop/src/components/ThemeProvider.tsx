/**
 * Theme Provider — manages dark/light/auto theme.
 *
 * Detects OS preference, stores user choice in Zustand,
 * and applies the theme class to <html>.
 */

import { create } from "zustand";
import { createContext, useContext, useEffect, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = "dark" | "light" | "auto";
type ResolvedTheme = "dark" | "light";

interface ThemeState {
    theme: Theme;
    resolved: ResolvedTheme;
    setTheme: (theme: Theme) => void;
}

// ---------------------------------------------------------------------------
// Zustand store
// ---------------------------------------------------------------------------

function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
    return theme === "auto" ? getSystemTheme() : theme;
}

const useThemeStore = create<ThemeState>((set) => ({
    theme: "dark",
    resolved: "dark",
    setTheme: (theme) =>
        set({
            theme,
            resolved: resolveTheme(theme),
        }),
}));

// ---------------------------------------------------------------------------
// React context (for component access)
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeState | null>(null);

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
}

export function ThemeProvider({
    children,
    defaultTheme = "dark",
}: ThemeProviderProps) {
    const store = useThemeStore();

    // Initialize on mount.
    useEffect(() => {
        store.setTheme(defaultTheme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Apply theme class to <html>.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("dark", "light");
        root.classList.add(store.resolved);
    }, [store.resolved]);

    // Listen for OS theme changes when in "auto" mode.
    useEffect(() => {
        if (store.theme !== "auto") return;

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => store.setTheme("auto");
        media.addEventListener("change", handler);
        return () => media.removeEventListener("change", handler);
    }, [store.theme, store]);

    return (
        <ThemeContext.Provider value={store}>{children}</ThemeContext.Provider>
    );
}
