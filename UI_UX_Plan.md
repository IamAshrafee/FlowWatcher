# Comprehensive UI, UX & Feature Organization Plan

> ⚠️ **Strategic Shift Applies Here:** The UI must be designed for an **extensible automation platform**, not a network-monitoring-only tool. The Natural Language Trigger Builder, action dropdowns, and settings must render dynamically based on available trigger/condition/action types from the backend. When new trigger types (CPU idle, process exit, timer, etc.) are added in the Rust backend, the frontend should adapt automatically with zero code changes. See `Strategic_shift.md` for full details.

## 1. Aesthetic Vision & Theming (The "Matte" Look)
To achieve a highly modern, non-AI-generated feel, we will embrace a **Matte + Monochromatic/Duotone** aesthetic. This avoids the chaotic, overly colorful look typical of generated UIs.

- **Color Palette (Slate & Matte Accent):**
  - **Primary Base:** Slate/Charcoal shades (`#1A1C23` for dark mode background, `#F0F2F5` for light mode). Surfaces should feel soft and flat.
  - **Accent Color:** A single, strictly enforced Matte Cyan (`#3ABAB4`) or a Matte Indigo (`#5A67D8`). This indicates active states, interactive elements, safe actions, and selected items.
  - **Warning State:** Muted matte orange/red (`#E57373`) to ensure warnings (like the 30-sec countdown or cancel buttons) are visible but not visually aggressive.
  - **Secondary Elements:** Subdued grays (`#A0AEC0` or similar) for non-essential text, unselected tabs, and inactive icons to maintain high contrast hierarchy without adding visual noise.
- **Surfaces & Depth:** Flat, matte finishes without glossy gradients, harsh borders, or deep shadows. We will rely on subtle 1px inner borders (`border-white/5` or `border-black/5`) or extremely soft, diffused drop shadows (opacity < 10%) just to separate modal layers from the base layer.
- **Typography:** **Inter**, **Geist**, or **Outfit**. Unobtrusive and highly legible. We'll use strong font weight contrast (thick headings, readable body) to create a premium hierarchy without relying on different colors.

## 2. Global Layout Structure
The interface must feel like a focused system utility, not an over-engineered corporate dashboard.
- **Window Size:** Fixed-size or moderately resizable, compact standard window (e.g., ~800x600px).
- **Navigation:** A simple **Top Pill/Tab Navigation Bar** (e.g., Dashboard | Advanced | Logs | Settings) or a sleek Sidebar if we introduce more tabs later. This minimizes eye travel and keeps the layout flat.
- **Header:** Contains the app title, a minimal status indicator (e.g., "Idle", "Monitoring", "Triggering"), and standard window controls if we use a custom titlebar (Tauri feature).
- **Transitions:** Micro-interactions (e.g., 150ms ease-in-out fades) between tabs. No heavy page-loading animations.

## 3. Core Feature Flow & Organization

### A. The Dashboard (Home - Zero Configuration)
The default view when the app opens. Designed to allow users to start monitoring in as few as 1 or 2 clicks by leveraging intuitive defaults.

1. **Real-Time Stats Display (Top):**
   - Two large, clean matte cards presenting `Live Download` and `Live Upload` speeds.
   - A subtle network activity sparkline (mini-graph) softly animating underneath the numbers to provide a quick visual cue of traffic.
   - A small "Auto-Detected: [Interface Name]" badge, assuring the user it’s looking at the right adapter.

2. **The Natural Language Trigger Builder (Middle):**
   - Instead of standard form fields, we use a simple sentence constructor UI. This is highly modern, premium, and foolproof.
   - **Example:** *"When **[Download Only]** is below **[200 KB/s]** for **[2 min]**..."*
   - Clicking any bold/bracketed dropdown instantly opens a minimal inline popover to change the value (e.g., toggle to "Download & Upload", change "200" to "500", change "KB/s" to "MB/s", change "2 min" to "10 min").
   - **Action Sentence:** *"...then **[Shutdown]** the PC."* (Clicking Shutdown opens a list: Sleep, Restart, Hibernate, Sign Out, Play Alarm).

