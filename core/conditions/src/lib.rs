//! Condition Engine for FlowWatcher.
//!
//! Defines the generic [`Condition`] trait and the first implementation:
//! [`ThresholdCondition`], which evaluates whether trigger data has
//! stayed below a threshold for a required duration.
//!
//! # Strategic Shift
//!
//! The `Condition` trait is generic. Future conditions (composite AND/OR,
//! schedule-based) implement the same trait.

pub mod threshold;

use flowwatcher_triggers::TriggerData;
use serde::{Deserialize, Serialize};
use thiserror::Error;

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/// Errors that can occur during condition evaluation.
#[derive(Debug, Error)]
pub enum ConditionError {
    /// Required data is missing from the trigger output.
    #[error("missing required trigger data key: {0}")]
    MissingData(String),

    /// Invalid configuration.
    #[error("invalid condition config: {0}")]
    InvalidConfig(String),
}

// ---------------------------------------------------------------------------
// Condition result
// ---------------------------------------------------------------------------

/// The result of evaluating a condition against trigger data.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ConditionResult {
    /// The condition is not yet being met (values above threshold).
    Waiting,

    /// The condition is currently met but has not persisted long enough.
    InProgress {
        /// Seconds elapsed since the condition started being met.
        elapsed_secs: u64,
    },

    /// The condition has been met for the full required duration.
    Met,
}

// ---------------------------------------------------------------------------
// Condition trait
// ---------------------------------------------------------------------------

/// Generic condition trait — evaluates trigger data against rules.
///
/// # Strategic Shift
///
/// `ThresholdCondition` is the first implementation. Future conditions
/// (composite AND/OR, schedule-based) implement this same trait.
pub trait Condition: Send + Sync {
    /// Evaluate the condition against the latest trigger data.
    fn evaluate(&mut self, data: &TriggerData) -> Result<ConditionResult, ConditionError>;

    /// Reset internal state (e.g., duration timer).
    fn reset(&mut self);
}

pub use threshold::{MonitorMode, ThresholdCondition};
