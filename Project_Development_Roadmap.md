# 📌 FlowWatcher — Comprehensive Project Development Roadmap

> This roadmap is the single source of truth for building FlowWatcher from scratch. Each phase is self-contained with full context so that a human developer or an agentic AI can follow it sequentially without needing to reference other documents.

> ⚠️ **MANDATORY: Read `Strategic_shift.md` before starting ANY phase.** The entire Rust backend must follow the **Trigger Engine + Condition Engine + Action Engine** trait-based architecture. Network monitoring is the FIRST implementation, not the ONLY one. Code that hardcodes network-specific logic into the engine layer will be rejected. See `Strategic_shift.md` for full details, enforcement rules, and a per-phase checklist.

---

# How to Read This Roadmap

Each phase follows this structure:

- **Why:** The strategic reason this phase exists.
- **What:** Exact deliverables and tasks.
- **Context Source:** Which planning document(s) informed this phase.
- **Skills to Use:** Which installed agent skills to activate before starting this phase.
- **Expected Result:** What a completed phase looks like.
- **Depends On:** Which prior phase(s) must be finished first.

---

# Installed Skills Inventory

The following skills are installed in `.agent/skills/` and `.agents/skills/`. Before starting each phase, **read the SKILL.md** of every skill listed for that phase so the agent has the correct patterns, rules, and anti-patterns loaded.

| Skill | Location | When to Use |
|-------|----------|-------------|
| `tauri-v2` | `.agents/skills/tauri-v2/` | Phases 0, 4, 10, 11 — Tauri commands, IPC, capabilities, config, plugins. |
| `understanding-tauri-architecture` | `.agents/skills/understanding-tauri-architecture/` | Phase 0, 4 — Core/Shell pattern, security model, webview integration. |
| `rust-best-practices` | `.agents/skills/rust-best-practices/` | Phases 1, 2, 3 — Borrowing, error handling, clippy, testing, traits, type-state. |
| `rust-async-patterns` | `.agents/skills/rust-async-patterns/` | Phases 1, 2, 3 — Tokio, channels, graceful shutdown, async traits, streams. |
| `shadcn-ui` | `.agents/skills/shadcn-ui/` | Phases 0, 5, 6, 7, 8, 9, 10 — Component installation, forms, dialogs, tables, theming. |
| `vite` | `.agents/skills/vite/` | Phase 0, 5 — Vite config, plugins, dev server, build. |
| `eslint-prettier-config` | `.agents/skills/eslint-prettier-config/` | Phase 0, 13 — ESLint/Prettier setup, TypeScript rules, CI linting. |
| `typescript-advanced-types` | `.agents/skills/typescript-advanced-types/` | Phase 4 — Generics, mapped types, discriminated unions for Tauri type defs. |
| `vercel-react-best-practices` | `.agents/skills/vercel-react-best-practices/` | Phases 5, 6, 7, 14 — React performance, component patterns, rendering optimization. |
| `i18n-localization` | `.agents/skills/i18n-localization/` | Phase 12 — Detecting hardcoded strings, locale files, translation management. |
| `semantic-versioning` | `.agents/skills/semantic-versioning/` | Phase 13, 15 — Conventional commits, semantic-release, version bumping. |

---

# Phase 0 — Project Scaffolding & Repository Foundation

## Why
Every professional open-source project begins with a clean, scalable repository structure. Without this, future phases will create disorganized code that is painful to refactor. The strategic shift document explicitly states: "If we design it correctly now, you will not rewrite everything later."

## What

### 0.1 Initialize the Monorepo
Create the top-level project directory with the following structure (from `OpenSource_Repo_Setup.md`):

```
/FlowWatcher
├── apps/
│   └── desktop/              # Tauri desktop app
│       ├── src/              # React frontend (Vite + TypeScript)
│       ├── src-tauri/        # Rust backend (Tauri 2.0)
│       └── tauri.conf.json
├── core/
│   ├── engine/               # Automation engine (pure Rust, no Tauri dependency)
│   ├── triggers/             # Trigger modules (network idle, process exit, etc.)
│   ├── actions/              # Action modules (shutdown, sleep, alarm, etc.)
│   ├── conditions/           # Condition evaluation (threshold + duration logic)
│   └── platform/             # OS abstraction layer (Windows first, then macOS/Linux)
├── docs/                     # Architecture docs, contribution guides
├── scripts/                  # Build helpers, release scripts
├── .github/
│   ├── workflows/            # CI/CD (GitHub Actions)
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE                   # MIT License
├── README.md
└── ROADMAP.md
```

### 0.2 Initialize Frontend (React + Vite + TypeScript)
Inside `apps/desktop/src/`:
- Scaffold with `npm create vite@latest ./ -- --template react-ts`.
- Install Tailwind CSS v3+, configure `tailwind.config.ts`.
- Install and configure ShadCN UI (`npx shadcn-ui@latest init`).
- Install Zustand for state management.
- Install `i18next` + `react-i18next` for future internationalization readiness (do NOT hardcode any UI strings).
- Set up ESLint + Prettier with TypeScript rules.

### 0.3 Initialize Tauri 2.0 Backend
Inside `apps/desktop/src-tauri/`:
- Run `npm create tauri-app@latest` or `cargo install tauri-cli` and `cargo tauri init`.
- Configure `tauri.conf.json` for window size (~800×600), title "FlowWatcher", and custom titlebar if desired.
- Verify `cargo build` succeeds for the Rust backend.
- Verify `npm run tauri dev` launches a blank window with the React frontend inside.

### 0.4 Initialize Core Rust Crate
Inside `core/`:
- Create a Rust workspace crate (`Cargo.toml` with members: `engine`, `triggers`, `actions`, `conditions`, `platform`).
- Each sub-crate starts with a `lib.rs` containing a placeholder `pub fn init() {}`.
- **Critical rule:** The `core/` crate must NEVER depend on Tauri. It is pure Rust logic. Tauri only calls into `core/` from `apps/desktop/src-tauri/`.

### 0.5 Repository Essentials
- Write initial `README.md` (project name, one-line description, "Under Development" badge).
- Add `LICENSE` (MIT).
- Add `CODE_OF_CONDUCT.md` (Contributor Covenant).
- Add `CONTRIBUTING.md` (dev setup instructions, branch naming: `feature/xxx`, `fix/xxx`).
- Set up `.gitignore` for Rust (`target/`), Node (`node_modules/`, `dist/`), and OS files.
- Initialize Git, create `main` and `dev` branches. All work happens on `dev`.