3. **Execution Control (Bottom):**
   - A large, prominent Matte Accent **"Start Monitoring"** button right below the natural language setup.
   - Once clicked, this transforms into a secondary "Stop Monitoring" button.

### B. Advanced Mode (Process Selection)
Tucked gracefully under the "Advanced" tab, or accessed via an "Advanced Mode" toggle switch on the Dashboard, to avoid overwhelming basic users.

1. **Process Tracking Toggle:** A master checkmark: "Only monitor specific applications".
2. **Smart Process List:** 
   - A search bar and a multi-select list of detected high-network processes (e.g., `Steam.exe`, `EpicGamesLauncher.exe`, `chrome.exe`).
   - **Smart Suggestions:** Network-heavy apps actively downloading are pinned to the top of this list automatically. 
   - **Exclusion Tab:** A separate list defining apps to always ignore (e.g., `svchost.exe`, backup tools).
3. **Execution Rule:** If processes are selected, the main dashboard sentence adapts slightly (e.g., *"...when **[3 selected processes]** are below..."*).

### C. Execution & Failsafe Warning (The Countdown)
When a trigger is met (e.g., download drops below 200 KB/s for 2 minutes), the system must show an unavoidable but elegant failsafe.

1. **Pre-warning (1 Minute Before):** A silent native OS toast notification or minimal custom toast slide-in: *"Network idle. Shutdown will commence in 1 minute."*
2. **The 30-Second Overlay:** 
   - The app maximizes or comes to the front with a fullscreen matte-dark overlay masking the entire OS (optional, or just a very prominent modal dialog in the center of the screen).
   - **Visuals:** Huge, clean typography: *"Shutting down in 29... "*
   - **Actions:** 
     - Massive secondary button: **"Cancel"** (Pressing 'Esc' also triggers this).
     - Subtle text button: **"Execute Now"**.
3. **Audio:** If trigger is "Play Alarm", a clean, non-harsh alert tone loops until canceled.

### D. Settings & History (Hidden Complexity)
These are out of the critical path to keep the dashboard clean.

1. **Logs Tab:**
   - A simple, filterable data table showing: `Date/Time | Trigger Reason (e.g., Steam idle) | Action Taken (e.g., Sleep) | Status (Success/Cancelled)`.
   - "Clear Logs" and "Export Logs" buttons at the bottom.

2. **Settings Tab:** Global system toggles and configurations:
   - **General:**
     - Theme Override (Dark / Light / Auto-Sync with OS).
     - Start on Boot toggle.
     - Keep Screen On during monitoring toggle.
   - **Network Overrides:**
     - Manual Network Interface Selection (Defaults to Auto-detect). Keep hidden in an accordion unless needed.
   - **Delays & Automation:**
     - "Always wait [X] minutes after threshold met before showing countdown" (Wait Delay).
   - **Audio:**
     - Alarm sound selection (Upload custom .mp3/.wav path).
   - **About:** Link to GitHub repository, check for feature updates.

## 4. Key UX Principles & Ergonomics

1. **Zero-Config Defaults:** The app detects the active network interface and populates the first view entirely. Users should theoretically be able to open the app and just click "Start Monitoring" without touching a single setting.
2. **State Transparency:** 
   - When idle, UI is neutral. 
   - When monitoring, add an active pulsing indicator (e.g., a small glowing dot next to the app title). 
   - When countdown triggers, use the warning color styling.
3. **Silent Background Operation:** 
   - Clicking the application "Close" (X) button triggers a modal (only once, with a "Don't ask again" checkbox): "Minimize to system tray and keep monitoring?"
   - Once in the tray, hovering the tray icon shows a highly minimal tooltip (e.g., `FlowWatcher: D: 5.2 MB/s | U: 0.1 MB/s | Active`). 
   - Right-clicking the tray offers a quick menu: `Start/Stop Monitoring`, `Open Dashboard`, `Exit`.
4. **Resiliency:** If the app is monitoring and the PC loses internet entirely, the app should handle it gracefully based on rules (e.g., "Wait for reconnection instead of immediately triggering shutdown").
5. **No Technical Jargon in the Main UI:** Avoid terms like "TCP/UDP", "Network Packets", or "Daemon". Keep language to "Download", "Upload", "Traffic", and "Apps".
