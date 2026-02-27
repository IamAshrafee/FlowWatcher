/**
 * Utility functions for formatting speed values, durations, etc.
 */

/**
 * Format bytes-per-second into a human-readable speed string.
 * Auto-scales from B/s → KB/s → MB/s → GB/s.
 */
export function formatSpeed(bps: number): { value: string; unit: string } {
    if (bps < 1024) {
        return { value: bps.toFixed(0), unit: "B/s" };
    }
    if (bps < 1024 * 1024) {
        return { value: (bps / 1024).toFixed(1), unit: "KB/s" };
    }
    if (bps < 1024 * 1024 * 1024) {
        return { value: (bps / (1024 * 1024)).toFixed(2), unit: "MB/s" };
    }
    return { value: (bps / (1024 * 1024 * 1024)).toFixed(2), unit: "GB/s" };
}

/**
 * Convert a threshold value + unit to bytes per second.
 */
export function thresholdToBytes(
    value: number,
    unit: "KB/s" | "MB/s",
): number {
    return unit === "MB/s" ? value * 1024 * 1024 : value * 1024;
}

/**
 * Convert bytes per second back to a display value + unit.
 */
export function bytesToThreshold(bps: number): { value: number; unit: "KB/s" | "MB/s" } {
    if (bps >= 1024 * 1024) {
        return { value: Math.round(bps / (1024 * 1024)), unit: "MB/s" };
    }
    return { value: Math.round(bps / 1024), unit: "KB/s" };
}

/**
 * Convert duration seconds + unit to total seconds.
 */
export function durationToSeconds(
    value: number,
    unit: "seconds" | "minutes",
): number {
    return unit === "minutes" ? value * 60 : value;
}

/**
 * Convert seconds back to a display value + unit.
 */
export function secondsToDuration(secs: number): { value: number; unit: "seconds" | "minutes" } {
    if (secs >= 60 && secs % 60 === 0) {
        return { value: secs / 60, unit: "minutes" };
    }
    return { value: secs, unit: "seconds" };
}

/**
 * Get the display label for a monitor mode.
 */
export function monitorModeLabel(
    mode: "download_only" | "upload_only" | "both",
): string {
    switch (mode) {
        case "download_only":
            return "Download";
        case "upload_only":
            return "Upload";
        case "both":
            return "Download + Upload";
    }
}

/**
 * Get the display label for an action type.
 */
export function actionLabel(actionType: string): string {
    const labels: Record<string, string> = {
        shutdown: "Shut Down",
        restart: "Restart",
        sleep: "Sleep",
        hibernate: "Hibernate",
        sign_out: "Sign Out",
        lock_screen: "Lock Screen",
    };
    return labels[actionType] ?? actionType;
}
