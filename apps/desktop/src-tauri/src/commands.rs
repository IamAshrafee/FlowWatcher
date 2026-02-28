//! Tauri command handlers — the bridge between frontend and core engine.

use crate::state::{AppState, MonitoringConfig, MonitoringStatus, TriggerConfig};
use flowwatcher_actions::ActionInfo;
use flowwatcher_conditions::{MonitorMode, ThresholdCondition};
use flowwatcher_engine::SpeedMonitor;
use flowwatcher_platform::network::{InterfaceInfo, NetworkProvider};
use flowwatcher_platform::process::{ProcessInfo, ProcessProvider};
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/// Real-time speed data sent to frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpeedData {
    pub download_bps: u64,
    pub upload_bps: u64,
}

// ---------------------------------------------------------------------------
// Network commands
// ---------------------------------------------------------------------------

/// Get list of network interfaces.
#[tauri::command]
pub async fn get_network_interfaces(
    state: State<'_, AppState>,
) -> Result<Vec<InterfaceInfo>, String> {
    let provider = state.network_provider.lock().await;
    provider.list_interfaces().map_err(|e| e.to_string())
}

/// Get current network speed by actively polling the network provider.
///
/// Creates a SpeedMonitor on first call (establishes baseline).
/// Subsequent calls compute real download/upload speed from deltas.
#[tauri::command]
pub async fn get_current_speed(state: State<'_, AppState>) -> Result<SpeedData, String> {
    let mut monitor_guard = state.speed_monitor.lock().await;
    let mut provider = state.network_provider.lock().await;

    // Lazily create a SpeedMonitor if none exists yet.
    if monitor_guard.is_none() {
        let iface = provider
            .get_default_interface()
            .map_err(|e| e.to_string())?
            .map(|i| i.id)
            .unwrap_or_else(|| "unknown".to_string());
        *monitor_guard = Some(SpeedMonitor::new(iface, 3));
    }

    let monitor = monitor_guard.as_mut().unwrap();

    // Poll the network provider to get fresh stats and calculate speed.
    match monitor.poll(&mut *provider) {
        Ok(Some(reading)) => Ok(SpeedData {
            download_bps: reading.download_bps,
            upload_bps: reading.upload_bps,
        }),
        Ok(None) => {
            // First poll (baseline established) — no speed yet.
            Ok(SpeedData {
                download_bps: 0,
                upload_bps: 0,
            })
        }
        Err(_e) => {
            // Return last known speeds if available, else zeros.
            Ok(SpeedData {
                download_bps: monitor.current_download_speed(),
                upload_bps: monitor.current_upload_speed(),
            })
        }
    }
}

// ---------------------------------------------------------------------------
// Monitoring commands
// ---------------------------------------------------------------------------

/// Start monitoring with a generic trigger/condition/action config.
#[tauri::command]
pub async fn start_monitoring(
    state: State<'_, AppState>,
    config: MonitoringConfig,
) -> Result<(), String> {
    // Determine interface to monitor.
    let interface_id = match &config.trigger_type {
        TriggerConfig::NetworkIdle { interface_id } => {
            if interface_id == "auto" {
                let provider = state.network_provider.lock().await;
                provider
                    .get_default_interface()
                    .map_err(|e| e.to_string())?
                    .map(|i| i.id)
                    .ok_or_else(|| "No network interface found".to_string())?
            } else {
                interface_id.clone()
            }
        }
        TriggerConfig::ProcessIdle { .. } => {
            // Process trigger doesn't need a network interface for speed,
            // but we still set one up for the speed display.
            let provider = state.network_provider.lock().await;
            provider
                .get_default_interface()
                .map_err(|e| e.to_string())?
                .map(|i| i.id)
                .unwrap_or_else(|| "unknown".to_string())
        }
    };

    // Create speed monitor.
    let monitor = SpeedMonitor::new(interface_id, 3);
    *state.speed_monitor.lock().await = Some(monitor);

    // Create threshold condition.
    let mode = match config.condition.monitor_mode.as_str() {
        "upload_only" => MonitorMode::UploadOnly,
        "both" => MonitorMode::Both,
        _ => MonitorMode::DownloadOnly,
    };
    let condition = ThresholdCondition::new(
        config.condition.threshold_bytes_per_sec,
        config.condition.required_duration_secs,
        mode,
    );
    *state.threshold_condition.lock().await = Some(condition);

    // Reset scheduler with config values.
    let mut scheduler = state.scheduler.lock().await;
    *scheduler =
        flowwatcher_engine::ActionScheduler::new(config.pre_warning_secs, config.countdown_secs);

    // Update status.
    *state.status.lock().await = MonitoringStatus::Monitoring;
    *state.config.lock().await = Some(config);

    Ok(())
}

