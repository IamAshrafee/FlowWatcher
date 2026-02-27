/**
 * Tauri integration hooks — bridges the Zustand store with the Rust backend.
 *
 * - `useSpeedPolling()` — Polls `get_current_speed` every 1s.
 * - `useAppInit()` — Fetches available triggers, actions, and interface name on mount.
 */

import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useMonitoringStore } from "@/stores/monitoringStore";
import { useProcessStore } from "@/stores/processStore";
import type {
    SpeedData,
    ActionInfo,
    TriggerInfo,
    NetworkInterface,
    ProcessInfo,
} from "@/types";

// ---------------------------------------------------------------------------
// Speed polling (1-second interval)
// ---------------------------------------------------------------------------

/**
 * Polls the backend for current network speed every second and updates
 * the Zustand store. The polling runs only while the component is mounted.
 */
export function useSpeedPolling() {
    const setCurrentSpeed = useMonitoringStore((s) => s.setCurrentSpeed);
    const addSpeedSample = useMonitoringStore((s) => s.addSpeedSample);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        async function poll() {
            try {
                const speed = await invoke<SpeedData>("get_current_speed");
                setCurrentSpeed(speed);
                addSpeedSample(speed);
            } catch {
                // Silently ignore — backend may not be ready yet.
            }
        }

        // Fire immediately, then every 1 second.
        poll();
        intervalRef.current = setInterval(poll, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [setCurrentSpeed, addSpeedSample]);
}

// ---------------------------------------------------------------------------
// App initialisation (fetch triggers, actions, interface)
// ---------------------------------------------------------------------------

/**
 * Fetches available triggers, actions, and the detected network interface
 * from the backend on mount. Runs once.
 */
export function useAppInit() {
    const setAvailableActions = useMonitoringStore(
        (s) => s.setAvailableActions,
    );
    const setAvailableTriggers = useMonitoringStore(
        (s) => s.setAvailableTriggers,
    );
    const setInterfaceName = useMonitoringStore((s) => s.setInterfaceName);

    useEffect(() => {
        async function init() {
            try {
                const [triggers, actions, interfaces] = await Promise.all([
                    invoke<TriggerInfo[]>("get_available_triggers"),
                    invoke<ActionInfo[]>("get_available_actions"),
                    invoke<NetworkInterface[]>("get_network_interfaces"),
                ]);

                setAvailableTriggers(triggers);
                setAvailableActions(actions);

                // Pick the first "up" interface, or the first one overall.
                const active =
                    interfaces.find((i) => i.is_up) ?? interfaces[0];
                if (active) {
                    setInterfaceName(active.name);
                }
            } catch {
                // Backend may not be ready (e.g. running in browser dev mode).
            }
        }

        init();
    }, [setAvailableActions, setAvailableTriggers, setInterfaceName]);
}

// ---------------------------------------------------------------------------
// Process list fetching (for Advanced Mode)
// ---------------------------------------------------------------------------

/**
 * Fetches running processes from the backend and updates the process store.
 * Call this when the Advanced tab is active or when a refresh is needed.
 */
export function useProcesses() {
    async function fetchProcesses() {
        const store = useProcessStore.getState();
        store.setIsLoading(true);
        try {
            const processes = await invoke<ProcessInfo[]>(
                "get_running_processes",
            );
            useProcessStore.getState().setProcessList(processes);
        } catch {
            // Backend may not be ready.
        } finally {
            useProcessStore.getState().setIsLoading(false);
        }
    }

    return { fetchProcesses };
}
