//! Managed Tauri state holding the core engine instances.
//!
//! Uses `tokio::sync::Mutex` for async-safe shared state across commands.

use flowwatcher_conditions::ThresholdCondition;
use flowwatcher_engine::{ActionScheduler, ActivityLogger, SpeedMonitor};
use flowwatcher_platform::network::SysinfoNetworkProvider;
use flowwatcher_platform::process::SysinfoProcessProvider;
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;

// ---------------------------------------------------------------------------
// Monitoring state
// ---------------------------------------------------------------------------

/// The overall monitoring state visible to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "status", content = "data")]
pub enum MonitoringStatus {
    /// Not monitoring.
    Idle,
    /// Actively monitoring network/process activity.
    Monitoring,
    /// A trigger condition is pending (pre-warning phase).
    TriggerPending,
    /// Countdown is active before action execution.
    Countdown { remaining_secs: u64 },
    /// The action was executed.
    Executed,
    /// Monitoring was paused.
    Paused,
}

/// Configuration for starting a monitoring session.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    /// Which trigger type to use.
    pub trigger_type: TriggerConfig,
    /// Condition parameters.
    pub condition: ConditionConfig,
    /// Which action to execute when triggered.
    pub action_type: String,
    /// Pre-warning duration in seconds.
    pub pre_warning_secs: u64,
    /// Countdown duration in seconds.
    pub countdown_secs: u64,
}

/// Trigger-specific configuration (Strategic Shift: NOT hardcoded params).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum TriggerConfig {
    /// Network idle trigger.
    #[serde(rename = "network_idle")]
    NetworkIdle {
        /// Network interface to monitor (or "auto" for default).
        interface_id: String,
    },
    /// Process-based trigger.
    #[serde(rename = "process_idle")]
    ProcessIdle {
        /// Process names to watch.
        watched_processes: Vec<String>,
        /// Process names to exclude.
        excluded_processes: Vec<String>,
        /// Activity threshold in bytes.
        threshold_bytes: u64,
    },
}

/// Condition configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConditionConfig {
    /// Speed threshold in bytes per second.
    pub threshold_bytes_per_sec: u64,
    /// Required duration in seconds.
    pub required_duration_secs: u64,
    /// Monitor mode: "download_only", "upload_only", or "both".
    pub monitor_mode: String,
}

// ---------------------------------------------------------------------------
// App state
// ---------------------------------------------------------------------------

/// The managed application state shared across all Tauri commands.
pub struct AppState {
    /// Network provider for speed monitoring.
    pub network_provider: Mutex<SysinfoNetworkProvider>,
    /// Process provider for process listing.
    pub process_provider: Mutex<SysinfoProcessProvider>,
    /// Speed monitor (created when monitoring starts).
    pub speed_monitor: Mutex<Option<SpeedMonitor>>,
    /// Threshold condition (created when monitoring starts).
    pub threshold_condition: Mutex<Option<ThresholdCondition>>,
    /// Action scheduler.
    pub scheduler: Mutex<ActionScheduler>,
    /// Current monitoring status.
    pub status: Mutex<MonitoringStatus>,
    /// Current monitoring configuration.
    pub config: Mutex<Option<MonitoringConfig>>,
    /// Activity logger for tracking events.
    pub activity_logger: Mutex<ActivityLogger>,
    /// Whether the window close button should minimize to tray.
    pub close_to_tray: Mutex<bool>,
}

impl AppState {
    /// Create a new app state with defaults.
    pub fn new() -> Self {
        Self {
            network_provider: Mutex::new(SysinfoNetworkProvider::new()),
            process_provider: Mutex::new(SysinfoProcessProvider::new()),
            speed_monitor: Mutex::new(None),
            threshold_condition: Mutex::new(None),
            scheduler: Mutex::new(ActionScheduler::new(60, 30)),
            status: Mutex::new(MonitoringStatus::Idle),
            config: Mutex::new(None),
            activity_logger: Mutex::new(ActivityLogger::new()),
            close_to_tray: Mutex::new(false),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
