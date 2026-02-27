
# 📌 Complete Feature & Capability Definition

## Intelligent Network Monitor & Action Controller

> ⚠️ **All features below must be built on the Strategic Shift architecture.** Triggers, conditions, and actions are defined via Rust traits — not hardcoded logic. Network monitoring features listed here are the FIRST implementations of a general-purpose automation platform. See `Strategic_shift.md` for the full architectural mandate.

---

# 1️⃣ Core Monitoring Engine

## A. Network Interface Monitoring

Capabilities:

* Detect default active network interface automatically.
* Manual interface selection dropdown.
* Real-time download speed display.
* Real-time upload speed display.
* Speed graph (optional but recommended).
* Custom speed threshold setting.
* Separate thresholds for:

  * Download
  * Upload
* Duration confirmation (e.g., below threshold for X seconds).

Modes:

* Monitor download only
* Monitor upload only
* Monitor both

Edge Handling:

* Ignore short spikes
* Smooth fluctuation handling
* Confirm stability before trigger

---

## B. Process-Based Monitoring (Advanced Mode)

Capabilities:

* Toggle to enable process-based monitoring.
* List active processes.
* Multi-selection support.
* Auto-suggest high network usage processes.
* Per-process network usage tracking.
* Trigger only when all selected processes are inactive or below threshold.
* Exclude process list (ignore specific apps).
* Real-time per-process traffic display (optional advanced view).

Accuracy Logic:

* Combined logic:

  * Global network idle
  * Selected processes idle
* Action triggers only when both conditions are satisfied (if enabled).

---

# 2️⃣ Action Engine

Supported Actions:

* Shutdown
* Restart
* Sleep
* Hibernate (only if supported)
* Sign Out
* Lock Screen
* Play Alarm Only
* Run Custom Command (advanced feature)
* Execute Custom Script (advanced feature)

Safety Features:

* 1-minute pre-notification.
* 30-second visible countdown popup.
* Cancel button.
* Execute immediately button.
* Optional final confirmation dialog.
* Optional delay after detection (e.g., wait 5 minutes before action).

System Checks:

* Verify hibernate support.
* Verify permission availability.
* Prevent duplicate triggers.

---

# 3️⃣ Monitoring Control

* Start Monitoring button.
* Stop Monitoring button.
* Pause Monitoring.
* Clear monitoring session.
* Status indicator:

  * Monitoring
  * Idle
  * Trigger pending
  * Countdown active
  * Action executed
* Real-time session summary display.

---

# 4️⃣ User Interface & Experience Features

* Auto dark/light mode detection.
* Manual theme switcher.
* Clean minimal dashboard.
* Monitoring status badge.
* Countdown visual indicator.
* Clear action display.
* Interface selector dropdown.
* Process selector with search.
* Advanced section collapsible.
* Activity Logs tab.
* Settings tab.
* About section.
* System tray icon.
* Minimize-to-tray confirmation.
* Tray menu:

  * Start
  * Stop
  * Exit
  * Status
* Keep screen on toggle.
* Compact mode (minimal dashboard view).

---

# 5️⃣ Logging & Transparency

Activity Logs:

* Timestamp
* Interface used
* Processes monitored
* Trigger reason
* Threshold used
* Action executed
* Cancelled events
* Errors if any

Log Options:

* Clear logs
* Export logs (TXT/JSON)
* Enable/disable logging
* Log retention setting

---

# 6️⃣ Configuration & Persistence

Settings Storage:

* Local config file (JSON or TOML).
* Auto-save toggle.
* Reset to default.
* Backup config.
* Import/export config.

Saved Preferences:

* Last interface
* Threshold values
* Selected processes
* Action type
* Delay settings
* Theme
* Language
* Startup behavior

---

# 7️⃣ Internationalization

* Multi-language support.
* Language selector.
* Automatic system language detection.
* Translation file structure.
* Community translation ready.
* Right-to-left language support (future).

---

# 8️⃣ Open Source Support Features

* Debug mode toggle.
* Verbose logging mode.
* Safe error reporting.
* Clear error messages.
* Dev mode flag.
* Feature flags for experimental features.

---

# 9️⃣ Performance Controls

* Adjustable monitoring interval.
* Low-power mode.
* Efficient polling logic.
* Minimal background CPU usage.
* Safe memory management.
* UI render throttling.

---

# 🔟 Command Line Interface (Future but Defined Now)

CLI Capabilities:

* Start monitoring with arguments.
* Specify threshold.
* Specify action.
* Specify delay.
* Select interface.
* Headless mode (no UI).
* Log output to file.
* One-time monitoring mode.

Example future command:

monitor --download-threshold 200 --action shutdown --delay 5m

Backend must be designed to support this from beginning.

---

# 1️⃣1️⃣ Platform Support Definition

Phase 1:

* Windows full support.

Phase 2:

* macOS:

  * Power commands adapted.
  * Process detection adapted.
* Linux:

  * Systemd compatibility.
  * Common distro compatibility.

CLI should be platform-neutral.

---

# 1️⃣2️⃣ Advanced & Expansion Features

These are defined but not MVP mandatory:

* Remote mobile control.
* Web dashboard.
* Browser extension integration.
* Plugin system.
* Custom automation triggers.
* AI-based smart detection.
* Enterprise configuration profiles.
* Scheduled shutdown after monitoring.
* Multiple monitoring profiles.

---

# 1️⃣3️⃣ Non-Functional Requirements

* RAM under reasonable limit.
* CPU minimal when idle.
* Stable long-running sessions.
* No unexpected shutdown.
* No internet dependency.
* No telemetry without consent.
* Secure system command execution.
* Signed binaries.
* Clean uninstall.

---

# 1️⃣4️⃣ Feature Categorization (Critical Decision)

We must now categorize features into:

* Mandatory Core
* High Priority
* Advanced
* Future Expansion

Because not everything goes into first release.

If you try to build everything at once:

You will burn out.

---
