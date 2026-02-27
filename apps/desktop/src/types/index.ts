/**
 * FlowWatcher shared TypeScript type definitions.
 *
 * These types mirror the Rust structs used in Tauri commands,
 * ensuring type-safe communication between frontend and backend.
 */

// ---------------------------------------------------------------------------
// Network types
// ---------------------------------------------------------------------------

/** Information about a network interface. */
export interface NetworkInterface {
    id: string;
    name: string;
    mac: string;
    is_up: boolean;
}

/** Real-time speed data. */
export interface SpeedData {
    download_bps: number;
    upload_bps: number;
}

// ---------------------------------------------------------------------------
// Process types
// ---------------------------------------------------------------------------

/** Information about a running process. */
export interface ProcessInfo {
    pid: number;
    name: string;
    path: string | null;
    estimated_network_bytes: number;
    is_suggested: boolean;
}

// ---------------------------------------------------------------------------
// Monitoring types
// ---------------------------------------------------------------------------

/** Monitoring status reported by the backend. */
export type MonitoringStatus =
    | { status: "Idle" }
    | { status: "Monitoring" }
    | { status: "TriggerPending" }
    | { status: "Countdown"; data: { remaining_secs: number } }
    | { status: "Executed" }
    | { status: "Paused" };

/** Trigger-specific configuration (discriminated union). */
export type TriggerConfig =
    | {
        type: "network_idle";
        interface_id: string;
    }
    | {
        type: "process_idle";
        watched_processes: string[];
        excluded_processes: string[];
        threshold_bytes: number;
    };

/** Condition configuration. */
export interface ConditionConfig {
    threshold_bytes_per_sec: number;
    required_duration_secs: number;
    monitor_mode: "download_only" | "upload_only" | "both";
}

/** Full monitoring configuration sent to start_monitoring. */
export interface MonitoringConfig {
    trigger_type: TriggerConfig;
    condition: ConditionConfig;
    action_type: string;
    pre_warning_secs: number;
    countdown_secs: number;
}

// ---------------------------------------------------------------------------
// Discovery types
// ---------------------------------------------------------------------------

/** Trigger type metadata. */
export interface TriggerInfo {
    id: string;
    name: string;
    description: string;
}

/** Action type metadata. */
export interface ActionInfo {
    id: string;
    name: string;
    description: string;
    available: boolean;
}

// ---------------------------------------------------------------------------
// Event payload types
// ---------------------------------------------------------------------------

/** Payload for 'speed-update' event. */
export interface SpeedUpdateEvent {
    download_bps: number;
    upload_bps: number;
}

/** Payload for 'monitoring-state-change' event. */
export interface StateChangeEvent {
    previous: MonitoringStatus;
    current: MonitoringStatus;
}

/** Payload for 'countdown-tick' event. */
export interface CountdownTickEvent {
    remaining_seconds: number;
    total_seconds: number;
}

/** Payload for 'pre-warning' event. */
export interface PreWarningEvent {
    seconds_until_countdown: number;
    action_name: string;
}

// ---------------------------------------------------------------------------
// Settings types
// ---------------------------------------------------------------------------

/** Application settings. */
export interface AppSettings {
    /** Language code (e.g., "en", "bn"). */
    language: string;
    /** Theme: "dark", "light", or "auto". */
    theme: "dark" | "light" | "auto";
    /** Start with Windows. */
    auto_start: boolean;
    /** Minimize to tray on close. */
    minimize_to_tray: boolean;
    /** Show desktop notification before action. */
    show_notifications: boolean;
    /** Auto-save settings on every change. */
    auto_save: boolean;
    /** Minutes to wait after detection before countdown. */
    pre_action_delay_mins: number;
    /** Keep screen on during monitoring. */
    keep_screen_on: boolean;
    /** Whether activity logging is enabled. */
    activity_logging: boolean;
    /** Default monitoring config. */
    default_config: MonitoringConfig | null;
}

// ---------------------------------------------------------------------------
// Log types
// ---------------------------------------------------------------------------

/** A log entry from the activity log. */
export interface LogEntry {
    timestamp: string;
    trigger_reason: string;
    action_name: string;
    status: "executed" | "cancelled" | "error" | "info";
    details: string | null;
}
