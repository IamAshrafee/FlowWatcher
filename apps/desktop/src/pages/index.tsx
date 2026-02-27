/**
 * Tab page components for FlowWatcher.
 *
 * DashboardPage is the core monitoring UI (Phase 6).
 * AdvancedPage is the process selection UI (Phase 7).
 * Other pages are placeholders for future phases.
 */

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
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
import { useSettingsStore } from "@/stores/settingsStore";
import { useTheme } from "@/components/ThemeProvider";
import type { LogEntry } from "@/types";

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

    // ── Phase 11: Tray event listeners ──
    useEffect(() => {
        let unlistenStart: (() => void) | null = null;
        let unlistenStop: (() => void) | null = null;

        (async () => {
            unlistenStart = await listen("tray-start-monitoring", async () => {
                try {
                    await invoke("start_monitoring", { config });
                    setStatus({ status: "Monitoring" });
                } catch (err) {
                    console.error("Tray start monitoring failed:", err);
                }
            });
            unlistenStop = await listen("tray-stop-monitoring", async () => {
                try {
                    await invoke("stop_monitoring");
                    setStatus({ status: "Idle" });
                } catch (err) {
                    console.error("Tray stop monitoring failed:", err);
                }
            });
        })();

        return () => {
            if (unlistenStart) unlistenStart();
            if (unlistenStop) unlistenStop();
        };
    }, [config, setStatus]);

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
// Logs Page (Phase 9)
// ---------------------------------------------------------------------------

export function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch logs on mount.
    useEffect(() => {
        fetchLogs();
    }, []);

    async function fetchLogs() {
        setIsLoading(true);
        try {
            const data = await invoke("get_activity_logs");
            setLogs(data as LogEntry[]);
        } catch {
            // Silent fail — logs may not be available in dev mode.
            setLogs([]);
        }
        setIsLoading(false);
    }

    async function handleClear() {
        try {
            await invoke("clear_activity_logs");
            setLogs([]);
        } catch {
            // Silent fail.
        }
    }

    async function handleExport(format: string) {
        try {
            const data = await invoke("export_activity_logs", { format });
            // Copy to clipboard as a simple export mechanism.
            await navigator.clipboard.writeText(data as string);
            // Use inline feedback instead of toast (toast is mounted in Dashboard).
            alert(`Logs exported as ${format.toUpperCase()} and copied to clipboard.`);
        } catch {
            alert("Export failed.");
        }
    }

    // Filter logs by search query.
    const filtered = search
        ? logs.filter(
            (l) =>
                l.trigger_reason.toLowerCase().includes(search.toLowerCase()) ||
                l.action_name.toLowerCase().includes(search.toLowerCase()) ||
                (l.details || "").toLowerCase().includes(search.toLowerCase()),
        )
        : logs;

    // Reverse so newest is first.
    const sorted = [...filtered].reverse();

    const STATUS_BADGES: Record<string, { icon: string; color: string; label: string }> = {
        executed: { icon: "✅", color: "#66BB6A", label: "Executed" },
        cancelled: { icon: "❌", color: "var(--color-warning)", label: "Cancelled" },
        error: { icon: "⚠️", color: "#FFB74D", label: "Error" },
        info: { icon: "ℹ", color: "var(--color-accent)", label: "Info" },
    };

    return (
        <div className="animate-slide-up space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Activity Logs
                    </h2>
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {logs.length} event{logs.length !== 1 ? "s" : ""} recorded
                    </p>
                </div>
                <button
                    type="button"
                    onClick={fetchLogs}
                    className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border-default)",
                        cursor: "pointer",
                    }}
                >
                    ↻ Refresh
                </button>
            </div>

            {/* Search bar */}
            <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm"
                style={{
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border-default)",
                    outline: "none",
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-accent)";
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border-default)";
                }}
            />

            {/* Log table */}
            <div
                className="rounded-lg overflow-hidden"
                style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border-subtle)",
                    boxShadow: "var(--shadow-card)",
                }}
            >
                {/* Table header */}
                <div
                    className="grid text-xs font-medium uppercase tracking-wider px-4 py-2.5"
                    style={{
                        gridTemplateColumns: "140px 1fr 1fr 100px",
                        color: "var(--color-text-muted)",
                        borderBottom: "1px solid var(--color-border-subtle)",
                        backgroundColor: "rgba(255,255,255,0.02)",
                    }}
                >
                    <span>Date/Time</span>
                    <span>Trigger</span>
                    <span>Action</span>
                    <span>Status</span>
                </div>

                {/* Table body */}
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {isLoading ? (
                        <p
                            className="p-6 text-center text-sm"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            Loading...
                        </p>
                    ) : sorted.length === 0 ? (
                        <p
                            className="p-6 text-center text-sm"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            {search
                                ? "No matching log entries."
                                : "No activity logged yet. Start monitoring to see events here."}
                        </p>
                    ) : (
                        sorted.map((entry, i) => {
                            const badge = STATUS_BADGES[entry.status] || STATUS_BADGES.info;
                            return (
                                <div
                                    key={`${entry.timestamp}-${i}`}
                                    className="grid px-4 py-2.5 text-sm transition-colors"
                                    style={{
                                        gridTemplateColumns: "140px 1fr 1fr 100px",
                                        borderBottom: "1px solid var(--color-border-subtle)",
                                        color: "var(--color-text-secondary)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "rgba(255,255,255,0.02)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                >
                                    <span
                                        className="text-xs font-mono"
                                        style={{ color: "var(--color-text-muted)" }}
                                    >
                                        {entry.timestamp}
                                    </span>
                                    <span>{entry.trigger_reason}</span>
                                    <span>{entry.action_name}</span>
                                    <span
                                        className="inline-flex items-center gap-1 text-xs"
                                        style={{ color: badge.color }}
                                    >
                                        {badge.icon} {badge.label}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={logs.length === 0}
                    className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        color: logs.length > 0 ? "var(--color-warning)" : "var(--color-text-muted)",
                        border: "1px solid var(--color-border-default)",
                        cursor: logs.length > 0 ? "pointer" : "not-allowed",
                        opacity: logs.length > 0 ? 1 : 0.5,
                    }}
                >
                    Clear Logs
                </button>
                <button
                    type="button"
                    onClick={() => handleExport("json")}
                    disabled={logs.length === 0}
                    className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border-default)",
                        cursor: logs.length > 0 ? "pointer" : "not-allowed",
                        opacity: logs.length > 0 ? 1 : 0.5,
                    }}
                >
                    Export JSON
                </button>
                <button
                    type="button"
                    onClick={() => handleExport("txt")}
                    disabled={logs.length === 0}
                    className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border-default)",
                        cursor: logs.length > 0 ? "pointer" : "not-allowed",
                        opacity: logs.length > 0 ? 1 : 0.5,
                    }}
                >
                    Export TXT
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Settings Page (Phase 10)
// ---------------------------------------------------------------------------

