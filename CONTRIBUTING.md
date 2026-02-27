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

## Branch Naming

- `feature/short-description` — New features
- `fix/short-description` — Bug fixes
- `docs/short-description` — Documentation updates
- `refactor/short-description` — Code restructuring

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add network idle trigger
fix: handle adapter disconnect gracefully
docs: update contributing guide
chore: update dependencies
refactor: extract threshold logic into condition engine
```

## Pull Requests

1. Fork the repository and create a branch from `dev`.
2. Make your changes, ensuring tests pass.
3. Write clear commit messages following the convention above.
4. Open a PR against the `dev` branch.
5. Describe what you changed, why, and how to test it.

## Code Style

- **Rust:** `cargo clippy` must pass with no warnings. `cargo fmt` for formatting.
- **TypeScript/React:** `npm run lint` must pass. Prettier auto-formats on save.

## Architecture Rule

> **Important:** Read `Strategic_shift.md` before writing any backend code. The Rust engine uses trait-based abstractions (Trigger, Condition, Action) to stay extensible. Code that hardcodes network-specific logic into the engine layer will not be accepted.
