---
description: Document a completed FlowWatcher development phase - creates a structured completion report comparing what was planned vs what was built, with strategy notes and decisions.
---

# Phase Completion Documentation

Run this workflow after completing a development phase to create a formal completion document. This serves as the project's historical record and is critical for the `/resume-development` workflow to understand project progress.

---

## Step 1 — Identify the Completed Phase

Ask the user or determine from context:

```
1. Which phase number was just completed? (e.g., Phase 0, Phase 1, etc.)
2. Read the corresponding phase section from: d:\Projects\Web\raw\FlowWatcher\Project_Development_Roadmap.md
3. Extract the following from the roadmap:
   - Phase title
   - All planned deliverables (the "What" section)
   - Expected result
   - Context sources referenced
```

**Why:** The roadmap defines what was *planned*. We need this as the baseline to compare against what was *actually built*.

---

## Step 2 — Audit What Was Actually Built

Examine the codebase to determine what was implemented for this phase.

```
1. List and read all new or modified files relevant to this phase.
2. For Rust phases (1, 2, 3): read all files in the relevant core/ sub-crates.
3. For Frontend phases (5, 6, 7): read all new components, stores, and styles.
4. For Integration phases (4): read Tauri commands, event handlers, and type definitions.
5. For Infrastructure phases (0, 13): check repo structure, CI configs, and documentation files.
6. Note any files or features that were planned but NOT implemented.
7. Note any files or features that were implemented but NOT in the original plan.
```

**Why:** Real development often deviates from the plan. Documenting the actual state prevents confusion in future sessions and gives honest project tracking.

---

## Step 3 — Document Strategy, Algorithms & Key Decisions

Capture the technical details of how things were built, not just what was built.

```
For each major deliverable in this phase, document:

1. **Approach/Strategy:** How was it implemented? What pattern or algorithm was used?
2. **Key Decisions:** Any architectural choices, library selections, or trade-offs made.
3. **Deviations from Plan:** If the implementation differs from the roadmap, explain why.
4. **Challenges Encountered:** Any bugs, blockers, or unexpected difficulties.
5. **Dependencies Added:** Any new crates (Cargo.toml) or npm packages (package.json) introduced.
```

**Why:** Future developers (or AI agents) need to understand *why* things were built a certain way, not just *what* exists. This prevents accidental regressions and helps when debugging or extending features.

---

## Step 4 — Run Verification Checks

Verify that the phase is truly complete and stable.

```
1. If Rust code was added:
   - Run: cargo build (from the relevant crate directory)
   - Run: cargo test (from the relevant crate directory)
   - Run: cargo clippy (from the relevant crate directory)
   - Document pass/fail status and any warnings.

2. If Frontend code was added:
   - Run: npm run build (from apps/desktop/)
   - Run: npm run lint (from apps/desktop/)
   - Document pass/fail status and any warnings.

3. If Tauri integration was done:
   - Run: npm run tauri dev (from apps/desktop/)
   - Verify the app launches and the new features are visible/functional.
   - Document the result.

4. If none of the above apply (e.g., documentation-only phase):
   - Verify all expected files exist.
   - Document the result.
```

**Why:** A phase is not "done" unless it compiles, passes tests, and works. This step enforces that discipline and records the evidence.

---

## Step 5 — Write the Phase Completion Document

Create the formal completion document at the standard location.

```
Create file: d:\Projects\Web\raw\FlowWatcher\docs\phases\Phase_[X]_Completion.md

Use the following template:
```

### Template:

```markdown
# Phase [X] — [Phase Title] — Completion Report

**Date Completed:** [Current Date]
**Version:** [Current version, e.g., v0.1.0-dev]
**Status:** ✅ Complete | ⚠️ Partial | ❌ Incomplete

---

## 1. What Was Planned (From Roadmap)

[Copy the deliverable list from Project_Development_Roadmap.md for this phase]

---

## 2. What Was Actually Built

### Implemented ✅
- [List each deliverable that was completed, with the relevant file paths]

### Not Implemented ❌ (Deferred)
- [List any planned items that were skipped, with the reason]

### Unplanned Additions ➕
- [List any extra work done that wasn't in the original plan]

---

## 3. Strategy & Technical Decisions

### [Deliverable/Component Name]
- **Approach:** [How it was implemented]
- **Algorithm/Pattern:** [Any specific pattern used, e.g., trait-based dispatch, rolling average, state machine]
- **Libraries Used:** [New dependencies added]
- **Key Decision:** [Why this approach was chosen over alternatives]

[Repeat for each major deliverable]

---

## 4. Challenges & Deviations

- [Any bugs, blockers, unexpected issues, or deviations from the plan]

---

## 5. Verification Results

| Check | Command | Result |
|-------|---------|--------|
| Rust Build | `cargo build` | ✅ Pass / ❌ Fail |
| Rust Tests | `cargo test` | ✅ Pass / ❌ Fail |
| Rust Lint | `cargo clippy` | ✅ Pass / ❌ Fail |
| Frontend Build | `npm run build` | ✅ Pass / ❌ Fail |
| Frontend Lint | `npm run lint` | ✅ Pass / ❌ Fail |
| Tauri Dev Launch | `npm run tauri dev` | ✅ Pass / ❌ Fail |

---

## 6. Files Created or Modified

| File Path | Action | Purpose |
|-----------|--------|---------|
| `path/to/file` | Created / Modified | Brief description |

---

## 7. Next Phase

- **Next Phase:** Phase [X+1] — [Title]
- **Blocked By:** [Any prerequisites not yet met]
- **Ready to Start:** Yes / No
```

**Why:** This document becomes the permanent record of this phase. The `/resume-development` workflow reads these documents to understand project history. Without them, every new session starts from scratch.

---

## Step 6 — Confirm with User

Present the completed document to the user for review. Ask if anything needs to be corrected or added before finalizing.
