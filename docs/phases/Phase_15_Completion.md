# Phase 15 Completion — Release Preparation & Open Source Launch

**Status:** ✅ Complete
**Date:** 2026-03-01

---

## Objective

Prepare FlowWatcher for its first public release (v0.1.0) with polished documentation, comprehensive changelog, public roadmap, and consistent versioning across all manifests.

---

## What Was Built

### 1. README.md Polish
- Updated status badge from "under development" to "v0.1.0"
- Added GitHub Actions CI badge
- Fixed "Screenshoots" → "Screenshots" typo
- Added **How It Works** section (3-step explanation of the monitoring flow)
- Added **Installation** section with download + build-from-source instructions
- Updated milestone table: all phases 0–14 marked ✅ Complete
- Added CI/CD to tech stack table
- Updated project structure to reflect current state

### 2. CHANGELOG.md (v0.1.0)
Comprehensive release notes organized by category:
- **Core Engine** — Network monitoring, triggers, conditions, actions, logger, process monitoring
- **Tauri Bridge** — 20+ commands, settings persistence, system tray, close-to-tray
- **Frontend** — Dashboard, trigger builder, process monitoring, countdown, logs, settings, theme system
- **Internationalization** — i18next, English locale, language selector
- **CI/CD** — GitHub Actions workflows, issue/PR templates, commitlint, ESLint/Prettier
- **Repository** — Monorepo structure, license, contributing guide, code of conduct

### 3. ROADMAP.md (NEW)
Public-facing roadmap with milestones:
- **v0.1.0** ✅ — Foundation release (current)
- **v0.2.0** — Deferred items and refinements (18 items listed)
- **v0.5.0** — Advanced triggers (CPU, timer, process exit, ETW)
- **v0.8.0** — Extensibility (plugins, CLI, macOS)
- **v1.0.0** — Stable release (signing, auto-update, docs site)

### 4. CONTRIBUTING.md Expansion
Grew from 71 lines to ~120 lines with:
- Architecture quick reference with directory tree
- Strategic shift reminder callout
- Scoped commit message examples (`feat(dashboard):`, `fix(logger):`)
- CI/CD section with check table explaining what each job validates
- Local Development Checks section with exact commands for frontend + Rust
- Translation contribution pointer

### 5. Version Alignment
Aligned all manifests to `0.1.0`:

| File | Before | After |
|------|--------|-------|
| `apps/desktop/package.json` | `0.0.0` | `0.1.0` |
| `core/Cargo.toml` workspace | `0.0.1` | `0.1.0` |
| `tauri.conf.json` | `0.1.0` | ✅ Already correct |
| `apps/desktop/src-tauri/Cargo.toml` | `0.1.0` | ✅ Already correct |

---

## Files Changed

| File | Change |
|------|--------|
| `README.md` | **MODIFIED** — Polished with installation, how-it-works, updated badges |
| `CHANGELOG.md` | **MODIFIED** — Comprehensive v0.1.0 release notes |
| `ROADMAP.md` | **NEW** — Public roadmap v0.1.0 → v1.0.0 |
| `CONTRIBUTING.md` | **MODIFIED** — Expanded with CI/CD, checks, architecture |
| `apps/desktop/package.json` | **MODIFIED** — Version 0.0.0 → 0.1.0 |
| `core/Cargo.toml` | **MODIFIED** — Version 0.0.1 → 0.1.0 |

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ 0 errors |
| `npm run build` | ✅ 85 modules, 1.39s |
| `cargo test --all` (core/) | ✅ All pass |
| `cargo clippy --all-targets -- -D warnings` (core/) | ✅ 0 warnings |

---

## Deferred Items

| Item | Reason |
|------|--------|
| Custom branded app icon | Visual design task; Tauri default icons are functional for v0.1.0 |
| Demo GIF in README | Requires screen recording of the running app |
| Signed Windows binaries | Requires code signing certificate; targeted for v1.0.0 |
| GitHub Release creation | Requires pushing to GitHub and creating the release tag manually |

---

## Strategy Notes

- **Version `0.1.0`** signals "first usable release" per SemVer conventions for pre-1.0 software. The `0.x.x` range allows breaking changes between minor versions.
- **ROADMAP.md is public-facing** — it uses simple language and checkboxes to show progress. The internal `Project_Development_Roadmap.md` remains the detailed engineering roadmap.
- **CHANGELOG follows Keep a Changelog format** — organized by category rather than by phase, since external users care about features not internal development phases.
