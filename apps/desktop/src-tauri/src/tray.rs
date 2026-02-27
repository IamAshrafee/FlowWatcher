//! System tray icon, context menu, and event handlers.
//!
//! Sets up a tray icon with a right-click context menu and
//! left-click window restore. Used for background operation.

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Emitter, Manager,
};

/// Create and configure the system tray icon.
///
/// - Right-click: context menu with Start/Stop Monitoring, Open Dashboard, Exit
/// - Left-click: show and focus the main window
pub fn setup_tray(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    // ── Menu items ──
    let start_monitoring =
        MenuItem::with_id(app, "start_monitoring", "Start Monitoring", true, None::<&str>)?;
    let stop_monitoring =
        MenuItem::with_id(app, "stop_monitoring", "Stop Monitoring", true, None::<&str>)?;
    let open_dashboard =
        MenuItem::with_id(app, "open_dashboard", "Open Dashboard", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let separator2 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Exit", true, None::<&str>)?;

    // ── Context menu ──
    let menu = Menu::with_items(
        app,
        &[
            &start_monitoring,
            &stop_monitoring,
            &separator,
            &open_dashboard,
            &separator2,
            &quit,
        ],
    )?;

    // ── Build tray icon ──
    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("FlowWatcher — Idle")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "start_monitoring" => {
                // Emit a frontend event so the UI can invoke start_monitoring.
                let _ = app.emit("tray-start-monitoring", ());
            }
            "stop_monitoring" => {
                let _ = app.emit("tray-stop-monitoring", ());
            }
            "open_dashboard" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            // Left-click → restore the main window.
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}
