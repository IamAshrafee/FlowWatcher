# Phase 7 — Frontend: Advanced Mode (Process Selection UI) — Completion Report

**Date Completed:** 2026-02-27
**Version:** v0.1.0-dev
**Status:** ✅ Complete

---

## 1. What Was Planned (From Roadmap)

- **7.1** Advanced Tab View — Master toggle switch for "Monitor specific applications".
- **7.2** Process List with Smart Suggestions — Searchable checklist with auto-sort and suggestion badges.
- **7.3** Exclusion List — Permanent "Always Ignore" list for processes.
- **7.4** Dashboard Integration — Trigger sentence updates to show "[N selected apps]" when process mode active.
- **Deferred Items** — PlayAlarmAction (from Phase 2), Combined trigger logic (from Phase 3).

---

## 2. What Was Actually Built

### Implemented ✅

- **7.1 Advanced Tab View** — `AdvancedPage` in `pages/index.tsx`:
  - Master toggle switch at the top: "Monitor specific applications".
  - When disabled: explanatory text about global monitoring.
  - When enabled: reveals process list + exclusion list with fade animation.
  - Toggle syncs process mode to `monitoringStore.config.trigger_type` (switches between `network_idle` and `process_idle`).

- **7.2 Process List** — `ProcessList.tsx`:
  - Fetched from backend via `invoke('get_running_processes')`.
  - Searchable via text input (filters by name, case-insensitive).
  - Each row: `[checkbox] ProcessName (PID) — X.X KB/s ↓`.
  - Auto-sorted: `is_suggested` processes pinned to top, then by `estimated_network_bytes` descending.
  - "Suggested" accent badge on high-usage processes.
  - Selected count badge in header.
  - Excluded processes filtered out automatically.

- **7.3 Exclusion List** — `ExclusionList.tsx`:
  - Text input + "Add" button to add process names.
  - Pill-style chips with per-item remove (✕) button.
  - Adding to exclusion auto-removes from watched list.
  - Empty state message when no exclusions exist.

- **7.4 Dashboard Integration** — `TriggerBuilder.tsx`:
  - When process mode active with selections: sentence shows `[N selected apps] are below...` instead of the Download/Upload dropdown.
  - Grammar adjusts: "is" → "are" for plural.
  - Accent-colored badge for the app count.

- **Process Store** — `processStore.ts` (Zustand):
  - `isProcessModeEnabled`, `watchedProcesses`, `excludedProcesses`, `processList`, `searchQuery`, `isLoading`.
  - Actions: `toggleProcessMode`, `addWatched`, `removeWatched`, `toggleWatched`, `addExcluded`, `removeExcluded`, `setProcessList`, `setSearchQuery`, `clearWatched`.

- **useProcesses Hook** — `useTauri.ts`:
  - `fetchProcesses()` calls `invoke('get_running_processes')` and updates processStore.

### Not Implemented ❌ (Deferred)

- **PlayAlarmAction** — Deferred from Phase 2. Requires `rodio` crate. Planned for Phase 10.
- **Combined trigger logic** — Deferred from Phase 3. The `process_idle` trigger_type is configured in the store but the backend orchestration loop that combines ProcessTrigger + ThresholdCondition doesn't exist yet. Planned for Phase 8.
- **Refresh button auto-polling** — Process list is fetched on toggle-on and via manual refresh button. Auto-polling could be added later.

---

## 3. Strategy & Technical Decisions

### Separate Store
- **Key Decision:** Created a dedicated `processStore.ts` instead of adding to `monitoringStore.ts`. This keeps concerns separated — monitoring config vs process selection are different domains.

### Config Syncing
- **Pattern:** `useEffect` in `AdvancedPage` syncs `processStore` selections into `monitoringStore.config.trigger_type`. When process mode is disabled, it reverts to `network_idle`.

### Dashboard Integration
- **Pattern:** `TriggerBuilder` reads from both stores. When process mode is active, the monitor mode dropdown is replaced with a styled badge showing the count. Zero changes to the InlineSelect component.

---

## 4. Verification Results

| Check | Command | Result |
|-------|---------|--------|
| Frontend Build | `npm run build` | ✅ Pass (47 modules, 1.15s) |
| Core Rust Tests | `cargo test` | ✅ Pass (47 tests, 0 failures) |

---

## 5. Files Created or Modified

| File Path | Action | Purpose |
|-----------|--------|---------|
| `apps/desktop/src/stores/processStore.ts` | Created | Zustand store for process selection state |
| `apps/desktop/src/components/ProcessList.tsx` | Created | Searchable process checklist with suggestions |
| `apps/desktop/src/components/ExclusionList.tsx` | Created | Exclusion list with add/remove pills |
| `apps/desktop/src/pages/index.tsx` | Modified | Replaced AdvancedPage placeholder with full UI |
| `apps/desktop/src/hooks/useTauri.ts` | Modified | Added `useProcesses()` hook |
| `apps/desktop/src/components/TriggerBuilder.tsx` | Modified | Dashboard integration: "[N selected apps]" |

---

## 6. Next Phase

- **Next Phase:** Phase 8 — Safety UI: Countdown & Warning System
- **Blocked By:** Nothing — Phase 7 is fully complete
- **Ready to Start:** ✅ Yes