## Context Source
`OpenSource_Repo_Setup.md` (sections 1–5, 7, 10), `Project_Development_Overview.md` (section 2–3), `Strategic_shift.md` (modular architecture requirement).

## Expected Result
Running `npm run tauri dev` from `apps/desktop/` opens a blank Tauri window rendering the default Vite React page. The Rust backend compiles. The `core/` crate compiles independently. The repository is clean, professional, and ready for contributions.

## Skills to Use
- **`tauri-v2`** — For correct `tauri.conf.json` configuration, `Cargo.toml` setup, and avoiding common Tauri v2 init pitfalls.
- **`understanding-tauri-architecture`** — To understand the Core/Shell separation pattern before setting up the `core/` crate independently from Tauri.
- **`shadcn-ui`** — For proper `npx shadcn@latest init` setup, Tailwind config, and component path aliases.
- **`vite`** — For `vite.config.ts` best practices, plugin setup (`@vitejs/plugin-react`), and dev server config.
- **`eslint-prettier-config`** — For setting up ESLint + Prettier with TypeScript rules from the start.

## Depends On
Nothing. This is the starting phase.

---

# Phase 1 — Core Rust Engine: Network Monitoring

## Why
The entire product revolves around accurately detecting when network activity drops below a threshold. This is the brain of the application. It must be built first, in pure Rust, independent of any UI, so it can later be reused by the CLI and headless modes.

## What

### 1.1 Platform Abstraction Layer (`core/platform/`)
- Define a `NetworkInterface` trait:
  - `list_interfaces() -> Vec<InterfaceInfo>`
  - `get_default_interface() -> Option<InterfaceInfo>`
  - `get_stats(interface_id) -> NetworkStats { bytes_sent, bytes_received, timestamp }`
- Implement `WindowsNetworkProvider` using Windows performance counters or the `sysinfo`/`netstat2` Rust crate.
- Design the trait so macOS/Linux implementations can be added later without touching any calling code.

> ⚠️ **Strategic Shift Enforcement:** The network monitor must be implemented as a `Trigger` trait implementation (`NetworkIdleTrigger`), not as standalone hardcoded logic. The `Trigger` trait (`start()`, `stop()`, `evaluate()`) must be defined in `core/triggers/` first, and `NetworkIdleTrigger` implements it. This allows `CpuIdleTrigger`, `ProcessExitTrigger`, etc. to be added later without touching the engine. See `Strategic_shift.md`.

### 1.2 Network Speed Calculator (`core/engine/`)
- Implement a `SpeedMonitor` struct that:
  - Polls `get_stats()` at a configurable interval (default: 1 second).
  - Calculates delta bytes between polls to derive download/upload speed in bytes/sec.
  - Exposes `current_download_speed()` and `current_upload_speed()`.
  - Smooths short spikes using a rolling average (e.g., 3-sample window) to prevent false triggers from momentary traffic pauses.

### 1.3 Threshold & Duration Evaluation (`core/conditions/`)
- Implement a `ThresholdCondition` struct:
  - Configurable `threshold_bytes_per_sec: u64` (default: 200 KB/s = 204800).
  - Configurable `required_duration_secs: u64` (default: 120 seconds).
  - Configurable `monitor_mode: DownloadOnly | UploadOnly | Both`.
  - Method `evaluate(current_speed) -> ConditionState { Waiting, BelowThreshold(elapsed), Triggered }`.
  - Uses internal timer: only transitions to `Triggered` after speed stays below threshold for the full `required_duration_secs`.
  - Resets timer if speed goes back above threshold (handles fluctuation).

### 1.4 Unit Tests
- Test speed calculation with mock data.
- Test threshold logic: confirm it does NOT trigger during brief dips.
- Test threshold logic: confirm it DOES trigger after sustained low speed.
- Test mode filtering (download-only ignores upload traffic).

## Context Source
`Feature_and_capability_defination.md` (section 1A — Network Interface Monitoring, Edge Handling), `Project_Overview.md` (section 3A), `MyOwn_thinking.md` (Speed Monitor, Interface Selector), `Strategic_shift.md` (Trigger Engine design).

## Expected Result
A pure Rust library that can be called with `speed_monitor.start()` and emits speed data + trigger state. Fully testable with `cargo test` inside `core/`. No UI dependency. No Tauri dependency.

## Skills to Use
- **`rust-best-practices`** — For idiomatic trait design, borrowing patterns, error handling with `thiserror`, clippy enforcement, and testing conventions.
- **`rust-async-patterns`** — For async polling loops with Tokio, channel-based event emission, and graceful shutdown patterns for the speed monitor.

## Depends On
Phase 0 (project scaffolding).

---

# Phase 2 — Core Rust Engine: Action Execution

## Why
Once the monitoring engine detects idle network, it must execute a system action safely. This action engine is the second pillar of the product and must be modular so new action types can be added by contributors without modifying existing code.

## What

### 2.1 Action Trait (`core/actions/`)
- Define an `Action` trait:
  - `validate() -> Result<(), ActionError>` — checks if the action is possible (e.g., hibernate supported?).
  - `execute() -> Result<(), ActionError>` — performs the action.
  - `name() -> &str` — human-readable name.

> ⚠️ **Strategic Shift Enforcement:** The `Action` trait is the extensibility point for the Action Engine. Future contributors can add `RunScriptAction`, `WebhookAction`, `CustomCommandAction` by implementing this trait. The engine must dispatch actions through the trait, never through direct function calls. See `Strategic_shift.md`.

### 2.2 Implement Windows Actions (`core/platform/`)
- `ShutdownAction` — calls Windows `ExitWindowsEx` or equivalent via `windows-sys` crate.
- `RestartAction` — same API with restart flag.
- `SleepAction` — calls `SetSuspendState(false, ...)`.
- `HibernateAction` — calls `SetSuspendState(true, ...)` after checking `IsPwrHibernateAllowed()`.
- `SignOutAction` — calls `ExitWindowsEx` with logoff flag.
- `LockScreenAction` — calls `LockWorkStation()`.
- `PlayAlarmAction` — plays an audio file (default embedded alarm + custom user file path). Use `rodio` crate for cross-platform audio.

