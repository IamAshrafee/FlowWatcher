/**
 * ToastNotification — Slide-in notification for safety events.
 *
 * Used for pre-warning alerts and post-action feedback.
 * Slides in from the top-right and auto-dismisses.
 */

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastType = "info" | "warning" | "success" | "error";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

// ---------------------------------------------------------------------------
// Toast Store (simple module-level state)
// ---------------------------------------------------------------------------

type ToastListener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let listeners: ToastListener[] = [];
let nextId = 0;

function notify() {
    listeners.forEach((l) => l([...toasts]));
}

/** Add a toast notification. */
export function showToast(
    message: string,
    type: ToastType = "info",
    duration = 5000,
) {
    const id = `toast-${++nextId}`;
    toasts = [...toasts, { id, message, type, duration }];
    notify();

    if (duration > 0) {
        setTimeout(() => {
            dismissToast(id);
        }, duration);
    }
}

/** Remove a toast by id. */
export function dismissToast(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
}

/** Hook to subscribe to toast state. */
function useToastState(): Toast[] {
    const [state, setState] = useState<Toast[]>([]);

    useEffect(() => {
        listeners.push(setState);
        return () => {
            listeners = listeners.filter((l) => l !== setState);
        };
    }, []);

    return state;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const TOAST_STYLES: Record<
    ToastType,
    { bg: string; border: string; color: string; icon: string }
> = {
    info: {
        bg: "rgba(58, 186, 180, 0.08)",
        border: "rgba(58, 186, 180, 0.2)",
        color: "var(--color-accent)",
        icon: "ℹ",
    },
    warning: {
        bg: "rgba(255, 183, 77, 0.08)",
        border: "rgba(255, 183, 77, 0.2)",
        color: "#FFB74D",
        icon: "⚠",
    },
    success: {
        bg: "rgba(102, 187, 106, 0.08)",
        border: "rgba(102, 187, 106, 0.2)",
        color: "#66BB6A",
        icon: "✓",
    },
    error: {
        bg: "rgba(229, 115, 115, 0.08)",
        border: "rgba(229, 115, 115, 0.2)",
        color: "var(--color-warning)",
        icon: "✕",
    },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ToastContainer() {
    const activeToasts = useToastState();

    if (activeToasts.length === 0) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: "16px",
                right: "16px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxWidth: "360px",
            }}
        >
            {activeToasts.map((toast) => {
                const style = TOAST_STYLES[toast.type];
                return (
                    <div
                        key={toast.id}
                        className="animate-slide-in-right"
                        style={{
                            backgroundColor: style.bg,
                            border: `1px solid ${style.border}`,
                            borderRadius: "8px",
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            backdropFilter: "blur(12px)",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                        }}
                    >
                        <span
                            style={{
                                color: style.color,
                                fontSize: "16px",
                                lineHeight: "1.4",
                                flexShrink: 0,
                            }}
                        >
                            {style.icon}
                        </span>
                        <p
                            style={{
                                color: "var(--color-text-primary)",
                                fontSize: "13px",
                                lineHeight: "1.4",
                                margin: 0,
                                flex: 1,
                            }}
                        >
                            {toast.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => dismissToast(toast.id)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--color-text-muted)",
                                cursor: "pointer",
                                fontSize: "12px",
                                padding: 0,
                                lineHeight: 1,
                                flexShrink: 0,
                            }}
                        >
                            ✕
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
