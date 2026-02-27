# 📌 Project Overview

## Intelligent Network Activity Monitor & Automated System Controller

> ⚠️ **This project follows the Strategic Shift architecture.** The Rust backend is designed as a general-purpose **Trigger Engine + Condition Engine + Action Engine** platform. Network monitoring is the first trigger implementation, not the only one. See `Strategic_shift.md` for the full architectural mandate.

---

## 1️⃣ Product Vision

This application is a lightweight, high-performance desktop utility designed to intelligently monitor network activity and execute user-defined system actions when network operations are complete.

The core purpose is simple:

> When downloads or uploads finish — the system reacts automatically, safely, and predictably.
> 

This removes the need for users to stay awake at night waiting for large downloads to complete. It solves a real, daily frustration in a clean and reliable way.

The product aims to be:

- Lightweight
- Highly accurate
- Safe and predictable
- Modern and visually premium
- Efficient in system resource usage
- Cross-platform (Desktop-first)

---

## 2️⃣ Target Users & Real User Need

### Primary Users:

- Gamers downloading large games (Steam, Epic Games)
- Developers downloading large packages or images
- Content creators uploading videos
- Torrent users
- Remote workers transferring files
- General users with slow internet

### Core Problems Users Face:

- Staying awake waiting for downloads
- Fear of shutting down too early
- Inaccurate detection by current tools
- Heavy apps consuming too much RAM
- No process-based precision

This app removes:

- Manual monitoring
- Guesswork
- Energy waste
- User anxiety

---

## 3️⃣ Core Functional Capabilities

### A. Real-Time Network Monitoring

- Monitor download and upload speed per network interface.
- Automatically detect default internet interface.
- Allow manual interface selection.
- Show real-time speed display.
- Allow threshold-based detection (e.g., below 200 KB/s).
- Time-based confirmation (e.g., below threshold for 2 minutes).

Strength:

Prevents false triggers caused by short pauses.

---

### B. Process-Based Network Monitoring

The system supports intelligent monitoring of specific processes.

Capabilities:

- Manual selection of active processes.
- Multi-process support.
- Smart suggestions for active network-heavy apps.
- Exclusion list (ignore Windows Update or background services).
- Toggle for enabling advanced process tracking.
- Trigger only when all selected processes become inactive.

Strength:

Much more accurate than global bandwidth monitoring.

---

### C. Action Execution Engine

Available system actions:

- Shutdown
- Restart
- Sleep
- Hibernate (if supported by OS)
- Sign Out
- Play Alarm
- Custom alarm sound support

Safety mechanisms:

- 30-second warning popup
- 1-minute pre-notification
- Manual cancel option
- Immediate execute option
- Optional delay after detection

Strength:

Reduces risk of accidental shutdown.

---

### D. User Experience & Interface Design

Frontend stack:

- React
- ShadCN UI
- Zustand state management
- Tauri frontend binding

UI Principles:

- Minimal
- Clean
- Focused
- No clutter
- Real-time visual feedback

UX Features:

- Auto dark/light mode detection
- Manual theme override
- System tray mode
- Minimize-to-tray behavior
- Clear monitoring status indicator
- Clear action countdown timer
- Simple toggle-based control system

Goal:

Professional and modern look without feeling technical or intimidating.

---

## 4️⃣ System Architecture

### Frontend Layer (React + ShadCN)

Responsibilities:

- UI rendering
- User input handling
- State management
- Visualization of speed and process data
- Settings management

State management via Zustand:

- Monitoring state
- Interface selection
- Process selection
- Action configuration
- Logging history
- UI preferences

---

### Tech Stack 

| **Layer** | **Technology** | **Why It Fits** |
| --- | --- | --- |
| **Frontend** | React + TypeScript + Vite | React is flexible and pairs perfectly with ShadCN. Vite gives fast builds and HMR. TypeScript adds type safety. |
| **UI Library** | ShadCN (with Tailwind CSS) | You specifically want ShadCN’s beautiful, accessible components. It integrates seamlessly with React and Tailwind. |
| **Desktop Framework** | Tauri 2.0 | Lightweight, cross‑platform (Windows, macOS, Linux), and allows mobile targets (iOS/Android) in the future. Minimal RAM/CPU usage. |
| **Backend** | Rust | Tauri’s backend is Rust – it’s fast, safe, and has great system‑level libraries for network monitoring. |
| **State Management** | Zustand or React Context | Simple, lightweight, and enough for your use case (monitoring state, user preferences). |
| **Build Tool** | Vite + Tauri CLI | Vite for frontend, Tauri CLI to build and bundle the desktop app. |

