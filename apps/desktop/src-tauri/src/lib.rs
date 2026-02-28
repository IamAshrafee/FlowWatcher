mod commands;
mod state;
mod tray;

use state::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::new())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Set up system tray icon with context menu.
            tray::setup_tray(app)?;

            // Load persisted activity logs from file.
            {
                let state = app.state::<AppState>();
                if let Ok(dir) = app.path().app_data_dir() {
                    let log_path = dir.join("activity_logs.json");
                    if let Ok(mut logger) =
                        flowwatcher_engine::ActivityLogger::load_from_file(&log_path)
                    {
                        // Enforce 30-day retention on load.
                        logger.prune_older_than(30);
                        *state.activity_logger.blocking_lock() = logger;
                    }
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            // Close-to-tray: intercept window close if preference is enabled.
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let app = window.app_handle();
                let state = app.state::<AppState>();

                // Check close_to_tray preference (blocking OK here — short lock).
                let close_to_tray = state.close_to_tray.blocking_lock();
                if *close_to_tray {
                    // Prevent the window from actually closing.
                    api.prevent_close();
                    // Hide the window instead.
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_network_interfaces,
            commands::get_current_speed,
            commands::start_monitoring,
            commands::stop_monitoring,
            commands::pause_monitoring,
            commands::resume_monitoring,
            commands::get_monitoring_status,
            commands::cancel_action,
            commands::execute_action_now,
            commands::get_running_processes,
            commands::get_available_triggers,
            commands::get_available_actions,
            commands::trigger_countdown,
            commands::get_activity_logs,
            commands::add_activity_log,
            commands::clear_activity_logs,
            commands::export_activity_logs,
            commands::get_settings,
            commands::save_settings,
            commands::reset_settings,
            commands::set_close_to_tray,
            commands::get_close_to_tray,
            commands::set_keep_screen_on,
            commands::get_keep_screen_on,
            commands::export_config,
            commands::import_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
