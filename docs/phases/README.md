# FlowWatcher — Phase Completion Tracker

> **Last Audit:** 2026-02-28 00:37 UTC+6

## Completed Phases

| Phase | Title | Date | Status |
|-------|-------|------|--------|
| 0 | Project Scaffolding & Repository Foundation | 2026-02-27 | ✅ Complete |
| 1 | Core Rust Engine: Network Monitoring | 2026-02-27 | ✅ Complete |
| 2 | Core Rust Engine: Action Execution | 2026-02-27 | ✅ Complete |
| 3 | Core Rust Engine: Process-Based Monitoring | 2026-02-27 | ✅ Complete |
| 4 | Tauri Bridge: Connecting Rust to Frontend | 2026-02-27 | ✅ Complete |
| 5 | Frontend: Design System & Shell | 2026-02-27 | ✅ Complete |
| 6 | Frontend: Dashboard (Core Monitoring UI) | 2026-02-27 | ✅ Complete |
| 7 | Frontend: Advanced Mode (Process Selection UI) | 2026-02-27 | ✅ Complete |
| 8 | Safety UI: Countdown & Warning System | 2026-02-27 | ✅ Complete |
| 9 | Activity Logging | 2026-02-27 | ✅ Complete |
| 10 | Settings, Persistence & Configuration | 2026-02-28 | ✅ Complete |

## Upcoming Phases

| Phase | Title | Status |
|-------|-------|--------|
| 11 | System Tray & Background Operation | 📋 Not Started |
| 12 | Internationalization Foundation | 📋 Not Started |
| 13 | CI/CD & Code Quality Automation | 📋 Not Started |
| 14 | Polish, Performance & Edge Cases | 📋 Not Started |
| 15 | Release Preparation & Open Source Launch | 📋 Not Started |

---

## Deferred Items Tracker

Items deferred from completed phases that must be picked up in future phases. These have been injected into the roadmap under **"Deferred Items (from earlier phases)"** sections.

### Target: Phase 11 — System Tray & Background Operation

| Deferred Item | From | Reason |
|---------------|------|--------|
| Custom Titlebar (`decorations: false`) | Phase 5 | Using OS decorations for now; drag region ready in AppShell |
| Tauri tray capabilities | Phase 4 | Permission plugins deferred until tray feature built |
| Auto-Start Plugin (`tauri-plugin-autostart`) | Phase 10 | UI toggle exists but not wired to plugin |
| OS-level notifications | Phase 8 | Tauri notification plugin for pre-warning when minimized |

### Target: Phase 12 — Internationalization

| Deferred Item | From | Reason |
|---------------|------|--------|
| Language selector wiring | Phase 10 | Placeholder dropdown exists; needs i18next connection |

### Target: Phase 14 — Polish, Performance & Edge Cases

| Deferred Item | From | Reason |
|---------------|------|--------|
| True per-process network via ETW | Phase 3 | Using disk I/O proxy; ETW is complex |
| Tauri auto-start capability registration | Phase 4 | Permission plugin needs capabilities config |
| Event streaming runtime (`app.emit()`) | Phase 4/8 | Using polling/setInterval; needs tokio background task |
| `NetworkIdleTrigger` struct | Phase 1/8 | Concrete trigger combining SpeedMonitor + ThresholdCondition |
| Combined trigger logic | Phase 3/8 | Orchestrate global + process idle into one loop |
| Keep Screen On | Phase 10 | Toggle exists; needs OS API call |
| Custom Alarm Sound | Phase 10 | Needs `tauri-plugin-dialog` file picker + PlayAlarmAction |
| Network Interface Selection | Phase 10 | Auto-detect works; manual dropdown is low priority |
| Import/Export Config | Phase 10 | Allow JSON config export/import |
| File persistence for logs | Phase 9 | In-memory only (1000 cap); needs Tauri `app_data_dir` |
| Log retention by date | Phase 9 | 30-day retention; requires file persistence first |
| Enable/Disable logging toggle | Phase 9 | Settings toggle for activity logging |
| Process list auto-polling | Phase 7 | Currently manual refresh only |
| PlayAlarmAction (audio) | Phase 2/7 | Needs `rodio` crate + Action impl + UI entry |
| ShadCN UI components | Phase 0/5/10 | Tailwind v4 incompatibility; evaluate `shadcn@canary` |
| Configurable delay verification | Phase 8 | `pre_warning_secs` exists; verify end-to-end wiring |

### Resolved (picked up in later phases)

| Deferred Item | From | Resolved In |
|---------------|------|-------------|
| `get_activity_logs` command | Phase 4 | ✅ Phase 9 |
| `get_settings`/`save_settings` commands | Phase 4 | ✅ Phase 10 |

### User Discretion

| Deferred Item | From | Notes |
|---------------|------|-------|
| Git branching (`dev` branch) | Phase 0 | User managing Git workflow manually |

---

> Run `/audit-deferred` after any phase completion to keep this tracker and the roadmap in sync.
