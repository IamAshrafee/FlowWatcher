# 📌 Project Development Overview

## Intelligent Network Activity Monitor & System Automation Tool

**Stack: React + TypeScript + Vite + ShadCN + Tauri 2.0 + Rust**

> ⚠️ **This project follows the Strategic Shift architecture.** All backend code must implement the **Trigger Engine + Condition Engine + Action Engine** pattern using Rust traits. The engine must be modular, extensible, and event-driven — never hardcoded for network monitoring only. See `Strategic_shift.md` for the full architectural mandate, enforcement rules, and per-phase checklist.

---

# 1️⃣ Product Mission

To build a lightweight, privacy-first, open-source desktop utility that intelligently monitors network activity and safely automates system actions when activity completes.

The product will:

- Be fast
- Use minimal system resources
- Be transparent and predictable
- Support global users
- Be community-driven
- Maintain professional engineering standards

Initial priority: **Windows**

Future: **macOS, Linux, CLI support**

---

# 2️⃣ Core Technical Stack Philosophy

Your stack is strong and modern. Let’s understand why it fits perfectly.

---

## 🖥 Desktop Framework — Tauri 2.0

Why it fits:

- Small bundle size (uses system WebView)
- Low RAM compared to Electron
- Secure frontend ↔ backend bridge
- Strong Rust integration
- Future mobile targets possible
- Cross-platform by design

Strategic benefit:

You avoid the “heavy app” reputation.

---

## ⚙ Backend — Rust

Responsibilities:

- Network interface monitoring
- Process-level traffic inspection
- Power state control
- Logging
- Configuration management
- OS integration
- CLI support (future)

Why Rust:

- Memory safety
- Concurrency safety
- High performance
- Low CPU usage
- Strong ecosystem for system-level work
- Clean error handling

This is critical for a background system utility.

---

## 🎨 Frontend — React + TypeScript + Vite

Why this matters:

- React = flexible UI
- TypeScript = fewer runtime bugs
- Vite = extremely fast development
- Easy ShadCN integration
- Modern ecosystem
- Easier contributor onboarding

This ensures your UI layer stays maintainable long-term.

---

## 🎨 UI Library — ShadCN + Tailwind

This gives:

- Modern, premium look
- Accessibility-friendly components
- Customizable design system
- Dark/light mode built-in flexibility

Your product’s first impression will be its UI.

This matters for going viral.

---

## 🧠 State Management — Zustand

Why it fits:

- Very lightweight
- Minimal boilerplate
- Perfect for app-level state
- No complex global state required

You avoid Redux complexity.

---

# 3️⃣ System Architecture Overview

Your application will have three main layers:

---

## 🔹 Layer 1 — UI Layer (Frontend)

Responsibilities:

- Rendering monitoring dashboard
- Displaying real-time speeds
- Showing process list
- Countdown UI
- Warning dialogs
- Settings management
- Logs viewer
- Language selection
- Theme switching

No system logic here.

Only UI and user interaction.

---

## 🔹 Layer 2 — Application Core (Rust Backend)

Responsibilities:

- Network statistics collection
- Process traffic analysis
- Threshold evaluation logic
- Detection timing control
- Action execution logic
- Logging engine
- OS abstraction layer
- CLI argument parsing (future)

This is the brain of the app.

---

## 🔹 Layer 3 — OS Integration Layer

Abstracted system bindings:

- Windows power API
- Windows performance counters
- macOS power API (future)
- Linux system commands (future)

You must design this layer cleanly from the beginning so it is portable later.

---

# 4️⃣ Development Priorities (Windows First Strategy)

Since Windows is first target:

Focus on:

- Stable power commands
- Accurate network interface detection
- Windows performance counter integration
- Process-level network tracking reliability
- Proper tray behavior
- Proper startup registry integration

Important:

Design code in a platform-agnostic way even if you only implement Windows initially.

Do NOT hardcode Windows logic everywhere.

---

# 5️⃣ Open Source Strategy

You want this to be:

- Fully open source
- Contribution friendly
- Globally used

Then you must plan carefully.

---

## 📁 Repository Structure Strategy

