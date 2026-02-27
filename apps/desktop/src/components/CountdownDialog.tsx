/**
 * CountdownDialog — Fullscreen countdown overlay.
 *
 * Shows a large countdown number, action name, cancel button,
 * and execute-now button. Esc key cancels. This is the core
 * safety UI that prevents accidental actions.
 */

import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CountdownDialogProps {
    /** Remaining seconds in the countdown. */
    remainingSeconds: number;
    /** Total countdown duration for the progress ring. */
    totalSeconds: number;
    /** Name of the action about to execute. */
    actionName: string;
    /** Called when the user cancels. */
    onCancel: () => void;
    /** Called when the user clicks Execute Now. */
    onExecuteNow: () => void;
    /** Whether the dialog is visible. */
    isOpen: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CountdownDialog({
    remainingSeconds,
    totalSeconds,
    actionName,
    onCancel,
    onExecuteNow,
    isOpen,
}: CountdownDialogProps) {
    const { t } = useTranslation();
    // Esc key to cancel.
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                e.preventDefault();
                onCancel();
            }
        },
        [isOpen, onCancel],
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    if (!isOpen) return null;

    // Progress ring calculations.
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
    const dashOffset = circumference * (1 - progress);

    // Color transitions: green → yellow → red.
    const pct = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
    const ringColor =
        pct > 0.5
            ? "var(--color-accent)"
            : pct > 0.2
                ? "#FFB74D"
                : "var(--color-warning)";

    return (
        <div
            className="animate-fade-in"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                backdropFilter: "blur(8px)",
            }}
        >
            {/* Action label */}
            <p
                style={{
                    color: "var(--color-text-muted)",
                    fontSize: "14px",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: "24px",
                    fontWeight: 500,
                }}
            >
                {actionName}
            </p>

            {/* Progress ring + countdown number */}
            <div
                style={{
                    position: "relative",
                    width: "200px",
                    height: "200px",
                    marginBottom: "32px",
                }}
            >
                <svg
                    width="200"
                    height="200"
                    style={{
                        transform: "rotate(-90deg)",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                >
                    {/* Background ring */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="6"
                    />
                    {/* Progress ring */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
                    />
                </svg>

                {/* Countdown number */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: "64px",
                            fontWeight: 700,
                            color: ringColor,
                            fontVariantNumeric: "tabular-nums",
                            transition: "color 0.5s ease",
                        }}
                    >
                        {remainingSeconds}
                    </span>
                </div>
            </div>

            {/* Buttons */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                }}
            >
                {/* Cancel — primary, large, obvious */}
                <button
                    type="button"
                    onClick={onCancel}
                    autoFocus
                    style={{
                        backgroundColor: "var(--color-accent)",
                        color: "var(--color-text-inverse)",
                        border: "none",
                        borderRadius: "10px",
                        padding: "14px 48px",
                        fontSize: "16px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        boxShadow: "0 4px 20px rgba(58, 186, 180, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.03)";
                        e.currentTarget.style.boxShadow =
                            "0 6px 24px rgba(58, 186, 180, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow =
                            "0 4px 20px rgba(58, 186, 180, 0.3)";
                    }}
                >
                    {t("countdown.cancel")}
                </button>

                {/* Execute Now — subtle secondary */}
                <button
                    type="button"
                    onClick={onExecuteNow}
                    style={{
                        background: "none",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "8px",
                        padding: "8px 24px",
                        color: "var(--color-text-muted)",
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "color 0.15s ease, border-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--color-warning)";
                        e.currentTarget.style.borderColor = "rgba(229, 115, 115, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--color-text-muted)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    }}
                >
                    {t("countdown.executeNow")}
                </button>

                {/* Esc hint */}
                <p
                    style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "11px",
                        marginTop: "8px",
                    }}
                >
                    {t("countdown.escToCancel", { defaultValue: "Press Esc to cancel" })}
                </p>
            </div>
        </div>
    );
}
