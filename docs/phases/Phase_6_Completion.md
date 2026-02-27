# Phase 6 — Frontend: Dashboard (Core Monitoring UI) — Completion Report

**Date Completed:** 2026-02-27
**Version:** v0.1.0-dev
**Status:** ✅ Complete

---

## 1. What Was Planned (From Roadmap)

- **6.1** Real-Time Speed Display — Two cards with live download/upload speeds, auto-scaling units, sparkline graph, interface badge.
- **6.2** Natural Language Trigger Builder — Readable sentence with inline interactive dropdowns for all config values.
- **6.3** Start/Stop Monitoring Button — Large accent button that transforms between Start/Stop states with pulsing dot.
- **6.4** Monitoring Status Indicator — Status badge in header: Idle → Monitoring → TriggerPending → Countdown → Executed.
- **6.5** Zustand State Store — `useMonitoringStore` with config, status, speed data, and actions.

---

## 2. What Was Actually Built

### Implemented ✅

- **6.1 Real-Time Speed Display** — `SpeedCard.tsx` with:
  - Auto-scaling speed formatting (B/s → KB/s → MB/s → GB/s) via `format.ts`.
  - SVG sparkline mini-graph (`Sparkline.tsx`) showing last 30 data points with gradient fill.
  - Network interface badge ("Auto-detected: Wi-Fi") on the download card.
  - Accent glow effect when speed > 0.

- **6.2 Natural Language Trigger Builder** — `TriggerBuilder.tsx` + `InlineSelect.tsx`:
  - Sentence: *"When [Download ▾] is below [200] [KB/s ▾] for [2] [min ▾], then [Shut Down ▾] the PC."*
  - Each bracketed value is an interactive `InlineSelect` popover or `InlineNumberInput`.
  - Options: Monitor mode (Download/Upload/Both), threshold value + unit (KB/s, MB/s), duration value + unit (sec, min), action (Shutdown, Restart, Sleep, Hibernate, Sign Out, Lock Screen).

- **6.3 Start/Stop Button** — Large accent button with:
  - Tauri `invoke('start_monitoring', { config })` and `invoke('stop_monitoring')` calls.
  - Pulsing dot indicator during monitoring.
  - Graceful fallback for browser-only dev mode (mock toggle if invoke fails).

- **6.4 Monitoring Status Indicator** — Two levels:
  - `StatusBadge` in `AppShell.tsx` header — connected to Zustand store, shows real-time state with color-coded dot.
  - Status banner in Dashboard — contextual messages for each state.

- **6.5 Zustand State Store** — `monitoringStore.ts` with:
  - `config: MonitoringConfig`, `status: MonitoringStatus`, `currentSpeed: SpeedData`.
  - `speedHistory: SpeedData[]` — rolling 30-sample window for sparkline.
  - `interfaceName: string` — detected network adapter name.
  - `availableActions` / `availableTriggers` — from backend discovery commands.
  - Actions: `updateConfig`, `updateCondition`, `setStatus`, `setCurrentSpeed`, `addSpeedSample`, `setInterfaceName`, `resetConfig`.

- **Tauri Integration Hooks** — `useTauri.ts`:
  - `useSpeedPolling()` — polls `get_current_speed` every 1 second, updates store + sparkline history.
  - `useAppInit()` — fetches available triggers, actions, and network interfaces on mount.

### Not Implemented ❌ (Deferred)

- **Backend event streaming** (`app.emit()` for `speed-update`) — Using polling via `invoke('get_current_speed')` instead. Event streaming will be wired when the background monitoring loop is implemented (Phase 8+).
- **Play Alarm action option** — Not in action dropdown yet (requires audio backend, Phase 10).

### Unplanned Additions ➕

- **`tsconfig.app.json` path alias fix** — Added `baseUrl` and `paths` config to resolve `@/*` imports for TypeScript (was already configured in Vite but missing from tsconfig).
- **Speed history buffer** — 30-sample rolling window for sparkline data, managed in Zustand.

---

## 3. Strategy & Technical Decisions

### Tauri Integration
- **Pattern:** Custom React hooks (`useSpeedPolling`, `useAppInit`) encapsulate all `invoke()` calls. Components stay pure and testable.
- **Key Decision:** Polling via `invoke('get_current_speed')` instead of Tauri event streaming. Simpler to implement and debug; event streaming can replace it later without changing component code (just swap the hook internals).
- **Graceful fallback:** If `invoke()` fails (e.g. running `npm run dev` without Tauri), the UI still works with mock state toggles.

### Sparkline
- **Library:** No third-party chart library — pure SVG `<path>` element. The sparkline is ~110 lines of code and has no dependencies.
- **Key Decision:** Using `useMemo` to avoid recalculating the SVG path on every render. The sparkline re-renders only when the data array changes (every 1 second).

### Strategic Shift Compliance
- ✅ Frontend calls `get_available_triggers()` and `get_available_actions()` on init to populate options.
- ✅ `MonitoringConfig` uses generic `TriggerConfig` discriminated union (not hardcoded network params).
- ✅ Action dropdown in `TriggerBuilder` dynamically loads from `availableActions` in store. When a new action is added in Rust, it appears automatically. Hardcoded fallback only used during initial load.
- ✅ Adding a new trigger/action type in the backend requires zero frontend code changes.

---

## 4. Challenges & Deviations

- **Path alias lint errors** — The `@/` import alias was configured in `vite.config.ts` but not in `tsconfig.app.json`. TypeScript's language server couldn't resolve imports. Fixed by adding `baseUrl` and `paths` to tsconfig.
- **Previous agent's mock data** — The earlier implementation used `setStatus()` directly instead of Tauri `invoke()`. Replaced with real backend calls while keeping fallback for dev mode.

---

## 5. Verification Results

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `npx tsc -b --noEmit` | ✅ Pass (0 errors) |
| Frontend Build | `npm run build` | ✅ Pass (44 modules, 860ms) |
| Core Rust Tests | `cargo test` (core/) | ✅ Pass (47 tests, 0 failures) |

### Core Test Breakdown (47 total)

| Crate | Tests |
|-------|-------|
| `flowwatcher-actions` | 3 |
| `flowwatcher-conditions` | 7 |
| `flowwatcher-engine` | 16 |
| `flowwatcher-platform` | 12 |
| `flowwatcher-triggers` | 9 |

---

## 6. Files Created or Modified

| File Path | Action | Purpose |
|-----------|--------|---------|
| `apps/desktop/src/hooks/useTauri.ts` | Created | Speed polling + app init hooks (Tauri invoke bridge) |
| `apps/desktop/src/components/Sparkline.tsx` | Created | SVG sparkline mini-graph component |
| `apps/desktop/src/components/SpeedCard.tsx` | Modified | Added sparkline, interface badge, history prop |
| `apps/desktop/src/components/AppShell.tsx` | Modified | Connected StatusBadge to monitoring store |
| `apps/desktop/src/pages/index.tsx` | Modified | Wired real Tauri invoke calls, added speed polling + app init |
| `apps/desktop/src/stores/monitoringStore.ts` | Modified | Added speedHistory, interfaceName, addSpeedSample, setInterfaceName |
| `apps/desktop/tsconfig.app.json` | Modified | Added @/ path alias (baseUrl + paths) |

---

## 7. Next Phase

- **Next Phase:** Phase 7 — Frontend: Advanced Mode (Process Selection UI)
- **Blocked By:** Nothing — Phase 6 is fully complete
- **Ready to Start:** ✅ Yes
