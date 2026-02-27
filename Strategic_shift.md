# ⚠️ Important Strategic Shift — MANDATORY ARCHITECTURAL RULE

> **This document is the single most important architectural decision in the FlowWatcher project.**
> Every developer, every AI agent, and every contributor MUST read and follow this before writing any backend code.
> All other documents (`Project_Development_Roadmap.md`, `Feature_and_capability_defination.md`, `Project_Overview.md`, `Project_Development_Overview.md`, `UI_UX_Plan.md`) reference and enforce this rule.

---

## The Rule

**The Rust backend must be designed as a general-purpose automation engine, NOT a network-monitoring-only tool.**

Right now, FlowWatcher monitors:

> *"Network idle → trigger action"*

But the architecture MUST support future triggers without rewriting:

* CPU usage idle
* Disk activity complete
* Time-based triggers
* Process exit
* File download complete
* Custom user-defined rules
* Plugin-based triggers (community-contributed)

---

## The Architecture Pattern

The backend must be built on three decoupled engines:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Trigger Engine  │ ──▶ │ Condition Engine │ ──▶ │  Action Engine   │
│                 │     │                 │     │                 │
│  Detects events │     │  Evaluates rules│     │  Executes system │
│  (network idle, │     │  (threshold +   │     │  commands        │
│   CPU idle,     │     │   duration +    │     │  (shutdown,      │
│   process exit) │     │   mode logic)   │     │   sleep, alarm)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### What This Means in Practice

1. **Trigger Engine (`core/triggers/`):**
   - Define a `Trigger` trait with methods: `start()`, `stop()`, `evaluate() -> TriggerState`.
   - `NetworkIdleTrigger` is the FIRST implementation. But the trait is generic.
   - Future: `CpuIdleTrigger`, `ProcessExitTrigger`, `TimerTrigger`, `DiskIdleTrigger`.
   - New triggers can be added by implementing the trait — no changes to the engine.

2. **Condition Engine (`core/conditions/`):**
   - Define a `Condition` trait with methods: `evaluate(trigger_state) -> ConditionResult`.
   - `ThresholdCondition` is the FIRST implementation (below X KB/s for Y seconds).
   - Future: `CompositeCondition` (AND/OR multiple conditions), `ScheduleCondition`.

3. **Action Engine (`core/actions/`):**
   - Define an `Action` trait with methods: `validate()`, `execute()`, `name()`.
   - Shutdown, Sleep, Hibernate, etc. are the FIRST implementations.
   - Future: `RunScriptAction`, `WebhookAction`, `CustomCommandAction`.

### What This Means for the Frontend

The UI should NOT hardcode "network speed" assumptions everywhere. The natural language builder on the Dashboard should be structured so that:

- The trigger source is selectable (currently: "Network Download/Upload", future: "CPU", "Process", etc.)
- The condition parameters adapt to the trigger type
- The action list is dynamic, loaded from the backend

This ensures the frontend also does not need rewriting when new triggers are added.

---

## Why This Matters

If we design it correctly now, **we will not rewrite everything later.**

If we hardcode network-only logic into the engine, adding CPU monitoring or plugin support later would require tearing apart the core architecture. The trait-based design costs almost nothing extra to implement now, but saves months of refactoring later.

This is the difference between a utility tool and a **platform**.

---

## Enforcement

- **Every Rust crate** in `core/` must use trait-based abstractions, not concrete types.
- **Every Tauri command** must accept generic trigger/condition/action configs, not hardcoded network params.
- **Every frontend component** must be designed to render ANY trigger type, not just network speed.
- **Code reviews** (by human or AI) must reject any PR that hardcodes network-specific logic into the engine layer.
- **Phase completion documents** must verify that the trait-based architecture was followed.

---

## Quick Checklist for Every Phase

Before marking any phase as complete, verify:

- [ ] Does the code use traits for triggers, conditions, and actions?
- [ ] Can a new trigger type be added without modifying existing engine code?
- [ ] Can a new action type be added without modifying existing engine code?
- [ ] Are Tauri commands generic enough to support future trigger types?
- [ ] Does the frontend render config options dynamically (not hardcoded fields)?