### 2.3 Action Safety Wrapper (`core/engine/`)
- Implement `ActionScheduler`:
  - Accepts an `Action` + delay configuration.
  - Emits events: `PreWarning(60s before)`, `CountdownStarted(30s)`, `CountdownTick(remaining)`, `Cancelled`, `Executed`.
  - Exposes `cancel()` and `execute_now()` methods.
  - Prevents duplicate triggers (internal state machine: `Idle -> Pending -> Countdown -> Executed | Cancelled`).

### 2.4 Unit Tests
- Test each action's `validate()` (mock OS calls where needed).
- Test `ActionScheduler` state transitions.
- Test cancellation during countdown.
- Test `execute_now` during countdown.

## Context Source
`Feature_and_capability_defination.md` (section 2 — Action Engine, Safety Features, System Checks), `Project_Overview.md` (section 3C), `MyOwn_thinking.md` (User Action Selection, 30-sec warning delay).

## Expected Result
Calling `action_scheduler.schedule(ShutdownAction, delay: 5min)` starts a countdown pipeline that emits events. Calling `action_scheduler.cancel()` stops it. All actions validate OS capability before executing. Fully testable with `cargo test`.

## Skills to Use
- **`rust-best-practices`** — For trait-based action architecture, `Result<T, E>` patterns, type-state pattern for the `ActionScheduler` state machine, and testing best practices.
- **`rust-async-patterns`** — For async countdown timers, `tokio::select!` for cancellation, and channel-based event emission to frontend.

## Depends On
Phase 0.

---

# Phase 3 — Core Rust Engine: Process-Based Monitoring

## Why
Global bandwidth monitoring can be inaccurate (e.g., Windows Update downloading in background). Process-level monitoring lets users say "only watch Steam.exe" for much higher accuracy. This is the key differentiator of FlowWatcher vs competitors.

## What

### 3.1 Process Enumeration (`core/platform/`)
- Implement `list_running_processes() -> Vec<ProcessInfo { pid, name, path }>`.
- Implement `get_process_network_usage(pid) -> NetworkStats` using ETW (Event Tracing for Windows) or WMI on Windows.
- Mark processes with high network usage for "smart suggestion" feature.

### 3.2 Process Monitor (`core/triggers/`)
- Implement `ProcessTrigger` **as a `Trigger` trait implementation** (same trait as `NetworkIdleTrigger` from Phase 1):
  - Accepts a list of selected process PIDs/names.
  - Polls each process's network usage.
  - Evaluates: ALL selected processes must be below threshold for the required duration.
  - Supports an exclusion list (processes to always ignore).
  - Combined logic mode: global network idle AND selected processes idle (both must be true if process monitoring is enabled).

> ⚠️ **Strategic Shift Enforcement:** `ProcessTrigger` is the SECOND `Trigger` trait implementation. If Phase 1 was designed correctly, adding this trigger requires zero changes to the engine — just a new struct implementing the existing trait. If this requires engine changes, Phase 1's trait design was wrong and must be fixed first. See `Strategic_shift.md`.

### 3.3 Smart Suggestion Logic
- Sort process list by current network usage descending.
- Mark top network-consuming processes as "suggested".

### 3.4 Unit Tests
- Test process enumeration returns valid data.
- Test combined trigger logic (global + process).
- Test exclusion list filtering.

## Context Source
`Feature_and_capability_defination.md` (section 1B — Process-Based Monitoring, Accuracy Logic), `MyOwn_thinking.md` (Process based monitoring, Smart Process Mode, Exclude Processes), `Project_Overview.md` (section 3B).

## Expected Result
The engine can monitor specific processes' network activity and only trigger when ALL selected processes are idle. Smart suggestions automatically float high-traffic apps to the top.

## Skills to Use
- **`rust-best-practices`** — For trait design (`ProcessProvider`), clean error handling, and unit testing with mocks.
- **`rust-async-patterns`** — For concurrent per-process polling, stream-based process data collection, and JoinSet for managing multiple monitoring tasks.

## Depends On
Phase 1 (network monitoring foundation).

---

# Phase 4 — Tauri Bridge: Connecting Rust to Frontend

## Why
The React frontend cannot directly access OS-level APIs. Tauri provides a secure bridge (`#[tauri::command]`) between the Rust backend and the JavaScript frontend. This phase wires everything together.

## What

### 4.1 Define Tauri Commands (`apps/desktop/src-tauri/src/`)
Create Tauri command functions that call into `core/`:

- `get_network_interfaces()` → returns list of interfaces.
- `get_current_speed()` → returns `{ download_bps, upload_bps }`.
- `start_monitoring(config)` → starts the engine with a **generic** trigger/condition/action config (not hardcoded network params).
- `stop_monitoring()` → stops monitoring.
- `pause_monitoring()` / `resume_monitoring()`.
- `get_monitoring_status()` → returns current state (`Idle`, `Monitoring`, `TriggerPending`, `Countdown(remaining_secs)`, `Executed`).
- `cancel_action()` → cancels pending action during countdown.
- `execute_action_now()` → immediately executes during countdown.
- `get_running_processes()` → returns process list sorted by network usage.
- `get_available_triggers()` → returns list of registered trigger types (network, process, future: CPU, timer, etc.).
- `get_available_actions()` → returns list of registered action types.
- `get_activity_logs()` → returns log entries.
- `get_settings()` / `save_settings(config)`.

> ⚠️ **Strategic Shift Enforcement:** The `start_monitoring(config)` command must accept a generic `MonitoringConfig` that specifies which trigger type to use, which condition parameters apply, and which action to execute. Do NOT accept hardcoded `threshold_kbps` and `duration_secs` parameters directly. Wrap them inside a trigger-specific config variant. See `Strategic_shift.md`.

### 4.2 Event Streaming (Tauri Events)
Use Tauri's event system (`app.emit()`) to push real-time data to the frontend:
- `speed-update` event every 1 second with `{ download_bps, upload_bps }`.
- `monitoring-state-change` event when state transitions.
- `countdown-tick` event every second during the 30-second countdown.
- `pre-warning` event 60 seconds before action.

