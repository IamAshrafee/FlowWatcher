# Contributing to FlowWatcher

Thank you for your interest in contributing to FlowWatcher! This guide will help you get started.

## Development Setup

### Prerequisites

- **Rust** (stable, 1.77+): [rustup.rs](https://rustup.rs/)
- **Node.js** (18+): [nodejs.org](https://nodejs.org/)
- **Tauri prerequisites**: [tauri.app/start/prerequisites](https://v2.tauri.app/start/prerequisites/)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/IamAshrafee/FlowWatcher.git
cd FlowWatcher

# Install frontend dependencies
cd apps/desktop
npm install

# Run the dev server
npm run tauri dev
```

### Building the Core Rust Engine (independently)

```bash
cd core
cargo build
cargo test
```

---

## Architecture Quick Reference

FlowWatcher uses a **Trigger → Condition → Action** trait-based architecture:

```
core/
├── engine/       # Orchestrator + ActivityLogger
├── triggers/     # Trigger trait + NetworkIdleTrigger, ProcessTrigger
├── actions/      # Action trait + Shutdown, Sleep, Hibernate, etc.
├── conditions/   # Condition trait + ThresholdCondition
└── platform/     # OS abstraction (Windows APIs)
```

> **⚠️ Important:** Read [`Strategic_shift.md`](./Strategic_shift.md) before writing any backend code. The Rust engine uses trait-based abstractions (Trigger, Condition, Action) to stay extensible. Code that hardcodes network-specific logic into the engine layer will not be accepted.

---

## Branch Naming

- `feature/short-description` — New features
- `fix/short-description` — Bug fixes
- `docs/short-description` — Documentation updates
- `refactor/short-description` — Code restructuring

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add network idle trigger
feat(dashboard): add sparkline graphs to speed cards
fix: handle adapter disconnect gracefully
fix(logger): prevent duplicate log entries
docs: update contributing guide
chore: update dependencies
refactor: extract threshold logic into condition engine
test: add ActionScheduler cancellation tests
ci: add Prettier format check to CI workflow
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`.

Commits are validated automatically in CI via commitlint.

---

## Local Development Checks

Before pushing, run these commands to catch issues locally (the same checks CI runs):

### Frontend (from `apps/desktop/`)

```bash
npm run lint           # ESLint — must pass with 0 errors
npm run format:check   # Prettier — must pass with 0 errors
npm run build          # TypeScript + Vite build — must succeed
```

### Rust Core (from `core/`)

```bash
cargo fmt --all --check          # Formatting — must be clean
cargo clippy --all-targets -- -D warnings   # Lints — 0 warnings
cargo test --all                 # All tests must pass
```

### Rust Tauri Backend (from `apps/desktop/src-tauri/`)

```bash
cargo fmt --check
cargo clippy -- -D warnings
cargo check
```

---

## CI/CD

Every push and pull request is automatically checked by GitHub Actions:

| Check | What it does |
|-------|-------------|
| **Rust CI** | `cargo fmt`, `clippy`, `build`, `test` on Windows |
| **Frontend CI** | ESLint, Prettier, TypeScript + Vite build |
| **Commitlint** | Validates commit messages follow conventional format (PRs only) |
| **Tauri Build** | Builds Windows installer on `main` pushes |

If any check fails, the PR cannot be merged. Run the local checks above before pushing to avoid CI failures.

---

## Pull Requests

1. Fork the repository and create a branch from `dev`.
2. Make your changes, ensuring all local checks pass.
3. Write clear commit messages following the convention above.
4. Open a PR against the `dev` branch.
5. Fill out the PR template — describe what changed, why, and how to test.

---

## Code Style

- **Rust:** `cargo clippy` must pass with no warnings. `cargo fmt` for formatting. Follow the `rustfmt.toml` config at the project root.
- **TypeScript/React:** `npm run lint` must pass. Prettier formats code via `npm run format`.
- **i18n:** Wrap all user-facing strings in `t('key')` and add them to `src/locales/en.json`.

---

## Adding Translations

See [`docs/TRANSLATION_GUIDE.md`](./docs/TRANSLATION_GUIDE.md) for how to add a new language. You can also use the agent workflow `/add-language` if working with the AI assistant.
