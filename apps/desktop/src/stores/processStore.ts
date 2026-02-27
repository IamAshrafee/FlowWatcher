/**
 * Process Store — Zustand state for process-based monitoring (Advanced Mode).
 *
 * Manages the watched/excluded process lists, process mode toggle,
 * and the fetched process list from the backend.
 */

import { create } from "zustand";
import type { ProcessInfo } from "@/types";

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface ProcessState {
    /** Whether process-based monitoring is enabled. */
    isProcessModeEnabled: boolean;
    /** Names of processes the user wants to watch. */
    watchedProcesses: string[];
    /** Names of processes to always ignore. */
    excludedProcesses: string[];
    /** Processes fetched from the backend. */
    processList: ProcessInfo[];
    /** Search/filter query for the process list. */
    searchQuery: string;
    /** Whether processes are currently being fetched. */
    isLoading: boolean;

    // Actions
    toggleProcessMode: () => void;
    setProcessModeEnabled: (enabled: boolean) => void;
    addWatched: (name: string) => void;
    removeWatched: (name: string) => void;
    toggleWatched: (name: string) => void;
    addExcluded: (name: string) => void;
    removeExcluded: (name: string) => void;
    setProcessList: (list: ProcessInfo[]) => void;
    setSearchQuery: (query: string) => void;
    setIsLoading: (loading: boolean) => void;
    clearWatched: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useProcessStore = create<ProcessState>((set) => ({
    isProcessModeEnabled: false,
    watchedProcesses: [],
    excludedProcesses: [],
    processList: [],
    searchQuery: "",
    isLoading: false,

    toggleProcessMode: () =>
        set((s) => ({ isProcessModeEnabled: !s.isProcessModeEnabled })),
    setProcessModeEnabled: (enabled) =>
        set({ isProcessModeEnabled: enabled }),

    addWatched: (name) =>
        set((s) => ({
            watchedProcesses: s.watchedProcesses.includes(name)
                ? s.watchedProcesses
                : [...s.watchedProcesses, name],
        })),
    removeWatched: (name) =>
        set((s) => ({
            watchedProcesses: s.watchedProcesses.filter((n) => n !== name),
        })),
    toggleWatched: (name) =>
        set((s) => ({
            watchedProcesses: s.watchedProcesses.includes(name)
                ? s.watchedProcesses.filter((n) => n !== name)
                : [...s.watchedProcesses, name],
        })),

    addExcluded: (name) =>
        set((s) => ({
            excludedProcesses: s.excludedProcesses.includes(name)
                ? s.excludedProcesses
                : [...s.excludedProcesses, name],
            // Also remove from watched if it was there.
            watchedProcesses: s.watchedProcesses.filter((n) => n !== name),
        })),
    removeExcluded: (name) =>
        set((s) => ({
            excludedProcesses: s.excludedProcesses.filter((n) => n !== name),
        })),

    setProcessList: (list) => set({ processList: list }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    clearWatched: () => set({ watchedProcesses: [] }),
}));