### 4.3 TypeScript Type Definitions
Create shared TypeScript types in the frontend (`src/types/`) mirroring all Rust structs:
- `NetworkInterface`, `SpeedData`, `MonitoringState`, `MonitoringConfig`, `ProcessInfo`, `LogEntry`, `AppSettings`.

### 4.4 Tauri Permission Configuration
Configure `capabilities` in tauri config to allow:
- System power commands (shutdown, restart, sleep, hibernate).
- Process enumeration.
- File system access (for config + custom alarm sounds).
- System tray.
- Auto-start registration.
- Audio playback.

## Context Source
`Project_Development_Overview.md` (section 3 — Communication Layer), `Project_Overview.md` (section 4 — Communication Layer), Tauri 2.0 IPC documentation.

## Expected Result
The frontend can call `invoke('get_current_speed')` and receive real-time speed data. Events stream from Rust to React. All types are shared and type-safe.

## Skills to Use
- **`tauri-v2`** — Critical for this phase. Follow command registration patterns (`generate_handler!`), event emission (`app.emit()`), channel streaming, state management (`Mutex<T>`), and capability/permission configuration.
- **`understanding-tauri-architecture`** — To ensure the `core/` → `src-tauri/` bridge follows the correct IPC security model.
- **`typescript-advanced-types`** — For creating discriminated union types (`MonitoringState`), generic invoke wrappers, and type-safe event listeners.

## Depends On
Phase 0, Phase 1, Phase 2.

---

# Phase 5 — Frontend: Design System & Shell

## Why
Before building any feature screens, we need the visual foundation: color tokens, typography, component primitives, and the app shell (navigation layout). The UI_UX_Plan mandates a matte aesthetic with strict color discipline.

## What

### 5.1 Tailwind Theme Configuration
In `tailwind.config.ts`, define the custom FlowWatcher palette:
- `slate-base: #1A1C23` (dark bg), `slate-surface: #22252E` (card bg), `slate-light: #F0F2F5` (light bg).
- `accent: #3ABAB4` (matte cyan) — used for active states, buttons, selected items.
- `warning: #E57373` — used for countdown, cancel states.
- `text-primary`, `text-secondary: #A0AEC0`, `text-muted`.
- `border-subtle: rgba(255,255,255,0.05)` for dark mode surface separation.

### 5.2 Typography
- Import **Inter** or **Geist** from Google Fonts.
- Set as default font family in Tailwind config.
- Define heading sizes: `text-2xl font-bold` for page titles, `text-lg font-semibold` for section heads, `text-sm` for secondary info.

### 5.3 App Shell Layout
- Custom titlebar (optional via Tauri `decorations: false`) with app name + status badge + window controls.
- Top **Pill Tab Navigation**: `Dashboard` | `Advanced` | `Logs` | `Settings`.
- Content area below navigation with smooth 150ms fade transitions between tabs.
- Responsive padding and max-width constraints to keep content centered.

### 5.4 ShadCN Component Installation
Install only the components we need:
- `Button`, `Card`, `Badge`, `Select`, `Switch`, `Tabs`, `Dialog`, `Popover`, `Input`, `Slider`, `Table`, `Toast`, `Tooltip`, `DropdownMenu`, `Separator`, `ScrollArea`.

### 5.5 Dark/Light/Auto Theme System
- Implement a `ThemeProvider` using React Context.
- Auto mode: detect OS preference via `window.matchMedia('(prefers-color-scheme: dark)')`.
- Store preference in Zustand + persist to config.
- Apply theme class to `<html>` element (`dark` / `light`).

## Context Source
`UI_UX_Plan.md` (sections 1, 2), `Project_Overview.md` (section 3D — UI Principles), `Project_Development_Overview.md` (section 2 — ShadCN + Tailwind).

## Expected Result
The app opens showing a clean, empty shell with navigation tabs, correct matte color palette, proper typography, and working dark/light theme toggle. No functional features yet — just the visual foundation.

## Skills to Use
- **`shadcn-ui`** — For installing and configuring components (Tabs, Button, Card, Badge, Switch, etc.), Tailwind CSS variable theming, and dark mode setup.
- **`vite`** — For dev server config, path aliases, and plugin setup.
- **`vercel-react-best-practices`** — For React component structure, performance patterns (memo, lazy loading), and rendering optimization.

## Depends On
Phase 0.

---

# Phase 6 — Frontend: Dashboard (Core Monitoring UI)

## Why
The Dashboard is the heart of the user experience. It's where users configure monitoring and start it — ideally in one or two clicks. The UI_UX_Plan defines a "Natural Language Trigger Builder" approach that makes the app feel premium.

## What

### 6.1 Real-Time Speed Display
- Two `Card` components showing live download and upload speeds.
- Speed values update every 1 second via Tauri `speed-update` events.
- Format speeds intelligently: `KB/s`, `MB/s`, `GB/s` with auto-scaling.
- Subtle animated sparkline graph (use a lightweight chart lib like `recharts` mini or a custom SVG path).
- Small badge: "Interface: Wi-Fi" (auto-detected).

### 6.2 Natural Language Trigger Builder
- Render as a readable sentence with inline interactive dropdowns:
  - *"When **[Download ▾]** is below **[200 ▾]** **[KB/s ▾]** for **[2 ▾]** **[min ▾]**, then **[Shutdown ▾]** the PC."*
- Each `[▾]` element is a `Popover` or `Select` from ShadCN.
- Options:
  - Monitor mode: `Download Only`, `Upload Only`, `Both`.
  - Threshold value: number input.
  - Threshold unit: `KB/s`, `MB/s`.
  - Duration: number input.
  - Duration unit: `seconds`, `minutes`.
  - Action: `Shutdown`, `Restart`, `Sleep`, `Hibernate`, `Sign Out`, `Lock Screen`, `Play Alarm`.
- All values are stored in Zustand and persisted.

> ⚠️ **Strategic Shift Enforcement:** The sentence builder and all config dropdowns must be driven by the available trigger/condition/action types from the backend (via `get_available_triggers()` and `get_available_actions()` commands). When a new trigger type is added in the backend, the frontend should render its config options automatically — no frontend code changes needed. Currently only "Network" trigger exists, but the rendering logic must be generic. See `Strategic_shift.md`.

