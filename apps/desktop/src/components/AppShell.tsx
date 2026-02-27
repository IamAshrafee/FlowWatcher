/**
 * App Shell — the main layout wrapper.
 *
 * Contains the titlebar area, pill tab navigation,
 * and content area with fade transitions.
 */

import { useState, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TabId = "dashboard" | "advanced" | "logs" | "settings";

interface Tab {
    id: TabId;
    label: string;
}

const TABS: Tab[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "advanced", label: "Advanced" },
    { id: "logs", label: "Logs" },
    { id: "settings", label: "Settings" },
];

interface AppShellProps {
    children: (activeTab: TabId) => ReactNode;
}

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

function StatusBadge({ status = "Idle" }: { status?: string }) {
    const isActive = status === "Monitoring";
    const isWarning = status === "Countdown" || status === "TriggerPending";

    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
                backgroundColor: isActive
                    ? "rgba(58, 186, 180, 0.15)"
                    : isWarning
                        ? "rgba(229, 115, 115, 0.15)"
                        : "rgba(99, 107, 126, 0.15)",
                color: isActive
                    ? "var(--color-accent)"
                    : isWarning
                        ? "var(--color-warning)"
                        : "var(--color-text-muted)",
            }}
        >
            <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${isActive ? "animate-pulse-dot" : ""}`}
                style={{
                    backgroundColor: isActive
                        ? "var(--color-accent)"
                        : isWarning
                            ? "var(--color-warning)"
                            : "var(--color-text-muted)",
                }}
            />
            {status}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Pill Tab Navigation
// ---------------------------------------------------------------------------

function PillTabs({
    activeTab,
    onTabChange,
}: {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}) {
    return (
        <nav
            className="inline-flex gap-1 rounded-full p-1"
            style={{ backgroundColor: "var(--color-surface)" }}
            role="tablist"
        >
            {TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onTabChange(tab.id)}
                        className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
                        style={{
                            backgroundColor: isActive
                                ? "var(--color-accent)"
                                : "transparent",
                            color: isActive
                                ? "var(--color-text-inverse)"
                                : "var(--color-text-secondary)",
                            cursor: "pointer",
                            border: "none",
                            outline: "none",
                            transitionDuration: "var(--transition-fast)",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor =
                                    "var(--color-surface-hover)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = "transparent";
                            }
                        }}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </nav>
    );
}

// ---------------------------------------------------------------------------
// App Shell
// ---------------------------------------------------------------------------

export function AppShell({ children }: AppShellProps) {
    const [activeTab, setActiveTab] = useState<TabId>("dashboard");

    return (
        <div
            className="flex h-screen flex-col"
            style={{ backgroundColor: "var(--color-base)" }}
        >
            {/* Header */}
            <header
                className="flex items-center justify-between px-5 py-3"
                style={{
                    borderBottom: "1px solid var(--color-border-subtle)",
                    /* Tauri: allow window drag on titlebar area */
                    // @ts-expect-error Tauri-specific CSS property
                    WebkitAppRegion: "drag",
                }}
            >
                <div className="flex items-center gap-3">
                    <h1
                        className="text-base font-semibold tracking-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        FlowWatcher
                    </h1>
                    <StatusBadge />
                </div>

                <div
                    style={{
                        // @ts-expect-error Tauri: buttons should not be draggable
                        WebkitAppRegion: "no-drag",
                    }}
                >
                    <PillTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
            </header>

            {/* Content */}
            <main
                className="flex-1 overflow-y-auto p-5 animate-fade-in"
                key={activeTab}
            >
                <div className="mx-auto max-w-3xl">{children(activeTab)}</div>
            </main>
        </div>
    );
}
