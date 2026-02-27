/**
 * Monitoring Store — Zustand state for the monitoring engine.
 *
 * Holds config, status, speed data, and actions for start/stop/update.
 * This is the central state that connects the Dashboard UI to the
 * Tauri backend.
 */

import { create } from "zustand";
import type {
    MonitoringConfig,
    MonitoringStatus,
    SpeedData,
    ActionInfo,
    TriggerInfo,
} from "@/types";

// ---------------------------------------------------------------------------
// Default config values
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: MonitoringConfig = {
    trigger_type: {
        type: "network_idle",
        interface_id: "auto",
    },
    condition: {
        threshold_bytes_per_sec: 200 * 1024, // 200 KB/s
        required_duration_secs: 120, // 2 minutes
        monitor_mode: "download_only",
    },
    action_type: "shutdown",
    pre_warning_secs: 60,
    countdown_secs: 30,
};

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

/** Maximum number of speed samples kept for sparkline graphs. */
const MAX_SPEED_HISTORY = 30;

interface MonitoringState {
    /** Current monitoring configuration. */
    config: MonitoringConfig;
    /** Current monitoring status from backend. */
    status: MonitoringStatus;
    /** Real-time speed data. */
    currentSpeed: SpeedData;
    /** Historical speed samples for sparkline (most recent last). */
    speedHistory: SpeedData[];
    /** Detected network interface name. */
    interfaceName: string;
    /** Available action types from backend. */
    availableActions: ActionInfo[];
    /** Available trigger types from backend. */
    availableTriggers: TriggerInfo[];

    // Actions
    updateConfig: (partial: Partial<MonitoringConfig>) => void;
    updateCondition: (
        partial: Partial<MonitoringConfig["condition"]>,
    ) => void;
    setStatus: (status: MonitoringStatus) => void;
    setCurrentSpeed: (speed: SpeedData) => void;
    addSpeedSample: (speed: SpeedData) => void;
    setInterfaceName: (name: string) => void;
    setAvailableActions: (actions: ActionInfo[]) => void;
    setAvailableTriggers: (triggers: TriggerInfo[]) => void;
    resetConfig: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useMonitoringStore = create<MonitoringState>((set) => ({
    config: DEFAULT_CONFIG,
    status: { status: "Idle" },
    currentSpeed: { download_bps: 0, upload_bps: 0 },
    speedHistory: [],
    interfaceName: "Auto-detect",
    availableActions: [],
    availableTriggers: [],

    updateConfig: (partial) =>
        set((state) => ({ config: { ...state.config, ...partial } })),

    updateCondition: (partial) =>
        set((state) => ({
            config: {
                ...state.config,
                condition: { ...state.config.condition, ...partial },
            },
        })),

    setStatus: (status) => set({ status }),
    setCurrentSpeed: (currentSpeed) => set({ currentSpeed }),
    addSpeedSample: (speed) =>
        set((state) => ({
            speedHistory: [
                ...state.speedHistory.slice(-(MAX_SPEED_HISTORY - 1)),
                speed,
            ],
        })),
    setInterfaceName: (interfaceName) => set({ interfaceName }),
    setAvailableActions: (availableActions) => set({ availableActions }),
    setAvailableTriggers: (availableTriggers) => set({ availableTriggers }),
    resetConfig: () => set({ config: DEFAULT_CONFIG }),
}));
