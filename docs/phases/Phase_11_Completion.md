# Phase 11 Completion — System Tray & Background Operation

**Status:** ✅ Complete  
**Date:** 2026-02-28  
**Phase duration:** Single session

---

## Objective

Implement system tray icon, context menu, close-to-tray behavior, and window restore so FlowWatcher can run silently in the background while monitoring continues.

---

## What Was Built

### 1. System Tray Icon (`tray.rs` — new module)

- **TrayIconBuilder** with the app icon and tooltip ("FlowWatcher — Idle")
- **Right-click context menu:**
  - Start Monitoring → emits `tray-start-monitoring` event to frontend
  - Stop Monitoring → emits `tray-stop-monitoring` event to frontend
  - Open Dashboard → restores/focuses the main window
  - Exit → calls `app.exit(0)`
- **Left-click** on tray icon → restores and focuses the main window
- Uses `show_menu_on_left_click(false)` so left and right click have distinct behaviors

### 2. Close-to-Tray Behavior (`lib.rs`)

- `on_window_event` handler intercepts `CloseRequested`
- Checks `AppState.close_to_tray` preference (via `blocking_lock`)
- If enabled: calls `api.prevent_close()` + `window.hide()` (window hides to tray)
- If disabled: allows normal close (app exits)

### 3. Backend Commands (`commands.rs`, `state.rs`)

- Added `close_to_tray: Mutex<bool>` to `AppState`
- `set_close_to_tray(enabled: bool)` — updates the preference at runtime
- `get_close_to_tray()` — returns current value
- Both registered in `generate_handler![]`

### 4. Frontend Wiring (`pages/index.tsx`, `settingsStore.ts`)

- **Minimize to Tray toggle** added to Settings > Behavior section
- Toggle calls `invoke("set_close_to_tray", { enabled })` on change
- **Settings store** syncs `minimize_to_tray` → `set_close_to_tray` on app load
- **Tray event listeners** in `DashboardPage`:
  - `tray-start-monitoring` → invokes `start_monitoring`
  - `tray-stop-monitoring` → invokes `stop_monitoring`
  - Proper cleanup via `unlisten` on component unmount

### 5. Capabilities (`capabilities/default.json`)

- Added: `core:window:allow-hide`, `core:window:allow-show`, `core:window:allow-set-focus`, `core:window:allow-unminimize`

### 6. Cargo Feature (`Cargo.toml`)

- Added `"tray-icon"` to Tauri features

---

## Files Modified

| File | Change |
|------|--------|
| `apps/desktop/src-tauri/Cargo.toml` | Added `tray-icon` feature |
| `apps/desktop/src-tauri/src/tray.rs` | **NEW** — System tray module |
| `apps/desktop/src-tauri/src/lib.rs` | Tray setup, close-to-tray handler, new commands |
| `apps/desktop/src-tauri/src/state.rs` | Added `close_to_tray` field |
| `apps/desktop/src-tauri/src/commands.rs` | Added `set_close_to_tray`, `get_close_to_tray` |
| `apps/desktop/src-tauri/capabilities/default.json` | Window permissions |
| `apps/desktop/src/pages/index.tsx` | Tray event listeners, Minimize to Tray toggle |
| `apps/desktop/src/stores/settingsStore.ts` | Sync close_to_tray on settings load |

---

## Deferred Items

| Item | Reason | Target |
|------|--------|--------|
| Dynamic tray tooltip (live speed) | Low priority; requires periodic tray tooltip update from backend | Phase 14 |
| Tray icon state changes (monitoring vs idle) | Would need icon swap; cosmetic | Phase 14 |

---

## Verification Results

| Check | Result |
|-------|--------|
| `cargo check` (Tauri crate) | ✅ 0 errors, 0 warnings |
| `npm run build` (frontend) | ✅ 52 modules, 0 errors, built in 1.00s |
| `cargo test` (core crates) | ✅ 3 passed, 0 failed |
| TypeScript lint | ✅ No lint errors |

---

## Strategy Notes

- **Trait-based architecture preserved:** No changes to `core/` crates. Tray events use frontend-mediated `invoke()` calls so start/stop monitoring always goes through the same generic `MonitoringConfig` path.
- **Settings synced on load:** The `minimize_to_tray` preference is loaded from disk and pushed to `AppState` via `set_close_to_tray` immediately on startup, so the close-to-tray behavior works from the first window close.
- **No external plugins needed:** System tray is built into Tauri v2 core via the `tray-icon` feature — no separate plugin dependency required.
