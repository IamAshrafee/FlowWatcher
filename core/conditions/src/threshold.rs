//! Threshold-based condition for speed monitoring.
//!
//! Evaluates whether the monitored speed has stayed below a threshold
//! for a configurable duration. Resets when speed goes back above the
//! threshold.

use crate::{Condition, ConditionError, ConditionResult};
use flowwatcher_triggers::{TriggerData, TriggerValue};
use serde::{Deserialize, Serialize};
use std::time::Instant;

// ---------------------------------------------------------------------------
// Monitor mode
// ---------------------------------------------------------------------------

/// Which direction(s) of network traffic to monitor.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MonitorMode {
    /// Only monitor download speed.
    DownloadOnly,
    /// Only monitor upload speed.
    UploadOnly,
    /// Monitor both — the condition is met only when BOTH are below threshold.
    Both,
}

// ---------------------------------------------------------------------------
// ThresholdCondition
// ---------------------------------------------------------------------------

/// A condition that triggers when speed stays below a threshold for a duration.
///
/// # How it works
///
/// 1. Each `evaluate()` call receives `TriggerData` with `download_bps` and `upload_bps`.
/// 2. The relevant speed(s) are compared against `threshold_bytes_per_sec`.
/// 3. If below threshold, a timer starts (or continues).
/// 4. If the timer exceeds `required_duration_secs`, the result is `Met`.
/// 5. If speed goes back above threshold, the timer resets.
pub struct ThresholdCondition {
    /// Speed threshold in bytes per second.
    pub threshold_bytes_per_sec: u64,
    /// How long speed must stay below threshold before triggering.
    pub required_duration_secs: u64,
    /// Which traffic direction(s) to monitor.
    pub monitor_mode: MonitorMode,
    /// When the speed first dropped below threshold (None if currently above).
    below_since: Option<Instant>,
}

impl ThresholdCondition {
    /// Create a new threshold condition.
    ///
    /// # Arguments
    /// * `threshold_bytes_per_sec` — Speed below which the condition starts tracking.
    /// * `required_duration_secs` — Seconds the speed must stay below threshold.
    /// * `monitor_mode` — Which direction(s) to check.
    pub fn new(
        threshold_bytes_per_sec: u64,
        required_duration_secs: u64,
        monitor_mode: MonitorMode,
    ) -> Self {
        Self {
            threshold_bytes_per_sec,
            required_duration_secs,
            monitor_mode,
            below_since: None,
        }
    }

    /// Check if the relevant speed(s) are below the threshold.
    fn is_below_threshold(&self, data: &TriggerData) -> Result<bool, ConditionError> {
        let download = self.extract_u64(data, "download_bps")?;
        let upload = self.extract_u64(data, "upload_bps")?;

        let below = match self.monitor_mode {
            MonitorMode::DownloadOnly => download < self.threshold_bytes_per_sec,
            MonitorMode::UploadOnly => upload < self.threshold_bytes_per_sec,
            MonitorMode::Both => {
                download < self.threshold_bytes_per_sec
                    && upload < self.threshold_bytes_per_sec
            }
        };

        Ok(below)
    }

    /// Extract a u64 value from trigger data.
    fn extract_u64(&self, data: &TriggerData, key: &str) -> Result<u64, ConditionError> {
        match data.get(key) {
            Some(TriggerValue::U64(v)) => Ok(*v),
            Some(_) => Err(ConditionError::MissingData(format!(
                "{key} is not a u64 value"
            ))),
            None => Err(ConditionError::MissingData(key.to_string())),
        }
    }
}

impl Condition for ThresholdCondition {
    fn evaluate(&mut self, data: &TriggerData) -> Result<ConditionResult, ConditionError> {
        let below = self.is_below_threshold(data)?;

        if below {
            let now = Instant::now();
            let since = *self.below_since.get_or_insert(now);
            let elapsed = now.duration_since(since).as_secs();

            if elapsed >= self.required_duration_secs {
                Ok(ConditionResult::Met)
            } else {
                Ok(ConditionResult::InProgress {
                    elapsed_secs: elapsed,
                })
            }
        } else {
            // Speed went back above threshold — reset timer.
            self.below_since = None;
            Ok(ConditionResult::Waiting)
        }
    }

    fn reset(&mut self) {
        self.below_since = None;
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper: create TriggerData with download and upload speeds.
    fn speed_data(download_bps: u64, upload_bps: u64) -> TriggerData {
        let mut data = TriggerData::new();
        data.insert("download_bps", TriggerValue::U64(download_bps));
        data.insert("upload_bps", TriggerValue::U64(upload_bps));
        data
    }

    #[test]
    fn threshold_not_triggered_when_speed_above() {
        let mut cond = ThresholdCondition::new(204_800, 120, MonitorMode::DownloadOnly);
        let data = speed_data(500_000, 0); // 500 KB/s — above threshold
        let result = cond.evaluate(&data).unwrap();
        assert_eq!(result, ConditionResult::Waiting);
    }

    #[test]
    fn threshold_in_progress_when_speed_below() {
        let mut cond = ThresholdCondition::new(204_800, 120, MonitorMode::DownloadOnly);
        let data = speed_data(100_000, 0); // 100 KB/s — below threshold
        let result = cond.evaluate(&data).unwrap();
        // Should be InProgress with 0 elapsed (just started)
        assert!(matches!(result, ConditionResult::InProgress { elapsed_secs: 0 }));
    }

    #[test]
    fn threshold_resets_on_spike() {
        let mut cond = ThresholdCondition::new(204_800, 120, MonitorMode::DownloadOnly);

        // Drop below
        let low = speed_data(100_000, 0);
        let _ = cond.evaluate(&low).unwrap();

        // Spike above
        let high = speed_data(500_000, 0);
        let result = cond.evaluate(&high).unwrap();
        assert_eq!(result, ConditionResult::Waiting);

        // Drop below again — timer should have reset
        let result = cond.evaluate(&low).unwrap();
        assert!(matches!(result, ConditionResult::InProgress { elapsed_secs: 0 }));
    }

    #[test]
    fn download_only_ignores_upload() {
        let mut cond = ThresholdCondition::new(204_800, 120, MonitorMode::DownloadOnly);
        // Download below, upload above — should still track
        let data = speed_data(100_000, 1_000_000);
        let result = cond.evaluate(&data).unwrap();
        assert!(matches!(result, ConditionResult::InProgress { .. }));
    }

    #[test]
    fn upload_only_ignores_download() {
        let mut cond = ThresholdCondition::new(204_800, 120, MonitorMode::UploadOnly);
        // Upload below, download above — should still track
        let data = speed_data(1_000_000, 100_000);
        let result = cond.evaluate(&data).unwrap();
        assert!(matches!(result, ConditionResult::InProgress { .. }));
    }

    #[test]
    fn both_mode_requires_both_below() {
        let mut cond = ThresholdCondition::new(204_800, 120, MonitorMode::Both);

        // Only download below — should NOT track
        let data = speed_data(100_000, 500_000);
        let result = cond.evaluate(&data).unwrap();
        assert_eq!(result, ConditionResult::Waiting);

        // Both below — should track
        let data = speed_data(100_000, 100_000);
        let result = cond.evaluate(&data).unwrap();
        assert!(matches!(result, ConditionResult::InProgress { .. }));
    }

    #[test]
    fn missing_data_returns_error() {
        let mut cond = ThresholdCondition::new(204_800, 120, MonitorMode::DownloadOnly);
        let empty = TriggerData::new();
        let result = cond.evaluate(&empty);
        assert!(result.is_err());
    }
}
