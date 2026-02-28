# FlowWatcher Roadmap

> This roadmap outlines where FlowWatcher is today and where it's headed. Priorities may shift based on community feedback.

---

## ✅ v0.1.0 — Foundation Release (Current)

The first public release includes everything needed for practical daily use:

- Real-time network speed monitoring (download + upload)
- Process-aware monitoring (watch specific apps like Steam, qBittorrent)
- 6 automated system actions (Shutdown, Restart, Sleep, Hibernate, Lock Screen, Sign Out)
- Safety countdown with 1-minute pre-warning + 30-second visible countdown
- Natural language trigger configuration
- System tray background operation
- Activity logging with export
- Persistent settings
- Dark / Light / Auto theme
- Internationalization foundation (English, extensible)
- CI/CD automation (GitHub Actions)

---

## 📋 v0.2.0 — Refinements & Deferred Items

Items deferred during initial development, organized by area:

### Engine & Backend
- [ ] **Event streaming via `app.emit()`** — Replace polling with push-based real-time events from Rust background loop *(deferred from Phase 4, 6, 8)*
- [ ] **`NetworkIdleTrigger` struct** — Concrete trigger combining `SpeedMonitor` + `ThresholdCondition` into a single orchestrated `Trigger` impl *(deferred from Phase 1, 8, 14)*
- [ ] **Combined trigger logic** — Orchestrate global network idle + per-process idle into a single monitoring loop *(deferred from Phase 3, 7)*
- [ ] **PlayAlarmAction** — Audio playback via `rodio` crate. Action trait is ready, needs impl + UI dropdown entry *(deferred from Phase 2, 7, 10, 14)*
- [ ] **Custom alarm sound** — File picker for `.mp3`/`.wav` using `tauri-plugin-dialog`. Depends on PlayAlarmAction *(deferred from Phase 10, 14)*
- [ ] **Auto-start plugin (runtime)** — Wire `tauri-plugin-autostart` to existing Settings toggle. Needs verified Tauri v2 compatibility *(deferred from Phase 10, 11, 14)*

### Data & Persistence
- [ ] **File persistence for activity logs** — Save logs to Tauri `app_data_dir` for persistence across restarts *(deferred from Phase 9)*
- [ ] **Log retention by date** — 30-day automatic pruning policy. Requires file persistence first *(deferred from Phase 9)*
- [ ] **Enable/disable logging toggle** — Settings toggle to turn off activity logging *(deferred from Phase 9)*
- [ ] **Config import/export via file** — Allow users to export and import settings as a JSON file *(deferred from Phase 10)*

### Frontend & UX
- [ ] **Process list auto-refresh** — Auto-poll running processes on interval instead of manual refresh *(deferred from Phase 7/14)*
- [ ] **Hibernate validation UX** — Grey out Hibernate option with tooltip when not supported *(deferred from Phase 14)*
- [ ] **Dynamic tray tooltip** — Show live speed in system tray tooltip *(deferred from Phase 11)*
- [ ] **Tray icon state changes** — Swap icon between monitoring/idle states *(deferred from Phase 11)*
- [ ] **Network interface manual selection** — Dropdown in settings for manual interface selection (auto-detect works well) *(deferred from Phase 10)*

### Internationalization
- [ ] **RTL layout support** — Will implement when an RTL language is contributed *(deferred from Phase 12)*
- [ ] **Date/number formatting via `Intl`** — Locale-aware formatting *(deferred from Phase 12)*
- [ ] **Toast notification string externalization** — Toast messages are dynamic; verify full i18n coverage *(deferred from Phase 12)*

### Infrastructure
- [ ] **ShadCN UI migration** — Evaluate `shadcn@canary` for Tailwind v4 compatibility, or continue with custom components *(deferred from Phase 0, 5, 14)*
- [ ] **Custom titlebar** — Replace OS decorations with custom titlebar + window controls *(deferred from Phase 5)*

---

## 📋 v0.5.0 — Advanced Triggers

Expand the trigger system beyond network monitoring:

- [ ] CPU idle trigger
- [ ] Timer/schedule-based trigger
- [ ] Process exit trigger
- [ ] Disk activity trigger
- [ ] Per-process network monitoring via ETW (Event Tracing for Windows) *(deferred from Phase 3, 14)*
- [ ] Composite conditions (AND/OR multiple triggers)

---

## 📋 v0.8.0 — Extensibility

Make FlowWatcher a platform for automation:

- [ ] Plugin system for community-contributed triggers & actions
- [ ] `RunScriptAction` — Execute custom scripts/commands
- [ ] `WebhookAction` — Send HTTP requests on trigger
- [ ] CLI mode (headless operation without UI)
- [ ] macOS support

---

## 📋 v1.0.0 — Stable Release

Production-ready release:

- [ ] Signed Windows binaries
- [ ] Auto-update mechanism
- [ ] Comprehensive documentation site
- [ ] Performance benchmarks and optimization
- [ ] Accessibility audit (WCAG AA compliance)
- [ ] Linux support

---

## 💡 Contributing

Have ideas for the roadmap? We'd love to hear them:

- Open a [Feature Request](https://github.com/IamAshrafee/FlowWatcher/issues/new?template=feature_request.yml)
- Join the [Discussions](https://github.com/IamAshrafee/FlowWatcher/discussions)
- See [`CONTRIBUTING.md`](./CONTRIBUTING.md) to get started with code contributions
