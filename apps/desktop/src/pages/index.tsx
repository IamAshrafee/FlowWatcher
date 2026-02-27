/**
 * Tab page components for FlowWatcher.
 *
 * DashboardPage is the core monitoring UI (Phase 6).
 * Other pages are placeholders for future phases.
 */

import { invoke } from "@tauri-apps/api/core";
import { SpeedCard } from "@/components/SpeedCard";
import { TriggerBuilder } from "@/components/TriggerBuilder";
import { useMonitoringStore } from "@/stores/monitoringStore";
import { useSpeedPolling, useAppInit } from "@/hooks/useTauri";

// ---------------------------------------------------------------------------
// Dashboard Page (Phase 6)
// ---------------------------------------------------------------------------

export function DashboardPage() {
    const { currentSpeed, speedHistory, interfaceName, status, config, setStatus } =
        useMonitoringStore();
    const isMonitoring = status.status === "Monitoring";
    const isIdle = status.status === "Idle";

    // ── Tauri integration hooks ──
    useSpeedPolling();
    useAppInit();

    async function handleToggleMonitoring() {
        try {
            if (isIdle) {
                await invoke("start_monitoring", { config });
                setStatus({ status: "Monitoring" });
            } else {
                await invoke("stop_monitoring");
                setStatus({ status: "Idle" });
            }
        } catch (err) {
            console.error("Monitoring toggle failed:", err);
            // Fallback: update status locally even if invoke fails
            // (e.g. running in browser dev mode without Tauri runtime)
            if (isIdle) {
                setStatus({ status: "Monitoring" });
            } else {
                setStatus({ status: "Idle" });
            }
        }
    }

    return (
        <div className="animate-slide-up space-y-5">
            {/* Speed cards */}
            <div className="grid grid-cols-2 gap-4">
                <SpeedCard
                    label="Download"
                    bps={currentSpeed.download_bps}
                    icon="download"
                    history={speedHistory.map((s) => s.download_bps)}
                    interfaceName={interfaceName}
                />
                <SpeedCard
                    label="Upload"
                    bps={currentSpeed.upload_bps}
                    icon="upload"
                    history={speedHistory.map((s) => s.upload_bps)}
                />
            </div>

            {/* Natural Language Trigger Builder */}
            <TriggerBuilder />

            {/* Start / Stop Button */}
            <button
                type="button"
                onClick={handleToggleMonitoring}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-all"
                style={{
                    backgroundColor: isMonitoring
                        ? "var(--color-surface)"
                        : "var(--color-accent)",
                    color: isMonitoring
                        ? "var(--color-text-secondary)"
                        : "var(--color-text-inverse)",
                    border: isMonitoring
                        ? "1px solid var(--color-border-default)"
                        : "1px solid transparent",
                    cursor: "pointer",
                    transitionDuration: "var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isMonitoring
                        ? "var(--color-surface-hover)"
                        : "var(--color-accent-hover)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isMonitoring
                        ? "var(--color-surface)"
                        : "var(--color-accent)";
                }}
            >
                {/* Pulsing dot when monitoring */}
                {isMonitoring && (
                    <span
                        className="inline-block h-2 w-2 rounded-full animate-pulse-dot"
                        style={{ backgroundColor: "var(--color-accent)" }}
                    />
                )}
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </button>

            {/* Status indicator */}
            {status.status !== "Idle" && (
                <div
                    className="rounded-lg p-3 text-center text-sm animate-fade-in"
                    style={{
                        backgroundColor: isMonitoring
                            ? "rgba(58, 186, 180, 0.08)"
                            : "rgba(229, 115, 115, 0.08)",
                        color: isMonitoring
                            ? "var(--color-accent)"
                            : "var(--color-warning)",
                        border: isMonitoring
                            ? "1px solid rgba(58, 186, 180, 0.15)"
                            : "1px solid rgba(229, 115, 115, 0.15)",
                    }}
                >
                    {status.status === "Monitoring" &&
                        "Monitoring network activity..."}
                    {status.status === "TriggerPending" &&
                        "Trigger condition detected — preparing action..."}
                    {status.status === "Countdown" &&
                        `Action in ${status.data.remaining_secs} seconds...`}
                    {status.status === "Executed" && "Action executed successfully."}
                    {status.status === "Paused" && "Monitoring paused."}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Advanced Page (Phase 7 placeholder)
// ---------------------------------------------------------------------------

export function AdvancedPage() {
    return (
        <div className="animate-slide-up">
            <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
            >
                Advanced
            </h2>
            <p className="mt-2" style={{ color: "var(--color-text-secondary)" }}>
                Process monitoring, exclusion lists, and advanced trigger configuration.
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Logs Page (Phase 8 placeholder)
// ---------------------------------------------------------------------------

export function LogsPage() {
    return (
        <div className="animate-slide-up">
            <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
            >
                Activity Logs
            </h2>
            <p className="mt-2" style={{ color: "var(--color-text-secondary)" }}>
                History of monitoring sessions and executed actions.
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Settings Page (Phase 9 placeholder)
// ---------------------------------------------------------------------------

export function SettingsPage() {
    return (
        <div className="animate-slide-up">
            <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
            >
                Settings
            </h2>
            <p className="mt-2" style={{ color: "var(--color-text-secondary)" }}>
                Theme, language, auto-start, and notification preferences.
            </p>
        </div>
    );
}