/// Stop monitoring.
#[tauri::command]
pub async fn stop_monitoring(state: State<'_, AppState>) -> Result<(), String> {
    *state.speed_monitor.lock().await = None;
    *state.threshold_condition.lock().await = None;
    state.scheduler.lock().await.reset();
    *state.status.lock().await = MonitoringStatus::Idle;
    *state.config.lock().await = None;
    Ok(())
}

/// Pause monitoring (keeps state but stops polling).
#[tauri::command]
pub async fn pause_monitoring(state: State<'_, AppState>) -> Result<(), String> {
    let mut status = state.status.lock().await;
    if *status == MonitoringStatus::Monitoring {
        *status = MonitoringStatus::Paused;
        Ok(())
    } else {
        Err(format!("Cannot pause: current status is {:?}", *status))
    }
}

/// Resume monitoring from paused state.
#[tauri::command]
pub async fn resume_monitoring(state: State<'_, AppState>) -> Result<(), String> {
    let mut status = state.status.lock().await;
    if *status == MonitoringStatus::Paused {
        *status = MonitoringStatus::Monitoring;
        Ok(())
    } else {
        Err(format!("Cannot resume: current status is {:?}", *status))
    }
}

/// Get current monitoring status.
#[tauri::command]
pub async fn get_monitoring_status(state: State<'_, AppState>) -> Result<MonitoringStatus, String> {
    Ok(state.status.lock().await.clone())
}

/// Cancel the pending action during countdown.
#[tauri::command]
pub async fn cancel_action(state: State<'_, AppState>) -> Result<(), String> {
    state
        .scheduler
        .lock()
        .await
        .cancel()
        .map_err(|e| e.to_string())?;
    *state.status.lock().await = MonitoringStatus::Monitoring;
    Ok(())
}

/// Execute the action immediately during countdown.
#[tauri::command]
pub async fn execute_action_now(state: State<'_, AppState>) -> Result<(), String> {
    state
        .scheduler
        .lock()
        .await
        .execute_now()
        .map_err(|e| e.to_string())?;
    *state.status.lock().await = MonitoringStatus::Executed;
    Ok(())
}

// ---------------------------------------------------------------------------
// Process commands
// ---------------------------------------------------------------------------

/// Get running processes sorted by network usage.
#[tauri::command]
pub async fn get_running_processes(state: State<'_, AppState>) -> Result<Vec<ProcessInfo>, String> {
    let mut provider = state.process_provider.lock().await;
    provider.get_suggestions(10).map_err(|e| e.to_string())
}

// ---------------------------------------------------------------------------
// Discovery commands
// ---------------------------------------------------------------------------

/// Get list of available trigger types.
#[tauri::command]
pub async fn get_available_triggers() -> Result<Vec<TriggerInfo>, String> {
    Ok(vec![
        TriggerInfo {
            id: "network_idle".to_string(),
            name: "Network Idle".to_string(),
            description: "Triggers when network speed falls below threshold".to_string(),
        },
        TriggerInfo {
            id: "process_idle".to_string(),
            name: "Process Monitor".to_string(),
            description: "Triggers when selected processes have low network activity".to_string(),
        },
    ])
}

/// Get list of available actions.
#[tauri::command]
pub async fn get_available_actions() -> Result<Vec<ActionInfo>, String> {
    Ok(flowwatcher_platform::all_system_actions()
        .iter()
        .map(|a| a.info())
        .collect())
}

/// Trigger the countdown flow for testing — schedules the action.
#[tauri::command]
pub async fn trigger_countdown(state: State<'_, AppState>) -> Result<(), String> {
    let mut scheduler = state.scheduler.lock().await;
    scheduler.schedule().map_err(|e| e.to_string())?;
    *state.status.lock().await = MonitoringStatus::TriggerPending;
    Ok(())
}

// ---------------------------------------------------------------------------
// Logging commands
// ---------------------------------------------------------------------------

/// Get all activity log entries.
#[tauri::command]
pub async fn get_activity_logs(
    state: State<'_, AppState>,
) -> Result<Vec<flowwatcher_engine::LogEntry>, String> {
    let logger = state.activity_logger.lock().await;
    Ok(logger.get_all().to_vec())
}

/// Add a new activity log entry.
#[tauri::command]
pub async fn add_activity_log(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    trigger_reason: String,
    action_name: String,
    status: String,
    details: Option<String>,
) -> Result<(), String> {
    use flowwatcher_engine::{LogEntry, LogStatus};

    let log_status = match status.as_str() {
        "executed" => LogStatus::Executed,
        "cancelled" => LogStatus::Cancelled,
        "error" => LogStatus::Error,
        _ => LogStatus::Info,
    };

    let entry = LogEntry::now(trigger_reason, action_name, log_status, details);
    let mut logger = state.activity_logger.lock().await;
    logger.add_entry(entry);

    // Persist to file (best-effort).
    if let Ok(dir) = app.path().app_data_dir() {
        let _ = logger.save_to_file(&dir.join("activity_logs.json"));
    }
    Ok(())
}

