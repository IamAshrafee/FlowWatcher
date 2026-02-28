//! Action Engine for FlowWatcher.
//!
//! Defines the generic [`Action`] trait that all action types implement.
//! System actions (shutdown, sleep, etc.) are the first implementations;
//! future actions (run script, webhook, custom command) implement the
//! same trait with zero changes to the engine.
//!
//! # Strategic Shift
//!
//! This crate is the extensibility point for the Action Engine.
//! New action types are added by implementing [`Action`] — never by
//! modifying existing engine dispatch code.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use thiserror::Error;

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/// Errors that can occur during action operations.
#[derive(Debug, Error)]
pub enum ActionError {
    /// The action is not supported on this platform.
    #[error("action not supported: {0}")]
    NotSupported(String),

    /// The action failed to execute.
    #[error("action execution failed: {0}")]
    ExecutionFailed(String),

    /// The action requires elevated privileges.
    #[error("insufficient privileges: {0}")]
    InsufficientPrivileges(String),

    /// The OS rejected the action request.
    #[error("os error: {0}")]
    OsError(String),
}

// ---------------------------------------------------------------------------
// Action metadata
// ---------------------------------------------------------------------------

/// Metadata describing an action for UI display.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionInfo {
    /// Machine-readable identifier (e.g., "shutdown").
    pub id: String,
    /// Human-readable display name (e.g., "Shut Down").
    pub name: String,
    /// Description of what this action does.
    pub description: String,
    /// Whether this action is available on the current platform.
    pub available: bool,
}

// ---------------------------------------------------------------------------
// Action trait
// ---------------------------------------------------------------------------

/// The generic action trait — ALL action types implement this.
///
/// # Strategic Shift
///
/// This trait is the core extensibility point for the Action Engine.
/// `ShutdownAction`, `SleepAction`, etc. are the first implementations.
/// Future actions (`RunScriptAction`, `WebhookAction`, `CustomCommandAction`)
/// implement this same trait, and the engine dispatches through it.
#[async_trait]
pub trait Action: Send + Sync {
    /// Human-readable name of this action.
    fn name(&self) -> &str;

    /// Machine-readable type identifier.
    fn action_type(&self) -> &str;

    /// Get metadata about this action for UI display.
    fn info(&self) -> ActionInfo;

    /// Validate whether this action can be executed on the current system.
    ///
    /// For example, `HibernateAction` checks if hibernation is enabled.
    /// Returns `Ok(())` if the action is possible, or an error describing why not.
    async fn validate(&self) -> Result<(), ActionError>;

    /// Execute the action.
    ///
    /// This performs the actual side effect (e.g., initiating shutdown).
    /// Call `validate()` first to ensure the action is possible.
    async fn execute(&self) -> Result<(), ActionError>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// A mock action for testing the trait contract.
    struct MockAction {
        should_fail_validate: bool,
        should_fail_execute: bool,
    }

    #[async_trait]
    impl Action for MockAction {
        fn name(&self) -> &str {
            "Mock Action"
        }

        fn action_type(&self) -> &str {
            "mock"
        }

        fn info(&self) -> ActionInfo {
            ActionInfo {
                id: "mock".to_string(),
                name: "Mock Action".to_string(),
                description: "A test action".to_string(),
                available: !self.should_fail_validate,
            }
        }

        async fn validate(&self) -> Result<(), ActionError> {
            if self.should_fail_validate {
                Err(ActionError::NotSupported("mock validation failure".into()))
            } else {
                Ok(())
            }
        }

        async fn execute(&self) -> Result<(), ActionError> {
            if self.should_fail_execute {
                Err(ActionError::ExecutionFailed(
                    "mock execution failure".into(),
                ))
            } else {
                Ok(())
            }
        }
    }

    #[tokio::test]
    async fn mock_action_validates_and_executes() {
        let action = MockAction {
            should_fail_validate: false,
            should_fail_execute: false,
        };
        assert_eq!(action.name(), "Mock Action");
        assert_eq!(action.action_type(), "mock");
        action.validate().await.expect("should validate");
        action.execute().await.expect("should execute");
    }

    #[tokio::test]
    async fn mock_action_validation_failure() {
        let action = MockAction {
            should_fail_validate: true,
            should_fail_execute: false,
        };
        let result = action.validate().await;
        assert!(result.is_err());
        assert!(!action.info().available);
    }

    #[tokio::test]
    async fn mock_action_execution_failure() {
        let action = MockAction {
            should_fail_validate: false,
            should_fail_execute: true,
        };
        action.validate().await.expect("should validate");
        let result = action.execute().await;
        assert!(result.is_err());
    }
}