export function SettingsPage() {
    const { settings, updateSettings, loadSettings, resetDefaults } =
        useSettingsStore();
    const { setTheme } = useTheme();

    // Load settings on mount.
    useEffect(() => {
        loadSettings();
    }, []);

    // Wire theme changes to ThemeProvider.
    function handleThemeChange(theme: "dark" | "light" | "auto") {
        updateSettings({ theme });
        setTheme(theme);
    }

    async function handleClearLogs() {
        try {
            await invoke("clear_activity_logs");
            alert("Activity logs cleared.");
        } catch {
            // Silent fail.
        }
    }

    async function handleResetSettings() {
        if (!confirm("Reset all settings to defaults? This cannot be undone.")) {
            return;
        }
        await resetDefaults();
        setTheme("dark");
        alert("Settings reset to defaults.");
    }

    return (
        <div className="animate-slide-up space-y-4">
            {/* Header */}
            <div>
                <h2
                    className="text-lg font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Settings
                </h2>
                <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Customize app behavior and appearance.
                </p>
            </div>

            {/* Appearance */}
            <SettingsSection title="Appearance">
                <SettingsRow label="Theme" description="Choose your preferred color scheme.">
                    <div className="flex gap-1 rounded-lg p-0.5" style={{
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--color-border-subtle)",
                    }}>
                        {(["dark", "light", "auto"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => handleThemeChange(t)}
                                className="rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all"
                                style={{
                                    backgroundColor:
                                        settings.theme === t
                                            ? "var(--color-accent)"
                                            : "transparent",
                                    color:
                                        settings.theme === t
                                            ? "#fff"
                                            : "var(--color-text-secondary)",
                                    cursor: "pointer",
                                    border: "none",
                                }}
                            >
                                {t === "auto" ? "Auto" : t === "dark" ? "🌙 Dark" : "☀️ Light"}
                            </button>
                        ))}
                    </div>
                </SettingsRow>
                <SettingsRow label="Language" description="Display language (coming soon).">
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        English
                    </span>
                </SettingsRow>
            </SettingsSection>

            {/* Behavior */}
            <SettingsSection title="Behavior">
                <SettingsRow label="Auto-Start" description="Launch FlowWatcher when Windows starts.">
                    <ToggleSwitch
                        checked={settings.auto_start}
                        onChange={(v) => updateSettings({ auto_start: v })}
                    />
                </SettingsRow>
                <SettingsRow label="Minimize to Tray" description="Hide to system tray instead of exiting when closing window.">
                    <ToggleSwitch
                        checked={settings.minimize_to_tray}
                        onChange={async (v) => {
                            updateSettings({ minimize_to_tray: v });
                            try {
                                await invoke("set_close_to_tray", { enabled: v });
                            } catch {
                                // Silent fail in dev mode.
                            }
                        }}
                    />
                </SettingsRow>
                <SettingsRow label="Keep Screen On" description="Prevent display sleep while monitoring.">
                    <ToggleSwitch
                        checked={settings.keep_screen_on}
                        onChange={(v) => updateSettings({ keep_screen_on: v })}
                    />
                </SettingsRow>
                <SettingsRow label="Auto-Save" description="Save settings automatically on change.">
                    <ToggleSwitch
                        checked={settings.auto_save}
                        onChange={(v) => updateSettings({ auto_save: v })}
                    />
                </SettingsRow>
                <SettingsRow label="Notifications" description="Show toast for pre-warning and post-action.">
                    <ToggleSwitch
                        checked={settings.show_notifications}
                        onChange={(v) => updateSettings({ show_notifications: v })}
                    />
                </SettingsRow>
            </SettingsSection>

            {/* Delays */}
            <SettingsSection title="Delays">
                <SettingsRow
                    label="Pre-Action Delay"
                    description="Minutes to wait after trigger detection before starting countdown."
                >
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min={0}
                            max={60}
                            value={settings.pre_action_delay_mins}
                            onChange={(e) =>
                                updateSettings({
                                    pre_action_delay_mins: Math.max(
                                        0,
                                        Math.min(60, parseInt(e.target.value) || 0),
                                    ),
                                })
                            }
                            className="w-16 rounded-md px-2 py-1 text-sm text-center"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                color: "var(--color-text-primary)",
                                border: "1px solid var(--color-border-default)",
                                outline: "none",
                            }}
                        />
                        <span
                            className="text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            min
                        </span>
                    </div>
                </SettingsRow>
            </SettingsSection>

            {/* Data */}
            <SettingsSection title="Data">
                <div className="flex gap-2 pt-1">
                    <button
                        type="button"
                        onClick={handleClearLogs}
                        className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-warning)",
                            border: "1px solid var(--color-border-default)",
                            cursor: "pointer",
                        }}
                    >
                        Clear All Logs
                    </button>
                    <button
                        type="button"
                        onClick={handleResetSettings}
                        className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            color: "#EF5350",
                            border: "1px solid var(--color-border-default)",
                            cursor: "pointer",
                        }}
                    >
                        Reset to Defaults
                    </button>
                </div>
            </SettingsSection>

            {/* About */}
            <SettingsSection title="About">
                <SettingsRow label="Version" description="Current application version.">
                    <span
                        className="text-xs font-mono"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        v0.1.0-dev
                    </span>
                </SettingsRow>
                <SettingsRow label="Repository" description="View source code on GitHub.">
                    <a
                        href="https://github.com/IamAshrafee/FlowWatcher"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline"
                        style={{ color: "var(--color-accent)" }}
                    >
                        github.com/IamAshrafee/FlowWatcher
                    </a>
                </SettingsRow>
                <SettingsRow label="License" description="Open-source license.">
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        MIT License
                    </span>
                </SettingsRow>
            </SettingsSection>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Settings helper components
// ---------------------------------------------------------------------------

function SettingsSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className="rounded-lg p-4 space-y-3"
            style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                boxShadow: "var(--shadow-card)",
            }}
        >
            <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)" }}
            >
                {title}
            </h3>
            {children}
        </div>
    );
}

function SettingsRow({
    label,
    description,
    children,
}: {
    label: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-1">
            <div>
                <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {label}
                </p>
                <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    {description}
                </p>
            </div>
            <div className="shrink-0 ml-4">{children}</div>
        </div>
    );
}

function ToggleSwitch({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
            style={{
                backgroundColor: checked
                    ? "var(--color-accent)"
                    : "rgba(255,255,255,0.1)",
                cursor: "pointer",
                border: "none",
            }}
        >
            <span
                className="inline-block h-3.5 w-3.5 rounded-full transition-transform"
                style={{
                    backgroundColor: "#fff",
                    transform: checked ? "translateX(18px)" : "translateX(2px)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
            />
        </button>
    );
}

