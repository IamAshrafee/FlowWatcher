# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

_No unreleased changes._

## [0.1.0] — 2026-03-01

### Added

**Core Engine (Rust)**
- Network speed monitoring via Windows performance counters (`core/platform/`)
- `Trigger` trait with `NetworkIdleTrigger` and `ProcessTrigger` implementations (`core/triggers/`)
- `Condition` trait with `ThresholdCondition` — configurable threshold, duration, and monitor mode (`core/conditions/`)
- `Action` trait with 6 system actions: Shutdown, Restart, Sleep, Hibernate, Lock Screen, Sign Out (`core/actions/`)
- `ActionScheduler` with state machine: Idle → Pending → Countdown → Executed/Cancelled (`core/engine/`)
- `ActivityLogger` with in-memory storage, JSON/TXT export, and date-based pruning (`core/engine/`)
- Process enumeration and per-process network usage tracking (`core/platform/`)
- Smart process suggestions sorted by network activity
- Keep Screen On feature via Windows `SetThreadExecutionState` API

**Tauri Bridge**
- 20+ Tauri commands connecting Rust backend to React frontend
- Real-time speed polling with configurable intervals
- Settings persistence via JSON in Tauri `app_data_dir`
- System tray with context menu (Start/Stop Monitoring, Open Dashboard, Exit)
- Close-to-tray behavior with configurable preference
- Config import/export via clipboard

**Frontend (React + TypeScript)**
- Dashboard with real-time speed cards and sparkline graphs
- Natural Language Trigger Builder — configure monitoring via readable sentence with inline dropdowns
- Process-Aware Monitoring — Advanced tab with toggle, searchable process list, and exclusion list
- 30-second countdown dialog with cancel/execute-now actions
- Toast notification system for pre-warnings and feedback
- Activity Logs tab with table, search, export (JSON/TXT), and clear
- Settings page: Appearance, Behavior, Delays, Data, and About sections
- Dark / Light / Auto theme system via Zustand + CSS custom properties
- Custom design system: matte monochromatic palette, Inter font, CSS animations
- Tab navigation with smooth transitions

**Internationalization**
- i18next + react-i18next integration
- English locale file with 100+ externalized UI strings
- Language selector in Settings (extensible to any language)

**CI/CD & Code Quality**
- GitHub Actions CI: Rust checks (fmt, clippy, build, test) + frontend checks (ESLint, Prettier, build) + commitlint
- GitHub Actions build: Windows MSI/NSIS installer on `main` pushes
- Issue templates: bug report + feature request (YAML forms)
- PR template with type-of-change checkboxes and quality checklist
- Conventional commit enforcement via commitlint
- ESLint + Prettier configuration for TypeScript/React
- `rustfmt.toml` for consistent Rust formatting

**Repository**
- Monorepo structure: `apps/desktop/` (Tauri) + `core/` (pure Rust workspace)
- MIT License
- Contributing guide
- Code of Conduct (Contributor Covenant)
- Phase completion documentation for all 15 development phases
