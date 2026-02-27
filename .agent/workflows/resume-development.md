---
description: Resume FlowWatcher development - loads all project context, roadmap, codebase state, and phase completion status to get fully up to speed before continuing work.
---

# Resume FlowWatcher Development

Run this workflow at the start of every new session to regain full project context before writing any code.

---

## Step 0 — Read the Strategic Shift Mandate (MANDATORY FIRST)

**This is the single most important document in the project. Read it before everything else.**

```
Read: d:\Projects\Web\raw\FlowWatcher\Strategic_shift.md
```

**Why:** The Strategic Shift mandates that the entire Rust backend follow a **Trigger Engine + Condition Engine + Action Engine** trait-based architecture. Network monitoring is the FIRST implementation, not the ONLY one. Every phase, every commit, and every code review must enforce this. If you skip this step, you will write code that violates the project's core architectural rule.

---

## Step 1 — Read All Planning & Design Documents

Read every planning markdown file in the project root to understand the vision, features, architecture, and UI/UX strategy.

// turbo-all

```
Read the following files in order:

1. d:\Projects\Web\raw\FlowWatcher\MyOwn_thinking.md
2. d:\Projects\Web\raw\FlowWatcher\Feature_and_capability_defination.md
3. d:\Projects\Web\raw\FlowWatcher\Project_Overview.md
4. d:\Projects\Web\raw\FlowWatcher\Project_Development_Overview.md
5. d:\Projects\Web\raw\FlowWatcher\OpenSource_Repo_Setup.md
6. d:\Projects\Web\raw\FlowWatcher\UI_UX_Plan.md
```

**Why:** These files contain the complete product vision, feature definitions, technology decisions, repo structure plan, strategic architectural direction, and UI/UX layout plan. They are the foundation of every decision in this project.

---

## Step 2 — Read the Complete Development Roadmap

Read the full roadmap file which contains all 16 phases (Phase 0–15), their deliverables, dependencies, context sources, and expected results.

```
Read: d:\Projects\Web\raw\FlowWatcher\Project_Development_Roadmap.md
```

**Why:** This is the single source of truth for what to build, in what order, and why. It maps every feature to a phase and every phase to a version milestone. You must know which phase is next.

---

## Step 3 — Scan Project Structure & Key Source Files

Understand the current state of the codebase by listing directories and reading the most important files.

```
1. List the top-level project directory: d:\Projects\Web\raw\FlowWatcher\
2. If apps/desktop/ exists, list its contents recursively (max depth 3).
3. If core/ exists, list its contents recursively (max depth 3).
4. Read the following key files if they exist:
   - apps/desktop/src-tauri/Cargo.toml
   - apps/desktop/src-tauri/src/main.rs
   - apps/desktop/src-tauri/src/lib.rs
   - apps/desktop/src-tauri/tauri.conf.json
   - apps/desktop/package.json
   - apps/desktop/tailwind.config.ts (or .js)
   - apps/desktop/src/App.tsx
   - apps/desktop/src/main.tsx
   - core/Cargo.toml
   - core/engine/src/lib.rs
   - core/triggers/src/lib.rs
   - core/actions/src/lib.rs
   - core/conditions/src/lib.rs
   - core/platform/src/lib.rs
5. Read any Zustand store files (e.g., src/stores/*.ts).
6. Read any type definition files (e.g., src/types/*.ts).
```

**Why:** This gives you a clear picture of what code exists, what has been implemented, and what the current architecture looks like. Without this, you risk duplicating work or breaking existing code.

---

## Step 4 — Read All Phase Completion Documents

Read every phase completion document to understand exactly what has been done, what was expected, and what decisions were made.

```
1. List all files in: d:\Projects\Web\raw\FlowWatcher\docs\phases\
2. Read each Phase_X_Completion.md file found (e.g., Phase_0_Completion.md, Phase_1_Completion.md, etc.)
3. If no phase completion documents exist yet, note that no phases have been formally completed.
```

**Why:** Phase completion documents are the historical record of the project. They tell you:
- Which phases are done.
- What was actually built vs. what was planned.
- Any deviations, bugs encountered, or architectural decisions made during implementation.
- What the next phase to work on is.

---

## Step 5 — Determine Current Phase & Next Steps

Based on everything read above, determine:

```
1. What is the last completed phase?
2. What is the current/next phase to work on?
3. Are there any blockers or incomplete items from previous phases?
4. Summarize the current project status in 3-5 sentences.
```

**Why:** This is the final synthesis step. After reading all context, you must clearly identify where development stands and what to do next. Report this summary to the user before proceeding with any code changes.
