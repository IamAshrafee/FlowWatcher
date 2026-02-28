# FlowWatcher

**Intelligent Network Activity Monitor & Automated System Controller**

> Lightweight, privacy-first desktop utility that watches your network activity and automatically performs system actions (shutdown, sleep, hibernate, etc.) when downloads or uploads complete.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![CI](https://img.shields.io/github/actions/workflow/status/IamAshrafee/FlowWatcher/ci.yml?label=CI)

---

## The Problem

You're downloading a massive game update overnight. You want your PC to shut down when it's done — but you don't want to stay awake watching the progress bar. Current solutions are either unreliable, bloated, or don't understand *which* app is actually downloading.

## The Solution

FlowWatcher monitors your network speed (globally or per-process) and automatically triggers a system action when activity drops below your threshold for a set duration. Simple. Safe. Silent.

---

## ✨ Features

- 📡 **Real-Time Network Monitoring** — Live download/upload speed tracking with sparkline graphs
- 🎯 **Process-Aware Monitoring** — Watch specific apps (e.g., Steam, qBittorrent) instead of global traffic
- ⚡ **Automated Actions** — Shutdown, Restart, Sleep, Hibernate, Lock Screen, Sign Out
- 🛡️ **Safety First** — 1-minute pre-warning + 30-second visible countdown before any action
- 🔧 **Natural Language Config** — *"When download is below 200 KB/s for 2 min, then shutdown"*
- 🖥️ **System Tray Mode** — Runs silently in the background
- 🌙 **Dark/Light/Auto Theme** — Modern matte aesthetic
- 📋 **Activity Logging** — Full history of monitoring sessions with export
- ⚙️ **Persistent Settings** — All preferences saved between sessions
- 🔒 **Privacy-First** — No telemetry, no cloud, everything stays local
- 🌍 **i18n Ready** — Designed for multi-language support from day one

---

## 📸 Screenshots

<img width="880" height="609" alt="FlowWatcher Dashboard - Dark Mode" src="https://github.com/user-attachments/assets/a9ad83e6-1e9b-4f7c-94c7-5cb2f17feeb4" />

<img width="893" height="601" alt="FlowWatcher Advanced Mode" src="https://github.com/user-attachments/assets/21afec72-1bb8-4cd3-8d1c-809838ddfbac" />

<img width="888" height="604" alt="FlowWatcher Settings" src="https://github.com/user-attachments/assets/b681999b-9d9a-4c40-962e-7bb135abb853" />

---

## 🚀 How It Works

1. **Set your trigger** — Choose a speed threshold & duration using the natural language builder
2. **Start monitoring** — Click "Start Monitoring" and minimize to the system tray
3. **Automatic action** — When network activity drops below your threshold, FlowWatcher warns you, then executes the action

FlowWatcher uses a **Trigger → Condition → Action** pipeline: the trigger detects events (like network idle), the condition evaluates rules (threshold + duration), and the action executes system commands (shutdown, sleep, etc.).

---

## 📦 Installation

### Download

Download the latest Windows installer from the [GitHub Releases](https://github.com/IamAshrafee/FlowWatcher/releases) page:

- **`.msi`** — Standard Windows installer
- **`.exe`** — NSIS installer (portable-friendly)

### Build from Source

```bash
# Prerequisites: Rust (1.77+), Node.js (18+), Tauri prerequisites
# See: https://v2.tauri.app/start/prerequisites/

git clone https://github.com/IamAshrafee/FlowWatcher.git
cd FlowWatcher/apps/desktop

npm install
npm run tauri build
```

The built installer will be in `apps/desktop/src-tauri/target/release/bundle/`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| State Management | Zustand |
| Desktop Framework | Tauri 2.0 |
| Backend / Core Engine | Pure Rust (modular, no Tauri dependency) |
| Architecture | Trigger Engine + Condition Engine + Action Engine |
| CI/CD | GitHub Actions (lint, test, build, commitlint) |

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

## 📂 Project Structure

```
FlowWatcher/
├── apps/desktop/          # Tauri desktop app
│   ├── src/               # React frontend
│   └── src-tauri/         # Rust backend (Tauri bridge)
├── core/                  # Pure Rust engine (no Tauri dependency)
│   ├── engine/            # Automation orchestrator + activity logger
│   ├── triggers/          # Trigger modules (network, process)
│   ├── actions/           # Action modules (shutdown, sleep, etc.)
│   ├── conditions/        # Condition evaluation logic
│   └── platform/          # OS abstraction layer (Windows)
├── docs/                  # Architecture & phase completion docs
└── .github/               # CI/CD workflows, issue/PR templates
```

---

## 🚧 Development Status

See [`ROADMAP.md`](./ROADMAP.md) for the full roadmap and future plans.

| Milestone | Phases | Status |
|-----------|--------|--------|
| `v0.1.0` — Core monitoring + actions + CI/CD | 0–14 | ✅ Complete |
| `v0.2.0` — Deferred items + polish | Bug fixes, deferred features | 📋 Planned |
| `v0.5.0` — Advanced triggers | CPU, timer, plugin system | 📋 Planned |
| `v1.0.0` — Stable public release | Full documentation + signing | 📋 Planned |

---

## 📄 License

[MIT](./LICENSE)

---

## 🤝 Contributing

We welcome contributions! Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before getting started.

---

*Built with ❤️ using Rust + React + Tauri*
