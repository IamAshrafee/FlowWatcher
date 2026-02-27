/**
 * Tab page components for FlowWatcher.
 *
 * DashboardPage is the core monitoring UI (Phase 6).
 * AdvancedPage is the process selection UI (Phase 7).
 * Other pages are placeholders for future phases.
 */

import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SpeedCard } from "@/components/SpeedCard";
import { TriggerBuilder } from "@/components/TriggerBuilder";
import { CountdownDialog } from "@/components/CountdownDialog";
import { ToastContainer } from "@/components/ToastNotification";
import { ProcessList } from "@/components/ProcessList";
import { ExclusionList } from "@/components/ExclusionList";
import { useMonitoringStore } from "@/stores/monitoringStore";
import { useProcessStore } from "@/stores/processStore";
import { useSpeedPolling, useAppInit, useProcesses } from "@/hooks/useTauri";
import { useCountdown } from "@/hooks/useCountdown";

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

    // ── Phase 8: Safety countdown ──
    const {
        countdownState,
        startCountdown,
        cancelCountdown,
        executeNow,
        isCountdownActive,
    } = useCountdown();

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

            {/* Phase 8: Trigger test button (dev/testing) */}
            {isMonitoring && (
                <button
                    type="button"
                    onClick={startCountdown}
                    className="w-full rounded-lg px-4 py-2 text-xs font-medium transition-colors"
                    style={{
                        backgroundColor: "rgba(255, 183, 77, 0.06)",
                        color: "#FFB74D",
                        border: "1px solid rgba(255, 183, 77, 0.15)",
                        cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                            "rgba(255, 183, 77, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                            "rgba(255, 183, 77, 0.06)";
                    }}
                >
                    ⚠ Simulate Trigger (Test Safety UI)
                </button>
            )}

            {/* Phase 8: Countdown overlay */}
            <CountdownDialog
                isOpen={isCountdownActive}
                remainingSeconds={countdownState.remainingSeconds}
                totalSeconds={countdownState.totalSeconds}
                actionName={countdownState.actionName}
                onCancel={cancelCountdown}
                onExecuteNow={executeNow}
            />

            {/* Phase 8: Toast notifications */}
            <ToastContainer />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Advanced Page (Phase 7)
// ---------------------------------------------------------------------------

export function AdvancedPage() {
    const { isProcessModeEnabled, toggleProcessMode, watchedProcesses, excludedProcesses } =
        useProcessStore();
    const { updateConfig } = useMonitoringStore();
    const { fetchProcesses } = useProcesses();

    // Fetch processes when page is first shown and mode is enabled.
    useEffect(() => {
        if (isProcessModeEnabled) {
            fetchProcesses();
        }
    }, [isProcessModeEnabled]);

    // Sync process mode to monitoring store trigger_type.
    useEffect(() => {
        if (isProcessModeEnabled && watchedProcesses.length > 0) {
            updateConfig({
                trigger_type: {
                    type: "process_idle",
                    watched_processes: watchedProcesses,
                    excluded_processes: excludedProcesses,
                    threshold_bytes: 10_240, // 10 KB/s default
                },
            });
        } else if (!isProcessModeEnabled) {
            updateConfig({
                trigger_type: {
                    type: "network_idle",
                    interface_id: "auto",
                },
            });
        }
    }, [isProcessModeEnabled, watchedProcesses, excludedProcesses, updateConfig]);

    return (
        <div className="animate-slide-up space-y-5">
            {/* Header + Toggle */}
            <div
                className="flex items-center justify-between rounded-lg p-4"
                style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border-subtle)",
                    boxShadow: "var(--shadow-card)",
                }}
            >
                <div>
                    <h2
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Monitor Specific Applications
                    </h2>
                    <p
                        className="mt-0.5 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Select apps to monitor instead of global network activity.
                    </p>
                </div>

                {/* Toggle switch */}
                <button
                    type="button"
                    role="switch"
                    aria-checked={isProcessModeEnabled}
                    onClick={() => {
                        toggleProcessMode();
                        if (!isProcessModeEnabled) {
                            fetchProcesses();
                        }
                    }}
                    className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors"
                    style={{
                        backgroundColor: isProcessModeEnabled
                            ? "var(--color-accent)"
                            : "var(--color-border-default)",
                        cursor: "pointer",
                        border: "none",
                    }}
                >
                    <span
                        className="inline-block h-5 w-5 transform rounded-full transition-transform"
                        style={{
                            backgroundColor: "white",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            transform: isProcessModeEnabled
                                ? "translateX(22px) translateY(2px)"
                                : "translateX(2px) translateY(2px)",
                        }}
                    />
                </button>
            </div>

            {/* Content: shown only when enabled */}
            {isProcessModeEnabled ? (
                <div className="space-y-5 animate-fade-in">
                    {/* Refresh button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={fetchProcesses}
                            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                color: "var(--color-text-secondary)",
                                border: "1px solid var(--color-border-default)",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor =
                                    "var(--color-accent)";
                                e.currentTarget.style.color =
                                    "var(--color-accent)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor =
                                    "var(--color-border-default)";
                                e.currentTarget.style.color =
                                    "var(--color-text-secondary)";
                            }}
                        >
                            ↻ Refresh
                        </button>
                    </div>

                    {/* Process list */}
                    <div
                        className="rounded-lg p-4"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            border: "1px solid var(--color-border-subtle)",
                            boxShadow: "var(--shadow-card)",
                        }}
                    >
                        <ProcessList />
                    </div>

                    {/* Exclusion list */}
                    <div
                        className="rounded-lg p-4"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            border: "1px solid var(--color-border-subtle)",
                            boxShadow: "var(--shadow-card)",
                        }}
                    >
                        <ExclusionList />
                    </div>
                </div>
            ) : (
                <div
                    className="rounded-lg p-6 text-center animate-fade-in"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border-subtle)",
                    }}
                >
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Enable the toggle above to select specific applications to
                        monitor. When disabled, FlowWatcher monitors global network
                        activity.
                    </p>
                </div>
            )}
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