### Backend Layer (Rust via Tauri)

Responsibilities:

- Network interface monitoring
- OS-level process inspection
- Performance counter access
- System power command execution
- Log generation
- Config file handling
- Auto-start registration

Rust ensures:

- High performance
- Low memory usage
- Safe concurrency
- Minimal CPU overhead
- Small binary size

---

### Communication Layer

Tauri commands:

- Secure frontend-to-backend bridge
- Controlled execution
- Permission-based OS access

This keeps:

- Frontend safe
- Backend isolated
- Clean separation of concerns

---

## 5️⃣ Performance Strategy

This is a background utility. Performance is critical.

Design principles:

- Polling interval optimization
- Avoid aggressive CPU loops
- Efficient process scanning
- Debounced UI updates
- Lazy loading UI components
- Minimal background threads
- Memory-safe Rust code

Expected performance:

- RAM usage < 50MB ideal
- CPU usage near zero when idle
- Small binary size (~10–25MB)

---

## 6️⃣ Reliability & Safety Strategy

This app controls system power state. It must never behave unpredictably.

Safety mechanisms include:

- Threshold confirmation window
- Multi-process confirmation logic
- Countdown delay
- Cancel override
- Log-based verification
- Double-check before executing action
- Graceful failure handling

No silent shutdowns.

Always visible countdown.

---

## 7️⃣ Logging & Transparency

User trust increases with visibility.

Features:

- Activity log tab
- Log entries include:
    - Timestamp
    - Monitored interface
    - Selected processes
    - Trigger reason
    - Action executed
- Log persistence in local file

Future:

- Export logs as text

---

## 8️⃣ Configuration & Persistence

Settings stored locally:

- JSON config file
- Auto-save toggle
- Auto-start setting
- Theme preference
- Last selected interface
- Process monitoring configuration

Data stored locally only.

No telemetry by default (privacy-first approach).

---

## 9️⃣ Security Considerations

- No internet communication required.
- No cloud dependency.
- No external API calls.
- No background data collection.
- Signed binary distribution.
- Safe command execution validation.
- OS capability checks before hibernate/sleep.

---

## 🔟 Strengths of This Product

1. Lightweight compared to existing alternatives.
2. Process-aware monitoring.
3. Beautiful modern UI using ShadCN.
4. Native performance with Rust.
5. Privacy-friendly.
6. Cross-platform desktop potential.
7. Smart detection logic reduces false shutdowns.
8. Professional UX with warning systems.

---

## 1️⃣1️⃣ Advancement & Future Scalability

The architecture supports:

- Remote control via cloud bridge
- Web dashboard
- Mobile app companion
- Browser extension integration
- Plugin-based monitoring logic
- Command-line automation

Backend Rust core can evolve into a service daemon model in future.

---

## 1️⃣2️⃣ Code Quality & Engineering Standards

Standards to maintain:

- Strict Rust linting
- Clippy enforcement
- Structured error handling
- Modular backend design
- Clear command boundaries
- Separation of UI and business logic
- Type-safe state management
- Minimal shared mutable state
- Comprehensive logging

Testing strategy:

- Unit tests for detection logic
- Integration tests for action engine
- Manual OS-level validation
- Edge case testing (fluctuating network)

---

## 1️⃣3️⃣ User Experience Philosophy

The user should feel:

- Safe
- In control
- Confident
- Not confused
- Not overloaded

The interface should show:

- Current speed
- Selected mode
- Trigger threshold
- Countdown clearly
- Current monitoring status

No hidden behavior.

No surprises.

---

## 1️⃣4️⃣ Positioning Strategy

Position as:

“Smart Download Completion Auto Shutdown Tool”

Not just shutdown tool.

Emphasize:

- Accuracy
- Lightweight
- Modern UI
- Process-aware detection

Potential tagline:

“Let your downloads finish. We’ll handle the rest.”