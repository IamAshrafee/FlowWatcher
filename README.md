# FlowWatcher

**Intelligent Network Activity Monitor & Automated System Controller**

> Lightweight, privacy-first desktop utility that watches your network activity and automatically performs system actions (shutdown, sleep, hibernate, etc.) when downloads or uploads complete.

![Status](https://img.shields.io/badge/status-under%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)

---

## The Problem

You're downloading a massive game update overnight. You want your PC to shut down when it's done — but you don't want to stay awake watching the progress bar. Current solutions are either unreliable, bloated, or don't understand *which* app is actually downloading.

## The Solution

FlowWatcher monitors your network speed (globally or per-process) and automatically triggers a system action when activity drops below your threshold for a set duration. Simple. Safe. Silent.

---

## ✨ Features

- 📡 **Real-Time Network Monitoring** — Live download/upload speed tracking
- 🎯 **Process-Aware Monitoring** — Watch specific apps (e.g., Steam, qBittorrent) instead of global traffic
- ⚡ **Automated Actions** — Shutdown, Restart, Sleep, Hibernate, Lock Screen, Play Alarm
- 🛡️ **Safety First** — 1-minute pre-warning + 30-second visible countdown before any action
- 🔧 **Natural Language Config** — *"When download is below 200 KB/s for 2 min, then shutdown"*
- 🖥️ **System Tray Mode** — Runs silently in the background
- 🌙 **Dark/Light/Auto Theme** — Modern matte aesthetic
- 🔒 **Privacy-First** — No telemetry, no cloud, everything stays local
- 🌍 **i18n Ready** — Designed for multi-language support from day one

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, ShadCN UI |
| State Management | Zustand |
| Desktop Framework | Tauri 2.0 |
| Backend / Core Engine | Pure Rust (modular, no Tauri dependency) |
| Architecture | Trigger Engine + Condition Engine + Action Engine |

---

## 🏗️ Architecture

FlowWatcher follows a **modular, extensible architecture** designed for future expansion beyond network monitoring:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Trigger Engine  │ ──▶ │ Condition Engine │ ──▶ │  Action Engine   │
│  (Network Idle,  │     │  (Threshold +   │     │  (Shutdown,      │
│   Process Exit)  │     │   Duration)     │     │   Sleep, Alarm)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

The core Rust engine is completely independent from the UI — it can power a CLI, headless daemon, or the desktop app.

---

## 📦 Project Structure

```
FlowWatcher/
├── apps/desktop/          # Tauri desktop app
│   ├── src/               # React frontend
│   └── src-tauri/         # Rust backend (Tauri bridge)
├── core/                  # Pure Rust engine (no Tauri dependency)
│   ├── engine/            # Automation orchestrator
│   ├── triggers/          # Trigger modules (network, process, etc.)
│   ├── actions/           # Action modules (shutdown, sleep, etc.)
│   ├── conditions/        # Condition evaluation logic
│   └── platform/          # OS abstraction layer
├── docs/                  # Architecture & phase completion docs
└── .agent/workflows/      # AI agent development workflows
```

---

## 🚧 Development Status

This project is under active development. See [`Project_Development_Roadmap.md`](./Project_Development_Roadmap.md) for the full 16-phase development plan.

| Milestone | Phases | Status |
|-----------|--------|--------|
| `v0.1.0` — Core monitoring + actions | 0, 1, 2, 4, 5, 6, 8, 13 | 📋 Planned |
| `v0.3.0` — Logging, settings, tray | + 9, 10, 11 | 📋 Planned |
| `v0.5.0` — Process-based monitoring | + 3, 7 | 📋 Planned |
| `v0.7.0` — i18n, polish | + 12, 14 | 📋 Planned |
| `v1.0.0` — Stable public release | + 15 | 📋 Planned |

---

## 📄 License

[MIT](./LICENSE)

---

## 🤝 Contributing

We welcome contributions! Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before getting started.

---

*Built with ❤️ using Rust + React + Tauri*
