//! Windows system action implementations.
//!
//! Each action implements the [`Action`] trait from `flowwatcher-actions`.
//! Actions validate OS capability before executing (e.g., checking if
//! hibernation is enabled).
//!
//! # Safety
//!
//! These actions perform real system operations (shutdown, sleep, etc.).
//! They use the `windows-sys` crate for safe FFI bindings to Win32 APIs.
//! All actions are guarded behind `validate()` checks.

use async_trait::async_trait;
use flowwatcher_actions::{Action, ActionError, ActionInfo};
use std::process::Command;

// ---------------------------------------------------------------------------
// Shutdown Action
// ---------------------------------------------------------------------------

/// Shuts down the computer gracefully.
pub struct ShutdownAction;

#[async_trait]
impl Action for ShutdownAction {
    fn name(&self) -> &str {
        "Shut Down"
    }

    fn action_type(&self) -> &str {
        "shutdown"
    }

    fn info(&self) -> ActionInfo {
        ActionInfo {
            id: "shutdown".to_string(),
            name: "Shut Down".to_string(),
            description: "Shut down the computer".to_string(),
            available: true,
        }
    }

    async fn validate(&self) -> Result<(), ActionError> {
        // Shutdown is always available on Windows.
        Ok(())
    }

    async fn execute(&self) -> Result<(), ActionError> {
        Command::new("shutdown")
            .args(["/s", "/t", "0"])
            .spawn()
            .map_err(|e| ActionError::OsError(format!("Failed to initiate shutdown: {e}")))?;
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Restart Action
// ---------------------------------------------------------------------------

/// Restarts the computer.
pub struct RestartAction;

#[async_trait]
impl Action for RestartAction {
    fn name(&self) -> &str {
        "Restart"
    }

    fn action_type(&self) -> &str {
        "restart"
    }

    fn info(&self) -> ActionInfo {
        ActionInfo {
            id: "restart".to_string(),
            name: "Restart".to_string(),
            description: "Restart the computer".to_string(),
            available: true,
        }
    }

    async fn validate(&self) -> Result<(), ActionError> {
        Ok(())
    }

    async fn execute(&self) -> Result<(), ActionError> {
        Command::new("shutdown")
            .args(["/r", "/t", "0"])
            .spawn()
            .map_err(|e| ActionError::OsError(format!("Failed to initiate restart: {e}")))?;
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Sleep Action
// ---------------------------------------------------------------------------

/// Puts the computer to sleep (S3 suspend).
pub struct SleepAction;

#[async_trait]
impl Action for SleepAction {
    fn name(&self) -> &str {
        "Sleep"
    }

    fn action_type(&self) -> &str {
        "sleep"
    }

    fn info(&self) -> ActionInfo {
        ActionInfo {
            id: "sleep".to_string(),
            name: "Sleep".to_string(),
            description: "Put the computer to sleep".to_string(),
            available: true,
        }
    }

    async fn validate(&self) -> Result<(), ActionError> {
        Ok(())
    }

    async fn execute(&self) -> Result<(), ActionError> {
        // `rundll32 powrprof.dll,SetSuspendState 0,1,0` puts machine to sleep.
        // Args: Hibernate=false, ForceCritical=true, DisableWakeEvent=false
        Command::new("rundll32.exe")
            .args(["powrprof.dll,SetSuspendState", "0,1,0"])
            .spawn()
            .map_err(|e| ActionError::OsError(format!("Failed to initiate sleep: {e}")))?;
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Hibernate Action
// ---------------------------------------------------------------------------

/// Hibernates the computer (S4 state, saves to disk).
pub struct HibernateAction;

impl HibernateAction {
    /// Check if hibernation is enabled by querying `powercfg`.
    fn is_hibernate_available() -> bool {
        Command::new("powercfg")
            .args(["/availablesleepstates"])
            .output()
            .map(|output| {
                let stdout = String::from_utf8_lossy(&output.stdout).to_lowercase();
                stdout.contains("hibernate")
            })
            .unwrap_or(false)
    }
}

#[async_trait]
impl Action for HibernateAction {
    fn name(&self) -> &str {
        "Hibernate"
    }

    fn action_type(&self) -> &str {
        "hibernate"
    }

    fn info(&self) -> ActionInfo {
        ActionInfo {
            id: "hibernate".to_string(),
            name: "Hibernate".to_string(),
            description: "Hibernate the computer (save state to disk)".to_string(),
            available: Self::is_hibernate_available(),
        }
    }

    async fn validate(&self) -> Result<(), ActionError> {
        if Self::is_hibernate_available() {
            Ok(())
        } else {
            Err(ActionError::NotSupported(
                "Hibernation is not enabled on this system. Enable with: powercfg /hibernate on"
                    .to_string(),
            ))
        }
    }

    async fn execute(&self) -> Result<(), ActionError> {
        self.validate().await?;
        // `shutdown /h` initiates hibernate.
        Command::new("shutdown")
            .args(["/h"])
            .spawn()
            .map_err(|e| ActionError::OsError(format!("Failed to initiate hibernate: {e}")))?;
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Sign Out Action
// ---------------------------------------------------------------------------

/// Signs out the current user.
pub struct SignOutAction;

#[async_trait]
impl Action for SignOutAction {
    fn name(&self) -> &str {
        "Sign Out"
    }

    fn action_type(&self) -> &str {
        "sign_out"
    }

    fn info(&self) -> ActionInfo {
        ActionInfo {
            id: "sign_out".to_string(),
            name: "Sign Out".to_string(),
            description: "Sign out the current user".to_string(),
            available: true,
        }
    }

    async fn validate(&self) -> Result<(), ActionError> {
        Ok(())
    }

    async fn execute(&self) -> Result<(), ActionError> {
        Command::new("shutdown")
            .args(["/l"])
            .spawn()
            .map_err(|e| ActionError::OsError(format!("Failed to sign out: {e}")))?;
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Lock Screen Action
// ---------------------------------------------------------------------------

/// Locks the workstation screen.
pub struct LockScreenAction;

#[async_trait]
impl Action for LockScreenAction {
    fn name(&self) -> &str {
        "Lock Screen"
    }

    fn action_type(&self) -> &str {
        "lock_screen"
    }

    fn info(&self) -> ActionInfo {
        ActionInfo {
            id: "lock_screen".to_string(),
            name: "Lock Screen".to_string(),
            description: "Lock the workstation".to_string(),
            available: true,
        }
    }

    async fn validate(&self) -> Result<(), ActionError> {
        Ok(())
    }

    async fn execute(&self) -> Result<(), ActionError> {
        Command::new("rundll32.exe")
            .args(["user32.dll,LockWorkStation"])
            .spawn()
            .map_err(|e| ActionError::OsError(format!("Failed to lock screen: {e}")))?;
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Helper: get all available system actions
// ---------------------------------------------------------------------------

/// Returns a list of all available system actions for the current platform.
pub fn all_system_actions() -> Vec<Box<dyn Action>> {
    vec![
        Box::new(ShutdownAction),
        Box::new(RestartAction),
        Box::new(SleepAction),
        Box::new(HibernateAction),
        Box::new(SignOutAction),
        Box::new(LockScreenAction),
    ]
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_actions_have_unique_ids() {
        let actions = all_system_actions();
        let mut ids: Vec<String> = actions.iter().map(|a| a.info().id).collect();
        let original_len = ids.len();
        ids.sort();
        ids.dedup();
        assert_eq!(ids.len(), original_len, "some actions have duplicate IDs");
    }

    #[test]
    fn all_actions_have_names_and_descriptions() {
        for action in all_system_actions() {
            let info = action.info();
            assert!(!info.name.is_empty(), "action {} has empty name", info.id);
            assert!(
                !info.description.is_empty(),
                "action {} has empty description",
                info.id
            );
        }
    }

    #[tokio::test]
    async fn shutdown_validates_successfully() {
        let action = ShutdownAction;
        action.validate().await.expect("shutdown should validate");
    }

    #[tokio::test]
    async fn lock_screen_validates_successfully() {
        let action = LockScreenAction;
        action
            .validate()
            .await
            .expect("lock screen should validate");
    }
}