Keep clear separation:

- `/src-frontend`
- `/src-backend`
- `/core`
- `/platform`
- `/cli`
- `/docs`

Clean structure increases contributor confidence.

---

## 📜 Licensing

Choose carefully:

- MIT (very open)
- Apache 2.0 (more protection)
- GPL (forces open source derivatives)

If you want wide adoption and corporate trust:

MIT or Apache 2.0 is usually best.

---

## 📘 Documentation Requirements

You must include:

- Clear README
- Installation guide
- Contribution guide
- Code style rules
- Architecture explanation
- Issue template
- Pull request template

If documentation is weak, contributors leave.

---

## 🌍 Global Contribution Strategy

To attract contributors:

- Write clean TypeScript
- Write clean Rust
- Add comments
- Add meaningful commit messages
- Maintain changelog
- Respond to issues actively

Community grows around leadership quality.

---

# 6️⃣ Versioning & Release Management

You should follow:

## Semantic Versioning (SemVer)

Format:

MAJOR.MINOR.PATCH

Example:

1.0.0

Rules:

- MAJOR → breaking changes
- MINOR → new features
- PATCH → bug fixes

Never randomly increase versions.

Maintain:

- CHANGELOG.md
- GitHub releases
- Clear release notes

This builds trust.

---

# 7️⃣ Internationalization (Multi-Language Support)

If targeting worldwide:

Use:

- i18n library for React (like i18next)
- JSON-based translation files
- Language selector
- Fallback language system

Important rules:

- Never hardcode strings
- All UI text must be translation-ready
- Backend messages must be structured for translation

Future contributors can add languages easily.

---

# 8️⃣ Performance Strategy

Your app is background utility.

Therefore:

- Avoid excessive polling frequency
- Use efficient timers
- Batch UI updates
- Avoid unnecessary re-renders
- Keep Rust loops efficient
- Avoid blocking main thread

Target:

- Low idle CPU
- Minimal RAM
- No visible performance spike

Users uninstall tools that consume resources silently.

---

# 9️⃣ Security & Privacy Philosophy

Your app controls power state.

So:

- No hidden background actions
- Always visible countdown
- No internet dependency
- No telemetry without explicit opt-in
- Validate system capabilities before executing commands
- Safe error handling

Trust is everything for system tools.

---

# 🔟 Command Line Support (Future Expansion)

Design Rust core so it can:

- Run headless
- Accept CLI arguments
- Trigger actions without UI

Example:

monitor --shutdown-on-download-complete --threshold 200kb --delay 5m

This makes:

- Power users happy
- Automation possible
- Server usage possible

Your Rust backend should not depend on UI logic.

---

# 1️⃣1️⃣ Testing & Code Quality Strategy

You must include:

- Rust unit tests for detection logic
- Integration tests for action execution
- TypeScript type checks
- ESLint + Prettier
- Rust Clippy
- Continuous Integration (GitHub Actions)

CI should:

- Build Windows target
- Run tests
- Check formatting
- Check linting

Professional open source projects always automate this.

---

# 1️⃣2️⃣ Branding & Global Positioning

To go global:

- Simple name
- Easy to pronounce
- Clean logo
- Clean landing page
- Screenshots
- Demo video

Users judge in 10 seconds.

UI must look modern and polished.

---

# 1️⃣3️⃣ Scalability Vision

Long-term expansion can include:

- Remote control via cloud bridge
- Mobile companion app
- Plugin system
- Smart auto-detection algorithm
- AI-based traffic classification
- Enterprise mode

Your architecture should not block future ideas.

---

# 1️⃣4️⃣ Risk Areas You Must Respect

Be careful about:

- False trigger shutdown
- Inaccurate process detection
- OS permission issues
- Sleep/hibernate compatibility
- Cross-platform power command differences
- Tray behavior inconsistencies

System tools fail when they behave unpredictably.

---

# 1️⃣5️⃣ Engineering Mindset

You are building:

- A background utility
- A system controller
- An open-source product
- A global tool

So think:

- Stability over speed of development
- Clean code over quick hacks
- Long-term maintainability
- Community-first design
- Transparent behavior

---