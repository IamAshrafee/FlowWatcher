/**
 * Placeholder tab pages — will be replaced with real implementations
 * in Phase 6 (Dashboard), Phase 7 (Advanced), Phase 8 (Logs),
 * and Phase 9 (Settings).
 */

export function DashboardPage() {
    return (
        <div className="animate-slide-up space-y-4">
            <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
            >
                Dashboard
            </h2>
            <p style={{ color: "var(--color-text-secondary)" }}>
                Real-time network monitoring and trigger configuration will appear here.
            </p>

            {/* Placeholder speed cards */}
            <div className="grid grid-cols-2 gap-4">
                <div
                    className="rounded-lg p-4"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border-subtle)",
                        boxShadow: "var(--shadow-card)",
                    }}
                >
                    <p
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Download
                    </p>
                    <p
                        className="mt-1 text-3xl font-bold tabular-nums"
                        style={{ color: "var(--color-accent)" }}
                    >
                        0.00
                    </p>
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        KB/s
                    </p>
                </div>
                <div
                    className="rounded-lg p-4"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border-subtle)",
                        boxShadow: "var(--shadow-card)",
                    }}
                >
                    <p
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Upload
                    </p>
                    <p
                        className="mt-1 text-3xl font-bold tabular-nums"
                        style={{ color: "var(--color-accent)" }}
                    >
                        0.00
                    </p>
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        KB/s
                    </p>
                </div>
            </div>
        </div>
    );
}

export function AdvancedPage() {
    return (
        <div className="animate-slide-up">
            <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
            >
                Advanced
            </h2>
            <p
                className="mt-2"
                style={{ color: "var(--color-text-secondary)" }}
            >
                Process monitoring, exclusion lists, and advanced trigger configuration.
            </p>
        </div>
    );
}

export function LogsPage() {
    return (
        <div className="animate-slide-up">
            <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
            >
                Activity Logs
            </h2>
            <p
                className="mt-2"
                style={{ color: "var(--color-text-secondary)" }}
            >
                History of monitoring sessions and executed actions.
            </p>
        </div>
    );
}

export function SettingsPage() {
    return (
        <div className="animate-slide-up">
            <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
            >
                Settings
            </h2>
            <p
                className="mt-2"
                style={{ color: "var(--color-text-secondary)" }}
            >
                Theme, language, auto-start, and notification preferences.
            </p>
        </div>
    );
}
