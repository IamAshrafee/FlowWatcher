# FlowWatcher — Phase Completion Tracker

> **Last Audit:** 2026-02-27 21:51 UTC+6

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

## Upcoming Phases

| Phase | Title | Status |
|-------|-------|--------|
| 7 | Frontend: Advanced Mode (Process Selection UI) | 📋 Not Started |
| 8 | Safety UI: Countdown & Warning System | 📋 Not Started |
| 9 | Activity Logging | 📋 Not Started |
| 10 | Settings, Persistence & Configuration | 📋 Not Started |
| 11 | System Tray & Background Operation | 📋 Not Started |
| 12 | Internationalization Foundation | 📋 Not Started |
| 13 | CI/CD & Code Quality Automation | 📋 Not Started |
| 14 | Polish, Performance & Edge Cases | 📋 Not Started |
| 15 | Release Preparation & Open Source Launch | 📋 Not Started |

---

## Deferred Items Tracker

Items deferred from completed phases that must be picked up in future phases. These have been injected into the roadmap under **"Deferred Items (from earlier phases)"** sections.

| Deferred Item | From | Target | Context |
|---------------|------|--------|---------|
| ShadCN UI initialization | Phase 0 | Phase 10 | Tailwind v4 incompatibility; use `shadcn@canary` |
| Git branching (`dev` branch) | Phase 0 | User discretion | Manual Git workflow |
| `NetworkIdleTrigger` struct | Phase 1 | Phase 8 | Concrete trigger combining SpeedMonitor + ThresholdCondition |
| `PlayAlarmAction` (audio) | Phase 2 | Phase 7 | Needs `rodio` crate |
| Per-process network via ETW | Phase 3 | Phase 14 | Using disk I/O proxy for now |
| Combined trigger logic | Phase 3 | Phase 7 | Orchestrate global + process idle |
| `get_activity_logs` command | Phase 4 | Phase 9 | Needs persistence layer |
| `get_settings`/`save_settings` | Phase 4 | Phase 10 | Needs JSON file persistence |
| Event streaming (`app.emit()`) | Phase 4 | Phase 8 | Background polling loop + tokio task |
| Tauri capabilities (tray, autostart) | Phase 4 | Phase 11/14 | Permission plugins |
| ShadCN components | Phase 5 | Phase 10 | Custom components used instead |
| Custom titlebar | Phase 5 | Phase 11 | OS decorations used for now |
| Backend event streaming | Phase 6 | Phase 8+ | Polling via `invoke()` used instead |
| Play Alarm in UI dropdown | Phase 6 | Phase 10 | Needs audio backend first |

---

> Run `/audit-deferred` after any phase completion to keep this tracker and the roadmap in sync.