/// Clear all activity logs.
#[tauri::command]
pub async fn clear_activity_logs(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    state.activity_logger.lock().await.clear();
    // Delete the persisted file too.
    if let Ok(dir) = app.path().app_data_dir() {
        let path = dir.join("activity_logs.json");
        if path.exists() {
            let _ = std::fs::remove_file(&path);
        }
    }
    Ok(())
}

/// Export activity logs as JSON or TXT string.
#[tauri::command]
pub async fn export_activity_logs(
    state: State<'_, AppState>,
    format: String,
) -> Result<String, String> {
    let logger = state.activity_logger.lock().await;
    match format.as_str() {
        "txt" => Ok(logger.export_txt()),
        _ => logger.export_json().map_err(|e| e.to_string()),
    }
}

// ---------------------------------------------------------------------------
// Settings commands
// ---------------------------------------------------------------------------

/// Get user settings from JSON file, or return defaults.
#[tauri::command]
pub async fn get_settings(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("settings.json");

    if path.exists() {
        let data = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).map_err(|e| e.to_string())
    } else {
        // Return default settings.
        Ok(serde_json::json!({
            "language": "en",
            "theme": "dark",
            "auto_start": false,
            "minimize_to_tray": false,
            "show_notifications": true,
            "auto_save": true,
            "pre_action_delay_mins": 0,
            "keep_screen_on": false,
            "default_config": null
        }))
    }
}

/// Save user settings to JSON file.
#[tauri::command]
pub async fn save_settings(
    app: tauri::AppHandle,
    settings: serde_json::Value,
) -> Result<(), String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    // Ensure directory exists.
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    let path = dir.join("settings.json");
    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())
}

/// Reset settings by deleting the file.
#[tauri::command]
pub async fn reset_settings(app: tauri::AppHandle) -> Result<(), String> {
    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("settings.json");

    if path.exists() {
        std::fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Tray commands
// ---------------------------------------------------------------------------

/// Update whether the window close button should minimize to tray.
#[tauri::command]
pub async fn set_close_to_tray(state: State<'_, AppState>, enabled: bool) -> Result<(), String> {
    *state.close_to_tray.lock().await = enabled;
    Ok(())
}

/// Get the current close-to-tray preference.
#[tauri::command]
pub async fn get_close_to_tray(state: State<'_, AppState>) -> Result<bool, String> {
    Ok(*state.close_to_tray.lock().await)
}

/// Trigger type metadata for frontend display.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggerInfo {
    pub id: String,
    pub name: String,
    pub description: String,
}

// ---------------------------------------------------------------------------
// Keep Screen On commands
// ---------------------------------------------------------------------------

/// Set whether the display should stay awake during active monitoring.
///
/// Uses Windows `SetThreadExecutionState` to prevent display/system sleep.
#[tauri::command]
pub async fn set_keep_screen_on(state: State<'_, AppState>, enabled: bool) -> Result<(), String> {
    *state.keep_screen_on.lock().await = enabled;

    #[cfg(windows)]
    {
        use windows_sys::Win32::System::Power::SetThreadExecutionState;
        use windows_sys::Win32::System::Power::{
            ES_CONTINUOUS, ES_DISPLAY_REQUIRED, ES_SYSTEM_REQUIRED,
        };

        unsafe {
            if enabled {
                SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED);
            } else {
                SetThreadExecutionState(ES_CONTINUOUS);
            }
        }
    }

    Ok(())
}

/// Get the current keep-screen-on preference.
#[tauri::command]
pub async fn get_keep_screen_on(state: State<'_, AppState>) -> Result<bool, String> {
    Ok(*state.keep_screen_on.lock().await)
}

// ---------------------------------------------------------------------------
// Config import/export commands
// ---------------------------------------------------------------------------

/// Export the current settings as a JSON string.
#[tauri::command]
pub async fn export_config(app: tauri::AppHandle) -> Result<String, String> {
    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("settings.json");

    if path.exists() {
        std::fs::read_to_string(&path).map_err(|e| e.to_string())
    } else {
        Ok("{}".to_string())
    }
}

/// Import settings from a JSON string.
#[tauri::command]
pub async fn import_config(app: tauri::AppHandle, config_json: String) -> Result<(), String> {
    // Validate the JSON first.
    let _: serde_json::Value =
        serde_json::from_str(&config_json).map_err(|e| format!("Invalid JSON: {e}"))?;

    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("settings.json");

    // Ensure the directory exists.
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    std::fs::write(&path, &config_json).map_err(|e| e.to_string())
}
