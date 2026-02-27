//! FlowWatcher Engine — the core orchestrator.
//!
//! Contains the [`SpeedMonitor`] for network speed calculations and the
//! [`ActionScheduler`] for safely scheduling and executing actions with
//! countdown, pre-warning, and cancellation support.

pub mod scheduler;
pub mod speed;

pub use scheduler::ActionScheduler;
pub use speed::SpeedMonitor;