### 6.3 Start/Stop Monitoring Button
- Large accent-colored button: **"Start Monitoring"**.
- On click: invokes `start_monitoring(config)` via Tauri.
- Button transforms to **"Stop Monitoring"** (secondary style) when active.
- Subtle pulsing dot indicator when monitoring is active.

### 6.4 Monitoring Status Indicator
- Status badge in the header area: `Idle` (gray) → `Monitoring` (accent/green pulse) → `Trigger Pending` (yellow) → `Countdown Active` (warning/red pulse) → `Action Executed` (gray).

### 6.5 Zustand State Store
- Create `useMonitoringStore` with:
  - `config: MonitoringConfig` (threshold, duration, mode, action).
  - `status: MonitoringState`.
  - `currentSpeed: SpeedData`.
  - `actions: startMonitoring(), stopMonitoring(), updateConfig()`.

## Context Source
`UI_UX_Plan.md` (section 3A — The Dashboard), `MyOwn_thinking.md` (Core Features, General Features), `Feature_and_capability_defination.md` (sections 1A, 3).

## Expected Result
User opens the app, sees live speeds, reads the natural language sentence, optionally tweaks values via dropdowns, and clicks "Start Monitoring". The status indicator changes. The monitoring engine runs in Rust. The UI reflects the state in real-time.

## Skills to Use
- **`shadcn-ui`** — For Card, Select, Popover, Button components with proper variant styling.
- **`vercel-react-best-practices`** — For efficient real-time updates (avoiding unnecessary re-renders from 1-second speed events), Zustand store patterns.

## Depends On
Phase 4 (Tauri bridge), Phase 5 (design system).

---

# Phase 7 — Frontend: Advanced Mode (Process Selection UI)

## Why
Process-based monitoring is the key differentiator. This UI must be accessible but not overwhelming — hidden behind a toggle so casual users never see it.

## What

### 7.1 Advanced Tab View
- Master toggle switch at the top: **"Monitor specific applications"**.
- When disabled: the tab shows explanatory text ("Enable to select specific apps to monitor").
- When enabled: reveals the process selection interface.

### 7.2 Process List with Smart Suggestions
- Fetch process list via `invoke('get_running_processes')`.
- Display as a searchable, scrollable checklist.
- Each row: `[checkbox] [app icon placeholder] Process Name (PID) — 2.3 MB/s ↓`.
- Auto-sort: highest network usage first.
- Smart suggestion badge on top processes: `Suggested` in accent color.

### 7.3 Exclusion List
- Separate section or tab within Advanced: "Always Ignore These Apps".
- Users can add processes to a permanent exclusion list (e.g., `svchost.exe`, `WindowsUpdate`).

### 7.4 Dashboard Integration
- When processes are selected, the Dashboard sentence updates: *"When **[3 selected apps]** are below..."*
- Clicking the "[3 selected apps]" text navigates to the Advanced tab.

## Context Source
`UI_UX_Plan.md` (section 3B), `Feature_and_capability_defination.md` (section 1B), `MyOwn_thinking.md` (Process based monitoring, Smart Process Mode, Exclude Processes).

## Expected Result
Users can toggle on process monitoring, search/select specific apps, see smart suggestions, and the dashboard reflects their choices seamlessly.

## Skills to Use
- **`shadcn-ui`** — For Switch toggles, ScrollArea, searchable checklists, Badge components.
- **`vercel-react-best-practices`** — For virtualized lists if process count is large, and efficient search/filter patterns.

### Deferred Items (from earlier phases)
- [From Phase 2] **PlayAlarmAction** — Audio playback via `rodio` crate. The `Action` trait is ready; needs `rodio` dependency + `PlayAlarmAction` implementation in `core/platform/src/actions.rs`.
- [From Phase 3] **Combined trigger logic** (global network idle + per-process idle) — The `ProcessTrigger` and `ThresholdCondition` exist independently; they need orchestration into a single monitoring loop.

## Depends On
Phase 3 (process monitoring engine), Phase 6 (dashboard).

---

# Phase 8 — Safety UI: Countdown & Warning System

## Why
This app controls system power. An accidental shutdown would destroy user trust permanently. The safety UI is non-negotiable and must be impossible to miss.

## What

### 8.1 Pre-Warning Toast (1 Minute Before)
- When the engine emits `pre-warning` event, show a Tauri native notification or a custom slide-in toast.
- Message: *"Network idle detected. Action will execute in 1 minute."*
- If app is minimized to tray, also show an OS-level notification.

### 8.2 The 30-Second Countdown Dialog
- When `countdown-started` event fires, bring the app window to the front via Tauri.
- Display a prominent fullscreen-style dialog (ShadCN `Dialog` with overlay):
  - Large countdown number: "29..." updating every second.
  - The chosen action name: "Shutting down..."
  - **"Cancel"** button — large, obvious, primary style. `Esc` key also triggers cancel.
  - **"Execute Now"** text button — subtle, secondary.
- The countdown ticks down via `countdown-tick` events from Rust.

### 8.3 Post-Action Feedback
- If cancelled: toast notification "Action cancelled. Monitoring paused."
- If executed: log the event (timestamp, action, trigger reason).

### 8.4 Optional Configurable Delay
- In Settings: "Wait [X] minutes after threshold met before starting countdown" (default: 0).
- This adds a delay between detection and the 1-minute pre-warning.

## Context Source
`UI_UX_Plan.md` (section 3C), `Feature_and_capability_defination.md` (section 2 — Safety Features), `MyOwn_thinking.md` (30 sec warning, Notify user 1 minute before).

## Expected Result
When the trigger fires, the user gets a 1-minute warning, then a highly visible 30-second countdown with clear cancel/execute options. No silent shutdowns. Ever.

## Skills to Use
- **`shadcn-ui`** — For Dialog (overlay countdown), Toast (pre-warning notifications), Button variants (cancel/execute).
- **`tauri-v2`** — For bringing the window to front, native OS notifications.

### Deferred Items (from earlier phases)
- [From Phase 4] **Event streaming runtime (`app.emit()`)** — Background polling loop that emits `speed-update`, `monitoring-state-change`, `countdown-tick`, `pre-warning` events via Tauri. The `ActionScheduler` already produces events; they need wiring to `app.emit()` + a tokio background task in `setup()`.
- [From Phase 1] **`NetworkIdleTrigger` struct** — Concrete trigger combining `SpeedMonitor` + `ThresholdCondition` into a single `Trigger` trait impl. Building blocks exist; needs the orchestration loop.

