/**
 * TriggerBuilder — Natural Language Trigger Configuration.
 *
 * Renders as a readable sentence with inline interactive elements:
 * "When [Download ▾] is below [200] [KB/s ▾] for [2] [min ▾], then [Shutdown ▾] the PC."
 *
 * ⚠️ Strategic Shift: Action options are loaded dynamically from the backend
 * via `get_available_actions()`. When a new action is implemented in Rust,
 * it appears here automatically — no frontend code changes needed.
 */

import { useMemo } from "react";
import { useMonitoringStore } from "@/stores/monitoringStore";
import {
    bytesToThreshold,
    thresholdToBytes,
    secondsToDuration,
    durationToSeconds,
} from "@/lib/format";
import { InlineSelect, InlineNumberInput } from "./InlineSelect";

// ---------------------------------------------------------------------------
// Static options (these don't come from backend)
// ---------------------------------------------------------------------------

const MONITOR_MODE_OPTIONS = [
    { value: "download_only" as const, label: "Download" },
    { value: "upload_only" as const, label: "Upload" },
    { value: "both" as const, label: "Download + Upload" },
];

const THRESHOLD_UNIT_OPTIONS = [
    { value: "KB/s" as const, label: "KB/s" },
    { value: "MB/s" as const, label: "MB/s" },
];

const DURATION_UNIT_OPTIONS = [
    { value: "seconds" as const, label: "sec" },
    { value: "minutes" as const, label: "min" },
];

/** Fallback when backend hasn't provided actions yet. */
const FALLBACK_ACTION_OPTIONS = [
    { value: "shutdown", label: "Shut Down" },
    { value: "restart", label: "Restart" },
    { value: "sleep", label: "Sleep" },
    { value: "hibernate", label: "Hibernate" },
    { value: "sign_out", label: "Sign Out" },
    { value: "lock_screen", label: "Lock Screen" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TriggerBuilder() {
    const { config, availableActions, updateConfig, updateCondition } =
        useMonitoringStore();

    // Derive display values from internal byte/second representations.
    const threshold = bytesToThreshold(config.condition.threshold_bytes_per_sec);
    const duration = secondsToDuration(config.condition.required_duration_secs);

    // ⚠️ Strategic Shift: use backend-provided actions when available.
    const actionOptions = useMemo(() => {
        if (availableActions.length > 0) {
            return availableActions
                .filter((a) => a.available)
                .map((a) => ({ value: a.id, label: a.name }));
        }
        return FALLBACK_ACTION_OPTIONS;
    }, [availableActions]);

    return (
        <div
            className="rounded-lg p-5"
            style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                boxShadow: "var(--shadow-card)",
            }}
        >
            <p
                className="mb-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)" }}
            >
                Trigger Configuration
            </p>

            <p
                className="text-base leading-relaxed"
                style={{ color: "var(--color-text-secondary)", lineHeight: "2.2" }}
            >
                When{" "}
                <InlineSelect
                    value={config.condition.monitor_mode}
                    options={MONITOR_MODE_OPTIONS}
                    onChange={(mode) => updateCondition({ monitor_mode: mode })}
                />{" "}
                is below{" "}
                <InlineNumberInput
                    value={threshold.value}
                    onChange={(val) =>
                        updateCondition({
                            threshold_bytes_per_sec: thresholdToBytes(
                                val,
                                threshold.unit,
                            ),
                        })
                    }
                    min={1}
                    max={9999}
                />{" "}
                <InlineSelect
                    value={threshold.unit}
                    options={THRESHOLD_UNIT_OPTIONS}
                    onChange={(unit) =>
                        updateCondition({
                            threshold_bytes_per_sec: thresholdToBytes(
                                threshold.value,
                                unit,
                            ),
                        })
                    }
                />{" "}
                for{" "}
                <InlineNumberInput
                    value={duration.value}
                    onChange={(val) =>
                        updateCondition({
                            required_duration_secs: durationToSeconds(val, duration.unit),
                        })
                    }
                    min={1}
                    max={999}
                />{" "}
                <InlineSelect
                    value={duration.unit}
                    options={DURATION_UNIT_OPTIONS}
                    onChange={(unit) =>
                        updateCondition({
                            required_duration_secs: durationToSeconds(
                                duration.value,
                                unit,
                            ),
                        })
                    }
                />
                , then{" "}
                <InlineSelect
                    value={config.action_type}
                    options={actionOptions}
                    onChange={(action) => updateConfig({ action_type: action })}
                />{" "}
                the PC.
            </p>
        </div>
    );
}
