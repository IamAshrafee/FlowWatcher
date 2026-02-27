mod commands;
mod state;

use state::AppState;

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
            Ok(())
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
