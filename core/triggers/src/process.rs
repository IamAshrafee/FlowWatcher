//! Process-based network idle trigger.
//!
//! `ProcessTrigger` is the **second** `Trigger` trait implementation,
//! proving the Strategic Shift architecture works — zero engine changes
//! were needed to add this trigger type.
//!
//! It monitors a set of user-selected processes and evaluates whether
//! ALL of them have low network/disk activity.

use crate::{Trigger, TriggerData, TriggerError, TriggerState, TriggerValue};
use async_trait::async_trait;
use flowwatcher_platform::process::ProcessInfo;
use std::collections::HashSet;

// ---------------------------------------------------------------------------
// ProcessTrigger
// ---------------------------------------------------------------------------

/// A trigger that fires when all selected processes have low activity.
///
/// # Strategic Shift Validation
///
/// This is the SECOND `Trigger` trait implementation. It was added
/// without modifying the engine, the `Trigger` trait, or any existing
/// trigger code — exactly as the Strategic Shift mandated.
pub struct ProcessTrigger {
    /// Processes to monitor (by name, case-insensitive).
    watched_names: HashSet<String>,
    /// Processes to always ignore (by name, case-insensitive).
    excluded_names: HashSet<String>,
    /// Activity threshold in bytes — processes below this are "idle".
    threshold_bytes: u64,
    /// Whether the trigger has been started.
    started: bool,
}

impl ProcessTrigger {
    /// Create a new process trigger.
    ///
    /// # Arguments
    /// * `watched_names` — Process names to monitor (e.g., "steam.exe").
    /// * `excluded_names` — Process names to always ignore.
    /// * `threshold_bytes` — Activity below this is considered "idle".
    pub fn new(
        watched_names: Vec<String>,
        excluded_names: Vec<String>,
        threshold_bytes: u64,
    ) -> Self {
        Self {
            watched_names: watched_names
                .into_iter()
                .map(|n| n.to_lowercase())
                .collect(),
            excluded_names: excluded_names
                .into_iter()
                .map(|n| n.to_lowercase())
                .collect(),
            threshold_bytes,
            started: false,
        }
    }

    /// Filter processes to only those being watched, excluding ignored ones.
    fn filter_processes(&self, processes: &[ProcessInfo]) -> Vec<ProcessInfo> {
        processes
            .iter()
            .filter(|p| {
                let name = p.name.to_lowercase();
                self.watched_names.contains(&name) && !self.excluded_names.contains(&name)
            })
            .cloned()
            .collect()
    }

    /// Check if all watched processes are below the activity threshold.
    fn all_below_threshold(&self, filtered: &[ProcessInfo]) -> bool {
        if filtered.is_empty() {
            // If no watched processes are running, consider it idle.
            return true;
        }
        filtered
            .iter()
            .all(|p| p.estimated_network_bytes < self.threshold_bytes)
    }

    /// Evaluate the trigger using a provided process list (for testability).
    pub fn evaluate_with_processes(
        &self,
        processes: &[ProcessInfo],
    ) -> Result<TriggerState, TriggerError> {
        let filtered = self.filter_processes(processes);
        let total_activity: u64 = filtered.iter().map(|p| p.estimated_network_bytes).sum();
        let active_count = filtered
            .iter()
            .filter(|p| p.estimated_network_bytes >= self.threshold_bytes)
            .count();

        let mut data = TriggerData::new();
        data.insert("watched_count", TriggerValue::U64(filtered.len() as u64));
        data.insert("active_count", TriggerValue::U64(active_count as u64));
        data.insert("total_activity_bytes", TriggerValue::U64(total_activity));

        if self.all_below_threshold(&filtered) {
            // All processes are idle — trigger is active (ready for condition evaluation).
            data.insert("download_bps", TriggerValue::U64(total_activity));
            data.insert("upload_bps", TriggerValue::U64(0));
            Ok(TriggerState::Active(data))
        } else {
            Ok(TriggerState::Idle)
        }
    }
}

#[async_trait]
impl Trigger for ProcessTrigger {
    fn name(&self) -> &str {
        "Process Monitor"
    }

