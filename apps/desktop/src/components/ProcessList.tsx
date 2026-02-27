/**
 * ProcessList — Searchable, scrollable checklist of running processes.
 *
 * Shows processes sorted by network usage with "Suggested" badges.
 * Users check/uncheck processes to add to the watched list.
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useProcessStore } from "@/stores/processStore";
import { formatSpeed } from "@/lib/format";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProcessList() {
    const {
        processList,
        watchedProcesses,
        excludedProcesses,
        searchQuery,
        setSearchQuery,
        toggleWatched,
        isLoading,
    } = useProcessStore();
    const { t } = useTranslation();

    // Filter and sort: suggested first, then by estimated bytes descending.
    const filteredProcesses = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return processList
            .filter(
                (p) =>
                    !excludedProcesses.includes(p.name.toLowerCase()) &&
                    (query === "" || p.name.toLowerCase().includes(query)),
            )
            .sort((a, b) => {
                // Suggested first.
                if (a.is_suggested !== b.is_suggested) {
                    return a.is_suggested ? -1 : 1;
                }
                // Then by usage descending.
                return b.estimated_network_bytes - a.estimated_network_bytes;
            });
    }, [processList, excludedProcesses, searchQuery]);

    return (
        <div className="space-y-3">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    {t("processList.title")}
                </p>
                {watchedProcesses.length > 0 && (
                    <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                            backgroundColor: "rgba(58, 186, 180, 0.1)",
                            color: "var(--color-accent)",
                        }}
                    >
                        {t("processList.selected", { count: watchedProcesses.length })}
                    </span>
                )}
            </div>

            {/* Search input */}
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("processList.searchPlaceholder")}
                    className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors"
                    style={{
                        backgroundColor: "var(--color-base)",
                        color: "var(--color-text-primary)",
                        border: "1px solid var(--color-border-default)",
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                            "var(--color-accent)";
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                            "var(--color-border-default)";
                    }}
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: "var(--color-text-muted)", cursor: "pointer" }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Process list */}
            <div
                className="overflow-y-auto rounded-lg"
                style={{
                    maxHeight: "280px",
                    backgroundColor: "var(--color-base)",
                    border: "1px solid var(--color-border-subtle)",
                }}
            >
                {isLoading && (
                    <p
                        className="p-4 text-center text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        {t("processList.loading")}
                    </p>
                )}

                {!isLoading && filteredProcesses.length === 0 && (
                    <p
                        className="p-4 text-center text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        {searchQuery
                            ? t("processList.noMatch")
                            : t("processList.noProcesses")}
                    </p>
                )}

                {filteredProcesses.map((proc) => {
                    const isChecked = watchedProcesses.includes(proc.name);
                    const { value, unit } = formatSpeed(
                        proc.estimated_network_bytes,
                    );

                    return (
                        <label
                            key={`${proc.pid}-${proc.name}`}
                            className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors"
                            style={{
                                borderBottom:
                                    "1px solid var(--color-border-subtle)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "var(--color-surface)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "transparent";
                            }}
                        >
                            {/* Checkbox */}
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleWatched(proc.name)}
                                className="h-4 w-4 rounded accent-[var(--color-accent)]"
                            />

                            {/* Process name + PID */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="truncate text-sm font-medium"
                                        style={{
                                            color: isChecked
                                                ? "var(--color-accent)"
                                                : "var(--color-text-primary)",
                                        }}
                                    >
                                        {proc.name}
                                    </span>
                                    {proc.is_suggested && (
                                        <span
                                            className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                                            style={{
                                                backgroundColor:
                                                    "rgba(58, 186, 180, 0.12)",
                                                color: "var(--color-accent)",
                                            }}
                                        >
                                            {t("processList.suggested")}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-muted)",
                                    }}
                                >
                                    {t("processList.pid", { pid: proc.pid })}
                                </span>
                            </div>

                            {/* Network usage */}
                            <span
                                className="shrink-0 text-xs tabular-nums"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {value} {unit} ↓
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
