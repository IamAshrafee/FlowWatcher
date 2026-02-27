---
description: Audit all phase completion docs for deferred/not-implemented items and update the roadmap to include them in the correct future phases
---

# Audit Deferred Items & Update Roadmap

Run this workflow after completing a phase (or periodically) to ensure nothing deferred gets forgotten. It scans all Phase Completion documents, extracts deferred items, and injects them into the appropriate future phases in the roadmap.

// turbo-all

---

## Step 1 — Read All Phase Completion Documents

```
1. List all files in: d:\Projects\Web\raw\FlowWatcher\docs\phases\
2. Read every Phase_X_Completion.md file found.
3. For each document, extract items from the "Not Implemented ❌ (Deferred)" section.
4. For each deferred item, note:
   - Which phase it was deferred FROM
   - What the item is (feature/task description)
   - Which phase or time it was deferred TO (if mentioned)
   - Any reason given for deferral
```

**Why:** This is the raw data. You need to know exactly what was skipped and where it was supposed to land.

---

## Step 2 — Build a Deferred Items Registry

```
1. Compile ALL deferred items into a structured list, grouped by their TARGET phase.
2. Format:
   - **Target Phase X:**
     - [Deferred from Phase Y] Item description — Reason
3. If a deferred item has no clear target phase, flag it as "UNASSIGNED — needs triage".
4. Print this full registry to the user for review before proceeding.
```

**Why:** This gives visibility into the full scope of deferred work before modifying any files.

---

## Step 3 — Update the Project Development Roadmap

```
1. Read: d:\Projects\Web\raw\FlowWatcher\Project_Development_Roadmap.md
2. For each phase that has deferred items targeting it, add a new section:

   ### Deferred Items (from earlier phases)
   - [From Phase Y] Item description — Reason it was deferred

3. Place this section AFTER the "What" section and BEFORE "Context Source" for each affected phase.
4. If items are already listed in the phase's "What" section, do NOT duplicate — just add a note referencing the deferral.
5. Save the updated roadmap.
```

**Why:** The roadmap is the "single source of truth". If deferred items aren't in it, the next agent/developer building that phase will miss them — exactly the problem we're solving.

---

## Step 4 — Update the Phases README

```
1. Read: d:\Projects\Web\raw\FlowWatcher\docs\phases\README.md
2. Update it with:
   - A summary table of all completed phases (Phase number, date, status)
   - A "Deferred Items Tracker" section listing all outstanding deferred items and their target phases
   - A timestamp of when this audit was last run
3. Save the updated README.
```

**Why:** This gives a quick at-a-glance view of project status and outstanding debt without reading every completion doc.

---

## Step 5 — Report Summary

```
1. Print a summary to the user:
   - Total deferred items found across all phases
   - How many phases were updated in the roadmap
   - Any UNASSIGNED items that need manual triage
   - Confirmation that the README was updated
```

**Why:** The user needs to know what changed and if anything needs their attention.