## Depends On
Phase 2 (action scheduler), Phase 6 (dashboard).

---

# Phase 9 — Activity Logging

## Why
Users need transparency. They need to see what the app did, when, and why. Logs also help debug false triggers and build trust for an app that controls system power.

## What

### 9.1 Rust Logging Engine (`core/engine/`)
- Implement `ActivityLogger`:
  - Log entry struct: `{ timestamp, interface_used, processes_monitored, trigger_reason, threshold_used, action_executed, was_cancelled, error }`.
  - Store in a local JSON file (in Tauri's app data directory).
  - Configurable log retention (default: 30 days / 1000 entries).
  - Methods: `add_entry()`, `get_all()`, `clear()`, `export(format: TXT | JSON)`.

### 9.2 Frontend Logs Tab
- Display logs in a `Table` (ShadCN) with columns: `Date/Time | Trigger Reason | Action | Status`.
- Status column: `✅ Executed`, `❌ Cancelled`, `⚠️ Error`.
- Filter/search bar.
- Footer buttons: "Clear Logs", "Export as JSON", "Export as TXT".
- Toggle: "Enable/Disable Logging".

## Context Source
`Feature_and_capability_defination.md` (section 5), `MyOwn_thinking.md` (Task Logging, Activity Logs tab), `Project_Overview.md` (section 7).

## Expected Result
Every monitoring session is logged. Users can view, filter, export, and clear their activity history from a clean table UI.

## Skills to Use
- **`shadcn-ui`** — For Table component (log display), Input (search/filter), Button (export actions).
- **`rust-best-practices`** — For clean serialization patterns (`serde`) and file I/O in the Rust logging engine.

### Deferred Items (from earlier phases)
- [From Phase 4] **`get_activity_logs` Tauri command** — Requires the persistence layer. Skeleton TypeScript types (`LogEntry`) are already defined in `src/types/index.ts`.

## Depends On
Phase 4 (Tauri bridge), Phase 5 (design system).

---

# Phase 10 — Settings, Persistence & Configuration

## Why
Users need to customize the app, and their preferences must persist between sessions. The app must also support auto-start on boot and screen management.

## What

### 10.1 Config File Management (`core/engine/`)
- Store settings as JSON in Tauri's `app_data_dir`.
- Saved preferences: last interface, threshold values, selected processes, action type, delay settings, theme, language, startup behavior, alarm sound path.
- Auto-save toggle (when enabled, saves on every change).
- Reset to defaults function.
- Import/export config file.

### 10.2 Settings UI Tab
Organized in clean sections with ShadCN components:
- **Appearance:** Theme selector (Dark / Light / Auto), Language selector (future, placeholder for now).
- **Behavior:** Start on Boot toggle (uses Tauri `autostart` plugin), Keep Screen On during monitoring toggle, Auto-save settings toggle.
- **Network:** Manual interface selection dropdown (defaults to "Auto-detect"). Hidden in accordion.
- **Delays:** "Wait [X] minutes after detection before countdown" — number input with slider.
- **Audio:** Default alarm sound preview + "Choose custom sound" file picker (`.mp3`, `.wav`).
- **Data:** Clear all logs button, Reset settings to default button.
- **About:** App version, link to GitHub repository, license info.

### 10.3 Auto-Start Implementation
- Use Tauri's `tauri-plugin-autostart` to register/unregister the app with the OS startup.

## Context Source
`Feature_and_capability_defination.md` (section 6), `MyOwn_thinking.md` (Save Settings, Auto Start on Boot, Custom Alarm, Action Delay), `Project_Overview.md` (section 8).

## Expected Result
All user preferences persist across sessions. The Settings tab is clean and organized. Auto-start works on Windows.

## Skills to Use
- **`shadcn-ui`** — For Switch, Select, Slider, Input, Accordion, and Dialog components in the settings UI.
- **`tauri-v2`** — For `tauri-plugin-autostart`, `tauri-plugin-fs` (file picker for custom alarm), and `tauri-plugin-store` (key-value persistence).

### Deferred Items (from earlier phases)
- [From Phase 4] **`get_settings` / `save_settings` Tauri commands** — Requires JSON file persistence in Tauri's `app_data_dir`. Skeleton TypeScript types (`AppSettings`) are defined in `src/types/index.ts`.
- [From Phase 6] **Play Alarm action in UI** — The action dropdown currently shows 6 system actions. `PlayAlarmAction` needs `rodio` backend (see Phase 7 deferred) + an entry in `get_available_actions()` + optional custom sound file picker.
- [From Phase 0] **ShadCN UI components** — Deferred due to Tailwind v4 incompatibility. Use `shadcn@canary` or continue with custom components. Decision needed here.

## Depends On
Phase 4, Phase 5.

---

# Phase 11 — System Tray & Background Operation

## Why
A monitoring tool is useless if it must stay in the foreground. Users need the app running silently in the background while they game or work.

## What

### 11.1 System Tray Icon
- Use Tauri's tray plugin to create a system tray icon.
- Tray icon shows a small FlowWatcher logo.
- Tooltip on hover: `FlowWatcher: D: 5.2 MB/s | U: 0.1 MB/s | Monitoring`.

### 11.2 Tray Context Menu
- Right-click menu items: `Start Monitoring`, `Stop Monitoring`, `Open Dashboard`, `---`, `Exit`.

### 11.3 Close-to-Tray Behavior
- When user clicks the window close (X) button:
  - First time: show a dialog — "Do you want to minimize to tray and keep monitoring, or exit completely?" with a "Don't ask again" checkbox.
  - Subsequent times (if preference saved): silently minimize to tray.

### 11.4 Window Restore
- Clicking the tray icon (single click) or "Open Dashboard" menu item restores the window.
- When countdown triggers, the window automatically restores and comes to front.

## Context Source
`Feature_and_capability_defination.md` (section 4 — System tray icon, Minimize-to-tray), `MyOwn_thinking.md` (System Tray Mode), `UI_UX_Plan.md` (section 4 — Silent Background Operation).

## Expected Result
User clicks "Start Monitoring", closes the window. The app minimizes to the system tray. Monitoring continues. The tray icon shows live status. When a trigger fires, the app restores itself to show the countdown.

## Skills to Use
- **`tauri-v2`** — For system tray plugin, tray menu configuration, window show/hide commands, and close-intercept behavior.

### Deferred Items (from earlier phases)
- [From Phase 5] **Custom Titlebar** (`decorations: false` in Tauri config) — Replace default OS decorations with a custom titlebar that includes window minimize/maximize/close buttons. The Tauri drag region is already set up in `AppShell.tsx`.
- [From Phase 4] **Tauri tray capabilities** — Permission plugins for system tray need to be added to the Tauri capabilities config.
- [From Phase 10] **Auto-Start Plugin** — `tauri-plugin-autostart` needs to be installed and wired to the existing Settings toggle. The UI toggle exists but is currently non-functional.
- [From Phase 8] **OS-level notifications** — Tauri notification plugin for pre-warning alerts when app is minimized to tray.

## Depends On
Phase 6 (dashboard must exist to restore to).

---

# Phase 12 — Internationalization Foundation

## Why
The project targets global users and open-source contributors worldwide. Hardcoding English strings now would require a painful rewrite later.

## What

### 12.1 i18next Setup
- Configure `i18next` with `react-i18next` in the frontend.
- Create `/locales/en.json` with ALL UI strings extracted from components.
- Wrap every user-facing string in `t('key')` calls.
- Set up language detection (browser/OS locale) with English fallback.

### 12.2 Language Selector in Settings
- Dropdown in Settings tab: initially just "English".
- Structure allows contributors to add `bn.json`, `es.json`, etc.

### 12.3 Translation Contribution Guide
- Add `docs/TRANSLATION_GUIDE.md` explaining how to add a new language.

## Context Source
`Feature_and_capability_defination.md` (section 7), `Project_Development_Overview.md` (section 7), `OpenSource_Repo_Setup.md` (section 11).

## Expected Result
All UI strings are externalized. Adding a new language requires only adding a JSON file.

## Skills to Use
- **`i18n-localization`** — For detecting hardcoded strings, setting up locale files, translation management patterns, and RTL support preparation.

### Deferred Items (from earlier phases)
- [From Phase 10] **Language selector wiring** — Settings page has a language placeholder dropdown. Needs to be connected to i18next locale switching once translations are set up.

## Depends On
Phase 5, Phase 6 (components must exist to wrap strings).

---

# Phase 13 — CI/CD & Code Quality Automation

## Why
Professional open-source projects enforce quality automatically. This prevents regressions, ensures consistent code style, and makes contributors confident their PRs meet standards.

## What

### 13.1 GitHub Actions Workflows
- **Rust CI:** `cargo build`, `cargo test`, `cargo clippy -- -D warnings`, `cargo fmt --check`.
- **Frontend CI:** `npm run type-check`, `npm run lint`, `npm run build`.
- **Tauri Build:** Build Windows `.msi` / `.exe` installer on `main` branch pushes.
- Fail PR if any check fails.

### 13.2 Issue & PR Templates
- Bug report template: OS, version, expected vs actual behavior, logs.
- Feature request template: problem, proposed solution, alternatives.
- PR template: what changed, why, how to test.

### 13.3 Commit Convention
- Enforce conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
- Optionally use `commitlint` in CI.

## Context Source
`OpenSource_Repo_Setup.md` (sections 8, 9), `Project_Development_Overview.md` (section 11).

## Expected Result
Every push and PR is automatically validated. Contributors get clear feedback. The `main` branch is always in a buildable, passing state.

## Skills to Use
- **`eslint-prettier-config`** — For configuring ESLint CI checks, Prettier formatting enforcement, and TypeScript-specific lint rules.
- **`semantic-versioning`** — For conventional commit enforcement (`commitlint`), automated changelog generation, and version bumping strategy.

## Depends On
Phase 0 (repository must exist).

---

# Phase 14 — Polish, Performance & Edge Cases

## Why
A system utility that consumes excessive resources or crashes on edge cases will be immediately uninstalled. This phase hardens the product for real-world use.

## What

### 14.1 Performance Optimization
- Profile Rust backend CPU/memory usage during long monitoring sessions.
- Target: <50MB RAM, near-zero CPU when idle (from `Project_Overview.md`).
- Optimize polling intervals (configurable, default 1s).
- Debounce frontend UI updates (don't re-render sparkline 60 times/sec).
- Lazy-load Advanced and Logs tabs.

### 14.2 Edge Case Handling
- Network adapter disconnects mid-monitoring → pause, notify user, wait for reconnection.
- Selected process exits mid-monitoring → treat as "idle", continue monitoring others.
- Hibernate not supported → disable option, show tooltip explaining why.
- User has no admin privileges → show clear error for actions requiring elevation.
- App crash during countdown → on restart, check if action was pending and ask user what to do.

### 14.3 Accessibility
- Ensure all interactive elements have proper ARIA labels.
- Keyboard navigation for all controls.
- Focus management in the countdown dialog.
- High contrast ratios (WCAG AA minimum).

### 14.4 Keep Screen On Feature
- When enabled and monitoring is active, prevent the screen from sleeping.
- Use Tauri or platform API to set/reset display keep-alive.

## Context Source
`Feature_and_capability_defination.md` (section 9 — Performance Controls), `Project_Development_Overview.md` (section 8 — Performance Strategy), `Project_Overview.md` (section 5, 6), `MyOwn_thinking.md` (Keep screen on toggle).

## Expected Result
The app runs for hours without memory leaks or CPU spikes. Edge cases are handled gracefully with clear user feedback.

## Skills to Use
- **`rust-best-practices`** — For performance profiling patterns, memory-safe cleanup, and clippy perf lints.
- **`vercel-react-best-practices`** — For React render optimization, lazy loading, debouncing UI updates, and bundle analysis.
- **`tauri-v2`** — For platform API calls (keep screen on, window management edge cases).

### Deferred Items (from earlier phases)
- [From Phase 3] **True per-process network usage via ETW** — Currently using disk I/O as a proxy. Event Tracing for Windows (ETW) would provide accurate per-process network bytes. Complex to implement; evaluate if the proxy is "good enough" or upgrade is needed.
- [From Phase 4] **Tauri auto-start capability** — Permission plugin for `tauri-plugin-autostart` needs to be registered in capabilities config.
- [From Phase 4/8] **Event streaming runtime (`app.emit()`)** — Background polling loop emitting `speed-update`, `monitoring-state-change`, `countdown-tick`, `pre-warning` events via Tauri. Currently using `setInterval`/`invoke()` polling. The `ActionScheduler` produces events; they need wiring to `app.emit()` + a tokio background task.
- [From Phase 1/8] **`NetworkIdleTrigger` struct** — Concrete trigger combining `SpeedMonitor` + `ThresholdCondition` into a single `Trigger` trait impl with a real orchestration loop.
- [From Phase 3/8] **Combined trigger logic** — Orchestrate global network idle + per-process idle into a single monitoring loop.
- [From Phase 10] **Keep Screen On** — OS API call to prevent screen sleep during active monitoring. The Settings toggle exists but is not wired to backend.
- [From Phase 10] **Custom Alarm Sound** — File picker for `.mp3`/`.wav` using `tauri-plugin-dialog`. Requires `PlayAlarmAction` to be implemented first.
- [From Phase 10] **Network Interface Selection** — Manual interface dropdown in settings. Auto-detect works well; this is low priority.
- [From Phase 10] **Import/Export Config** — Allow users to export and import their settings as a JSON file.
- [From Phase 9] **File persistence for logs** — Logs are currently in-memory only (1000 entry cap). Saving to Tauri `app_data_dir` would enable persistence across restarts.
- [From Phase 9] **Log retention by date** — 30-day retention policy. Requires file persistence to be implemented first.
- [From Phase 9] **Enable/Disable logging toggle** — Settings toggle to turn off activity logging.
- [From Phase 7] **Process list auto-polling** — Process list is manually refreshed; could auto-refresh on interval.
- [From Phase 2/7] **PlayAlarmAction** — Audio playback via `rodio` crate. The `Action` trait is ready; needs `rodio` dependency + `PlayAlarmAction` implementation + UI dropdown entry.
- [From Phase 0/5/10] **ShadCN UI components** — Deferred due to Tailwind v4 incompatibility. Evaluate `shadcn@canary` or continue with custom components.
- [From Phase 8] **Configurable delay in Settings** — `pre_warning_secs` config field exists and is used; the Settings UI has a number input for it. Verify end-to-end wiring.

## Depends On
All prior phases.

---

# Phase 15 — Release Preparation & Open Source Launch

## Why
The first release defines public perception. A polished v0.1.0 with clear documentation, a working installer, and professional branding will attract contributors and early adopters.

## What

### 15.1 Branding Assets
- Design app icon (clean, minimal, recognizable at 16×16 for tray).
- Create README banner image.
- Take clean screenshots (dark + light mode) for README.

### 15.2 README Polish
- Clear description of what problem FlowWatcher solves.
- Screenshots / demo GIF.
- Installation instructions (download `.msi` from releases).
- Quick start guide.
- Feature list with status badges (✅ Done, 🚧 In Progress, 📋 Planned).
- Contribution invitation.

### 15.3 Windows Installer Build
- Configure Tauri bundler for `.msi` and portable `.exe`.
- Generate checksums for release artifacts.
- Tag version `v0.1.0`.
- Create GitHub Release with release notes, installer, checksums.

### 15.4 ROADMAP.md
- Write public roadmap with milestones:
  - `v0.1.0` — Basic network monitoring + actions (current release).
  - `v0.5.0` — Process-based monitoring.
  - `v0.8.0` — Advanced action engine, CLI preparation.
  - `v1.0.0` — Stable Windows release.

### 15.5 Versioning
- Follow SemVer strictly (`0.x.x` for pre-stable).
- Maintain `CHANGELOG.md` with every release.

## Context Source
`OpenSource_Repo_Setup.md` (sections 4, 5, 6, 13, 14), `Project_Development_Overview.md` (sections 5, 12).

## Expected Result
A professional GitHub repository with a working Windows installer, clear documentation, clean branding, and an inviting contribution process. Users can download, install, and use FlowWatcher v0.1.0.

## Skills to Use
- **`semantic-versioning`** — For SemVer tagging, release notes generation, and `CHANGELOG.md` management.
- **`tauri-v2`** — For Tauri bundler configuration (`.msi`, `.exe`, icons, signing).

## Depends On
All prior phases.

---

# Phase Dependency Graph

```
Phase 0 (Scaffolding)
├── Phase 1 (Network Monitoring) ──┐
├── Phase 2 (Action Engine) ───────┤
│   └── Phase 3 (Process Monitor) ─┤
├── Phase 5 (Design System) ───────┤
│                                  │
├── Phase 13 (CI/CD) ─────────────(independent)
│                                  │
└── Phase 4 (Tauri Bridge) ────────┤ (depends on 1, 2)
                                   │
    Phase 6 (Dashboard UI) ────────┤ (depends on 4, 5)
    ├── Phase 7 (Advanced UI) ─────┤ (depends on 3, 6)
    ├── Phase 8 (Safety UI) ───────┤ (depends on 2, 6)
    ├── Phase 9 (Logs) ────────────┤ (depends on 4, 5)
    ├── Phase 10 (Settings) ───────┤ (depends on 4, 5)
    ├── Phase 11 (System Tray) ────┤ (depends on 6)
    └── Phase 12 (i18n) ──────────(depends on 5, 6)
                                   │
    Phase 14 (Polish) ─────────────┤ (depends on all)
    Phase 15 (Release) ────────────┘ (depends on all)
```

---

# Summary: Version Milestones

| Version | Includes Phases | Description |
|---------|----------------|-------------|
| `v0.1.0` | 0, 1, 2, 4, 5, 6, 8, 13 | Core network monitoring, actions, dashboard UI, safety countdown, CI/CD. |
| `v0.3.0` | + 9, 10, 11 | Activity logging, settings persistence, system tray background mode. |
| `v0.5.0` | + 3, 7 | Process-based monitoring with smart suggestions. |
| `v0.7.0` | + 12, 14 | Internationalization foundation, performance hardening, edge cases. |
| `v1.0.0` | + 15 | Stable public release with full documentation and Windows installer. |

---

> **Note to the builder (human or AI):** Always complete and verify each phase before moving to the next. Run `cargo test` after every Rust phase. Run `npm run build` + `npm run lint` after every frontend phase. Run `npm run tauri dev` after integration phases. Never skip testing.
