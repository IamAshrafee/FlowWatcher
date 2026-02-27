/**
 * InlineSelect — a minimal inline dropdown styled as part of a sentence.
 *
 * Used inside the Natural Language Trigger Builder to make
 * configurable values look like interactive text.
 */

import { useState, useRef, useEffect, type ReactNode } from "react";

interface InlineSelectProps<T extends string> {
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
    children?: ReactNode;
}

export function InlineSelect<T extends string>({
    value,
    options,
    onChange,
}: InlineSelectProps<T>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selectedLabel =
        options.find((o) => o.value === value)?.label ?? value;

    // Close on click outside.
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <span className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-base font-semibold transition-colors"
                style={{
                    color: "var(--color-accent)",
                    backgroundColor: "rgba(58, 186, 180, 0.1)",
                    border: "1px solid rgba(58, 186, 180, 0.2)",
                    cursor: "pointer",
                    transitionDuration: "var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(58, 186, 180, 0.2)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(58, 186, 180, 0.1)";
                }}
            >
                {selectedLabel}
                <span className="text-xs opacity-60">▾</span>
            </button>

            {open && (
                <div
                    className="absolute left-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg py-1 animate-fade-in"
                    style={{
                        backgroundColor: "var(--color-elevated)",
                        border: "1px solid var(--color-border-default)",
                        boxShadow: "var(--shadow-elevated)",
                    }}
                >
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            className="flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors"
                            style={{
                                color:
                                    opt.value === value
                                        ? "var(--color-accent)"
                                        : "var(--color-text-primary)",
                                backgroundColor:
                                    opt.value === value
                                        ? "rgba(58, 186, 180, 0.1)"
                                        : "transparent",
                                border: "none",
                                cursor: "pointer",
                                transitionDuration: "var(--transition-fast)",
                            }}
                            onMouseEnter={(e) => {
                                if (opt.value !== value) {
                                    e.currentTarget.style.backgroundColor =
                                        "var(--color-surface-hover)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (opt.value !== value) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </span>
    );
}

// ---------------------------------------------------------------------------
// InlineNumberInput — editable number within the sentence
// ---------------------------------------------------------------------------

interface InlineNumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}

export function InlineNumberInput({
    value,
    onChange,
    min = 1,
    max = 9999,
}: InlineNumberInputProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    function commit() {
        const parsed = parseInt(draft, 10);
        if (!isNaN(parsed) && parsed >= min && parsed <= max) {
            onChange(parsed);
        } else {
            setDraft(String(value));
        }
        setEditing(false);
    }

    if (editing) {
        return (
            <input
                ref={inputRef}
                type="number"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") {
                        setDraft(String(value));
                        setEditing(false);
                    }
                }}
                className="inline-block w-16 rounded-md px-2 py-0.5 text-center text-base font-semibold tabular-nums"
                style={{
                    color: "var(--color-accent)",
                    backgroundColor: "rgba(58, 186, 180, 0.1)",
                    border: "1px solid var(--color-accent)",
                    outline: "none",
                    userSelect: "text",
                }}
                min={min}
                max={max}
            />
        );
    }

    return (
        <button
            type="button"
            onClick={() => {
                setDraft(String(value));
                setEditing(true);
            }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-base font-semibold tabular-nums transition-colors"
            style={{
                color: "var(--color-accent)",
                backgroundColor: "rgba(58, 186, 180, 0.1)",
                border: "1px solid rgba(58, 186, 180, 0.2)",
                cursor: "pointer",
                transitionDuration: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(58, 186, 180, 0.2)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(58, 186, 180, 0.1)";
            }}
        >
            {value}
        </button>
    );
}
