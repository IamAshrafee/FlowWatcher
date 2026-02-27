//! FlowWatcher Engine — the core orchestrator.
//!
//! Contains the [`SpeedMonitor`] for network speed calculations and the
//! [`ActionScheduler`] for safely scheduling and executing actions with
//! countdown, pre-warning, and cancellation support.

pub mod logger;
pub mod scheduler;
pub mod speed;

pub use logger::{ActivityLogger, LogEntry, LogStatus};
pub use scheduler::ActionScheduler;
pub use speed::SpeedMonitor;
