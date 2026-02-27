/**
 * SpeedCard — displays a live download or upload speed value.
 *
 * Auto-scales units (B/s → KB/s → MB/s → GB/s).
 * Includes a sparkline mini-graph and an optional interface badge.
 */

import { formatSpeed } from "@/lib/format";
import { Sparkline } from "./Sparkline";

interface SpeedCardProps {
    label: string;
    bps: number;
    icon: "download" | "upload";
    /** Historical data points for sparkline. */
    history?: number[];
    /** Detected network interface name. */
    interfaceName?: string;
}

export function SpeedCard({
    label,
    bps,
    icon,
    history = [],
    interfaceName,
}: SpeedCardProps) {
    const { value, unit } = formatSpeed(bps);

    return (
        <div
            className="relative overflow-hidden rounded-lg p-4"
            style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                boxShadow: "var(--shadow-card)",
            }}
        >
            {/* Top label row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <p
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        {label}
                    </p>
                    {interfaceName && (
                        <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                                backgroundColor: "rgba(58, 186, 180, 0.08)",
                                color: "var(--color-accent-muted)",
                                border: "1px solid rgba(58, 186, 180, 0.12)",
                            }}
                        >
                            {interfaceName}
                        </span>
                    )}
                </div>
                <span
                    style={{ color: "var(--color-text-muted)", fontSize: "14px" }}
                >
                    {icon === "download" ? "↓" : "↑"}
                </span>
            </div>

            {/* Speed value */}
            <p
                className="mt-2 text-3xl font-bold tabular-nums"
                style={{ color: "var(--color-accent)" }}
            >
                {value}
            </p>

            {/* Unit */}
            <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {unit}
            </p>

            {/* Sparkline */}
            <div className="mt-2">
                <Sparkline data={history} width={200} height={32} />
            </div>

            {/* Subtle accent glow when speed > 0 */}
            {bps > 0 && (
                <div
                    className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10"
                    style={{ backgroundColor: "var(--color-accent)" }}
                />
            )}
        </div>
    );
}