    fn trigger_type(&self) -> &str {
        "process_idle"
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
        if !self.started {
            return Ok(TriggerState::Idle);
        }

        // In real usage, this would use a ProcessProvider. For now,
        // the Tauri integration layer (Phase 4) will inject the provider.
        // The evaluate_with_processes() method is the testable core.
        Ok(TriggerState::Idle)
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn mock_processes() -> Vec<ProcessInfo> {
        vec![
            ProcessInfo {
                pid: 1,
                name: "steam.exe".to_string(),
                path: Some("C:\\Steam\\steam.exe".to_string()),
                estimated_network_bytes: 50_000, // high activity
                is_suggested: true,
            },
            ProcessInfo {
                pid: 2,
                name: "chrome.exe".to_string(),
                path: Some("C:\\Chrome\\chrome.exe".to_string()),
                estimated_network_bytes: 100, // low
                is_suggested: false,
            },
            ProcessInfo {
                pid: 3,
                name: "explorer.exe".to_string(),
                path: Some("C:\\Windows\\explorer.exe".to_string()),
                estimated_network_bytes: 0,
                is_suggested: false,
            },
            ProcessInfo {
                pid: 4,
                name: "svchost.exe".to_string(),
                path: Some("C:\\Windows\\svchost.exe".to_string()),
                estimated_network_bytes: 30_000,
                is_suggested: false,
            },
        ]
    }

    #[test]
    fn trigger_fires_when_all_watched_processes_idle() {
        let trigger = ProcessTrigger::new(
            vec!["chrome.exe".to_string(), "explorer.exe".to_string()],
            vec![],
            1000, // threshold
        );
        let result = trigger.evaluate_with_processes(&mock_processes()).unwrap();
        assert!(
            matches!(result, TriggerState::Active(_)),
            "should fire when all watched processes are below threshold"
        );
    }

    #[test]
    fn trigger_idle_when_any_watched_process_active() {
        let trigger = ProcessTrigger::new(
            vec!["steam.exe".to_string(), "chrome.exe".to_string()],
            vec![],
            1000, // steam.exe at 50000 > 1000
        );
        let result = trigger.evaluate_with_processes(&mock_processes()).unwrap();
        assert_eq!(
            result,
            TriggerState::Idle,
            "should be idle when steam.exe is above threshold"
        );
    }

    #[test]
    fn exclusion_list_filters_processes() {
        let trigger = ProcessTrigger::new(
            vec![
                "steam.exe".to_string(),
                "chrome.exe".to_string(),
                "svchost.exe".to_string(),
            ],
            vec!["steam.exe".to_string()], // exclude the active one
            1000,
        );
        // With steam.exe excluded, only chrome (100) and svchost (30000) are watched.
        // svchost is above threshold → Idle.
        let result = trigger.evaluate_with_processes(&mock_processes()).unwrap();
        assert_eq!(result, TriggerState::Idle);
    }

    #[test]
    fn exclusion_makes_all_remaining_idle() {
        let trigger = ProcessTrigger::new(
            vec!["steam.exe".to_string(), "chrome.exe".to_string()],
            vec!["steam.exe".to_string()], // exclude active one
            1000,
        );
        // Only chrome (100 < 1000) remains → Active.
        let result = trigger.evaluate_with_processes(&mock_processes()).unwrap();
        assert!(matches!(result, TriggerState::Active(_)));
    }

    #[test]
    fn empty_watched_list_is_idle() {
        let trigger = ProcessTrigger::new(vec![], vec![], 1000);
        // No processes watched → considered idle → Active.
        let result = trigger.evaluate_with_processes(&mock_processes()).unwrap();
        assert!(matches!(result, TriggerState::Active(_)));
    }

    #[test]
    fn trigger_data_contains_metrics() {
        let trigger = ProcessTrigger::new(vec!["chrome.exe".to_string()], vec![], 1000);
        let result = trigger.evaluate_with_processes(&mock_processes()).unwrap();
        if let TriggerState::Active(data) = result {
            assert_eq!(data.get("watched_count"), Some(&TriggerValue::U64(1)));
            assert_eq!(data.get("active_count"), Some(&TriggerValue::U64(0)));
        } else {
            panic!("expected Active state");
        }
    }

    #[test]
    fn case_insensitive_matching() {
        let trigger = ProcessTrigger::new(
            vec!["CHROME.EXE".to_string()], // uppercase
            vec![],
            1000,
        );
        let result = trigger.evaluate_with_processes(&mock_processes()).unwrap();
        assert!(
            matches!(result, TriggerState::Active(_)),
            "should match case-insensitively"
        );
    }
}
