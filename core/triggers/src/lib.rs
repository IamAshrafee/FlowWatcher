//! Trigger Engine for FlowWatcher.
//!
//! Defines the generic [`Trigger`] trait that all trigger types implement.
//! Network idle detection is the FIRST implementation; future triggers
//! (CPU idle, process exit, timer, etc.) implement the same trait with
//! zero changes to the engine.
//!
//! # Strategic Shift
//!
//! This crate is the extensibility point for the Trigger Engine.
//! New trigger types are added by implementing [`Trigger`] — never by
//! modifying existing engine code.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/// Errors that can occur during trigger operations.
#[derive(Debug, Error)]
pub enum TriggerError {
    /// The trigger failed to start.
    #[error("trigger failed to start: {0}")]
    StartFailed(String),

    /// The trigger failed to stop.
    #[error("trigger failed to stop: {0}")]
    StopFailed(String),

    /// An error occurred during evaluation.
    #[error("trigger evaluation error: {0}")]
    EvaluationError(String),
}

// ---------------------------------------------------------------------------
// Trigger state
// ---------------------------------------------------------------------------

/// The current state of a trigger after evaluation.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TriggerState {
    /// The trigger is idle — the monitored condition has NOT been observed.
    /// For example, network speed is above the threshold.
    Idle,

    /// The trigger is active — the monitored condition is currently true
    /// but has not yet persisted long enough to fire.
    /// Contains key-value data specific to the trigger type.
    Active(TriggerData),

    /// The trigger has fired — the condition has been sustained long enough.
    Triggered,
}

/// Key-value data emitted by an active trigger.
///
/// Each trigger type populates this with its own metrics. For example,
/// `NetworkIdleTrigger` sets `download_bps` and `upload_bps`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TriggerData {
    /// Arbitrary key-value pairs containing trigger-specific metrics.
    pub values: HashMap<String, TriggerValue>,
}

impl TriggerData {
    /// Create an empty `TriggerData`.
    pub fn new() -> Self {
        Self {
            values: HashMap::new(),
        }
    }

    /// Insert a value.
    pub fn insert(&mut self, key: impl Into<String>, value: TriggerValue) {
        self.values.insert(key.into(), value);
    }

    /// Get a value by key.
    pub fn get(&self, key: &str) -> Option<&TriggerValue> {
        self.values.get(key)
    }
}

impl Default for TriggerData {
    fn default() -> Self {
        Self::new()
    }
}

/// A typed value in trigger data.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TriggerValue {
    /// Unsigned 64-bit integer (e.g., bytes per second).
    U64(u64),
    /// Floating point (e.g., percentage).
    F64(f64),
    /// String value.
    String(String),
    /// Boolean flag.
    Bool(bool),
}

// ---------------------------------------------------------------------------
// Trigger trait
// ---------------------------------------------------------------------------

/// The generic trigger trait — ALL trigger types implement this.
///
/// # Strategic Shift
///
/// This trait is the core extensibility point. `NetworkIdleTrigger` is
/// the first implementation. Future triggers (`CpuIdleTrigger`,
/// `ProcessExitTrigger`, `TimerTrigger`) implement this same trait,
/// and the engine dispatches through it without knowing the concrete type.
#[async_trait]
pub trait Trigger: Send + Sync {
    /// Human-readable name of this trigger (e.g., "Network Idle").
    fn name(&self) -> &str;

    /// Machine-readable type identifier (e.g., "network_idle").
    fn trigger_type(&self) -> &str;

    /// Start the trigger's monitoring loop or listener.
    async fn start(&mut self) -> Result<(), TriggerError>;

    /// Stop the trigger and release resources.
    async fn stop(&mut self) -> Result<(), TriggerError>;

    /// Evaluate the current state of the trigger.
    ///
    /// Returns [`TriggerState::Idle`] if the condition is not met,
    /// [`TriggerState::Active`] with data if the condition is currently
    /// true, or [`TriggerState::Triggered`] if it has been sustained.
    async fn evaluate(&mut self) -> Result<TriggerState, TriggerError>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// A mock trigger for testing that the trait is generic and can be
    /// implemented by any type.
    struct MockTrigger {
        state: TriggerState,
        started: bool,
    }

    impl MockTrigger {
        fn new() -> Self {
            Self {
                state: TriggerState::Idle,
                started: false,
            }
        }
    }

    #[async_trait]
    impl Trigger for MockTrigger {
        fn name(&self) -> &str {
            "Mock Trigger"
        }

        fn trigger_type(&self) -> &str {
            "mock"
        }

        async fn start(&mut self) -> Result<(), TriggerError> {
            self.started = true;
            Ok(())
        }

        async fn stop(&mut self) -> Result<(), TriggerError> {
            self.started = false;
            Ok(())
        }

        async fn evaluate(&mut self) -> Result<TriggerState, TriggerError> {
            Ok(self.state.clone())
        }
    }

    #[tokio::test]
    async fn mock_trigger_implements_trait() {
        let mut trigger = MockTrigger::new();
        assert_eq!(trigger.name(), "Mock Trigger");
        assert_eq!(trigger.trigger_type(), "mock");

        trigger.start().await.expect("should start");
        assert!(trigger.started);

        let state = trigger.evaluate().await.expect("should evaluate");
        assert_eq!(state, TriggerState::Idle);

        trigger.state = TriggerState::Triggered;
        let state = trigger.evaluate().await.expect("should evaluate");
        assert_eq!(state, TriggerState::Triggered);

        trigger.stop().await.expect("should stop");
        assert!(!trigger.started);
    }

    #[test]
    fn trigger_data_insert_and_get() {
        let mut data = TriggerData::new();
        data.insert("download_bps", TriggerValue::U64(1024));
        data.insert("upload_bps", TriggerValue::U64(512));

        assert_eq!(data.get("download_bps"), Some(&TriggerValue::U64(1024)));
        assert_eq!(data.get("upload_bps"), Some(&TriggerValue::U64(512)));
        assert_eq!(data.get("nonexistent"), None);
    }
}
