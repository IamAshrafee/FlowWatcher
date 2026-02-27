/**
 * useCountdown — Hook for managing the countdown safety flow.
 *
 * States: idle → pre-warning → countdown → executed/cancelled
 *
 * The hook manages the countdown timer on the frontend side,
 * calling Tauri commands for cancel/execute actions.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { showToast } from "@/components/ToastNotification";
import { useMonitoringStore } from "@/stores/monitoringStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CountdownPhase = "idle" | "pre-warning" | "countdown" | "executed" | "cancelled";

interface CountdownState {
    /** Current phase of the countdown flow. */
    phase: CountdownPhase;
    /** Seconds remaining in the countdown (only valid during "countdown" phase). */
    remainingSeconds: number;
    /** Total countdown seconds (for progress ring). */
    totalSeconds: number;
    /** Name of the action about to execute. */
    actionName: string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCountdown() {
    const { config } = useMonitoringStore();
    const [state, setState] = useState<CountdownState>({
        phase: "idle",
        remainingSeconds: 0,
        totalSeconds: 0,
        actionName: "",
    });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const preWarningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Resolve action name from config.
    const resolveActionName = useCallback((): string => {
        const actionType = config.action_type;
        const names: Record<string, string> = {
            shutdown: "Shutting down...",
            restart: "Restarting...",
            sleep: "Sleeping...",
            hibernate: "Hibernating...",
            lock_screen: "Locking screen...",
            log_off: "Logging off...",
        };
        return names[actionType] || `Executing ${actionType}...`;
    }, [config.action_type]);

    // Clean up all timers.
    const clearTimers = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (preWarningTimerRef.current) {
            clearTimeout(preWarningTimerRef.current);
            preWarningTimerRef.current = null;
        }
    }, []);

    // Start the countdown flow (pre-warning → countdown).
    const startCountdown = useCallback(() => {
        const actionName = resolveActionName();
        const preWarningSecs = config.pre_warning_secs;
        const countdownSecs = config.countdown_secs;

        clearTimers();

        // Phase 1: Pre-warning.
        setState({
            phase: "pre-warning",
            remainingSeconds: countdownSecs,
            totalSeconds: countdownSecs,
            actionName,
        });

        showToast(
            `Network idle detected. Action will execute in ${preWarningSecs} seconds.`,
            "warning",
            preWarningSecs * 1000,
        );

        // After pre-warning period, start countdown.
        preWarningTimerRef.current = setTimeout(() => {
            setState((s) => ({
                ...s,
                phase: "countdown",
                remainingSeconds: countdownSecs,
            }));

            // Tick down every second.
            timerRef.current = setInterval(() => {
                setState((prev) => {
                    if (prev.remainingSeconds <= 1) {
                        // Countdown finished → execute.
                        clearTimers();
                        handleExecute(actionName);
                        return { ...prev, phase: "executed", remainingSeconds: 0 };
                    }
                    return {
                        ...prev,
                        remainingSeconds: prev.remainingSeconds - 1,
                    };
                });
            }, 1000);
        }, preWarningSecs * 1000);
    }, [config, resolveActionName, clearTimers]);

    // Handle execution.
    const handleExecute = useCallback(
        async (actionName: string) => {
            clearTimers();
            try {
                await invoke("execute_action_now");
            } catch {
                // May fail if no action is actually scheduled on the backend.
            }
            showToast(`${actionName.replace("...", "")} executed.`, "info", 4000);
            useMonitoringStore.getState().setStatus({ status: "Executed" });
        },
        [clearTimers],
    );

    // Cancel the countdown.
    const cancel = useCallback(async () => {
        clearTimers();
        setState((s) => ({ ...s, phase: "cancelled", remainingSeconds: 0 }));
        try {
            await invoke("cancel_action");
        } catch {
            // May fail if nothing to cancel.
        }
        showToast("Action cancelled. Monitoring paused.", "success", 4000);
        useMonitoringStore.getState().setStatus({ status: "Paused" });

        // Reset to idle after a brief moment.
        setTimeout(() => {
            setState({
                phase: "idle",
                remainingSeconds: 0,
                totalSeconds: 0,
                actionName: "",
            });
        }, 1000);
    }, [clearTimers]);

    // Execute now (skip remaining countdown).
    const executeNow = useCallback(async () => {
        const actionName = state.actionName;
        clearTimers();
        setState((s) => ({ ...s, phase: "executed", remainingSeconds: 0 }));
        await handleExecute(actionName);
    }, [state.actionName, clearTimers, handleExecute]);

    // Cleanup on unmount.
    useEffect(() => {
        return () => clearTimers();
    }, [clearTimers]);

    return {
        countdownState: state,
        startCountdown,
        cancelCountdown: cancel,
        executeNow,
        isCountdownActive: state.phase === "countdown",
        isPreWarning: state.phase === "pre-warning",
    };
}
